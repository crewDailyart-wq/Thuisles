/**
 * DE EXTRA LES PLUSSOMMEN (12 november 2026; besluit Sara 22.3; BOUWREGELS hoofdstuk 15; LESRECEPT.md).
 *
 *   squla-plus-bakkerij-1-gouden-extra — een APARTE les naast de gouden les squla-plus-bakkerij-1-gouden. De gouden les
 *   verandert niet. Dit zijn de Synthesis-opdrachten uit het draaiboek Plussommen (Adding below 10) die niet in de
 *   Squla-les zitten: de getaltegels in het rooster (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/plussommen.md):
 *     stap 1-3  een tegel kiezen en zeggen welk getal het is (3 keer);
 *     stap 4+6  twee tegels samen: wat is het totaal? (2 keer);
 *     stap 7    maak samen 7;
 *     stap 8    maak samen 10, de som kiezen, OMWISSELEN ("ik draai ze om; wat is het totaal nu?");
 *     stap 12   nog een manier om 10;
 *     stap 13   einde.
 * Het vlak is het tegelvlak van Optellen tot 10 (optellen10-holo-tegels.tsx, ongewijzigd), net als de les Optellen onder de 10, iets kleiner vanaf links (squla-plussommen-extra-vlak.tsx) zodat de bak niet onder het tekstvak ligt (15.30).
 * Niet gebouwd: de som zelf typen (stap 10) en de slot-tegels van stap 5 (zie plussommen-extra-zinnen.ts).
 *
 * Laag 1 (Bliepo): 2 pogingen (15.11): 1e fout = eerste zin (de denkfout) en een hint uit de fouttabel, daarna nog 1 keer;
 * 2e fout = uitleg en samen voordoen (Bliepo telt de hokjes, of laat zien welke tegel erbij past en het kind zet hem), de
 * les gaat door. Het hulphandje komt vanzelf na ± 6 s stilte bij een opdracht (15.19), niet bij een keuzevraag. Rood
 * scherm 1,5 s, groen 1 s, geen fout-geluidje. Heel snel antwoorden: Bliepo zegt niets. Bliepo praat door (15.27).
 *
 * Elke fout wordt met zijn denkfout vastgelegd en elke vraag met zijn uitkomst (goed in 1 keer, goed na een fout, samen
 * gedaan) in de tabel les_uitkomsten (bewaarUitkomst; alleen als er een kind gekozen is); mislukt dat, dan gaat de les door.
 */

import type { Lesdraaiboek, Lesgids } from "../soort";
import { pastOp } from "../tegels";
import type { HoloTegelProps } from "../vlakken/optellen10-holo-tegels";
import { KleinTegelVlak } from "../vlakken/squla-plussommen-extra-vlak";
import { Werkvlak, pas, telHokjes } from "./optellen-tot-10";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { zetTestAntwoord } from "./squla-hulp";
import { maakBasis, schud, type Fout, type Uitkomst } from "./squla-extra-basis";
import { AANMOEDIG_TIKKEN, NAAM_GROET, SOMREACTIE, SOMREACTIE_ROBOT, ZIN, aanvulFout, dichtbij, getalFout, omwisselFout, somFout, somKeuzes, totaalFout } from "./squla-plussommen-extra-zinnen";

const LES_ID = "squla-plus-bakkerij-1-gouden-extra";
const B = maakBasis(LES_ID);
const ALLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const VANGNET_MS = 20000;
const DENK_MS = 200;
const robotGehad = new WeakSet<Lesgids>();

/** De zin met het aantal bij goed: niet dezelfde beginwoorden als de lof, de robotzin hooguit 1 keer. */
function reactie(l: Lesgids, a: number, b: number, t: number, lofZin: string): string {
  const r = SOMREACTIE(a, b, t);
  const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();
  const zonder = r.zinnen.map((_, i) => i).filter((i) => woord(r.zinnen[i]) === woord(lofZin));
  if (robotGehad.has(l)) zonder.push(SOMREACTIE_ROBOT);
  const z = B.kies(l, r, zonder);
  if (z === r.zinnen[SOMREACTIE_ROBOT]) robotGehad.add(l);
  return z;
}

