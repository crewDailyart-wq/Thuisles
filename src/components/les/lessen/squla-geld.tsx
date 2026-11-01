/**
 * Geld naar Squla groep 3 Rekenen (31 oktober 2026, opdracht eigenaar): per
 * Squla-oefening per level één les, met eigen zinnen, eigen verhaaltjes, eigen
 * tekeningen en andere bedragen (alleen het leerdoel, de soorten vragen, de
 * volgorde en de getallenreeks zijn van Squla):
 *
 *   De geldmachine    level 1, 2   squla-geld-geldmachine-1/2   Bliepo's spaarpot, de speelgoedwinkel
 *   Zakgeld verdienen level 1, 2   squla-geld-zakgeld-1/2       jij spaart voor een skateboard
 *   Geld              level 1, 2   squla-geld-geld-1/2          lijnen trekken en "kies er twee"
 *
 * Alle lessen in hetzelfde vlak (vlakken/squla-geld-vlak.tsx): Phaser, donker
 * (`nacht`), alles los in de ruimte zonder kaders, gloed alleen op het moment
 * dat het iets betekent (besluit Sara 31 okt). Geen mensen en geen dieren:
 * alleen dingen. Munten en briefjes zijn ALTIJD de officiële afbeeldingen
 * (ECB; munten uit public/geld/los/), nooit getekend of van Squla.
 *
 * Elke les volgt de opbouw van het Squla-level: dezelfde soorten vragen in
 * dezelfde volgorde (12 opgaven: de 10 van Squla en 2 van dezelfde soort erbij),
 * en aan het eind komen er drie vragen terug (zoals Squla de fout gemaakte
 * vragen aan het eind herhaalt; zijn er minder dan drie fout, dan vult de les
 * aan met vaste vragen). Zo heeft elke les 15 opgaven.
 *
 * Niet nagebouwd (keuze hoofdagent): de tijdsdruk en de levens van het
 * bubbelspel (hier: rustig alle goede munten aantikken die door de ruimte zweven), de disco (hier: een
 * gewone keuze uit kaartjes), de bonusspelletjes en de schatkist. Zegt Squla bij
 * een fout "goed zo", dan doet Bliepo dat niet: de hulp is overal die van
 * squla-hulp.ts.
 *
 * Groep 3 leest nog niet: Bliepo zegt elke vraag en noemt de keuzes als het
 * woorden zijn. Kaartjes met geld worden niet voorgelezen (dat verklapt het
 * antwoord); het kind telt zelf.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { squlaBegin, squlaEind, squlaVraag, zetTestAntwoord, type SqulaVraag } from "./squla-hulp";
import { SqulaGeldVlak, KaartSpaarpot, KaartSkateboard, type GDeel, type GeldProps, type GKaart } from "../vlakken/squla-geld-vlak";
import { WAARDE, isBriefje, type GeldSoort } from "../vlakken/squla-geld-soorten";
import { speelLesgeluid } from "@/lib/lesgeluiden";

/* =====================================================================
   GEDEELD
   ===================================================================== */

let teller = 0;
const volgend = () => ++teller;
let schudNr = 0;
let golfNr = 0;
let handjeNr = 0;

const Hoofd = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Een andere volgorde van de keuzes (bij een vraag die terugkomt). */
const schuif = <T,>(lijst: T[], keer: boolean) => (keer ? [...lijst.slice(1), lijst[0]] : lijst);
const som = (g: GeldSoort[]) => g.reduce((a, x) => a + WAARDE[x], 0);
/** Een bedrag in de zin: in de goudkleur van de munten. */
const e = (n: number) => `{${n}:geel}`;

/** De kleur van het getal op een munt of briefje (ECB: 5 grijs, 10 rood, 20 blauw, 50 oranje, 100 groen). */
const KLEUR: Record<GeldSoort, string> = { c50: "geel", m1: "geel", m2: "geel", b5: "wit", b10: "rood", b20: "blauw", b50: "oranje", b100: "groen" };
const getalOp = (g: GeldSoort) => (g === "c50" ? 50 : WAARDE[g]);
/** "een munt van {1} euro", "een briefje van {10} euro", "een munt van {50} cent". */
function naam(g: GeldSoort) {
  const n = `{${getalOp(g)}:${KLEUR[g]}}`;
  return g === "c50" ? `een munt van ${n} cent` : isBriefje(g) ? `een briefje van ${n} euro` : `een munt van ${n} euro`;
}
/** Hetzelfde als woord op een knop (zonder kleurtekens). */
function knopNaam(g: GeldSoort) {
  return g === "c50" ? "munt van 50 cent" : isBriefje(g) ? `briefje van ${WAARDE[g]} euro` : `munt van ${WAARDE[g]} euro`;
}

const TELWOORD = ["", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"];
/** "twee briefjes van {5} euro en een munt van {2} euro". */
function beschrijf(geld: GeldSoort[]) {
  const soorten = [...new Set(geld)];
  const delen = soorten.map((g) => {
    const n = geld.filter((x) => x === g).length;
    if (n === 1) return naam(g);
    const wat = isBriefje(g) ? "briefjes" : "munten";
    return `${TELWOORD[n]} ${wat} van {${getalOp(g)}:${KLEUR[g]}} ${g === "c50" ? "cent" : "euro"}`;
  });
  return delen.length > 1 ? `${delen.slice(0, -1).join(", ")} en ${delen[delen.length - 1]}` : delen[0];
}
/** "Twee munten van {2} euro is samen {4} euro." */
const isSamen = (geld: GeldSoort[], ook = false) => `${Hoofd(beschrijf(geld))} is ${ook ? "ook " : geld.length > 1 ? "samen " : ""}${e(som(geld))} euro.`;

/** Controle bij het laden: rekent elke opgave na (een fout in de bedragen valt meteen op). */
function klopt(waar: boolean, wat: string) {
  if (!waar) throw new Error(`squla-geld: ${wat}`);
}

const LEEG: Omit<GeldProps, "nr"> = {
  groot: null,
  kaarten: [],
  kaartenActief: false,
  zweven: false,
  uit: [],
  goed: [],
  fout: [],
  licht: [],
  verbind: null,
  geteld: null,
};

const zet = (l: Lesgids, p: Partial<GeldProps>) => l.pasVlakAan<GeldProps>(p);

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
  zet(l, { ...LEEG, nr: volgend() });
  await l.zeg("Nu komen er nog drie vragen van net terug.");
  for (const i of terug) if (!(await squlaVraag(l, opgaven[i](l, true)))) fouten++;
  return fouten;
}

/** Bliepo telt het geld in een kaartje of deel, stuk voor stuk (bovenaan staat het bedrag tot nu toe). */
async function telGeld(l: Lesgids, id: string, geld: GeldSoort[], o: { spreek: boolean; vanaf?: number; eind?: boolean }) {
  let tot = o.vanaf ?? 0;
  for (let i = 0; i < geld.length; i++) {
    tot += WAARDE[geld[i]];
    zet(l, { geteld: { id, tot: i + 1, vanaf: o.vanaf } });
    if (o.spreek) await l.zeg(`${e(tot)}.`);
    else await l.wacht(520);
  }
  zet(l, { geteld: { id, tot: geld.length + 1, vanaf: o.vanaf } });
  if (o.eind !== false) await l.zeg(`Hier ligt ${e(tot)} euro.`);
  return tot;
}

/** Bliepo telt alle kaartjes met geld na elkaar (zonder elk stuk hardop te zeggen). */
async function telKaarten(l: Lesgids, kaarten: GKaart[], uit: string[]) {
  for (const k of kaarten) {
    if (uit.includes(k.id)) continue;
    if (k.geld?.length) await telGeld(l, k.id, k.geld, { spreek: false });
    else {
      zet(l, { licht: [k.id] });
      await l.zeg(`Dit zijn ${k.zeg ?? "geen munten"}.`, "Daar kun je niet mee betalen.");
      zet(l, { licht: [] });
    }
  }
  zet(l, { geteld: null });
}

/* =====================================================================
   DE SOORTEN VRAGEN
   ===================================================================== */

type Keuze = GeldSoort[] | { tekening: string; zeg: string; aantal?: number };
const kaartVan = (k: Keuze, i: number): GKaart => (Array.isArray(k) ? { id: `k${i}`, geld: k } : { id: `k${i}`, tekening: k.tekening, aantal: k.aantal, zeg: k.zeg });
const waardeVan = (k: Keuze) => (Array.isArray(k) ? som(k) : -1);

type KiesOpties = {
  groot?: GDeel[];
  /** Bij een fout: zo ziet het tafereel eruit na de uitleg (bijvoorbeeld met het geld erbij). */
  hulpGroot?: GDeel[];
  keuzes: Keuze[];
  /** Het bedrag dat goed is (de goede kaartjes volgen uit het geld). */
  doel: number;
  /** 1 of 2 goede kaartjes (Squla: "Kies 2 antwoorden"). */
  aantal?: 1 | 2;
  vraag: string[];
  goedZin?: string[];
  /** Eigen uitleg; zonder: Bliepo telt het geld in elk kaartje. */
  samen?: (l: Lesgids, kaarten: GKaart[]) => Promise<void>;
  tip?: string[];
  /** Hoe Bliepo een kaartje noemt bij een fout (standaard het bedrag). */
  noem?: (k: GKaart) => string;
};

