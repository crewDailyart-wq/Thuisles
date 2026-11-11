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
