/**
 * DE EXTRA LES TELLEN (12 november 2026; besluit Sara 20.3; BOUWREGELS hoofdstuk 15; LESRECEPT.md).
 *
 *   squla-tellen-fruit-1-gouden-extra — een APARTE les naast de gouden les squla-tellen-fruit-1-gouden. De gouden les
 *   verandert niet. Dit zijn de Synthesis-opdrachten uit het draaiboek Tellen (Color Count) die niet in de Squla-les zitten:
 *   stap 5 t/m 9 van SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tellen.md, met FRUIT in plaats van gekleurde vakjes en met de
 *   getallen van het draaiboek (tot en met 10).
 *
 *   stap 1  openen: het rooster met fruit door elkaar, Bliepo groet en zegt wat we doen (het draaiboek heeft geen startvraag);
 *   stap 5  van welk fruit zie je er N? (2 rondes; 4 knoppen met de soort; de telhulp: een tik op het fruit zet een stipje);
 *   stap 6  2 soorten samen tellen (peren en pruimen);
 *   stap 7  "nu andersom" (terugverwijzing);
 *   stap 8  zelf maken: maak 4 peren in het rooster (tikken, dan het vinkje; het hulphandje komt vanzelf na ± 6 s);
 *   stap 9  het lijstje: 4 appels, 7 peren, 10 pruimen (een soort kiezen, vakjes tikken, het vinkje);
 *   stap 10 einde: slotzin, kaart, eindzin.
 * Geen "weet je dit al?" en geen proef: dat heeft het draaiboek hier niet.
 *
 * Laag 1 (Bliepo): 2 pogingen (15.11): 1e fout = eerste zin (de denkfout) en een hint uit de fouttabel, daarna nog 1 keer;
 * 2e fout = uitleg en samen voordoen (Bliepo telt mee of maakt mee), de les gaat door. Het hulphandje komt vanzelf na ± 6 s
 * stilte bij een opdracht (15.19), niet bij een keuzevraag. Rood scherm 1,5 s, groen 1 s, geen fout-geluidje, geen rood op
 * de keuze. Heel snel antwoorden: Bliepo zegt niets (draaiboek §3 A.7). Bliepo praat door (15.27); de pijl staat rechts.
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst; alleen als er een kind gekozen is); mislukt dat, dan gaat de les door.
 */

import type { Lesdraaiboek, Lesgids, Vlakgebeurtenis } from "../soort";
import { KaartTellenExtra, TelExtraVlak, type ExtraCel, type TelExtraProps } from "../vlakken/squla-tellen-extra-vlak";
import type { Soort } from "../vlakken/squla-tellen-tekenen";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { zetTestAntwoord } from "./squla-hulp";
import { maakBasis, schud, type Fout } from "./squla-extra-basis";
import {
  ALLE_FRUIT,
  LIJST,
  LIJST_OPLOSSING,
  LIJSTREACTIE,
  MAAK,
  MAAKREACTIE,
  NAAM_GROET,
  SOORTVRAGEN,
  TELREACTIE,
  TELREACTIE_ROBOT,
  TELREACTIE_TWEE,
  TWEE,
  ZIN,
  aantalVan,
  foutenSoort,
  foutenTwee,
  gk,
  gw,
  lijstFout,
  lijstRegels,
  maakFout,
  type Fruit,
  type Rooster,
  type SoortVraag,
} from "./squla-tellen-extra-zinnen";

const LES_ID = "squla-tellen-fruit-1-gouden-extra";
const B = maakBasis(LES_ID);
/** Samen tellen en samen maken: zo lang wacht Bliepo op een tik (vangnet, LESRECEPT). */
const VANGNET_MS = 20000;
const B_DENK = 200;

const zet = (l: Lesgids, p: Partial<TelExtraProps>) => l.pasVlakAan<TelExtraProps>(p);
const robotGehad = new WeakSet<Lesgids>();

/* ---------- het rooster in beeld ---------- */

function toon(l: Lesgids, r: Rooster, extra: Partial<TelExtraProps> = {}) {
  zet(l, { id: r.id, kolommen: r.kolommen, cellen: [...r.cellen], nummers: [], dof: [], tikbaar: [], stipjes: false, lijst: null, verf: null, verfKiezen: false, hand: null, ...extra });
}
const indicesVan = (cellen: ExtraCel[], soorten: string[]) => cellen.flatMap((c, i) => (c && soorten.includes(c) ? [i] : []));