/** Kiezen uit kaartjes met geld (of een tekening): één goed, of twee goed. */
function kiesGeld(o: KiesOpties): Opgave {
  const aantal = o.aantal ?? 1;
  const goedIdx = o.keuzes.map((k, i) => (waardeVan(k) === o.doel ? i : -1)).filter((i) => i >= 0);
  klopt(goedIdx.length === aantal, `${o.vraag.join(" ")}: ${goedIdx.length} goede kaartjes in plaats van ${aantal}`);
  return (l, terug) => {
    const nr = volgend();
    const kaarten = schuif(o.keuzes.map(kaartVan), terug);
    const goedIds = goedIdx.map((i) => `k${i}`);
    const uit: string[] = [];
    let naSamen = false;
    const noemKaart = (id: string) => {
      const k = kaarten.find((x) => x.id === id)!;
      if (o.noem) return o.noem(k);
      return k.geld ? `${Hoofd(e(som(k.geld)))} euro` : Hoofd(k.zeg ?? "Dat");
    };
    const vraag = aantal === 2 ? [...o.vraag, "Tik op twee groepjes geld."] : o.vraag;
    const goedZin =
      o.goedZin ??
      (aantal === 2
        ? [isSamen(kaarten.find((k) => k.id === goedIds[0])!.geld!), isSamen(kaarten.find((k) => k.id === goedIds[1])!.geld!, true)]
        : [isSamen(kaarten.find((k) => k.id === goedIds[0])!.geld!)]);
    return {
      toon: () => zet(l, { ...LEEG, nr, groot: (naSamen ? (o.hulpGroot ?? o.groot) : o.groot) ?? null, kaarten, uit: [...uit] }),
      vraag,
      antwoord: async () => {
        if (aantal === 1) {
          zet(l, { kaartenActief: true, fout: [], licht: [] });
          const g = await l.wachtOpVlak<{ soort: string; id: string }>("kaart");
          zet(l, { kaartenActief: false });
          return g.id;
        }
        let gekozen: string[] = [];
        for (;;) {
          zetTestAntwoord(goedIds.find((g) => !gekozen.includes(g)) ?? goedIds[0]);
          zet(l, { kaartenActief: true, licht: [...gekozen], fout: [], goed: [] });
          const g = await l.wachtOpVlak<{ soort: string; id: string }>("kaart");
          speelLesgeluid("keuze");
          gekozen = gekozen.includes(g.id) ? gekozen.filter((x) => x !== g.id) : [...gekozen, g.id];
          if (gekozen.length === 2) break;
        }
        zet(l, { kaartenActief: false, licht: [...gekozen] });
        return [...gekozen].sort().join("+");
      },
      isGoed: (x: string) => (aantal === 1 ? x === goedIds[0] : x === [...goedIds].sort().join("+")),
      noem: (x: string) => (aantal === 1 ? noemKaart(x) : "Die twee"),
      goed: async () => {
        zet(l, { goed: goedIds, licht: [], fout: [] });
        for (const g of goedIds) zet(l, { golf: { id: g, n: ++golfNr } });
        await l.zeg("Goed zo.", ...goedZin);
        await l.wacht(300);
      },
      fout: (x: string) => {
        const ids = x.split("+");
        const mis = ids.filter((i) => !goedIds.includes(i));
        for (const m of mis) if (!uit.includes(m)) uit.push(m);
        zet(l, { licht: [], goed: ids.filter((i) => goedIds.includes(i)), fout: mis, schud: { id: mis[0] ?? ids[0], n: ++schudNr } });
      },
      samen: async () => {
        zet(l, { fout: [], goed: [], licht: [], groot: (o.hulpGroot ?? o.groot) ?? null });
        if (o.samen) await o.samen(l, kaarten);
        else {
          await l.zeg("We tellen elk groepje geld.");
          await telKaarten(l, kaarten, uit);
        }
        zet(l, { licht: [], geteld: null });
        naSamen = true;
      },
      tip: o.tip ?? ["Tel elk groepje geld.", `Waar ligt ${e(o.doel)} euro?`],
      testAntwoord: goedIds[0],
    };
  };
}

type KnopOpties = {
  groot?: GDeel[];
  hulpGroot?: GDeel[];
  opties: string[];
  goed: string;
  vraag: string[];
  goedZin: string[];
  samen: (l: Lesgids) => Promise<void>;
  tip: string[];
  /** Getallen: Bliepo noemt het antwoord als "{6} euro". */
  euro?: boolean;
};

/** Kiezen uit knoppen bij Bliepo: woorden (die Bliepo in de vraag noemt), getallen, ja/nee. */
function knopVraag(o: KnopOpties): Opgave {
  klopt(o.opties.includes(o.goed), `${o.vraag.join(" ")}: het goede antwoord staat niet bij de knoppen`);
  return (l, terug) => {
    const nr = volgend();
    let naSamen = false;
    const opties = schuif(o.opties, terug);
    return {
      toon: () => zet(l, { ...LEEG, nr, groot: (naSamen ? (o.hulpGroot ?? o.groot) : o.groot) ?? null }),
      vraag: o.vraag,
      antwoord: async () => (await l.kies(opties, { weetniet: false, direct: true })) ?? "",
      isGoed: (x: string) => x === o.goed,
      noem: (x: string) => (o.euro ? `${Hoofd(e(Number(x)))} euro` : Hoofd(x)),
      goed: async () => {
        await l.zeg("Goed zo.", ...o.goedZin);
        await l.wacht(300);
      },
      samen: async () => {
        if (o.hulpGroot) zet(l, { groot: o.hulpGroot });
        await o.samen(l);
        zet(l, { licht: [], geteld: null });
        naSamen = true;
      },
      tip: o.tip,
      testAntwoord: o.goed,
    };
  };
}

/** Getallen als knoppen: "Hoeveel euro …?" */
function getalVraag(o: Omit<KnopOpties, "opties" | "goed" | "euro"> & { opties: number[]; goed: number }): Opgave {
  return knopVraag({ ...o, opties: o.opties.map(String), goed: String(o.goed), euro: true });
}

/** De bellen: tik alle munten van één soort aan (zonder tijdsdruk en zonder levens). */
function bellenVraag(o: { bellen: (GeldSoort | "knoop")[]; zoek: GeldSoort; vraag: string[]; goedZin: string[]; uitleg: string[]; tip: string[] }): Opgave {
  return (l) => {
    const nr = volgend();
    const kaarten: GKaart[] = o.bellen.map((b, i) => (b === "knoop" ? { id: `b${i}`, tekening: "knoop", zeg: "een knoop" } : { id: `b${i}`, geld: [b] }));
    const doelen = kaarten.filter((_, i) => o.bellen[i] === o.zoek).map((k) => k.id);
    const gevonden: string[] = [];
    const noemBel = (id: string) => {
      const b = o.bellen[Number(id.slice(1))];
      return b === "knoop" ? "Een knoop" : Hoofd(naam(b));
    };
    return {
      toon: () => zet(l, { ...LEEG, nr, kaarten, zweven: true, goed: [...gevonden] }),
      vraag: o.vraag,
      antwoord: async () => {
        for (;;) {
          zetTestAntwoord(doelen.find((d) => !gevonden.includes(d)) ?? null);
          zet(l, { kaartenActief: true, fout: [], goed: [...gevonden], uit: [] });
          const g = await l.wachtOpVlak<{ soort: string; id: string }>("kaart");
          if (gevonden.includes(g.id)) continue;
          if (!doelen.includes(g.id)) {
            zet(l, { kaartenActief: false });
            return g.id;
          }
          gevonden.push(g.id);
          speelLesgeluid("munt");
          zet(l, { goed: [...gevonden], golf: { id: g.id, n: ++golfNr } });
          if (gevonden.length === doelen.length) {
            zet(l, { kaartenActief: false });
            return "klaar";
          }
        }
      },
      isGoed: (x: string) => x === "klaar",
      noem: noemBel,
      goed: async () => {
        await l.zeg("Goed zo.", ...o.goedZin);
        await l.wacht(300);
      },
      fout: (x: string) => zet(l, { fout: [x], schud: { id: x, n: ++schudNr } }),
      samen: async () => {
        zet(l, { fout: [] });
        const voorbeeld = doelen.find((d) => !gevonden.includes(d));
        await l.zeg(...o.uitleg);
        if (voorbeeld) {
          zet(l, { licht: [voorbeeld] });
          await l.zeg("Kijk, dit is er een.");
          zet(l, { licht: [] });
        }
      },
      tip: o.tip,
      testAntwoord: doelen[0],
    };
  };
}

