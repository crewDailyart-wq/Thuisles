/**
 * Lessen "Meer, minder, evenveel" naar Squla groep 3 Rekenen (30 oktober 2026,
 * opdracht eigenaar). Per Squla-oefening per level één les; elke les volgt hoe
 * dat level bij Squla is opgebouwd (zelfde soort vragen, zelfde volgorde,
 * zelfde getallenreeks), met eigen getallen, eigen zinnen en eigen
 * tekeningen. De analyse staat in SQULA-ANALYSE/meer-minder-*-volledig.md.
 *
 *   Meer, minder, evenveel 1 (10971)   squla-meer-minder-evenveel1-1/2/3
 *   Meer, minder, evenveel 2 (10972)   squla-meer-minder-evenveel2-1/2
 *   Meer, minder, evenveel 3 (10973)   squla-meer-minder-evenveel3-1/2
 *
 * (meer-minder-8046 is een filmpje: geen les.)
 *
 * De hulp is die van Synthesis (4 november 2026, BOUWREGELS 5.1 en 5.10): goed = kort en
 * door; eerste fout = een korte reactie op wat het kind koos, met een hint die bij de
 * vraag past; tweede fout = Bliepo laat het goede antwoord zien (tellen, het goede
 * kaartje oplichten, de kaarten in de goede volgorde) en het kind gaat door.
 * Squla zegt bij deze
 * oefeningen niets bij een fout (alleen rood en groen). Bliepo's uitleg is
 * daarom de vaste hulp uit de Synthesis-lessen: samen tellen in beeld (rij
 * voor rij, met het getal achter elke rij) of de groepjes naast elkaar
 * leggen (elke kaart samen tellen en het getal erbij zetten). Bij getallen
 * op volgorde laat Bliepo de tientallen als staven zien. Bliepo telt bij één
 * groep nooit tot het eind: het laatste stukje telt het kind zelf.
 *
 * Alles in de hologramstijl (holo/basis.ts), in Phaser (HARDE REGEL 7).
 */

import { bevestig, krijgtVervolgvraag, zetSynthesisHulp } from "./squla-uitleg";
import type { Lesdraaiboek, Lesgids } from "../soort";
import { speelLesgeluid } from "@/lib/lesgeluiden";
import { squlaBegin, squlaEind, squlaVraag } from "./squla-hulp";
import {
  KaartMeerMinder,
  SqulaMeerMinder,
  aantalIn,
  type MMDing,
  type MMGroep,
  type MMKleur,
  type MMOpgave,
  type MMProps,
  type MMSoort,
} from "../vlakken/squla-meer-minder-vlak";
import { MM_VASTE_KLEUR, MM_VOORWERPEN } from "../vlakken/squla-meer-minder-tekenen";

/* =====================================================================
   Voorwerpen
   ===================================================================== */

type Vw = {
  soort: MMSoort;
  /** Meervoud, zoals in de vraag: "Tel de appels." */
  naam: string;
  /** De kleur per rij, om en om (of "bont": elk voorwerp een andere kleur). */
  kleuren: MMKleur[] | "bont";
  /** De kleur van het getal in de zin (één kleur in beeld = die kleur, meer kleuren = wit). */
  k: MMKleur;
};

/** Eén ding in zijn vaste kleur (31 oktober 2026: elk ding één kleur, geen om-en-om kleuren meer). */
const vw = (soort: MMSoort, naam: string): Vw => ({ soort, naam, kleuren: [MM_VASTE_KLEUR[soort]], k: MM_VASTE_KLEUR[soort] });

/*
  Sinds 31 oktober 2026 heeft elk ding één vaste kleur. Waar Squla de rijen om
  en om een andere kleur gaf, staan ze nu in één kleur (de rijen en blokjes
  staan nog wel los van elkaar). Dieren zijn dingen geworden: de vissen
  ballonnen, de lieveheersbeestjes aardbeien, de vlinders knikkers; de groene
  appels zijn peren.
*/
const APPELS = vw("appel", "appels");
const APPELS_RG = APPELS;
const PEREN = vw("peer", "peren");
const STERREN = vw("ster", "sterren");
const STERREN_2 = STERREN;
const BLOEMEN = vw("bloem", "bloemen");
const BLOEMEN_2 = BLOEMEN;
const BALLONNEN = vw("ballon", "ballonnen");
const BALLONNEN_2 = BALLONNEN;
const BALLEN = vw("bal", "ballen");
const BALLEN_2 = BALLEN;
const KRALEN = vw("kraal", "kralen");
const KOEKJES = vw("koekje", "koekjes");
const KOEKJES_2 = KOEKJES;
const EIEREN = vw("ei", "eieren");
const EIEREN_2 = EIEREN;
const AARDBEIEN = vw("aardbei", "aardbeien");
const KNIKKERS = vw("knikker", "knikkers");
const KNIKKERS_2 = KNIKKERS;

/* ---------- groepen ---------- */

const rijenVan = (n: number, per: number) => Array.from({ length: Math.ceil(n / per) }, (_, r) => Math.min(per, n - r * per));

/** In rijen van 5 (de laatste rij is het restje). */
const r5 = (v: Vw, n: number): MMGroep => ({ soort: v.soort, blokken: [{ rijen: rijenVan(n, 5), kleuren: v.kleuren }] });
/** In rijen van 10, om en om van kleur. */
const r10 = (v: Vw, n: number): MMGroep => ({ soort: v.soort, blokken: [{ rijen: rijenVan(n, 10), kleuren: v.kleuren }] });
/** Rijen van 5 en rechts een los groepje. */
const losRechts = (v: Vw, vast: number, los: number): MMGroep => ({ soort: v.soort, blokken: [{ rijen: rijenVan(vast, 5), kleuren: v.kleuren }, { rijen: [los], kleuren: v.kleuren }] });
/** Links 10 (2 rijen van 5), rechts de rest (sinds 31 oktober 2026 in de vaste kleur van het ding). */
const tweeKleur = (v: Vw, _links: MMKleur, _rechts: MMKleur, n: number): MMGroep => ({
  soort: v.soort,
  blokken: [
    { rijen: [5, 5], kleuren: v.kleuren },
    { rijen: rijenVan(n, 5), kleuren: v.kleuren },
  ],
});
/** Rijen van een andere lengte dan 5 (niet per 5 gegroepeerd). */
const vrij = (v: Vw, rijen: number[]): MMGroep => ({ soort: v.soort, blokken: [{ rijen, kleuren: v.kleuren }] });
/** Eieren in doosjes van 6. */
const dozen = (n: number): MMGroep => ({ soort: "ei", blokken: Array.from({ length: n }, () => ({ rijen: [3, 3], kleuren: ["wit"] as MMKleur[], doos: true })) });

/** Waar Bliepo bij samen tellen stopt om het getal te zeggen: na elke rij (of elk doosje). */
function einden(g: MMGroep): number[] {
  const uit: number[] = [];
  let t = 0;
  for (const b of g.blokken) {
    if (b.doos) {
      t += b.rijen.reduce((a, r) => a + r, 0);
      uit.push(t);
      continue;
    }
    for (const r of b.rijen) {
      t += r;
      uit.push(t);
    }
  }
  return uit;
}

/* =====================================================================
   Vragen
   ===================================================================== */

type Wat = "meer" | "minder";

type Vraag =
  /** Tel de groep en kies het getal (evenveel, of een getal dat meer of minder is). */
  | { t: "tel"; v: Vw; groep: MMGroep; keuzes: number[]; vraagt: "evenveel" | Wat }
  /** Een voorbeeldgroep bovenaan en twee kaarten: waar zie je meer (minder) dan bovenaan? */
  | { t: "voorbeeld"; v: Vw; voorbeeld: number; kaarten: number[]; wat: Wat }
  /** Twee kaarten naast elkaar: op welke kaart zijn er meer (minder)? */
  | { t: "twee"; v: Vw; kaarten: number[]; wat: Wat }
  /** Drie kaarten: waar liggen de meeste (minste)? */
  | { t: "drie"; v: Vw; kaarten: number[]; wat: Wat }
  /** Een getal en twee kaarten: welke kaart heeft meer dan, minder dan, of evenveel als het getal? */
  | { t: "getal"; v: Vw; getal: number; kaarten: number[]; wat: Wat | "evenveel" }
  /** Kaarten met groepen op volgorde, van minder naar meer. */
  | { t: "rij"; v: Vw; kaarten: number[] }
  /** Potjes of vliegers met een getal op volgorde. */
  | { t: "getallen"; ding: MMDing; getallen: number[]; richting: "op" | "af" };