/**
 * Wacht tot het kind een tegel in het rooster zet. Het hulphandje (het handje dat laat zien hoe je een tegel naar het
 * rooster sleept) komt vanzelf na ± 6 s stilte (15.19). `test` = welke tegel de automatische speler moet tikken.
 */
async function pakTegel(l: Lesgids, o: { zin?: string; hand: string; test: number | null; id: string; poging?: number; ms?: number; soort?: string }): Promise<number | null> {
  const p = l.wachtOpVlak<{ soort: string; n: number }>("tegel");
  pas(l, { actief: true, hand: false });
  zetTestAntwoord(o.test ? `tegel-${o.test}` : null);
  B.haak(l, { soort: o.soort ?? "pak", goed: o.test, vraag: o.id, poging: o.poging ?? 1 });
  const hk = B.handKlok(l, { aan: () => pas(l, { hand: true }), uit: () => pas(l, { hand: false }), zin: `${AANMOEDIG_TIKKEN[B.st(l).fout % 2]} ${o.hand}` });
  if (o.zin) void B.zegOpdracht(l, o.zin).catch(() => {});
  hk.opnieuw();
  try {
    const x = await (o.ms ? Promise.race([p, l.wacht(o.ms).then(() => null)]) : p);
    if (x === null) return null;
    B.log(l, "tik", { x: `tegel-${x.n}` });
    return Number(x.n);
  } finally {
    hk.stop();
    pas(l, { actief: false, hand: false });
    zetTestAntwoord(null);
    B.haak(l, null);
  }
}

/** Een tegel in het rooster: bovenop als hij past (een oneven op een oneven draait mee), anders ernaast. */
function leg(vak: Werkvlak, i: number, n: number) {
  vak.legOp(i, n);
}

/* ---------- stap 2: welk getal is dit? ---------- */

async function welkGetal(l: Lesgids, vak: Werkvlak, n: number, nr: number, eerste: boolean) {
  const opties = dichtbij(n, 9);
  const vraag = ZIN.welkGetal[(nr - 1) % ZIN.welkGetal.length];
  return B.keuzeVraag(l, {
    id: `getal${nr}-${n}`,
    opties: schud(opties.map(String)),
    goed: String(n),
    zinnen: [vraag],
    eerste,
    raster: true,
    fout: (x) => getalFout(Number(x), n, opties, nr),
    bijGoed: async (poging, lofZin) => {
      vak.goed(0);
      if (poging === 1) await B.zegDoor(l, lofZin, ZIN.getalGoed(n));
      else await B.zegDoor(l, lofZin);
    },
    samen: async () => {
      /* Bliepo telt de hokjes van de tegel, een voor een (samen voordoen). */
      await telHokjes(l, 0, n);
      await B.zegDoor(l, ZIN.getalTel(n));
    },
  });
}

/* ---------- stap 4 en 6: twee tegels, wat is het totaal? ---------- */

async function totaalVraag(l: Lesgids, vak: Werkvlak, a: number, b: number, nr: number) {
  const t = a + b;
  const opties = dichtbij(t, 18);
  return B.keuzeVraag(l, {
    id: `totaal${nr}-${a}-${b}`,
    opties: schud(opties.map(String)),
    goed: String(t),
    zinnen: ZIN.vraagTotaal(a, b),
    raster: opties.every((o) => o <= 9),
    fout: (x) => totaalFout(Number(x), a, b, opties, nr),
    bijGoed: async (poging, lofZin) => {
      vak.goed(0);
      if (poging === 1) await B.zegDoor(l, lofZin, reactie(l, a, b, t, lofZin));
      else await B.zegDoor(l, lofZin);
    },
    samen: async () => {
      await telHokjes(l, "alle", t);
      await B.zegDoor(l, ZIN.totaalTel(a, b, t));
    },
  });
}

