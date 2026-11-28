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
 *   stap 10 einde: het nieuwe eindscherm (proef 24 nov 2026: feest, ster, sleutels, leerzin, knoppen; was: slotzin, kaart, eindzin).
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
import { TelExtraVlak, type ExtraCel, type TelExtraProps } from "../vlakken/squla-tellen-extra-vlak";
import type { Soort } from "../vlakken/squla-tellen-tekenen";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { percentageGoed } from "@/lib/les-kleuren";
import { eindzin } from "../eindzinnen";
import { zegTelwoord, zetTestAntwoord } from "./squla-hulp";
import { maakBasis, schud, type Fout } from "./squla-extra-basis";
import { deeltStuk, maakKiezer } from "./nooit-dubbel";
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
  type FoutV,
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

/**
 * NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026): alle zinnen in varianten kiest de les met de gedeelde kiezer
 * (nooit-dubbel.ts). Nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen; "Tik op elke peer." en "Tik op
 * elke pruim." tellen als dezelfde zin.
 */
const KIEZER = maakKiezer({ wissel: ["appels", "appel", "peren", "peer", "pruimen", "pruim", "citroenen", "citroen"] });
const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => KIEZER.kies(sleutel, zinnen, mag);

/**
 * Kiest per fout de zinnen uit de varianten van de fouttabel, precies de zinnen die Bliepo gaat zeggen (zelfde regels als
 * squla-extra-basis: 1e keer eerste zin + hint; 2e keer eerste zin + uitleg, of "weer" bij dezelfde denkfout of
 * hetzelfde antwoord). Eén kiezer per vraag: hij onthoudt de 1e fout.
 */
function foutKiezer() {
  let eerder: { x: string; f: Fout } | null = null;
  return (x: string, f: FoutV): Fout => {
    const v = f.v;
    if (!v) {
      eerder ??= { x, f };
      return f;
    }
    if (!eerder) {
      const eerste = v.eerste.length ? variant("eerste", v.eerste) : f.eerste;
      const uit = { ...f, eerste, hint: variant("hint", v.hint, (z) => !deeltStuk(eerste, z)) };
      eerder = { x, f: uit };
      return uit;
    }
    const zelfde = eerder.f.soort === f.soort && !eerder.f.noot && f.code !== "onduidelijk";
    if (v.weerEerste.length && (zelfde || x === eerder.x)) {
      const weer = variant("weer", v.weerEerste);
      return { ...f, weer: [weer, ...(v.weerUitleg.length ? [variant("uitleg", v.weerUitleg, (z) => !deeltStuk(weer, z))] : [])] };
    }
    const eerste = v.eerste.length ? variant("eerste", v.eerste) : f.eerste;
    return { ...f, eerste, uitleg: variant("uitleg", v.uitleg, (z) => !deeltStuk(eerste, z)) };
  };
}
const aanmoedig = () => variant("aanmoedigTikken", ZIN.aanmoedigTikken);
const robotGehad = new WeakSet<Lesgids>();

/* ---------- het rooster in beeld ---------- */

function toon(l: Lesgids, r: Rooster, extra: Partial<TelExtraProps> = {}) {
  zet(l, { id: r.id, kolommen: r.kolommen, cellen: [...r.cellen], nummers: [], dof: [], tikbaar: [], stipjes: false, lijst: null, verf: null, verfKiezen: false, hand: null, handRegel: null, ...extra });
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
  const hk = B.handKlok(l, { aan: () => zet(l, { hand: volgende() >= 0 ? volgende() : null }), uit: () => zet(l, { hand: null }), zin: `${aanmoedig()} ${o.hand}` });
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
        /* 15.47: de opdracht blijft in beeld, het getal komt eronder. */
        void zegTelwoord(l, o.tik, o.kleur(geteld, t.index)).catch(() => {});
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
    /* 15.40 (F20): ook na samen tellen het groene scherm en het geluid (goed-na-hulp). */
    B.goedMoment(l);
    await B.zegDoor(l, o.zelf(idx.length));
    return;
  }
  await l.wacht(200);
  B.goedMoment(l);
  await B.zegDoor(l, o.klaar(idx.length));
}