const g = (n: number, k: MMKleur) => `{${n}:${k}}`;
const w = (n: number) => g(n, "wit");
const DINGNAAM: Record<MMDing, string> = { potje: "potjes", vlieger: "vliegers" };

type Stand = {
  huidig: string;
  goed: number;
  fout: number;
  ronde: number;
  handGezien: boolean;
  /** Welke soorten vragen Bliepo al heeft uitgelegd (de eerste keer zegt hij wat je moet doen). */
  gezien: Set<string>;
};

const zet = (l: Lesgids, p: Partial<MMProps>) => l.pasVlakAan<MMProps>(p);

/** Een groep in rijen van 5 voor op een kaart. */
const kaartGroep = (v: Vw, n: number) => r5(v, n);

function opgaveVan(id: string, q: Vraag): MMOpgave {
  if (q.t === "tel") return { id, soort: "tel", groep: q.groep };
  if (q.t === "voorbeeld") return { id, soort: "kaarten", voorbeeld: kaartGroep(q.v, q.voorbeeld), kaarten: q.kaarten.map((n) => kaartGroep(q.v, n)) };
  if (q.t === "twee" || q.t === "drie") return { id, soort: "kaarten", kaarten: q.kaarten.map((n) => kaartGroep(q.v, n)) };
  if (q.t === "getal") return { id, soort: "kaarten", getal: q.getal, kaarten: q.kaarten.map((n) => kaartGroep(q.v, n)) };
  if (q.t === "rij") return { id, soort: "volgorde", kaarten: q.kaarten.map((n) => kaartGroep(q.v, n)) };
  return { id, soort: "getallen", ding: q.ding, getallen: q.getallen };
}

/** Zet een nieuwe opgave in beeld (en alles van de vorige weg). */
function toonOpgave(l: Lesgids, st: Stand, id: string, o: MMOpgave, test: string[] | null = null) {
  if (st.huidig === id) return;
  st.huidig = id;
  zet(l, { opgave: o, tel: null, bordjes: null, plekGoed: null, zetOp: null, staven: false, hand: false, actief: false, test });
}

/* ---------- samen tellen ---------- */

/** Waar Bliepo stopt met samen tellen: na de voorlaatste rij (het laatste stukje telt het kind). */
function telBegin(groep: MMGroep): number {
  const e = einden(groep);
  return e[Math.max(1, e.length - 1) - 1];
}

/** Bliepo telt één groep rij voor rij, maar niet tot het eind. */
async function telSamen(l: Lesgids, v: Vw, groep: MMGroep, vak: number): Promise<void> {
  const e = einden(groep);
  const isDoos = groep.blokken.some((b) => b.doos);
  const rijen = groep.blokken.flatMap((b) => b.rijen);
  const per = rijen[0];
  if (isDoos) await l.zeg(`In een vol doosje zitten ${g(6, v.k)} ${v.naam}.`, "Ik tel eerst de volle doosjes.");
  else if (rijen.slice(0, -1).every((r) => r === per) && (per === 5 || per === 10)) await l.zeg(`In een volle rij staan ${g(per, v.k)} ${v.naam}.`, "Zo kan ik per rij springen.");
  else await l.zeg(`De rijen met ${v.naam} zijn niet even lang.`, "Daarom tel ik elke rij apart.");
  let geteld = 0;
  const stop = Math.max(1, e.length - 1);
  for (let r = 0; r < stop; r++) {
    for (; geteld < e[r]; geteld++) {
      zet(l, { tel: { vak, geteld: geteld + 1 } });
      await l.wacht(e[r] - (r ? e[r - 1] : 0) > 6 ? 55 : 110);
    }
    /* Bliepo noemt het totaal tot nu toe: alles wat geteld is krijgt 1 fel rondje (besluit 4). */
    zet(l, { tel: { vak, geteld, samen: true } });
    await l.zeg(`${g(e[r], v.k)}.`);
  }
  zet(l, { tel: { vak, geteld, stil: true } });
  if (!krijgtVervolgvraag(l)) await l.zeg(`Tel jij verder vanaf ${g(e[stop - 1], v.k)}?`);
}

/**
 * De groepjes naast elkaar leggen: Bliepo telt elke kaart (rij voor rij licht
 * op) en zet het getal op de hoek. `vakken` = de kaarten in de volgorde van
 * het vlak (de voorbeeldgroep eerst).
 */
async function kaartenTellen(l: Lesgids, v: Vw, aantallen: number[], metVoorbeeld: boolean, slot = "Kijk naar de getallen bij de groepjes. Die helpen je vergelijken.") {
  const bordjes: (number | null)[] = aantallen.map(() => null);
  await l.zeg(`Ik tel de ${v.naam} op elke kaart.`);
  for (let j = 0; j < aantallen.length; j++) {
    const e = einden(kaartGroep(v, aantallen[j]));
    for (const eind of e) {
      zet(l, { tel: { vak: j, geteld: eind } });
      await l.wacht(260);
    }
    bordjes[j] = aantallen[j];
    zet(l, { bordjes: [...bordjes], tel: { vak: j, geteld: aantallen[j], samen: true } });
    speelLesgeluid("tik");
    await l.zeg(metVoorbeeld && j === 0 ? `Bovenaan zijn het er ${g(aantallen[j], v.k)}.` : `Hier zijn het er ${g(aantallen[j], v.k)}.`);
    zet(l, { tel: null });
  }
  await l.zeg(slot);
}

/** De tientallen als staven onder de getallen. */
async function stavenLaten(l: Lesgids, getallen: number[]) {
  zet(l, { staven: true });
  await l.zeg("Kijk, onder elk getal staan staven.");
  /* Het rondje (BOUWREGELS 7.8): 1 staaf bij "Elke staaf is 10", daarna de staven en blokjes onder het getal dat Bliepo noemt; steeds maar 1, en weg als hij verdergaat. */
  zet(l, { wijs: "staaf" });
  await l.zeg(`Elke staaf is ${w(10)}.`);
  for (const [i, n] of getallen.entries()) {
    const tien = Math.floor(n / 10);
    const een = n % 10;
    const staven = tien === 1 ? "staaf" : "staven";
    zet(l, { wijs: `staven-${i}` });
    if (tien === 0) await l.zeg(`Bij ${w(n)} zie je geen staaf, alleen ${w(een)} ${een === 1 ? "los blokje" : "losse blokjes"}.`);
    else if (een === 0) await l.zeg(`Bij ${w(n)} zie je ${w(tien)} ${staven}.`);
    else await l.zeg(`Bij ${w(n)} zie je ${w(tien)} ${staven} en ${w(een)} ${een === 1 ? "los blokje" : "losse blokjes"}.`);
  }
  zet(l, { wijs: null });
  await l.zeg("Kijk eerst waar de meeste staven staan. Daar hoort het grootste getal bij.");
  const tientallen = getallen.map((n) => Math.floor(n / 10));
  if (new Set(tientallen).size < tientallen.length) await l.zeg("Zijn er evenveel staven, dan tel je de losse blokjes erbij.");
}

/* ---------- één vraag ---------- */

async function tikKaart(l: Lesgids, st: Stand): Promise<number> {
  zet(l, { ronde: ++st.ronde, actief: true });
  const x = await l.wachtOpVlak<{ soort: string; vak: number }>("kaart");
  zet(l, { actief: false });
  return x.vak;
}