/** Nummers 1 t/m n in de vakjes van `idx`, in leesvolgorde (draaiboek §3 A.1 (a)); de rest wordt dof. */
function metNummers(cellen: ExtraCel[], idx: number[]) {
  const nummers = cellen.map(() => 0);
  idx.forEach((i, k) => (nummers[i] = k + 1));
  return { nummers, dof: cellen.map((_, i) => !idx.includes(i)) };
}

/** De zin met het aantal bij goed: nooit 2 keer achter elkaar met hetzelfde eerste woord als de lof, en de robotzin hooguit 1 keer. */
function aantalZin(l: Lesgids, r: ReturnType<typeof TELREACTIE>, lofZin: string): string {
  const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();
  const zonder = r.zinnen.map((_, i) => i).filter((i) => woord(r.zinnen[i]) === woord(lofZin));
  if (robotGehad.has(l)) zonder.push(TELREACTIE_ROBOT);
  const z = B.kies(l, r, zonder);
  if (z === r.zinnen[TELREACTIE_ROBOT]) robotGehad.add(l);
  return z;
}

/* ---------- samen tellen (2e fout bij stap 5 en 6): het kind tikt elk stuk fruit, Bliepo telt mee ---------- */

async function samenTellen(l: Lesgids, v: { id: string; rooster: Rooster }, idx: number[], o: { tik: string; hand: string; klaar: (n: number) => string; zelf: (n: number) => string; kleur: (n: number, i: number) => string }) {
  const cellen = v.rooster.cellen;
  const nummers = cellen.map(() => 0);
  let geteld = 0;
  zet(l, { nummers: [...nummers], dof: cellen.map((_, i) => !idx.includes(i)), tikbaar: cellen.map((_, i) => idx.includes(i)), stipjes: false, hand: null });
  const volgende = () => idx.find((i) => nummers[i] === 0) ?? -1;
  zetTestAntwoord(`cel-${volgende()}`);
  B.haak(l, { soort: "tel", goed: `cel-${volgende()}`, vraag: v.id });
  const hk = B.handKlok(l, { aan: () => zet(l, { hand: volgende() >= 0 ? volgende() : null }), uit: () => zet(l, { hand: null }), zin: `${["Je bent goed bezig.", "Jij kunt dit."][B.st(l).fout % 2]} ${o.hand}` });
  B.log(l, "samen-tellen", { vraag: v.id });
  void B.zegOpdracht(l, o.tik).catch(() => {});
  hk.opnieuw();
  let zelf = false;
  let sinds = Date.now();
  try {
    while (geteld < idx.length) {
      const rest = Math.max(500, VANGNET_MS - (Date.now() - sinds));
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; index: number }>("celTik"), l.wacht(rest).then(() => null)]);
      if (t === null) {
        zelf = true;
        B.log(l, "vangnet", { geteld });
        break;
      }
      B.log(l, "tik", { x: `cel-${t.index}`, samen: true });
      if (!idx.includes(t.index) || nummers[t.index] > 0) continue;
      sinds = Date.now();
      geteld++;
      nummers[t.index] = geteld;
      zet(l, { nummers: [...nummers], hand: null, tikbaar: cellen.map((_, i) => idx.includes(i) && nummers[i] === 0) });
      speelLesgeluid("tik");
      B.log(l, "tel-tik", { i: t.index, n: geteld });
      hk.opnieuw();
      if (geteld < idx.length) {
        zetTestAntwoord(`cel-${volgende()}`);
        B.haak(l, { soort: "tel", goed: `cel-${volgende()}`, vraag: v.id });
        void B.zeg(l, o.kleur(geteld, t.index)).catch(() => {});
      }
    }
  } finally {
    hk.stop();
    zet(l, { tikbaar: [], hand: null });
    B.haak(l, null);
    zetTestAntwoord(null);
  }
  if (zelf) {
    /* Bliepo zet de rest van de nummers erbij, 1 voor 1, zonder te praten; daarna "Kijk, …" (geen "Ja", geen "samen"). */
    while (geteld < idx.length) {
      nummers[volgende()] = ++geteld;
      zet(l, { nummers: [...nummers] });
      speelLesgeluid("tik");
      await l.wacht(250);
    }
    await B.zegDoor(l, o.zelf(idx.length));
    return;
  }
  await l.wacht(200);
  await B.zegDoor(l, o.klaar(idx.length));
}

/* ---------- stap 5: van welk fruit zie je er N? ---------- */

