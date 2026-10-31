/**
 * Meten en maten naar Squla groep 3 Rekenen (31 oktober 2026, opdracht
 * eigenaar): per Squla-oefening per level één les, met eigen zinnen, eigen
 * verhaaltjes en eigen tekeningen (alleen het leerdoel en de opbouw zijn van
 * Squla):
 *
 *   Rekentaal met pizza  level 1, 2, 3   squla-meten-pizza-1/2/3
 *   Hoeveelheden         level 1, 2      squla-meten-hoeveelheden-1/2
 *   Oppervlakte          level 1, 2      squla-meten-oppervlakte-1/2
 *
 * Alles in de vlakke, vriendelijke stijl (vlakken/squla-meten-vlak.tsx), in
 * Phaser. De les squla-rekentaal (voorbeeldles) blijft daarnaast gewoon staan.
 *
 * Elke les volgt de opbouw van het Squla-level: dezelfde soorten vragen in
 * dezelfde volgorde, aangevuld met dezelfde soorten vragen tot 12, en aan het
 * eind komen er drie vragen terug (zoals Squla de fout gemaakte vragen aan
 * het eind herhaalt; zijn er minder dan drie fout, dan vult de les aan met
 * vaste vragen). Zo heeft elke les 15 opgaven.
 *
 * De hulp is overal die van squla-hulp.ts (zoals Synthesis): na één fout
 * "Wil je hulp, of nog een keer proberen?", dan samen uitzoeken (Bliepo laat
 * het in beeld zien: naast elkaar zetten, de weegschaal laten zakken, samen
 * tellen), en na twee keer fout even pauze. Geen "Weet ik niet".
 *
 * Groep 3 leest nog niet: Bliepo zegt elke vraag en noemt de keuzes als het
 * woorden of zinnen zijn; woordkaartjes lezen hun woord voor bij aanwijzen.
 * Getallen typt het kind in een echt invulvak (HARDE REGEL 5).
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag, zetTestAntwoord, type SqulaVraag } from "./squla-hulp";
import { SqulaMetenVlak, KaartPizza, KaartHoeveelheden, KaartOppervlakte, type MDing, type MetenProps } from "../vlakken/squla-meten-vlak";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* ---------- gedeeld ---------- */

let teller = 0;
const volgend = () => ++teller;
const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Een andere volgorde van de keuzes (bij een vraag die terugkomt). */
const schuif = <T,>(lijst: T[], keer: boolean) => (keer ? [...lijst.slice(1), lijst[0]] : lijst);
/** De getallen 1 tot en met n op de eerste n dingen, of vanaf ding nummer `van` (Bliepo telt mee). */
const telTot = (n: number, van = 0) => Array.from({ length: n }, (_, i) => ({ i: i + van, t: String(i + 1) }));

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

const LEEG: Omit<MetenProps, "nr"> = {
  groot: null,
  tel: [],
  balans: null,
  vergelijk: null,
  kaarten: [],
  kaartenActief: false,
  uit: [],
  goed: [],
  fout: [],
  licht: [],
  orden: null,
};

const zet = (l: Lesgids, p: Partial<MetenProps>) => l.pasVlakAan<MetenProps>(p);
let schudNr = 0;
let golfNr = 0;
let handjeNr = 0;
let zakNr = 0;

/** Een kaartje: `naam` = hoe Bliepo het noemt na een antwoord. `zeg` leeg = niet voorlezen bij aanwijzen. */
type Kaart = MDing & { naam: string };
const K = (id: string, tekening: string, naam: string): Kaart => ({ id, tekening, naam, zeg: "" });
/** Een kaartje met een woord of zin (wordt voorgelezen bij aanwijzen). */
const Z = (id: string, label: string, tekening?: string, naam?: string): Kaart => ({ id, label, tekening, naam: naam ?? label, zeg: label });

async function welkom(l: Lesgids, groot: string, woorden: string[], uitleg: () => Promise<void>) {
  l.vlak<MetenProps>(SqulaMetenVlak, { ...LEEG, nr: volgend(), groot });
  speelLesgeluid("verschijn");
  await l.wacht(500);
  await squlaBegin(l, { welkom: woorden, uitleg });
  zet(l, { ...LEEG });
}

/* ---------- de soorten vragen ---------- */

type PlaatjesVraag = {
  beeld: Partial<MetenProps>;
  kaarten: Kaart[];
  goed: string;
  vraag: string[];
  goedZin: string[];
  samen: (l: Lesgids) => Promise<void>;
  hulpBeeld?: Partial<MetenProps>;
  tip: string[];
};

/** Een vraag met plaatjes (kaartjes in het vlak): tik op het goede. */
function plaatjesVraag(l: Lesgids, o: PlaatjesVraag, terug: boolean): SqulaVraag<string> {
  const nr = volgend();
  const kaarten = schuif(o.kaarten, terug);
  const uit: string[] = [];
  let naSamen = false;
  const naam = (id: string) => Hoofd(kaarten.find((k) => k.id === id)?.naam ?? id);
  return {
    toon: () => zet(l, { ...LEEG, nr, ...o.beeld, ...(naSamen ? (o.hulpBeeld ?? {}) : {}), kaarten, uit: [...uit] }),
    vraag: o.vraag,
    antwoord: async () => {
      zet(l, { kaartenActief: true, fout: [], licht: [] });
      const g = await l.wachtOpVlak<{ soort: string; id: string }>("kaart");
      zet(l, { kaartenActief: false });
      return g.id;
    },
    isGoed: (x) => x === o.goed,
    noem: naam,
    goed: async () => {
      zet(l, { goed: [o.goed], licht: [], golf: { id: o.goed, n: ++golfNr } });
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    fout: (x) => {
      if (!uit.includes(x)) uit.push(x);
      zet(l, { fout: [x], schud: { id: x, n: ++schudNr } });
    },
    samen: async () => {
      zet(l, { fout: [], licht: [] });
      await o.samen(l);
      zet(l, { licht: [], vergelijk: null });
      naSamen = true;
    },
    tip: o.tip,
    testAntwoord: o.goed,
  };
}

/** Een vraag met woorden of getallen als antwoord (knoppen bij Bliepo). */
function knopVraag(
  l: Lesgids,
  o: { beeld: Partial<MetenProps>; opties: string[]; goed: string; vraag: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; hulpBeeld?: Partial<MetenProps>; tip: string[] },
  terug: boolean,
): SqulaVraag<string> {
  const nr = volgend();
  let naSamen = false;
  const opties = schuif(o.opties, terug);
  return {
    toon: () => zet(l, { ...LEEG, nr, ...o.beeld, ...(naSamen ? (o.hulpBeeld ?? {}) : {}) }),
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
      zet(l, { licht: [], vergelijk: null });
      naSamen = true;
    },
    tip: o.tip,
    testAntwoord: o.goed,
  };
}

