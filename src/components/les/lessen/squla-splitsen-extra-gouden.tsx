/**
 * DE EXTRA LES SPLITSEN (12 november 2026; besluit Sara 21.7; BOUWREGELS hoofdstuk 15; LESRECEPT.md).
 *
 *   squla-splits-splitsen1-1-gouden-extra — een APARTE les naast de gouden les squla-splits-splitsen1-1-gouden. De gouden
 *   les verandert niet. Dit zijn de Synthesis-opdrachten uit het draaiboek Splitsen (Part Part Whole) die niet in de
 *   Squla-les zitten: de splitsmachine met het totaal boven en 2 delen onder (een min en een plus bij elk deel), de
 *   somvraag "welke som heb je gemaakt?", het lijstje met gevonden sommen, een andere manier voor 5, een nieuw totaal,
 *   "zoek 2 delen die samen 7 maken", "nog een manier", en kiezen tussen 8 en 10 (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/splitsen.md,
 *   stap 7 t/m 16; getallen 5, 7, 8 en 10).
 *
 * Niet gebouwd (de stof past niet bij Squla of is Engels; draaiboek §10): de woorden "samenstellen" en "ontleden", de piano,
 * "weet je nog hoe dat heet?" en de tegel van 5. Het getal 12 uit "Larger" is 10 geworden: Squla splitsen gaat tot 10.
 *
 * Laag 1 (Bliepo): 2 pogingen (15.11): 1e fout = eerste zin (de denkfout) en een hint uit de fouttabel, daarna nog 1 keer;
 * 2e fout = uitleg en samen voordoen, de les gaat door. Het hulphandje komt vanzelf na ± 6 s stilte bij een opdracht (15.19),
 * niet bij een keuzevraag. Rood scherm 1,5 s, groen 1 s, geen fout-geluidje. Heel snel antwoorden: Bliepo zegt niets
 * (draaiboek §3 B.7, F.8). Bliepo praat door (15.27); de pijl staat rechts.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst; alleen als er een kind gekozen is); mislukt dat, dan gaat de les door.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { KaartSplitsenExtra, SplitsExtraVlak, type Knop, type Kop, type Som, type SplitsExtraProps } from "../vlakken/squla-splitsen-extra-vlak";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { zetTestAntwoord } from "./squla-hulp";
import { maakBasis, schud, type Fout, type Uitkomst } from "./squla-extra-basis";
import {
  AANMOEDIG_TIKKEN,
  KEUZE_GELIJK,
  KEUZE_GROTER,
  NAAM_GROET,
  NIEUWKEUZES,
  SOMKEUZES,
  SPLITSREACTIE,
  SPLITSREACTIE_ROBOT,
  TOTAAL5,
  TOTAAL7,
  TUSSENKEUZES,
  ZIN,
  foutenNieuw,
  foutenSom,
  foutenTotaal,
  splitsFout,
  tussenFout,
  A,
  B_DEEL,
} from "./squla-splitsen-extra-zinnen";

const LES_ID = "squla-splits-splitsen1-1-gouden-extra";
const B = maakBasis(LES_ID);
const VANGNET_MS = 20000;
const DENK_MS = 200;
const ALLE_KNOPPEN: Knop[] = ["min0", "plus0", "min1", "plus1"];
const zet = (l: Lesgids, p: Partial<SplitsExtraProps>) => l.pasVlakAan<SplitsExtraProps>(p);
const robotGehad = new WeakSet<Lesgids>();

type Paar = [number, number];
type Stand = { delen: [number, number]; lijst: Som[] };
const stand = new WeakMap<Lesgids, Stand>();
const S = (l: Lesgids): Stand => {
  let x = stand.get(l);
  if (!x) stand.set(l, (x = { delen: [0, 0], lijst: [] }));
  return x;
};
const zetDelen = (l: Lesgids) => zet(l, { delen: [...S(l).delen] as [number, number] });
const zelfde = (p: Paar, a: number, b: number) => p[0] === a && p[1] === b;

/* ---------- stap 7: de machine stap voor stap (doe-stappen zonder goed of fout) ---------- */

