/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Rekenmix (squla-rekenmix-mix1-1-gouden, 11 november 2026), op één plek, met
 * de FOUTTABEL. De les zelf (squla-rekenmix-gouden.tsx) bevat geen eigen zinnen.
 *
 * Rekenmix (BOUWREGELS 15.25): "elke vraag volgt de gouden les van zijn eigen onderwerp". Alle 15 vragen van
 * Rekenmix 1 level 1 (squla-rekenmix-mix1-1) zijn telvragen; ze volgen dus de GOUDEN LES TELLEN
 * (squla-tellen-fruit-1-gouden, draaiboek Tellen / Color Count). Daarom:
 *   - de rijtjes (lof, momenten, naam, goed na een fout, einde, onduidelijk, overgang) komen uit
 *     squla-klok-gouden-zinnen.ts, via squla-tellen-gouden-zinnen.ts (zelfde als de gouden les Tellen);
 *   - de zinnen van het telverloop (vraag, samen natellen, samen tellen, vangnet, "Je koos weer …") en de reactie met
 *     het aantal (TELREACTIE) zijn die van de gouden les Tellen zelf (squla-tellen-gouden-zinnen.ts), niet gekopieerd;
 *   - EIGEN voor deze les: de beginzin, de slotzin en de fouttabel. De fouttabel volgt dezelfde logica als Tellen
 *     (gekozen getal + richting, of geen richting als die maar 1 keuze overlaat; 2e fout = uitleg + samen tellen), maar
 *     de hints zijn aangepast aan wat het kind hier ziet: de dingen liggen soms door elkaar, soms in rijen en soms
 *     2 aan 2 onder elkaar ("rij voor rij" en "linksboven" kloppen alleen bij rijen). En een paar zinnen zijn anders
 *     geschreven zodat er in 1 reactie geen woord of getal 2 keer staat (LESRECEPT, geleerd bij Rekentaal).
 *   - De inhoud (15 vragen, dingen, aantallen, 3 keuzes per vraag, volgorde) is die van squla-rekenmix-mix1-1
 *     (BOUWREGELS 15.22). De plek van de dingen is opnieuw berekend (zelfde soort: door elkaar, rijen, paren).
 *
 * Leesbare versie: FOUTTABEL-squla-rekenmix-mix1-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-rekenmix-gouden.ts`). {7:rood} = een getal in de kleur van het ding.
 */

import { TELREACTIE as TELREACTIE_TELLEN, ZIN as ZIN_TELLEN, type Fruit } from "./squla-tellen-gouden-zinnen";
import type { Rijtje } from "./squla-klok-gouden-zinnen";
import { deeltStuk } from "./nooit-dubbel";

export {
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  metNaam,
  type Rijtje,
} from "./squla-klok-gouden-zinnen";
export { AANMOEDIG_TIKKEN, TELREACTIE_JA, TELREACTIE_ROBOT, RICHTINGWOORDEN } from "./squla-tellen-gouden-zinnen";

/* ---------- de dingen (zelfde dingen en getalkleur als squla-rekenmix-mix1-1) ---------- */

/**
 * Een ding om te tellen. Zelfde velden als het fruit van de gouden les Tellen (een, naam = meervoud, kleur), zodat de
 * zinnen van Tellen er precies zo mee werken. `beeld` = het vaste plaatje (public/voorwerpen). De kleur is de kleur
 * van het getal in de zin en in beeld (BOUWREGELS 2.1, 2.2): de kleur van het ding zelf.
 */
/* `elk`: "elke bal", maar "elk potlood" (het-woord). */
export type Ding = { beeld: string; een: string; naam: string; kleur: "rood" | "groen" | "blauw" | "geel"; elk: "elke" | "elk" };
const ding = (beeld: string, een: string, naam: string, kleur: Ding["kleur"], elk: Ding["elk"] = "elke"): Ding => ({ beeld, een, naam, kleur, elk });
export const APPEL = ding("appel", "appel", "appels", "rood");
/* In de Rekenmix-lessen is "bal" het plaatje "speelbal" (de strandbal; squla-rekenmix-tekenen.ts beeldNaam). */
export const BAL = ding("speelbal", "bal", "ballen", "rood");
export const POTLOOD = ding("potlood", "potlood", "potloden", "groen", "elk");
export const AUTO = ding("speelgoedauto", "auto", "auto's", "rood");
export const BLOEM = ding("bloem", "bloem", "bloemen", "rood");
export const KNIKKER = ding("knikker", "knikker", "knikkers", "blauw");
export const STER = ding("ster", "ster", "sterren", "geel");

/** De zinnen van Tellen verwachten een stuk fruit; een ding heeft dezelfde velden die ze gebruiken (een, naam, kleur). */
const alsFruit = (d: Ding) => d as unknown as Fruit;
const Hoofd = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Een getal in de kleur van het ding waar het naar verwijst (BOUWREGELS 2.1, 2.2, 14.20). */
export const gk = (n: number, d: Ding) => `{${n}:${d.kleur}}`;
/** Een getal dat niet naar een ding verwijst ("1 keer", "1 nummer"): wit (14.20, 14.27). */
const w = (n: number) => `{${n}:wit}`;

/* ---------- de plek van de dingen (zelfde soort als squla-rekenmix-mix1-1) ---------- */

/** Hoe de dingen liggen: door elkaar (`los`), in rijen (`rijen`, links uitgelijnd) of 2 aan 2 onder elkaar (`paren`). */
export type Vorm = "los" | "rijen" | "paren";
/** 1 ding in beeld: midden (x, y), maat m (vak van m × m) en hoe ver boven het midden het nummer staat. */
export type Plek = { x: number; y: number; m: number; boven: number };

/** Dezelfde vaste "willekeur" als de oude les (squla-rekenmix.tsx rng): steeds hetzelfde beeld bij dezelfde vraag. */
function rng(zaad: number) {
  let s = zaad * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Een potlood is lang en smal: een hoog vak, dicht naast elkaar (zoals in de oude les, herstel ronde 2). */
const hoog = (d: Ding) => d.beeld === "potlood";

/**
 * Alle plekken in LEESVOLGORDE (zo komen de nummers erbij als het goed is): rijen van boven naar beneden en van
 * links naar rechts; door elkaar ook van boven naar beneden; paren per paar (boven, dan onder), van links naar
 * rechts, zodat de onderste nummers 2, 4, 6 … zijn. Punten ten opzichte van het midden; het vlak schaalt alles.
 */
export function plekken(v: Rmvraag): Plek[] {
  const p: Plek[] = [];
  if (v.vorm === "rijen") {
    const rij = v.rijen ?? [];
    const m = hoog(v.ding) ? 150 : 92;
    const dx = hoog(v.ding) ? 62 : 112;
    const dy = m + 46;
    const kol = Math.max(...rij);
    rij.forEach((len, r) => {
      for (let i = 0; i < len; i++) p.push({ x: (i - (kol - 1) / 2) * dx, y: (r - (rij.length - 1) / 2) * dy, m, boven: m / 2 + 18 });
    });
  } else if (v.vorm === "paren") {
    const m = hoog(v.ding) ? 150 : 92;
    const dx = hoog(v.ding) ? 78 : 128;
    const dy = m + 46;
    const kol = v.n / 2;
    for (let i = 0; i < kol; i++) for (const r of [0, 1]) p.push({ x: (i - (kol - 1) / 2) * dx, y: (r - 0.5) * dy, m, boven: m / 2 + 18 });
  } else {
    /* Door elkaar, maar nooit over elkaar: elk ding een eigen vakje in een raster (willekeurig gekozen), met een klein
       beetje speling; dan in leesvolgorde. */
    const kol = 6;
    const rijen = 4;
    const cx = 132;
    const cy = 146;
    const r = rng(v.zaad ?? 1);
    const cellen = Array.from({ length: kol * rijen }, (_, i) => i).sort(() => r() - 0.5);
    const los: Plek[] = [];
    for (let k = 0; k < v.n; k++) {
      const c = cellen[k];
      los.push({ x: ((c % kol) - (kol - 1) / 2 + (r() - 0.5) * 0.16) * cx, y: (Math.floor(c / kol) - (rijen - 1) / 2 + (r() - 0.5) * 0.12) * cy, m: 92, boven: 92 / 2 + 18 });
    }
    los.sort((a, z) => (Math.abs(a.y - z.y) > cy * 0.5 ? a.y - z.y : a.x - z.x));
    p.push(...los);
  }
  return p;
}

/* ---------- de 15 vragen van squla-rekenmix-mix1-1 (zelfde volgorde, dingen, aantallen en keuzes) ---------- */

export type Rmvraag = { nr: number; id: string; ding: Ding; n: number; keuzes: number[]; vorm: Vorm; rijen?: number[]; zaad?: number };
const V = (nr: number, d: Ding, n: number, keuzes: number[], vorm: Vorm, extra: { rijen?: number[]; zaad?: number } = {}): Rmvraag => ({ nr, id: `vraag${nr}-${n}-${d.naam.replace(/'/g, "")}`, ding: d, n, keuzes, vorm, ...extra });

/* Squla 12517 level 1 (SQULA-ANALYSE/rekenmix-12517-reuzenkrokodil-volledig.md): tellen, kies uit 3 getallen,
   5 t/m 12, afleiders 1 meer en 1 minder (soms 3 verder). De oude les: squla-rekenmix.tsx mix1_1 (niet veranderd). */
export const VRAGEN: Rmvraag[] = [
  V(1, APPEL, 7, [8, 6, 7], "los", { zaad: 11 }),
  V(2, BAL, 10, [10, 11, 9], "rijen", { rijen: [4, 4, 2] }),
  V(3, POTLOOD, 6, [5, 6, 7], "paren"),
  V(4, AUTO, 9, [9, 8, 10], "rijen", { rijen: [3, 3, 3] }),
  V(5, BLOEM, 12, [11, 12, 13], "rijen", { rijen: [5, 5, 2] }),
  V(6, KNIKKER, 5, [5, 4, 6], "los", { zaad: 23 }),
  V(7, BAL, 10, [10, 11, 7], "paren"),
  V(8, APPEL, 11, [12, 11, 10], "rijen", { rijen: [4, 4, 3] }),
  V(9, AUTO, 8, [7, 8, 9], "los", { zaad: 37 }),
  V(10, POTLOOD, 8, [8, 9, 5], "rijen", { rijen: [4, 4] }),
  V(11, BLOEM, 12, [12, 11, 13], "paren"),
  V(12, STER, 11, [11, 10, 12], "rijen", { rijen: [3, 3, 3, 2] }),
  V(13, APPEL, 9, [9, 8, 10], "los", { zaad: 51 }),
  V(14, BAL, 10, [10, 9, 7], "rijen", { rijen: [5, 5] }),
  V(15, AUTO, 8, [8, 7, 9], "paren"),
];

/* ---------- vaste zinnen van het verloop: die van de gouden les Tellen ---------- */

export const ZIN = {
  /** Stap 1: openen (eigen beginzin van deze les, BOUWREGELS 4.3). */
  begin: "In deze les tel je allerlei dingen.",
  /** De vraag (gouden les Tellen; schoolterm "Hoeveel … zie je?"). De eerste keer met wat het kind moet doen (3.15). */
  vraag: (d: Ding) => ZIN_TELLEN.vraag(alsFruit(d)),
  vraagEerste: ZIN_TELLEN.vraagEerste,
  natellen: ZIN_TELLEN.natellen,
  natellenKlaar: (n: number, d: Ding) => ZIN_TELLEN.natellenKlaar(n, alsFruit(d)),
  samenHelp: ZIN_TELLEN.samenHelp,
  /* Zelfde zin als Tellen ("Tik op elke appel. Ik tel mee."), maar met "elk" bij een het-woord (elk potlood). */
  samenTik: (d: Ding) => (d.elk === "elke" ? ZIN_TELLEN.samenTik(alsFruit(d)) : `Tik op ${d.elk} ${d.een}. Ik tel mee.`),
  samenHand: (d: Ding) => ZIN_TELLEN.samenHand(alsFruit(d)),
  samenKlaar: (n: number, d: Ding) => ZIN_TELLEN.samenKlaar(n, alsFruit(d)),
  samenZelf: (n: number, d: Ding) => ZIN_TELLEN.samenZelf(n, alsFruit(d)),
  /** Stap 10: einde (eigen slotzin; 12 is het grootste aantal in deze les, een getal zonder ding: wit). */
  slot: "Je telde allerlei dingen, tot wel {12:wit}.",
  kaartTik: ZIN_TELLEN.kaartTik,
  weerGekozen: (x: number, d: Ding) => ZIN_TELLEN.weerGekozen(x, alsFruit(d)),
};

/** BLIEPO-KARAKTER.md §4 Tellen: de reactie met het aantal (zelfde rijtje als de gouden les Tellen). */
export const TELREACTIE = (n: number, d: Ding): Rijtje => TELREACTIE_TELLEN(n, alsFruit(d));

/* ---------- denkfouten (draaiboek Tellen §7; zelfde namen als de gouden les Tellen) ---------- */

export const DENKFOUTEN = ["te-weinig", "te-veel", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (geen opdracht; meteen daarna tellen we samen). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer noemde Bliepo de richting): "weer", en anders uitgelegd. */
  weer: string[];
  scherm: string;
  /** Waarom de richting niet genoemd wordt (zou het antwoord verklappen, BOUWREGELS 15.17). */
  noot?: string;
};

const SCHERM = "vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl)";

/**
 * De hints, per soort beeld (zodat ze kloppen met wat het kind ziet) en per denkfout, in 3 versies die per vraag
 * wisselen. Zelfde soort hint als de gouden les Tellen: opnieuw tellen en elk ding aanwijzen; bij "te weinig" niets
 * overslaan, bij "te veel" elk ding 1 keer. "Rij voor rij" en "linksboven" alleen bij rijen; bij paren "van links naar
 * rechts"; door elkaar "van boven naar beneden" (de dingen liggen verspreid over het hele vlak).
 */
const HINT = {
  weinig: {
    rijen: [(d: Ding) => `Tel nog eens, rij voor rij. Sla er geen ${d.een} over.`, (d: Ding) => `Begin linksboven en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
    los: [(d: Ding) => `Tel nog eens. Sla er geen ${d.een} over.`, (d: Ding) => `Tel opnieuw, van boven naar beneden. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
    paren: [(d: Ding) => `Tel nog eens, van links naar rechts. Sla er geen ${d.een} over.`, (d: Ding) => `Begin links en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
  },
  veel: {
    rijen: [(d: Ding) => `Tel nog eens, rij voor rij. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d: Ding) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d: Ding) => `Begin linksboven en tel rustig. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
    los: [(d: Ding) => `Tel nog eens. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d: Ding) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d: Ding) => `Tel rustig, van boven naar beneden. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
    paren: [(d: Ding) => `Tel nog eens, van links naar rechts. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d: Ding) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d: Ding) => `Begin links en tel rustig. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
  },
  /**
   * ZONDER richting: alleen als Bliepo de richting niet noemt (die zou maar 1 keuze overlaten, 15.17). Geen "over",
   * "1 keer", "maar 1", "te veel", "meer" (RICHTINGWOORDEN van de gouden les Tellen); het script controleert dit.
   */
  neutraal: {
    rijen: [(d: Ding) => `Begin linksboven en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Tel nog eens, rij voor rij. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Tel nog eens rustig. Wijs ${d.elk} ${d.een} aan en zeg het getal.`],
    los: [(d: Ding) => `Tel opnieuw, van boven naar beneden. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Tel nog eens rustig. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Wijs ${d.elk} ${d.een} aan en zeg het getal.`],
    paren: [(d: Ding) => `Begin links en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Tel nog eens, van links naar rechts. Wijs ${d.elk} ${d.een} aan.`, (d: Ding) => `Tel nog eens rustig. Wijs ${d.elk} ${d.een} aan en zeg het getal.`],
  },
};

/**
 * De eerste zin bij een fout, in 3 versies die per vraag wisselen (zoals de gouden les Tellen). "Dichtbij" en "scheelt
 * niet veel" alleen als het gekozen getal hooguit 2 naast het goede ligt (in deze les liggen sommige keuzes 3 verder:
 * dan een versie zonder "dichtbij"; waarheidscontrole in het script).
 */
const DICHTBIJ = [(X: string) => `${X} is dichtbij.`, (X: string) => `Je koos ${X}. Je zit er dichtbij.`, (X: string) => `Je koos ${X}. Dat scheelt niet veel.`];
const WEINIG = [(X: string) => `${X} is dichtbij, maar je hebt ze nog niet allemaal geteld.`, (X: string) => `Je koos ${X}. Je hebt ze nog niet allemaal geteld.`, (X: string) => `${X} is te weinig.`];
const VEEL = [(X: string) => `${X} is dichtbij, maar dat is te veel.`, (X: string) => `Je koos ${X}. Dat is te veel.`, (X: string) => `${X} is te veel.`];
/** Versie van de eerste zin: per vraag een andere; met "dichtbij" alleen als het gekozen getal hooguit 2 verschilt. */
const versie = (nr: number, verschil: number) => (verschil > 2 && nr % 3 === 0 ? 1 : nr % 3);

/**
 * De fouttabel van 1 fout antwoord. Logica van de gouden les Tellen (draaiboek Tellen §3 A, §7): Bliepo noemt het
 * gekozen getal en de richting (te weinig / te veel). Zou de richting bij deze 3 keuzes maar 1 keuze overlaten, dan
 * noemt Bliepo de richting NIET en wijst hij alleen naar de manier van tellen (15.17).
 */
export function telFout(x: number, v: Rmvraag): Fout {
  const d = v.ding;
  const X = gk(x, d);
  const goed = v.n;
  const kant = v.keuzes.filter((k) => k !== x && (x < goed ? k > x : k < x));
  const verklapt = kant.length === 1;
  const verschil = Math.abs(goed - x);
  const i = v.nr % 3;
  const noot = "richting niet genoemd: dan bleef er maar 1 keuze over";
  /* Zonder richting: de 3 versies van de eerste zin om de beurt over de hele les (niet per vraagnummer: dan vielen ze
     allemaal op dezelfde versie; LESRECEPT, geleerd bij Plussommen). */
  const n = nootVolgorde().indexOf(`${v.nr}-${x}`) % 3;
  if (x < goed) {
    const basis = { code: "te-weinig" as const, soort: "te-weinig", denkfout: "telde er te weinig (sloeg er een over)", scherm: SCHERM };
    /* Uitleg zonder woorden uit de eerste zin (geen woord 2 keer in 1 reactie; LESRECEPT, geleerd bij Rekentaal). */
    const uitleg = verschil === 1 ? `Er mist nog ${gk(1, d)} ${d.een}.` : `Er missen nog een paar ${d.naam}.`;
    const weer = ["Je telde er weer te weinig.", `${Hoofd(d.elk)} ${d.een} krijgt ${w(1)} nummer. Dan sla je er geen over.`];
    return verklapt ? { ...basis, eerste: DICHTBIJ[n](X), hint: HINT.neutraal[v.vorm][i](d), uitleg, weer, noot } : { ...basis, eerste: WEINIG[versie(v.nr, verschil)](X), hint: HINT.weinig[v.vorm][i](d), uitleg, weer };
  }
  if (x > goed) {
    const basis = { code: "te-veel" as const, soort: "te-veel", denkfout: "telde er te veel (telde er een 2 keer)", scherm: SCHERM };
    const uitleg = verschil === 1 ? `Er is ${gk(1, d)} ${d.een} ${w(2)} keer geteld.` : `Er zijn een paar ${d.naam} ${w(2)} keer geteld.`;
    const weer = ["Je telde er weer te veel.", `${Hoofd(d.elk)} ${d.een} krijgt ${w(1)} nummer. Dan tel je niets ${w(2)} keer.`];
    return verklapt ? { ...basis, eerste: DICHTBIJ[n](X), hint: HINT.neutraal[v.vorm][i](d), uitleg, weer, noot } : { ...basis, eerste: VEEL[versie(v.nr, verschil)](X), hint: HINT.veel[v.vorm][i](d), uitleg, weer };
  }
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: HINT.neutraal[v.vorm][0](d), uitleg: `We tellen ze ${w(1)} voor ${w(1)}.`, weer: [`We tellen ze ${w(1)} voor ${w(1)}.`], scherm: SCHERM };
}

/** Alle foute antwoorden zonder richting (de richting zou maar 1 keuze overlaten), in de volgorde van de les. */
let NOOT: string[] | null = null;
function nootVolgorde(): string[] {
  if (NOOT) return NOOT;
  NOOT = [];
  for (const v of VRAGEN)
    for (const x of [...v.keuzes].sort((a, b) => a - b)) {
      if (x === v.n) continue;
      const kant = v.keuzes.filter((k) => k !== x && (x < v.n ? k > x : k < x));
      if (kant.length === 1) NOOT.push(`${v.nr}-${x}`);
    }
  return NOOT;
}

/** Twee verschillende foute getallen bij dezelfde vraag, allebei zonder richting: de 2e keer een andere versie (keuring Meten). */
export const dichtbijAnders = (x: number, v: Rmvraag) => DICHTBIJ[nootVolgorde().indexOf(`${v.nr}-${x}`) % 3 === 2 ? 0 : 2](gk(x, v.ding));

/** Nooit 2 keer "dichtbij" bij 1 vraag (keuring Tellen 11 nov): een versie zonder dat woord, zelfde betekenis. */
export function zonderDichtbij(x: number, v: Rmvraag): string {
  const f = telFout(x, v);
  if (!/dichtbij/.test(f.eerste)) return f.eerste;
  const X = gk(x, v.ding);
  if (f.noot) return DICHTBIJ[2](X);
  return (x < v.n ? WEINIG : VEEL)[1](X);
}

/** De fouttabel van een vraag: elk fout antwoord. */
export const foutenVan = (v: Rmvraag): Record<string, Fout> => Object.fromEntries(v.keuzes.filter((k) => k !== v.n).map((k) => [String(k), telFout(k, v)]));

/* =====================================================================================================================
 * DE ZINNEN VAN 18 NOVEMBER 2026: Bliepo als warme juf, in varianten (Sara; zelfde aanpak als de proefles Tellen en de
 * lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten, Getallenlijn, Geld, Klok, Vormen en Dagen).
 *
 * ALLEEN voor de gouden les Rekenmix 1 (squla-rekenmix-gouden.tsx) en het fouttabel-script. Alles hierboven (ZIN,
 * TELREACTIE, telFout, foutenVan, plekken, de dingen) blijft precies zoals het was: Rekenmix 2, 3 en 4 lezen ZIN,
 * TELREACTIE en plekken uit dit bestand en mogen niet veranderen. De oude zinnen van Rekenmix 1 staan dus ook nog
 * letterlijk hierboven; oud naast nieuw: WIJZIGINGEN-ZINNEN-REKENMIX1.md.
 *
 * Elke situatie die terugkomt heeft varianten; de les kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit dezelfde
 * zin 2 keer achter elkaar, ook niet over vragen heen. Getallen, antwoorden, keuzes en de betekenis zijn niet veranderd.
 * De vraag "Hoeveel … zie je?" en "Tel ze en tik op het goede getal." blijven gelijk (3.11, 15.36).
 * Een deel is de tekst van Synthesis (Color Count), in het Nederlands (besluit Sara 17 nov 2026), net als bij Tellen.
 * ===================================================================================================================== */

/** Wisselwoorden voor de kiezer: "Tik op elke bal." en "Tik op elk potlood." tellen als dezelfde zin. */
export const WISSEL_RM = [...new Set([APPEL, BAL, POTLOOD, AUTO, BLOEM, KNIKKER, STER].flatMap((d) => [d.een, d.naam])), "elke", "elk"];

/** Zonder kleurcode: {7:rood} wordt 7. */
export const kaalRm = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
const getallenIn = (z: string) => kaalRm(z).match(/\d+/g) ?? [];
/** Noemen 2 zinnen hetzelfde getal? (Een getal klinkt nooit 2 keer vlak achter elkaar.) */
export const deeltGetalRm = (a: string, b: string) => getallenIn(a).some((n) => getallenIn(b).includes(n));
/**
 * Zo lang mag 1 stuk tekst hooguit zijn (tekens zonder kleurcode, en hooguit 3 zinnen), anders past het niet in het vaste
 * tekstvak (15.30). Een harde eis: wat te lang is gaat vooraf uit de lijst, niet als wens aan de kiezer.
 */
export const MAX_STUK_RM = 110;
export const pastRm = (...delen: string[]) => {
  const t = kaalRm(delen.filter(Boolean).join(" "));
  return t.length <= MAX_STUK_RM && t.split(/(?<=[.!?])\s+/).filter(Boolean).length <= 3;
};
/** Eindigt een stuk met een vraag of met de opdracht om op het getal te tikken (15.37)? Dan hoeft de vraag niet terug. */
export const eindigtMetOpdrachtRm = (z: string) => {
  const laatste = kaalRm(z).trim().split(/(?<=[.!?])\s+/).at(-1) ?? "";
  return /\?$/.test(laatste) || /^(Tik|Kies)\b/.test(laatste) || /\btik op het (goede )?getal\.$/i.test(laatste);
};

export const RM = {
  /** Stap 1: openen (samen met de groet 1 stuk). De eerste versie is de oude zin. */
  begin: ["In deze les tel je allerlei dingen.", "Vandaag gaan we allerlei dingen tellen.", "We gaan samen van alles tellen."],
  /** De vraag (Squla: "Hoeveel … zie je?") blijft overal gelijk; de eerste keer met wat het kind moet doen (3.15). */
  vraag: (d: Ding) => `Hoeveel ${d.naam} zie je?`,
  vraagEerste: "Tel ze en tik op het goede getal.",
  /** De vraag terug na de hint (15.37, F16), als de hint zelf niet zegt dat het kind op het getal tikt. Noemt nooit een getal. */
  opnieuw: (d: Ding) => [`Hoeveel ${d.naam} zie je?`, "Hoeveel zijn het er dan?", "Tik dan op het goede getal."],
  /** Draaiboek Tellen §3 A.1 (b): bij de eerste vraag telt Bliepo hardop na (zelfde zinnen als de gouden les Tellen). */
  natellen: ["Ik tel ze hardop voor je. Tel maar mee!", "Kom, ik tel ze hardop. Tel maar mee!", "Laten we ze samen tellen. Ik tel hardop."],
  /** Na het hardop tellen. Het laatste getal zegt Bliepo hier (niet ook nog los ervoor): zo klinkt het maar 1 keer. */
  natellenKlaar: (n: number, d: Ding) => [`En ${gk(n, d)}! Je had het precies goed.`, `En de laatste is ${gk(n, d)}. Jij had het goed geteld.`, `En ${gk(n, d)}! Zie je? Je zat precies goed.`],
  /** Als het kind op de pijl tikte (alle nummers staan er meteen): Bliepo noemde nog geen getal. */
  natellenKlaarSnel: (n: number, d: Ding) => [`Zie je? Het zijn er ${gk(n, d)}. Je had het precies goed.`, `Zie je wel? Het zijn er ${gk(n, d)}. Jij had het goed geteld.`, `Kijk, daar heb je het: ${gk(n, d)}. Je zat precies goed.`],
  /** Na de 2e keer: samen tellen. */
  samenHelp: ["Kom, we tellen ze samen.", "Weet je wat? We tellen ze samen.", "Geeft niks. We tellen ze samen.", "Ik help je even. We tellen ze samen.", "Laten we ze samen tellen en kijken."],
  samenTik: (d: Ding) => [`Tik op ${d.elk} ${d.een}. Ik tel mee.`, `Tik ${d.elk} ${d.een} aan. Ik zeg het getal.`, `Tik op alle ${d.naam}. Ik tel hardop mee.`],
  samenHand: (d: Ding) => [`Tik op een ${d.een} zonder nummer.`, `Zoek een ${d.een} zonder nummer en tik erop.`, `Welke ${d.een} heeft nog geen nummer? Tik erop.`],
  /** Het laatste getal is het aantal; het getal staat er 1 keer. */
  samenKlaar: (n: number, d: Ding) => [`En ${gk(n, d)}! Zoveel ${d.naam} zijn het.`, `En ${gk(n, d)}! Nu hebben we ze samen allemaal geteld.`, `En de laatste is ${gk(n, d)}. Zoveel ${d.naam} zijn het.`],
  /** Vangnet: 20 s geen tik, dan telt Bliepo de rest zelf (geen "Ja", geen "samen"; begint met "Kijk,"). */
  samenZelf: (n: number, d: Ding) => [`Kijk, ik tel de rest. Het zijn er ${gk(n, d)}.`, `Kijk, ik tel even verder. Het zijn er ${gk(n, d)}.`],
  /** Stap 10: einde (12 is het grootste aantal in deze les; een getal zonder ding: wit). */
  slot: [`Je hebt allerlei dingen geteld, tot wel ${w(12)}!`, `Wat heb jij veel dingen geteld: tot wel ${w(12)}!`, `Knap, hoor! Je hebt helemaal tot ${w(12)} geteld.`],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  /** Hetzelfde getal 2 keer gekozen: niet 2 keer dezelfde eerste zin. */
  weerGekozen: (x: number, d: Ding) => [`Je koos weer ${gk(x, d)}.`, `Je tikte weer op ${gk(x, d)}.`, `Weer ${gk(x, d)}, zie ik.`],
  /** Aanmoediging bij het hulphandje tijdens samen tellen (het kind moet tikken, niet nadenken; 14.35). */
  aanmoedigTikken: ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."],
};

/**
 * De zin met het aantal na de lof. Zelfde plekken als de eerste versie (TELREACTIE): 0 en 1 beginnen met "Ja"
 * (TELREACTIE_JA), 4 is de robotzin (TELREACTIE_ROBOT, hooguit 1 keer per les); 5, 6 en 7 zijn erbij gekomen.
 */
export const TELREACTIE_RM = (n: number, d: Ding): Rijtje => ({
  zinnen: [`Ja, er zijn er ${gk(n, d)}.`, `Ja, je hebt ze allemaal geteld: ${gk(n, d)}.`, `Het zijn er ${gk(n, d)}.`, `Je hebt er ${gk(n, d)} geteld.`, `Ik heb ze nagekeken: het zijn er ${gk(n, d)}.`, `${gk(n, d)} ${d.naam}, precies!`, `Precies, ${gk(n, d)} ${d.naam}.`, `Dat klopt, er zijn ${gk(n, d)} ${d.naam}.`],
  robot: [4],
});

/* ---------- de fout-varianten (18 nov 2026) ---------- */

/** Alle varianten bij 1 antwoord dat niet goed is; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde). */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };
type Z = (d: Ding) => string;
type ZX = (X: string, d: Ding) => string;
const E = (d: Ding) => Hoofd(d.elk);

/* De hints (1e keer): waar het kind moet kijken, nooit het antwoord (15.17). Per manier van liggen, zodat ze kloppen met
   wat het kind ziet: "rij voor rij" en "bovenaan" bij rijen, "van links naar rechts" en "links" bij 2 aan 2, "van boven
   naar beneden" bij door elkaar. Niet meer "linksboven" (lastig voor groep 3; zoals bij Tellen). */
const HINT_WEINIG_RM: Record<Vorm, Z[]> = {
  rijen: [(d) => `Tel nog eens, rij voor rij. Sla geen ${d.een} over.`, (d) => `Tel ze nog eens rustig. Wijs ${d.elk} ${d.een} aan.`, (d) => `Begin bovenaan en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Probeer het nog eens. Tel ${d.elk} ${d.een} mee, ook de laatste.`],
  los: [(d) => `Tel nog eens. Sla geen ${d.een} over.`, (d) => `Tel ze nog eens rustig. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel ze opnieuw, van boven naar beneden. Wijs ${d.elk} ${d.een} aan.`, (d) => `Probeer het nog eens. Tel ${d.elk} ${d.een} mee, ook de laatste.`],
  paren: [(d) => `Tel nog eens, van links naar rechts. Sla geen ${d.een} over.`, (d) => `Tel ze nog eens rustig. Wijs ${d.elk} ${d.een} aan.`, (d) => `Begin links en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Probeer het nog eens. Tel ${d.elk} ${d.een} mee, ook de laatste.`],
};
const HINT_VEEL_RM: Record<Vorm, Z[]> = {
  rijen: [(d) => `Tel nog eens, rij voor rij. ${E(d)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Tel ze opnieuw. Wijs ${d.elk} ${d.een} maar ${w(1)} keer aan.`, (d) => `Begin bovenaan en tel rustig. ${E(d)} ${d.een} telt ${w(1)} keer mee.`, (d) => `Probeer het nog eens. Tel geen ${d.een} ${w(2)} keer.`],
  los: [(d) => `Tel nog eens, van boven naar beneden. ${E(d)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Tel ze opnieuw. Wijs ${d.elk} ${d.een} maar ${w(1)} keer aan.`, (d) => `Tel ze nog eens rustig. ${E(d)} ${d.een} telt ${w(1)} keer mee.`, (d) => `Probeer het nog eens. Tel geen ${d.een} ${w(2)} keer.`],
  paren: [(d) => `Tel nog eens, van links naar rechts. ${E(d)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Tel ze opnieuw. Wijs ${d.elk} ${d.een} maar ${w(1)} keer aan.`, (d) => `Begin links en tel rustig. ${E(d)} ${d.een} telt ${w(1)} keer mee.`, (d) => `Probeer het nog eens. Tel geen ${d.een} ${w(2)} keer.`],
};
/** ZONDER richting (als de richting maar 1 keuze zou overlaten, 15.17): geen woord dat zegt of het meer of minder is. */
const HINT_NEUTRAAL_RM: Record<Vorm, Z[]> = {
  rijen: [(d) => `Begin bovenaan en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens, rij voor rij. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel ze nog eens rustig. Wijs ${d.elk} ${d.een} aan en zeg het getal.`, (d) => `Probeer het nog eens. Tel hardop en wijs ${d.elk} ${d.een} aan.`, (d) => `Probeer het nog eens. Tel de ${d.naam} en tik op het getal.`],
  los: [(d) => `Tel ze opnieuw, van boven naar beneden. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel ze nog eens rustig. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal.`, (d) => `Probeer het nog eens. Tel hardop en wijs ${d.elk} ${d.een} aan.`, (d) => `Probeer het nog eens. Tel de ${d.naam} en tik op het getal.`],
  paren: [(d) => `Begin links en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens, van links naar rechts. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel ze nog eens rustig. Wijs ${d.elk} ${d.een} aan en zeg het getal.`, (d) => `Probeer het nog eens. Tel hardop en wijs ${d.elk} ${d.een} aan.`, (d) => `Probeer het nog eens. Tel de ${d.naam} en tik op het getal.`],
};

/* De eerste zin (1e keer): Bliepo zegt wat het kind koos, vriendelijk, nooit "fout". "Dichtbij", "bijna", "scheelt" en
   "iets" alleen als het gekozen getal hooguit 2 naast het goede ligt (in deze les liggen sommige keuzes 3 verder). */
const DICHTBIJ_RM: ZX[] = [(X) => `Je koos ${X}. Je zit er dichtbij.`, (X) => `Je koos ${X}. Dat scheelt niet veel.`, (X) => `Bijna! ${X} is het net niet.`, (X) => `${X}? Dat is heel dichtbij.`, (X) => `Je tikte op ${X}. Het scheelt maar een klein beetje.`];
const WEINIG_RM: ZX[] = [(X) => `Je koos ${X}. Er liggen er nog meer.`, (X) => `Je koos ${X}. Je hebt ze nog niet allemaal geteld.`, (X) => `Bijna! ${X} is nog iets te weinig.`, (X) => `${X}? Ik zie er nog meer.`, (X) => `Je zit er dichtbij met ${X}. Je hebt ze nog niet allemaal geteld.`, (X, d) => `${X} ${d.naam}? Je hebt ze nog niet allemaal geteld.`];
const VEEL_RM: ZX[] = [(X) => `Je koos ${X}. Dat zijn er iets te veel.`, (X) => `${X}? Dat zijn er iets te veel.`, (X) => `Bijna! ${X} is iets te veel.`, (X) => `Je zit er dichtbij, maar ${X} is te veel.`, (X) => `Je tikte op ${X}. Zo veel liggen er niet.`, (X, d) => `${X} ${d.naam}? Ik denk dat je er te veel hebt geteld.`];
/** Woorden die zeggen dat het bijna goed was: alleen als het hooguit 2 scheelt. */
export const BIJNA_RM = /dichtbij|bijna|scheelt|net niet|\biets\b|klein beetje/i;

/* De uitleg (2e keer): uitleg, geen opdracht; meteen daarna tellen we samen. De oude zinnen zijn er 1 van. */
const UITLEG_WEINIG_1_RM: Z[] = [(d) => `Er ligt nog ${gk(1, d)} ${d.een} meer.`, (d) => `Je hebt ${gk(1, d)} ${d.een} overgeslagen.`, (d) => `Je hebt ${gk(1, d)} ${d.een} niet geteld.`, (d) => `Er mist nog ${gk(1, d)} ${d.een}.`];
const UITLEG_WEINIG_PAAR_RM: Z[] = [(d) => `Er liggen nog een paar ${d.naam} meer.`, (d) => `Je hebt een paar ${d.naam} overgeslagen.`, (d) => `Je hebt een paar ${d.naam} niet geteld.`, (d) => `Er missen nog een paar ${d.naam}.`];
const UITLEG_VEEL_1_RM: Z[] = [(d) => `Je hebt ${gk(1, d)} ${d.een} ${w(2)} keer geteld.`, (d) => `Er is ${gk(1, d)} ${d.een} ${w(2)} keer geteld.`, (d) => `Je telde ${gk(1, d)} ${d.een} te veel.`];
const UITLEG_VEEL_PAAR_RM: Z[] = [(d) => `Je hebt een paar ${d.naam} ${w(2)} keer geteld.`, (d) => `Er zijn een paar ${d.naam} ${w(2)} keer geteld.`, (d) => `Je telde een paar ${d.naam} te veel.`];

/* 2 keer dezelfde denkfout (en Bliepo noemde de 1e keer de richting): "weer", en anders uitgelegd. */
const WEER_WEINIG_RM = ["Je telde er weer te weinig.", "Het zijn er weer iets te weinig.", "Weer iets te weinig, zie ik.", "Je hebt er weer te weinig geteld."];
const WEER_WEINIG_UITLEG_RM: Z[] = [(d) => `${E(d)} ${d.een} krijgt ${w(1)} nummer. Dan sla je er geen over.`, (d) => `We geven ${d.elk} ${d.een} een nummer. Zo vergeten we er geen.`];
const WEER_VEEL_RM = ["Je telde er weer te veel.", "Het zijn er weer iets te veel.", "Weer iets te veel, zie ik.", "Je hebt er weer te veel geteld."];
const WEER_VEEL_UITLEG_RM: Z[] = [(d) => `${E(d)} ${d.een} krijgt ${w(1)} nummer. Dan tel je niets ${w(2)} keer.`, (d) => `We geven ${d.elk} ${d.een} een nummer. Zo tellen we er geen ${w(2)} keer.`];

/** Woorden die een richting geven (meer of minder); verboden in een eerste zin of hint zonder richting. */
export const RICHTINGWOORDEN_RM = /\bover\b|overgeslagen|niet geteld|niet allemaal|\bmeer\b|\bminder\b|1 keer|2 keer|maar 1|te veel|te weinig|zo veel|dubbel|laatste|volle rijen/i;
/** Woorden waarmee Bliepo zegt dat het bijna goed was: bij 1 vraag hooguit 1 keer hetzelfde woord (keuring 11 nov). */
const KERN_RM = /dichtbij|bijna|scheelt/gi;
export const zelfdeKernRm = (a: string, b: string) => {
  const A = new Set((a.match(KERN_RM) ?? []).map((x) => x.toLowerCase()));
  return (b.match(KERN_RM) ?? []).some((x) => A.has(x.toLowerCase()));
};

/** Alle varianten bij 1 antwoord dat niet goed is (dezelfde denkfout en richting-keuze als telFout hierboven). */
export function variantenVan(x: number, v: Rmvraag): Varianten {
  const d = v.ding;
  const X = gk(x, d);
  const f = telFout(x, v);
  const verschil = Math.abs(v.n - x);
  const nabij = (l: string[]) => (verschil <= 2 ? l : l.filter((z) => !BIJNA_RM.test(kaalRm(z))));
  const mX = (l: ZX[]) => nabij(l.map((z) => z(X, d)));
  const mD = (l: Z[]) => l.map((z) => z(d));
  if (f.code === "te-weinig")
    return { eerste: f.noot ? mX(DICHTBIJ_RM) : mX(WEINIG_RM), hint: mD(f.noot ? HINT_NEUTRAAL_RM[v.vorm] : HINT_WEINIG_RM[v.vorm]), uitleg: mD(verschil === 1 ? UITLEG_WEINIG_1_RM : UITLEG_WEINIG_PAAR_RM), weerEerste: nabij(WEER_WEINIG_RM), weerUitleg: mD(WEER_WEINIG_UITLEG_RM) };
  if (f.code === "te-veel")
    return { eerste: f.noot ? mX(DICHTBIJ_RM) : mX(VEEL_RM), hint: mD(f.noot ? HINT_NEUTRAAL_RM[v.vorm] : HINT_VEEL_RM[v.vorm]), uitleg: mD(verschil === 1 ? UITLEG_VEEL_1_RM : UITLEG_VEEL_PAAR_RM), weerEerste: nabij(WEER_VEEL_RM), weerUitleg: mD(WEER_VEEL_UITLEG_RM) };
  return { eerste: [], hint: mD(HINT_NEUTRAAL_RM[v.vorm]), uitleg: ["We tellen ze rustig, stuk voor stuk."], weerEerste: [], weerUitleg: ["We tellen ze rustig, stuk voor stuk."] };
}

/** De fouttabel van 1 antwoord met alle varianten (telFout hierboven + `v`). */
export const telFoutRm = (x: number, v: Rmvraag): Fout & { v: Varianten } => ({ ...telFout(x, v), v: variantenVan(x, v) });
/** De fouttabel van een vraag met alle varianten. */
export const foutenRm = (v: Rmvraag): Record<string, Fout & { v: Varianten }> => Object.fromEntries(v.keuzes.filter((k) => k !== v.n).map((k) => [String(k), telFoutRm(k, v)]));

/** De kiezer van de les (nooit-dubbel.ts): een zin uit `zinnen`, nooit 2 keer achter elkaar dezelfde binnen 1 `sleutel`. */
export type Variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

/** Zin `z` past achter `a`: geen getal en geen stuk van 2 woorden dat er net al was ("… te veel. … te veel."). */
const pastNa = (a: string) => (z: string) => !deeltGetalRm(a, z) && !deeltStuk(a, z);

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is. De les en het fouttabel-script gebruiken precies deze functie.
 *   1e keer: eerste zin (wat het kind koos) + hint. Daarna komt de vraag terug (opnieuwZin).
 *   2e keer: eerste zin + uitleg; of, bij 2 keer dezelfde denkfout (en de 1e keer met richting), "weer …" + een andere
 *   uitleg; of, bij hetzelfde getal 2 keer, "Je koos weer …" + uitleg. Een ander getal: een eerste zin zonder het woord
 *   dat Bliepo bij deze vraag al zei (nooit 2 keer "dichtbij" bij 1 vraag). Daarna tellen we samen.
 * Wat niet in het tekstvak past, gaat vooraf uit de lijst (harde eis); de rest is een wens aan de kiezer.
 */
export function foutReactie(variant: Variant, f: Fout & { v: Varianten }, v: Rmvraag, o: { x: number; poging: 1 | 2; eerder: Fout | null; eersteX: number | null; eersteZin: string; onduidelijk: () => string }): string[] {
  const passend = (e: string, l: string[]) => {
    const p = l.filter((z) => pastRm(e, z));
    return p.length ? p : l;
  };
  if (f.code === "onduidelijk") {
    const e = o.onduidelijk();
    return o.poging === 1 ? [e, variant("hint", passend(e, f.v.hint), pastNa(e))] : [e, variant("uitleg", passend(e, f.v.uitleg), pastNa(e))];
  }
  if (o.poging === 1) {
    const e = variant("eerste", f.v.eerste);
    return [e, variant("hint", f.v.hint, pastNa(e))];
  }
  if (o.eerder !== null && o.eerder.soort === f.soort && !o.eerder.noot && f.v.weerEerste.length) {
    const weer = variant("weer", f.v.weerEerste);
    return [weer, variant("uitleg", passend(weer, f.v.weerUitleg), pastNa(weer))];
  }
  let e: string;
  if (o.x === o.eersteX) e = variant("weerGekozen", RM.weerGekozen(o.x, v.ding));
  else {
    const over = f.v.eerste.filter((z) => !zelfdeKernRm(o.eersteZin, z) && z !== o.eersteZin);
    e = variant("eerste", over.length ? over : f.v.eerste);
  }
  return [e, variant("uitleg", passend(e, f.v.uitleg), pastNa(e))];
}

/**
 * De vraag terug na de hint (15.37, F16): een versie die samen met de hint in het tekstvak past en geen getal uit de
 * hint herhaalt. Eindigt de hint al met "tik op het getal", dan niets (anders staat de opdracht er 2 keer).
 */
export function opnieuwZin(variant: Variant, v: Rmvraag, hint: string): string {
  if (eindigtMetOpdrachtRm(hint)) return "";
  const alle = RM.opnieuw(v.ding);
  const passend = alle.filter((z) => pastRm(hint, z) && !deeltGetalRm(hint, z));
  return variant("opnieuw", passend.length ? passend : alle);
}

/** Alle variantenrijtjes bij een fout, met een naam (voor de fouttabel en WIJZIGINGEN-ZINNEN-REKENMIX1.md). */
export const VARIANTEN_FOUT_RM = (d: Ding, vorm: Vorm, X: string): [string, string[]][] => [
  ["Eerste zin, zonder richting", DICHTBIJ_RM.map((z) => z(X, d))],
  ["Eerste zin, te weinig", WEINIG_RM.map((z) => z(X, d))],
  ["Eerste zin, te veel", VEEL_RM.map((z) => z(X, d))],
  ["Hint, zonder richting", HINT_NEUTRAAL_RM[vorm].map((z) => z(d))],
  ["Hint, te weinig", HINT_WEINIG_RM[vorm].map((z) => z(d))],
  ["Hint, te veel", HINT_VEEL_RM[vorm].map((z) => z(d))],
  ["Uitleg 2e keer, 1 te weinig", UITLEG_WEINIG_1_RM.map((z) => z(d))],
  ["Uitleg 2e keer, een paar te weinig", UITLEG_WEINIG_PAAR_RM.map((z) => z(d))],
  ["Uitleg 2e keer, 1 te veel", UITLEG_VEEL_1_RM.map((z) => z(d))],
  ["Uitleg 2e keer, een paar te veel", UITLEG_VEEL_PAAR_RM.map((z) => z(d))],
  ["Weer te weinig", WEER_WEINIG_RM],
  ["Weer te weinig, uitleg", WEER_WEINIG_UITLEG_RM.map((z) => z(d))],
  ["Weer te veel", WEER_VEEL_RM],
  ["Weer te veel, uitleg", WEER_VEEL_UITLEG_RM.map((z) => z(d))],
];