/** Een getal typen in het invulvak (HARDE REGEL 5: een echt invoerveld, alleen cijfers). */
function getalVraag(
  l: Lesgids,
  o: { beeld: Partial<MetenProps>; goed: number; vraag: string[]; goedZin: string[]; naGoed?: Partial<MetenProps>; samen: (l: Lesgids) => Promise<void>; hulpBeeld?: Partial<MetenProps>; tip: string[] },
): SqulaVraag<number> {
  const nr = volgend();
  let naSamen = false;
  return {
    toon: () => zet(l, { ...LEEG, nr, ...o.beeld, ...(naSamen ? (o.hulpBeeld ?? {}) : {}) }),
    vraag: o.vraag,
    antwoord: async () => {
      for (;;) {
        const x = await l.getal();
        if (x !== null) return x;
        await l.zeg("Geen probleem.", ...o.tip);
      }
    },
    isGoed: (x) => x === o.goed,
    noem: (x) => `{${x}:wit}`,
    goed: async () => {
      if (o.naGoed) zet(l, o.naGoed);
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    samen: async () => {
      await o.samen(l);
      naSamen = true;
    },
    tip: o.tip,
    testAntwoord: o.goed,
  };
}

/** Kaartjes op volgorde zetten (slepen of tikken); `vast` = vakken die al gevuld zijn. */
function ordenVraag(
  l: Lesgids,
  o: {
    beeld: Partial<MetenProps>;
    juist: string[];
    vast: number[];
    vastDingen?: MDing[];
    losse: Kaart[];
    vraag: string[];
    goedZin: string[];
    samen: (l: Lesgids) => Promise<void>;
    tip: string[];
    handje?: boolean;
    klein?: boolean;
    onderGroot?: boolean;
  },
  terug: boolean,
): SqulaVraag<string[]> {
  const nr = volgend();
  const losse = schuif(o.losse, terug);
  let vakken: (string | null)[] = o.juist.map((id, i) => (o.vast.includes(i) ? id : null));
  let eerste = !!o.handje && !terug;
  const naamVan = (id: string) => o.losse.find((k) => k.id === id)?.naam ?? id;
  const orden = (actief: boolean, uitslag?: (boolean | null)[]) => ({ vakken: [...vakken], vast: o.vast, vastDingen: o.vastDingen, losse, uitslag, actief, klein: o.klein, onderGroot: o.onderGroot });
  return {
    toon: () => {
      vakken = vakken.map((v, i) => (v === o.juist[i] ? v : null));
      zet(l, { ...LEEG, nr, ...o.beeld, orden: orden(false) });
    },
    vraag: eerste ? [...o.vraag, "Sleep een kaartje naar een leeg vak.", "Tikken mag ook."] : o.vraag,
    antwoord: async () => {
      if (eerste) {
        zet(l, { handje: ++handjeNr });
        eerste = false;
      }
      while (vakken.includes(null)) {
        zetTestAntwoord(o.juist[vakken.indexOf(null)]);
        zet(l, { orden: orden(true), licht: [] });
        const g = await l.wachtOpVlak<{ soort: string; id: string; vak: number | null }>("leg");
        if (vakken.includes(g.id)) continue;
        const doel = g.vak ?? vakken.indexOf(null);
        if (vakken[doel] !== null) continue;
        vakken[doel] = g.id;
        speelLesgeluid("schuif");
      }
      zet(l, { orden: orden(false) });
      return vakken as string[];
    },
    isGoed: (x) => x.every((id, i) => id === o.juist[i]),
    noem: (x) => Hoofd(x.filter((_, i) => !o.vast.includes(i)).map(naamVan).join(", ")),
    goed: async () => {
      zet(l, { orden: orden(false, o.juist.map((_, i) => (o.vast.includes(i) ? null : true))) });
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    fout: (x) => zet(l, { orden: orden(false, x.map((id, i) => (o.vast.includes(i) ? null : id === o.juist[i]))) }),
    samen: async () => {
      vakken = vakken.map((v, i) => (v === o.juist[i] ? v : null));
      zet(l, { orden: orden(false) });
      await o.samen(l);
      zet(l, { licht: [], tel: [] });
    },
    tip: o.tip,
    testAntwoord: o.juist.find((_, i) => !o.vast.includes(i)) ?? null,
  };
}

/** Twee kaartjes kiezen die kloppen (Squla: "Kies 2 antwoorden"). Bliepo leest elk kaartje voor. */
function tweeVraag(
  l: Lesgids,
  o: { beeld: Partial<MetenProps>; kaarten: Kaart[]; goed: [string, string]; vraag: string[]; goedZin: string[]; samen: (l: Lesgids) => Promise<void>; hulpBeeld?: Partial<MetenProps>; tip: string[] },
  terug: boolean,
): SqulaVraag<string[]> {
  const nr = volgend();
  const kaarten = schuif(o.kaarten, terug);
  let naSamen = false;
  const naam = (id: string) => kaarten.find((k) => k.id === id)?.naam ?? id;
  return {
    toon: () => zet(l, { ...LEEG, nr, ...o.beeld, ...(naSamen ? (o.hulpBeeld ?? {}) : {}), kaarten }),
    vraag: o.vraag,
    antwoord: async () => {
      zet(l, { kaartenActief: false, fout: [], goed: [] });
      for (const k of kaarten) {
        zet(l, { licht: [k.id] });
        await l.zeg(k.zeg ?? k.naam);
      }
      const gekozen: string[] = [];
      while (gekozen.length < 2) {
        zetTestAntwoord(o.goed.find((g) => !gekozen.includes(g)) ?? null);
        zet(l, { kaartenActief: true, licht: [...gekozen] });
        const g = await l.wachtOpVlak<{ soort: string; id: string }>("kaart");
        const i = gekozen.indexOf(g.id);
        if (i >= 0) gekozen.splice(i, 1);
        else gekozen.push(g.id);
        speelLesgeluid("markeer");
      }
      zet(l, { kaartenActief: false, licht: [...gekozen] });
      return gekozen;
    },
    isGoed: (x) => x.length === 2 && o.goed.every((g) => x.includes(g)),
    noem: (x) => Hoofd(x.map(naam).join(" en ")),
    goed: async () => {
      zet(l, { goed: [...o.goed], licht: [], golf: { id: o.goed[0], n: ++golfNr } });
      await l.zeg("Goed zo.", ...o.goedZin);
      await l.wacht(300);
    },
    fout: (x) => zet(l, { licht: [], goed: x.filter((g) => o.goed.includes(g)), fout: x.filter((g) => !o.goed.includes(g)) }),
    samen: async () => {
      zet(l, { fout: [], goed: [], licht: [] });
      await o.samen(l);
      zet(l, { licht: [] });
      naSamen = true;
    },
    tip: o.tip,
    testAntwoord: o.goed[0],
  };
}

/** Bliepo wijst de kaartjes één voor één aan en zegt er iets bij. */
async function wijsLangs(l: Lesgids, stappen: [string, ...string[]][]) {
  for (const [id, ...zinnen] of stappen) {
    zet(l, { licht: [id] });
    speelLesgeluid("markeer");
    await l.zeg(...zinnen);
  }
  zet(l, { licht: [] });
}

/* =====================================================================
   REKENTAAL MET PIZZA
   ===================================================================== */

const PZ = (m: number, top?: string) => `pizza|m=${m}${top ? `|top=${top}` : ""}`;
const DOOS = (p: number) => `pizzadoos|p=${p}`;
const IJS = (m: number, bol = 2) => `ijsje|m=${m}|bol=${bol}|kers=1`;
const PUNTEN = (n: number) => `punten|n=${n}`;

/* --- level 1: groot, groter, grootst, kleinst, op volgorde (Sem) --- */

/** Kies uit twee plaatjes op grootte. In de uitleg zet Bliepo ze naast elkaar op één lijn. */
function grootteVraag(o: { kaarten: Kaart[]; goed: string; vraag: string[]; goedZin: string[]; naast?: string[]; uitleg: string[]; tip: string[] }): Opgave {
  return (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: o.kaarten,
        goed: o.goed,
        vraag: o.vraag,
        goedZin: o.goedZin,
        samen: async (l) => {
          zet(l, { vergelijk: o.naast ?? o.kaarten.map((k) => k.tekening!) });
          speelLesgeluid("schuif");
          await l.zeg(...o.uitleg);
        },
        tip: o.tip,
      },
      t,
    );
}

const NAAST_PIZZA = ["Ik zet de pizza's naast elkaar, op één lijn.", "Kijk naar de gele streepjes bovenaan."];
const NAAST_IJS = ["Ik zet de ijsjes naast elkaar, op één lijn.", "Kijk naar de gele streepjes bovenaan."];

/** Op volgorde van klein naar groot (drie dingen). */
function ordenGrootte(o: { dingen: [string, string, string]; namen: [string, string, string]; vraag: string[]; wat: string; handje?: boolean }): Opgave {
  return (l, t) =>
    ordenVraag(
      l,
      {
        beeld: {},
        juist: ["klein", "midden", "groot"],
        vast: [],
        losse: [K("groot", o.dingen[2], o.namen[2]), K("klein", o.dingen[0], o.namen[0]), K("midden", o.dingen[1], o.namen[1])],
        vraag: o.vraag,
        goedZin: [`Eerst de kleinste ${o.wat}, dan de middelste, en dan de grootste.`],
        samen: async (l) => {
          zet(l, { vergelijk: [o.dingen[2], o.dingen[0], o.dingen[1]] });
          speelLesgeluid("schuif");
          await l.zeg("Ik zet ze naast elkaar, op één lijn.", "Kijk naar de gele streepjes bovenaan.", `Welke ${o.wat} komt het minst hoog?`, "Die is het kleinst. Die komt vooraan.", "De grootste komt achteraan.");
        },
        tip: ["Zoek eerst de kleinste. Die komt vooraan.", "Van klein naar groot."],
        handje: o.handje,
      },
      t,
    );
}

const pizza1Opgaven: Opgave[] = [
  grootteVraag({
    kaarten: [K("klein", PZ(0.55), "de kleine pizza"), K("groot", PZ(1), "de grote pizza")],
    goed: "groot",
    vraag: ["Sem wil de grootste pizza.", "Welke pizza is het grootst?", "Tik op de pizza."],
    goedZin: ["Deze pizza is het grootst.", "Smakelijk eten, Sem!"],
    uitleg: [...NAAST_PIZZA, "Welke pizza komt het hoogst, en is het breedst?"],
    tip: ["Kijk welke pizza het breedst is.", "Welke pizza is het grootst?"],
  }),
  grootteVraag({
    kaarten: [K("deze", PZ(0.72), "deze pizza"), K("groter", PZ(0.95), "de grotere pizza")],
    goed: "groter",
    vraag: ["Deze pizza is nog te klein voor Sem.", "Welke pizza is groter?"],
    goedZin: ["Die pizza is groter.", "Daar kan Sem van smullen."],
    uitleg: [...NAAST_PIZZA, "Welke pizza steekt boven de andere uit?"],
    tip: ["Kijk welke pizza breder is.", "Welke pizza is groter?"],
  }),
  grootteVraag({
    kaarten: [K("klein", DOOS(0.55), "de kleine pizza"), K("groot", DOOS(1), "de grote pizza")],
    goed: "groot",
    naast: [PZ(0.36), PZ(0.66)],
    vraag: ["De pizza's zitten in een doos.", "De dozen zijn even groot.", "Welke pizza is nu het grootst?"],
    goedZin: ["Deze pizza vult bijna de hele doos.", "Die is het grootst."],
    uitleg: ["Ik haal de pizza's uit de dozen.", "Nu staan ze naast elkaar, op één lijn.", "Welke pizza komt het hoogst?"],
    tip: ["Kijk naar de pizza's, niet naar de dozen.", "Welke pizza is het grootst?"],
  }),
  ordenGrootte({
    dingen: [PZ(0.5), PZ(0.75), PZ(1)],
    namen: ["de kleine pizza", "de middelste pizza", "de grote pizza"],
    vraag: ["Zet de pizza's op volgorde.", "Van klein naar groot."],
    wat: "pizza",
    handje: true,
  }),
  grootteVraag({
    kaarten: [K("groot", IJS(1), "het grote ijsje"), K("klein", IJS(0.62), "het kleine ijsje")],
    goed: "klein",
    vraag: ["Sem heeft al veel gegeten.", "Hij wil nog een klein ijsje.", "Welk ijsje is het kleinst?"],
    goedZin: ["Dit ijsje is het kleinst.", "Dat past nog net in Sem zijn buik."],
    uitleg: [...NAAST_IJS, "Welk ijsje komt het minst hoog?"],
    tip: ["Zoek het ijsje dat het minst hoog is.", "Welk ijsje is het kleinst?"],
  }),
  grootteVraag({
    kaarten: [K("groot", PZ(0.92, "salami"), "de grote pizza"), K("klein", PZ(0.6, "salami"), "de kleine pizza")],
    goed: "groot",
    vraag: ["Kim komt ook eten.", "Kim wil de grootste pizza met salami.", "Welke pizza is het grootst?"],
    goedZin: ["Deze pizza is het grootst."],
    uitleg: [...NAAST_PIZZA, "Welke pizza komt het hoogst, en is het breedst?"],
    tip: ["Kijk welke pizza het breedst is.", "Welke pizza is het grootst?"],
  }),
  grootteVraag({
    kaarten: [K("deze", IJS(0.7), "dit ijsje"), K("groter", IJS(0.95), "het grotere ijsje")],
    goed: "groter",
    vraag: ["Kim vindt dit ijsje te klein.", "Welk ijsje is groter?"],
    goedZin: ["Dat ijsje is groter."],
    uitleg: [...NAAST_IJS, "Welk ijsje steekt boven het andere uit?"],
    tip: ["Kijk welk ijsje hoger is.", "Welk ijsje is groter?"],
  }),
  grootteVraag({
    kaarten: [K("groot", DOOS(0.88), "de grote pizza"), K("klein", DOOS(0.6), "de kleine pizza")],
    goed: "groot",
    naast: [PZ(0.58), PZ(0.4)],
    vraag: ["Weer twee dozen.", "Welke pizza is het grootst?"],
    goedZin: ["Deze pizza is het grootst."],
    uitleg: ["Ik haal de pizza's uit de dozen.", "Nu staan ze naast elkaar, op één lijn.", "Welke pizza komt het hoogst?"],
    tip: ["Kijk naar de pizza's, niet naar de dozen.", "Welke pizza is het grootst?"],
  }),
  ordenGrootte({
    dingen: [IJS(0.55), IJS(0.75), IJS(0.95)],
    namen: ["het kleine ijsje", "het middelste ijsje", "het grote ijsje"],
    vraag: ["Zet de ijsjes op volgorde.", "Van klein naar groot."],
    wat: "ijsje",
  }),
  grootteVraag({
    kaarten: [K("klein", PZ(0.5, "olijf"), "de kleine pizza"), K("groot", PZ(0.85, "olijf"), "de grote pizza")],
    goed: "klein",
    vraag: ["Sem bakt een pizza voor zijn kat.", "Nee hoor, grapje! Voor zijn kleine zusje.", "Welke pizza is het kleinst?"],
    goedZin: ["Deze pizza is het kleinst."],
    uitleg: [...NAAST_PIZZA, "Welke pizza komt het minst hoog?"],
    tip: ["Zoek de pizza die het smalst is.", "Welke pizza is het kleinst?"],
  }),
  ordenGrootte({
    dingen: [DOOS(0.45), DOOS(0.72), DOOS(1)],
    namen: ["de kleine pizza", "de middelste pizza", "de grote pizza"],
    vraag: ["Kijk naar de pizza's in de dozen.", "Zet ze op volgorde.", "Van klein naar groot."],
    wat: "pizza",
  }),
  grootteVraag({
    kaarten: [K("deze", PZ(0.62, "olijf"), "deze pizza"), K("groter", PZ(0.82, "olijf"), "de grotere pizza")],
    goed: "groter",
    vraag: ["Kim heeft nog trek.", "Welke pizza is groter?"],
    goedZin: ["Die pizza is groter."],
    uitleg: [...NAAST_PIZZA, "Welke pizza steekt boven de andere uit?"],
    tip: ["Kijk welke pizza breder is.", "Welke pizza is groter?"],
  }),
];

const pizza1: Lesdraaiboek = {
  id: "squla-meten-pizza-1",
  titel: "Pizza's vergelijken",
  synthesis: "Squla groep 3 · Meten en maten · Rekentaal met pizza · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartPizza,
  async speel(l) {
    await welkom(l, "verhaal|s=pizza1", ["Hoi!", "Dit is Sem.", "Sem gaat pizza eten.", "We zoeken groot, groter en het kleinst."], async () => {
      zet(l, { groot: null, kaarten: [K("a", PZ(0.55), "de kleine pizza"), K("b", PZ(0.95), "de grote pizza")] });
      await wijsLangs(l, [
        ["b", "Deze pizza is groot."],
        ["a", "Deze pizza is klein."],
      ]);
      zet(l, { vergelijk: [PZ(0.55), PZ(0.95)] });
      await l.zeg("Zet je ze naast elkaar, dan zie je het goed.", "De grote pizza komt hoger en is breder.");
      zet(l, { vergelijk: null, kaarten: [] });
    });
    const fouten = await speelAlles(l, pizza1Opgaven, [0, 1, 3]);
    await squlaEind(l, fouten, "Je weet wat groot, groter en het grootst is.");
  },
};

/* --- level 2: tellen tot 5, meer, één meer, één minder (Mila en Joep) --- */

/** Hoeveel stukken pizza zie je? Kiezen uit twee getallen. */
function hoeveelStukken(n: number, opties: string[]): Opgave {
  const vraag = ["Hoeveel stukken pizza zie je?"];
  return (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: PUNTEN(n) },
        opties,
        goed: String(n),
        vraag,
        goedZin: [`Er liggen {${n}:oranje} stukken pizza.`],
        samen: async (l) => {
          await l.zeg("We tellen samen.", "Ik wijs, jij telt mee.");
          for (let i = 1; i < n; i++) {
            zet(l, { tel: telTot(i) });
            await l.zeg(`{${i}:oranje}`);
          }
          zet(l, { tel: [...telTot(n - 1), { i: n - 1, t: "?" }] });
          await l.zeg("En dit laatste stuk?");
        },
        hulpBeeld: { tel: [...telTot(n - 1), { i: n - 1, t: "?" }] },
        tip: ["Tel de stukken één voor één.", ...vraag],
      },
      t,
    );
}