async function soortVraag(l: Lesgids, v: SoortVraag, eerste: boolean) {
  const cellen = v.rooster.cellen;
  const fouten = foutenSoort(v);
  const vanNaam = (x: string): Fruit => ALLE_FRUIT.find((f) => f.naam === x) ?? v.goed;
  if (!eerste) void l.zeg().catch(() => {});
  toon(l, v.rooster, { stipjes: true });
  if (!eerste) speelLesgeluid("verschijn");
  await l.wacht(150);
  const zinnen = v.nr === 1 ? [ZIN.vraag1(v.n), ZIN.vraagEerste] : [ZIN.vraag2(v.n)];
  const goedIdx = indicesVan(cellen, [v.goed.soort]);
  return B.keuzeVraag(l, {
    id: v.id,
    opties: schud(ALLE_FRUIT.map((f) => f.naam)),
    goed: v.goed.naam,
    zinnen,
    eerste,
    fout: (x) => fouten[vanNaam(x).soort],
    bijGoed: async (poging, lofZin) => {
      /* Draaiboek §3 B.1: alle nummers 1 t/m N tegelijk in de vakjes (leesvolgorde), de andere soorten dof. */
      zet(l, { ...metNummers(cellen, goedIdx), stipjes: false, goed: B.st(l).goed });
      if (poging === 1) await B.zegDoor(l, lofZin, aantalZin(l, TELREACTIE(v.n, v.goed), lofZin));
      else await B.zegDoor(l, lofZin);
    },
    bijFout: (x) => {
      /* Draaiboek §3 B.2: de gekozen soort blijft helder en krijgt zijn nummers; de rest wordt dof. */
      zet(l, { ...metNummers(cellen, indicesVan(cellen, [vanNaam(x).soort])), fout: B.st(l).fout });
    },
    samen: async () => {
      await B.zegDoor(l, ZIN.samenHelp[B.st(l).fout % 3]);
      await samenTellen(l, v, goedIdx, {
        tik: ZIN.samenSoort(v.goed),
        hand: ZIN.samenHand(v.goed),
        klaar: (n) => ZIN.samenKlaar(n, v.goed),
        zelf: (n) => ZIN.samenZelf(n, v.goed),
        kleur: (n) => `${gk(n, v.goed)}.`,
      });
    },
  });
}

/* ---------- stap 6: 2 soorten samen ---------- */

async function tweeVraag(l: Lesgids) {
  const cellen = TWEE.rooster.cellen;
  const fouten = foutenTwee();
  const idx = indicesVan(cellen, [TWEE.a.soort, TWEE.b.soort]);
  void l.zeg().catch(() => {});
  toon(l, TWEE.rooster, { stipjes: true });
  speelLesgeluid("verschijn");
  await l.wacht(150);
  return B.keuzeVraag(l, {
    id: TWEE.id,
    opties: schud(TWEE.keuzes.map(String)),
    goed: String(TWEE.n),
    zinnen: [ZIN.vraagTwee(TWEE.a, TWEE.b)],
    raster: false,
    fout: (x) => fouten[x],
    bijGoed: async (poging, lofZin) => {
      zet(l, { ...metNummers(cellen, idx), stipjes: false, goed: B.st(l).goed });
      if (poging === 1) await B.zegDoor(l, lofZin, aantalZin(l, TELREACTIE_TWEE(TWEE.n, TWEE.a, TWEE.b), lofZin));
      else await B.zegDoor(l, lofZin);
    },
    bijFout: () => {
      zet(l, { dof: cellen.map((_, i) => !idx.includes(i)), fout: B.st(l).fout });
    },
    samen: async () => {
      await B.zegDoor(l, ZIN.samenHelp[B.st(l).fout % 3]);
      await samenTellen(l, { id: TWEE.id, rooster: TWEE.rooster }, idx, {
        tik: ZIN.samenTwee(TWEE.a, TWEE.b),
        hand: ZIN.samenHandTwee,
        klaar: (n) => ZIN.samenKlaarTwee(n, TWEE.a, TWEE.b),
        zelf: (n) => ZIN.samenZelfTwee(n),
        kleur: (n) => `${gw(n)}.`,
      });
    },
  });
}

/* ---------- stap 8 en 9: zelf maken en het lijstje (opdrachten met het vinkje) ---------- */