/** Lijnen trekken: links twee groepjes geld, rechts twee bedragen of twee groepjes geld. */
function verbindVraag(o: { links: [GeldSoort[], GeldSoort[]]; rechts: [GeldSoort[] | number, GeldSoort[] | number]; vraag: string[]; goedZin?: string[]; handje?: boolean }): Opgave {
  const waarde = (r: GeldSoort[] | number) => (typeof r === "number" ? r : som(r));
  const lw = o.links.map(som);
  const rw = o.rechts.map(waarde);
  klopt(lw[0] !== lw[1] && [...lw].sort().join() === [...rw].sort().join(), `verbinden ${lw} met ${rw} klopt niet`);
  return (l, terug) => {
    const nr = volgend();
    const links: GKaart[] = o.links.map((g, i) => ({ id: `L${i}`, geld: g }));
    /* Komt de vraag terug, dan staan de bedragen rechts andersom (zoals Squla). */
    const bron = terug ? [o.rechts[1], o.rechts[0]] : o.rechts;
    const rechts: GKaart[] = bron.map((r, i) => (typeof r === "number" ? { id: `R${i}`, label: `€ ${r}`, zeg: `${r} euro` } : { id: `R${i}`, geld: r }));
    const rwaarde = bron.map(waarde);
    const juist: Record<string, string> = { L0: `R${rwaarde.indexOf(lw[0])}`, L1: `R${rwaarde.indexOf(lw[1])}` };
    const om: Record<string, string> = { [juist.L0]: "L0", [juist.L1]: "L1" };
    let lijnen: [string, string][] = [];
    let goedL: string[] = [];
    let foutL: string[] = [];
    let gekozen: string | null = null;
    let eerste = !!o.handje && !terug;
    const zetV = (actief: boolean) => zet(l, { verbind: { links, rechts, lijnen: [...lijnen], goed: [...goedL], fout: [...foutL], gekozen, actief } });
    const zinnen = o.goedZin ?? [`${Hoofd(e(lw[0]))} euro en ${e(lw[1])} euro.`];
    return {
      toon: () => {
        lijnen = [];
        goedL = [];
        foutL = [];
        gekozen = null;
        zet(l, { ...LEEG, nr, verbind: { links, rechts, lijnen: [], goed: [], fout: [], gekozen: null, actief: false } });
      },
      vraag: o.vraag,
      antwoord: async () => {
        if (eerste) {
          eerste = false;
          zet(l, { handje: ++handjeNr });
        }
        while (lijnen.length < 2) {
          const openL = links.find((d) => !lijnen.some(([a]) => a === d.id))!;
          zetTestAntwoord(gekozen ? (gekozen.startsWith("L") ? juist[gekozen] : om[gekozen]) : openL.id);
          zetV(true);
          const g = await l.wachtOpVlak<{ soort: string; id?: string; links?: string; rechts?: string }>(["links", "rechts", "lijn"]);
          let paar: [string, string] | null = null;
          if (g.soort === "lijn" && g.links && g.rechts) paar = [g.links, g.rechts];
          else if (g.id) {
            const id = g.id;
            if (gekozen && gekozen[0] !== id[0]) paar = id.startsWith("L") ? [id, gekozen] : [gekozen, id];
            else gekozen = gekozen === id ? null : id;
          }
          if (paar) {
            const [a, r] = paar;
            lijnen = [...lijnen.filter(([x, y]) => x !== a && y !== r), paar];
            gekozen = null;
            speelLesgeluid("schuif");
          }
        }
        zetV(false);
        return lijnen;
      },
      isGoed: (x: [string, string][]) => x.length === 2 && x.every(([a, r]) => juist[a] === r),
      noem: () => "Die lijnen",
      goed: async () => {
        goedL = ["L0", "L1"];
        foutL = [];
        zetV(false);
        zet(l, { golf: { id: "L0", n: ++golfNr } });
        await l.zeg("Goed zo.", ...zinnen);
        await l.wacht(300);
      },
      fout: (x: [string, string][]) => {
        goedL = x.filter(([a, r]) => juist[a] === r).map(([a]) => a);
        foutL = x.filter(([a, r]) => juist[a] !== r).map(([a]) => a);
        zetV(false);
      },
      samen: async () => {
        lijnen = [];
        goedL = [];
        foutL = [];
        zetV(false);
        await l.zeg("We tellen eerst het geld links.");
        await telGeld(l, "L0", o.links[0], { spreek: true });
        await telGeld(l, "L1", o.links[1], { spreek: true });
        if (rechts[0].geld) {
          await l.zeg("Nu het geld rechts.");
          await telGeld(l, "R0", rechts[0].geld, { spreek: false });
          await telGeld(l, "R1", rechts[1].geld!, { spreek: false });
        }
        zet(l, { geteld: null });
        await l.zeg("Wat hoort bij elkaar?");
      },
      tip: rechts[0].geld ? ["Tel elk groepje geld.", "Zoek twee groepjes met evenveel geld."] : ["Tel elk groepje geld.", "Welk bedrag hoort erbij?"],
      testAntwoord: "L0",
    };
  };
}

/** Het welkom: het vlak verschijnt, dan "Kun je dit al?". */
async function welkom(l: Lesgids, beeld: Partial<GeldProps>, vooraf: GeldSoort[], zinnen: string[], uitleg: () => Promise<void>, voorbeeld?: Opgave) {
  l.vlak<GeldProps>(SqulaGeldVlak, { ...LEEG, nr: volgend(), vooraf, ...beeld });
  speelLesgeluid("verschijn");
  await l.wacht(500);
  await squlaBegin(l, {
    welkom: zinnen,
    /* Na "Nee" begint de uitleg weer met het beeld waar hij op rekent (het voorbeeld verdwijnt). */
    uitleg: voorbeeld
      ? async () => {
          zet(l, { ...LEEG, nr: volgend(), vooraf, ...beeld });
          await uitleg();
        }
      : uitleg,
    /* Het beginscherm laat de eerste opgave van de les zien (BOUWREGELS 4.1). */
    ...(voorbeeld ? { voorbeeld: () => voorbeeld(l, false).toon?.() } : {}),
  });
}

/* =====================================================================
   DE GELDMACHINE (Squla) → BLIEPO'S SPAARPOT EN DE SPEELGOEDWINKEL
   ===================================================================== */

const SPAARPOT: GDeel = { soort: "tekening", tekening: "spaarpot" };
const eruit = (g: GeldSoort): GDeel[] => [SPAARPOT, { soort: "pijl" }, { soort: "geld", id: "geld", geld: [g] }];
const erin = (g: GeldSoort): GDeel[] => [{ soort: "geld", id: "geld", geld: [g] }, { soort: "pijl" }, SPAARPOT];

/** Wat Bliepo over een munt of briefje vertelt (op basis van de uitleg van Squla, in eigen woorden). */
const OVER: Record<GeldSoort, string[]> = {
  m1: [`Een munt van ${e(1)} euro is rond.`, `Er staat een grote ${e(1)} op.`, "Hij is zilver in het midden, met een gouden rand."],
  m2: [`Een munt van ${e(2)} euro is ook rond.`, `Er staat een grote ${e(2)} op.`, "Hij is goud in het midden, met een zilveren rand."],
  c50: [`Een munt van {50:geel} cent is goud.`, "Hij is minder waard dan een euro."],
  b5: ["Een briefje is een rechthoek van papier.", "Op een briefje van {5:wit} euro staat een {5:wit}.", "Het is grijs."],
  b10: ["Een briefje is een rechthoek van papier.", "Op een briefje van {10:rood} euro staat {10:rood}.", "Het is rood."],
  b20: ["Een briefje is een rechthoek van papier.", "Op een briefje van {20:blauw} euro staat {20:blauw}.", "Het is blauw."],
  b50: ["Het briefje van {50:oranje} euro is oranje."],
  b100: ["Het briefje van {100:groen} euro is groen."],
};

/** Waar zie je …? Drie kaartjes met elk één munt of briefje. */
function waarZie(g: GeldSoort, keuzes: GeldSoort[], begin: string[], goedZin: string[]): Opgave {
  klopt(keuzes.filter((k) => k === g).length === 1, `waar zie je ${g}`);
  const munt = !isBriefje(g);
  return kiesGeld({
      groot: [SPAARPOT],
      keuzes: keuzes.map((k) => [k]),
      doel: WAARDE[g],
      vraag: [...begin, `Waar zie je ${naam(g)}?`],
      goedZin,
      noem: (k) => Hoofd(naam(k.geld![0])),
      samen: async (l2, kaarten) => {
        const soort = kaarten.filter((k) => isBriefje(k.geld![0]) === !munt).map((k) => k.id);
        if (soort.length) {
          zet(l2, { licht: soort });
          await l2.zeg(munt ? "Kijk, dit zijn munten." : "Kijk, dit zijn briefjes.");
        }
        zet(l2, { licht: [] });
        await l2.zeg(...OVER[g]);
      },
      tip: [munt ? `Zoek de munt met een ${e(WAARDE[g])} erop.` : `Zoek het briefje met {${WAARDE[g]}:${KLEUR[g]}} erop.`],
  });
}

/** Wat is dit? Een munt of briefje bij de spaarpot, en drie woorden om uit te kiezen. */
function watIsDit(o: { beeld: GDeel[]; opties: (GeldSoort | "knoop")[]; goed: GeldSoort; vraag: string[]; goedZin: string[]; samen: string[]; tip: string[] }): Opgave {
  const woord = (x: GeldSoort | "knoop") => (x === "knoop" ? "knoop" : knopNaam(x));
  const zeg = (x: GeldSoort | "knoop") => (x === "knoop" ? "een knoop" : naam(x));
  const keuzes = o.opties.map(zeg);
  return knopVraag({
    groot: o.beeld,
    opties: o.opties.map(woord),
    goed: woord(o.goed),
    vraag: [...o.vraag, `Is het ${keuzes.slice(0, -1).join(", ")}, of ${keuzes[keuzes.length - 1]}?`],
    goedZin: o.goedZin,
    samen: async (l) => {
      zet(l, { licht: ["geld"] });
      await l.zeg(...o.samen);
      zet(l, { licht: [] });
    },
    tip: o.tip,
  });
}