/** Waar liggen meer stukken? */
function meerStukken(a: number, b: number): Opgave {
  const vraag = ["Waar liggen meer stukken pizza?"];
  const meer = a > b ? "a" : "b";
  return (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: {},
        kaarten: [K("a", PUNTEN(a), `de ${a === 1 ? "één" : a} stukken`), K("b", PUNTEN(b), `de ${b === 1 ? "één" : b} stukken`)],
        goed: meer,
        vraag,
        goedZin: [`{${Math.max(a, b)}:oranje} is meer dan {${Math.min(a, b)}:oranje}.`],
        samen: async (l) => {
          await l.zeg("We tellen ze allebei.");
          await wijsLangs(l, [
            ["a", a === 1 ? "Hier ligt {1:oranje} stuk." : `Hier liggen {${a}:oranje} stukken.`],
            ["b", b === 1 ? "Hier ligt {1:oranje} stuk." : `Hier liggen {${b}:oranje} stukken.`],
          ]);
          await l.zeg("Welk getal is meer?");
        },
        tip: ["Tel de stukken op allebei de plaatjes.", ...vraag],
      },
      t,
    );
}

/** Welk plaatje is één meer? */
function eenMeer(n: number, kaarten: [number, number]): Opgave {
  const vraag = ["Kijk naar de stukken pizza bovenaan.", "Welk plaatje is één meer?"];
  return (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: PUNTEN(n) },
        kaarten: kaarten.map((k) => K(String(k), PUNTEN(k), `de ${k} stukken`)),
        goed: String(n + 1),
        vraag,
        goedZin: [`{${n}:oranje} en één erbij is {${n + 1}:oranje}.`],
        samen: async (l) => {
          await l.zeg("Eerst tellen we de stukken bovenaan.");
          zet(l, { tel: telTot(n) });
          await l.zeg(`Daar liggen {${n}:oranje} stukken.`, "Eén meer betekent: er komt er één bij.", `Tel verder vanaf {${n}:oranje}.`, "Welk plaatje heeft er één meer?");
        },
        hulpBeeld: { tel: telTot(n) },
        tip: [`Tel verder vanaf {${n}:oranje}.`, "Welk plaatje is één meer?"],
      },
      t,
    );
}

/** Welk ijsje heeft één bolletje minder? */
function eenMinder(n: number, intro: string[]): Opgave {
  const vraag = [...intro, "Kijk naar het ijsje bovenaan.", "Welk ijsje heeft één bolletje minder?"];
  return (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: `ijsje|m=1|bol=${n}` },
        kaarten: [K("meer", `ijsje|m=1|bol=${n + 1}`, `het ijsje met ${n + 1} bolletjes`), K("minder", `ijsje|m=1|bol=${n - 1}`, n - 1 === 1 ? "het ijsje met één bolletje" : `het ijsje met ${n - 1} bolletjes`)],
        goed: "minder",
        vraag,
        goedZin: [`{${n}:roze} min één is {${n - 1}:roze}.`, n - 1 === 1 ? "Dit ijsje heeft één bolletje." : `Dit ijsje heeft {${n - 1}:roze} bolletjes.`],
        samen: async (l) => {
          await l.zeg("Eerst tellen we de bolletjes bovenaan.");
          zet(l, { tel: telTot(n) });
          await l.zeg(`Dat ijsje heeft {${n}:roze} bolletjes.`, "Eén minder betekent: er gaat er één af.", `Tel terug vanaf {${n}:roze}.`);
        },
        hulpBeeld: { tel: telTot(n) },
        tip: [`Tel terug vanaf {${n}:roze}.`, "Welk ijsje heeft één bolletje minder?"],
      },
      t,
    );
}

const pizza2Opgaven: Opgave[] = [
  hoeveelStukken(3, ["2", "3"]),
  meerStukken(4, 1),
  hoeveelStukken(2, ["2", "1"]),
  eenMeer(2, [3, 4]),
  eenMinder(4, ["Mila heeft niet zo'n trek meer.", "Ze wil een klein toetje."]),
  hoeveelStukken(4, ["5", "4"]),
  meerStukken(3, 5),
  eenMeer(4, [3, 5]),
  eenMinder(3, ["Joep wil ook een toetje."]),
  hoeveelStukken(5, ["3", "5"]),
  meerStukken(2, 1),
  eenMinder(5, ["Nog één ijsje voor Mila."]),
];

const pizza2: Lesdraaiboek = {
  id: "squla-meten-pizza-2",
  titel: "Pizza's vergelijken (moeilijker)",
  synthesis: "Squla groep 3 · Meten en maten · Rekentaal met pizza · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartPizza,
  async speel(l) {
    await welkom(l, "verhaal|s=pizza2", ["Hoi!", "Dit zijn Mila en haar grote broer Joep.", "Ze eten samen pizza.", "We tellen de stukken.", "En we zoeken meer, één meer en één minder."], async () => {
      zet(l, { groot: PUNTEN(3) });
      await l.zeg("Kijk, ik tel de stukken.");
      for (let i = 1; i <= 3; i++) {
        zet(l, { tel: telTot(i) });
        await l.zeg(`{${i}:oranje}`);
      }
      await l.zeg("Komt er één stuk bij? Dan is het één meer.");
      zet(l, { groot: PUNTEN(4), tel: telTot(4) });
      speelLesgeluid("verschijn");
      await l.zeg("Nu zijn het er {4:oranje}.", "Gaat er één af? Dan is het één minder.");
      zet(l, { groot: PUNTEN(3), tel: telTot(3) });
      await l.zeg("Dan zijn het er weer {3:oranje}.");
    });
    const fouten = await speelAlles(l, pizza2Opgaven, [0, 3, 4]);
    await squlaEind(l, fouten, "Je kunt tellen en zien wat meer en minder is.");
  },
};

/* --- level 3: zwaar en licht op de weegschaal (bakker Rosa) --- */