async function tikTot(l: Lesgids, o: { id: string; deel: 0 | 1; d: 1 | -1; doel: number; knop: Knop; zin: string; hand: string }) {
  const s = S(l);
  const test = `${o.d > 0 ? "plus" : "min"}-${o.deel}`;
  zet(l, { actief: [o.knop], ring: o.knop, hand: null });
  zetTestAntwoord(test);
  B.haak(l, { soort: "tel", goed: test, vraag: o.id });
  const hk = B.handKlok(l, { aan: () => zet(l, { hand: o.knop }), uit: () => zet(l, { hand: null }), zin: `${AANMOEDIG_TIKKEN[B.st(l).fout % 2]} ${o.hand}` });
  void B.zegOpdracht(l, o.zin).catch(() => {});
  hk.opnieuw();
  let sinds = Date.now();
  try {
    while (s.delen[o.deel] !== o.doel) {
      const rest = Math.max(500, VANGNET_MS - (Date.now() - sinds));
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; deel: number; d: number }>("knop"), l.wacht(rest).then(() => null)]);
      if (t === null) {
        /* Vangnet: 20 s geen tik; Bliepo doet de rest zelf (de les loopt nooit vast). */
        B.log(l, "vangnet", { id: o.id });
        while (s.delen[o.deel] !== o.doel) {
          s.delen[o.deel] += o.d;
          zetDelen(l);
          speelLesgeluid("tik");
          await l.wacht(450);
        }
        break;
      }
      if (t.deel !== o.deel || t.d !== o.d) continue;
      B.log(l, "tik", { x: test });
      s.delen[o.deel] += o.d;
      zetDelen(l);
      speelLesgeluid("tik");
      sinds = Date.now();
      hk.opnieuw();
    }
  } finally {
    hk.stop();
    zet(l, { actief: [], ring: null, hand: null });
    B.haak(l, null);
    zetTestAntwoord(null);
  }
  await l.wacht(DENK_MS);
}

/** Bliepo telt de stippen van het totaal, een voor een (nummers 1 t/m n). */
async function telTotaal(l: Lesgids, n: number) {
  for (let i = 1; i <= n; i++) {
    zet(l, { telTotaal: i, ring: "totaal" });
    await l.wacht(420);
  }
  await l.wacht(300);
}

/** Lof + de zin met het aantal: de lofzin en de reactie beginnen niet allebei met hetzelfde woord, de robotzin hooguit 1 keer. */
function reactie(l: Lesgids, a: number, b: number, t: number, lofZin: string): string {
  const r = SPLITSREACTIE(a, b, t);
  const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();
  const zonder = r.zinnen.map((_, i) => i).filter((i) => woord(r.zinnen[i]) === woord(lofZin));
  if (robotGehad.has(l)) zonder.push(SPLITSREACTIE_ROBOT);
  const z = B.kies(l, r, zonder);
  if (z === r.zinnen[SPLITSREACTIE_ROBOT]) robotGehad.add(l);
  return z;
}

/* ---------- stap 7 en 11: "wat staat er in het totaal?" en "welk getal is het?" ---------- */

async function totaalVraag(l: Lesgids) {
  zet(l, { totaal: null, ring: null, actief: [] });
  return B.keuzeVraag(l, {
    id: "totaal-5",
    opties: schud(["3", "2", "5"]),
    goed: "5",
    zinnen: [ZIN.vraagTotaal],
    eerste: true,
    fout: (x) => foutenTotaal()[x],
    bijGoed: async (poging, lofZin) => {
      zet(l, { ring: "totaal", goed: B.st(l).goed });
      if (poging === 1) await B.zegDoor(l, lofZin, ZIN.totaalGoed);
      else await B.zegDoor(l, lofZin);
      zet(l, { ring: null });
    },
    bijFout: () => zet(l, { fout: B.st(l).fout }),
    samen: async () => {
      await telTotaal(l, TOTAAL5);
      await B.zegDoor(l, ZIN.totaalTel(TOTAAL5));
      zet(l, { telTotaal: 0, ring: null });
    },
  });
}

async function nieuwTotaalVraag(l: Lesgids) {
  const s = S(l);
  s.delen = [0, 0];
  s.lijst = [];
  void l.zeg().catch(() => {});
  zet(l, { id: "nieuw7", delen: [0, 0], totaal: TOTAAL7, ring: null, actief: [], kop: null, lijst: [], hand: null, telTotaal: 0 });
  speelLesgeluid("verschijn");
  await l.wacht(150);
  return B.keuzeVraag(l, {
    id: "nieuw-totaal-7",
    opties: schud(NIEUWKEUZES),
    goed: String(TOTAAL7),
    zinnen: ZIN.nieuwTotaal,
    fout: (x) => foutenNieuw()[x],
    bijGoed: async (poging, lofZin) => {
      zet(l, { goed: B.st(l).goed });
      if (poging === 1) await B.zegDoor(l, lofZin, ZIN.nieuwGoed);
      else await B.zegDoor(l, lofZin);
    },
    bijFout: () => zet(l, { fout: B.st(l).fout }),
    samen: async () => {
      await telTotaal(l, TOTAAL7);
      await B.zegDoor(l, ZIN.nieuwTel);
      zet(l, { telTotaal: 0, ring: null });
    },
  });
}

