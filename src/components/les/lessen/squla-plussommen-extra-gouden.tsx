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
 *     stap 13   einde: het nieuwe eindscherm (27 nov 2026, EINDSCHERM-INBOUW.md; was: slotzin, kaart, eindzin).
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
import { percentageGoed } from "@/lib/les-kleuren";
import { EIND_TIK_KAART, eindzin } from "../eindzinnen";
import { maakBasis, schud, type Fout, type Uitkomst } from "./squla-extra-basis";
import { maakKiezer } from "./nooit-dubbel";
import { NAAM_GROET, SOMREACTIE, SOMREACTIE_ROBOT, ZIN, aanvulFout, dichtbij, g, getalFout, maakFoutKiezer, omwisselFout, somFout, somKeuzes, totaalFout } from "./squla-plussommen-extra-zinnen";

const LES_ID = "squla-plus-bakkerij-1-gouden-extra";
const B = maakBasis(LES_ID);
const ALLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const VANGNET_MS = 20000;
const DENK_MS = 200;
const robotGehad = new WeakSet<Lesgids>();

/**
 * NOOIT 2 KEER HETZELFDE (Sara, 18 november 2026): alle zinnen in varianten kiest de les met de gedeelde kiezer
 * (nooit-dubbel.ts). Nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen; "Je koos 4." en "Je koos 6."
 * tellen als dezelfde zin.
 */
const KIEZER = maakKiezer();
const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => KIEZER.kies(sleutel, zinnen, mag);
/** Een kiezer voor de zinnen bij een fout, 1 per vraag (hij onthoudt de 1e keer). `x` = het antwoord zoals het op de knop staat. */
const foutKiezer = (weer: (x: string) => string[] = (x) => ZIN.weerGekozen(/^\d+$/.test(x) ? `{${x}}` : x)) => maakFoutKiezer(KIEZER, weer);
/** De zin bij het hulphandje: pas gekozen als Bliepo hem echt gaat zeggen (anders telt een zin die niemand hoorde mee). */
const handZin = () => {
  let z: string | null = null;
  return () => (z ??= `${variant("aanmoedigTikken", ZIN.aanmoedigTikken)} ${variant("kiesHand", ZIN.kiesHand)}`);
};

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
async function pakTegel(l: Lesgids, o: { zin?: string; test: number | null; id: string; poging?: number; ms?: number; soort?: string }): Promise<number | null> {
  const p = l.wachtOpVlak<{ soort: string; n: number }>("tegel");
  pas(l, { actief: true, hand: false });
  zetTestAntwoord(o.test ? `tegel-${o.test}` : null);
  B.haak(l, { soort: o.soort ?? "pak", goed: o.test, vraag: o.id, poging: o.poging ?? 1 });
  const zin = handZin();
  const hk = B.handKlok(l, {
    aan: () => pas(l, { hand: true }),
    uit: () => pas(l, { hand: false }),
    get zin() {
      return zin();
    },
  });
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
  const kiesFout = foutKiezer();
  const woord = (z: string) => z.split(/[\s,:!.]/)[0].toLowerCase();
  return B.keuzeVraag(l, {
    id: `getal${nr}-${n}`,
    opties: schud(opties.map(String)),
    goed: String(n),
    zinnen: [vraag],
    eerste,
    raster: true,
    fout: (x) => kiesFout(x, getalFout(Number(x), n, opties, nr)),
    bijGoed: async (poging, lofZin) => {
      vak.goed(0);
      /* Niet 2 keer hetzelfde beginwoord ("Klopt helemaal! Klopt, het is een 5."). */
      if (poging === 1) await B.zegDoor(l, lofZin, variant("getalGoed", ZIN.getalGoed(n).filter((z) => woord(z) !== woord(lofZin))));
      else await B.zegDoor(l, lofZin);
    },
    samen: async () => {
      /* Bliepo telt de hokjes van de tegel, een voor een (samen voordoen). */
      await telHokjes(l, 0, n);
      await B.zegDoor(l, variant("getalTel", ZIN.getalTel(n)));
    },
  });
}

/* ---------- stap 4 en 6: twee tegels, wat is het totaal? ---------- */