type Kant = -1 | 0 | 1;

/** Een vraag met de weegschaal. `zwaar`: de vraag gaat over het zwaarste (anders het lichtste). */
function weegVraag(o: { links: string; rechts: string; kant: Kant; kaarten: Kaart[]; goed: string; vraag: string[]; goedZin: string[]; zwaar: boolean; extra?: string[] }): Opgave {
  return (l, t) => {
    const balans = { links: o.links, rechts: o.rechts, kant: o.kant, zak: ++zakNr };
    const hulp: Partial<MetenProps> = {};
    return plaatjesVraag(
      l,
      {
        beeld: { balans },
        kaarten: o.kaarten,
        goed: o.goed,
        vraag: o.vraag,
        goedZin: o.goedZin,
        samen: async (l) => {
          const zak = { ...balans, zak: ++zakNr };
          hulp.balans = zak;
          zet(l, { balans: zak });
          await l.zeg("Kijk goed naar de weegschaal.", "Eerst hangt hij recht.");
          await l.zeg("Nu zakt hij aan één kant naar beneden.", ...(o.extra ?? []), o.zwaar ? "Wat zwaar is, gaat omlaag." : "Wat licht is, blijft boven.");
        },
        hulpBeeld: hulp,
        tip: [o.zwaar ? "Kijk welke kant van de weegschaal omlaag hangt." : "Kijk welke kant van de weegschaal omhoog gaat.", ...o.vraag.slice(-1)],
      },
      t,
    );
  };
}

/** Schatten: wat is ongeveer even zwaar als iemand? */
function schatVraag(o: { wie: string; naam: string; een: Kaart; veel: Kaart; vraag: string[]; goedZin: string[]; uitleg: string[] }): Opgave {
  return (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: `mens|wie=${o.wie}` },
        kaarten: [o.een, o.veel],
        goed: o.veel.id,
        vraag: o.vraag,
        goedZin: o.goedZin,
        samen: async (l) => {
          await wijsLangs(l, [[o.een.id, ...o.uitleg]]);
          await l.zeg(`Hoeveel heb je nodig om net zo zwaar te zijn als ${o.naam}?`);
        },
        tip: [`${Hoofd(o.naam)} is veel zwaarder dan één ding.`, ...o.vraag.slice(-1)],
      },
      t,
    );
}

const DEEG_G = "deeg|m=1";
const DEEG_K = "deeg|m=0.5";
const KAAS_G = "kaas|m=1";
const KAAS_K = "kaas|m=0.45";
const TOM1 = "tomaat|n=1";
const TOM3 = "tomaat|n=3";

const pizza3Opgaven: Opgave[] = [
  weegVraag({
    links: DEEG_G,
    rechts: DEEG_K,
    kant: -1,
    kaarten: [K("klein", DEEG_K, "het kleine deeg"), K("groot", DEEG_G, "het grote deeg")],
    goed: "groot",
    vraag: ["Rosa legt deeg op de weegschaal.", "Welk deeg is het zwaarst?", "Tik op het deeg."],
    goedZin: ["Het grote deeg is het zwaarst.", "Die kant hangt omlaag."],
    zwaar: true,
  }),
  weegVraag({
    links: PZ(0.8),
    rechts: PZ(0.8, "salami"),
    kant: 1,
    kaarten: [K("salami", PZ(0.8, "salami"), "de pizza met salami"), K("kaas", PZ(0.8), "de pizza met kaas")],
    goed: "salami",
    vraag: ["Nu liggen er twee pizza's op de weegschaal.", "Welke pizza is het zwaarst?"],
    goedZin: ["De pizza met salami is het zwaarst.", "Je ziet het aan de weegschaal."],
    zwaar: true,
    extra: ["De pizza's zijn even groot.", "Daar zie je het dus niet aan."],
  }),
  weegVraag({
    links: DEEG_G,
    rechts: DEEG_K,
    kant: -1,
    kaarten: [K("groot", DEEG_G, "het grote deeg"), K("klein", DEEG_K, "het kleine deeg")],
    goed: "klein",
    vraag: ["Kijk weer naar het deeg.", "Welk deeg is het lichtst?"],
    goedZin: ["Het kleine deeg is het lichtst.", "Die kant gaat omhoog."],
    zwaar: false,
  }),
  weegVraag({
    links: "meel",
    rechts: TOM3,
    kant: -1,
    kaarten: [K("tomaten", TOM3, "de tomaten"), K("meel", "meel", "de zak meel")],
    goed: "meel",
    vraag: ["Een zak meel en drie tomaten.", "Wat is zwaarder?"],
    goedZin: ["De zak meel is zwaarder."],
    zwaar: true,
  }),
  schatVraag({
    wie: "mila",
    naam: "Mila",
    een: K("een", "meel", "één zak meel"),
    veel: K("veel", "meelberg", "heel veel zakken meel"),
    vraag: ["Mila komt bij Rosa kijken.", "Wat denk je: wat is even zwaar als Mila?", "Eén zak meel, of heel veel zakken meel?"],
    goedZin: ["Heel veel zakken meel zijn samen net zo zwaar als Mila."],
    uitleg: ["Eén zak meel kun je nog net tillen.", "Kun je Mila ook optillen? Dat is veel zwaarder!"],
  }),
  weegVraag({
    links: KAAS_K,
    rechts: KAAS_G,
    kant: 1,
    kaarten: [K("groot", KAAS_G, "de grote kaas"), K("klein", KAAS_K, "de kleine kaas")],
    goed: "groot",
    vraag: ["Rosa weegt de kaas.", "Welke kaas is het zwaarst?"],
    goedZin: ["De grote kaas is het zwaarst."],
    zwaar: true,
  }),
  weegVraag({
    links: KAAS_K,
    rechts: KAAS_G,
    kant: 1,
    kaarten: [K("klein", KAAS_K, "de kleine kaas"), K("groot", KAAS_G, "de grote kaas")],
    goed: "klein",
    vraag: ["Kijk weer naar de kaas.", "Welke kaas is het lichtst?"],
    goedZin: ["De kleine kaas is het lichtst."],
    zwaar: false,
  }),
  weegVraag({
    links: "dozen|n=1|kleur=rood",
    rechts: "dozen|n=1|kleur=blauw",
    kant: -1,
    kaarten: [K("blauw", "dozen|n=1|kleur=blauw", "de blauwe doos"), K("rood", "dozen|n=1|kleur=rood", "de rode doos")],
    goed: "rood",
    vraag: ["Twee dozen. Ze zijn even groot.", "In één doos zit een pizza.", "Welke doos is het zwaarst?"],
    goedZin: ["De rode doos is het zwaarst.", "Daar zit de pizza in."],
    zwaar: true,
    extra: ["De dozen zijn even groot.", "Daar zie je het dus niet aan."],
  }),
  weegVraag({
    links: TOM1,
    rechts: PZ(0.7),
    kant: 1,
    kaarten: [K("pizza", PZ(0.7), "de pizza"), K("tomaat", TOM1, "de tomaat")],
    goed: "pizza",
    vraag: ["Een tomaat en een pizza.", "Wat is zwaarder?"],
    goedZin: ["De pizza is zwaarder dan de tomaat."],
    zwaar: true,
  }),
  schatVraag({
    wie: "rosa",
    naam: "bakker Rosa",
    een: K("een", "dozen|n=1", "één doos"),
    veel: K("veel", "stapels|s=6|n=7", "heel veel stapels dozen"),
    vraag: ["Wat denk je: wat is even zwaar als bakker Rosa?", "Eén doos, of heel veel stapels dozen?"],
    goedZin: ["Heel veel stapels dozen zijn samen net zo zwaar als Rosa."],
    uitleg: ["Eén pizzadoos is heel licht.", "Die til je met één hand op.", "Maar Rosa is een grote mevrouw."],
  }),
  weegVraag({
    links: "olijf",
    rechts: DEEG_K,
    kant: 1,
    kaarten: [K("olijf", "olijf", "de olijf"), K("deeg", DEEG_K, "het deeg")],
    goed: "olijf",
    vraag: ["Een olijf en een bolletje deeg.", "Wat is het lichtst?"],
    goedZin: ["De olijf is het lichtst."],
    zwaar: false,
  }),
  weegVraag({
    links: TOM3,
    rechts: TOM1,
    kant: -1,
    kaarten: [K("een", TOM1, "één tomaat"), K("drie", TOM3, "de drie tomaten")],
    goed: "drie",
    vraag: ["Eén tomaat en drie tomaten.", "Wat is het zwaarst?"],
    goedZin: ["Drie tomaten zijn het zwaarst."],
    zwaar: true,
  }),
];

const pizza3: Lesdraaiboek = {
  id: "squla-meten-pizza-3",
  titel: "Pizza's vergelijken (nog moeilijker)",
  synthesis: "Squla groep 3 · Meten en maten · Rekentaal met pizza · level 3 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartPizza,
  async speel(l) {
    await welkom(l, "verhaal|s=pizza3", ["Hoi!", "Dit is bakker Rosa.", "Rosa maakt pizza's.", "Ze weegt alles op een weegschaal.", "We leren zwaar en licht."], async () => {
      zet(l, { groot: null, balans: { links: KAAS_G, rechts: TOM1, kant: -1, zak: ++zakNr } });
      await l.zeg("Kijk naar de weegschaal.", "Eerst hangt hij recht.", "Dan zakt de zware kant naar beneden.", "De kaas is zwaar. De tomaat is licht.");
      zet(l, { balans: null });
    });
    const fouten = await speelAlles(l, pizza3Opgaven, [0, 1, 4]);
    await squlaEind(l, fouten, "Je weet wat zwaar en licht is.");
  },
};

/* =====================================================================
   HOEVEELHEDEN (Jip en oma, de picknick)
   ===================================================================== */

const MAND = (v: number) => `mand|vul=${v}`;
const SAP = (v: number) => `beker|v=${v}|in=sap`;
const WATER = (v: number) => `beker|v=${v}|in=water|rietje=1`;

/** Kies het goede plaatje; in de uitleg wijst Bliepo de plaatjes één voor één aan. */
function wijsVraag(o: { beeld?: Partial<MetenProps>; kaarten: Kaart[]; goed: string; vraag: string[]; goedZin: string[]; uitleg: [string, ...string[]][]; slot?: string[]; tip: string[] }): Opgave {
  return (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: o.beeld ?? {},
        kaarten: o.kaarten,
        goed: o.goed,
        vraag: o.vraag,
        goedZin: o.goedZin,
        samen: async (l) => {
          await wijsLangs(l, o.uitleg);
          if (o.slot) await l.zeg(...o.slot);
        },
        tip: o.tip,
      },
      t,
    );
}