/** Het kind zet 2 tegels in het rooster; de tweede komt erop als hij past, anders ernaast. */
async function tweeTegels(l: Lesgids, vak: Werkvlak, zin: string[], id: string, tests: [number, number]): Promise<[number, number]> {
  const a = (await pakTegel(l, { zin: zin.join(" "), hand: ZIN.tweeTegelsHand, test: tests[0], id: `${id}-a` })) as number;
  zetTestAntwoord(null);
  leg(vak, 0, a);
  const b = (await pakTegel(l, { hand: ZIN.tweeTegelsHand, test: tests[1], id: `${id}-b` })) as number;
  if (pastOp([a], b)) leg(vak, 0, b);
  else leg(vak, 1, b);
  return [a, b];
}

/* ---------- stap 7, 8 en 12: de tegel zoeken die er samen `doel` van maakt ---------- */

async function aanvullen(l: Lesgids, vak: Werkvlak, id: string, gekozen: number, doel: number, vraag: string[], bak: number[]): Promise<Uitkomst> {
  const s = B.st(l);
  s.vraag++;
  const nodig = doel - gekozen;
  let eerder: Fout | null = null;
  let eersteX = "";
  let zinnen = vraag;
  pas(l, { bak, om: gekozen % 2 === 1, hint: null });
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const k = (await pakTegel(l, { zin: zinnen.join(" "), hand: ZIN.kiesHand, test: nodig, id, poging })) as number;
    await l.wacht(DENK_MS);
    if (k === nodig) {
      B.goedMoment(l);
      if (pastOp([gekozen], k)) leg(vak, 0, k);
      else leg(vak, 1, k);
      vak.goed(0);
      if (poging === 1) {
        const lofZin = B.lof(l, false);
        await B.zegDoor(l, lofZin, reactie(l, gekozen, k, doel, lofZin));
        return B.noteer(l, id, "goed");
      }
      await B.zegDoor(l, B.bevestig(l));
      return B.noteer(l, id, "naFout");
    }
    B.foutMoment(l);
    const f = aanvulFout(gekozen, k, doel);
    B.legDenkfoutVast(l, { vraag: id, antwoord: String(k), denkfout: f.code, poging });
    const fz = B.foutZinnen(l, f, poging, eerder).filter(Boolean);
    if (poging === 2 && String(k) === eersteX && fz[0] === f.eerste && f.weer.length) fz.splice(0, fz.length, ...f.weer);
    B.log(l, "reactie", { soort: `fout${poging}`, vraag: id, x: String(k), denkfout: f.code, zin: fz.join(" ") });
    /* De foute tegel verschijnt even en verdwijnt weer (zonder het woord "fout"). */
    await vak.evenLaten(1, k);
    if (poging === 1) {
      await B.zegDoor(l, fz[0]);
      zinnen = fz.slice(1);
      eerder = f;
      eersteX = String(k);
    } else {
      /* 2e fout: uitleg en samen voordoen: een schaduw van de tegel die erbij past; het kind zet hem zelf (kleine stap). */
      await B.zegDoor(l, ...fz);
      pas(l, { hint: { toren: 0, n: nodig } });
      const z = B.zegOpdracht(l, ZIN.samenZet(s.vraag));
      void z.catch(() => {});
      let zelf = false;
      let sinds = Date.now();
      for (;;) {
        const rest = Math.max(500, VANGNET_MS - (Date.now() - sinds));
        const kies = await pakTegel(l, { hand: ZIN.kiesHand, test: nodig, id, poging: 2, ms: rest, soort: "tel" });
        if (kies === nodig) break;
        if (kies === null) {
          zelf = true;
          B.log(l, "vangnet", { id });
          break;
        }
        await vak.evenLaten(1, kies);
        sinds = Date.now();
      }
      pas(l, { hint: null, actief: false, hand: false });
      if (pastOp([gekozen], nodig)) leg(vak, 0, nodig);
      else leg(vak, 1, nodig);
      vak.goed(0);
      await l.wacht(DENK_MS);
      await B.zegDoor(l, zelf ? ZIN.samenZelf(gekozen, nodig, doel) : ZIN.samenGoed(gekozen, nodig, doel));
      return B.noteer(l, id, "samen");
    }
  }
  return B.noteer(l, id, "samen");
}

/* ---------- stap 9: de som kiezen ---------- */