async function zetOpVolgorde(l: Lesgids, st: Stand): Promise<number[]> {
  zet(l, { ronde: ++st.ronde, plekGoed: null, zetOp: null, actief: true, hand: !st.handGezien });
  const x = await l.wachtOpVlak<{ soort: string; rij: number[] }>("volgorde");
  st.handGezien = true;
  zet(l, { actief: false, hand: false });
  return x.rij;
}

/** De goede volgorde (nummers van de kaarten): van minder naar meer ("op") of van meer naar minder ("af"). */
const volgordeVan = (aantallen: number[], richting: "op" | "af") =>
  aantallen.map((n, i) => ({ n, i })).sort((a, b) => (richting === "op" ? a.n - b.n : b.n - a.n)).map((x) => x.i);

/** Wat Bliepo de eerste keer bij een soort vraag zegt. */
async function eersteKeer(l: Lesgids, st: Stand, q: Vraag) {
  const soort = q.t === "tel" ? `tel-${q.vraagt}` : q.t;
  if (st.gezien.has(soort)) return;
  const eerder = st.gezien.size > 0;
  st.gezien.add(soort);
  if (q.t === "tel") {
    if (q.vraagt !== "evenveel" && eerder) await l.zeg(`Let op, nu gaat het niet om evenveel, maar om ${q.vraagt}.`);
    return;
  }
  if (q.t === "voorbeeld") await l.zeg("Kijk eerst naar de groep bovenaan.", "Tik dan op een kaart.");
  else if (q.t === "rij") await l.zeg(eerder ? "Nu zie je 4 kaarten." : "Kijk, 4 kaarten.", "Sleep ze naar de vakjes.");
  else if (q.t === "getallen") await l.zeg(eerder ? `Nu zie je 3 ${DINGNAAM[q.ding]}.` : `Kijk, 3 ${DINGNAAM[q.ding]}.`, `Sleep de ${DINGNAAM[q.ding]} naar de vakjes.`);
  else await l.zeg(eerder ? "Nu zoek je de goede kaart." : "Kijk goed naar de kaarten.", "Tik op de goede kaart.");
}

function vraagZin(q: Vraag): string[] {
  switch (q.t) {
    case "tel":
      return [`Tel de ${q.v.naam}.`, q.vraagt === "evenveel" ? `Hoeveel ${q.v.naam} zijn het?` : `Welk getal is ${q.vraagt} dan het aantal ${q.v.naam}?`];
    case "voorbeeld":
      return [`Waar zie je ${q.wat} ${q.v.naam} dan bovenaan?`];
    case "twee":
      return [`Op welke kaart zijn er ${q.wat} ${q.v.naam}?`];
    case "drie":
      return [`Waar liggen de ${q.wat === "meer" ? "meeste" : "minste"} ${q.v.naam}?`];
    case "getal":
      return [q.wat === "evenveel" ? `Welke kaart heeft evenveel als ${w(q.getal)}?` : `Welke kaart heeft ${q.wat} dan ${w(q.getal)}?`];
    case "rij":
      return ["Zet de kaarten op volgorde.", "Van minder naar meer."];
    case "getallen":
      return [`Zet de ${DINGNAAM[q.ding]} op volgorde.`, q.richting === "op" ? "Van minder naar meer." : "Van meer naar minder."];
  }
}

/** Is kaart `x` de goede? */
function goedeKaart(q: Extract<Vraag, { t: "voorbeeld" | "twee" | "drie" | "getal" }>): number {
  const a = q.kaarten;
  if (q.t === "getal") {
    if (q.wat === "evenveel") return a.indexOf(q.getal);
    return a.findIndex((n) => (q.wat === "meer" ? n > q.getal : n < q.getal));
  }
  if (q.t === "voorbeeld") return a.findIndex((n) => (q.wat === "meer" ? n > q.voorbeeld : n < q.voorbeeld));
  const doel = q.wat === "meer" ? Math.max(...a) : Math.min(...a);
  return a.indexOf(doel);
}