/** Op volgorde zetten (bekers, schalen, manden). */
function ordenRij(o: { juist: string[]; vast?: number[]; vastDingen?: MDing[]; losse: Kaart[]; vraag: string[]; goedZin: string[]; uitleg: string[]; tip: string[]; handje?: boolean }): Opgave {
  return (l, t) =>
    ordenVraag(
      l,
      {
        beeld: {},
        juist: o.juist,
        vast: o.vast ?? [],
        vastDingen: o.vastDingen,
        losse: o.losse,
        vraag: o.vraag,
        goedZin: o.goedZin,
        samen: async (l) => {
          await l.zeg(...o.uitleg);
        },
        tip: o.tip,
        handje: o.handje,
      },
      t,
    );
}

/** Een woord kiezen (de woorden staan op knoppen bij Bliepo en worden voorgelezen). */
function woordVraag(o: { beeld: Partial<MetenProps>; opties: string[]; goed: string; vraag: string[]; goedZin: string[]; uitleg: string[]; tip: string[] }): Opgave {
  return (l, t) =>
    knopVraag(
      l,
      {
        beeld: o.beeld,
        opties: o.opties,
        goed: o.goed,
        vraag: o.vraag,
        goedZin: o.goedZin,
        samen: async (l) => {
          await l.zeg(...o.uitleg);
        },
        tip: o.tip,
      },
      t,
    );
}

/* --- level 1: leeg, vol, veel, weinig, het meest, evenveel --- */

const hoeveel1Opgaven: Opgave[] = [
  wijsVraag({
    kaarten: [K("half", MAND(1), "de mand met een beetje fruit"), K("leeg", MAND(0), "de lege mand"), K("vol", MAND(2), "de volle mand")],
    goed: "leeg",
    vraag: ["Jip pakt een mand voor de picknick.", "Er zit nog niets in.", "Welke mand is leeg?", "Tik op de mand."],
    goedZin: ["Deze mand is leeg.", "Er zit nog niets in."],
    uitleg: [
      ["half", "In deze mand zit een beetje fruit."],
      ["vol", "Deze mand zit propvol."],
    ],
    slot: ["Leeg betekent: er zit niets in.", "In welke mand zit niets?"],
    tip: ["Zoek de mand waar niets in zit.", "Welke mand is leeg?"],
  }),
  wijsVraag({
    kaarten: [K("leeg", "stokje|n=0", "het lege stokje"), K("twee", "stokje|n=2", "het stokje met twee stukjes"), K("veel", "stokje|n=6", "het volle stokje")],
    goed: "veel",
    vraag: ["Oma maakt fruitstokjes.", "Op welk stokje zit veel fruit?"],
    goedZin: ["Op dit stokje zit veel fruit.", "Lekker!"],
    uitleg: [
      ["leeg", "Op dit stokje zit nog niets."],
      ["twee", "Op dit stokje zitten {2:rood} stukjes."],
    ],
    slot: ["Veel is een heleboel.", "Op welk stokje zit een heleboel fruit?"],
    tip: ["Zoek het stokje met de meeste stukjes.", "Op welk stokje zit veel fruit?"],
  }),
  wijsVraag({
    kaarten: [K("veel", "broodje|n=5", "het broodje met veel kaas"), K("heelveel", "broodje|n=7", "het broodje met heel veel kaas"), K("weinig", "broodje|n=1", "het broodje met weinig kaas")],
    goed: "weinig",
    vraag: ["Jip maakt broodjes met kaas.", "Op welk broodje zit weinig kaas?"],
    goedZin: ["Op dit broodje zit weinig kaas.", "Maar één klein plakje."],
    uitleg: [
      ["veel", "Op dit broodje zit veel kaas."],
      ["heelveel", "En op dit broodje zit heel veel kaas."],
    ],
    slot: ["Weinig is maar een klein beetje.", "Weinig is het tegenovergestelde van veel."],
    tip: ["Zoek het broodje met maar een klein beetje kaas.", "Op welk broodje zit weinig kaas?"],
  }),
  wijsVraag({
    kaarten: [K("bijna", SAP(0.15), "de bijna lege beker"), K("half", SAP(0.5), "de halfvolle beker"), K("vol", SAP(1), "de volle beker")],
    goed: "vol",
    vraag: ["Oma schenkt sap in.", "Welke beker is vol?"],
    goedZin: ["Deze beker is vol.", "Er kan niets meer bij."],
    uitleg: [
      ["bijna", "Kijk tot waar het sap komt.", "In deze beker zit maar een klein beetje."],
      ["half", "Deze beker is half vol."],
    ],
    slot: ["Vol betekent: er kan niets meer bij.", "Het sap komt dan tot bovenaan."],
    tip: ["Zoek de beker waar het sap tot bovenaan komt.", "Welke beker is vol?"],
  }),
  wijsVraag({
    kaarten: [K("half", "potje|v=0.5", "het halfvolle potje"), K("bijnaleeg", "potje|v=0.15", "het bijna lege potje"), K("meest", "potje|v=0.85", "het bijna volle potje")],
    goed: "meest",
    vraag: ["Jip neemt jam mee.", "In welk potje zit de meeste jam?"],
    goedZin: ["In dit potje zit de meeste jam."],
    uitleg: [
      ["half", "Kijk tot waar de jam komt.", "Dit potje is half vol."],
      ["bijnaleeg", "In dit potje zit bijna niets meer."],
    ],
    slot: ["In welk potje komt de jam het hoogst?"],
    tip: ["Kijk in welk potje de jam het hoogst komt.", "In welk potje zit de meeste jam?"],
  }),
  ordenRij({
    juist: ["weinig", "half", "veel"],
    vast: [1],
    vastDingen: [{ id: "half", tekening: WATER(0.5), zeg: "" }],
    losse: [K("veel", WATER(0.85), "de beker met veel water"), K("weinig", WATER(0.2), "de beker met weinig water")],
    vraag: ["Oma maakt water met een rietje.", "De middelste beker staat er al.", "Zet de bekers op volgorde.", "Van minder naar meer water."],
    goedZin: ["Eerst minder water, dan meer water."],
    uitleg: ["Kijk naar de middelste beker.", "Een beker met minder water komt vooraan.", "Een beker met meer water komt achteraan."],
    tip: ["Minder water komt vooraan.", "Zet de bekers op volgorde."],
    handje: true,
  }),
  ordenRij({
    juist: ["vol", "voller", "volst"],
    losse: [K("volst", "schaal|n=12", "de schaal met een berg tomaten"), K("vol", "schaal|n=4", "de volle schaal"), K("voller", "schaal|n=7", "de nog vollere schaal")],
    vraag: ["Jip doet tomaten in schalen.", "Zet ze op volgorde:", "vol, voller, volst."],
    goedZin: ["Deze schaal is vol.", "Deze is voller.", "En deze is het volst."],
    uitleg: ["Vol, voller, volst.", "In een vollere schaal zitten nog meer tomaten.", "In de volste schaal zitten de meeste."],
    tip: ["Vooraan de schaal met de minste tomaten.", "Vol, voller, volst."],
  }),
  wijsVraag({
    beeld: { groot: "tafereel|s=fles|v=0.8" },
    kaarten: [K("minder", "flesje|v=0.55", "het flesje met minder water"), K("even", "flesje|v=0.8", "het flesje met evenveel water")],
    goed: "even",
    vraag: ["Kijk naar het flesje van Jip.", "In welk flesje zit evenveel water?"],
    goedZin: ["In dit flesje zit evenveel water.", "Het water komt net zo hoog."],
    uitleg: [
      ["minder", "Evenveel betekent: net zoveel.", "Kijk tot waar het water komt."],
      ["even", "Komt het water ergens net zo hoog als bij Jip?"],
    ],
    tip: ["Kijk tot waar het water komt in het flesje van Jip.", "In welk flesje zit evenveel water?"],
  }),
  woordVraag({
    beeld: { groot: MAND(2) },
    opties: ["meer", "vol", "evenveel"],
    goed: "vol",
    vraag: ["Alles zit nu in de mand.", "De mand is niet meer leeg.", "Wat is het tegenovergestelde van leeg?", "Meer, vol of evenveel?"],
    goedZin: ["Het tegenovergestelde van leeg is vol."],
    uitleg: ["Het tegenovergestelde is het omgekeerde.", "Een lege mand: daar zit niets in.", "Zit er zoveel in dat er niets meer bij kan?", "Welk woord hoort daarbij?"],
    tip: ["Er kan niets meer bij. Hoe heet dat?", "Wat is het tegenovergestelde van leeg?"],
  }),
  wijsVraag({
    beeld: { groot: SAP(0.6) },
    kaarten: [K("weinig", SAP(0.3), "de beker met minder sap"), K("even", SAP(0.6), "de beker met evenveel sap"), K("veel", SAP(0.9), "de beker met meer sap")],
    goed: "even",
    vraag: ["Kijk naar de beker bovenaan.", "In welke beker hieronder zit evenveel sap?"],
    goedZin: ["In deze beker zit evenveel sap.", "Het sap komt net zo hoog."],
    uitleg: [
      ["weinig", "Evenveel betekent: net zoveel.", "Hier komt het sap lager."],
      ["veel", "Hier komt het sap hoger."],
    ],
    slot: ["Waar komt het sap net zo hoog als bovenaan?"],
    tip: ["Kijk tot waar het sap komt.", "In welke beker zit evenveel sap?"],
  }),
  wijsVraag({
    kaarten: [K("twee", "schaal|n=2", "de schaal met twee tomaten"), K("veel", "schaal|n=9", "de schaal met veel tomaten"), K("leeg", "schaal|n=0", "de lege schaal")],
    goed: "veel",
    vraag: ["In welke schaal zitten veel tomaten?"],
    goedZin: ["In deze schaal zitten veel tomaten."],
    uitleg: [
      ["leeg", "Deze schaal is leeg."],
      ["twee", "In deze schaal zitten maar {2:rood} tomaten."],
    ],
    slot: ["Veel is een heleboel."],
    tip: ["Zoek de schaal met een heleboel tomaten.", "In welke schaal zitten veel tomaten?"],
  }),
  ordenRij({
    juist: ["min", "mid", "max"],
    losse: [K("mid", SAP(0.55), "de beker met wat sap"), K("max", SAP(0.9), "de beker met veel sap"), K("min", SAP(0.2), "de beker met weinig sap")],
    vraag: ["Zet de bekers op volgorde.", "Van minder naar meer sap."],
    goedZin: ["Eerst weinig sap, dan meer, en dan het meest."],
    uitleg: ["Kijk tot waar het sap komt.", "De beker met het minste sap komt vooraan.", "De beker met het meeste sap komt achteraan."],
    tip: ["Vooraan de beker met het minste sap.", "Van minder naar meer sap."],
  }),
];