/* ---------- stap 5: van welk fruit zie je er N? ---------- */

async function soortVraag(l: Lesgids, v: SoortVraag, eerste: boolean) {
  const cellen = v.rooster.cellen;
  const fouten = foutenSoort(v);
  const vanNaam = (x: string): Fruit => ALLE_FRUIT.find((f) => f.naam === x) ?? v.goed;
  const kiesFout = foutKiezer();
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
    fout: (x) => kiesFout(x, fouten[vanNaam(x).soort]),
    bijGoed: async (poging, lofZin) => {
      /* Draaiboek §3 B.1: alle nummers 1 t/m N tegelijk in de vakjes (leesvolgorde), de andere soorten dof. */
      zet(l, { ...metNummers(cellen, goedIdx), stipjes: false, goed: B.st(l).goed });
      if (poging === 1) await B.zegDoor(l, lofZin, aantalZin(l, TELREACTIE(v.n, v.goed), lofZin));
      else await B.zegDoor(l, lofZin);
    },
    bijFout: (x) => {
      /* Draaiboek §3 B.2: de gekozen soort blijft helder en krijgt zijn nummers; de rest wordt dof. */
      /* Sara 20 nov 2026: na een fout blijft ALLE fruit gewoon zichtbaar (niets dof); alleen de gekozen soort krijgt zijn nummers. */
      zet(l, { ...metNummers(cellen, indicesVan(cellen, [vanNaam(x).soort])), dof: [], fout: B.st(l).fout });
    },
    samen: async () => {
      await B.zegDoor(l, variant("samenHelp", ZIN.samenHelp));
      await samenTellen(l, v, goedIdx, {
        tik: variant("samenTik", ZIN.samenSoort(v.goed)),
        hand: variant("samenHand", ZIN.samenHand(v.goed)),
        klaar: (n) => variant("samenKlaar", ZIN.samenKlaar(n, v.goed)),
        zelf: (n) => variant("samenZelf", ZIN.samenZelf(n, v.goed)),
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
  const kiesFout = foutKiezer();
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
    fout: (x) => kiesFout(x, fouten[x]),
    bijGoed: async (poging, lofZin) => {
      zet(l, { ...metNummers(cellen, idx), stipjes: false, goed: B.st(l).goed });
      if (poging === 1) await B.zegDoor(l, lofZin, aantalZin(l, TELREACTIE_TWEE(TWEE.n, TWEE.a, TWEE.b), lofZin));
      else await B.zegDoor(l, lofZin);
    },
    bijFout: () => {
      zet(l, { dof: [], fout: B.st(l).fout });
    },
    samen: async () => {
      await B.zegDoor(l, variant("samenHelp", ZIN.samenHelp));
      await samenTellen(l, { id: TWEE.id, rooster: TWEE.rooster }, idx, {
        tik: variant("samenTik", ZIN.samenTwee(TWEE.a, TWEE.b)),
        hand: variant("samenHand", ZIN.samenHandTwee(TWEE.a, TWEE.b)),
        klaar: (n) => variant("samenKlaar", ZIN.samenKlaarTwee(n, TWEE.a, TWEE.b)),
        zelf: (n) => variant("samenZelf", ZIN.samenZelfTwee(n)),
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
  zet(l, { id: rooster.id, kolommen: rooster.kolommen, dof: [], stipjes: false, verf: f.soort });
  toonNu();
  zetTestAntwoord(`cel-${leeg()[0]}`);
  B.haak(l, { soort: "tel", goed: `cel-${leeg()[0]}`, vraag: id });
  const hk = B.handKlok(l, { aan: () => zet(l, { hand: leeg()[0] ?? null }), uit: () => zet(l, { hand: null }), zin: `${aanmoedig()} ${o.hand}` });
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
        /* 15.47: de opdracht blijft in beeld, het getal komt eronder. */
        void zegTelwoord(l, o.help, `${gk(geplaatst, f)}.`).catch(() => {});
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
    /* 15.40 (F20): ook na samen doen het groene scherm en het geluid (goed-na-hulp). */
    B.goedMoment(l);
    await B.zegDoor(l, o.zelf(doel));
    return;
  }
  await l.wacht(200);
  B.goedMoment(l);
  await B.zegDoor(l, o.klaar(doel));
}

type RondeKeuze = {
  id: string;
  rooster: Rooster;
  lijst: ReturnType<typeof lijstRegels>;
  verfKiezen: boolean;
  startVerf: Soort | null;
  opdracht: string[];
  handZin: string;
  /** Zin voor het handje zolang er nog niets gekozen is (alleen als het kind eerst een soort moet kiezen). */
  handZinKies?: string;
  /** Telt wat er staat: per regel van het lijstje hoeveel. */
  tel: (cellen: ExtraCel[]) => number[];
  klopt: (tel: number[]) => boolean;
  fout: (tel: number[]) => FoutV;
  goedZinnen: (lofZin: string) => string[];
  samen: (cellen: ExtraCel[], tel: number[]) => Promise<void>;
  /** Wat de automatische speler als volgende moet tikken (alleen voor de test). */
  testStap: (cellen: ExtraCel[], verf: Soort | null) => string | null;
  eerste?: boolean;
};

async function opdrachtRonde(l: Lesgids, c: RondeKeuze) {
  const s = B.st(l);
  s.vraag++;
  const cellen: ExtraCel[] = [...c.rooster.cellen];
  let verf: Soort | null = c.startVerf;
  const toonNu = () => zet(l, { cellen: [...cellen], verf });
  toon(l, c.rooster, { lijst: c.lijst, verf, verfKiezen: c.verfKiezen });
  await l.wacht(150);
  let eerder: Fout | null = null;
  let eersteX = "";
  const kiesFout = foutKiezer();
  let zin: Promise<void> = B.zegOpdracht(l, c.opdracht.join(" "));
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    /* Het kind tikt vakjes; het vinkje komt na elke tik opnieuw (het lesscherm haalt het weg bij een tik in het vlak). */
    const hk = B.handKlok(l, { aan: () => { const i = cellen.findIndex((x) => x === null); zet(l, verf !== null ? { hand: i >= 0 ? i : null, handRegel: null } : { hand: null, handRegel: c.verfKiezen ? 0 : null }); }, uit: () => zet(l, { hand: null, handRegel: null }), zin: poging === 1 ? () => (verf === null && c.handZinKies ? c.handZinKies : c.handZin) : null });
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
        else if (r.index != null && verf !== null) cellen[r.index] = cellen[r.index] === verf ? null : verf;
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
    const sleutel = tel.join("-");
    const f = kiesFout(sleutel, c.fout(tel));
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
      await B.zegDoor(l, variant("maakHelp", ZIN.maakHelp));
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
    opdracht: [ZIN.maakOpdracht(MAAK.f, doel), ZIN.maakUitleg(MAAK.f)],
    handZin: variant("maakHand", ZIN.maakHand),
    tel: (cellen) => [aantalVan(cellen, MAAK.f)],
    klopt: (t) => t[0] === doel,
    fout: (t) => maakFout(t[0]),
    goedZinnen: (lofZin) => [lofZin, aantalZin(l, MAAKREACTIE(doel, MAAK.f), lofZin)],
    samen: async () => {
      await samenMaken(l, MAAK.id, MAAK.rooster, MAAK.rooster.cellen.map(() => null), MAAK.f, doel, { help: variant("maakSamenZin", ZIN.maakSamenZin(MAAK.f)), hand: variant("maakHand", ZIN.maakHand), klaar: (n) => variant("maakKlaar", ZIN.maakKlaar(n, MAAK.f)), zelf: (n) => variant("maakZelf", ZIN.maakZelf(n, MAAK.f)) });
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
    startVerf: null,
    opdracht: [ZIN.lijstOpdracht],
    handZin: variant("maakHand", ZIN.lijstHand),
    handZinKies: variant("lijstHandKies", ZIN.lijstHandKies),
    tel,
    klopt: (t) => t.every((n, i) => n === LIJST.regels[i].n),
    fout: (t) => lijstFout(t),
    goedZinnen: () => [B.kies(l, LIJSTREACTIE)],
    samen: async (_c, t) => {
      /* Bliepo zet alles klaar behalve de eerste soort die niet klopt; het kind maakt die samen met Bliepo af. */
      const k = LIJST.regels.findIndex((r, i) => t[i] !== r.n);
      const r = LIJST.regels[k];
      const vooraf = LIJST_OPLOSSING.map((x) => (x === r.f.soort ? null : x));
      await samenMaken(l, LIJST.id, LIJST.rooster, vooraf, r.f, r.n, { help: variant("lijstHelp", ZIN.lijstHelp(r.f)), hand: variant("maakHand", ZIN.lijstHand), klaar: (n) => variant("maakKlaar", ZIN.maakKlaar(n, r.f)), zelf: (n) => variant("maakZelf", ZIN.maakZelf(n, r.f)) });
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
  /* De oude kaart (KaartTellenExtra) blijft in squla-tellen-extra-vlak.tsx staan; deze les gebruikt hem niet meer (WEGGEHAALD.md). */
  eindscherm: true,
  eindLeerzin: "Je kunt nu fruit tellen tot 10.",
  eindPlaatje: "/voorwerpen/appel.png",
  eindOnderwerp: "Fruit tellen",
  eindKaartZin: ZIN.eindTikKaart,
  async speel(l) {
    B.log(l, "start");
    if (l.snelEinde) return snelNaarEinde(l);
    /* Voortgangsbalk (15.54): 5 vragen (2x welk fruit, 2 soorten samen, zelf maken, het lijstje). */
    B.st(l).totaal = 5;
    l.voortgang?.(0);
    /* Stap 1. Openen: het rooster van stap 5 staat er al; Bliepo groet en zegt wat we gaan doen, in 1 stuk. */
    l.vlak<TelExtraProps>(TelExtraVlak, { id: SOORTVRAGEN[0].rooster.id, kolommen: SOORTVRAGEN[0].rooster.kolommen, cellen: [...SOORTVRAGEN[0].rooster.cellen] });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    B.st(l).naamKeer = 1;
    B.st(l).naamVraag = 0;
    /* Verdergaan (15.53): "welkom terug" in plaats van de groet. Opnieuw doen: eerst zeggen dat het kind de les al deed. */
    if (l.hervat) await B.zegDoor(l, l.openingsZin ?? NAAM_GROET);
    /* Opnieuw doen na de beste kleur (15.60, zoals Synthesis): eerst de groet, dan "dit ken je al", en meteen de eerste vraag. */
    else if (l.zonderUitleg) await B.zegDoor(l, ...[NAAM_GROET, l.openingsZin ?? ""].filter(Boolean));
    else await B.zegDoor(l, ...(l.openingsZin ? [l.openingsZin] : []), NAAM_GROET, ZIN.begin.join(" "));

    /* Stap 5. Van welk fruit zie je er N? (2 rondes) */
    if (!B.klaarAl(l, SOORTVRAGEN[0].id)) await soortVraag(l, SOORTVRAGEN[0], true);
    if (!B.klaarAl(l, SOORTVRAGEN[1].id)) await soortVraag(l, SOORTVRAGEN[1], false);
    /* Stap 6. 2 soorten samen. */
    if (!B.klaarAl(l, TWEE.id)) await tweeVraag(l);

    /* Stap 7. "Nu andersom" (terugverwijzing). Het rooster wordt leeg. */
    if (!B.klaarAl(l, MAAK.id)) {
      void l.zeg().catch(() => {});
      toon(l, MAAK.rooster);
      speelLesgeluid("verschijn");
      await B.zegDoor(l, ...ZIN.andersom);
      /* Stap 8. Zelf maken. */
      await maakRonde(l);
    }

    /* Stap 9. Het lijstje (de laatste opdracht). */
    if (!B.klaarAl(l, LIJST.id)) {
      B.st(l).laatste = true;
      void l.zeg().catch(() => {});
      toon(l, LIJST.rooster, { lijst: lijstRegels(), verf: null, verfKiezen: true });
      speelLesgeluid("verschijn");
      await B.zegDoor(l, ZIN.lijstOvergang());
      await lijstRonde(l);
    }

    /* Stap 10. Einde: het nieuwe eindscherm (proef, Sara 24 nov 2026; EINDSCHERM-ONTWERP.md). Was: slotzin, de kaart met
       "Tik op de kaart." en een eindzin (WEGGEHAALD.md). */
    zet(l, { cellen: [], lijst: null, nummers: [], tikbaar: [], hand: null });
    await eindeScherm(l);
  },
};

/**
 * Hoe ging het? De eindzin hoort bij het PERCENTAGE goed in 1 keer (Sara, 26 nov 2026: tegen een kind dat bijna alles fout had
 * zeg je niet "wat heb jij het goed gedaan"): alles = 100%; gewoon = 70 tot 99%; moeite = 40 tot 70%; weinig = onder 40%.
 * Dezelfde percentages als het resultaat van de kaart (resultaat()), ook bij de snelle test (`&snel=p35`).
 */
function uitslag(l: Lesgids): "alles" | "gewoon" | "moeite" | "weinig" {
  const p = resultaat(l).percentage;
  if (p >= 100) return "alles";
  if (p >= 70) return "gewoon";
  if (p >= 40) return "moeite";
  return "weinig";
}

/**
 * Percentage goed in 1 keer en de denkfouten van deze speelbeurt (voor de kleur van de kaart en het bewaren). Op de
 * voorbeeldpagina kun je met `&snel=p72` een percentage forceren (alleen om elke kleur te kunnen zien).
 */
function resultaat(l: Lesgids): { percentage: number; denkfouten: string[] } {
  if (l.snelEinde) {
    let p = l.snelEinde === "alles" ? 100 : l.snelEinde === "moeite" ? 40 : 80;
    try {
      const m = /^p(\d{1,3})$/.exec(new URLSearchParams(window.location.search).get("snel") ?? "");
      if (m) p = Math.min(100, Number(m[1]));
    } catch {
      /* standaard */
    }
    return { percentage: p, denkfouten: [] };
  }
  const s = B.st(l);
  const goed = [...s.eerste.values()].filter((x) => x === "goed").length;
  return { percentage: percentageGoed(goed, Math.max(s.totaal, s.eerste.size)), denkfouten: [...s.alleDenkfouten] };
}

/** Het eindscherm met 1 eindzin van Bliepo (geen pijl, geen opdracht: de knoppen staan in beeld). */
async function eindeScherm(l: Lesgids) {
  void l.zeg().catch(() => {});
  l.verderWeg?.();
  /* Het laatste sleuteltje vliegt nog (±0,9 s): eerst laten aankomen, dan pas het feest. */
  await l.wacht(1000);
  B.log(l, "eindscherm");
  l.eindscherm?.(resultaat(l));
  /* Bliepo praat pas als het feestgeluid (±1,4 s) voorbij is en de ster komt. */
  await l.wacht(1500);
  /* De standaardzinnen van alle gouden lessen (eindzinnen.ts, door Fable gecontroleerd). De oude zinnen van deze les staan nog in de zinnen-lijst. */
  const zin = eindzin(resultaat(l).percentage);
  await B.zeg(l, zin);
  await l.eindAfsluiten?.();
}

/** Alleen op de voorbeeldpagina (`&snel=1`): meteen naar het eindscherm, met een paar sleutels om de teller te zien. */
async function snelNaarEinde(l: Lesgids) {
  B.st(l).totaal = 5;
  l.voortgang?.(0);
  const n = l.snelEinde === "alles" ? 5 : l.snelEinde === "moeite" ? 1 : 3;
  l.vlak<TelExtraProps>(TelExtraVlak, { id: SOORTVRAGEN[0].rooster.id, kolommen: SOORTVRAGEN[0].rooster.kolommen, cellen: [...SOORTVRAGEN[0].rooster.cellen] });
  /* Eerst de groet: bij een geplakte link komt dan de afspeelknop (15.38) en mag er daarna geluid klinken. */
  await B.zeg(l, NAAM_GROET);
  await l.wacht(300);
  for (let i = 0; i < n; i++) {
    l.voortgang?.((i + 1) / 5);
    l.sleutel?.();
    await l.wacht(1100);
  }
  l.voortgang?.(1);
  await eindeScherm(l);
}

export const LESSEN_SQULA_TELLEN_EXTRA_GOUDEN: Lesdraaiboek[] = [gouden];