/** Eén vraag met de vaste hulp van Bliepo. Geeft `true` als hij meteen goed was. */
async function speelVraag(l: Lesgids, id: string, q: Vraag, st: Stand): Promise<boolean> {
  const o = opgaveVan(id, q);

  if (q.t === "tel") {
    const goed = aantalIn(q.groep);
    const antwoord = q.vraagt === "evenveel" ? goed : q.keuzes.find((n) => (q.vraagt === "meer" ? n > goed : n < goed))!;
    toonOpgave(l, st, id, o);
    await eersteKeer(l, st, q);
    const begin = telBegin(q.groep);
    let nFout = 0;
    const naam = q.v.naam;
    const tip =
      q.vraagt === "evenveel"
        ? [`Ik heb al tot ${g(begin, q.v.k)} geteld.`, `Tel de volgende rij erbij en ga zo door tot de laatste ${naam}.`]
        : [`Ik heb al tot ${g(begin, q.v.k)} geteld. Tel de rest van de ${naam} erbij.`, `Zoek daarna een getal dat ${q.vraagt === "meer" ? "groter" : "kleiner"} is dan het aantal ${naam}.`];
    return squlaVraag<number>(l, {
      synthesis: true,
      reactie: (x) => {
        const X = g(x, q.v.k);
        let zin: string;
        if (q.vraagt === "evenveel") {
          if (x === goed - 1) zin = `Bij ${X} mist er 1. Misschien sloeg je er 1 over.`;
          else if (x === goed + 1) zin = `Bij ${X} heb je er 1 te veel. Misschien telde je er 1 dubbel.`;
          else if (x < goed && einden(q.groep).includes(x)) zin = `${X} is waar een rij ophoudt. Je telde de laatste rij met ${naam} niet mee.`;
          else zin = x < goed ? `Er staan meer ${naam} dan ${X}.` : `Er staan niet zo veel ${naam} als ${X}.`;
        } else if (x === goed) zin = `${X} is precies evenveel als het aantal ${naam}, maar je zoekt een getal dat ${q.vraagt} is.`;
        else if (q.vraagt === "meer") zin = `${X} is minder dan het aantal ${naam}. Je zoekt een getal dat meer is.`;
        else zin = `${X} is meer dan het aantal ${naam}. Je zoekt een getal dat minder is.`;
        return [zin, ...tip];
      },
      toonAntwoord: async () => {
        /* Bliepo telt de rest voor, rij voor rij, vanaf waar het samen tellen stopte. */
        const e = einden(q.groep);
        zet(l, { tel: { vak: 0, geteld: begin } });
        for (const eind of e.filter((x) => x > begin)) {
          zet(l, { tel: { vak: 0, geteld: eind } });
          await l.wacht(300);
          zet(l, { tel: { vak: 0, geteld: eind, samen: true } });
          await l.zeg(`${g(eind, q.v.k)}.`);
        }
        zet(l, { tel: { vak: 0, geteld: goed, samen: true } });
        await l.zeg(`Zo veel ${naam} staan er: ${g(goed, q.v.k)}.`, ...(q.vraagt === "evenveel" ? [] : [`${g(antwoord, q.v.k)} is ${q.vraagt} dan ${g(goed, q.v.k)}.`]));
        await l.wacht(300);
      },
      toon: () => {
        nFout = 0;
        toonOpgave(l, st, id, o);
      },
      fout: () => {
        nFout++;
      },
      /* Bliepo zegt "begin bij": de eerste rijen krijgen 1 rondje zolang hij praat (besluit 4). */
      wijs: () => {
        if (nFout === 1) zet(l, { tel: { vak: 0, geteld: begin, samen: true } });
      },
      wijsWeg: () => {
        if (nFout === 1) zet(l, { tel: { vak: 0, geteld: begin, stil: true } });
      },
      vraag: vraagZin(q),
      /* 4 keuzes: 2 × 2, niet 3 en 1 los eronder (herstel 7 november). */
      antwoord: async () => Number(await l.kies(q.keuzes.map(String), { weetniet: false, direct: true, ...(q.keuzes.length === 4 ? { perTwee: true } : {}) })),
      isGoed: (x) => x === antwoord,
      noem: (x) => g(x, q.v.k),
      goed: async () => {
        zet(l, { tel: null });
        await l.zeg(bevestig());
        await l.wacht(400);
      },
      samen: () => telSamen(l, q.v, q.groep, 0),
      tip,
      testAntwoord: antwoord,
    });
  }

  if (q.t === "rij" || q.t === "getallen") {
    const aantallen = q.t === "rij" ? q.kaarten : q.getallen;
    const richting = q.t === "rij" ? "op" : q.richting;
    const goedeRij = volgordeVan(aantallen, richting);
    const test = goedeRij.map((i) => `ding-${i}`);
    toonOpgave(l, st, id, o, test);
    await eersteKeer(l, st, q);
    const k = q.t === "rij" ? q.v.k : "wit";
    const rijTekst = goedeRij.map((i) => g(aantallen[i], k)).join(", ");
    const op = richting === "op";
    const tipRij = [`Zoek eerst het ${op ? "kleinste" : "grootste"} getal van de ${aantallen.length} en zet dat in het eerste vakje.`];
    return squlaVraag<number[]>(l, {
      synthesis: true,
      reactie: (x) => {
        const p = x.findIndex((i, pos) => i !== goedeRij[pos]);
        const omgekeerd = x.every((i, pos) => i === goedeRij[goedeRij.length - 1 - pos]);
        if (omgekeerd) return [`Je legde ${g(aantallen[x[0]], k)} vooraan, dat is het ${op ? "grootste" : "kleinste"} getal.`, ...tipRij];
        if (p === 0) return [`Je legde ${g(aantallen[x[0]], k)} vooraan. Kijk of er nog een ${op ? "kleiner" : "groter"} getal is.`, ...tipRij];
        return [`Tot en met ${g(aantallen[x[p - 1]], k)} ligt het goed.`, `Zoek nu het ${op ? "kleinste" : "grootste"} getal van wat nog over is.`];
      },
      toonAntwoord: async () => {
        /* De kaarten gaan terug naar beneden en komen daarna in de goede volgorde in de vakjes. */
        zet(l, { ronde: ++st.ronde, plekGoed: null, zetOp: null });
        await l.wacht(500);
        zet(l, { zetOp: goedeRij });
        await l.wacht(600);
        if (q.t === "getallen") zet(l, { staven: true });
        await l.zeg(`${rijTekst}.`, richting === "op" ? "Elk getal is groter dan het getal ervoor." : "Elk getal is kleiner dan het getal ervoor.");
        await l.wacht(300);
      },
      toon: () => toonOpgave(l, st, id, o, test),
      vraag: vraagZin(q),
      antwoord: () => zetOpVolgorde(l, st),
      isGoed: (x) => x.every((i, p) => i === goedeRij[p]),
      noem: () => "Deze volgorde",
      goed: async () => {
        zet(l, { goed: { vak: -1, keer: ++st.goed }, plekGoed: null, staven: false, ...(q.t === "rij" ? { bordjes: aantallen } : {}) });
        await l.zeg(bevestig());
        await l.wacht(500);
      },
      fout: (x) => zet(l, { plekGoed: x.map((i, p) => i === goedeRij[p]) }),
      samen: async () => {
        zet(l, { ronde: ++st.ronde, plekGoed: null });
        await l.wacht(300);
        if (q.t === "rij") await kaartenTellen(l, q.v, q.kaarten, false, "Zet de kaart met het kleinste getal eerst.");
        else await stavenLaten(l, q.getallen);
      },
      tip: tipRij,
      testAntwoord: test[0],
    });
  }

  /* Kaarten om op te tikken. */
  const goedIdx = goedeKaart(q);
  const voorbeeld = q.t === "voorbeeld" ? [q.voorbeeld] : [];
  /* De bordjes horen bij de vakken van het vlak: de voorbeeldgroep eerst. */
  const alleAantallen = [...voorbeeld, ...q.kaarten];
  toonOpgave(l, st, id, o);
  await eersteKeer(l, st, q);
  const n = q.kaarten[goedIdx];
  const k = q.v.k;
  const naam = q.v.naam;
  const ander = q.kaarten.filter((_, i) => i !== goedIdx);
  const meeste = q.wat === "meer" ? "meeste" : "minste";
  /** Wat er klopt: wat er op de kaart staat en waarom dat het goede antwoord is. */
  const kern = (): string[] => {
    if (q.t === "voorbeeld") return [`Op deze kaart zijn er ${g(n, k)}, bovenaan ${g(q.voorbeeld, k)}.`, `${g(n, k)} is ${q.wat} dan ${g(q.voorbeeld, k)}.`];
    if (q.t === "twee") return [`Op deze kaart zijn er ${g(n, k)}, op de andere ${g(ander[0], k)}.`, `${g(n, k)} is ${q.wat} dan ${g(ander[0], k)}.`];
    if (q.t === "drie") return [`Op deze kaart liggen er ${g(n, k)}.`, `Op de andere kaarten liggen er ${g(ander[0], k)} en ${g(ander[1], k)}, dus dit zijn de ${meeste}.`];
    if (q.wat === "evenveel") return [`Op deze kaart zijn er ${g(n, k)}.`, `${g(n, k)} is evenveel als ${w(q.getal)}.`];
    return [`Op deze kaart zijn er ${g(n, k)}.`, `${g(n, k)} is ${q.wat} dan ${w(q.getal)}.`];
  };
  const tipKaart =
    q.t === "voorbeeld"
      ? [`Bovenaan zijn het er ${g(q.voorbeeld, k)}.`, `Welk getal zeg je ${q.wat === "meer" ? "later" : "eerder"} dan ${g(q.voorbeeld, k)} als je telt? Dat is ${q.wat}.`]
      : q.t === "getal"
        ? [`Kijk naar de getallen op de kaarten.`, q.wat === "evenveel" ? `Zoek de kaart met het getal ${w(q.getal)}.` : `Welk getal zeg je ${q.wat === "meer" ? "later" : "eerder"} dan ${w(q.getal)} als je telt? Dat is ${q.wat}.`]
        : q.t === "twee"
          ? [`Kijk bij elke kaart naar het getal.`, `Het getal dat je ${q.wat === "meer" ? "later" : "eerder"} zegt als je telt, is ${q.wat}.`]
          : [`Kijk naar het getal op alle 3 de kaarten.`, `Het getal dat je ${q.wat === "meer" ? "het laatst" : "het eerst"} zegt als je telt, is ${q.wat === "meer" ? "het grootst" : "het kleinst"}.`];
  return squlaVraag<number>(l, {
    synthesis: true,
    reactie: (x) => {
      const gekozen = q.kaarten[x];
      let zin: string;
      if (q.t === "voorbeeld") zin = gekozen === q.voorbeeld ? `Je tikte op ${g(gekozen, k)}. Dat is evenveel als bovenaan.` : `Je tikte op ${g(gekozen, k)}. Dat is ${gekozen > q.voorbeeld ? "meer" : "minder"} dan de ${g(q.voorbeeld, k)} bovenaan.`;
      else if (q.t === "twee") zin = gekozen === n ? `Je tikte op ${g(gekozen, k)}. De andere kaart heeft hetzelfde.` : `Je tikte op de kaart met ${g(gekozen, k)} ${naam}. Daar zijn er ${q.wat === "meer" ? "minder" : "meer"} dan op de andere kaart.`;
      else if (q.t === "drie") zin = `Je tikte op de kaart met ${g(gekozen, k)} ${naam}. Kijk of een andere kaart ${q.wat === "meer" ? "meer" : "minder"} heeft.`;
      else if (q.wat === "evenveel") zin = `Je tikte op ${g(gekozen, k)}. Dat is ${gekozen > q.getal ? "meer" : "minder"} dan ${w(q.getal)}, en jij zoekt evenveel.`;
      else zin = gekozen === q.getal ? `Je tikte op ${g(gekozen, k)}. Dat is precies evenveel als ${w(q.getal)}, maar jij zoekt ${q.wat}.` : `Je tikte op ${g(gekozen, k)}. Dat is ${gekozen > q.getal ? "meer" : "minder"} dan ${w(q.getal)}.`;
      return [zin, ...tipKaart];
    },
    toonAntwoord: async () => {
      zet(l, { goed: { vak: goedIdx, keer: ++st.goed }, bordjes: alleAantallen, tel: null, fout: null });
      await l.zeg(...kern());
      await l.wacht(400);
    },
    toon: () => toonOpgave(l, st, id, o),
    vraag: vraagZin(q),
    antwoord: () => tikKaart(l, st),
    isGoed: (x) => x === goedIdx,
    noem: () => "Deze kaart",
    goed: async () => {
      zet(l, { goed: { vak: goedIdx, keer: ++st.goed }, bordjes: alleAantallen, tel: null });
      await l.zeg(bevestig());
      await l.wacht(500);
    },
    fout: (x) => zet(l, { fout: { vak: x, keer: ++st.fout } }),
    samen: async () => {
      zet(l, { ronde: ++st.ronde });
      await kaartenTellen(
        l,
        q.v,
        alleAantallen,
        q.t === "voorbeeld",
        q.t === "voorbeeld" ? `Bovenaan zijn het er ${g(q.voorbeeld, k)}. Zoek de kaart waar het er ${q.wat} zijn.` : q.t === "twee" ? "Vergelijk de 2 getallen met elkaar." : q.t === "drie" ? `Zoek het ${q.wat === "meer" ? "grootste" : "kleinste"} van de 3 getallen.` : `Vergelijk elk getal met ${w(q.getal)}.`,
      );
    },
    tip: tipKaart,
    testAntwoord: `kaart-${goedIdx}`,
  });
}