const hoeveel1: Lesdraaiboek = {
  id: "squla-meten-hoeveelheden-1",
  titel: "Vol, leeg, zwaar en licht",
  synthesis: "Squla groep 3 · Meten en maten · Hoeveelheden · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartHoeveelheden,
  async speel(l) {
    await welkom(l, "verhaal|s=picknick1", ["Hoi!", "Dit zijn Jip en zijn oma.", "Ze gaan picknicken in het park.", "We leren leeg, vol, veel en weinig."], async () => {
      zet(l, { groot: null, kaarten: [K("leeg", MAND(0), "de lege mand"), K("vol", MAND(2), "de volle mand")] });
      await wijsLangs(l, [
        ["leeg", "Deze mand is leeg.", "Er zit niets in."],
        ["vol", "Deze mand is vol.", "Er kan niets meer bij."],
      ]);
      zet(l, { kaarten: [] });
    });
    const fouten = await speelAlles(l, hoeveel1Opgaven, [0, 3, 5]);
    await squlaEind(l, fouten, "Je weet wat leeg, vol, veel en weinig is.");
  },
};

/* --- level 2: zwaar, licht, lichter, zwaarder, even zwaar, liter --- */

const WEEG = (kant: Kant) => `weeg|kant=${kant}|l=beker~v:0.9~in:groente|r=schaal~n:4`;
const WIP = (kant: Kant) => `wip|kant=${kant}`;

const hoeveel2Opgaven: Opgave[] = [
  woordVraag({
    beeld: { groot: "tafereel|s=mand" },
    opties: ["kort", "zwaar", "dun"],
    goed: "zwaar",
    vraag: ["Jip draagt de picknickmand.", "Er zit veel in. De mand weegt veel.", "De mand is ...", "Kort, zwaar of dun?"],
    goedZin: ["De mand is zwaar."],
    uitleg: ["Weegt iets veel? Dan kun je het moeilijk tillen.", "Welk woord past daarbij?"],
    tip: ["Iets wat veel weegt, is ...", "Kort, zwaar of dun?"],
  }),
  woordVraag({
    beeld: { groot: "tafereel|s=tas" },
    opties: ["kort", "zwaarder", "licht"],
    goed: "licht",
    vraag: ["Jip heeft ook een rugtas.", "De rugtas is niet zwaar.", "Het tegenovergestelde van zwaar is ...", "Kort, zwaarder of licht?"],
    goedZin: ["Het tegenovergestelde van zwaar is licht.", "De mand is zwaar. De rugtas is licht."],
    uitleg: ["De mand weegt veel.", "De rugtas weegt bijna niets.", "Hoe noem je iets wat bijna niets weegt?"],
    tip: ["Iets wat bijna niets weegt, is ...", "Kort, zwaarder of licht?"],
  }),
  woordVraag({
    beeld: { groot: "tafereel|s=speelgoed" },
    opties: ["groter", "zwaarder", "lichter"],
    goed: "lichter",
    vraag: ["Jip haalt het speelgoed uit zijn tas.", "Nu weegt de tas nog minder.", "De tas is nu nog ...", "Groter, zwaarder of lichter?"],
    goedZin: ["De tas is nu nog lichter."],
    uitleg: ["Er gaat iets uit de tas.", "Dan weegt de tas minder.", "Weegt iets minder? Dan is het ..."],
    tip: ["Er ging iets uit de tas. Weegt hij nu meer of minder?", "Groter, zwaarder of lichter?"],
  }),
  wijsVraag({
    kaarten: [K("bal", "voetbal", "de voetbal"), K("veer", "veer", "de veer"), K("steen", "steen", "de steen")],
    goed: "veer",
    vraag: ["Wat is het lichtst?", "De voetbal, de veer of de steen?"],
    goedZin: ["De veer is het lichtst.", "Die weegt bijna niets."],
    uitleg: [
      ["steen", "Een steen is zwaar."],
      ["bal", "Een voetbal is niet zo zwaar."],
      ["veer", "Een veer kan wegwaaien in de wind."],
    ],
    slot: ["Wat weegt het minst?"],
    tip: ["Wat weegt het minst?", "Wat is het lichtst?"],
  }),
  wijsVraag({
    kaarten: [K("links", WIP(-1), "de wip waar Jip omlaag gaat"), K("rechts", WIP(1), "de wip waar Daan omlaag gaat"), K("recht", WIP(0), "de rechte wip")],
    goed: "recht",
    vraag: ["In het park staat een wip.", "Jip en zijn vriend Daan gaan erop.", "Ze zijn even zwaar.", "Op welk plaatje zie je dat?"],
    goedZin: ["Op dit plaatje is de wip recht.", "Jip en Daan zijn even zwaar."],
    uitleg: [
      ["links", "Hier gaat Jip omlaag. Dan is Jip zwaarder."],
      ["rechts", "Hier gaat Daan omlaag. Dan is Daan zwaarder."],
    ],
    slot: ["Zijn ze even zwaar? Dan gaat niemand omlaag."],
    tip: ["Bij even zwaar gaat niemand omlaag.", "Op welk plaatje zie je dat?"],
  }),
  wijsVraag({
    kaarten: [K("jip", "mens|wie=jip", "Jip"), K("mier", "mier", "de mier"), K("mama", "mens|wie=mama", "mama")],
    goed: "mama",
    vraag: ["Wie is het zwaarst?", "Jip, de mier of mama?"],
    goedZin: ["Mama is het zwaarst."],
    uitleg: [
      ["mier", "Een mier is heel klein en licht."],
      ["jip", "Jip is veel zwaarder dan een mier."],
      ["mama", "En mama is groter dan Jip."],
    ],
    slot: ["Wie weegt dan het meest?"],
    tip: ["Wie is het grootst en weegt het meest?", "Wie is het zwaarst?"],
  }),
  ordenRij({
    juist: ["leeg", "half", "vol"],
    losse: [K("vol", MAND(2), "de volle mand"), K("leeg", MAND(0), "de lege mand"), K("half", MAND(1), "de mand met een beetje")],
    vraag: ["Zet de manden op volgorde:", "zwaar, zwaarder, zwaarst."],
    goedZin: ["Hoe meer erin zit, hoe zwaarder de mand."],
    uitleg: ["Hoe meer er in een mand zit, hoe zwaarder hij is.", "Vooraan komt de mand met het minste erin.", "Achteraan de mand met het meeste."],
    tip: ["Vooraan de mand met het minste erin.", "Zwaar, zwaarder, zwaarst."],
    handje: true,
  }),
  wijsVraag({
    kaarten: [K("links", WEEG(-1), "de weegschaal waar de beker omlaag gaat"), K("rechts", WEEG(1), "de weegschaal waar de tomaatjes omlaag gaan"), K("recht", WEEG(0), "de rechte weegschaal")],
    goed: "recht",
    vraag: ["Mama zet groente klaar.", "Een beker groente en een schaal tomaatjes.", "Ze zijn even zwaar.", "Op welk plaatje zie je dat?"],
    goedZin: ["Hier hangt de weegschaal recht.", "Dan zijn ze even zwaar."],
    uitleg: [
      ["links", "Hier gaat de beker omlaag. Die is dan zwaarder."],
      ["rechts", "Hier gaan de tomaatjes omlaag. Die zijn dan zwaarder."],
    ],
    slot: ["Zijn ze even zwaar? Dan gaat geen kant omlaag."],
    tip: ["Bij even zwaar hangt de weegschaal recht.", "Op welk plaatje zie je dat?"],
  }),
  (l, t) =>
    plaatjesVraag(
      l,
      {
        beeld: { groot: "maatbeker|l=1|v=0.5" },
        kaarten: [K("halfhalf", "maatbeker|l=half|v=0.5", "de kleine maatbeker die half vol is"), K("halfvol", "maatbeker|l=half|v=1", "de volle kleine maatbeker"), K("litervol", "maatbeker|l=1|v=1", "de volle grote maatbeker")],
        goed: "halfvol",
        vraag: ["Mama heeft water met fruit.", "Het zit in een maatbeker van 1 liter.", "Die is half vol.", "Waar zit evenveel water in?"],
        goedZin: ["Een halve liter is evenveel.", "De kleine maatbeker is helemaal vol."],
        samen: async (l) => {
          await l.zeg("De grote maatbeker is 1 liter.", "Hij is maar half vol.", "Dat is een halve liter.");
          zet(l, { vergelijk: ["maatbeker|l=1|v=0.5", "maatbeker|l=half|v=0.5", "maatbeker|l=half|v=1", "maatbeker|l=1|v=1"] });
          speelLesgeluid("schuif");
          await l.zeg("Ik zet ze naast elkaar.", "De kleine maatbekers zijn een halve liter.", "Waar komt het water net zo hoog als bij de grote?");
        },
        tip: ["Een halve liter past precies in de kleine maatbeker.", "Waar zit evenveel water in?"],
      },
      t,
    ),
  woordVraag({
    beeld: { groot: "tafereel|s=buik" },
    opties: ["lichter", "zwaarder", "langer"],
    goed: "zwaarder",
    vraag: ["Het eten is op.", "De lege bakjes gaan terug in de mand.", "Nu is de mand lichter.", "Maar Jip heeft heel veel gegeten.", "Jip is nu een beetje ...", "Lichter, zwaarder of langer?"],
    goedZin: ["Jip is nu een beetje zwaarder.", "Al het eten zit in zijn buik."],
    uitleg: ["Het eten ging uit de mand.", "Daarom is de mand lichter.", "Maar waar ging het eten naartoe?", "In de buik van Jip!"],
    tip: ["Het eten zit nu in Jip. Weegt hij meer of minder?", "Lichter, zwaarder of langer?"],
  }),
  wijsVraag({
    kaarten: [K("ballon", "ballon", "de ballon"), K("meloen", "watermeloen", "de watermeloen"), K("appel", "appel", "de appel")],
    goed: "meloen",
    vraag: ["Wat is het zwaarst?", "De ballon, de watermeloen of de appel?"],
    goedZin: ["De watermeloen is het zwaarst."],
    uitleg: [
      ["ballon", "Een ballon zweeft bijna weg. Die is heel licht."],
      ["appel", "Een appel kun je met één hand pakken."],
      ["meloen", "Een watermeloen moet je met twee handen tillen."],
    ],
    slot: ["Wat weegt het meest?"],
    tip: ["Wat weegt het meest?", "Wat is het zwaarst?"],
  }),
  woordVraag({
    beeld: { groot: "tafereel|s=tas" },
    opties: ["zwaar", "leeg", "kort"],
    goed: "zwaar",
    vraag: ["De rugtas van Jip is licht.", "Wat is het tegenovergestelde van licht?", "Zwaar, leeg of kort?"],
    goedZin: ["Het tegenovergestelde van licht is zwaar."],
    uitleg: ["Licht is: het weegt bijna niets.", "Het omgekeerde is: het weegt heel veel.", "Hoe noem je dat?"],
    tip: ["Iets wat heel veel weegt, is ...", "Zwaar, leeg of kort?"],
  }),
];