async function somVraag(l: Lesgids, p: number, q: number) {
  const opties = somKeuzes(p, q);
  const delen = [{ t: "getal" as const, n: p }, { t: "teken" as const, s: "+" }, { t: "getal" as const, n: q }, { t: "teken" as const, s: "=" }, { t: "getal" as const, n: 10 }];
  return B.keuzeVraag(l, {
    id: `som-${p}-${q}`,
    opties: schud(opties),
    goed: opties[0],
    zinnen: ZIN.vraagSom(p, q),
    fout: (x) => somFout(x, p, q),
    bijGoed: async (poging, lofZin) => {
      pas(l, { som: delen });
      if (poging === 1) await B.zegDoor(l, lofZin, ZIN.somGoed(p, q));
      else await B.zegDoor(l, lofZin);
    },
    samen: async () => {
      pas(l, { som: delen });
      await B.zegDoor(l, ZIN.somSamen(p, q));
    },
  });
}

/* ---------- stap 11: omwisselen ---------- */

async function omwisselen(l: Lesgids, vak: Werkvlak, p: number, q: number): Promise<Uitkomst> {
  /* De toren draait om: de bovenste tegel komt onder. Het antwoord staat NIET in beeld zolang de vraag open is (15.20). */
  pas(l, { som: null });
  await B.zegDoor(l, ...ZIN.omdraaien);
  await vak.draai(0);
  pas(l, { som: [{ t: "getal", n: q }, { t: "teken", s: "+" }, { t: "getal", n: p }, { t: "teken", s: "=" }, { t: "vak", waarde: "?" }], somAan: 4 });
  const opties = ["10", "9", "11"];
  const uit = await B.keuzeVraag(l, {
    id: `omwisselen-${p}-${q}`,
    opties: schud(opties),
    goed: "10",
    zinnen: ZIN.nuBovenop(p),
    fout: (x) => omwisselFout(Number(x)),
    bijGoed: async (poging, lofZin) => {
      pas(l, { som: [{ t: "getal", n: q }, { t: "teken", s: "+" }, { t: "getal", n: p }, { t: "teken", s: "=" }, { t: "getal", n: 10 }], somAan: null });
      vak.goed(0);
      if (poging === 1) await B.zegDoor(l, lofZin, ZIN.omGoed(p, q));
      else await B.zegDoor(l, lofZin);
    },
    samen: async () => {
      await telHokjes(l, "alle", 10);
      pas(l, { som: [{ t: "getal", n: q }, { t: "teken", s: "+" }, { t: "getal", n: p }, { t: "teken", s: "=" }, { t: "getal", n: 10 }], somAan: null });
      await B.zegDoor(l, ZIN.omTel);
    },
  });
  pas(l, { som: null, somAan: null });
  return uit;
}

/* ---------- de les ---------- */