/** Bliepo en het kind maken samen: het kind tikt een leeg vakje, er komt een stuk fruit met een nummer, Bliepo telt mee. */
async function samenMaken(l: Lesgids, id: string, rooster: Rooster, vooraf: ExtraCel[], f: Fruit, doel: number, o: { help: string; hand: string; klaar: (n: number) => string; zelf: (n: number) => string }) {
  const cellen: ExtraCel[] = [...vooraf];
  const nummers = cellen.map(() => 0);
  let geplaatst = 0;
  const leeg = () => cellen.flatMap((c, i) => (c === null ? [i] : []));
  const toonNu = () => zet(l, { cellen: [...cellen], nummers: [...nummers], tikbaar: cellen.map((c) => c === null), hand: null });
  zet(l, { id: rooster.id, kolommen: rooster.kolommen, dof: [], stipjes: false });
  toonNu();
  zetTestAntwoord(`cel-${leeg()[0]}`);
  B.haak(l, { soort: "tel", goed: `cel-${leeg()[0]}`, vraag: id });
  const hk = B.handKlok(l, { aan: () => zet(l, { hand: leeg()[0] ?? null }), uit: () => zet(l, { hand: null }), zin: `${["Je bent goed bezig.", "Jij kunt dit."][B.st(l).fout % 2]} ${o.hand}` });
  void B.zegOpdracht(l, o.help).catch(() => {});
  hk.opnieuw();
  let zelf = false;
  let sinds = Date.now();
  try {
    while (geplaatst < doel) {
      const rest = Math.max(500, VANGNET_MS - (Date.now() - sinds));
      const t = await Promise.race([l.wachtOpVlak<{ soort: string; index: number }>("celTik"), l.wacht(rest).then(() => null)]);
      if (t === null) {
        zelf = true;
        B.log(l, "vangnet", { geplaatst });
        break;
      }
      B.log(l, "tik", { x: `cel-${t.index}`, samen: true });
      if (cellen[t.index] !== null) continue;
      sinds = Date.now();
      geplaatst++;
      cellen[t.index] = f.soort;
      nummers[t.index] = geplaatst;
      toonNu();
      speelLesgeluid("tik");
      hk.opnieuw();
      if (geplaatst < doel) {
        zetTestAntwoord(`cel-${leeg()[0]}`);
        B.haak(l, { soort: "tel", goed: `cel-${leeg()[0]}`, vraag: id });
        void B.zeg(l, `${gk(geplaatst, f)}.`).catch(() => {});
      }
    }
  } finally {
    hk.stop();
    zet(l, { tikbaar: [], hand: null });
    B.haak(l, null);
    zetTestAntwoord(null);
  }
  if (zelf) {
    while (geplaatst < doel) {
      const i = leeg()[0];
      cellen[i] = f.soort;
      nummers[i] = ++geplaatst;
      toonNu();
      speelLesgeluid("tik");
      await l.wacht(250);
    }
    await B.zegDoor(l, o.zelf(doel));
    return;
  }
  await l.wacht(200);
  await B.zegDoor(l, o.klaar(doel));
}

type RondeKeuze = {
  id: string;
  rooster: Rooster;
  lijst: ReturnType<typeof lijstRegels>;
  verfKiezen: boolean;
  startVerf: Soort;
  opdracht: string[];
  handZin: string;
  /** Telt wat er staat: per regel van het lijstje hoeveel. */
  tel: (cellen: ExtraCel[]) => number[];
  klopt: (tel: number[]) => boolean;
  fout: (tel: number[]) => Fout;
  goedZinnen: (lofZin: string) => string[];
  samen: (cellen: ExtraCel[], tel: number[]) => Promise<void>;
  /** Wat de automatische speler als volgende moet tikken (alleen voor de test). */
  testStap: (cellen: ExtraCel[], verf: Soort) => string | null;
  eerste?: boolean;
};