const geldmachine1Opgaven: Opgave[] = [
  waarZie("m1", ["m2", "b5", "m1"], ["Ik schud mijn spaarpot.", `Er valt een munt van ${e(1)} euro uit.`], ["Een munt is rond.", `Op deze munt staat een ${e(1)}.`]),
  waarZie("m2", ["m1", "m2", "b20"], ["Ik schud nog een keer.", `Kijk, een munt van ${e(2)} euro!`], ["Deze munt is goud in het midden.", "De rand is zilver.", `En er staat een ${e(2)} op.`]),
  waarZie("b5", ["b50", "c50", "b5"], ["Nu valt er een briefje uit.", "Een briefje van {5:wit} euro."], ["Een briefje is een rechthoek.", "Een briefje heet ook wel een biljet.", "Op dit briefje staat een {5:wit}."]),
  watIsDit({
    beeld: eruit("b10"),
    opties: ["b100", "m1", "b10"],
    goed: "b10",
    vraag: ["Kijk wat er nu uit mijn spaarpot valt.", "Wat is dit?"],
    goedZin: ["Op het briefje staat {10:rood}.", "Het briefje van {10:rood} euro is rood."],
    samen: ["Kijk goed.", "Is het rond? Nee, het is een rechthoek.", "Dus het is een briefje.", "Kijk naar het getal: een {1:rood} en een {0:rood}."],
    tip: ["Een munt is rond. Een briefje is een rechthoek.", "Kijk naar het getal op het briefje."],
  }),
  waarZie("b20", ["b10", "m2", "b20"], ["Nog één keer schudden.", "Er valt een briefje van {20:blauw} euro uit."], ["Het briefje van {20:blauw} euro is blauw.", "Er staat {20:blauw} op."]),
  watIsDit({
    beeld: erin("m1"),
    opties: ["m1", "knoop", "m2"],
    goed: "m1",
    vraag: ["Nu stop ik het geld weer terug in mijn spaarpot.", "Eerst deze munt.", "Wat is het?"],
    goedZin: [`Een munt van ${e(1)} euro is zilver in het midden.`, "De rand is goud."],
    samen: ["Een knoop heeft gaatjes. Dit is geen knoop.", "Het is een munt.", `Een munt van ${e(2)} euro is goud in het midden.`, `Een munt van ${e(1)} euro is zilver in het midden.`, "Hoe ziet het midden van deze munt eruit?"],
    tip: ["Kijk naar het getal op de munt."],
  }),
  watIsDit({
    beeld: erin("b5"),
    opties: ["b5", "b50", "c50"],
    goed: "b5",
    vraag: ["Dan dit briefje.", "Wat is het?"],
    goedZin: ["Het briefje van {5:wit} euro is grijs.", "Er staat een {5:wit} op."],
    samen: ["Is het rond? Nee.", "Het is een briefje, dus het is geen munt.", "Kijk welk getal erop staat.", "Staat er een {5:wit}, of een {5:oranje} en een {0:oranje}?"],
    tip: ["Kijk naar het getal op het briefje."],
  }),
  bellenVraag({
    bellen: ["m1", "m2", "m1", "c50", "knoop", "m1"],
    zoek: "m1",
    vraag: ["Oei, mijn geld zweeft door de ruimte!", `Er zweven drie munten van ${e(1)} euro.`, `Tik op alle munten van ${e(1)} euro.`],
    goedZin: ["Je vond ze alle drie.", `Een munt van ${e(1)} euro is zilver in het midden, met een gouden rand.`],
    uitleg: ["Kijk naar het midden van elke munt.", `Een munt van ${e(1)} euro is zilver in het midden.`, `En er staat een ${e(1)} op.`],
    tip: [`Zoek de munten met een ${e(1)} erop.`],
  }),
  waarZie("b10", ["b20", "b100", "b10"], ["Ik stop nog een briefje terug.", "Het is rood."], ["Het briefje van {10:rood} euro is rood.", "Nog één briefje, dan is alles terug."]),
  watIsDit({
    beeld: erin("b20"),
    opties: ["b20", "b10", "b50"],
    goed: "b20",
    vraag: ["Het laatste briefje gaat terug.", "Wat is het?"],
    goedZin: ["Het briefje van {20:blauw} euro is blauw.", "Alles zit weer in mijn spaarpot."],
    samen: ["Kijk naar de kleur.", "Het briefje van {10:rood} euro is rood.", "Het briefje van {50:oranje} euro is oranje.", "Welke kleur heeft dit briefje? En welk getal staat erop?"],
    tip: ["Kijk naar het getal op het briefje."],
  }),
  watIsDit({
    beeld: erin("m2"),
    opties: ["m1", "m2", "c50"],
    goed: "m2",
    vraag: ["Oh, er lag nog een munt op tafel.", "Wat is het?"],
    goedZin: ["Goud in het midden, zilver aan de rand.", `Dat is een munt van ${e(2)} euro.`],
    samen: ["Kijk naar het midden van de munt.", `Een munt van ${e(1)} euro is zilver in het midden.`, `Een munt van ${e(2)} euro is goud in het midden.`, "Kijk ook naar het getal."],
    tip: ["Kijk naar het getal op de munt."],
  }),
  waarZie("b5", ["b10", "b5", "b20"], ["Ik pak nog drie briefjes uit mijn spaarpot."], ["Het briefje van {5:wit} euro is grijs.", "Er staat een {5:wit} op."]),
];

const geldmachine1: Lesdraaiboek = {
  id: "squla-geld-geldmachine-1",
  titel: "Munten en briefjes",
  synthesis: "Squla groep 3 · Geld · De geldmachine · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  kaarttekening: KaartSpaarpot,
  voorwerpen: ["spaarpot", "knoop"],
  async speel(l) {
    await welkom(l, { groot: [SPAARPOT] }, ["m1", "m2", "c50", "b5", "b10", "b20", "b50", "b100"], ["Er valt geld uit de spaarpot.", `Waar zie je een munt van ${e(1)} euro?`], async () => {
      zet(l, { ...LEEG, kaarten: [{ id: "u0", geld: ["m1"] }, { id: "u1", geld: ["b5"] }] });
      zet(l, { licht: ["u0"] });
      await l.zeg("Dit is een munt.", "Een munt is rond.", "Op een munt staat hoeveel hij waard is.");
      zet(l, { licht: ["u1"] });
      await l.zeg("Dit is een briefje.", "Een briefje is een rechthoek van papier.", "Op een briefje staat ook hoeveel het waard is.");
      zet(l, { licht: [] });
    }, geldmachine1Opgaven[0]);
    const fouten = await speelAlles(l, geldmachine1Opgaven, [0, 3, 4]);
    await squlaEind(l, fouten, "Je kent de munten en de briefjes.");
  },
};

/* --- level 2: de speelgoedwinkel --- */

const speelgoed = (tekening: string, prijs: number): GDeel => ({ soort: "tekening", tekening, prijs });

