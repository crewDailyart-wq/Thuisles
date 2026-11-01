/**
 * Lessen "Vormen en figuren" naar Squla groep 3 Rekenen (31 oktober 2026,
 * opdracht eigenaar). Per Squla-oefening per level één les; elke les volgt hoe
 * dat level bij Squla is opgebouwd (zelfde soorten vragen in dezelfde
 * volgorde), met eigen kleuren, eigen dingen, eigen zinnen en eigen beeld.
 * De analyse staat in SQULA-ANALYSE/vormen-*-volledig.md.
 *
 *   Patronen (16552)             squla-vormen-patronen-1/2
 *   Rommelmonster (17049)        squla-vormen-opruimen-1   (= Squla level 2; level 1 is een muziekfilmpje)
 *   Oriënteren (11412)           squla-vormen-orienteren-1
 *   Vormen en kleuren (7435)     squla-vormen-kleuren-1/2/3 (puzzels)
 *
 * (Vormen en kleuren, filmpje (7974) is alleen een filmpje: geen les.)
 *
 * Geen mensen, geen dieren, geen gezichtjes (besluit Sara, 31 oktober 2026):
 *  - de kralenketting van "marrit" is gewoon de ketting;
 *  - de dieren in een patroon (kat, hond, vogel, konijn) zijn speelgoed: bal,
 *    blok, potlood, boek;
 *  - de smileys zijn zon, maan, ster en planeet; de puzzel met smileys is een
 *    puzzel met vormen;
 *  - "anne" die bloemen plant: "er moeten nog twee bloemen in de bak";
 *  - het rommelmonster en de knuffels: Bliepo ruimt op, met speelgoed zonder
 *    gezicht (bal, blok, autootje);
 *  - Q/Avi op het grasveld is een bal, op de plattegrond een bus; de vijf
 *    verklede monstertjes zijn vijf dingen; het monster met ballonnen is
 *    alleen de ballonnen;
 *  - de foto's (meisje op de hinkelbaan, meisje bij de bergen) zijn een
 *    hinkelbaan met een bal van bovenaf en een boom recht van voren;
 *  - de vogel en de muis die naar het huis kijken: Bliepo die erboven vliegt
 *    en "jij" die in het gras ligt;
 *  - de vormen met een gezichtje zijn effen vormen.
 * Geen kaders en geen kaartjes: alles staat los in de ruimte. Goed of fout
 * laat Bliepo zien met de vaste hulp (squla-hulp.ts) en gloed op het moment.
 */

import type { ComponentType } from "react";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { squlaBegin, squlaEind, squlaVraag as echteSqulaVraag, zetTestAntwoord, type SqulaVraag } from "./squla-hulp";
import { KaartOpruimen, KaartOrienteren, KaartPatronen, KaartPuzzel, SqulaVormenVlak, type Beeld, type Deel, type Ketting, type Puzzel, type VormenProps } from "../vlakken/squla-vormen-vlak";
import { KLEURWOORD, PUZZEL_VOORWERPEN, type Kleur, type Platvorm, type PuzzelPlaatje, type Ruimtevorm, type VormNaam, type Zicht } from "../vlakken/squla-vormen-tekenen";

/* =====================================================================
   Gedeeld
   ===================================================================== */

type Stand = { huidig: string; goed: number; fout: number; hint: number; tikUitgelegd: boolean; sleepUitgelegd: boolean };
type Vraag = (l: Lesgids, st: Stand) => Promise<boolean>;

const zet = (l: Lesgids, p: Partial<VormenProps>) => l.pasVlakAan<VormenProps>(p);
const LEEG: Partial<VormenProps> = { licht: [], goedIds: [], uit: [], actief: false };

/** Een nieuw beeld (Bliepo tovert het tevoorschijn). Hetzelfde beeld (nog een keer, na de uitleg): alles blijft staan. */
function toon(l: Lesgids, st: Stand, id: string, extra: Partial<VormenProps>) {
  if (st.huidig === id) return zet(l, { ...LEEG });
  st.huidig = id;
  zet(l, { ...LEEG, beeld: null, ketting: null, puzzel: null, ...extra });
  speelLesgeluid("verschijn");
}

/** Wachten tot het kind iets in de tekening aantikt. */
async function tik(l: Lesgids): Promise<string> {
  zet(l, { actief: true });
  const t = await l.wachtOpVlak<{ soort: string; id: string }>("tik");
  zet(l, { actief: false });
  return t.id;
}

const goedBeeld = (l: Lesgids, st: Stand, ids: string[]) => zet(l, { goed: ++st.goed, goedIds: ids, licht: [], actief: false });
const foutBeeld = (l: Lesgids, st: Stand) => zet(l, { fout: ++st.fout });

/** De eerste keer dat er in de tekening getikt moet worden, zegt Bliepo hoe. */
function tikZin(st: Stand): string[] {
  if (st.tikUitgelegd) return [];
  st.tikUitgelegd = true;
  return ["Tik op je antwoord."];
}

const kw = (k: Kleur) => KLEURWOORD[k][0];
const kwb = (k: Kleur) => KLEURWOORD[k][1];
const Hoofd = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Plekken op een rij, rond het midden van het vlak. */
const rijX = (n: number, i: number, tussen: number) => 490 + (i - (n - 1) / 2) * tussen;
const KEUZE_Y = 590;
const keuzeX = (n: number, i: number) => rijX(n, i, n === 4 ? 190 : 230);

/* ---------- voorwerpen: hoe Bliepo ze noemt ---------- */

const DING: Record<string, [string, string, string]> = {
  /* naam: [lidwoord, enkelvoud, meervoud] */
  appel: ["de", "appel", "appels"],
  banaan: ["de", "banaan", "bananen"],
  peer: ["de", "peer", "peren"],
  mandarijn: ["de", "mandarijn", "mandarijnen"],
  bal: ["de", "bal", "ballen"],
  speelblok: ["het", "blok", "blokken"],
  potlood: ["het", "potlood", "potloden"],
  boek: ["het", "boek", "boeken"],
  zon: ["de", "zon", "zonnen"],
  maan: ["de", "maan", "manen"],
  ster: ["de", "ster", "sterren"],
  planeet: ["de", "planeet", "planeten"],
  bloem: ["de", "rode bloem", "rode bloemen"],
  tulp: ["de", "tulp", "tulpen"],
  zonnebloem: ["de", "zonnebloem", "zonnebloemen"],
  broek: ["de", "broek", "broeken"],
  "t-shirt": ["het", "shirt", "shirts"],
  schoen: ["de", "schoen", "schoenen"],
  jas: ["de", "jas", "jassen"],
  speelgoedauto: ["het", "autootje", "autootjes"],
  skateboard: ["het", "skateboard", "skateboards"],
  vlieger: ["de", "vlieger", "vliegers"],
  doos: ["de", "doos", "dozen"],
  bus: ["de", "bus", "bussen"],
};
const deDing = (naam: string) => `${DING[naam][0]} ${DING[naam][1]}`;
const ding = (naam: string) => DING[naam][1];

/* ---------- vormen: hoe Bliepo ze noemt ---------- */

const VORM: Record<VormNaam, [string, string]> = {
  cirkel: ["de", "cirkel"],
  driehoek: ["de", "driehoek"],
  vierkant: ["het", "vierkant"],
  rechthoek: ["de", "rechthoek"],
  ster: ["de", "ster"],
  zeshoek: ["de", "zeshoek"],
  halfring: ["de", "boog"],
  bol: ["de", "bol"],
  cilinder: ["de", "cilinder"],
  kegel: ["de", "kegel"],
  kubus: ["de", "kubus"],
  piramide: ["de", "piramide"],
};
/** "de oranje driehoek", "het groene vierkant". */
const deVorm = (v: VormNaam, k: Kleur) => `${VORM[v][0]} ${kwb(k)} ${VORM[v][1]}`;

/* ---------- algemene keuzevraag: tik op één van de keuzes in het vlak ---------- */

type Keuze = { id: string; delen: Deel[]; aria: string; noem: string; b?: number; h?: number; x?: number; y?: number };

function keuzeDelen(keuzes: Keuze[], y = KEUZE_Y, b = 180, h = 150): Deel[] {
  return keuzes.flatMap((k, i) => {
    const x = k.x ?? keuzeX(keuzes.length, i);
    const yy = k.y ?? y;
    return [...k.delen, { s: "tik" as const, id: k.id, x, y: yy, b: k.b ?? b, h: k.h ?? h, aria: k.aria }];
  });
}

type Keuzevraag = {
  id: string;
  beeld: Deel[];
  keuzes: Keuze[];
  goed: string;
  vraag: string[];
  goedZin: string[];
  samen: (l: Lesgids) => Promise<void>;
  tip: string[];
};

function keuzevraag(q: Keuzevraag): Vraag {
  return async (l, st) => {
    const beeld: Beeld = { id: q.id, delen: [...q.beeld, ...keuzeDelen(q.keuzes)] };
    const vraag = [...q.vraag, ...tikZin(st)];
    return squlaVraag<string>(l, {
      toon: () => toon(l, st, q.id, { beeld }),
      vraag,
      antwoord: () => tik(l),
      isGoed: (x) => x === q.goed,
      noem: (x) => q.keuzes.find((k) => k.id === x)?.noem ?? "Dat",
      goed: async () => {
        goedBeeld(l, st, [q.goed]);
        await l.zeg("Goed zo!", ...q.goedZin);
      },
      fout: (x) => {
        foutBeeld(l, st);
        zet(l, { licht: [x] });
        setTimeout(() => zet(l, { licht: [] }), 700);
      },
      samen: async () => {
        await q.samen(l);
        zet(l, { licht: [] });
      },
      tip: q.tip,
      testAntwoord: q.goed,
    });
  };
}

/** Bliepo wijst één voor één aan (licht) en zegt er iets bij. */
async function wijs(l: Lesgids, stappen: [string[], string][]) {
  for (const [ids, zin] of stappen) {
    zet(l, { licht: ids });
    await l.zeg(zin);
  }
  zet(l, { licht: [] });
}

/* ---------- een les ---------- */

/**
 * Het beginscherm ("Kun je dit al?") laat de EERSTE vraag van de les zien, zonder dat het
 * kind iets hoeft te doen: tijdens het voorbeeld zet `squlaVraag` alleen het beeld neer
 * (geen vraag, geen antwoord). Zo blijft het voorbeeld altijd gelijk aan de eerste vraag.
 */
let voorbeeldAan = false;
function squlaVraag<T>(l: Lesgids, v: SqulaVraag<T>): Promise<boolean> {
  if (voorbeeldAan) {
    v.toon?.();
    return Promise.resolve(true);
  }
  return echteSqulaVraag(l, v);
}

type LesOpties = {
  id: string;
  titel: string;
  oefening: string;
  level: string;
  kaart: ComponentType;
  voorwerpen: string[];
  /** Wat er bij het welkom al in beeld staat. */
  begin?: Beeld;
  welkom: string[];
  uitleg: (l: Lesgids, st: Stand) => Promise<void>;
  vragen: Vraag[];
  eind: string;
};