/* ---------- stap 9: welke som heb je gemaakt? (met de tussenvraag na een fout) ---------- */

async function somVraag(l: Lesgids) {
  const s = S(l);
  const goed: Som = { a: A, b: B_DEEL, t: TOTAAL5 };
  const voegToe = () => {
    s.lijst = [...s.lijst, goed];
    zet(l, { lijst: s.lijst });
  };
  return B.keuzeVraag(l, {
    id: "som-3-2-5",
    opties: schud(SOMKEUZES),
    goed: SOMKEUZES[0],
    zinnen: ZIN.vraagSom,
    fout: (x) => foutenSom()[x],
    bijGoed: async (poging, lofZin) => {
      voegToe();
      zet(l, { goed: B.st(l).goed });
      if (poging === 1) await B.zegDoor(l, lofZin, ZIN.somGoed);
      else await B.zegDoor(l, lofZin);
    },
    bijFout: () => zet(l, { fout: B.st(l).fout }),
    samen: async () => {
      /* Draaiboek §3 C.2: de tussenvraag "en wat is 3 + 2?". 1 poging; daarna zegt Bliepo het (samen voordoen). */
      const opties = schud(TUSSENKEUZES);
      zetTestAntwoord("5");
      B.haak(l, { soort: "kies", opties, goed: "5", poging: 1, vraag: "tussen-3-2", fout: ["4", "32"] });
      const x = await B.vraagMetKnoppen(l, opties, [ZIN.tussen]);
      B.haak(l, null);
      await l.wacht(DENK_MS);
      voegToe();
      if (x === "5") {
        B.goedMoment(l);
        zet(l, { goed: B.st(l).goed });
        await B.zegDoor(l, ZIN.tussenGoed);
        return;
      }
      B.foutMoment(l);
      zet(l, { fout: B.st(l).fout });
      const f = tussenFout(x);
      B.legDenkfoutVast(l, { vraag: "som-3-2-5", antwoord: x, denkfout: f.code, poging: 2 });
      B.log(l, "reactie", { soort: "tussen-fout", x, denkfout: f.code, zin: f.uitleg });
      await B.zegDoor(l, f.uitleg);
    },
  });
}

/* ---------- stap 10, 12, 14, 15: een splitsopdracht (de delen zoeken met de plus en de min) ---------- */

type Opdracht = {
  id: string;
  /** Het totaal dat het kind moet maken. */
  T: number;
  /** Het totaal staat vast in de bovenste cirkel (anders groeit het mee). */
  vast: boolean;
  kop: Kop | null;
  opdracht: string;
  hand: string;
  /** Met het vinkje (anders vanzelf nagekeken zodra het klopt, na 0,7 s rust). */
  vinkje: boolean;
  /** Een omgedraaide som telt goed (bij 5) of niet (bij 7). */
  ruil: "goed" | "niet";
  gehad: Paar[];
  /** Wat Bliepo zegt bij goed (de les zet er de lofzin voor); leeg = de standaardreactie. */
  goedZinnen?: (lofZin: string, a: number, b: number, poging: 1 | 2) => string[];
  /** Het kind moet tikken (niet kiezen): na een "al gevonden" blijft dezelfde opdracht staan. */
  eerste?: boolean;
};

/** Het eerste paar dat nog niet gehad is (voor de test en voor het samen voordoen). */
function nieuwPaar(T: number, gehad: Paar[]): Paar {
  for (let k = 1; k < T; k++) if (!gehad.some((p) => (p[0] === k && p[1] === T - k) || (p[0] === T - k && p[1] === k))) return [k, T - k];
  return [1, T - 1];
}