const gouden: Lesdraaiboek = {
  id: "squla-plus-bakkerij-1-gouden-extra",
  titel: "Plussommen met tegels, extra",
  /* Begint met "Squla": dan kleurt het lesscherm de getallen in Bliepo's tekst (data-squla). */
  synthesis: "Squla groep 3 · Plussommen · Plussommen in de bakkerij · level 1 · gouden les, extra (Synthesis-opdrachten uit het draaiboek Plussommen die niet in de Squla-les zitten: tegels, totaal, samen 7 en 10, de som, omwisselen)",
  indeling: "synthesis",
  browserstem: true,
  nacht: true,
  pijlZoalsSynthesis: true,
  stemHeelUitpraten: true,
  woordenMeeMetStem: true,
  kaarttegels: [3, 1],
  async speel(l) {
    B.log(l, "start");
    const vak = new Werkvlak(l);
    /* Stap 1. Openen: een leeg rooster en de bak met tegels 1 t/m 9; Bliepo groet en zegt wat we gaan doen, in 1 stuk. */
    l.vlak<HoloTegelProps>(KleinTegelVlak, { torens: [], bak: ALLES });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    B.st(l).naamKeer = 1;
    B.st(l).naamVraag = 0;
    await B.zegDoor(l, NAAM_GROET, ZIN.begin.join(" "));

    /* Stap 1-3. Een tegel kiezen en zeggen welk getal het is (3 keer). */
    let bak = [...ALLES];
    for (let nr = 1; nr <= 3; nr++) {
      pas(l, { bak });
      const n = (await pakTegel(l, { zin: nr === 1 ? ZIN.kies1 : ZIN.kiesAnder[nr - 2], hand: nr === 1 ? ZIN.kies1Hand : ZIN.kiesHand, test: nr === 1 ? 5 : nr === 2 ? 2 : 7, id: `kies${nr}` })) as number;
      leg(vak, 0, n);
      await l.wacht(DENK_MS);
      await welkGetal(l, vak, n, nr, nr === 1);
      vak.zet([]);
      bak = bak.filter((x) => x !== n);
    }

    /* Stap 4. Twee tegels naar keuze: wat is het totaal? */
    pas(l, { bak: [1, 2, 3, 4], slot: [] });
    const [a, b] = await tweeTegels(l, vak, ZIN.tweeTegels, "twee1", [2, 3]);
    await totaalVraag(l, vak, a, b, 1);
    vak.zet([]);
    /* Stap 6. Nog eens, met 3 nieuwe tegels. */
    pas(l, { bak: [3, 4, 5], slot: [] });
    const [c, d] = await tweeTegels(l, vak, [ZIN.tweeTegelsNog], "twee2", [4, 5]);
    await totaalVraag(l, vak, c, d, 2);
    vak.zet([]);

    /* Stap 7. Maak samen 7. */
    pas(l, { bak: [1, 2, 3, 4, 5, 6], slot: [] });
    const g7 = (await pakTegel(l, { zin: ZIN.zetEen, hand: ZIN.kiesHand, test: 6, id: "kies-samen7" })) as number;
    leg(vak, 0, g7);
    await aanvullen(l, vak, `samen7-${g7}`, g7, 7, ZIN.maakSamen(g7, 7), [1, 2, 3, 4, 5, 6]);
    vak.zet([]);

    /* Stap 8. Moeilijker: maak samen 10, de som kiezen en omwisselen. */
    pas(l, { bak: ALLES, om: false });
    await B.zegDoor(l, ...ZIN.moeilijker);
    const p = (await pakTegel(l, { hand: ZIN.kiesHand, test: 3, id: "kies-samen10" })) as number;
    leg(vak, 0, p);
    const uit10 = await aanvullen(l, vak, `samen10-${p}`, p, 10, ZIN.maakSamen10(p), ALLES);
    const q = 10 - p;
    vak.torens[0] = { ...vak.toren(0), rand: true };
    vak.toon();
    pas(l, { om: false, bak: ALLES });
    /* Stap 9. Welke som heb je gemaakt? */
    await somVraag(l, p, q);
    vak.torens[0] = { ...vak.toren(0), rand: false };
    vak.toon();
    /* Stap 11. Omwisselen. */
    const uitOm = await omwisselen(l, vak, p, q);
    vak.zet([]);

    /* Stap 12. Nog een manier om 10 (alleen als het omwisselen niet "samen gedaan" was, zoals het draaiboek). */
    if (uitOm !== "samen") {
      B.st(l).laatste = true;
      const rij = ALLES.filter((t) => t !== p && t !== q);
      pas(l, { bak: rij, om: false });
      await B.zegDoor(l, ...ZIN.nogManier);
      const m = (await pakTegel(l, { hand: ZIN.nogManierHand, test: rij.includes(2) ? 2 : rij[0], id: "kies-manier10" })) as number;
      leg(vak, 0, m);
      const bak10 = rij.includes(10 - m) ? rij : [...rij, 10 - m].sort((x, y) => x - y);
      await aanvullen(l, vak, `manier10-${m}`, m, 10, ZIN.maakSamen10(m), bak10);
      vak.zet([]);
    }
    void uit10;

    /* Stap 13. Einde: slotzin, kaart, eindzin. */
    pas(l, { bak: [], torens: [], som: null });
    await B.einde(l, ZIN.slot);
  },
};

export const LESSEN_SQULA_PLUSSOMMEN_EXTRA_GOUDEN: Lesdraaiboek[] = [gouden];