function les(t: LesOpties): Lesdraaiboek {
  return {
    id: t.id,
    titel: t.titel,
    synthesis: `Squla groep 3 · Vormen en figuren · ${t.oefening} · level ${t.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    nacht: true,
    kaarttekening: t.kaart,
    voorwerpen: t.voorwerpen,
    async speel(l) {
      const st: Stand = { huidig: t.begin?.id ?? "", goed: 0, fout: 0, hint: 0, tikUitgelegd: false, sleepUitgelegd: false };
      l.vlak<VormenProps>(SqulaVormenVlak, { beeld: t.begin ?? null });
      if (t.begin) speelLesgeluid("verschijn");
      await squlaBegin(l, {
        welkom: t.welkom,
        uitleg: () => t.uitleg(l, st),
        /* Het beginscherm laat de eerste vraag van de les zien (BOUWREGELS 4.1). */
        voorbeeld: () => {
          /* De uitleg-vlaggen horen bij de echte eerste vraag, niet bij het voorbeeld. */
          const { tikUitgelegd, sleepUitgelegd, hint } = st;
          voorbeeldAan = true;
          try {
            void t.vragen[0](l, st).catch(() => {});
          } finally {
            voorbeeldAan = false;
          }
          Object.assign(st, { tikUitgelegd, sleepUitgelegd, hint });
        },
      });
      /* Na het voorbeeld tekent de eerste vraag zijn beeld zelf weer opnieuw. */
      st.huidig = "";
      let fouten = 0;
      for (const v of t.vragen) if (!(await v(l, st))) fouten++;
      zet(l, { ...LEEG, beeld: null, ketting: null, puzzel: null });
      await squlaEind(l, fouten, t.eind);
    },
  };
}

/* =====================================================================
   Patronen: kralen, dingen en vormen in een rij
   ===================================================================== */

const KRAAL_R = 34;
const KRAAL_TUSSEN = 86;
const RIJ_Y = 250;

/** Een kralenketting: kralen aan een touw. `null` = een lege plek. Ids: "r-0", "r-1" … */
function kralenRij(rij: (Kleur | null)[], extraPlekken = 0, y = RIJ_Y): Deel[] {
  const n = rij.length + extraPlekken;
  const x0 = rijX(n, 0, KRAAL_TUSSEN) - 46;
  const x1 = rijX(n, n - 1, KRAAL_TUSSEN) + 46;
  return [
    { s: "touw", id: "touw", punten: [x0, y, x1, y] },
    ...rij.map((k, i): Deel => ({ s: "kraal", id: `r-${i}`, x: rijX(n, i, KRAAL_TUSSEN), y, r: KRAAL_R, kleur: k })),
  ];
}

const kraalKeuze = (k: Kleur): Keuze => ({ id: k, delen: [{ s: "kraal", id: `kz-${k}`, groep: k, x: 0, y: 0, r: 44, kleur: k }], aria: `${kwb(k)} kraal`, noem: `De ${kwb(k)} kraal`, b: 120, h: 120 });
/** Zet de x van de keuzes goed (de delen staan op 0, 0 tot hier). */
function plaatsKeuzes(keuzes: Keuze[], y = KEUZE_Y): Keuze[] {
  return keuzes.map((k, i) => {
    const x = keuzeX(keuzes.length, i);
    return { ...k, x, y, delen: k.delen.map((d) => schuif(d, x, y)) };
  });
}
function schuif(d: Deel, dx: number, dy: number): Deel {
  if (d.s === "touw") return { ...d, punten: d.punten.map((p, i) => p + (i % 2 ? dy : dx)) };
  return { ...d, x: d.x + dx, y: d.y + dy };
}

const herhaal = <T,>(eenheid: T[], n: number) => Array.from({ length: n }, (_, i) => eenheid[i % eenheid.length]);
const namen = (lijst: string[]) => lijst.join(", ");

/** Bliepo laat het patroon zien: eerst één keer, dan begint het opnieuw. */
async function toonPatroon(l: Lesgids, eenheid: string[], ids: (i: number) => string, aantal: number) {
  const n = eenheid.length;
  await l.zeg("We kijken samen naar het patroon.");
  zet(l, { licht: Array.from({ length: n }, (_, i) => ids(i)) });
  await l.zeg(`Kijk: ${namen(eenheid)}.`);
  const tweede = Array.from({ length: Math.min(n, aantal - n) }, (_, i) => ids(n + i));
  zet(l, { licht: tweede });
  await l.zeg("Daarna begint het weer opnieuw.");
  zet(l, { licht: [] });
}

/** "Welke kraal komt na de …?" / "Welke kraal komt nu?" / "Welke kraal hoort op de lege plek?" */
function kraalVraag(id: string, eenheid: Kleur[], lengte: number, soort: "na" | "nu" | "gat", keuzes: Kleur[], gat = -1): Vraag {
  const rij: (Kleur | null)[] = herhaal(eenheid, lengte);
  let goed: Kleur;
  let vraag: string[];
  let slot: string;
  if (soort === "gat") {
    goed = rij[gat]!;
    rij[gat] = null;
    vraag = ["Er is een lege plek in de ketting.", "Welke kraal hoort op de lege plek?"];
    slot = "Kijk naar de kraal vóór de lege plek, en naar de kraal erna.";
  } else {
    goed = eenheid[lengte % eenheid.length];
    rij.push(null);
    const laatste = rij[lengte - 1]!;
    vraag = soort === "na" ? ["Kijk naar de ketting.", `Welke kraal komt na de ${kwb(laatste)} kraal?`] : ["Kijk naar de ketting.", "Welke kraal komt nu?"];
    slot = soort === "na" ? `Wat komt er steeds na ${kw(laatste)}?` : "Waar zijn we nu in het patroon?";
  }
  const ks = plaatsKeuzes(keuzes.map(kraalKeuze));
  return keuzevraag({
    id,
    beeld: kralenRij(rij),
    keuzes: ks,
    goed,
    vraag,
    goedZin: soort === "gat" ? [`Op de lege plek hoort een ${kwb(goed)} kraal.`] : soort === "na" ? [`Na ${kw(rij[lengte - 1]!)} komt ${kw(goed)}.`] : [`Nu komt er een ${kwb(goed)} kraal.`],
    samen: async (l) => {
      const ids = (i: number) => `r-${i}`;
      await toonPatroon(l, eenheid.map(kw), ids, lengte);
      if (soort === "gat") {
        zet(l, { licht: [`r-${gat - 1}`, `r-${gat + 1}`] });
        await l.zeg(slot);
      } else {
        zet(l, { licht: [`r-${lengte - 1}`] });
        await l.zeg(slot);
      }
    },
    tip: ["Kijk naar het patroon.", "Het komt steeds terug."],
  });
}

/** "Maak de ketting langer": drie kralen slepen. */
function kettingVraag(id: string, eenheid: Kleur[], getoond: number, losse: Kleur[]): Vraag {
  return async (l, st) => {
    const rij = herhaal(eenheid, getoond);
    const doel = herhaal(eenheid, getoond + 3).slice(getoond);
    const n = getoond + 3;
    const beeld: Beeld = { id, delen: kralenRij(rij, 3) };
    let ronde = 0;
    const ketting = (): Ketting => ({
      id: `${id}-${ronde}`,
      plekken: doel.map((_, i) => ({ x: rijX(n, getoond + i, KRAAL_TUSSEN), y: RIJ_Y })),
      losse: losse.map((k, i) => ({ id: k, kleur: k, x: keuzeX(3, i), y: KEUZE_Y })),
      r: KRAAL_R + 4,
      doel,
    });
    const eerste = !st.sleepUitgelegd;
    st.sleepUitgelegd = true;
    return squlaVraag<string[]>(l, {
      toon: () => {
        ronde++;
        toon(l, st, id, { beeld });
        zet(l, { ketting: ketting() });
      },
      vraag: ["Maak de ketting langer.", "Kijk goed naar het patroon.", ...(eerste ? ["Sleep de kralen naar de lege plekken."] : [])],
      antwoord: async () => {
        zet(l, { actief: true });
        const g = await l.wachtOpVlak<{ soort: string; ids: string[] }>("ketting");
        zet(l, { actief: false });
        return g.ids;
      },
      isGoed: (x) => x.join() === doel.join(),
      noem: (x) => Hoofd(namen(x.map((k) => kw(k as Kleur)))),
      goed: async () => {
        goedBeeld(l, st, []);
        await l.zeg("Goed zo!", `Het patroon gaat verder: ${namen(doel.map(kw))}.`);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await toonPatroon(l, eenheid.map(kw), (i) => `r-${i}`, getoond);
        zet(l, { licht: [`r-${getoond - 1}`] });
        await l.zeg(`De ketting stopt bij ${kw(rij[getoond - 1])}.`, `Wat komt er na ${kw(rij[getoond - 1])}?`);
        zet(l, { licht: [] });
      },
      tip: ["Kijk naar de laatste kraal.", "Wat komt er daarna in het patroon?"],
      testAntwoord: `k-${doel[0]}`,
    });
  };
}

/** Dingen op een rij met één lege plek en een pijl: "Wat hoort bij de pijl?" */
function pijlVraag(id: string, eenheid: string[], lengte: number, gat: number, keuzes: string[]): Vraag {
  const rij = herhaal(eenheid, lengte);
  const goed = rij[gat];
  const tussen = Math.min(110, 880 / lengte);
  const maat = tussen * 0.82;
  const y = RIJ_Y + 10;
  const delen: Deel[] = rij.map((naam, i): Deel => (i === gat ? { s: "vorm", id: `r-${i}`, x: rijX(lengte, i, tussen), y, maat, vorm: "cirkel", kleur: null } : { s: "vw", id: `r-${i}`, naam, x: rijX(lengte, i, tussen), y, maat }));
  delen.push({ s: "pijl", id: "pijl", x: rijX(lengte, gat, tussen), y: y - maat / 2 - 48, lang: 74 });
  const ks = plaatsKeuzes(keuzes.map((naam): Keuze => ({ id: naam, delen: [{ s: "vw", id: `kz-${naam}`, groep: naam, naam, x: 0, y: 0, maat: 120 }], aria: ding(naam), noem: Hoofd(deDing(naam)), b: 150, h: 150 })));
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed,
    vraag: ["Er is iets weg.", "Wat hoort bij de pijl?"],
    goedZin: [`Bij de pijl hoort ${deDing(goed)}.`],
    samen: async (l) => {
      await toonPatroon(l, eenheid.map(ding), (i) => `r-${i}`, lengte);
      zet(l, { licht: ["pijl"] });
      await l.zeg("Kijk wat er vóór de pijl staat.", "Wat komt daarna in het patroon?");
    },
    tip: ["Kijk naar het patroon.", "Wat komt er steeds na elkaar?"],
  });
}

type VK = [VormNaam, Kleur];

/** Vormen op een rij: "Welke vorm komt nu?" */
function vormRijVraag(id: string, rij: VK[], goed: VK, keuzes: VK[], eenheid: VK[]): Vraag {
  const n = rij.length + 1;
  const tussen = 104;
  const delen: Deel[] = rij.map(([v, k], i): Deel => ({ s: "vorm", id: `r-${i}`, x: rijX(n, i, tussen), y: RIJ_Y, maat: 92, vorm: v, kleur: k }));
  /* geen lege vorm op de lege plek (die zou op een antwoord lijken): alleen de pijl */
  delen.push({ s: "pijl", id: "pijl", x: rijX(n, n - 1, tussen), y: RIJ_Y, lang: 74 });
  const ks = plaatsKeuzes(keuzes.map(([v, k]): Keuze => ({ id: v, delen: [{ s: "vorm", id: `kz-${v}`, groep: v, x: 0, y: 0, maat: 120, vorm: v, kleur: k }], aria: VORM[v][1], noem: Hoofd(deVorm(v, k)), b: 150, h: 150 })));
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed: goed[0],
    vraag: ["Kijk naar de vormen.", "Welke vorm komt nu?"],
    goedZin: [`Nu komt ${deVorm(goed[0], goed[1])}.`],
    samen: async (l) => {
      await toonPatroon(l, eenheid.map(([v]) => VORM[v][1]), (i) => `r-${i}`, rij.length);
      zet(l, { licht: [`r-${rij.length - 1}`] });
      await l.zeg("Kijk naar de laatste vorm.", "Wat komt er daarna?");
    },
    tip: ["Kijk naar het patroon.", "Het begint steeds opnieuw."],
  });
}

/* ---------- de puzzel (een tussendoortje bij Patronen, en de hele les Vormen en kleuren) ---------- */

function puzzelVraag(id: string, plaatje: PuzzelPlaatje, n: number, opties: { vraag?: string[]; goedZin?: string[] } = {}): Vraag {
  return async (l, st) => {
    const puzzel: Puzzel = { id, plaatje, n };
    const eerste = !st.sleepUitgelegd;
    st.sleepUitgelegd = true;
    return squlaVraag<boolean>(l, {
      toon: () => toon(l, st, id, { puzzel }),
      vraag: [...(opties.vraag ?? ["Kijk goed naar het plaatje.", "Maak de puzzel."]), ...(eerste ? ["Sleep elk stukje naar zijn plek.", "Of tik op een stukje en dan op zijn plek."] : [])],
      antwoord: async () => {
        let mis = 0;
        let wacht = l.wachtOpVlak<{ soort: string }>(["puzzelKlaar", "puzzelMis"]);
        for (;;) {
          const g = await wacht;
          if (g.soort === "puzzelKlaar") return true;
          mis++;
          wacht = l.wachtOpVlak<{ soort: string }>(["puzzelKlaar", "puzzelMis"]);
          /* Na drie keer mis laat Bliepo zien waar een stukje hoort (hulp in beeld). */
          if (mis % 3 === 0) {
            zet(l, { hint: ++st.hint });
            await l.zeg("Kijk, ik laat zien waar dit stukje hoort.");
          }
        }
      },
      isGoed: () => true,
      noem: () => "Dat",
      goed: async () => {
        await l.zeg("Goed zo!", ...(opties.goedZin ?? ["De puzzel is af."]));
      },
      samen: async () => undefined,
      tip: ["Kijk goed naar de randjes."],
      testAntwoord: "stuk-0",
    });
  };
}

/* =====================================================================
   Patronen · level 2: patronen in een rooster
   ===================================================================== */

const BLOK = 84;

/** Een rooster van gekleurde blokjes (`null` = leeg). Ids: "b-<rij>-<kolom>". */
function blokRooster(rooster: (Kleur | null)[][], y0 = 92, maat = BLOK, kraal = false): Deel[] {
  const kol = rooster[0].length;
  return rooster.flatMap((rij, j) =>
    rij.map((k, i): Deel => {
      const x = rijX(kol, i, maat + 8);
      const y = y0 + j * (maat + 8) + maat / 2;
      return kraal ? { s: "kraal", id: `b-${j}-${i}`, x, y, r: maat / 2 - 2, kleur: k } : { s: "vorm", id: `b-${j}-${i}`, x, y, maat: maat + 14, vorm: "vierkant", kleur: k };
    }),
  );
}

/** Een rijtje van drie blokjes als keuze. */
const rijKeuze = (id: string, kleuren: Kleur[]): Keuze => ({
  id,
  delen: kleuren.map((k, i): Deel => ({ s: "vorm", id: `${id}-${i}`, groep: id, x: (i - 1) * 60, y: 0, maat: 66, vorm: "vierkant", kleur: k })),
  aria: namen(kleuren.map(kw)),
  noem: Hoofd(namen(kleuren.map(kw))),
  b: 200,
  h: 90,
});

/** "Hoe ziet de onderste rij eruit?" (in elke rij en elk rijtje omlaag staat elke kleur één keer). */
function onderRijVraag(id: string, boven: Kleur[][], goed: Kleur[], keuzes: Kleur[][]): Vraag {
  const rooster: (Kleur | null)[][] = [...boven, [null, null, null]];
  const ks = plaatsKeuzes(keuzes.map((k, i) => rijKeuze(`rij${i}`, k)));
  const goedId = `rij${keuzes.findIndex((k) => k.join() === goed.join())}`;
  return keuzevraag({
    id,
    beeld: blokRooster(rooster, 70),
    keuzes: ks,
    goed: goedId,
    vraag: ["De onderste rij is nog leeg.", "Hoe ziet de onderste rij eruit?"],
    goedZin: ["In elk rijtje staat elke kleur nu één keer."],
    samen: async (l) => {
      await l.zeg("Kijk naar de rijtjes van boven naar beneden.");
      zet(l, { licht: ["b-0-0", "b-1-0"] });
      await l.zeg(`Hier staan ${kw(boven[0][0])} en ${kw(boven[1][0])}.`, "Elke kleur komt in elk rijtje één keer voor.", "Welke kleur mist hier nog?");
      zet(l, { licht: [] });
      await l.zeg("Kijk zo ook naar de andere rijtjes.");
    },
    tip: ["Kijk naar elk rijtje van boven naar beneden.", "Welke kleur mist er?"],
  });
}

/** Tegenover elkaar dezelfde kleur (een kralenplank van 3 × 3, de hoek linksonder is leeg). */
function spiegelVraag(id: string, rooster: (Kleur | null)[][], keuzes: Kleur[]): Vraag {
  const goed = rooster[0][2]!;
  const ks = plaatsKeuzes(keuzes.map(kraalKeuze));
  return keuzevraag({
    id,
    beeld: blokRooster(rooster, 80, 104, true),
    keuzes: ks,
    goed,
    vraag: ["Kijk naar de kralenplank.", "Welke kraal hoort op de lege plek?"],
    goedZin: [`Tegenover ${kw(goed)} staat weer ${kw(goed)}.`],
    samen: async (l) => {
      await l.zeg("Kijk naar de hoeken.");
      zet(l, { licht: ["b-0-0", "b-2-2"] });
      await l.zeg(`Hier ${kw(rooster[0][0]!)}, en daar ook ${kw(rooster[2][2]!)}.`, "Tegenover elkaar staat dezelfde kleur.");
      zet(l, { licht: ["b-2-0", "b-0-2"] });
      await l.zeg("Welke kleur staat er tegenover de lege plek?");
    },
    tip: ["Kijk naar de hoek tegenover de lege plek."],
  });
}


/** Een honingraat: zes vlakken rond het midden; tegenover elkaar dezelfde kleur. */
function honingVraag(id: string, midden: Kleur, rond: (Kleur | null)[], keuzes: Kleur[]): Vraag {
  const leeg = rond.indexOf(null);
  const goed = rond[(leeg + 3) % 6]!;
  const maat = 124;
  const d = maat * 0.47 * Math.sqrt(3);
  const cx = 490;
  const cy = 270;
  const delen: Deel[] = [{ s: "vorm", id: "h-m", x: cx, y: cy, maat, vorm: "zeshoek", kleur: midden }];
  rond.forEach((k, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    delen.push({ s: "vorm", id: `h-${i}`, x: cx + d * Math.cos(a), y: cy + d * Math.sin(a), maat, vorm: "zeshoek", kleur: k });
  });
  const ks = plaatsKeuzes(keuzes.map((k): Keuze => ({ id: k, delen: [{ s: "vorm", id: `kz-${k}`, groep: k, x: 0, y: 0, maat: 104, vorm: "zeshoek", kleur: k }], aria: kw(k), noem: Hoofd(kw(k)), b: 130, h: 120 })), 600);
  const paar = (i: number) => [`h-${i}`, `h-${(i + 3) % 6}`];
  const ander = [0, 1, 2].filter((i) => i !== leeg % 3);
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed,
    vraag: ["Eén vlak heeft nog geen kleur.", "Welke kleur hoort in het lege vlak?"],
    goedZin: [`Tegenover het lege vlak staat ${kw(goed)}.`],
    samen: async (l) => {
      await l.zeg("Kijk naar de vlakken die tegenover elkaar liggen.");
      for (const i of ander) {
        zet(l, { licht: paar(i) });
        await l.zeg(`Hier ${kw(rond[i]!)}, en daar ook ${kw(rond[(i + 3) % 6]!)}.`);
      }
      zet(l, { licht: paar(leeg) });
      await l.zeg("Tegenover elkaar staat dezelfde kleur.", "Welke kleur ligt er tegenover het lege vlak?");
    },
    tip: ["Kijk naar het vlak tegenover het lege vlak."],
  });
}

/** Dingen in twee rijen; de onderste rij begint ergens anders. "Wat hoort op de lege plek?" */
function dingRoosterVraag(id: string, rijen: (string | null)[][], pijl: [number, number] | null, goed: string, keuzes: string[], eenheid: string[]): Vraag {
  const kol = rijen[0].length;
  const maat = 104;
  const tussen = 124;
  const y0 = rijen.length === 2 ? 130 : 96;
  const delen: Deel[] = rijen.flatMap((rij, j) =>
    rij.map((naam, i): Deel => {
      const x = rijX(kol, i, tussen);
      const y = y0 + j * tussen;
      return naam ? { s: "vw", id: `d-${j}-${i}`, naam, x, y, maat } : { s: "vorm", id: `d-${j}-${i}`, x, y, maat: maat - 6, vorm: "vierkant", kleur: null };
    }),
  );
  if (pijl) delen.push({ s: "pijl", id: "pijl", x: rijX(kol, pijl[1], tussen), y: y0 + pijl[0] * tussen + maat / 2 + 40, lang: 60, omhoog: true });
  const ks = plaatsKeuzes(keuzes.map((naam): Keuze => ({ id: naam, delen: [{ s: "vw", id: `kz-${naam}`, groep: naam, naam, x: 0, y: 0, maat: 112 }], aria: ding(naam), noem: Hoofd(deDing(naam)), b: 140, h: 140 })));
  const ids = (j: number) => rijen[j].map((_, i) => `d-${j}-${i}`);
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed,
    vraag: pijl ? ["Kijk naar de rijen.", "Wat hoort bij de pijl?"] : ["Kijk naar de rijen.", "Wat hoort op de lege plek?"],
    goedZin: [`Daar hoort ${deDing(goed)}.`],
    samen: async (l) => {
      zet(l, { licht: ids(0) });
      await l.zeg(`Kijk naar de bovenste rij: ${namen(eenheid.map(ding))}.`);
      zet(l, { licht: ids(1) });
      await l.zeg("In de volgende rij komt hetzelfde terug.", "Maar de rij begint ergens anders.");
      zet(l, { licht: [] });
      await l.zeg(...(pijl ? ["Kijk naar de plek bij de pijl.", "Ga in het patroon verder vanaf het laatste ding dat er al ligt."] : ["Wat komt er in het patroon na het laatste ding?"]));
    },
    tip: ["Kijk naar de volgorde in de bovenste rij.", "Die komt steeds terug."],
  });
}

/** Een kralenplank waarin elke rij één plekje opschuift; de pijl wijst naar een lege plek. */
function schuifPlankVraag(id: string, eenheid: Kleur[], rijen: number, gevuld: number, pijlKol: number, keuzes: Kleur[]): Vraag {
  const kol = eenheid.length;
  const rooster: (Kleur | null)[][] = Array.from({ length: rijen }, (_, j) => Array.from({ length: kol }, (_, i) => eenheid[(i - j + kol * 4) % kol]));
  const laatste = rijen - 1;
  for (let i = gevuld; i < kol; i++) rooster[laatste][i] = null;
  const goed = eenheid[(pijlKol - laatste + kol * 4) % kol];
  const maat = 96;
  const delen = blokRooster(rooster, 64, maat, true);
  /* de pijl staat onder de lege plek en wijst omhoog */
  delen.push({ s: "pijl", id: "pijl", x: rijX(kol, pijlKol, maat + 8), y: 64 + laatste * (maat + 8) + maat + 44, lang: 60, omhoog: true });
  const ks = plaatsKeuzes(keuzes.map(kraalKeuze), 600);
  const rijIds = (j: number) => Array.from({ length: kol }, (_, i) => `b-${j}-${i}`);
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed,
    vraag: ["De pijl wijst naar een lege plek.", "Welke kraal hoort bij de pijl?"],
    goedZin: [`Daar hoort een ${kwb(goed)} kraal.`],
    samen: async (l) => {
      zet(l, { licht: rijIds(0) });
      await l.zeg(`Kijk naar de bovenste rij: ${namen(eenheid.map(kw))}.`);
      zet(l, { licht: rijIds(1) });
      await l.zeg("In elke rij komen de kleuren in dezelfde volgorde.", "Alleen schuift alles één plekje op.");
      zet(l, { licht: Array.from({ length: gevuld }, (_, i) => `b-${laatste}-${i}`) });
      await l.zeg(`In de onderste rij staat ${namen(rooster[laatste].slice(0, gevuld).map((k) => kw(k!)))}.`, "Wat komt er daarna?");
    },
    tip: ["Kijk naar de volgorde in de bovenste rij."],
  });
}

/** Een rooster waarin elk rijtje omlaag dezelfde kleuren herhaalt; de pijl wijst naar een lege plek in de bovenste rij. */
function kolomVraag(id: string, cyclus: Kleur[], start: Kleur[], leeg: number[], pijlKol: number, keuzes: Kleur[]): Vraag {
  const rijen = 4;
  const kol = start.length;
  const rooster: (Kleur | null)[][] = Array.from({ length: rijen }, (_, j) => start.map((s) => cyclus[(cyclus.indexOf(s) + j) % cyclus.length]));
  const goed = rooster[0][pijlKol]!;
  for (const i of leeg) rooster[0][i] = null;
  const maat = 70;
  const y0 = 120;
  const delen = blokRooster(rooster, y0, maat);
  delen.push({ s: "pijl", id: "pijl", x: rijX(kol, pijlKol, maat + 8), y: y0 - 50, lang: 64 });
  const ks = plaatsKeuzes(keuzes.map((k): Keuze => ({ id: k, delen: [{ s: "vorm", id: `kz-${k}`, groep: k, x: 0, y: 0, maat: 96, vorm: "vierkant", kleur: k }], aria: kw(k), noem: Hoofd(kw(k)), b: 120, h: 120 })), 620);
  const kolIds = (i: number, van = 0) => Array.from({ length: rijen - van }, (_, j) => `b-${j + van}-${i}`);
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed,
    vraag: ["De pijl wijst naar een leeg hokje.", "Welke kleur hoort bij de pijl?"],
    goedZin: [`Het hokje wordt ${kw(goed)}.`],
    samen: async (l) => {
      zet(l, { licht: kolIds(0) });
      await l.zeg("Kijk naar het eerste rijtje, van boven naar beneden.", `${Hoofd(namen(rooster.map((r) => kw(r[0]!))))}.`, "De kleuren komen steeds in dezelfde volgorde.");
      zet(l, { licht: kolIds(pijlKol, 1) });
      await l.zeg(`Onder de pijl staat ${namen(rooster.slice(1).map((r) => kw(r[pijlKol]!)))}.`, `Welke kleur komt er in de volgorde vóór ${kw(rooster[1][pijlKol]!)}?`);
    },
    tip: ["Kijk naar het rijtje onder de pijl."],
  });
}

/** Een vorm die steeds een kwartslag draait. "Welk plaatje komt nu?" */
function draaiVraag(id: string, kleur: Kleur, begin: number, keuzes: number[]): Vraag {
  const n = 6;
  const draai = Array.from({ length: n - 1 }, (_, i) => (begin + i) % 4);
  const goed = (begin + n - 1) % 4;
  const tussen = 132;
  const delen: Deel[] = draai.map((d, i): Deel => ({ s: "vorm", id: `r-${i}`, x: rijX(n, i, tussen), y: RIJ_Y, maat: 112, vorm: "halfring", kleur, draai: d }));
  delen.push({ s: "vorm", id: "leeg", x: rijX(n, n - 1, tussen), y: RIJ_Y, maat: 106, vorm: "vierkant", kleur: null });
  const OPEN = ["onderkant", "linkerkant", "bovenkant", "rechterkant"];
  const ks = plaatsKeuzes(keuzes.map((d): Keuze => ({ id: `d${d}`, delen: [{ s: "vorm", id: `kz-${d}`, groep: `d${d}`, x: 0, y: 0, maat: 124, vorm: "halfring", kleur, draai: d }], aria: `open aan de ${OPEN[d]}`, noem: "Die", b: 150, h: 150 })));
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed: `d${goed}`,
    vraag: ["Kijk hoe de vorm draait.", "Welk plaatje komt nu?"],
    goedZin: ["De vormen komen steeds in dezelfde volgorde terug."],
    samen: async (l) => {
      zet(l, { licht: ["r-0", "r-1", "r-2", "r-3"] });
      await l.zeg("Kijk: de vorm draait steeds een stukje verder.");
      zet(l, { licht: ["r-0", "r-4"] });
      await l.zeg("Deze twee zijn hetzelfde.", "Na vier keer draaien begint het opnieuw.");
      zet(l, { licht: ["r-1"] });
      await l.zeg("Welke kwam er na de eerste?");
    },
    tip: ["De rij komt steeds in dezelfde volgorde terug."],
  });
}

/** De bloembak: om en om dezelfde bloem; er moeten nog twee bloemen in. */
function bloembakVraag(id: string, rij: string[], goed: [string, string], keuzes: [string, string][]): Vraag {
  const n = rij.length + 2;
  const tussen = 92;
  const y = 250;
  const delen: Deel[] = [{ s: "vw", id: "bak", naam: "bloembak", x: 490, y: y + 50, maat: 820, hoog: 290 }];
  const bloemen: Deel[] = rij.map((naam, i): Deel => ({ s: "vw", id: `r-${i}`, naam, x: rijX(n, i, tussen), y: y - 62, maat: 104 }));
  const leeg: Deel[] = [0, 1].map((k): Deel => ({ s: "vorm", id: `leeg-${k}`, x: rijX(n, rij.length + k, tussen), y: y - 62, maat: 74, vorm: "cirkel", kleur: null }));
  /* de bak eerst, dan de bloemen met hun steel in de aarde (niet erachter) */
  delen.push(...bloemen, ...leeg);
  const ks = plaatsKeuzes(
    keuzes.map(([a, b], i): Keuze => ({
      id: `p${i}`,
      delen: [
        { s: "vw", id: `kz-${i}-a`, groep: `p${i}`, naam: a, x: -44, y: 0, maat: 96 },
        { s: "vw", id: `kz-${i}-b`, groep: `p${i}`, naam: b, x: 44, y: 0, maat: 96 },
      ],
      aria: `${ding(a)} en ${ding(b)}`,
      noem: Hoofd(`${deDing(a)} en ${deDing(b)}`),
      b: 210,
      h: 130,
    })),
  );
  const goedId = `p${keuzes.findIndex(([a, b]) => a === goed[0] && b === goed[1])}`;
  const om = rij.map((naam, i) => (naam === rij[0] ? `r-${i}` : "")).filter(Boolean);
  const tussenIds = rij.map((naam, i) => (naam !== rij[0] ? `r-${i}` : "")).filter(Boolean);
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed: goedId,
    vraag: ["Er moeten nog twee bloemen in de bak.", "Welke twee horen erbij?"],
    goedZin: [`Eerst ${deDing(goed[0])}, dan ${deDing(goed[1])}.`],
    samen: async (l) => {
      zet(l, { licht: om });
      await l.zeg(`Kijk: om en om staat er een ${ding(rij[0])}.`);
      zet(l, { licht: tussenIds });
      await l.zeg(`Daartussen staat steeds iets anders: ${namen(rij.filter((x) => x !== rij[0]).map(ding))}.`, "Welke bloem komt er daarna?");
    },
    tip: [`Om en om staat er een ${ding(rij[0])}.`],
  });
}

/* =====================================================================
   Opruimen (Rommelmonster level 2)
   ===================================================================== */

const SCENE_X = [175, 490, 805];
/** Sommige plaatjes zijn smal of plat (een boek ligt plat): die tekenen we wat groter, zodat ze even goed te zien zijn. */
const SCHAAL: Record<string, number> = { boek: 1.6, broek: 1.15, potlood: 1.1 };
const m_ = (naam: string, m: number) => m * (SCHAAL[naam] ?? 1);
const SCENE_Y = 380;
const SCENE_B = 290;
const SCENE_H = 380;

type Scene = { id: string; delen: Deel[]; zeg: string };

/** Dingen los op de grond, door elkaar. */
function opGrond(id: string, items: string[], maat = 112): Deel[] {
  /* een hoopje: één ding achteraan, twee ervoor (wat achteraan ligt, wordt eerst getekend) */
  const plek = [
    [-70, 52],
    [70, 58],
    [0, 4],
  ];
  const delen = items.map((naam, i): Deel => ({ s: "vw", id: `${id}-${i}`, groep: id, naam, x: plek[i][0], y: plek[i][1], maat: m_(naam, maat) }));
  return [delen[2], delen[0], delen[1]].filter(Boolean);
}

/** Dingen op een plank. */
function opPlank(id: string, items: string[], maten?: number[]): Deel[] {
  const plankMaat = 300;
  const plankY = 60;
  /* het nieuwe plaatje wandplank.png is 512 × 107: breed 300, dus 63 hoog; de bovenkant ligt op y = plankY − 31 (BOUWREGELS 14.17) */
  const plankTop = plankY - (plankMaat * 107) / 512 / 2 + 19;
  const ms = (maten ?? items.map(() => Math.min(80, (264 - 6 * (items.length - 1)) / items.length))).map((m, i) => m_(items[i], m));
  const breed = ms.reduce((a, b) => a + b, 0) + (ms.length - 1) * 6;
  let x = -breed / 2;
  const dingen: Deel[] = items.map((naam, i): Deel => {
    const m = ms[i];
    const d: Deel = { s: "vw", id: `${id}-${i}`, groep: id, naam, x: x + m / 2, y: plankTop - m * 0.45, maat: m };
    x += m + 6;
    return d;
  });
  return [...dingen, { s: "vw", id: `${id}-plank`, groep: id, naam: "wandplank", x: 0, y: plankY, maat: plankMaat }];
}

/** Dingen in de kast. */
function inKast(id: string, items: string[]): Deel[] {
  const plek = [
    [-30, -62],
    [30, -62],
    [0, 40],
  ];
  return [{ s: "vw", id: `${id}-kast`, groep: id, naam: "kledingkast", x: 0, y: 0, maat: 300 }, ...items.map((naam, i): Deel => ({ s: "vw", id: `${id}-${i}`, groep: id, naam, x: plek[i][0], y: plek[i][1], maat: m_(naam, 76) }))];
}

/** Dingen in een doos of mand (ze steken er bovenuit). */
function inBak(id: string, items: string[], bak: string): Deel[] {
  const potlood = items[0] === "potlood";
  const plek = potlood ? [[-42, 4], [0, -8], [42, 4]] : [[-44, 30], [40, 30], [0, 6]];
  const maat = potlood ? 140 : 88;
  return [...items.map((naam, i): Deel => ({ s: "vw", id: `${id}-${i}`, groep: id, naam, x: plek[i][0], y: plek[i][1], maat })), { s: "vw", id: `${id}-bak`, groep: id, naam: bak, x: 0, y: 50, maat: 240 }];
}

/** Dingen op een rij naast elkaar, op de grond (of op de plank). */
function opRij(id: string, naam: string, maten: number[], plank = false): Deel[] {
  if (plank) return opPlank(id, maten.map(() => naam), maten);
  const breed = maten.reduce((a, b) => a + b, 0) + (maten.length - 1) * 8;
  let x = -breed / 2;
  return maten.map((m, i): Deel => {
    const d: Deel = { s: "vw", id: `${id}-${i}`, groep: id, naam, x: x + m / 2, y: 70 - m / 2, maat: m };
    x += m + 8;
    return d;
  });
}

function sceneVraag(id: string, scenes: Scene[], goed: string, vraag: string[], goedZin: string[], uitleg: string): Vraag {
  const keuzes: Keuze[] = scenes.map((sc, i) => ({
    id: sc.id,
    x: SCENE_X[i],
    y: SCENE_Y,
    delen: sc.delen.map((d) => schuif(d, SCENE_X[i], SCENE_Y)),
    aria: `plaatje ${i + 1}`,
    noem: "Dat plaatje",
    b: SCENE_B,
    h: SCENE_H,
  }));
  return keuzevraag({
    id,
    beeld: [],
    keuzes,
    goed,
    vraag,
    goedZin,
    samen: async (l) => {
      await l.zeg("We kijken samen naar elk plaatje.");
      await wijs(
        l,
        scenes.filter((sc) => sc.id !== goed).map((sc) => [[sc.id], sc.zeg]),
      );
      await l.zeg(uitleg);
    },
    tip: [uitleg],
  });
}

/** "Op welk plaatje zie je alleen …?" */
function alleenVraag(id: string, wat: string, scenes: [string[], string][], goed: number): Vraag {
  const sc: Scene[] = scenes.map(([items, zeg], i) => ({ id: `s${i}`, delen: opGrond(`s${i}`, items), zeg }));
  return sceneVraag(id, sc, `s${goed}`, ["Help je mee opruimen?", `Op welk plaatje zie je alleen ${DING[wat][2]}?`], [`Daar liggen alleen ${DING[wat][2]}.`], `Zoek het plaatje met alleen ${DING[wat][2]}.`);
}

/** "… hoort/horen op een plek. Op welk plaatje is dat goed?" */
function plekVraag(id: string, zin: string, scenes: [Deel[], string][], goed: number, goedZin: string): Vraag {
  const sc: Scene[] = scenes.map(([delen, zeg], i) => ({ id: `s${i}`, delen, zeg }));
  return sceneVraag(id, sc, `s${goed}`, [zin, "Op welk plaatje is dat goed?"], [goedZin], zin);
}

/** "Op welk plaatje staan de … van klein naar groot?" */
function volgordeVraag(id: string, naam: string, plank: boolean, rijen: number[][], goed: number): Vraag {
  const zeg = (m: number[]) =>
    m.every((x) => x === m[0])
      ? `Hier zijn ze allemaal even groot.`
      : m.every((x, i) => i === 0 || x > m[i - 1])
        ? `Hier staan ze van klein naar groot.`
        : m.every((x, i) => i === 0 || x < m[i - 1])
          ? `Hier staan ze van groot naar klein.`
          : `Hier staan ze door elkaar.`;
  const sc: Scene[] = rijen.map((m, i) => ({ id: `s${i}`, delen: opRij(`s${i}`, naam, m, plank), zeg: zeg(m) }));
  return sceneVraag(
    id,
    sc,
    `s${goed}`,
    ["Nu zetten we alles netjes neer.", `Op welk plaatje staan de ${DING[naam][2]} van klein naar groot?`],
    ["Eerst de kleinste, en dan steeds een grotere."],
    "Zoek het plaatje waar eerst de kleinste staat, en dan steeds een grotere.",
  );
}

type Paar = { id: string; soort: string; naam: string; n: number };

/** "Wat hoort bij elkaar?" Zes plaatjes, drie paren; tik steeds twee die bij elkaar horen. */
function parenVraag(id: string, paren: Paar[], soortNaam: Record<string, string>): Vraag {
  const PX = [200, 490, 780];
  const PY = [240, 520];
  const delen: Deel[] = [];
  const tikken: Deel[] = [];
  paren.forEach((p, k) => {
    const x = PX[k % 3];
    const y = PY[Math.floor(k / 3)];
    const maat = p.naam === "boek" ? 190 : m_(p.naam, p.n > 3 ? 70 : p.n === 3 ? 84 : p.n === 2 ? 100 : 128);
    /* boeken liggen plat: op een stapel in plaats van naast elkaar */
    const plat = p.naam === "boek";
    const perRij = plat ? 1 : p.n > 3 ? 3 : p.n;
    const stap = plat ? maat * 0.32 : maat + 4;
    for (let i = 0; i < p.n; i++) {
      const rij = Math.floor(i / perRij);
      const inRij = Math.min(perRij, p.n - rij * perRij);
      const rijen = Math.ceil(p.n / perRij);
      delen.push({ s: "vw", id: `${p.id}-${i}`, groep: p.id, naam: p.naam, x: x + ((i % perRij) - (inRij - 1) / 2) * (maat + 6), y: y + (rij - (rijen - 1) / 2) * stap, maat });
    }
    tikken.push({ s: "tik", id: p.id, x, y, b: 250, h: 230, aria: `${p.n} ${p.n === 1 ? ding(p.naam) : DING[p.naam][2]}` });
  });
  const soortVan = (x: string) => paren.find((p) => p.id === x)!.soort;
  return async (l, st) => {
    const beeld: Beeld = { id, delen: [...delen, ...tikken] };
    const gevonden: string[] = [];
    let allesMeteen = true;
    const soorten = [...new Set(paren.map((p) => p.soort))];
    for (let ronde = 0; ronde < soorten.length - 1; ronde++) {
      const over = paren.filter((p) => !gevonden.includes(p.id));
      const eerste = over[0];
      const partner = over.find((p) => p !== eerste && p.soort === eerste.soort)!;
      const meteen = await squlaVraag<[string, string]>(l, {
        toon: () => {
          toon(l, st, id, { beeld });
          zet(l, { uit: [...gevonden] });
        },
        vraag: ronde === 0 ? ["Wat hoort bij elkaar?", "Tik op twee plaatjes die bij elkaar horen."] : ["Zoek nog twee plaatjes die bij elkaar horen."],
        antwoord: async () => {
          for (;;) {
            zetTestAntwoord(eerste.id);
            zet(l, { licht: [], uit: [...gevonden] });
            const a = await tik(l);
            zet(l, { licht: [a] });
            zetTestAntwoord(over.find((p) => p.id !== a && p.soort === soortVan(a))?.id ?? partner.id);
            const b = await tik(l);
            if (b === a) continue;
            zet(l, { licht: [a, b] });
            await l.wacht(400);
            return [a, b];
          }
        },
        isGoed: ([a, b]) => soortVan(a) === soortVan(b),
        noem: () => "Die twee",
        goed: async ([a, b]) => {
          gevonden.push(a, b);
          goedBeeld(l, st, [a, b]);
          await l.zeg("Goed zo!", `Dat zijn allebei ${soortNaam[soortVan(a)]}.`);
          zet(l, { uit: [...gevonden], goedIds: [] });
        },
        fout: () => {
          foutBeeld(l, st);
          zet(l, { licht: [] });
        },
        samen: async () => {
          await l.zeg("We kijken samen naar elk plaatje.");
          const nog = paren.filter((p) => !gevonden.includes(p.id));
          await wijs(
            l,
            nog.map((p) => [[p.id], `Hier zie je ${p.n === 1 ? `één ${ding(p.naam)}` : `${DING[p.naam][2]}`}.`]),
          );
          await l.zeg("Zoek twee plaatjes met hetzelfde soort ding.");
        },
        tip: ["Zoek twee plaatjes met hetzelfde soort ding."],
        testAntwoord: eerste.id,
      });
      if (!meteen) allesMeteen = false;
    }
    /* De laatste twee horen vanzelf bij elkaar. */
    const laatste = paren.filter((p) => !gevonden.includes(p.id)).map((p) => p.id);
    zet(l, { licht: laatste });
    await l.zeg(`En deze twee zijn allebei ${soortNaam[soortVan(laatste[0])]}.`, "Alles ligt weer soort bij soort.");
    zet(l, { licht: [], goedIds: laatste });
    return allesMeteen;
  };
}

/* =====================================================================
   Oriënteren: links, rechts, boven, onder, en van welke kant je kijkt
   ===================================================================== */

const VELD = { x: 490, y: 320, b: 560, h: 400 };
const PLEK: Record<string, [number, number]> = {
  linksboven: [VELD.x - 190, VELD.y - 128],
  rechtsboven: [VELD.x + 190, VELD.y - 128],
  linksonder: [VELD.x - 190, VELD.y + 128],
  rechtsonder: [VELD.x + 190, VELD.y + 128],
  "in het midden": [VELD.x, VELD.y],
  "links van het midden": [VELD.x - 150, VELD.y],
};

async function kiesWoord(l: Lesgids, opties: string[]) {
  return String(await l.kies(opties, { weetniet: false, direct: true }));
}

/** Waar ligt iets op het grasveld of op de plattegrond? Kiezen uit woorden. */
function plekWoordVraag(o: { id: string; veld: "gras" | "stad"; ding: string; dingPlek: string; stipPlek?: string; opties: string[]; invullen?: boolean }): Vraag {
  return async (l, st) => {
    const [dx, dy] = PLEK[o.dingPlek];
    const delen: Deel[] = [{ s: "veld", id: "veld", soort: o.veld, x: VELD.x, y: VELD.y, b: VELD.b, h: VELD.h }];
    if (o.stipPlek) {
      const [sx, sy] = PLEK[o.stipPlek];
      delen.push({ s: "vorm", id: "stip", x: sx, y: sy, maat: 50, vorm: "cirkel", kleur: "rood" });
    }
    delen.push({ s: "vw", id: "ding", naam: o.ding, x: dx, y: dy, maat: 96 });
    const beeld: Beeld = { id: o.id, delen };
    const goed = o.stipPlek ?? o.dingPlek;
    const wie = o.stipPlek ? "de stip" : deDing(o.ding);
    const vraag = o.stipPlek
      ? o.invullen
        ? [`${Hoofd(deDing(o.ding))} moet naar de rode stip.`, "Maak de zin af.", "De stip ligt …"]
        : [`${Hoofd(deDing(o.ding))} moet naar de rode stip.`, "Waar ligt de stip?"]
      : [`Kijk naar het grasveld.`, `Waar ligt ${deDing(o.ding)}?`];
    return squlaVraag<string>(l, {
      toon: () => toon(l, st, o.id, { beeld }),
      vraag,
      antwoord: () => kiesWoord(l, o.opties),
      isGoed: (x) => x === goed,
      noem: (x) => Hoofd(x),
      goed: async () => {
        goedBeeld(l, st, [o.stipPlek ? "stip" : "ding"]);
        await l.zeg("Goed zo!", o.invullen ? `De stip ligt ${goed}.` : `${Hoofd(wie)} ligt ${goed}.`);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        zet(l, { licht: [o.stipPlek ? "stip" : "ding"] });
        await l.zeg(`Kijk waar ${wie} ligt.`, "Ligt dat bovenaan, onderaan of in het midden?", "En aan welke kant: links of rechts?");
        zet(l, { licht: [] });
      },
      tip: ["Kijk eerst: boven of onder?", "Dan: links of rechts?"],
      testAntwoord: goed,
    });
  };
}

/** Vijf dingen op het grasveld: "Wat ligt er …?" Tikken op het ding. */
function welkDingVraag(id: string, dingen: Record<string, string>, vraagPlek: string): Vraag {
  const delen: Deel[] = [{ s: "veld", id: "veld", soort: "gras", x: VELD.x, y: VELD.y, b: VELD.b, h: VELD.h }];
  const keuzes: Keuze[] = Object.entries(dingen).map(([plek, naam]) => {
    const [x, y] = PLEK[plek];
    return { id: naam, x, y, delen: [{ s: "vw", id: `kz-${naam}`, groep: naam, naam, x, y, maat: 100 }], aria: ding(naam), noem: Hoofd(deDing(naam)), b: 130, h: 120 };
  });
  const goed = dingen[vraagPlek];
  return keuzevraag({
    id,
    beeld: delen,
    keuzes,
    goed,
    vraag: ["Op het grasveld liggen vijf dingen.", `Wat ligt er ${vraagPlek}?`],
    goedZin: [`${Hoofd(deDing(goed))} ligt ${vraagPlek}.`],
    samen: async (l) => {
      zet(l, { licht: [dingen["in het midden"]] });
      await l.zeg(`In het midden ligt ${deDing(dingen["in het midden"])}.`);
      const [hor, ver] = vraagPlek.includes("links") ? ["links", vraagPlek.includes("boven") ? "boven" : "onder"] : ["rechts", vraagPlek.includes("boven") ? "boven" : "onder"];
      zet(l, { licht: [] });
      await l.zeg(`Ga nu naar ${hor}.`, `En dan naar ${ver === "onder" ? "beneden" : ver}.`, "Wat ligt daar?");
    },
    tip: ["Kijk eerst naar links of rechts.", "Dan naar boven of onder."],
  });
}

/** Ballonnen op een rij: "Welke kleur heeft de ballon helemaal rechts/links?" Kiezen uit kleuren. */
function ballonVraag(id: string, kleuren: Kleur[], kant: "rechts" | "links", keuzes: Kleur[]): Vraag {
  const NAAM: Partial<Record<Kleur, string>> = { roze: "ballon", geel: "ballon-geel", oranje: "ballon-oranje", paars: "ballon-paars", blauw: "ballon-blauw", groen: "ballon-groen", rood: "ballon-rood" };
  const delen: Deel[] = kleuren.map((k, i): Deel => ({ s: "vw", id: `bl-${i}`, naam: NAAM[k]!, x: rijX(4, i, 170), y: 270, maat: 150, hoog: 220 }));
  const goed = kant === "rechts" ? kleuren[kleuren.length - 1] : kleuren[0];
  const ander = kant === "rechts" ? kleuren[0] : kleuren[kleuren.length - 1];
  const ks = plaatsKeuzes(keuzes.map((k): Keuze => ({ id: k, delen: [{ s: "vorm", id: `kz-${k}`, groep: k, x: 0, y: 0, maat: 84, vorm: "cirkel", kleur: k }], aria: kw(k), noem: Hoofd(kw(k)), b: 120, h: 110 })), 590);
  return keuzevraag({
    id,
    beeld: delen,
    keuzes: ks,
    goed,
    vraag: [`Welke kleur heeft de ballon helemaal ${kant}?`, "Tik op de kleur."],
    goedZin: [`De ballon helemaal ${kant} is ${kw(goed)}.`],
    samen: async (l) => {
      zet(l, { licht: [kant === "rechts" ? "bl-0" : `bl-${kleuren.length - 1}`] });
      await l.zeg(`Kijk: dit is de ballon helemaal ${kant === "rechts" ? "links" : "rechts"}.`, `Hij is ${kw(ander)}.`, `Helemaal ${kant} is de andere kant.`);
    },
    tip: [`Kijk naar de ballon helemaal aan de ${kant === "rechts" ? "rechter" : "linker"}kant.`],
  });
}

/** Een plaatje en drie zinnen om uit te kiezen. */
function zinVraag(id: string, delen: Deel[], vraag: string[], opties: string[], goed: string, goedZin: string, samen: string[], tip: string[]): Vraag {
  return async (l, st) => {
    const beeld: Beeld = { id, delen };
    return squlaVraag<string>(l, {
      toon: () => toon(l, st, id, { beeld }),
      vraag,
      antwoord: () => kiesWoord(l, opties),
      isGoed: (x) => x === goed,
      noem: (x) => x,
      goed: async () => {
        goedBeeld(l, st, []);
        await l.zeg("Goed zo!", goedZin);
      },
      fout: () => foutBeeld(l, st),
      samen: async () => {
        await l.zeg(...samen);
      },
      tip,
      testAntwoord: goed,
    });
  };
}

/** Drie keer hetzelfde huisje: van boven, van voren, van onder. */
function huisVraag(id: string, volgorde: Zicht[], goed: Zicht, vraag: string[], goedZin: string): Vraag {
  const keuzes: Keuze[] = volgorde.map((z, i) => ({ id: z, x: rijX(3, i, 280), y: 360, delen: [{ s: "huis", id: `kz-${z}`, groep: z, zicht: z, x: rijX(3, i, 280), y: 360, maat: 240 }], aria: `huisje ${i + 1}`, noem: "Dat huisje", b: 260, h: 260 }));
  return keuzevraag({
    id,
    beeld: [],
    keuzes,
    goed,
    vraag,
    goedZin: [goedZin],
    samen: async (l) => {
      await l.zeg("Kijk goed naar de drie huisjes.");
      await wijs(l, [
        [["boven"], "Van bovenaf zie je vooral het dak."],
        [["voren"], "Recht van voren zie je de muur en het dak."],
        [["onder"], "Van onderaf zie je vooral de muur, en bijna geen dak."],
      ]);
      await l.zeg("Welk huisje past erbij?");
    },
    tip: ["Denk na: kijk je van boven, van voren of van onder?"],
  });
}

/** Een bouwsel van blokken: "Wat zie je van bovenaf?" Kiezen uit drie rijtjes. */
function bovenaanzichtVraag(id: string, kolommen: Kleur[][], keuzes: Kleur[][]): Vraag {
  const goed = kolommen.map((k) => k[k.length - 1]);
  const ks = plaatsKeuzes(keuzes.map((k, i) => rijKeuze(`rij${i}`, k)), 600);
  const goedId = `rij${keuzes.findIndex((k) => k.join() === goed.join())}`;
  return keuzevraag({
    id,
    beeld: [{ s: "blokken", id: "blokken", kolommen, x: 490, y: 270, z: 84 }],
    keuzes: ks,
    goed: goedId,
    vraag: ["Bliepo heeft met blokken gebouwd.", "Hij kijkt er recht van boven op.", "Wat ziet hij dan?"],
    goedZin: [`Van boven zie je alleen de bovenste blokken: ${namen(goed.map(kw))}.`],
    samen: async (l) => {
      zet(l, { licht: ["blokken"] });
      await l.zeg("Stel je voor: je staat op een stoel en kijkt naar beneden.", "Dan zie je alleen de bovenkant van elk torentje.", "Welke kleur heeft het bovenste blok van elk torentje?");
    },
    tip: ["Kijk naar het bovenste blok van elk torentje."],
  });
}

/* =====================================================================
   De lessen
   ===================================================================== */

/* ---------- Patronen · level 1 ---------- */

const patronen1 = les({
  id: "squla-vormen-patronen-1",
  titel: "Patronen",
  oefening: "Patronen",
  level: "1",
  kaart: KaartPatronen,
  voorwerpen: ["appel", "banaan", "peer", "mandarijn", "bal", "speelblok", "potlood", "boek"],
  begin: { id: "uitleg", delen: kralenRij(herhaal<Kleur>(["blauw", "geel"], 6)) },
  welkom: ["De kralen komen steeds in dezelfde volgorde terug.", "Welke kraal komt na de rode kraal?"],
  uitleg: async (l, st) => {
    toon(l, st, "uitleg", { beeld: { id: "uitleg", delen: kralenRij(herhaal<Kleur>(["blauw", "geel"], 6)) } });
    zet(l, { licht: ["r-0", "r-1"] });
    await l.zeg("Kijk: blauw, geel.");
    zet(l, { licht: ["r-2", "r-3"] });
    await l.zeg("En weer: blauw, geel.");
    zet(l, { licht: ["r-4", "r-5"] });
    await l.zeg("Het komt steeds terug. Dat is een patroon.", "Na geel komt dus weer blauw.");
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 1: kralen (na de …, nu, lege plek), de ketting langer maken, dingen bij de pijl, vormen, en een puzzel. */
  vragen: [
    kraalVraag("p1-1", ["rood", "groen", "blauw"], 7, "na", ["groen", "blauw", "rood"]),
    kraalVraag("p1-2", ["roze", "geel", "groen"], 7, "na", ["roze", "groen", "geel"]),
    kraalVraag("p1-3", ["paars", "oranje", "groen", "geel"], 6, "na", ["geel", "groen", "paars"]),
    kraalVraag("p1-4", ["rood", "rood", "blauw", "blauw", "groen", "groen"], 7, "nu", ["blauw", "rood", "groen"]),
    kraalVraag("p1-5", ["oranje", "oranje", "groen", "groen", "paars", "paars"], 8, "nu", ["groen", "paars", "oranje"]),
    kraalVraag("p1-6", ["blauw", "oranje", "paars", "groen"], 8, "gat", ["oranje", "blauw", "groen"], 5),
    kraalVraag("p1-7", ["rood", "geel", "blauw"], 8, "gat", ["blauw", "rood", "geel"], 4),
    kettingVraag("p1-8", ["geel", "rood", "blauw", "groen"], 6, ["groen", "geel", "blauw"]),
    kettingVraag("p1-9", ["oranje", "groen", "paars", "rood", "geel"], 7, ["rood", "geel", "paars"]),
    kettingVraag("p1-10", ["paars", "geel", "groen"], 6, ["geel", "groen", "paars"]),
    pijlVraag("p1-11", ["appel", "banaan", "peer", "mandarijn"], 8, 6, ["peer", "appel", "banaan"]),
    pijlVraag("p1-12", ["bal", "speelblok", "potlood", "boek"], 8, 4, ["boek", "bal", "speelblok"]),
    pijlVraag("p1-13", ["bal", "boek", "potlood"], 8, 4, ["potlood", "boek", "bal"]),
    vormRijVraag(
      "p1-14",
      [["vierkant", "groen"], ["driehoek", "oranje"], ["driehoek", "oranje"], ["cirkel", "paars"], ["cirkel", "paars"], ["vierkant", "groen"], ["driehoek", "oranje"]],
      ["driehoek", "oranje"],
      [["cirkel", "paars"], ["driehoek", "oranje"], ["vierkant", "groen"]],
      [["vierkant", "groen"], ["driehoek", "oranje"], ["driehoek", "oranje"], ["cirkel", "paars"], ["cirkel", "paars"]],
    ),
    puzzelVraag(
      "p1-15",
      {
        soort: "raster",
        raster: [
          ["groen", "oranje", "paars", "oranje", "groen"],
          ["oranje", "lichtblauw", "paars", "lichtblauw", "oranje"],
          ["paars", "paars", "paars", "paars", "paars"],
          ["oranje", "lichtblauw", "paars", "lichtblauw", "oranje"],
          ["groen", "oranje", "paars", "oranje", "groen"],
        ],
      },
      3,
      { vraag: ["Nu een puzzel.", "Kijk goed naar het patroon.", "Maak de puzzel."], goedZin: ["Knap gedaan!"] },
    ),
  ],
  eind: "Je kunt een patroon afmaken.",
});

/* ---------- Patronen · level 2 ---------- */

const UITLEG_ROOSTER: Kleur[][] = [
  ["rood", "geel", "blauw"],
  ["blauw", "rood", "geel"],
  ["geel", "blauw", "rood"],
];

const patronen2 = les({
  id: "squla-vormen-patronen-2",
  titel: "Patronen (moeilijker)",
  oefening: "Patronen",
  level: "2",
  kaart: KaartPatronen,
  voorwerpen: ["zon", "maan", "ster", "planeet", "bal", "speelblok", "potlood", "boek", "bloembak", "zonnebloem", "tulp", "bloem"],
  begin: { id: "uitleg", delen: blokRooster(UITLEG_ROOSTER, 120) },
  welkom: ["Nu staan de kralen in rijen onder elkaar.", "Hoe ziet de onderste rij eruit?"],
  uitleg: async (l, st) => {
    toon(l, st, "uitleg", { beeld: { id: "uitleg", delen: blokRooster(UITLEG_ROOSTER, 120) } });
    zet(l, { licht: ["b-0-0", "b-0-1", "b-0-2"] });
    await l.zeg("Kijk naar de bovenste rij: rood, geel, blauw.");
    zet(l, { licht: ["b-1-0", "b-1-1", "b-1-2"] });
    await l.zeg("In de rij eronder schuift alles één plekje op.");
    zet(l, { licht: ["b-0-0", "b-1-0", "b-2-0"] });
    await l.zeg("Van boven naar beneden staat elke kleur één keer.");
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 2: rooster (onderste rij), kralenplank gespiegeld, honingraat, dingen in rijen, kralenplank met pijl, rooster met pijl, draaiende vorm, bloembak, dingen met pijl, puzzel. */
  vragen: [
    onderRijVraag("p2-1", [["groen", "paars", "oranje"], ["oranje", "groen", "paars"]], ["paars", "oranje", "groen"], [["paars", "oranje", "paars"], ["paars", "oranje", "groen"], ["oranje", "groen", "paars"]]),
    onderRijVraag("p2-2", [["blauw", "rood", "geel"], ["geel", "blauw", "rood"]], ["rood", "geel", "blauw"], [["rood", "geel", "blauw"], ["geel", "rood", "blauw"], ["rood", "blauw", "rood"]]),
    spiegelVraag("p2-3", [["paars", "oranje", "groen"], ["oranje", "geel", "oranje"], [null, "oranje", "paars"]], ["paars", "geel", "groen"]),
    spiegelVraag("p2-4", [["blauw", "roze", "rood"], ["roze", "groen", "roze"], [null, "roze", "blauw"]], ["rood", "roze", "blauw"]),
    honingVraag("p2-5", "paars", ["blauw", "oranje", null, "blauw", "oranje", "roze"], ["paars", "roze", "blauw"]),
    honingVraag("p2-6", "geel", ["groen", null, "rood", "groen", "blauw", "rood"], ["blauw", "geel", "rood"]),
    dingRoosterVraag(
      "p2-7",
      [
        ["zon", "maan", "ster", "planeet"],
        ["ster", "planeet", "zon", null],
      ],
      null,
      "maan",
      ["zon", "maan", "planeet"],
      ["zon", "maan", "ster", "planeet"],
    ),
    schuifPlankVraag("p2-8", ["rood", "geel", "groen", "blauw"], 3, 2, 2, ["geel", "rood", "paars"]),
    kolomVraag("p2-9", ["groen", "paars", "oranje"], ["groen", "oranje", "paars", "oranje", "groen"], [1, 2, 3], 3, ["groen", "oranje", "paars"]),
    kolomVraag("p2-10", ["blauw", "geel", "rood"], ["rood", "geel", "blauw", "geel", "rood"], [1, 2, 3], 1, ["rood", "blauw", "geel"]),
    draaiVraag("p2-11", "lichtblauw", 3, [2, 0, 1]),
    draaiVraag("p2-12", "oranje", 1, [1, 3, 2]),
    bloembakVraag("p2-13", ["zonnebloem", "tulp", "zonnebloem", "bloem", "zonnebloem", "tulp"], ["zonnebloem", "bloem"], [["bloem", "zonnebloem"], ["zonnebloem", "bloem"], ["tulp", "zonnebloem"]]),
    dingRoosterVraag(
      "p2-14",
      [
        ["bal", "speelblok", "potlood", "boek"],
        ["speelblok", "potlood", "boek", "bal"],
        ["potlood", "boek", null, null],
      ],
      [2, 3],
      "speelblok",
      ["boek", "speelblok", "bal"],
      ["bal", "speelblok", "potlood", "boek"],
    ),
    puzzelVraag(
      "p2-15",
      {
        soort: "vormen",
        raster: [
          [["cirkel", "geel"], ["driehoek", "blauw"], ["vierkant", "rood"]],
          [["driehoek", "blauw"], ["vierkant", "rood"], ["driehoek", "blauw"]],
          [["vierkant", "rood"], ["driehoek", "blauw"], ["cirkel", "geel"]],
        ],
      },
      3,
      { vraag: ["We zijn bijna klaar.", "Nog even lekker puzzelen.", "Maak de puzzel."], goedZin: ["Knap gedaan!"] },
    ),
  ],
  eind: "Je kunt patronen in rijen afmaken.",
});

/* ---------- Opruimen (Rommelmonster level 2) ---------- */

const SPEELGOED = ["bal", "speelgoedauto", "speelblok"];
const OPRUIM_UITLEG: Beeld = {
  id: "uitleg",
  delen: [...opGrond("a", ["broek", "bal", "boek"]).map((d) => schuif(d, 300, 360)), ...opPlank("b", ["boek", "boek"]).map((d) => schuif(d, 700, 360))],
};

const opruimen = les({
  id: "squla-vormen-opruimen-1",
  titel: "Opruimen",
  oefening: "Rommelmonster",
  level: "2 (level 1 is bij Squla een muziekfilmpje)",
  kaart: KaartOpruimen,
  voorwerpen: ["broek", "t-shirt", "schoen", "jas", "bal", "speelgoedauto", "speelblok", "boek", "potlood", "wandplank", "kledingkast", "tekendoos", "mand", "doos"],
  begin: OPRUIM_UITLEG,
  welkom: ["Er ligt veel door elkaar.", "Op welk plaatje zie je alleen broeken?"],
  uitleg: async (l, st) => {
    toon(l, st, "uitleg", { beeld: OPRUIM_UITLEG });
    zet(l, { licht: ["a"] });
    await l.zeg("Hier ligt alles door elkaar: een broek, een bal en een boek.");
    zet(l, { licht: ["b"] });
    await l.zeg("Hier staan alleen boeken, netjes op de plank.", "Dat is soort bij soort.");
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla level 2: alleen één soort, de goede plek, paren maken en van klein naar groot. */
  vragen: [
    alleenVraag("o-1", "broek", [[["schoen", "schoen", "schoen"], "Hier liggen schoenen."], [["broek", "broek", "broek"], ""], [["broek", "t-shirt", "schoen"], "Hier liggen een broek, een shirt en een schoen door elkaar."]], 1),
    plekVraag(
      "o-2",
      "Het speelgoed hoort op de plank, naast het boek.",
      [
        [opGrond("s0", SPEELGOED), "Hier ligt het speelgoed op de grond."],
        [opPlank("s1", ["boek", ...SPEELGOED]), ""],
        [opGrond("s2", ["bal", "speelgoedauto", "boek"]), "Hier ligt het speelgoed naast het boek, maar op de grond."],
      ],
      1,
      "Het speelgoed staat op de plank, naast het boek.",
    ),
    plekVraag(
      "o-3",
      "De potloden horen in de tekendoos.",
      [
        [opPlank("s0", ["potlood", "potlood", "potlood"]), "Hier liggen de potloden op de plank. Dat klopt niet."],
        [inKast("s1", ["potlood", "potlood", "potlood"]), "Hier liggen de potloden in de kast. Dat is gek."],
        [inBak("s2", ["potlood", "potlood", "potlood"], "tekendoos"), ""],
      ],
      2,
      "De potloden zitten in de tekendoos.",
    ),
    parenVraag(
      "o-4",
      [
        { id: "a1", soort: "kleren", naam: "broek", n: 1 },
        { id: "b1", soort: "blokken", naam: "speelblok", n: 3 },
        { id: "c1", soort: "boeken", naam: "boek", n: 1 },
        { id: "b2", soort: "blokken", naam: "speelblok", n: 5 },
        { id: "c2", soort: "boeken", naam: "boek", n: 2 },
        { id: "a2", soort: "kleren", naam: "t-shirt", n: 1 },
      ],
      { kleren: "kleren", blokken: "blokken", boeken: "boeken" },
    ),
    volgordeVraag("o-5", "boek", true, [[40, 60, 80], [60, 60, 60], [80, 40, 60]], 0),
    alleenVraag("o-6", "schoen", [[["t-shirt", "t-shirt", "t-shirt"], "Hier liggen shirts."], [["schoen", "bal", "broek"], "Hier liggen een schoen, een bal en een broek door elkaar."], [["schoen", "schoen", "schoen"], ""]], 2),
    plekVraag(
      "o-7",
      "De broeken horen in de kast.",
      [
        [inKast("s0", ["broek", "broek", "broek"]), ""],
        [opPlank("s1", ["broek", "broek", "broek"]), "Hier liggen de broeken op de plank. Dat klopt niet."],
        [opGrond("s2", ["broek", "broek", "broek"]), "Hier liggen de broeken op de grond."],
      ],
      0,
      "De broeken liggen netjes in de kast.",
    ),
    parenVraag(
      "o-8",
      [
        { id: "a1", soort: "potloden", naam: "potlood", n: 2 },
        { id: "b1", soort: "ballen", naam: "bal", n: 1 },
        { id: "c1", soort: "kleren", naam: "jas", n: 1 },
        { id: "c2", soort: "kleren", naam: "broek", n: 1 },
        { id: "a2", soort: "potloden", naam: "potlood", n: 4 },
        { id: "b2", soort: "ballen", naam: "bal", n: 3 },
      ],
      { potloden: "potloden", ballen: "ballen", kleren: "kleren" },
    ),
    volgordeVraag("o-9", "speelblok", false, [[90, 90, 90], [110, 50, 80], [50, 80, 110]], 2),
    alleenVraag("o-10", "bal", [[["bal", "speelblok", "bal"], "Hier liggen ballen en een blok door elkaar."], [["bal", "bal", "bal"], ""], [["speelblok", "speelblok", "speelblok"], "Hier liggen blokken."]], 1),
    plekVraag(
      "o-11",
      "De ballen horen in de mand.",
      [
        [opPlank("s0", ["bal", "bal", "bal"]), "Hier liggen de ballen op de plank. Dat klopt niet."],
        [inBak("s1", ["bal", "bal", "bal"], "mand"), ""],
        [inKast("s2", ["bal", "bal", "bal"]), "Hier liggen de ballen in de kast. Dat is gek."],
      ],
      1,
      "De ballen liggen in de mand.",
    ),
    parenVraag(
      "o-12",
      [
        { id: "a1", soort: "autootjes", naam: "speelgoedauto", n: 1 },
        { id: "b1", soort: "kleren", naam: "t-shirt", n: 1 },
        { id: "c1", soort: "blokken", naam: "speelblok", n: 2 },
        { id: "a2", soort: "autootjes", naam: "speelgoedauto", n: 2 },
        { id: "c2", soort: "blokken", naam: "speelblok", n: 4 },
        { id: "b2", soort: "kleren", naam: "jas", n: 1 },
      ],
      { autootjes: "autootjes", kleren: "kleren", blokken: "blokken" },
    ),
    volgordeVraag("o-13", "bal", false, [[100, 60, 80], [55, 80, 105], [80, 80, 80]], 1),
    alleenVraag("o-14", "boek", [[["potlood", "potlood", "potlood"], "Hier liggen potloden."], [["boek", "potlood", "boek"], "Hier liggen boeken en een potlood door elkaar."], [["boek", "boek", "boek"], ""]], 2),
    volgordeVraag("o-15", "doos", false, [[60, 85, 110], [110, 85, 60], [85, 85, 85]], 0),
  ],
  eind: "Je kunt opruimen: soort bij soort, en van klein naar groot.",
});

/* ---------- Oriënteren ---------- */

const ORIENT_UITLEG: Beeld = {
  id: "uitleg",
  delen: [
    { s: "veld", id: "veld", soort: "gras", x: VELD.x, y: VELD.y, b: VELD.b, h: VELD.h },
    { s: "vw", id: "ding", naam: "bal", x: PLEK.linksboven[0], y: PLEK.linksboven[1], maat: 96 },
  ],
};

const orienteren = les({
  id: "squla-vormen-orienteren-1",
  titel: "Links, rechts, boven, onder",
  oefening: "Oriënteren",
  level: "1",
  kaart: KaartOrienteren,
  voorwerpen: ["bal", "bus", "vlieger", "skateboard", "speelgoedauto", "boek", "speelblok", "ballon", "ballon-geel", "ballon-oranje", "ballon-paars", "ballon-blauw", "ballon-groen", "ballon-rood", "boom"],
  begin: ORIENT_UITLEG,
  welkom: ["Een bal ligt op een grasveld.", "Waar ligt de bal?"],
  uitleg: async (l, st) => {
    toon(l, st, "uitleg", { beeld: ORIENT_UITLEG });
    zet(l, { licht: ["ding"] });
    await l.zeg("Kijk naar de bal.", "Hij ligt bovenaan het grasveld.", "En hij ligt aan de linkerkant.", "Hij ligt dus linksboven.");
    zet(l, { licht: [] });
    await l.verder();
  },
  /* Zoals Squla: plaats op een plaatje (1–8), dan van welke kant je kijkt (9–15). */
  vragen: [
    plekWoordVraag({ id: "or-1", veld: "gras", ding: "bal", dingPlek: "rechtsonder", opties: ["linksboven", "rechtsonder", "rechtsboven", "in het midden"] }),
    plekWoordVraag({ id: "or-2", veld: "gras", ding: "bal", dingPlek: "linksonder", opties: ["linksonder", "rechtsboven", "in het midden", "linksboven"] }),
    plekWoordVraag({ id: "or-3", veld: "stad", ding: "bus", dingPlek: "rechtsonder", stipPlek: "linksboven", opties: ["rechtsboven", "linksboven", "links van het midden", "rechtsonder"] }),
    welkDingVraag("or-4", { linksboven: "vlieger", rechtsboven: "skateboard", "in het midden": "bal", linksonder: "speelgoedauto", rechtsonder: "boek" }, "linksonder"),
    welkDingVraag("or-5", { linksboven: "speelblok", rechtsboven: "speelgoedauto", "in het midden": "boek", linksonder: "skateboard", rechtsonder: "vlieger" }, "rechtsboven"),
    ballonVraag("or-6", ["groen", "rood", "blauw", "geel"], "rechts", ["rood", "geel", "blauw", "groen"]),
    ballonVraag("or-7", ["oranje", "paars", "groen", "blauw"], "links", ["blauw", "groen", "oranje", "paars"]),
    plekWoordVraag({ id: "or-8", veld: "stad", ding: "bus", dingPlek: "linksonder", stipPlek: "rechtsboven", invullen: true, opties: ["linksonder", "rechtsboven", "links van het midden", "rechtsonder"] }),
    zinVraag(
      "or-9",
      [
        { s: "veld", id: "veld", soort: "hinkel", x: 490, y: 340, b: 420, h: 480 },
        { s: "vw", id: "bal", naam: "bal", x: 600, y: 470, maat: 70 },
      ],
      ["Dit is een hinkelbaan met een bal.", "Je ziet hem van bovenaf.", "Waar ben jij als je dit ziet?"],
      ["Op een bankje in het park", "Hoog in een flat, bij het raam", "Liggend in het gras"],
      "Hoog in een flat, bij het raam",
      "Je kijkt van hoog naar beneden.",
      ["Kijk: je ziet de hinkelbaan van bovenaf.", "Je kijkt er dus van hoog naar beneden.", "Waar kun je hoog zijn?"],
      ["Van waar kun je naar beneden kijken?"],
    ),
    zinVraag(
      "or-10",
      [
        { s: "veld", id: "veld", soort: "lucht", x: 490, y: 340, b: 560, h: 420 },
        { s: "vw", id: "boom", naam: "boom", x: 490, y: 300, maat: 280 },
      ],
      ["Je maakt een foto van een boom.", "Je ziet de boom recht van voren.", "Waar houd je de camera?"],
      ["Laag bij de grond", "Hoog in een flat", "Voor je gezicht"],
      "Voor je gezicht",
      "Dan zie je de boom recht van voren.",
      ["Stel je voor: je staat hoog in een flat.", "Dan zie je de boom van boven.", "Houd je de camera laag bij de grond?", "Dan zie je de boom van onder.", "Hier zie je hem recht van voren."],
      ["Waar zie je de boom recht van voren?"],
    ),
    huisVraag("or-11", ["voren", "boven", "onder"], "boven", ["Bliepo vliegt hoog boven het huis.", "Hoe ziet hij het huis?"], "Van bovenaf zie je vooral het dak."),
    huisVraag("or-12", ["boven", "onder", "voren"], "onder", ["Je ligt in het gras voor het huis.", "Je kijkt omhoog.", "Hoe zie je het huis?"], "Van onderaf zie je vooral de muur."),
    huisVraag("or-13", ["onder", "voren", "boven"], "voren", ["Je staat recht voor het huis.", "Hoe zie je het huis?"], "Recht van voren zie je de muur en het dak."),
    bovenaanzichtVraag(
      "or-14",
      [["rood"], ["blauw", "groen"], ["geel", "rood", "blauw"]],
      [["rood", "blauw", "geel"], ["rood", "groen", "blauw"], ["rood", "rood", "blauw"]],
    ),
    bovenaanzichtVraag(
      "or-15",
      [["paars", "oranje", "groen"], ["geel", "rood"], ["blauw"]],
      [["groen", "rood", "blauw"], ["paars", "geel", "blauw"], ["groen", "geel", "blauw"]],
    ),
  ],
  eind: "Je weet waar dingen zijn, en van welke kant je kijkt.",
});

/* ---------- Vormen en kleuren: puzzels ---------- */

const PUZZEL_UITLEG = async (l: Lesgids) => {
  await l.zeg("Eerst zie je het hele plaatje.", "Dan valt het in stukjes.", "Sleep elk stukje naar zijn eigen plek.", "Op de goede plek klikt het vast.");
  await l.verder();
};

const kleurPuzzels: [number, number][] = [
  [6, 4],
  [4, 3],
  [0, 2],
  [3, 4],
  [7, 3],
  [5, 2],
  [9, 4],
  [1, 3],
  [8, 2],
  [10, 4],
  [13, 3],
  [2, 2],
  [12, 4],
  [11, 3],
  [14, 2],
];

const kleuren1 = les({
  id: "squla-vormen-kleuren-1",
  titel: "Vormen en kleuren",
  oefening: "Vormen en kleuren",
  level: "1 (kleuren)",
  kaart: KaartPuzzel,
  voorwerpen: [...new Set(Object.values(PUZZEL_VOORWERPEN).flat())],
  begin: { id: "begin", delen: (["rood", "oranje", "geel", "groen", "blauw", "paars"] as Kleur[]).map((k, i): Deel => ({ s: "vorm", id: `v-${i}`, x: rijX(6, i, 130), y: 330, maat: 110, vorm: "vierkant", kleur: k })) },
  welkom: ["Een kleurrijk plaatje valt in zestien stukjes.", "Maak de puzzel."],
  uitleg: (l) => PUZZEL_UITLEG(l),
  /* Zoals Squla level 1 (16, 9 en 4 stukjes), steeds opnieuw met een ander kleurenplaatje. */
  vragen: kleurPuzzels.map(([nr, n], i) => puzzelVraag(`k1-${i + 1}`, { soort: "kleur", nr }, n)),
  eind: "Je kunt puzzelen met kleuren.",
});

const PLAT: [Platvorm, Kleur][][] = [
  [["cirkel", "blauw"], ["driehoek", "oranje"], ["rechthoek", "groen"], ["ster", "geel"], ["vierkant", "rood"]],
  [["cirkel", "groen"], ["driehoek", "rood"], ["rechthoek", "paars"], ["ster", "oranje"], ["vierkant", "lichtblauw"]],
  [["cirkel", "geel"], ["driehoek", "blauw"], ["rechthoek", "roze"], ["ster", "rood"], ["vierkant", "paars"]],
];
const RUIMTE: [Ruimtevorm, Kleur][][] = [
  [["bol", "rood"], ["cilinder", "groen"], ["kegel", "blauw"], ["kubus", "geel"], ["piramide", "paars"]],
  [["bol", "oranje"], ["cilinder", "blauw"], ["kegel", "rood"], ["kubus", "groen"], ["piramide", "lichtblauw"]],
  [["bol", "paars"], ["cilinder", "geel"], ["kegel", "groen"], ["kubus", "rood"], ["piramide", "oranje"]],
];
/** Zoals Squla level 2 en 3: 4, 4, 9, 9 en 16 stukjes. */
const STUKJES = [2, 2, 3, 3, 4];

const vormPuzzels = (pre: string, rondes: [VormNaam, Kleur][][]) =>
  rondes.flatMap((ronde, r) => ronde.map(([vorm, kleur], i) => puzzelVraag(`${pre}-${r * 5 + i + 1}`, { soort: "vorm", vorm, kleur }, STUKJES[i], { goedZin: [`Het is een ${VORM[vorm][1]}.`] })));

const kleuren2 = les({
  id: "squla-vormen-kleuren-2",
  titel: "Vormen en kleuren (moeilijker)",
  oefening: "Vormen en kleuren",
  level: "2 (platte vormen)",
  kaart: KaartPuzzel,
  voorwerpen: [],
  begin: { id: "begin", delen: PLAT[0].map(([v, k], i): Deel => ({ s: "vorm", id: `v-${i}`, x: rijX(5, i, 160), y: 330, maat: 140, vorm: v, kleur: k })) },
  welkom: ["Een blauwe cirkel valt in stukjes.", "Maak de puzzel."],
  uitleg: (l) => PUZZEL_UITLEG(l),
  vragen: vormPuzzels("k2", PLAT),
  eind: "Je kunt puzzelen met platte vormen.",
});


const kleuren3 = les({
  id: "squla-vormen-kleuren-3",
  titel: "Vormen en kleuren (nog moeilijker)",
  oefening: "Vormen en kleuren",
  level: "3 (ruimtelijke vormen)",
  kaart: KaartPuzzel,
  voorwerpen: [],
  begin: { id: "begin", delen: RUIMTE[0].map(([v, k], i): Deel => ({ s: "vorm", id: `v-${i}`, x: rijX(5, i, 160), y: 330, maat: 140, vorm: v, kleur: k })) },
  welkom: ["Een rode bol valt in stukjes.", "Maak de puzzel."],
  uitleg: (l) => PUZZEL_UITLEG(l),
  vragen: vormPuzzels("k3", RUIMTE),
  eind: "Je kunt puzzelen met ruimtelijke vormen.",
});

export const LESSEN_SQULA_VORMEN: Lesdraaiboek[] = [patronen1, patronen2, opruimen, orienteren, kleuren1, kleuren2, kleuren3];