/* ---------- de plek van het goede antwoord (herstel 7 november, BOUWREGELS 1.23) ---------- */

/** Een willekeurige volgorde (Fisher-Yates). */
function meng<T>(lijst: T[]): T[] {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Willekeurig, maar nooit al in de gevraagde volgorde (dan verklapt het beeld het antwoord), en bij 3 of meer ook nooit precies
 * omgekeerd (dan hoeft het kind alleen om te draaien; herstel ronde 2, 7 november).
 */
function mengNietOpVolgorde(lijst: number[], richting: "op" | "af"): number[] {
  const opVolgorde = (a: number[], r: "op" | "af") => a.every((n, i) => i === 0 || (r === "op" ? a[i - 1] <= n : a[i - 1] >= n));
  const tegen = richting === "op" ? "af" : "op";
  for (let i = 0; i < 40; i++) {
    const a = meng(lijst);
    if (!opVolgorde(a, richting) && (a.length < 3 || !opVolgorde(a, tegen))) return a;
  }
  const g = [...lijst].sort((x, y) => (richting === "op" ? x - y : y - x));
  if (g.length < 3) return g.reverse();
  /* Vangnet: middelste naar voren, bv. 2 1 3 4 (niet goed en niet omgekeerd). */
  return [g[1], g[0], ...g.slice(2)];
}

/**
 * Elke les-start een nieuwe volgorde van de kaarten en keuzes, zodat het goede antwoord niet steeds op dezelfde plek staat.
 * Alleen de plek wisselt: de aantallen, het goede antwoord en de beoordeling blijven hetzelfde.
 */
function mengVraag(q: Vraag): Vraag {
  switch (q.t) {
    case "tel":
      return { ...q, keuzes: meng(q.keuzes) };
    case "voorbeeld":
    case "twee":
    case "drie":
    case "getal":
      return { ...q, kaarten: meng(q.kaarten) };
    case "rij":
      return { ...q, kaarten: mengNietOpVolgorde(q.kaarten, "op") };
    case "getallen":
      return { ...q, getallen: mengNietOpVolgorde(q.getallen, q.richting) };
  }
}

/* =====================================================================
   De korte uitleg (bij "Kun je dit al?" → Nee)
   ===================================================================== */

/** Eén groep samen tellen, helemaal tot het eind, en het getal kiezen. */
async function uitlegTel(l: Lesgids, st: Stand, v: Vw, groep: MMGroep, extra?: Wat) {
  const n = aantalIn(groep);
  toonOpgave(l, st, `uitleg-tel-${v.soort}-${n}`, { id: `uitleg-tel-${v.soort}-${n}`, soort: "tel", groep });
  await l.wacht(700);
  const e = einden(groep);
  const per = groep.blokken.flatMap((b) => b.rijen)[0];
  await l.zeg(`Ze staan in rijen van ${g(per, v.k)}.`);
  let geteld = 0;
  for (let r = 0; r < e.length; r++) {
    const laatste = r === e.length - 1 && e[r] - (r ? e[r - 1] : 0) < per;
    if (laatste) {
      await l.zeg("Dan tel ik verder.");
      const reeks: string[] = [];
      for (; geteld < e[r]; geteld++) {
        zet(l, { tel: { vak: 0, geteld: geteld + 1 } });
        reeks.push(g(geteld + 1, v.k));
        await l.wacht(260);
      }
      await l.zeg(`${reeks.join(", ")}.`);
      break;
    }
    for (; geteld < e[r]; geteld++) {
      zet(l, { tel: { vak: 0, geteld: geteld + 1 } });
      await l.wacht(per > 6 ? 55 : 110);
    }
    zet(l, { tel: { vak: 0, geteld, samen: true } });
    await l.zeg(`${g(e[r], v.k)}.`);
  }
  zet(l, { tel: { vak: 0, geteld: n, samen: true } });
  await l.zeg(`Samen zijn het ${g(n, v.k)} ${v.naam}.`);
  if (extra === "meer") await l.zeg(`${g(n + 1, v.k)} is meer dan ${g(n, v.k)}.`, `${g(n - 1, v.k)} is minder.`);
  else await l.zeg(`Dus ${g(n, v.k)} is evenveel.`);
  zet(l, { tel: null });
  await l.wacht(400);
}

/** Eierdoosjes samen tellen (het voorbeeld van Meer dan, minder dan 2): in elk doosje zitten er 6. */
async function uitlegDozen(l: Lesgids, st: Stand) {
  const groep = dozen(3);
  toonOpgave(l, st, "uitleg-tel-dozen-18", { id: "uitleg-tel-dozen-18", soort: "tel", groep });
  await l.wacht(700);
  await l.zeg("Eieren liggen in doosjes.", `In een vol doosje zitten er ${g(6, EIEREN.k)}.`);
  for (let r = 1; r <= 3; r++) {
    for (let k = (r - 1) * 6; k < r * 6; k++) {
      zet(l, { tel: { vak: 0, geteld: k + 1 } });
      await l.wacht(110);
    }
    zet(l, { tel: { vak: 0, geteld: r * 6, samen: true } });
    await l.zeg(`${g(r * 6, EIEREN.k)}.`);
  }
  await l.zeg(`Het zijn er ${g(18, EIEREN.k)}.`, `Dus ${g(18, EIEREN.k)} is evenveel.`);
  zet(l, { tel: null });
  await l.wacht(400);
}

/** Groepjes naast elkaar: elke kaart tellen, dan zeggen wat meer en wat minder is. */
async function uitlegKaarten(l: Lesgids, st: Stand, v: Vw, aantallen: number[], o: { voorbeeld?: number; getal?: number; slot?: string[] }) {
  const id = `uitleg-kaarten-${v.soort}-${aantallen.join("-")}-${o.voorbeeld ?? ""}-${o.getal ?? ""}`;
  const opgave: MMOpgave =
    o.voorbeeld !== undefined
      ? { id, soort: "kaarten", voorbeeld: kaartGroep(v, o.voorbeeld), kaarten: aantallen.map((n) => kaartGroep(v, n)) }
      : { id, soort: "kaarten", getal: o.getal, kaarten: aantallen.map((n) => kaartGroep(v, n)) };
  toonOpgave(l, st, id, opgave);
  await l.wacht(700);
  const alle = o.voorbeeld !== undefined ? [o.voorbeeld, ...aantallen] : aantallen;
  await kaartenTellen(l, v, alle, o.voorbeeld !== undefined);
  if (o.slot) await l.zeg(...o.slot);
  await l.wacht(400);
}

/** Getallen op volgorde: de tientallen als staven. */
async function uitlegGetallen(l: Lesgids, st: Stand, ding: MMDing, getallen: number[], slot: string[]) {
  const id = `uitleg-getallen-${getallen.join("-")}`;
  toonOpgave(l, st, id, { id, soort: "getallen", ding, getallen });
  await l.wacht(700);
  await stavenLaten(l, getallen);
  await l.zeg(...slot);
  await l.wacht(400);
}

/* =====================================================================
   Een hele les
   ===================================================================== */

type Lesdef = {
  id: string;
  titel: string;
  oefening: string;
  level: number;
  welkom: string[];
  /** Wat er in beeld staat bij het welkom. */
  start: MMOpgave;
  uitleg: (l: Lesgids, st: Stand) => Promise<void>;
  vragen: Vraag[];
  eind: string;
};

function les(d: Lesdef): Lesdraaiboek {
  return {
    id: d.id,
    titel: d.titel,
    synthesis: `Squla groep 3 · Meer, minder, evenveel · ${d.oefening} · level ${d.level} (alleen leerdoel)`,
    indeling: "synthesis",
    browserstem: true,
    nacht: true,
    voorwerpen: MM_VOORWERPEN,
    kaarttekening: KaartMeerMinder,
    async speel(l) {
      zetSynthesisHulp(l);
      /* Elke keer een nieuwe plek voor het goede antwoord (herstel 7 november). */
      const vragen = d.vragen.map(mengVraag);
      const st: Stand = { huidig: "", goed: 0, fout: 0, ronde: 0, handGezien: false, gezien: new Set() };
      st.huidig = d.start.id;
      l.vlak<MMProps>(SqulaMeerMinder, { opgave: d.start, vooraf: vragen.map((q, i) => opgaveVan(`${d.id}-${i + 1}`, q)) });
      const voorbeeldAfgerond = await squlaBegin(l, {
        welkom: d.welkom,
        voordoen: true,
        samen: () => speelVraag(l, `${d.id}-uitleg`, vragen[0], st),
        uitleg: async () => {
          /* De uitleg zet zijn eigen beeld neer: de eerste vraag moet daarna zijn beeld weer opnieuw tekenen. */
          st.huidig = "";
          await d.uitleg(l, st);
        },
        /* Het beginscherm laat de eerste vraag van de les zien (BOUWREGELS 4.1). */
        voorbeeld: () => {
          st.huidig = "";
          const id = `${d.id}-1`;
          toonOpgave(l, st, id, opgaveVan(id, vragen[0]));
        },
      });
      let fouten = 0;
      /* Na het voorbeeld tekent de eerste vraag zijn beeld zelf weer opnieuw. */
      st.huidig = "";
      for (const [i, q] of vragen.entries()) if (!(voorbeeldAfgerond && i === 0) && !(await speelVraag(l, `${d.id}-${i + 1}`, q, st))) fouten++;
      zet(l, { opgave: null });
      await squlaEind(l, fouten, d.eind);
    },
  };
}

/* =====================================================================
   Meer, minder, evenveel 1 (10971)
   ===================================================================== */

/*
  Level 1: tel de groep en kies het getal dat evenveel is, uit 3 getallen.
  Getallen 10 t/m 19 (keuzes tot 20). Meestal in rijen van 5 met een restje,
  soms met een los groepje rechts, soms 10 in de ene kleur en de rest in een
  andere, soms rijen die niet per 5 gaan. Afleiders: soms buren, soms verder weg.
*/
const evenveel1_1 = les({
  id: "squla-meer-minder-evenveel1-1",
  titel: "Meer, minder, evenveel",
  oefening: "Meer, minder, evenveel 1",
  level: 1,
  welkom: ["De appels liggen in rijtjes van {5:rood}.", "Tel de appels. Hoeveel appels zijn het?"],
  start: { id: "start-evenveel1-1", soort: "tel", groep: r5(APPELS, 12) },
  uitleg: (l, st) => uitlegTel(l, st, APPELS, r5(APPELS, 12)),
  vragen: [
    { t: "tel", v: APPELS, groep: r5(APPELS, 16), keuzes: [15, 16, 17], vraagt: "evenveel" },
    { t: "tel", v: STERREN, groep: r5(STERREN, 10), keuzes: [11, 10, 13], vraagt: "evenveel" },
    { t: "tel", v: BLOEMEN, groep: r5(BLOEMEN, 13), keuzes: [14, 12, 13], vraagt: "evenveel" },
    { t: "tel", v: BALLEN, groep: vrij(BALLEN, [6, 5]), keuzes: [15, 10, 11], vraagt: "evenveel" },
    { t: "tel", v: BALLONNEN, groep: losRechts(BALLONNEN, 15, 4), keuzes: [17, 18, 19], vraagt: "evenveel" },
    { t: "tel", v: APPELS_RG, groep: tweeKleur(APPELS_RG, "groen", "rood", 8), keuzes: [12, 18, 14], vraagt: "evenveel" },
    { t: "tel", v: STERREN, groep: vrij(STERREN, [8, 4]), keuzes: [12, 13, 17], vraagt: "evenveel" },
    { t: "tel", v: BALLONNEN_2, groep: tweeKleur(BALLONNEN_2, "blauw", "oranje", 4), keuzes: [16, 19, 14], vraagt: "evenveel" },
    { t: "tel", v: BALLEN, groep: r5(BALLEN, 17), keuzes: [17, 16, 19], vraagt: "evenveel" },
    { t: "tel", v: APPELS, groep: r5(APPELS, 15), keuzes: [13, 20, 15], vraagt: "evenveel" },
    { t: "tel", v: BLOEMEN_2, groep: tweeKleur(BLOEMEN_2, "roze", "paars", 3), keuzes: [16, 13, 10], vraagt: "evenveel" },
    { t: "tel", v: STERREN, groep: losRechts(STERREN, 15, 3), keuzes: [16, 19, 18], vraagt: "evenveel" },
    { t: "tel", v: BLOEMEN, groep: losRechts(BLOEMEN, 10, 1), keuzes: [11, 13, 18], vraagt: "evenveel" },
    { t: "tel", v: BALLEN, groep: vrij(BALLEN, [9, 7]), keuzes: [17, 14, 16], vraagt: "evenveel" },
    { t: "tel", v: BALLONNEN, groep: r5(BALLONNEN, 14), keuzes: [13, 19, 14], vraagt: "evenveel" },
  ],
  eind: "Je weet welk getal evenveel is.",
});

/*
  Level 2: bovenaan een voorbeeldgroep, daaronder twee kaarten (één met meer,
  één met minder): waar zie je meer (minder) dan bovenaan? En kaarten op
  volgorde zetten, van minder naar meer. Getallen 5 t/m 20, verschil 1 tot 4.
  Zelfde opbouw als Squla: eerst vergelijken, dan op volgorde, dan weer vergelijken.
*/
const evenveel1_2 = les({
  id: "squla-meer-minder-evenveel1-2",
  titel: "Meer, minder, evenveel (moeilijker)",
  oefening: "Meer, minder, evenveel 1",
  level: 2,
  welkom: ["Bovenaan staat een groep sterren.", "Waar zie je meer sterren dan bovenaan?"],
  start: { id: "start-evenveel1-2", soort: "kaarten", voorbeeld: r5(STERREN, 8), kaarten: [r5(STERREN, 6), r5(STERREN, 10)] },
  uitleg: async (l, st) => {
    st.huidig = "";
    await uitlegKaarten(l, st, STERREN, [6, 10], {
      voorbeeld: 8,
      slot: [`${g(10, "geel")} is meer dan ${g(8, "geel")}.`, `${g(6, "geel")} is minder dan ${g(8, "geel")}.`, "Op volgorde van minder naar meer:", `${g(6, "geel")}, ${g(8, "geel")}, ${g(10, "geel")}.`],
    });
  },
  vragen: [
    { t: "voorbeeld", v: STERREN_2, voorbeeld: 14, kaarten: [12, 17], wat: "meer" },
    { t: "voorbeeld", v: BALLONNEN, voorbeeld: 18, kaarten: [20, 16], wat: "meer" },
    { t: "voorbeeld", v: APPELS_RG, voorbeeld: 11, kaarten: [13, 9], wat: "minder" },
    { t: "voorbeeld", v: BLOEMEN, voorbeeld: 9, kaarten: [7, 11], wat: "minder" },
    { t: "voorbeeld", v: BALLEN_2, voorbeeld: 16, kaarten: [15, 19], wat: "meer" },
    { t: "rij", v: BLOEMEN, kaarten: [14, 7, 18, 10] },
    { t: "rij", v: BALLONNEN_2, kaarten: [6, 15, 12, 20] },
    { t: "rij", v: STERREN, kaarten: [13, 9, 17, 8] },
    { t: "rij", v: APPELS, kaarten: [19, 11, 16, 13] },
    { t: "rij", v: BALLEN_2, kaarten: [5, 14, 10, 12] },
    { t: "voorbeeld", v: BALLONNEN_2, voorbeeld: 13, kaarten: [14, 10], wat: "minder" },
    { t: "voorbeeld", v: STERREN, voorbeeld: 17, kaarten: [15, 18], wat: "meer" },
    { t: "voorbeeld", v: APPELS, voorbeeld: 10, kaarten: [12, 8], wat: "minder" },
    { t: "voorbeeld", v: BLOEMEN_2, voorbeeld: 19, kaarten: [20, 17], wat: "meer" },
    { t: "voorbeeld", v: BALLEN, voorbeeld: 12, kaarten: [11, 15], wat: "minder" },
  ],
  eind: "Je ziet waar meer is en waar minder.",
});

/*
  Level 3: om en om twee kaarten naast elkaar (op welke kaart zijn er meer /
  minder?) en kralen in allemaal verschillende kleuren tellen en het getal
  kiezen dat evenveel is (buren). Getallen 5 t/m 20.
*/
const evenveel1_3 = les({
  id: "squla-meer-minder-evenveel1-3",
  titel: "Meer, minder, evenveel (nog moeilijker)",
  oefening: "Meer, minder, evenveel 1",
  level: 3,
  welkom: ["Hier staan 2 kaarten met bloemen.", "Op welke kaart zijn er meer bloemen?"],
  start: { id: "start-evenveel1-3", soort: "kaarten", kaarten: [r5(BLOEMEN, 7), r5(BLOEMEN, 9)] },
  uitleg: async (l, st) => {
    st.huidig = "";
    await uitlegKaarten(l, st, BLOEMEN, [7, 9], { slot: [`${g(9, "rood")} is meer dan ${g(7, "rood")}.`, `${g(7, "rood")} is minder dan ${g(9, "rood")}.`] });
    await uitlegTel(l, st, KRALEN, r5(KRALEN, 7));
  },
  vragen: [
    { t: "twee", v: BLOEMEN_2, kaarten: [13, 15], wat: "meer" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 6), keuzes: [5, 6, 7], vraagt: "evenveel" },
    { t: "twee", v: STERREN, kaarten: [18, 10], wat: "meer" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 17), keuzes: [15, 16, 17], vraagt: "evenveel" },
    { t: "twee", v: APPELS_RG, kaarten: [16, 13], wat: "minder" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 18), keuzes: [17, 18, 19], vraagt: "evenveel" },
    { t: "twee", v: BLOEMEN, kaarten: [12, 17], wat: "minder" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 8), keuzes: [7, 8, 10], vraagt: "evenveel" },
    { t: "twee", v: STERREN_2, kaarten: [7, 17], wat: "meer" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 14), keuzes: [12, 13, 14], vraagt: "evenveel" },
    { t: "twee", v: APPELS, kaarten: [11, 14], wat: "meer" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 11), keuzes: [10, 11, 12], vraagt: "evenveel" },
    { t: "twee", v: STERREN, kaarten: [20, 16], wat: "minder" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 16), keuzes: [14, 16, 17], vraagt: "evenveel" },
    { t: "twee", v: BLOEMEN_2, kaarten: [9, 12], wat: "meer" },
  ],
  eind: "Je weet wat meer, minder en evenveel is.",
});