async function splitsOpdracht(l: Lesgids, o: Opdracht): Promise<{ uitkomst: Uitkomst; paar: Paar }> {
  const s = S(l);
  const st = B.st(l);
  st.vraag++;
  s.delen = [0, 0];
  zet(l, { id: o.id, delen: [0, 0], totaal: o.vast ? o.T : null, actief: ALLE_KNOPPEN, kop: o.kop, ring: null, hand: null, lijst: s.lijst, telTotaal: 0 });
  await l.wacht(150);
  let eerder: Fout | null = null;
  let eersteX = "";
  let zin: Promise<void> = B.zegOpdracht(l, o.opdracht);
  const testStap = () => {
    const doel = nieuwPaar(o.T, o.gehad);
    if (s.delen[0] < doel[0]) return "plus-0";
    if (s.delen[0] > doel[0]) return "min-0";
    if (s.delen[1] < doel[1]) return "plus-1";
    if (s.delen[1] > doel[1]) return "min-1";
    return null;
  };
  let poging: 1 | 2 = 1;
  for (;;) {
    const hk = B.handKlok(l, { aan: () => zet(l, { hand: s.delen[0] <= s.delen[1] ? "plus0" : "plus1" }), uit: () => zet(l, { hand: null }), zin: poging === 1 && !s.lijst.length ? `${AANMOEDIG_TIKKEN[st.fout % 2]} ${o.hand}` : null });
    zet(l, { actief: ALLE_KNOPPEN });
    hk.opnieuw();
    B.haak(l, { soort: o.vinkje ? "maak" : "auto", poging, vraag: o.id });
    try {
      for (;;) {
        zetTestAntwoord(testStap());
        const auto = !o.vinkje && s.delen[0] + s.delen[1] === o.T && s.delen[0] > 0 && s.delen[1] > 0;
        const volgend = l.wachtOpVlak<{ soort: string; deel: number; d: number }>("knop");
        const klaar = o.vinkje ? l.knoppen(["controleer"]).then(() => null) : auto ? l.wacht(700).then(() => null) : new Promise<null>(() => {});
        const r = await Promise.race([klaar, volgend]);
        if (r === null) break;
        s.delen[r.deel] = Math.max(0, Math.min(10, s.delen[r.deel] + r.d));
        B.log(l, "tik", { x: `${r.d > 0 ? "plus" : "min"}-${r.deel}` });
        zetDelen(l);
        speelLesgeluid("tik");
        hk.opnieuw();
      }
    } finally {
      hk.stop();
      zetTestAntwoord(null);
      B.haak(l, null);
    }
    void zin.catch(() => {});
    await l.wacht(DENK_MS);
    const [a, b] = s.delen;
    const klopt = a + b === o.T && a > 0 && b > 0;
    if (klopt) {
      const exact = o.gehad.some((p) => zelfde(p, a, b));
      const omgedraaid = !exact && o.gehad.some((p) => zelfde(p, b, a));
      if (exact || (omgedraaid && o.ruil === "niet")) {
        /* Al gevonden of omgedraaid (bij 7): telt niet als fout (draaiboek §3 F.4 en F.5). Het kind probeert opnieuw. */
        zet(l, { actief: [] });
        await B.zegDoor(l, exact ? ZIN.alGevonden(a, b, o.T) : ZIN.omgedraaid);
        s.delen = [0, 0];
        zet(l, { delen: [0, 0] });
        zin = Promise.resolve();
        continue;
      }
      B.goedMoment(l);
      zet(l, { actief: [], goed: st.goed });
      s.lijst = [...s.lijst, { a, b, t: o.T }];
      zet(l, { lijst: s.lijst });
      o.gehad.push([a, b]);
      const lofZin = poging === 1 ? B.lof(l, !!o.eerste) : B.bevestig(l);
      const zinnen = o.goedZinnen ? o.goedZinnen(lofZin, a, b, poging) : poging === 1 ? [lofZin, reactie(l, a, b, o.T, lofZin)] : [lofZin];
      await B.zegDoor(l, ...(omgedraaid && o.ruil === "goed" ? [lofZin, ZIN.omgedraaid5] : zinnen));
      return { uitkomst: B.noteer(l, o.id, poging === 1 ? "goed" : "naFout"), paar: [a, b] };
    }
    B.foutMoment(l);
    zet(l, { actief: [], fout: st.fout });
    const f = splitsFout(a, b, o.T, st.vraag);
    const sleutel = `${a}+${b}`;
    B.legDenkfoutVast(l, { vraag: o.id, antwoord: sleutel, denkfout: f.code, poging });
    const fz = B.foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && sleutel === eersteX && fz[0] === f.eerste && f.weer.length) fz.splice(0, fz.length, ...f.weer);
    B.log(l, "reactie", { soort: `fout${poging}`, vraag: o.id, x: sleutel, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* 1e fout: de eerste zin (vanzelf door), dan de hint terwijl het kind weer mag tikken. De delen blijven staan. */
      await B.zegDoor(l, fz[0]);
      zin = B.zegOpdracht(l, fz.slice(1).join(" "));
      eerder = f;
      eersteX = sleutel;
      poging = 2;
      continue;
    }
    /* 2e fout: uitleg en samen voordoen (draaiboek §3 F.6): Bliepo zet het linkerdeel, het kind zoekt het andere deel. */
    await B.zegDoor(l, ...fz);
    const [k, rest] = nieuwPaar(o.T, o.gehad);
    s.delen = [k, 0];
    zet(l, { delen: [k, 0], actief: ["plus1", "min1"], ring: "plus1", hand: null });
    zetTestAntwoord("plus-1");
    B.haak(l, { soort: "tel", goed: "plus-1", vraag: o.id });
    const finishSamen = async (zelf: boolean) => {
      await l.wacht(DENK_MS);
      s.lijst = [...s.lijst, { a: k, b: rest, t: o.T }];
      zet(l, { lijst: s.lijst });
      o.gehad.push([k, rest]);
      await B.zegDoor(l, zelf ? ZIN.samenZelf(k, o.T) : ZIN.samenKlaar(k, o.T));
    };
    const hk2 = B.handKlok(l, { aan: () => zet(l, { hand: "plus1" }), uit: () => zet(l, { hand: null }), zin: `${AANMOEDIG_TIKKEN[st.fout % 2]} ${ZIN.samenHand}` });
    void B.zegOpdracht(l, ZIN.samenZet(k, st.vraag)).catch(() => {});
    hk2.opnieuw();
    let sinds = Date.now();
    try {
      while (s.delen[1] !== rest) {
        const wacht = Math.max(500, VANGNET_MS - (Date.now() - sinds));
        const t = await Promise.race([l.wachtOpVlak<{ soort: string; deel: number; d: number }>("knop"), l.wacht(wacht).then(() => null)]);
        if (t === null) {
          B.log(l, "vangnet", { id: o.id });
          while (s.delen[1] < rest) {
            s.delen[1]++;
            zetDelen(l);
            speelLesgeluid("tik");
            await l.wacht(450);
          }
          await finishSamen(true);
          return { uitkomst: B.noteer(l, o.id, "samen"), paar: [k, rest] };
        }
        if (t.deel !== 1) continue;
        s.delen[1] = Math.max(0, Math.min(10, s.delen[1] + t.d));
        zetDelen(l);
        speelLesgeluid("tik");
        sinds = Date.now();
        hk2.opnieuw();
      }
    } finally {
      hk2.stop();
      zet(l, { actief: [], ring: null, hand: null });
      B.haak(l, null);
      zetTestAntwoord(null);
    }
    await finishSamen(false);
    return { uitkomst: B.noteer(l, o.id, "samen"), paar: [k, rest] };

  }
}
/* ---------- stap 15: kiezen (geen goed of fout) ---------- */