const hoeveel2: Lesdraaiboek = {
  id: "squla-meten-hoeveelheden-2",
  titel: "Vol, leeg, zwaar en licht (moeilijker)",
  synthesis: "Squla groep 3 · Meten en maten · Hoeveelheden · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartHoeveelheden,
  async speel(l) {
    await welkom(l, "verhaal|s=picknick2", ["Hoi!", "Jip loopt met mama naar het park.", "Jip draagt de picknickmand.", "We leren zwaar en licht."], async () => {
      zet(l, { groot: null, kaarten: [K("dozen", "dozen|n=4", "de stapel dozen"), K("ballon", "ballon", "de ballon")] });
      await wijsLangs(l, [
        ["dozen", "Een stapel dozen weegt veel.", "Die is zwaar."],
        ["ballon", "Een ballon weegt bijna niets.", "Die is licht."],
      ]);
      zet(l, { kaarten: [] });
    });
    const fouten = await speelAlles(l, hoeveel2Opgaven, [1, 5, 8]);
    await squlaEind(l, fouten, "Je weet wat zwaar, zwaarder en het zwaarst is.");
  },
};

/* =====================================================================
   OPPERVLAKTE
   ===================================================================== */

/** Twee kloppende zinnen kiezen over de schilderijen op de tegelmuur. */
function schilderijVraag(v: "1" | "2", kaarten: Kaart[], goed: [string, string], goedZin: string[]): Opgave {
  return (l, t) =>
    tweeVraag(
      l,
      {
        beeld: { groot: `muur|v=${v}` },
        kaarten,
        goed,
        vraag: ["Kijk naar de schilderijen op de muur.", "Wat klopt er? Kies twee kaartjes."],
        goedZin,
        samen: async (l) => {
          await l.zeg("De tegels op de muur helpen je.");
          zet(l, { groot: `muur|v=${v}|zien=1` });
          speelLesgeluid("verschijn");
          await l.zeg("Ik laat de tegels achter de schilderijen zien.", "Achter een groot schilderij zitten veel tegels.", "Achter een klein schilderij zitten weinig tegels.");
        },
        hulpBeeld: { groot: `muur|v=${v}|zien=1` },
        tip: ["Tel de tegels achter elk schilderij.", "Wat klopt er? Kies twee kaartjes."],
      },
      t,
    );
}

const SCH = (id: string, o: string, wat: string, zin: string, kort: string): Kaart => ({ id, tekening: `onderwerp|o=${o}`, label: wat, zeg: zin, naam: kort });

const TAFELS = {
  a: "tafelb|k=2|r=1|n=2",
  b: "tafelb|k=2|r=2|n=4",
  c: "tafelb|k=3|r=2|n=6",
  d: "tafelb|k=3|r=3|n=6",
};

/** Hoeveel blaadjes is de tafel groot? Typen. */
function tafelTypen(o: { k: number; r: number; kl: string; kleur: string; eerste?: boolean }): Opgave {
  const n = o.k * o.r;
  const groot = `tafel|k=${o.k}|r=${o.r}|kl=${o.kl}`;
  const vraag = [...(o.eerste ? ["Op de tafel liggen blaadjes papier.", "Ze bedekken de hele tafel."] : ["Weer een tafel vol blaadjes."]), "Hoe groot is de tafel?", "Tel de blaadjes en typ het getal."];
  return (l) =>
    getalVraag(l, {
      beeld: { groot },
      goed: n,
      vraag,
      goedZin: [`De tafel is {${n}:${o.kleur}} blaadjes groot.`],
      naGoed: { tel: [{ i: n - 1, t: String(n) }] },
      samen: async (l) => {
        await l.zeg("We tellen samen.", "Ik tel de eerste rij.");
        for (let i = 1; i <= o.k; i++) {
          zet(l, { tel: telTot(i) });
          await l.zeg(`{${i}:${o.kleur}}`);
        }
        await l.zeg(`Er zijn {${o.r}:wit} rijen.`, "Tel jij verder?");
      },
      hulpBeeld: { tel: telTot(o.k) },
      tip: [`Tel verder vanaf {${o.k}:${o.kleur}}.`, "Hoe groot is de tafel?"],
    });
}

/* --- level 1: grootst, kleinst, even groot, smal en breed, hokjes tellen tot 12 --- */

const opp1Opgaven: Opgave[] = [
  schilderijVraag(
    "1",
    [
      SCH("zon", "zon", "kleinst", "Het schilderij met de zon is het kleinst.", "de zon het kleinst"),
      SCH("bloem", "bloem", "kleinst", "Het schilderij met de bloem is het kleinst.", "de bloem het kleinst"),
      SCH("huis", "huis", "grootst", "Het schilderij met het huis is het grootst.", "het huis het grootst"),
    ],
    ["zon", "huis"],
    ["De zon is het kleinst.", "Het huis is het grootst."],
  ),
  schilderijVraag(
    "2",
    [
      SCH("boot", "boot", "kleinst", "Het schilderij met de boot is het kleinst.", "de boot het kleinst"),
      SCH("boom", "boom", "kleinst", "Het schilderij met de boom is het kleinst.", "de boom het kleinst"),
      SCH("vis", "vis", "grootst", "Het schilderij met de vis is het grootst.", "de vis het grootst"),
    ],
    ["boot", "vis"],
    ["De boot is het kleinst.", "De vis is het grootst.", "De boom is wel hoog, maar heel smal."],
  ),
  ordenRij({
    juist: ["a", "b", "c", "d"],
    losse: [K("d", TAFELS.d, "de tafel met plek over"), K("a", TAFELS.a, "de tafel met twee borden"), K("c", TAFELS.c, "de tafel met zes borden"), K("b", TAFELS.b, "de tafel met vier borden")],
    vraag: ["Hier zijn vier tafels met borden.", "Zet de tafels op volgorde.", "Van klein naar groot."],
    goedZin: ["Van klein naar groot.", "Op de grootste tafel is nog plek over."],
    uitleg: ["Tel de borden op elke tafel.", "Let op: op één tafel is nog plek over.", "Daar passen nog meer borden op.", "Die tafel is dus het grootst."],
    tip: ["Op welke tafel past het meest?", "Van klein naar groot."],
    handje: true,
  }),
  ordenRij({
    juist: ["2", "4", "6"],
    losse: [K("6", "muurtje|n=6", "het muurtje van zes stenen"), K("2", "muurtje|n=2", "het muurtje van twee stenen"), K("4", "muurtje|n=4", "het muurtje van vier stenen")],
    vraag: ["Zet de muurtjes op volgorde.", "Van smal naar breed."],
    goedZin: ["Van smal naar breed.", "Het breedste muurtje heeft de meeste stenen naast elkaar."],
    uitleg: ["Tel de stenen die naast elkaar liggen.", "Liggen er meer stenen naast elkaar?", "Dan is het muurtje breder."],
    tip: ["Vooraan het muurtje met de minste stenen naast elkaar.", "Van smal naar breed."],
  }),
  (l, t) =>
    knopVraag(
      l,
      {
        beeld: { groot: "vellen|draai=1" },
        opties: ["Ze zijn even groot.", "Ze zijn niet even groot."],
        goed: "Ze zijn even groot.",
        vraag: ["Hier liggen twee kaartjes papier.", "Kaartje {2:oranje} ligt op zijn kant.", "Wat klopt?", "Zijn ze even groot, of niet even groot?"],
        goedZin: ["Ze zijn even groot.", "Kaartje {2:oranje} is alleen gedraaid."],
        samen: async (l) => {
          await l.zeg("Ik draai kaartje {2:oranje} terug.");
          zet(l, { groot: "vellen|draai=0" });
          speelLesgeluid("schuif");
          await l.zeg("Nu staan ze allebei rechtop.", "Draaien maakt iets niet groter of kleiner.", "Kijk nog eens goed.");
        },
        hulpBeeld: { groot: "vellen|draai=0" },
        tip: ["Draaien maakt iets niet groter of kleiner.", "Zijn ze even groot, of niet even groot?"],
      },
      t,
    ),
  (l, t) =>
    tweeVraag(
      l,
      {
        beeld: { groot: "ruitjes|a=2x4|b=1x8" },
        kaarten: [
          Z("even", "Ze zijn even groot.", "teken|t==", "ze zijn even groot"),
          Z("niet", "Ze zijn niet even groot.", "teken|t=niet", "ze zijn niet even groot"),
          Z("tel", "Tel de hokjes. Dan weet je hoe groot de blauwe vorm is.", "teken|t=tel", "tel de hokjes"),
        ],
        goed: ["even", "tel"],
        vraag: ["Kijk naar de blauwe en de gele vorm.", "Wat klopt er? Kies twee kaartjes."],
        goedZin: ["Ze zijn allebei {8:wit} hokjes groot.", "En met hokjes tellen weet je hoe groot iets is."],
        samen: async (l) => {
          await l.zeg("Ik tel de blauwe hokjes.");
          for (let i = 1; i <= 8; i++) {
            zet(l, { tel: telTot(i) });
            await l.zeg(`{${i}:blauw}`);
          }
          await l.zeg("Tel jij de gele hokjes?", "Zijn het er net zoveel?");
        },
        hulpBeeld: { tel: telTot(8) },
        tip: ["Tel de blauwe en de gele hokjes.", "Wat klopt er? Kies twee kaartjes."],
      },
      t,
    ),
  (l, t) => gelijkVraag(l, t, "a=2x2|b=1x4", 4, true),
  (l, t) => gelijkVraag(l, t, "a=2x5|b=1x10", 10, false),
  tafelTypen({ k: 5, r: 2, kl: "groen", kleur: "groen", eerste: true }),
  tafelTypen({ k: 3, r: 3, kl: "blauw", kleur: "blauw" }),
  tafelTypen({ k: 4, r: 3, kl: "oranje", kleur: "oranje" }),
  ordenRij({
    juist: ["3", "5", "7"],
    losse: [K("5", "muurtje|n=5", "het muurtje van vijf stenen"), K("7", "muurtje|n=7", "het muurtje van zeven stenen"), K("3", "muurtje|n=3", "het muurtje van drie stenen")],
    vraag: ["Nog meer muurtjes.", "Zet ze op volgorde.", "Van smal naar breed."],
    goedZin: ["Van smal naar breed."],
    uitleg: ["Tel de stenen die naast elkaar liggen.", "Liggen er meer stenen naast elkaar?", "Dan is het muurtje breder."],
    tip: ["Vooraan het muurtje met de minste stenen naast elkaar.", "Van smal naar breed."],
  }),
];