/* =====================================================================
   Meer, minder, evenveel 2 (10972)
   ===================================================================== */

/*
  Level 1: eerst kralen tellen en het getal kiezen dat evenveel is (drie
  buren), dan drie kaarten: waar liggen de meeste? Getallen 8 t/m 17; de drie
  kaarten schelen meestal 1 of 2.
*/
const evenveel2_1 = les({
  id: "squla-meer-minder-evenveel2-1",
  titel: "De meeste",
  oefening: "Meer, minder, evenveel 2",
  level: 1,
  welkom: ["We tellen eerst kralen.", "Tel de kralen. Hoeveel kralen zijn het?"],
  start: { id: "start-evenveel2-1", soort: "tel", groep: r5(KRALEN, 9) },
  uitleg: async (l, st) => {
    await uitlegTel(l, st, KRALEN, r5(KRALEN, 9));
    await uitlegKaarten(l, st, KOEKJES, [9, 11, 10], { slot: [`${g(11, "bruin")} is de meeste.`] });
  },
  vragen: [
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 9), keuzes: [9, 10, 11], vraagt: "evenveel" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 12), keuzes: [11, 12, 13], vraagt: "evenveel" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 16), keuzes: [15, 16, 17], vraagt: "evenveel" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 13), keuzes: [13, 14, 15], vraagt: "evenveel" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 10), keuzes: [8, 9, 10], vraagt: "evenveel" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 17), keuzes: [15, 16, 17], vraagt: "evenveel" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 11), keuzes: [10, 11, 12], vraagt: "evenveel" },
    { t: "tel", v: KRALEN, groep: r5(KRALEN, 14), keuzes: [12, 13, 14], vraagt: "evenveel" },
    { t: "drie", v: KOEKJES, kaarten: [11, 13, 12], wat: "meer" },
    { t: "drie", v: KOEKJES, kaarten: [14, 16, 15], wat: "meer" },
    { t: "drie", v: KOEKJES, kaarten: [12, 10, 11], wat: "meer" },
    { t: "drie", v: KOEKJES, kaarten: [13, 17, 14], wat: "meer" },
    { t: "drie", v: KOEKJES, kaarten: [15, 14, 13], wat: "meer" },
    { t: "drie", v: KOEKJES, kaarten: [16, 15, 17], wat: "meer" },
    { t: "drie", v: KOEKJES, kaarten: [12, 14, 13], wat: "meer" },
  ],
  eind: "Je vindt waar de meeste zijn.",
});