async function opdrachtRonde(l: Lesgids, c: RondeKeuze) {
  const s = B.st(l);
  s.vraag++;
  const cellen: ExtraCel[] = [...c.rooster.cellen];
  let verf: Soort = c.startVerf;
  const toonNu = () => zet(l, { cellen: [...cellen], verf });
  toon(l, c.rooster, { lijst: c.lijst, verf, verfKiezen: c.verfKiezen });
  await l.wacht(150);
  let eerder: Fout | null = null;
  let eersteX = "";
  let zin: Promise<void> = B.zegOpdracht(l, c.opdracht.join(" "));
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    /* Het kind tikt vakjes; het vinkje komt na elke tik opnieuw (het lesscherm haalt het weg bij een tik in het vlak). */
    const hk = B.handKlok(l, { aan: () => { const i = cellen.findIndex((x) => x === null); zet(l, { hand: i >= 0 ? i : null }); }, uit: () => zet(l, { hand: null }), zin: poging === 1 ? c.handZin : null });
    zet(l, { tikbaar: cellen.map(() => true) });
    hk.opnieuw();
    B.haak(l, { soort: "maak", poging, vraag: c.id });
    try {
      for (;;) {
        zetTestAntwoord(c.testStap(cellen, verf));
        const r = await Promise.race([l.knoppen(["controleer"]).then(() => null), l.wachtOpVlak<Vlakgebeurtenis & { index?: number; fruit?: string }>(["celTik", "verfTik"])]);
        if (r === null) break;
        B.log(l, "tik", { x: r.soort === "celTik" ? `cel-${r.index}` : `verf-${r.fruit}` });
        if (r.soort === "verfTik") verf = r.fruit as Soort;
        else if (r.index != null) cellen[r.index] = cellen[r.index] === verf ? null : verf;
        toonNu();
        hk.opnieuw();
      }
    } finally {
      hk.stop();
      zetTestAntwoord(null);
      B.haak(l, null);
    }
    void zin.catch(() => {});
    await l.wacht(B_DENK);
    const tel = c.tel(cellen);
    if (c.klopt(tel)) {
      B.goedMoment(l);
      zet(l, { tikbaar: [], goed: B.st(l).goed });
      if (poging === 1) {
        await B.zegDoor(l, ...c.goedZinnen(B.lof(l, false)));
        return B.noteer(l, c.id, "goed");
      }
      await B.zegDoor(l, B.bevestig(l));
      return B.noteer(l, c.id, "naFout");
    }
    B.foutMoment(l);
    zet(l, { tikbaar: [], fout: B.st(l).fout });
    const f = c.fout(tel);
    const sleutel = tel.join("-");
    B.legDenkfoutVast(l, { vraag: c.id, antwoord: sleutel, denkfout: f.code, poging });
    const fz = B.foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && sleutel === eersteX && fz[0] === f.eerste && f.weer.length) fz.splice(0, fz.length, ...f.weer);
    B.log(l, "reactie", { soort: `fout${poging}`, vraag: c.id, x: sleutel, denkfout: f.code, zin: fz.join(" ") });
    if (poging === 1) {
      /* 1e fout: de eerste zin (vinkje en handje uit; vanzelf door), dan de hint terwijl het kind weer mag tikken (15.27). */
      await B.zegDoor(l, fz[0]);
      zin = B.zegOpdracht(l, fz.slice(1).join(" "));
      eerder = f;
      eersteX = sleutel;
    } else {
      await B.zegDoor(l, ...fz);
      await B.zegDoor(l, ZIN.maakHelp[B.st(l).fout % 3]);
      await c.samen(cellen, tel);
      return B.noteer(l, c.id, "samen");
    }
  }
  return B.noteer(l, c.id, "samen");
}

/** Stap 8: maak 4 peren. */
async function maakRonde(l: Lesgids) {
  const doel = MAAK.n;
  return opdrachtRonde(l, {
    id: MAAK.id,
    rooster: MAAK.rooster,
    lijst: [{ soort: MAAK.f.soort, n: doel }],
    verfKiezen: false,
    startVerf: MAAK.f.soort,
    opdracht: [ZIN.maakOpdracht(MAAK.f, doel), ZIN.maakUitleg],
    handZin: ZIN.maakHand,
    tel: (cellen) => [aantalVan(cellen, MAAK.f)],
    klopt: (t) => t[0] === doel,
    fout: (t) => maakFout(t[0]),
    goedZinnen: (lofZin) => [lofZin, aantalZin(l, MAAKREACTIE(doel, MAAK.f), lofZin)],
    samen: async () => {
      await samenMaken(l, MAAK.id, MAAK.rooster, MAAK.rooster.cellen.map(() => null), MAAK.f, doel, { help: ZIN.maakSamenZin(MAAK.f), hand: ZIN.maakHand, klaar: (n) => ZIN.maakKlaar(n, MAAK.f), zelf: (n) => ZIN.maakZelf(n, MAAK.f) });
    },
    testStap: (cellen) => {
      const n = aantalVan(cellen, MAAK.f);
      const i = cellen.findIndex((x) => x === null);
      return n < doel && i >= 0 ? `cel-${i}` : null;
    },
  });
}