/** Wie heeft gelijk? Twee speelmatten, drie kinderen zeggen iets. */
function gelijkVraag(l: Lesgids, t: boolean, matten: string, n: number, eerste: boolean): SqulaVraag<string> {
  const kaarten = [Z("kim", "Ze zijn even groot.", "hoofd|wie=kim", "Kim"), Z("daan", "Mat 1 is groter.", "hoofd|wie=daan", "Daan"), Z("noor", "Mat 2 is groter.", "hoofd|wie=noor", "Noor")];
  return plaatjesVraag(
    l,
    {
      beeld: { groot: `matten|${matten}` },
      kaarten,
      goed: "kim",
      vraag: [
        ...(eerste ? ["Kijk naar de twee speelmatten.", "Ze zijn gemaakt van puzzelstukken."] : ["Weer twee speelmatten."]),
        "Kim zegt: ze zijn even groot.",
        "Daan zegt: mat {1:wit} is groter.",
        "Noor zegt: mat {2:wit} is groter.",
        "Wie heeft gelijk?",
      ],
      goedZin: ["Kim heeft gelijk.", `Allebei de matten hebben {${n}:wit} stukken.`, "Ze zien er anders uit, maar ze zijn even groot."],
      samen: async (l) => {
        await l.zeg(`Ik tel de stukken van mat {1:wit}.`);
        for (let i = 1; i <= n; i++) {
          zet(l, { tel: telTot(i) });
          await l.zeg(`{${i}:wit}`);
        }
        await l.zeg(`Tel jij de stukken van mat {2:wit}?`, "Zijn het er meer, minder of net zoveel?");
      },
      hulpBeeld: { tel: telTot(n) },
      tip: ["Tel de stukken van allebei de matten.", "Wie heeft gelijk?"],
    },
    t,
  );
}

const opp1: Lesdraaiboek = {
  id: "squla-meten-oppervlakte-1",
  titel: "Hoe groot is het?",
  synthesis: "Squla groep 3 · Meten en maten · Oppervlakte · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartOppervlakte,
  async speel(l) {
    await welkom(l, "tafel|k=3|r=2|kl=geel", ["Hoi!", "We gaan kijken hoe groot iets is.", "Wat is groter, wat is kleiner, en wat is even groot?", "Tegels en hokjes helpen je daarbij."], async () => {
      await l.zeg("Kijk, deze tafel ligt vol blaadjes papier.", "Ik tel ze.");
      for (let i = 1; i <= 6; i++) {
        zet(l, { tel: telTot(i) });
        await l.zeg(`{${i}:geel}`);
      }
      await l.zeg("De tafel is {6:geel} blaadjes groot.");
    });
    const fouten = await speelAlles(l, opp1Opgaven, [0, 3, 4]);
    await squlaEind(l, fouten, "Je weet hoe je kunt zien hoe groot iets is.");
  },
};

/* --- level 2: blaadjes en tegels tellen tot 24, grote en kleine blaadjes --- */

/** Twee keer dezelfde tafel (of muur): sleep het goede getal onder elke tafel. */
function vulIn(o: { k: number; r: number; d: "h" | "b"; ka: string; kb: string; kaartjes: number[]; tegel?: boolean; eerste?: boolean }): Opgave {
  const a = o.k * o.r;
  const b = a / 2;
  const ding = o.tegel ? "tegels" : "blaadjes";
  const waar = o.tegel ? "muur" : "tafel";
  const groot = `twee|k=${o.k}|r=${o.r}|d=${o.d}|ka=${o.ka}|kb=${o.kb}${o.tegel ? "|tegel=1" : ""}`;
  const kleineRij = o.k;
  const ka = NAAM_KLEUR[o.ka];
  const kb = NAAM_KLEUR[o.kb];
  /* "een rood blaadje" (het-woord), "een rode tegel" (de-woord) */
  const eenGroot = o.tegel ? `Een ${kb} tegel` : `Een ${o.kb} blaadje`;
  const ligt = o.tegel ? "zitten" : "liggen";
  return (l, t) =>
    ordenVraag(
      l,
      {
        beeld: { groot },
        juist: [String(a), String(b)],
        vast: [],
        losse: o.kaartjes.map((n) => ({ id: String(n), label: String(n), zeg: String(n), naam: `{${n}:wit}` })),
        vraag: [
          o.eerste ? `Hier zie je twee keer dezelfde ${waar}.` : `Weer twee keer dezelfde ${waar}.`,
          `Op de ene ${ligt} kleine ${ka} ${ding}.`,
          `Op de andere ${ligt} grote ${kb} ${ding}.`,
          `Hoeveel ${ding} passen er op elke ${waar}?`,
          `Sleep het goede getal onder elke ${waar}.`,
        ],
        goedZin: [`De ${waar} is {${a}:${o.ka}} ${ka} ${ding} groot.`, `En {${b}:${o.kb}} ${kb} ${ding}.`, `De ${kb} ${ding} zijn groter. Daarom passen er minder op.`],
        samen: async (l) => {
          await l.zeg(`Tel eerst de ${ka} ${ding}.`, "Ik doe de eerste rij.");
          for (let i = 1; i <= kleineRij; i++) {
            zet(l, { tel: telTot(i) });
            await l.zeg(`{${i}:${o.ka}}`);
          }
          await l.zeg(`${eenGroot} is net zo groot als twee ${ka}.`, `Er passen dus minder ${kb} ${ding} op.`);
          zet(l, { tel: [] });
          await l.zeg("Tel nu zelf verder.");
        },
        tip: [`Tel alle ${ka} ${ding}, en dan alle ${kb}.`, `Sleep het goede getal onder elke ${waar}.`],
        handje: o.eerste,
        klein: true,
        onderGroot: true,
      },
      t,
    );
}

const NAAM_KLEUR: Record<string, string> = { geel: "gele", rood: "rode", groen: "groene", blauw: "blauwe", oranje: "oranje", paars: "paarse" };

const opp2Opgaven: Opgave[] = [
  tafelTypen({ k: 6, r: 3, kl: "oranje", kleur: "oranje", eerste: true }),
  tafelTypen({ k: 3, r: 2, kl: "geel", kleur: "geel" }),
  tafelTypen({ k: 4, r: 4, kl: "groen", kleur: "groen" }),
  tafelTypen({ k: 7, r: 3, kl: "blauw", kleur: "blauw" }),
  vulIn({ k: 7, r: 2, d: "h", ka: "geel", kb: "rood", kaartjes: [12, 7, 14, 8, 16, 6, 13], eerste: true }),
  vulIn({ k: 8, r: 3, d: "b", ka: "groen", kb: "blauw", kaartjes: [20, 12, 24, 11, 22, 14, 18], tegel: true }),
  vulIn({ k: 5, r: 2, d: "h", ka: "blauw", kb: "geel", kaartjes: [5, 12, 10, 4, 6, 9, 8] }),
  vulIn({ k: 8, r: 2, d: "b", ka: "oranje", kb: "groen", kaartjes: [14, 8, 16, 6, 18, 9, 7] }),
  vulIn({ k: 9, r: 2, d: "h", ka: "geel", kb: "rood", kaartjes: [9, 20, 16, 8, 18, 11, 10] }),
  vulIn({ k: 4, r: 2, d: "b", ka: "groen", kb: "geel", kaartjes: [6, 4, 10, 8, 3, 5, 9], tegel: true }),
  tafelTypen({ k: 6, r: 4, kl: "rood", kleur: "rood" }),
  vulIn({ k: 10, r: 2, d: "b", ka: "rood", kb: "blauw", kaartjes: [22, 10, 18, 12, 20, 9, 15] }),
];

const opp2: Lesdraaiboek = {
  id: "squla-meten-oppervlakte-2",
  titel: "Hoe groot is het? (moeilijker)",
  synthesis: "Squla groep 3 · Meten en maten · Oppervlakte · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  kaarttekening: KaartOppervlakte,
  async speel(l) {
    await welkom(l, "twee|k=2|r=2|d=h|ka=groen|kb=blauw", ["Hoi!", "We meten tafels en muren.", "Met blaadjes papier en met tegels.", "Hoeveel passen er precies op?"], async () => {
      await l.zeg("Hier is twee keer dezelfde tafel.", "Ik tel de groene blaadjes.");
      for (let i = 1; i <= 4; i++) {
        zet(l, { tel: telTot(i) });
        await l.zeg(`{${i}:groen}`);
      }
      await l.zeg("Nu de blauwe blaadjes.");
      for (let i = 1; i <= 2; i++) {
        zet(l, { tel: [...telTot(4), ...telTot(i, 4)] });
        await l.zeg(`{${i}:blauw}`);
      }
      await l.zeg("De blauwe blaadjes zijn groter.", "Daarom passen er minder op.");
    });
    const fouten = await speelAlles(l, opp2Opgaven, [0, 4, 5]);
    await squlaEind(l, fouten, "Je kunt tellen hoe groot een tafel of een muur is.");
  },
};

export const LESSEN_SQULA_METEN: Lesdraaiboek[] = [pizza1, pizza2, pizza3, hoeveel1, hoeveel2, opp1, opp2];