async function totaalVraag(l: Lesgids, vak: Werkvlak, a: number, b: number, nr: number) {
  const t = a + b;
  const opties = dichtbij(t, 18);
  const kiesFout = foutKiezer();
  return B.keuzeVraag(l, {
    id: `totaal${nr}-${a}-${b}`,
    opties: schud(opties.map(String)),
    goed: String(t),
    zinnen: ZIN.vraagTotaal(a, b),
    raster: opties.every((o) => o <= 9),
    fout: (x) => kiesFout(x, totaalFout(Number(x), a, b, opties, nr)),
    bijGoed: async (poging, lofZin) => {
      vak.goed(0);
      if (poging === 1) await B.zegDoor(l, lofZin, reactie(l, a, b, t, lofZin));
      else await B.zegDoor(l, lofZin);
    },
    samen: async () => {
      await telHokjes(l, "alle", t);
      await B.zegDoor(l, variant("totaalTel", ZIN.totaalTel(a, b, t)));
    },
  });
}

/** Het kind zet 2 tegels in het rooster; de tweede komt erop als hij past, anders ernaast. */
async function tweeTegels(l: Lesgids, vak: Werkvlak, zin: string[], id: string, tests: [number, number]): Promise<[number, number]> {
  const a = (await pakTegel(l, { zin: zin.join(" "), test: tests[0], id: `${id}-a` })) as number;
  zetTestAntwoord(null);
  leg(vak, 0, a);
  const b = (await pakTegel(l, { test: tests[1], id: `${id}-b` })) as number;
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
  let zinnen = vraag;
  const kiesFout = foutKiezer((x) => [`Je koos weer de ${g(Number(x))}.`, `Weer de ${g(Number(x))}, zie ik.`]);
  pas(l, { bak, om: gekozen % 2 === 1, hint: null });
  for (let poging = 1 as 1 | 2; poging <= 2; poging++) {
    const k = (await pakTegel(l, { zin: zinnen.join(" "), test: nodig, id, poging })) as number;
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
    /* De kiezer geeft precies de 2 zinnen die Bliepo gaat zeggen (ook "weer" bij 2 keer dezelfde denkfout). */
    const f = kiesFout(String(k), aanvulFout(gekozen, k, doel));
    B.legDenkfoutVast(l, { vraag: id, antwoord: String(k), denkfout: f.code, poging });
    const fz = B.foutZinnen(l, f, poging, eerder).filter(Boolean);
    B.log(l, "reactie", { soort: `fout${poging}`, vraag: id, x: String(k), denkfout: f.code, zin: fz.join(" ") });
    /* De foute tegel verschijnt even en verdwijnt weer (zonder het woord "fout"). */
    await vak.evenLaten(1, k);
    if (poging === 1) {
      await B.zegDoor(l, fz[0]);
      zinnen = fz.slice(1);
      eerder = f;
    } else {
      /* 2e fout: uitleg en samen voordoen: een schaduw van de tegel die erbij past; het kind zet hem zelf (kleine stap). */
      await B.zegDoor(l, ...fz);
      pas(l, { hint: { toren: 0, n: nodig } });
      const z = B.zegOpdracht(l, variant("samenZet", ZIN.samenZet));
      void z.catch(() => {});
      let zelf = false;
      let sinds = Date.now();
      for (;;) {
        const rest = Math.max(500, VANGNET_MS - (Date.now() - sinds));
        const kies = await pakTegel(l, { test: nodig, id, poging: 2, ms: rest, soort: "tel" });
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
      /* 15.40 (F20): ook na samen doen het groene scherm en het geluid (goed-na-hulp). */
      B.goedMoment(l);
      await B.zegDoor(l, zelf ? variant("samenZelf", ZIN.samenZelf(gekozen, nodig, doel)) : variant("samenGoed", ZIN.samenGoed(gekozen, nodig, doel)));
      return B.noteer(l, id, "samen");
    }
  }
  return B.noteer(l, id, "samen");
}

/* ---------- stap 9: de som kiezen ---------- */

async function somVraag(l: Lesgids, p: number, q: number) {
  const opties = somKeuzes(p, q);
  const kiesFout = foutKiezer();
  const delen = [{ t: "getal" as const, n: p }, { t: "teken" as const, s: "+" }, { t: "getal" as const, n: q }, { t: "teken" as const, s: "=" }, { t: "getal" as const, n: 10 }];
  return B.keuzeVraag(l, {
    id: `som-${p}-${q}`,
    opties: schud(opties),
    goed: opties[0],
    zinnen: ZIN.vraagSom,
    fout: (x) => kiesFout(x, somFout(x, p, q)),
    bijGoed: async (poging, lofZin) => {
      pas(l, { som: delen });
      if (poging === 1) await B.zegDoor(l, lofZin, variant("somGoed", ZIN.somGoed(p, q)));
      else await B.zegDoor(l, lofZin);
    },
    samen: async () => {
      pas(l, { som: delen });
      await B.zegDoor(l, variant("somSamen", ZIN.somSamen(p, q)));
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
  const kiesFout = foutKiezer();
  const uit = await B.keuzeVraag(l, {
    id: `omwisselen-${p}-${q}`,
    opties: schud(opties),
    goed: "10",
    zinnen: ZIN.nuBovenop(p),
    fout: (x) => kiesFout(x, omwisselFout(Number(x))),
    bijGoed: async (poging, lofZin) => {
      pas(l, { som: [{ t: "getal", n: q }, { t: "teken", s: "+" }, { t: "getal", n: p }, { t: "teken", s: "=" }, { t: "getal", n: 10 }], somAan: null });
      vak.goed(0);
      if (poging === 1) await B.zegDoor(l, lofZin, variant("omGoed", ZIN.omGoed(p, q)));
      else await B.zegDoor(l, lofZin);
    },
    samen: async () => {
      await telHokjes(l, "alle", 10);
      pas(l, { som: [{ t: "getal", n: q }, { t: "teken", s: "+" }, { t: "getal", n: p }, { t: "teken", s: "=" }, { t: "getal", n: 10 }], somAan: null });
      await B.zegDoor(l, variant("omTel", ZIN.omTel));
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
  /* De oude kaart met tegels (kaarttegels) gebruikt deze les niet meer sinds het nieuwe eindscherm (27 nov 2026). */
  kaarttegels: [3, 1],
  eindscherm: true,
  eindLeerzin: "Je kunt nu met tegels optellen tot 10.",
  eindPlaatje: "/voorwerpen/tegels/tegel-1.png",
  eindOnderwerp: "Optellen met tegels",
  eindKaartZin: EIND_TIK_KAART,
  async speel(l) {
    B.log(l, "start");
    if (l.snelEinde) return snelNaarEinde(l);
    /* Voortgangsbalk (15.54): 10 vragen (3x welk getal, 2x totaal, samen 7, samen 10, de som, omwisselen, nog een manier
       voor 10). Valt de laatste weg (na samen doen), dan wordt de balk vol bij de eindkaart. */
    B.st(l).totaal = 10;
    l.voortgang?.(0);
    const vak = new Werkvlak(l);
    /* Stap 1. Openen: een leeg rooster en de bak met tegels 1 t/m 9; Bliepo groet en zegt wat we gaan doen, in 1 stuk. */
    l.vlak<HoloTegelProps>(KleinTegelVlak, { torens: [], bak: ALLES });
    speelLesgeluid("verschijn");
    await l.wacht(600);
    B.st(l).naamKeer = 1;
    B.st(l).naamVraag = 0;
    /* Verdergaan (15.53): "welkom terug" in plaats van de groet. Opnieuw doen: eerst zeggen dat het kind de les al deed. */
    if (l.hervat) await B.zegDoor(l, l.openingsZin ?? NAAM_GROET);
    /* Opnieuw doen na de beste kleur (15.60, zoals Synthesis): eerst de groet, dan "dit ken je al", en meteen de eerste
       opdracht (zonder "vandaag rekenen we met tegels" en "tel de vakjes"). */
    else if (l.zonderUitleg) await B.zegDoor(l, ...[NAAM_GROET, l.openingsZin ?? ""].filter(Boolean));
    else await B.zegDoor(l, ...(l.openingsZin ? [l.openingsZin] : []), NAAM_GROET, `${variant("begin", ZIN.begin)} ${ZIN.beginTegels}`);
    /* Verdergaan (15.53): de vraag-id's hangen af van de tegels die het kind koos; die worden onthouden (l.onthoud). */
    const eerder = (k: string) => Number(l.hervat?.extra[k] ?? 0);

    /* Stap 1-3. Een tegel kiezen en zeggen welk getal het is (3 keer). */
    let bak = [...ALLES];
    for (let nr = 1; nr <= 3; nr++) {
      const al = eerder(`kies${nr}`);
      if (al && B.klaarAl(l, `getal${nr}-${al}`)) {
        bak = bak.filter((x) => x !== al);
        continue;
      }
      pas(l, { bak });
      const n = (await pakTegel(l, { zin: nr === 1 ? ZIN.kies1 : variant("kiesAnder", ZIN.kiesAnder), test: nr === 1 ? 5 : nr === 2 ? 2 : 7, id: `kies${nr}` })) as number;
      l.onthoud?.(`kies${nr}`, n);
      leg(vak, 0, n);
      await l.wacht(DENK_MS);
      await welkGetal(l, vak, n, nr, nr === 1);
      vak.zet([]);
      bak = bak.filter((x) => x !== n);
    }

    /* Stap 4. Twee tegels naar keuze: wat is het totaal? */
    for (const [nr, zin, bakTwee, tests] of [
      [1, ZIN.tweeTegels, [1, 2, 3, 4], [2, 3]],
      [2, [ZIN.tweeTegelsNog], [3, 4, 5], [4, 5]],
    ] as [number, string[], number[], [number, number]][]) {
      const [ea, eb] = [eerder(`twee${nr}a`), eerder(`twee${nr}b`)];
      if (ea && eb && B.klaarAl(l, `totaal${nr}-${ea}-${eb}`)) continue;
      pas(l, { bak: bakTwee, slot: [] });
      const [a, b] = await tweeTegels(l, vak, zin, `twee${nr}`, tests);
      l.onthoud?.(`twee${nr}a`, a);
      l.onthoud?.(`twee${nr}b`, b);
      await totaalVraag(l, vak, a, b, nr);
      vak.zet([]);
      /* Stap 6. Nog eens, met 3 nieuwe tegels (de 2e ronde hierboven). */
    }

    /* Stap 7. Maak samen 7. */
    const al7 = eerder("samen7");
    if (!(al7 && B.klaarAl(l, `samen7-${al7}`))) {
      pas(l, { bak: [1, 2, 3, 4, 5, 6], slot: [] });
      const g7 = (await pakTegel(l, { zin: ZIN.zetEen, test: 6, id: "kies-samen7" })) as number;
      l.onthoud?.("samen7", g7);
      leg(vak, 0, g7);
      await aanvullen(l, vak, `samen7-${g7}`, g7, 7, ZIN.maakSamen(g7, 7), [1, 2, 3, 4, 5, 6]);
      vak.zet([]);
    }

    /* Stap 8. Moeilijker: maak samen 10, de som kiezen en omwisselen. */
    const al10 = eerder("samen10");
    let p: number;
    if (al10 && B.klaarAl(l, `samen10-${al10}`)) {
      /* Verdergaan: de toren van samen 10 staat weer in het rooster, zoals na de vraag. */
      p = al10;
      pas(l, { bak: ALLES, om: false });
      leg(vak, 0, p);
      if (pastOp([p], 10 - p)) leg(vak, 0, 10 - p);
      else leg(vak, 1, 10 - p);
    } else {
      pas(l, { bak: ALLES, om: false });
      /* De lof alleen als hij klopt: niets samen voorgedaan en minder dan de helft na een fout (keuring 20 nov). */
      const totNu = [...B.st(l).eerste.values()];
      const snapt = !totNu.includes("samen") && !B.veelFouten(l);
      await B.zegDoor(l, ...(snapt ? [ZIN.moeilijkerLof, ...ZIN.moeilijker] : ZIN.moeilijker));
      p = (await pakTegel(l, { test: 3, id: "kies-samen10" })) as number;
      l.onthoud?.("samen10", p);
      leg(vak, 0, p);
      await aanvullen(l, vak, `samen10-${p}`, p, 10, ZIN.maakSamen10(p), ALLES);
    }
    const q = 10 - p;
    /* Stap 9. Welke som heb je gemaakt? */
    if (!B.klaarAl(l, `som-${p}-${q}`)) {
      vak.torens[0] = { ...vak.toren(0), rand: true };
      vak.toon();
      pas(l, { om: false, bak: ALLES });
      await somVraag(l, p, q);
      vak.torens[0] = { ...vak.toren(0), rand: false };
      vak.toon();
    }
    /* Stap 11. Omwisselen. */
    const uitOm = B.klaarAl(l, `omwisselen-${p}-${q}`) ? B.st(l).eerste.get(`omwisselen-${p}-${q}`) : await omwisselen(l, vak, p, q);
    vak.zet([]);

    /* Stap 12. Nog een manier om 10 (alleen als het omwisselen niet "samen gedaan" was, zoals het draaiboek). */
    const alM = eerder("manier10");
    if (uitOm !== "samen" && !(alM && B.klaarAl(l, `manier10-${alM}`))) {
      B.st(l).laatste = true;
      const rij = ALLES.filter((t) => t !== p && t !== q);
      pas(l, { bak: rij, om: false });
      await B.zegDoor(l, ...ZIN.nogManier);
      const m = (await pakTegel(l, { test: rij.includes(2) ? 2 : rij[0], id: "kies-manier10" })) as number;
      l.onthoud?.("manier10", m);
      leg(vak, 0, m);
      const bak10 = rij.includes(10 - m) ? rij : [...rij, 10 - m].sort((x, y) => x - y);
      await aanvullen(l, vak, `manier10-${m}`, m, 10, ZIN.maakSamen10(m), bak10);
      vak.zet([]);
    }

    /* Stap 13. Einde: het nieuwe eindscherm (27 nov 2026). Was: slotzin (ZIN.slot), de kaart met tegels, een eindzin
       (EINDE / EINDE_VEEL_FOUTEN) met "Tik op de kaart." (ZIN.kaartTik) en het afscheid (afscheidNa). */
    pas(l, { bak: [], torens: [], som: null });
    /* Voortgangsbalk (15.54): aan het eind precies vol (ook als de laatste vraag wegviel). */
    l.voortgang?.(1);
    await eindeScherm(l);
  },
};

/**
 * Percentage goed in 1 keer en de denkfouten van deze speelbeurt (voor de kleur van de kaart en het bewaren). Op de
 * voorbeeldpagina kun je met `&snel=p72` een percentage forceren (alleen om elke kleur te kunnen zien).
 * Deze les heeft 10 vragen, of 9 als "nog een manier om 10" wegvalt (na samen omwisselen): dan telt de 10e niet mee.
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
  const gesteld = s.eerste.size > 0 ? s.eerste.size : s.totaal;
  return { percentage: percentageGoed(goed, gesteld), denkfouten: [...s.alleDenkfouten] };
}

/** Het eindscherm met 1 standaard eindzin van Bliepo (eindzinnen.ts), daarna de leerzin en de kaart (Lesscherm). */
async function eindeScherm(l: Lesgids) {
  void l.zeg().catch(() => {});
  l.verderWeg?.();
  /* Het laatste sleuteltje vliegt nog (±0,9 s): eerst laten aankomen, dan pas het feest. */
  await l.wacht(1000);
  B.log(l, "eindscherm");
  l.eindscherm?.(resultaat(l));
  /* Bliepo praat pas als het feestgeluid (±1,4 s) voorbij is en de ster komt. */
  await l.wacht(1500);
  await B.zeg(l, eindzin(resultaat(l).percentage));
  await l.eindAfsluiten?.();
}

/** Alleen op de voorbeeldpagina (`&snel=1`): meteen naar het eindscherm, met een paar sleutels om de teller te zien. Bewaart niets. */
async function snelNaarEinde(l: Lesgids) {
  B.st(l).totaal = 10;
  l.voortgang?.(0);
  const n = l.snelEinde === "alles" ? 5 : l.snelEinde === "moeite" ? 1 : 3;
  l.vlak<HoloTegelProps>(KleinTegelVlak, { torens: [], bak: ALLES });
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

export const LESSEN_SQULA_PLUSSOMMEN_EXTRA_GOUDEN: Lesdraaiboek[] = [gouden];