const geldmachine2Opgaven: Opgave[] = [
  kiesGeld({
    groot: [speelgoed("springtouw", 3)],
    keuzes: [["m2"], ["m1", "m1", "m1"], ["b5"]],
    doel: 3,
    vraag: ["Kijk, een springtouw.", `Het springtouw kost ${e(3)} euro.`, `Waar ligt ${e(3)} euro?`],
    goedZin: [`Drie munten van ${e(1)} euro is samen ${e(3)} euro.`, `Je kunt ook betalen met een munt van ${e(2)} en een munt van ${e(1)} euro.`],
  }),
  kiesGeld({
    groot: [speelgoed("bal", 5)],
    keuzes: [["m2", "m2"], ["b10"], ["m2", "m2", "m1"]],
    doel: 5,
    vraag: ["Kijk, een bal.", `De bal kost ${e(5)} euro.`, `Waar ligt ${e(5)} euro?`],
    goedZin: [`${e(2)} en ${e(2)} en ${e(1)} is samen ${e(5)} euro.`, "Je kunt ook betalen met een briefje van {5:wit} euro."],
  }),
  kiesGeld({
    groot: [speelgoed("speelgoedauto", 4)],
    keuzes: [["m2", "m2"], ["m2", "m1"], ["m1", "m1", "m1", "m1"], ["m2", "m1", "m2"]],
    doel: 4,
    aantal: 2,
    vraag: [`Het autootje kost ${e(4)} euro.`, "Je kunt op twee manieren betalen.", `Waar ligt ${e(4)} euro?`],
    goedZin: [`Twee munten van ${e(2)} euro is samen ${e(4)} euro.`, `Vier munten van ${e(1)} euro is ook ${e(4)} euro.`, "Je kunt op verschillende manieren betalen."],
  }),
  kiesGeld({
    groot: [speelgoed("vlieger", 7)],
    keuzes: [["b5", "m2"], ["b5", "m1"], ["b10"]],
    doel: 7,
    vraag: ["Wat een mooie vlieger.", `De vlieger kost ${e(7)} euro.`, `Waar ligt ${e(7)} euro?`],
    goedZin: [`${e(5)} euro en ${e(2)} euro is samen ${e(7)} euro.`, `Je kunt ook met zeven munten van ${e(1)} euro betalen.`],
  }),
  kiesGeld({
    groot: [speelgoed("raketje", 9)],
    keuzes: [["b5", "b5"], ["b5", "m2", "m2"], ["m2", "m2", "m2", "m2"]],
    doel: 9,
    vraag: ["Kijk, een speelgoedraket.", `De raket kost ${e(9)} euro.`, `Waar ligt ${e(9)} euro?`],
    goedZin: [`${e(5)} en ${e(2)} en ${e(2)} is samen ${e(9)} euro.`],
  }),
  kiesGeld({
    groot: [speelgoed("bootje", 6)],
    keuzes: [["b5", "m1"], ["b5", "m2"], ["m2", "m2", "m2"], ["m2", "m2", "m1"]],
    doel: 6,
    aantal: 2,
    vraag: [`Het bootje kost ${e(6)} euro.`, `Waar ligt ${e(6)} euro?`],
  }),
  kiesGeld({
    groot: [speelgoed("treintje", 8)],
    keuzes: [["b5", "b5"], ["b5", "m2", "m1"], ["m2", "m2", "m2", "m2"], ["b5", "m2"]],
    doel: 8,
    aantal: 2,
    vraag: ["Ik betaal met precies genoeg geld.", `Waar ligt ${e(8)} euro?`],
  }),
  kiesGeld({
    keuzes: [["b5", "b5"], ["m2", "m2", "m2", "m1"], ["b5", "m2", "m1", "m1"]],
    doel: 9,
    vraag: [`Ik heb ${e(9)} euro in mijn portemonnee.`, `Waar ligt ${e(9)} euro?`],
    goedZin: [`${e(5)} plus ${e(2)} plus ${e(1)} plus ${e(1)} is ${e(9)} euro.`, "Wat kan ik daarvan kopen?"],
  }),
  knopVraag({
    groot: [speelgoed("vlieger", 7), speelgoed("bal", 5)],
    opties: ["Ja", "Nee"],
    goed: "Nee",
    vraag: [`Ik heb ${e(9)} euro.`, "Kan ik de vlieger en de bal allebei kopen?"],
    goedZin: [`${e(7)} en ${e(5)} is samen ${e(12)} euro.`, `Ik heb maar ${e(9)} euro. Dat is te weinig.`, "Wat kan ik dan wel kopen?"],
    samen: async (l) => {
      await l.zeg(`De vlieger kost ${e(7)} euro.`, `De bal kost ${e(5)} euro.`, `Tel verder vanaf ${e(7)}: ${e(8)}, ${e(9)}, ${e(10)}, ${e(11)}, ${e(12)}.`, `Is dat meer dan ${e(9)} euro, of minder?`);
    },
    tip: [`Tel de twee prijzen bij elkaar.`, `Heb ik genoeg met ${e(9)} euro?`],
  }),
  kiesGeld({
    groot: [speelgoed("speelgoedauto", 4), { soort: "plus" }, speelgoed("springtouw", 3)],
    keuzes: [["b5", "m2"], ["b5", "m1"], ["m2", "m2", "m2", "m2"]],
    doel: 7,
    vraag: ["Ik koop het autootje en het springtouw.", "Hoeveel kost dat samen?", "Waar ligt dat geld?"],
    goedZin: [`${e(4)} en ${e(3)} is samen ${e(7)} euro.`, `Ik had ${e(9)} euro. Dan houd ik ${e(2)} euro over.`],
    samen: async (l, kaarten) => {
      await l.zeg(`Het autootje kost ${e(4)} euro.`, `Het springtouw kost ${e(3)} euro.`, `Tel verder vanaf ${e(4)}: ${e(5)}, ${e(6)}, en nog één.`);
      await l.zeg("Nu tellen we elk groepje geld.");
      await telKaarten(l, kaarten, []);
    },
    tip: [`Tel ${e(4)} en ${e(3)} bij elkaar.`, "Waar ligt dat geld?"],
  }),
  knopVraag({
    groot: [speelgoed("bal", 5), speelgoed("speelgoedauto", 4)],
    opties: ["Ja", "Nee"],
    goed: "Ja",
    vraag: [`Stel, je hebt ${e(9)} euro.`, "Kun je de bal en het autootje allebei kopen?"],
    goedZin: [`${e(5)} en ${e(4)} is samen ${e(9)} euro.`, `Je hebt precies ${e(9)} euro. Dat past precies!`],
    samen: async (l) => {
      await l.zeg(`De bal kost ${e(5)} euro.`, `Het autootje kost ${e(4)} euro.`, `Tel verder vanaf ${e(5)}: ${e(6)}, ${e(7)}, ${e(8)}, ${e(9)}.`, `Heb je genoeg met ${e(9)} euro?`);
    },
    tip: ["Tel de twee prijzen bij elkaar.", `Is dat meer dan ${e(9)} euro?`],
  }),
  kiesGeld({
    groot: [speelgoed("voetbal", 10)],
    keuzes: [["b5", "b5"], ["b5", "m2", "m2"], ["b10", "b5"]],
    doel: 10,
    vraag: ["Kijk, een voetbal.", `De voetbal kost ${e(10)} euro.`, `Waar ligt ${e(10)} euro?`],
    goedZin: [`Twee briefjes van {5:wit} euro is samen ${e(10)} euro.`, "Je kunt ook betalen met een briefje van {10:rood} euro."],
  }),
];

const geldmachine2: Lesdraaiboek = {
  id: "squla-geld-geldmachine-2",
  titel: "Munten en briefjes (moeilijker)",
  synthesis: "Squla groep 3 · Geld · De geldmachine · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  kaarttekening: KaartSpaarpot,
  voorwerpen: ["spaarpot", "springtouw", "bal", "speelgoedauto", "vlieger", "raketje", "bootje", "treintje", "voetbal"],
  async speel(l) {
    await welkom(l, { groot: [SPAARPOT] }, ["m1", "m2", "b5", "b10"], [`In de speelgoedwinkel kost het springtouw ${e(3)} euro.`, `Waar ligt ${e(3)} euro?`], async () => {
      zet(l, { ...LEEG, groot: [speelgoed("treintje", 8)], kaarten: [{ id: "u0", geld: ["b5", "m2", "m1"] }] });
      await l.zeg(`Op het kaartje staat wat iets kost: ${e(8)} euro.`, "Je telt het geld bij elkaar.", "Begin bij het briefje.");
      await telGeld(l, "u0", ["b5", "m2", "m1"], { spreek: true, eind: false });
      await l.zeg(`Samen is dit ${e(8)} euro.`, "Dat is precies genoeg.");
      zet(l, { geteld: null });
    }, geldmachine2Opgaven[0]);
    const fouten = await speelAlles(l, geldmachine2Opgaven, [0, 2, 8]);
    await squlaEind(l, fouten, "Je kunt betalen met munten en briefjes.");
  },
};

/* =====================================================================
   ZAKGELD VERDIENEN (Squla) → JIJ SPAART VOOR EEN SKATEBOARD
   Geen mensen in beeld of in de zinnen (besluit Sara 31 okt): het kind zelf
   ("je") doet de klusjes. Squla's "ze krijgen allebei 2 euro" wordt "voor elke
   klus krijg je 2 euro" (twee klusjes): dezelfde som, en het past bij de vraag.
   Het geld van twee mensen wordt het geld in je spaarpot en in je portemonnee.
   ===================================================================== */

const tek = (tekening: string): GDeel => ({ soort: "tekening", tekening });
const geldDeel = (id: string, geld: GeldSoort[], kruis?: number[]): GDeel => ({ soort: "geld", id, geld, kruis });
const SKATE = (prijs: number): GDeel => ({ soort: "tekening", tekening: "skateboard", prijs });

/** Twee klusjes, voor elke klus evenveel: hoeveel is dat bij elkaar? */
function tweeKlusjes(o: { klus: [string, string]; elk: GeldSoort[]; keuzes: GeldSoort[][]; vraag: string[] }): Opgave {
  const n = som(o.elk);
  return kiesGeld({
    groot: [tek(o.klus[0]), tek(o.klus[1])],
    hulpGroot: [tek(o.klus[0]), geldDeel("s", o.elk), { soort: "plus" }, tek(o.klus[1]), geldDeel("n", o.elk)],
    keuzes: o.keuzes,
    doel: n * 2,
    vraag: [...o.vraag, `Voor elke klus krijg je ${e(n)} euro.`, "Hoeveel is dat bij elkaar?", "Waar ligt dat geld?"],
    goedZin: [`${Hoofd(e(n))} euro en ${e(n)} euro is samen ${e(n * 2)} euro.`],
    samen: async (l) => {
      await l.zeg(`Voor de eerste klus krijg je ${e(n)} euro.`, `Voor de tweede klus ook ${e(n)} euro.`, "We tellen het samen.");
      await telGeld(l, "s", o.elk, { spreek: true, eind: false });
      await telGeld(l, "n", o.elk, { spreek: true, eind: false, vanaf: n });
      zet(l, { geteld: null });
      await l.zeg("Waar ligt evenveel geld?");
    },
    tip: [`Tel ${e(n)} en ${e(n)} bij elkaar.`, "Waar ligt dat geld?"],
  });
}

/** Het geld in je spaarpot en in je portemonnee: hoeveel is dat bij elkaar? */
function potEnPortemonnee(o: { pot: GeldSoort[]; porte: GeldSoort[]; opties: number[]; begin: string[]; slot: string[] }): Opgave {
  const a = som(o.pot);
  const b = som(o.porte);
  return getalVraag({
    groot: [tek("spaarpot"), geldDeel("gs", o.pot), tek("portemonnee"), geldDeel("gn", o.porte)],
    opties: o.opties,
    goed: a + b,
    vraag: [...o.begin, "Dit geld zit in je spaarpot.", "En dit geld zit in je portemonnee.", "Hoeveel euro heb je bij elkaar?"],
    goedZin: [`In je spaarpot zit ${e(a)} euro. In je portemonnee ${e(b)} euro.`, `Bij elkaar is dat ${e(a + b)} euro.`, ...o.slot],
    samen: async (l) => {
      await l.zeg("Tel eerst het geld uit je spaarpot.");
      await telGeld(l, "gs", o.pot, { spreek: true, eind: false });
      await l.zeg(`Dat is ${e(a)} euro.`, "Tel nu verder met het geld uit je portemonnee.", "Begin bij het briefje.");
      zet(l, { geteld: null });
    },
    tip: [`Begin bij ${e(a)}.`, "Tel het geld uit je portemonnee erbij."],
  });
}