/** Stap 9: het lijstje. */
async function lijstRonde(l: Lesgids) {
  const tel = (cellen: ExtraCel[]) => LIJST.regels.map((r) => aantalVan(cellen, r.f));
  return opdrachtRonde(l, {
    id: LIJST.id,
    rooster: LIJST.rooster,
    lijst: lijstRegels(),
    verfKiezen: true,
    startVerf: LIJST.regels[0].f.soort,
    opdracht: [ZIN.lijstOpdracht],
    handZin: ZIN.lijstHand,
    tel,
    klopt: (t) => t.every((n, i) => n === LIJST.regels[i].n),
    fout: (t) => lijstFout(t),
    goedZinnen: () => [B.kies(l, LIJSTREACTIE)],
    samen: async (_c, t) => {
      /* Bliepo zet alles klaar behalve de eerste soort die niet klopt; het kind maakt die samen met Bliepo af. */
      const k = LIJST.regels.findIndex((r, i) => t[i] !== r.n);
      const r = LIJST.regels[k];
      const vooraf = LIJST_OPLOSSING.map((x) => (x === r.f.soort ? null : x));
      await samenMaken(l, LIJST.id, LIJST.rooster, vooraf, r.f, r.n, { help: ZIN.lijstHelp(r.f), hand: ZIN.lijstHand, klaar: (n) => ZIN.maakKlaar(n, r.f), zelf: (n) => ZIN.maakZelf(n, r.f) });
    },
    testStap: (cellen, verf) => {
      const i = cellen.findIndex((x, k) => x !== LIJST_OPLOSSING[k]);
      if (i < 0) return null;
      const nodig = LIJST_OPLOSSING[i] as string;
      return verf !== nodig ? `verf-${nodig}` : `cel-${i}`;
    },
  });
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-tellen-fruit-1-gouden-extra",
  titel: "Fruit tellen, extra",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla). */
  synthesis: "Squla groep 3 · Tellen · Tellen met fruit · level 1 · gouden les, extra (Synthesis-opdrachten uit het draaiboek Tellen die niet in de Squla-les zitten: welk fruit heeft er N, 2 soorten samen, zelf maken, het lijstje)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  pijlZoalsSynthesis: true,
  stemHeelUitpraten: true,
  woordenMeeMetStem: true,
  voorwerpen: ["appel", "peer", "pruim", "citroen"],
  kaarttekening: KaartTellenExtra,
  async speel(l) {
    B.log(l, "start");
    /* Stap 1. Openen: het rooster van stap 5 staat er al; Bliepo groet en zegt wat we gaan doen, in 1 stuk. */
    l.vlak<TelExtraProps>(TelExtraVlak, { id: SOORTVRAGEN[0].rooster.id, kolommen: SOORTVRAGEN[0].rooster.kolommen, cellen: [...SOORTVRAGEN[0].rooster.cellen] });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    B.st(l).naamKeer = 1;
    B.st(l).naamVraag = 0;
    await B.zegDoor(l, NAAM_GROET, ZIN.begin.join(" "));

    /* Stap 5. Van welk fruit zie je er N? (2 rondes) */
    await soortVraag(l, SOORTVRAGEN[0], true);
    await soortVraag(l, SOORTVRAGEN[1], false);
    /* Stap 6. 2 soorten samen. */
    await tweeVraag(l);

    /* Stap 7. "Nu andersom" (terugverwijzing). Het rooster wordt leeg. */
    void l.zeg().catch(() => {});
    toon(l, MAAK.rooster);
    speelLesgeluid("verschijn");
    await B.zegDoor(l, ...ZIN.andersom);
    /* Stap 8. Zelf maken. */
    await maakRonde(l);

    /* Stap 9. Het lijstje (de laatste opdracht). */
    B.st(l).laatste = true;
    void l.zeg().catch(() => {});
    toon(l, LIJST.rooster, { lijst: lijstRegels(), verf: LIJST.regels[0].f.soort, verfKiezen: true });
    speelLesgeluid("verschijn");
    await B.zegDoor(l, ZIN.lijstOvergang);
    await lijstRonde(l);

    /* Stap 10. Einde: slotzin, kaart, eindzin. */
    zet(l, { cellen: [], lijst: null, nummers: [], tikbaar: [], hand: null });
    await B.einde(l, ZIN.slot);
  },
};

export const LESSEN_SQULA_TELLEN_EXTRA_GOUDEN: Lesdraaiboek[] = [gouden];