/*
  Level 2: alleen drie kaarten, de vraag wisselt tussen "minste" (vaker) en
  "meeste". Eerst appels, dan peren (tot 31 oktober 2026 groene appels). Getallen 10 t/m 20; de kaarten
  schelen meestal 1 of 2, een enkele keer meer.
*/
const evenveel2_2 = les({
  id: "squla-meer-minder-evenveel2-2",
  titel: "De meeste (moeilijker)",
  oefening: "Meer, minder, evenveel 2",
  level: 2,
  welkom: ["3 kaarten met appels.", "Waar liggen de minste appels?"],
  start: { id: "start-evenveel2-2", soort: "kaarten", kaarten: [r5(APPELS, 12), r5(APPELS, 10), r5(APPELS, 11)] },
  uitleg: async (l, st) => {
    st.huidig = "";
    await uitlegKaarten(l, st, APPELS, [12, 10, 11], { slot: [`${g(10, "rood")} is de minste.`, `${g(12, "rood")} is de meeste.`] });
  },
  vragen: [
    { t: "drie", v: APPELS, kaarten: [17, 15, 14], wat: "minder" },
    { t: "drie", v: APPELS, kaarten: [20, 18, 19], wat: "minder" },
    { t: "drie", v: APPELS, kaarten: [13, 16, 15], wat: "minder" },
    { t: "drie", v: APPELS, kaarten: [12, 14, 16], wat: "minder" },
    { t: "drie", v: APPELS, kaarten: [11, 10, 12], wat: "minder" },
    { t: "drie", v: APPELS, kaarten: [13, 15, 11], wat: "meer" },
    { t: "drie", v: APPELS, kaarten: [15, 13, 18], wat: "minder" },
    { t: "drie", v: PEREN, kaarten: [17, 19, 20], wat: "meer" },
    { t: "drie", v: PEREN, kaarten: [19, 18, 17], wat: "minder" },
    { t: "drie", v: PEREN, kaarten: [16, 18, 17], wat: "meer" },
    { t: "drie", v: PEREN, kaarten: [14, 12, 13], wat: "minder" },
    { t: "drie", v: PEREN, kaarten: [11, 14, 12], wat: "meer" },
    { t: "drie", v: PEREN, kaarten: [16, 18, 17], wat: "minder" },
    { t: "drie", v: PEREN, kaarten: [19, 17, 18], wat: "meer" },
    { t: "drie", v: PEREN, kaarten: [20, 16, 18], wat: "minder" },
  ],
  eind: "Je vindt de meeste en de minste.",
});