const zakgeld1Opgaven: Opgave[] = [
  tweeKlusjes({ klus: ["bezem", "gieter"], elk: ["m2"], keuzes: [["m2"], ["m2", "m2"], ["b5"]], vraag: ["Je veegt de stoep en je geeft de planten water."] }),
  tweeKlusjes({ klus: ["emmer", "bed"], elk: ["m2", "m1"], keuzes: [["b5", "m2"], ["m2", "m2", "m1"], ["b5", "m1"]], vraag: ["Je wast de fiets en je maakt je bed op."] }),
  potEnPortemonnee({ pot: ["m2", "m2"], porte: ["b5", "m1"], opties: [11, 9, 10], begin: [], slot: [] }),
  kiesGeld({
    groot: [SKATE(20)],
    keuzes: [["b10", "b10"], ["b10", "b5", "m2"], ["b5", "b5", "b5", "b5"], { tekening: "schelp", aantal: 3, zeg: "schelpen" }],
    doel: 20,
    aantal: 2,
    vraag: ["Kijk, dit skateboard wil je kopen.", `Het kost ${e(20)} euro.`, `Waar ligt ${e(20)} euro?`],
    goedZin: [`Twee briefjes van {10:rood} euro is samen ${e(20)} euro.`, `Vier briefjes van {5:wit} euro is ook ${e(20)} euro.`, "En met schelpen kun je niet betalen!"],
    noem: (k) => (k.geld ? `${Hoofd(e(som(k.geld)))} euro` : "Schelpen"),
  }),
  getalVraag({
    groot: [tek("doos")],
    hulpGroot: [geldDeel("oud", ["b10"]), { soort: "plus" }, geldDeel("nieuw", ["b5"])],
    opties: [15, 14, 16],
    goed: 15,
    vraag: ["Je ruimt de schuur op.", `Daarvoor krijg je ${e(5)} euro.`, `Je had al ${e(10)} euro.`, `Hoeveel is ${e(10)} euro en ${e(5)} euro samen?`],
    goedZin: [`${Hoofd(e(10))} euro en ${e(5)} euro is samen ${e(15)} euro.`],
    samen: async (l) => {
      await l.zeg(`Kijk: ${e(10)} euro.`, `En er komt ${e(5)} euro bij.`, `Begin bij ${e(10)} en tel vijf verder.`, `${Hoofd(e(11))}, ${e(12)}, ${e(13)}, ${e(14)}, en nog één.`);
    },
    tip: [`Begin bij ${e(10)}.`, "Tel er vijf bij."],
  }),
  kiesGeld({
    groot: [SKATE(20), geldDeel("heb", ["b10", "b5"])],
    keuzes: [["b5"], ["b10"], ["m2"]],
    doel: 5,
    vraag: [`Je hebt nu ${e(15)} euro.`, `Het skateboard kost ${e(20)} euro.`, `Hoeveel moet er nog bij ${e(15)} om bij ${e(20)} te komen?`],
    goedZin: [`${Hoofd(e(15))} euro en ${e(5)} euro is ${e(20)} euro.`, `Er moet nog ${e(5)} euro bij.`],
    noem: (k) => Hoofd(naam(k.geld![0])),
    samen: async (l) => {
      await telGeld(l, "heb", ["b10", "b5"], { spreek: false, eind: false });
      await l.zeg(`Je hebt ${e(15)} euro.`, `We tellen verder tot ${e(20)}.`, `${Hoofd(e(16))}, ${e(17)}, ${e(18)}, ${e(19)}, ${e(20)}.`, "Hoeveel stapjes waren dat?");
      zet(l, { geteld: null });
    },
    tip: [`Tel verder vanaf ${e(15)} tot ${e(20)}.`],
  }),
  getalVraag({
    groot: [tek("bord"), geldDeel("oud", ["b10", "b5"]), { soort: "plus" }, geldDeel("nieuw", ["m2"])],
    opties: [16, 17, 19],
    goed: 17,
    vraag: ["Je doet de afwas.", `Daarvoor krijg je ${e(2)} euro.`, "Hoeveel geld heb je nu?", "Kijk maar naar het plaatje."],
    goedZin: [`${Hoofd(e(15))} euro en ${e(2)} euro is samen ${e(17)} euro.`],
    samen: async (l) => {
      await l.zeg("Tel eerst het geld dat je al had.");
      await telGeld(l, "oud", ["b10", "b5"], { spreek: true, eind: false });
      await l.zeg(`Je had ${e(15)} euro.`, `Tel nu de munt van ${e(2)} euro erbij.`);
      zet(l, { geteld: null });
    },
    tip: [`Begin bij ${e(15)}.`, `Tel er ${e(2)} bij.`],
  }),
  kiesGeld({
    groot: [tek("schoen")],
    keuzes: [["b10", "b5", "m2", "m1"], ["b10", "b5", "m1"], ["b10", "b5", "m2", "m2"]],
    doel: 18,
    vraag: ["Je zet alle schoenen netjes in de gang.", `Je krijgt ${e(1)} euro.`, `Je had ${e(17)} euro.`, "Waar ligt het geld dat je nu hebt?"],
    goedZin: [`${Hoofd(e(17))} euro en ${e(1)} euro is samen ${e(18)} euro.`],
  }),
  kiesGeld({
    groot: [SKATE(20), geldDeel("heb", ["b10", "b5", "m2", "m1"])],
    keuzes: [["m1"], ["m2"], ["b5"]],
    doel: 2,
    vraag: [`Je hebt nu ${e(18)} euro.`, `Het skateboard kost ${e(20)} euro.`, `Hoeveel moet er nog bij ${e(18)} om bij ${e(20)} te komen?`],
    goedZin: [`${Hoofd(e(18))} euro en ${e(2)} euro is ${e(20)} euro.`, `Er moet nog ${e(2)} euro bij.`],
    noem: (k) => Hoofd(naam(k.geld![0])),
    samen: async (l) => {
      await telGeld(l, "heb", ["b10", "b5", "m2", "m1"], { spreek: false, eind: false });
      await l.zeg(`Je hebt ${e(18)} euro.`, `We tellen verder tot ${e(20)}.`, `${Hoofd(e(19))}, ${e(20)}.`, "Hoeveel stapjes waren dat?");
      zet(l, { geteld: null });
    },
    tip: [`Tel verder vanaf ${e(18)} tot ${e(20)}.`],
  }),
  getalVraag({
    groot: [tek("jas")],
    hulpGroot: [geldDeel("oud", ["b10", "b5", "m2", "m1"]), { soort: "plus" }, geldDeel("nieuw", ["m2"])],
    opties: [19, 20, 18],
    goed: 20,
    vraag: ["Je hangt alle jassen netjes op.", `Daarvoor krijg je ${e(2)} euro.`, `Je had ${e(18)} euro.`, `Hoeveel is ${e(18)} euro en ${e(2)} euro samen?`],
    goedZin: [`${Hoofd(e(18))} euro en ${e(2)} euro is samen ${e(20)} euro.`, "Nu heb je genoeg voor het skateboard!"],
    samen: async (l) => {
      await l.zeg(`Kijk: je had ${e(18)} euro.`, `Er komt ${e(2)} euro bij.`, `Begin bij ${e(18)} en tel twee verder.`);
    },
    tip: [`Begin bij ${e(18)}.`, "Tel er twee bij."],
  }),
  kiesGeld({
    groot: [SKATE(20)],
    keuzes: [["b20"], ["b10", "b5", "m2", "m2"], ["b10", "b5"]],
    doel: 20,
    vraag: [`Je hebt nu ${e(20)} euro.`, `Waar ligt ${e(20)} euro?`],
    goedZin: ["Een briefje van {20:blauw} euro is ook " + e(20) + " euro.", "Dat is net zoveel als al je munten en briefjes samen."],
  }),
  potEnPortemonnee({ pot: ["b10", "m2", "m2"], porte: ["b5", "m1"], opties: [18, 20, 19], begin: ["Je telt je geld nog één keer."], slot: ["Morgen ga je het skateboard kopen."] }),
];

const zakgeld1: Lesdraaiboek = {
  id: "squla-geld-zakgeld-1",
  titel: "Zakgeld sparen",
  synthesis: "Squla groep 3 · Geld · Zakgeld verdienen · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  kaarttekening: KaartSkateboard,
  voorwerpen: ["spaarpot", "portemonnee", "skateboard", "bezem", "gieter", "emmer", "bed", "schelp", "doos", "bord", "schoen", "jas"],
  async speel(l) {
    await welkom(l, { groot: [tek("spaarpot"), SKATE(20)] }, ["m1", "m2", "b5", "b10", "b20"], [`Voor elk klusje krijg je ${e(2)} euro.`, "Hoeveel is dat bij elkaar?"], async () => {
      zet(l, { ...LEEG, groot: [tek("bezem"), geldDeel("s", ["m1"]), { soort: "plus" }, tek("gieter"), geldDeel("n", ["m1"])] });
      await l.zeg(`Voor het vegen krijg je ${e(1)} euro.`, `Voor de planten krijg je ook ${e(1)} euro.`, "Hoeveel is dat bij elkaar?", "Dan tel je het geld samen.");
      await telGeld(l, "s", ["m1"], { spreek: true, eind: false });
      await telGeld(l, "n", ["m1"], { spreek: true, eind: false, vanaf: 1 });
      await l.zeg(`Bij elkaar is dat ${e(2)} euro.`);
      zet(l, { geteld: null });
    }, zakgeld1Opgaven[0]);
    const fouten = await speelAlles(l, zakgeld1Opgaven, [0, 2, 5]);
    await squlaEind(l, fouten, "Je kunt geld bij elkaar optellen.");
  },
};