async function keuzeGetal(l: Lesgids): Promise<number> {
  const s = S(l);
  s.lijst = [];
  void l.zeg().catch(() => {});
  zet(l, { id: "keuze", delen: [0, 0], totaal: null, ring: null, actief: [], kop: null, lijst: [], hand: null, telTotaal: 0 });
  await l.wacht(150);
  const opties = schud([ZIN.keuzeGelijk, ZIN.keuzeGroter]);
  zetTestAntwoord(ZIN.keuzeGelijk);
  B.st(l).vraag++;
  B.haak(l, { soort: "kies", opties, goed: ZIN.keuzeGelijk, poging: 1, vraag: "keuze-getal", fout: [] });
  const x = await B.vraagMetKnoppen(l, opties, ZIN.keuzeVraag);
  B.haak(l, null);
  zetTestAntwoord(null);
  await l.wacht(DENK_MS);
  return x === ZIN.keuzeGroter ? KEUZE_GROTER : KEUZE_GELIJK;
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-splits-splitsen1-1-gouden-extra",
  titel: "Splitsen, extra",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla). */
  synthesis: "Squla groep 3 · Splitsen · Splitsen tot 10 · level 1 · gouden les, extra (Synthesis-opdrachten uit het draaiboek Splitsen die niet in de Squla-les zitten: de splitsmachine, welke som heb je gemaakt, zoek 2 delen)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  pijlZoalsSynthesis: true,
  stemHeelUitpraten: true,
  woordenMeeMetStem: true,
  kaarttekening: KaartSplitsenExtra,
  async speel(l) {
    stand.delete(l);
    B.log(l, "start");
    /* Stap 1. Openen: de lege machine; Bliepo groet en zegt wat we gaan doen, in 1 stuk. */
    l.vlak<SplitsExtraProps>(SplitsExtraVlak, { id: "start", delen: [0, 0], totaal: null, actief: [] });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    B.st(l).naamKeer = 1;
    B.st(l).naamVraag = 0;
    await B.zegDoor(l, NAAM_GROET, ZIN.begin.join(" "));

    /* Stap 7. De machine stap voor stap: 4 maken, 1 eraf (3), en 2 in het andere deel (totaal 5). */
    await tikTot(l, { id: "machine-plus-4", deel: 0, d: 1, doel: 4, knop: "plus0", zin: ZIN.a1, hand: ZIN.a1Hand });
    await B.zegDoor(l, ZIN.a1Klaar);
    await tikTot(l, { id: "machine-min-3", deel: 0, d: -1, doel: 3, knop: "min0", zin: ZIN.a2, hand: ZIN.a2Hand });
    zet(l, { ring: "totaal" });
    await B.zegDoor(l, ...ZIN.a2Klaar);
    zet(l, { ring: null });
    await tikTot(l, { id: "machine-plus-2", deel: 1, d: 1, doel: 2, knop: "plus1", zin: ZIN.a3, hand: ZIN.a3Hand });
    /* Wat staat er nu in het totaal? */
    await totaalVraag(l);
    /* Stap 9. Welke som heb je gemaakt? */
    await somVraag(l);

    /* Stap 10. Kun je 5 ook anders splitsen? (omgedraaid telt hier goed) */
    const gehad5: Paar[] = [[A, B_DEEL]];
    await splitsOpdracht(l, { id: "ander-5", T: TOTAAL5, vast: true, kop: null, opdracht: ZIN.anders.join(" "), hand: ZIN.andersHand, vinkje: false, ruil: "goed", gehad: gehad5 });

    /* Stap 11. Een nieuw totaal: welk getal is het? */
    await nieuwTotaalVraag(l);
    /* Stap 12. Zoek 2 delen die samen 7 maken. */
    const gehad7: Paar[] = [];
    await splitsOpdracht(l, { id: "zoek-7", T: TOTAAL7, vast: true, kop: ZIN.zoekKop, opdracht: ZIN.zoekOpdracht, hand: ZIN.zoekHand, vinkje: true, ruil: "niet", gehad: gehad7, goedZinnen: (lof, a, b, p) => (p === 1 ? [lof, ZIN.goedSplits(a, b, TOTAAL7)] : [lof]) });
    /* Stap 14. Nog een manier voor 7. */
    await splitsOpdracht(l, { id: "nog-7", T: TOTAAL7, vast: true, kop: ZIN.nogKop, opdracht: ZIN.nogOpdracht, hand: ZIN.zoekHand, vinkje: true, ruil: "niet", gehad: gehad7, goedZinnen: (lof, a, b, p) => (p === 1 ? [lof, ZIN.goedSplits(a, b, TOTAAL7)] : [lof]) });

    /* Stap 15. Kiezen: nog een getal zoals dit (8) of een groter getal (10), en dat op 2 manieren splitsen. */
    const T = await keuzeGetal(l);
    await B.zegDoor(l, ZIN.keuzeReactie(T));
    const gehadT: Paar[] = [];
    B.st(l).laatste = false;
    const eerste = await splitsOpdracht(l, { id: `splits-${T}-1`, T, vast: false, kop: ZIN.keuzeKop(T), opdracht: ZIN.keuzeOpdracht(T), hand: ZIN.zoekHand, vinkje: true, ruil: "niet", gehad: gehadT, goedZinnen: (_lof, a, b) => [ZIN.keuzeNog(a, b, T)] });
    void eerste;
    B.st(l).laatste = true;
    await splitsOpdracht(l, { id: `splits-${T}-2`, T, vast: false, kop: ZIN.keuzeKop(T), opdracht: ZIN.keuzeNogOpdracht(T), hand: ZIN.zoekHand, vinkje: true, ruil: "niet", gehad: gehadT });

    /* Stap 16. Einde: slotzin, kaart, eindzin. */
    zet(l, { delen: [0, 0], totaal: null, lijst: [], kop: null, actief: [], hand: null, ring: null });
    await B.einde(l, ZIN.slot);
  },
};

export const LESSEN_SQULA_SPLITSEN_EXTRA_GOUDEN: Lesdraaiboek[] = [gouden];