/* =====================================================================
   Meer, minder, evenveel 3 (10973)
   ===================================================================== */

/*
  Level 1: om en om getallen op volgorde zetten (drie potjes, van meer naar
  minder; getallen 7 t/m 49) en een getalvraag: een getal met twee kaarten
  met beestjes (tot 25): welke kaart heeft meer dan, minder dan, of evenveel
  als het getal? Bij "evenveel" heeft de andere kaart er 5 meer.
*/
const evenveel3_1 = les({
  id: "squla-meer-minder-evenveel3-1",
  titel: "Meer dan, minder dan",
  oefening: "Meer, minder, evenveel 3",
  level: 1,
  welkom: ["3 potjes met een getal.", "Zet de potjes op volgorde, van meer naar minder."],
  start: { id: "start-evenveel3-1", soort: "getallen", ding: "potje", getallen: [32, 18] },
  uitleg: async (l, st) => {
    st.huidig = "";
    await uitlegGetallen(l, st, "potje", [32, 18], [`Dus ${w(32)} is meer dan ${w(18)}.`]);
    await uitlegKaarten(l, st, AARDBEIEN, [8, 12], { getal: 10, slot: [`${g(12, "rood")} is meer dan ${w(10)}.`, `${g(8, "rood")} is minder dan ${w(10)}.`] });
  },
  vragen: [
    { t: "getallen", ding: "potje", getallen: [26, 8, 24], richting: "af" },
    { t: "getal", v: AARDBEIEN, getal: 15, kaarten: [14, 18], wat: "meer" },
    { t: "getallen", ding: "potje", getallen: [18, 48, 38], richting: "af" },
    { t: "getal", v: KNIKKERS, getal: 22, kaarten: [24, 20], wat: "meer" },
    { t: "getallen", ding: "potje", getallen: [31, 22, 42], richting: "af" },
    { t: "getal", v: AARDBEIEN, getal: 19, kaarten: [17, 23], wat: "minder" },
    { t: "getallen", ding: "potje", getallen: [45, 15, 9], richting: "af" },
    { t: "getal", v: KNIKKERS, getal: 24, kaarten: [24, 19], wat: "minder" },
    { t: "getallen", ding: "potje", getallen: [36, 15, 47], richting: "af" },
    { t: "getal", v: AARDBEIEN, getal: 14, kaarten: [19, 14], wat: "evenveel" },
    { t: "getallen", ding: "potje", getallen: [29, 9, 19], richting: "af" },
    { t: "getal", v: KNIKKERS, getal: 17, kaarten: [16, 21], wat: "meer" },
    { t: "getallen", ding: "potje", getallen: [44, 27, 33], richting: "af" },
    { t: "getal", v: AARDBEIEN, getal: 18, kaarten: [18, 23], wat: "evenveel" },
    { t: "getallen", ding: "potje", getallen: [12, 41, 25], richting: "af" },
  ],
  eind: "Je weet wat meer dan en minder dan is.",
});

/*
  Level 2: grote groepen tellen (rijen van 10, om en om van kleur, of eieren
  in doosjes van 6) en een getal kiezen uit 3 of 4: evenveel, of een getal dat
  meer of minder is (het aantal zelf staat er dan ook tussen). Tussendoor
  vliegers met een getal op volgorde, van minder naar meer. Getallen 10 t/m 49.
  Zelfde volgorde van soorten vragen als Squla.
*/
const evenveel3_2 = les({
  id: "squla-meer-minder-evenveel3-2",
  titel: "Meer dan, minder dan (moeilijker)",
  oefening: "Meer, minder, evenveel 3",
  level: 2,
  welkom: ["Eieren liggen in doosjes van {6:wit}.", "Tel de eieren. Hoeveel eieren zijn het?"],
  start: { id: "start-evenveel3-2", soort: "tel", groep: dozen(4) },
  uitleg: async (l, st) => {
    st.huidig = "";
    await uitlegDozen(l, st);
    await uitlegGetallen(l, st, "vlieger", [27, 41], [`Dus ${w(27)} is minder dan ${w(41)}.`]);
  },
  vragen: [
    { t: "tel", v: EIEREN, groep: dozen(4), keuzes: [24, 26, 18], vraagt: "evenveel" },
    { t: "getallen", ding: "vlieger", getallen: [16, 36, 26], richting: "op" },
    { t: "tel", v: KOEKJES_2, groep: r10(KOEKJES_2, 27), keuzes: [16, 26, 37, 27], vraagt: "evenveel" },
    { t: "tel", v: EIEREN, groep: dozen(5), keuzes: [25, 30, 36], vraagt: "evenveel" },
    { t: "getallen", ding: "vlieger", getallen: [44, 23, 29], richting: "op" },
    { t: "tel", v: EIEREN_2, groep: r10(EIEREN_2, 43), keuzes: [43, 44, 33], vraagt: "evenveel" },
    { t: "getallen", ding: "vlieger", getallen: [26, 34, 31], richting: "op" },
    { t: "tel", v: BLOEMEN_2, groep: r10(BLOEMEN_2, 32), keuzes: [32, 23, 42], vraagt: "evenveel" },
    { t: "tel", v: BALLONNEN_2, groep: r10(BALLONNEN_2, 37), keuzes: [38, 37, 36, 27], vraagt: "meer" },
    { t: "getallen", ding: "vlieger", getallen: [40, 14, 22], richting: "op" },
    { t: "tel", v: STERREN_2, groep: r10(STERREN_2, 28), keuzes: [18, 38, 28], vraagt: "evenveel" },
    { t: "getallen", ding: "vlieger", getallen: [15, 11, 13], richting: "op" },
    { t: "tel", v: BALLEN_2, groep: r10(BALLEN_2, 44), keuzes: [43, 44, 49, 45], vraagt: "minder" },
    { t: "tel", v: APPELS_RG, groep: r10(APPELS_RG, 26), keuzes: [27, 26, 36, 25], vraagt: "minder" },
    { t: "tel", v: KNIKKERS_2, groep: r10(KNIKKERS_2, 19), keuzes: [19, 29, 21, 30], vraagt: "evenveel" },
  ],
  eind: "Je telt grote groepen en weet wat meer en minder is.",
});

export const LESSEN_SQULA_MEER_MINDER: Lesdraaiboek[] = [evenveel1_1, evenveel1_2, evenveel1_3, evenveel2_1, evenveel2_2, evenveel3_1, evenveel3_2];