/* --- level 2: de rommelmarkt --- */

const zakgeld2Opgaven: Opgave[] = [
  kiesGeld({
    groot: [tek("spaarpot")],
    keuzes: [["b5", "b5", "b5"], ["b10", "b5", "m2", "m2", "m1"], ["b10", "b5", "m2"]],
    doel: 20,
    vraag: [`Je hebt ${e(20)} euro gespaard.`, `Waar ligt ${e(20)} euro?`],
    goedZin: [`${Hoofd(e(10))} en ${e(5)} is ${e(15)}.`, `Met ${e(2)}, ${e(2)} en ${e(1)} erbij is het ${e(20)} euro.`],
  }),
  knopVraag({
    groot: [tek("marktkraam")],
    opties: ["Waar", "Niet waar"],
    goed: "Waar",
    vraag: ["Op het plein is een rommelmarkt.", "Daar worden oude spullen verkocht.", "Je kunt die spullen kopen.", "Is dat waar of niet waar?"],
    goedZin: ["Op een rommelmarkt kun je spullen kopen.", "Vaak zijn ze niet zo duur.", "Je gaat kijken!"],
    samen: async (l) => {
      await l.zeg("Kijk naar de kraam.", "Hier worden spullen verkocht.", "Die spullen zijn te koop.", "Je betaalt met munten en briefjes.");
    },
    tip: ["Kun je de spullen op de kraam kopen?"],
  }),
  kiesGeld({
    groot: [speelgoed("bal", 4)],
    keuzes: [["m2", "m1"], ["m2", "m2"], ["m1", "m1", "m1"]],
    doel: 4,
    vraag: ["Op de rommelmarkt ligt een bal.", `De bal kost ${e(4)} euro.`, `Waar ligt ${e(4)} euro?`],
    goedZin: [`Twee munten van ${e(2)} euro is samen ${e(4)} euro.`, "Je kunt ook met andere munten betalen. Weet jij hoe?"],
  }),
  kiesGeld({
    keuzes: [["m2", "m2", "m2"], ["m1", "m1", "m1", "m1"], ["m2", "m1"]],
    doel: 4,
    vraag: [`Waar ligt ${e(4)} euro?`],
    goedZin: [`Vier munten van ${e(1)} euro is ook ${e(4)} euro.`, `Twee munten van ${e(2)} euro kan ook.`],
  }),
  kiesGeld({
    groot: [speelgoed("boek", 5)],
    keuzes: [["m2", "m2", "m1"], { tekening: "knoop", aantal: 4, zeg: "knopen" }, ["m1", "m1", "m1", "m1", "m1"], ["m2", "m2"]],
    doel: 5,
    aantal: 2,
    vraag: ["Je ziet een mooi boek.", `Het boek kost ${e(5)} euro.`, `Waar ligt ${e(5)} euro?`],
    goedZin: [`Twee munten van ${e(2)} euro en een munt van ${e(1)} euro is ${e(5)} euro.`, `Vijf munten van ${e(1)} euro is ook ${e(5)} euro.`, "Met knopen kun je niet betalen!"],
    noem: (k) => (k.geld ? `${Hoofd(e(som(k.geld)))} euro` : "Knopen"),
  }),
  getalVraag({
    groot: [speelgoed("bal", 4), { soort: "plus" }, speelgoed("boek", 5)],
    opties: [8, 9, 10],
    goed: 9,
    vraag: ["Je koopt de bal en het boek.", "Hoeveel kost dat samen?"],
    goedZin: [`${Hoofd(e(4))} euro en ${e(5)} euro is samen ${e(9)} euro.`],
    samen: async (l) => {
      await l.zeg(`De bal kost ${e(4)} euro.`, `Het boek kost ${e(5)} euro.`, `Begin bij ${e(5)} en tel vier verder.`);
    },
    tip: [`Tel ${e(4)} en ${e(5)} bij elkaar.`],
  }),
  getalVraag({
    groot: [geldDeel("over", ["b10", "m1"]), geldDeel("weg", ["b5", "m2", "m2"], [0, 1, 2])],
    opties: [9, 11, 10],
    goed: 11,
    vraag: ["Kijk naar het plaatje.", `Je betaalde met een briefje van {5:wit} euro en twee munten van ${e(2)} euro.`, "Daar staat een kruis door.", "Hoeveel euro heb je nog over?"],
    goedZin: ["Je hebt nog een briefje van {10:rood} euro en een munt van " + e(1) + " euro.", `Dat is samen ${e(11)} euro.`, "Zou dat genoeg zijn voor een skateboard?"],
    samen: async (l) => {
      zet(l, { licht: ["weg"] });
      await l.zeg("Dit geld is weg. Dat tellen we niet.");
      zet(l, { licht: ["over"] });
      await l.zeg("Dit geld heb je nog.", "Tel het maar.");
      zet(l, { licht: [] });
    },
    tip: ["Tel alleen het geld zonder kruis."],
  }),
  kiesGeld({
    groot: [tek("marktkraam")],
    keuzes: [["b5", "b5", "m1"], ["b10", "m2"], ["b10", "m1"]],
    doel: 11,
    aantal: 2,
    vraag: [`Je hebt nog ${e(11)} euro.`, `Waar ligt ${e(11)} euro?`],
    goedZin: [`${Hoofd(e(5))} en ${e(5)} en ${e(1)} is ${e(11)} euro.`, `${Hoofd(e(10))} en ${e(1)} is ook ${e(11)} euro.`, `Je kunt ${e(11)} euro op verschillende manieren betalen.`],
  }),
  kiesGeld({
    groot: [SKATE(8)],
    keuzes: [["b10"], ["b5", "m2", "m1"], ["b5", "b5"]],
    doel: 8,
    vraag: ["Kijk, daar ligt een skateboard!", `Het kost maar ${e(8)} euro.`, `Waar ligt precies ${e(8)} euro?`],
    goedZin: [`${Hoofd(e(5))} en ${e(2)} en ${e(1)} is samen ${e(8)} euro.`, "Maar jij hebt alleen een briefje van {10:rood} euro en een munt van " + e(1) + " euro.", "Hoe moet dat nu?"],
  }),
  kiesGeld({
    groot: [geldDeel("betaal", ["b10"]), { soort: "pijl" }, SKATE(8)],
    keuzes: [["m1"], ["m2"], ["b5"]],
    doel: 2,
    vraag: ["Je betaalt met het briefje van {10:rood} euro.", `Het skateboard kost ${e(8)} euro.`, "Dan krijg je geld terug.", "Welk geld krijg je terug?"],
    goedZin: [`Je geeft ${e(10)} euro. Het skateboard kost ${e(8)} euro.`, `${Hoofd(e(8))} en ${e(2)} is ${e(10)}.`, `Dus je krijgt ${e(2)} euro terug.`],
    noem: (k) => Hoofd(naam(k.geld![0])),
    samen: async (l) => {
      await l.zeg(`Het skateboard kost ${e(8)} euro.`, `Je geeft ${e(10)} euro.`, `Tel verder van ${e(8)} tot ${e(10)}.`, `${Hoofd(e(9))}, ${e(10)}.`, "Hoeveel stapjes waren dat?");
    },
    tip: [`Tel verder van ${e(8)} tot ${e(10)}.`],
  }),
  getalVraag({
    groot: [geldDeel("had", ["m1"]), { soort: "plus" }, geldDeel("terug", ["m2"])],
    opties: [2, 4, 3],
    goed: 3,
    vraag: [`Je had nog een munt van ${e(1)} euro.`, `En je kreeg ${e(2)} euro terug.`, "Hoeveel euro heb je nu nog?"],
    goedZin: [`${Hoofd(e(1))} euro en ${e(2)} euro is samen ${e(3)} euro.`, "Je gaat blij naar huis met je skateboard."],
    samen: async (l) => {
      await telGeld(l, "had", ["m1"], { spreek: true, eind: false });
      await l.zeg("Tel nu verder met de andere munt.");
      zet(l, { geteld: null });
    },
    tip: [`Begin bij ${e(1)}.`, `Tel er ${e(2)} bij.`],
  }),
  kiesGeld({
    keuzes: [["m2", "m1"], ["m1", "m1"], ["m1", "m1", "m1"], ["m2", "m2"]],
    doel: 3,
    aantal: 2,
    vraag: ["Volgende vraag.", `Waar ligt ${e(3)} euro?`],
  }),
];

const zakgeld2: Lesdraaiboek = {
  id: "squla-geld-zakgeld-2",
  titel: "Zakgeld sparen (moeilijker)",
  synthesis: "Squla groep 3 · Geld · Zakgeld verdienen · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  kaarttekening: KaartSkateboard,
  voorwerpen: ["spaarpot", "marktkraam", "bal", "boek", "knoop", "skateboard"],
  async speel(l) {
    await welkom(l, { groot: [tek("spaarpot")] }, ["m1", "m2", "b5", "b10"], [`Je hebt ${e(20)} euro gespaard.`, `Waar ligt ${e(20)} euro?`], async () => {
      zet(l, { ...LEEG, kaarten: [{ id: "u0", geld: ["b5", "m2", "m1"] }] });
      await l.zeg("Op de rommelmarkt betaal je met munten en briefjes.", "Je telt het geld bij elkaar.", "Begin bij het briefje.");
      await telGeld(l, "u0", ["b5", "m2", "m1"], { spreek: true, eind: false });
      await l.zeg(`Dit is samen ${e(8)} euro.`);
      zet(l, { geteld: null });
    }, zakgeld2Opgaven[0]);
    const fouten = await speelAlles(l, zakgeld2Opgaven, [0, 1, 4]);
    await squlaEind(l, fouten, "Je kunt betalen en geld terugkrijgen.");
  },
};

/* =====================================================================
   GELD (Squla) → GELD TELLEN: LIJNEN TREKKEN EN KIES ER TWEE
   ===================================================================== */

const BEDRAG = ["Tel het geld.", "Welk bedrag hoort erbij?", "Trek de lijnen."];
const EVENVEEL = ["Tel het geld.", "Zoek steeds twee groepjes met evenveel geld.", "Trek de lijnen."];

const geld1Opgaven: Opgave[] = [
  verbindVraag({ links: [["m2", "m1"], ["m1", "m1"]], rechts: [2, 3], vraag: [...BEDRAG.slice(0, 2), "Trek een lijn van bolletje naar bolletje."], handje: true }),
  verbindVraag({ links: [["b5", "m2"], ["b5", "m2", "m2"]], rechts: [7, 9], vraag: BEDRAG }),
  verbindVraag({ links: [["m2", "m2", "m1"], ["m2", "m2", "m2"]], rechts: [6, 5], vraag: BEDRAG }),
  verbindVraag({ links: [["b10"], ["b5", "m1", "m1", "m1"]], rechts: [8, 10], vraag: BEDRAG, goedZin: ["Zag je meteen het briefje van {10:rood} euro?", "Dat telt lekker snel!"] }),
  verbindVraag({ links: [["m1", "m1", "m1", "m1", "m1", "m1", "m1"], ["b5", "m2", "m1"]], rechts: [8, 7], vraag: BEDRAG, goedZin: [`Zeven munten van ${e(1)} euro is ${e(7)} euro.`, "Nu ga je geld met geld verbinden."] }),
  verbindVraag({ links: [["m2", "m2"], ["m1", "m1", "m1", "m1", "m1"]], rechts: [["b5"], ["m1", "m1", "m2"]], vraag: EVENVEEL }),
  verbindVraag({ links: [["m2", "m2", "m2", "m1"], ["b5", "m1"]], rechts: [["b5", "m2"], ["m2", "m2", "m2"]], vraag: EVENVEEL }),
  verbindVraag({ links: [["m1", "m1", "m1", "m1", "m1", "m1", "m1", "m1"], ["m2", "m2", "m2", "m2", "m1"]], rechts: [["b5", "m2", "m2"], ["b5", "m2", "m1"]], vraag: EVENVEEL }),
  verbindVraag({ links: [["b5", "b5"], ["m2", "m2", "m2", "m2"]], rechts: [["m2", "m2", "m2", "m1", "m1"], ["b10"]], vraag: EVENVEEL }),
  verbindVraag({ links: [["b5", "m2", "m2"], ["m2", "m2", "m2", "m2", "m2"]], rechts: [["b5", "m1", "m1", "m1", "m1", "m1"], ["b5", "m1", "m1", "m1", "m1"]], vraag: EVENVEEL, goedZin: ["Wat kun jij al goed geld tellen!"] }),
  verbindVraag({ links: [["m2", "m2", "m2", "m2"], ["b5", "m2", "m1", "m1"]], rechts: [9, 8], vraag: BEDRAG }),
  verbindVraag({ links: [["m1", "m1", "m1"], ["m2", "m2", "m1"]], rechts: [["b5"], ["m2", "m1"]], vraag: EVENVEEL }),
];

const geld1: Lesdraaiboek = {
  id: "squla-geld-geld-1",
  titel: "Geld tellen",
  synthesis: "Squla groep 3 · Geld · Geld · level 1 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  kaarttekening: KaartSpaarpot,
  voorwerpen: ["spaarpot"],
  async speel(l) {
    await welkom(l, {}, ["m1", "m2", "b5", "b10"], ["Twee groepjes geld en twee bedragen.", "Welk bedrag hoort bij welk geld?"], async () => {
      zet(l, { ...LEEG, kaarten: [{ id: "u0", geld: ["b5", "m2", "m1"] }] });
      await l.zeg("Zo tel je geld.", "Begin bij het briefje.", "Tel dan de munten erbij.");
      await telGeld(l, "u0", ["b5", "m2", "m1"], { spreek: true, eind: false });
      await l.zeg(`Samen is het ${e(8)} euro.`);
      zet(l, { geteld: null });
    }, geld1Opgaven[0]);
    const fouten = await speelAlles(l, geld1Opgaven, [0, 4, 7]);
    await squlaEind(l, fouten, "Je kunt geld tellen.");
  },
};

const twee = (doel: number, keuzes: GeldSoort[][]) => kiesGeld({ keuzes, doel, aantal: 2, vraag: [`Waar ligt ${e(doel)} euro?`] });

const geld2Opgaven: Opgave[] = [
  twee(12, [["b10", "m2"], ["b10", "m1"], ["b5", "b5", "m2"], ["b5", "b5", "b5"]]),
  verbindVraag({ links: [["b10", "b5"], ["b10", "b5", "m2"]], rechts: [["b5", "b5", "b5", "m2"], ["b5", "b5", "b5"]], vraag: EVENVEEL, handje: true }),
  twee(14, [["b10", "m2", "m2"], ["b10", "m1", "m1", "m1"], ["b5", "b5", "m2", "m2"], ["b10", "b5"]]),
  verbindVraag({ links: [["b5", "b5", "b5", "m1"], ["b10", "b5", "m2"]], rechts: [["b10", "m2", "m2", "m2", "m1"], ["b10", "b5", "m1"]], vraag: EVENVEEL }),
  twee(17, [["b10", "b5", "m2"], ["b10", "b5", "m1"], ["b5", "b5", "b5", "m2"], ["b10", "m2", "m2", "m2", "m2"]]),
  verbindVraag({
    links: [["b20"], ["b10", "m1", "m1", "m1", "m1", "m1", "m1"]],
    rechts: [["b5", "b5", "m1", "m1", "m1", "m1", "m1", "m1"], ["b10", "b5", "b5"]],
    vraag: EVENVEEL,
    goedZin: ["Een briefje van {20:blauw} euro is net zoveel als een briefje van {10:rood} en twee briefjes van {5:wit} euro."],
  }),
  twee(19, [["b10", "b5", "m2", "m2"], ["b10", "b5", "m2", "m1"], ["b20"], ["b5", "b5", "b5", "m2", "m2"]]),
  verbindVraag({ links: [["m2", "m2", "m2", "m2", "m2", "m2", "m2"], ["m2", "m2", "m2", "m2", "m2", "m2"]], rechts: [["b10", "m2"], ["b10", "m2", "m2"]], vraag: EVENVEEL }),
  twee(16, [["b10", "b5", "m1"], ["b10", "b5"], ["b5", "b5", "b5", "m1"], ["b10", "m2", "m2", "m1"]]),
  verbindVraag({ links: [["b20"], ["b5", "b5", "b5"]], rechts: [["b10", "b5"], ["b10", "b10"]], vraag: EVENVEEL, goedZin: ["Alleen maar briefjes!", "Dat telt lekker snel."] }),
  twee(13, [["b10", "m2", "m1"], ["b5", "b5", "m2", "m1"], ["b10", "m2"], ["b5", "b5", "m1", "m1"]]),
  verbindVraag({ links: [["b10", "b5", "m2", "m1"], ["b10", "b5", "m2", "m2"]], rechts: [["b5", "b5", "b5", "m2", "m2"], ["b5", "b5", "b5", "m2", "m1"]], vraag: EVENVEEL, goedZin: ["Wat kun jij goed geld tellen!"] }),
];

const geld2: Lesdraaiboek = {
  id: "squla-geld-geld-2",
  titel: "Geld tellen (moeilijker)",
  synthesis: "Squla groep 3 · Geld · Geld · level 2 (alleen leerdoel)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  kaarttekening: KaartSpaarpot,
  voorwerpen: ["spaarpot"],
  async speel(l) {
    await welkom(l, {}, ["m1", "m2", "b5", "b10", "b20"], [`Nu tellen we geld tot ${e(20)} euro.`, `Waar ligt ${e(12)} euro?`], async () => {
      zet(l, { ...LEEG, kaarten: [{ id: "u0", geld: ["b10", "b5"] }, { id: "u1", geld: ["b5", "b5", "b5"] }] });
      await l.zeg("Kijk, twee groepjes briefjes.", "Begin altijd bij het grootste briefje.");
      await telGeld(l, "u0", ["b10", "b5"], { spreek: true, eind: false });
      await telGeld(l, "u1", ["b5", "b5", "b5"], { spreek: true, eind: false });
      await l.zeg(`Allebei de groepjes zijn ${e(15)} euro.`, "Het geld ziet er anders uit, maar het is evenveel.");
      zet(l, { geteld: null });
    }, geld2Opgaven[0]);
    const fouten = await speelAlles(l, geld2Opgaven, [0, 1, 6]);
    await squlaEind(l, fouten, "Je kunt geld tellen tot twintig euro.");
  },
};

export const LESSEN_SQULA_GELD: Lesdraaiboek[] = [geldmachine1, geldmachine2, zakgeld1, zakgeld2, geld1, geld2];
