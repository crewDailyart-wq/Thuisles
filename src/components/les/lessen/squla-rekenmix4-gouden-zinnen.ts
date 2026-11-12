/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Rekenmix 4 (squla-rekenmix-mix4-1-gouden, 12 november 2026), op één plek, met
 * de FOUTTABEL. De les zelf (squla-rekenmix4-gouden.tsx) bevat geen eigen zinnen.
 *
 * Alle 15 vragen van Rekenmix 4 level 1 (squla-rekenmix-mix4-1) zijn telvragen; ze volgen de GOUDEN LES TELLEN en de
 * gouden Rekenmix 1 (squla-rekenmix-mix1-1-gouden). De rijtjes en de zinnen van het telverloop komen uit
 * squla-rekenmix-gouden-zinnen.ts (zelf geladen, niet gekopieerd). Nieuw hier, EIGEN INVULLING (niet van Synthesis):
 *   - de 3 soorten telvraag van het oude level: gewoon tellen (door elkaar of in rijen), tellen in een druk plaatje
 *     (alleen 1 soort tellen; de rest staat er ook maar telt niet mee) en 2 rijen samen tellen;
 *   - de hints en denkfouten daarbij: "tel alleen de raketjes", "tel de bovenste rij en dan door in de onderste";
 *   - de beginzin, de slotzin en de ruimtedingen (raketje, planeet, ufo, satelliet, ster, kraal, knoop, aardbei).
 * Inhoud (BOUWREGELS 15.22): dezelfde 15 vragen als squla-rekenmix-mix4-1, in dezelfde volgorde, met dezelfde dingen,
 * aantallen, soorten en 3 keuzes. Het woord "groepje" staat op de niet-lijst (WOORDEN-GROEP3.md): bij "samen" heten het
 * "rijen" (de bovenste en de onderste).
 *
 * Leesbare versie: FOUTTABEL-squla-rekenmix-mix4-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-rekenmix4-gouden.ts`). {7:rood} = een getal in de kleur van het ding.
 */

import { ZIN as ZIN1, TELREACTIE as TELREACTIE1, type Ding as Ding1, type Plek, plekken as plekken1, type Rmvraag as Rmvraag1 } from "./squla-rekenmix-gouden-zinnen";

export {
  AANMOEDIG_TIKKEN,
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
  RICHTINGWOORDEN,
  TELREACTIE_JA,
  TELREACTIE_ROBOT,
  metNaam,
  type Rijtje,
} from "./squla-rekenmix-gouden-zinnen";

/* ---------- de dingen (zelfde dingen en getalkleur als squla-rekenmix-mix4-1) ---------- */

export type Ding = { beeld: string; een: string; naam: string; kleur: "rood" | "groen" | "blauw" | "geel" | "paars"; elk: "elke" | "elk" };
const ding = (beeld: string, een: string, naam: string, kleur: Ding["kleur"], elk: Ding["elk"] = "elke"): Ding => ({ beeld, een, naam, kleur, elk });
export const APPEL = ding("appel", "appel", "appels", "rood");
export const BAL = ding("speelbal", "bal", "ballen", "rood");
export const KNIKKER = ding("knikker", "knikker", "knikkers", "blauw");
export const STER = ding("ster", "ster", "sterren", "geel");
export const AARDBEI = ding("aardbei", "aardbei", "aardbeien", "rood");
export const KRAAL = ding("kraal", "kraal", "kralen", "paars");
export const RAKET = ding("raketje", "raketje", "raketjes", "rood", "elk");
export const PLANEET = ding("planeet", "planeet", "planeten", "paars");
export const UFO = ding("ufo", "ufo", "ufo's", "paars");
export const SATELLIET = ding("satelliet", "satelliet", "satellieten", "groen");
export const KNOOP = ding("knoop", "knoop", "knopen", "blauw");

const als1 = (d: Ding) => d as unknown as Ding1;
const Hoofd = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
/** Een getal in de kleur van het ding waar het naar verwijst (BOUWREGELS 2.1, 2.2, 14.20). */
export const gk = (n: number, d: Ding) => `{${n}:${d.kleur}}`;
/** Een getal dat nergens naar verwijst ("1 keer", "2 rijen"): wit (14.20, 14.27). */
const w = (n: number) => `{${n}:wit}`;

/* ---------- de 15 vragen van squla-rekenmix-mix4-1 ---------- */

/** `tel` = gewoon tellen, `druk` = alleen `ding` tellen terwijl er ook andere dingen staan, `samen` = 2 rijen samen tellen. */
export type Soort = "tel" | "druk" | "samen";
export type Vorm4 = "los" | "rijen" | "druk" | "samen";
export type Vraag4 = {
  nr: number;
  id: string;
  soort: Soort;
  ding: Ding;
  n: number;
  keuzes: number[];
  vorm: Vorm4;
  rijen?: number[];
  zaad?: number;
  /** Alleen bij `druk`: de andere dingen in het plaatje (tellen niet mee). */
  extra?: { ding: Ding; n: number }[];
  /** Alleen bij `samen`: hoeveel in de bovenste en in de onderste rij. */
  delen?: [number, number];
};
const V = (nr: number, soort: Soort, d: Ding, n: number, keuzes: number[], extra: Partial<Vraag4> = {}): Vraag4 => ({
  nr,
  id: `vraag${nr}-${n}-${d.naam.replace(/'/g, "")}`,
  soort,
  ding: d,
  n,
  keuzes,
  vorm: soort === "druk" ? "druk" : soort === "samen" ? "samen" : extra.rijen ? "rijen" : "los",
  ...extra,
});

/* Squla level 1 van Rekenmix 4: tellen, ook in een druk plaatje, en 2 groepjes samen (oude les: squla-rekenmix.tsx mix4_1). */
export const VRAGEN: Vraag4[] = [
  V(1, "druk", RAKET, 8, [10, 8, 9], { zaad: 61, extra: [{ ding: STER, n: 4 }, { ding: PLANEET, n: 2 }] }),
  V(2, "tel", KNOOP, 6, [5, 7, 6], { zaad: 63 }),
  V(3, "tel", PLANEET, 11, [11, 10, 12], { rijen: [5, 5, 1] }),
  V(4, "samen", BAL, 4, [3, 4, 5], { delen: [3, 1] }),
  V(5, "samen", APPEL, 6, [6, 7, 5], { delen: [3, 3] }),
  V(6, "druk", UFO, 5, [4, 5, 6], { zaad: 67, extra: [{ ding: RAKET, n: 3 }, { ding: STER, n: 4 }] }),
  V(7, "tel", AARDBEI, 5, [5, 6, 4], { zaad: 69 }),
  V(8, "tel", RAKET, 12, [12, 11, 10], { rijen: [5, 5, 2] }),
  V(9, "samen", KNIKKER, 4, [4, 5, 3], { delen: [2, 2] }),
  V(10, "samen", BAL, 7, [7, 6, 8], { delen: [4, 3] }),
  V(11, "druk", SATELLIET, 6, [6, 7, 8], { zaad: 71, extra: [{ ding: PLANEET, n: 3 }, { ding: STER, n: 3 }] }),
  V(12, "tel", KRAAL, 4, [3, 5, 4], { zaad: 73 }),
  V(13, "tel", STER, 9, [9, 8, 10], { rijen: [5, 4] }),
  V(14, "samen", APPEL, 8, [9, 8, 7], { delen: [4, 4] }),
  V(15, "samen", KNIKKER, 9, [9, 10, 8], { delen: [5, 4] }),
];

/* ---------- de plek van de dingen ---------- */

export type Plek4 = Plek & { beeld: string; doel: boolean };

/** Dezelfde vaste "willekeur" als de oude les (rng): steeds hetzelfde beeld bij dezelfde vraag. */
function rng(zaad: number) {
  let s = zaad * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Alle plekken in LEESVOLGORDE (van boven naar beneden, van links naar rechts); `doel` = telt mee. */
export function plekken(v: Vraag4): Plek4[] {
  if (v.soort === "druk") {
    const kol = 6;
    const rijen = 4;
    const cx = 132;
    const cy = 146;
    const r = rng(v.zaad ?? 1);
    const cellen = Array.from({ length: kol * rijen }, (_, i) => i).sort(() => r() - 0.5);
    const lijst: { beeld: string; doel: boolean }[] = [
      ...Array.from({ length: v.n }, () => ({ beeld: v.ding.beeld, doel: true })),
      ...(v.extra ?? []).flatMap((e) => Array.from({ length: e.n }, () => ({ beeld: e.ding.beeld, doel: false }))),
    ];
    const los: Plek4[] = lijst.map((d, k) => {
      const c = cellen[k];
      return { ...d, x: ((c % kol) - (kol - 1) / 2 + (r() - 0.5) * 0.16) * cx, y: (Math.floor(c / kol) - (rijen - 1) / 2 + (r() - 0.5) * 0.12) * cy, m: 92, boven: 92 / 2 + 18 };
    });
    los.sort((a, z) => (Math.abs(a.y - z.y) > cy * 0.5 ? a.y - z.y : a.x - z.x));
    return los;
  }
  if (v.soort === "samen") {
    const [a, b] = v.delen ?? [v.n, 0];
    const kol = Math.max(a, b);
    const dx = 112;
    const dy = 200;
    const m = 92;
    const p: Plek4[] = [];
    [a, b].forEach((len, r) => {
      for (let i = 0; i < len; i++) p.push({ beeld: v.ding.beeld, doel: true, x: (i - (kol - 1) / 2) * dx, y: (r - 0.5) * dy, m, boven: m / 2 + 18 });
    });
    return p;
  }
  const als = { ...v, ding: als1(v.ding), vorm: v.vorm === "rijen" ? "rijen" : "los" } as unknown as Rmvraag1;
  return plekken1(als).map((p) => ({ ...p, beeld: v.ding.beeld, doel: true }));
}

/* ---------- vaste zinnen van het verloop ---------- */

export const ZIN = {
  /** Stap 1: openen (eigen beginzin van deze les, BOUWREGELS 4.3). */
  begin: "In deze les tel je allerlei dingen in de ruimte.",
  /** De vraag (gouden les Tellen; schoolterm "Hoeveel … zie je?"). De eerste keer van elke soort met wat het kind moet doen (3.15). */
  vraag: (v: Vraag4, eersteVanSoort = false): string[] => {
    const d = v.ding;
    const basis = v.soort === "samen" ? `Hoeveel ${d.naam} zie je samen?` : `Hoeveel ${d.naam} zie je?`;
    if (!eersteVanSoort) return v.soort === "druk" ? [basis, `Tel alleen de ${d.naam}.`] : [basis];
    if (v.soort === "druk") return [basis, "Tel alleen die en tik op het goede getal."];
    if (v.soort === "samen") return [basis, "Tel beide rijen samen en tik op het goede getal."];
    return [basis, ZIN1.vraagEerste];
  },
  natellen: ZIN1.natellen,
  natellenKlaar: (n: number, d: Ding) => ZIN1.natellenKlaar(n, als1(d)),
  samenHelp: ZIN1.samenHelp,
  samenTik: (d: Ding) => ZIN1.samenTik(als1(d)),
  samenHand: (d: Ding) => ZIN1.samenHand(als1(d)),
  samenKlaar: (n: number, d: Ding) => ZIN1.samenKlaar(n, als1(d)),
  samenZelf: (n: number, d: Ding) => ZIN1.samenZelf(n, als1(d)),
  /** Stap 10: einde (eigen slotzin; 12 is het grootste aantal, een getal zonder ding: wit). */
  slot: "Je telde alles in de ruimte, tot wel {12:wit}.",
  kaartTik: ZIN1.kaartTik,
  weerGekozen: (x: number, d: Ding) => ZIN1.weerGekozen(x, als1(d)),
};

export const TELREACTIE = (n: number, d: Ding) => TELREACTIE1(n, als1(d));

/* ---------- denkfouten ---------- */

export const DENKFOUTEN = ["te-weinig", "te-veel", "maar-een-rij", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export type Fout = {
  code: Denkfoutnaam;
  soort: string;
  denkfout: string;
  eerste: string;
  hint: string;
  uitleg: string;
  weer: string[];
  scherm: string;
  noot?: string;
};

const SCHERM = "vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl)";

/**
 * De hints, per soort beeld en per denkfout, in 3 versies die per vraag wisselen. "Rij voor rij" en "linksboven" alleen
 * bij rijen; "van boven naar beneden" alleen door elkaar; "alleen de raketjes" alleen in een druk plaatje; "de bovenste
 * rij" alleen bij 2 rijen samen.
 */
type H = ((d: Ding) => string)[];
const HINT: Record<"weinig" | "veel" | "neutraal", Record<Vorm4, H>> = {
  weinig: {
    rijen: [(d) => `Tel nog eens, rij voor rij. Sla er geen ${d.een} over.`, (d) => `Begin linksboven en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
    los: [(d) => `Tel nog eens. Sla er geen ${d.een} over.`, (d) => `Tel opnieuw, van boven naar beneden. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
    druk: [(d) => `Zoek alle ${d.naam} en tel opnieuw. Sla er geen over.`, (d) => `Tel nog eens, alleen de ${d.naam}. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
    samen: [(d) => `Begin bij de bovenste rij en tel dan door in de onderste. Sla er geen ${d.een} over.`, (d) => `Tel nog eens, beide rijen samen. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
  },
  veel: {
    rijen: [(d) => `Tel nog eens, rij voor rij. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Begin linksboven en tel rustig. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
    los: [(d) => `Tel nog eens. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Tel rustig, van boven naar beneden. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
    druk: [(d) => `Let op, tel alleen de ${d.naam}. De rest telt niet mee.`, (d) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Tel rustig, alleen de ${d.naam}. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
    samen: [(d) => `Tel nog eens, beide rijen samen. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Begin bij de bovenste rij en tel dan door in de onderste. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
  },
  /** ZONDER richting (de richting zou maar 1 keuze overlaten, 15.17): geen "over", "1 keer", "maar 1", "te veel", "meer". */
  neutraal: {
    rijen: [(d) => `Begin linksboven en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens, rij voor rij. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens rustig. Wijs ${d.elk} ${d.een} aan en zeg het getal.`],
    los: [(d) => `Tel opnieuw, van boven naar beneden. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens rustig. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal.`],
    druk: [(d) => `Zoek de ${d.naam} en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens rustig, alleen de ${d.naam}.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal.`],
    samen: [(d) => `Begin bij de bovenste rij en tel dan door in de onderste. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens rustig, beide rijen samen.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal.`],
  },
};

const DICHTBIJ = [(X: string) => `${X} is dichtbij.`, (X: string) => `Je koos ${X}. Je zit er dichtbij.`, (X: string) => `Je koos ${X}. Dat scheelt niet veel.`];
const WEINIG = [(X: string) => `${X} is dichtbij, maar je hebt ze nog niet allemaal geteld.`, (X: string) => `Je koos ${X}. Je hebt ze nog niet allemaal geteld.`, (X: string) => `${X} is te weinig.`];
const VEEL = [(X: string) => `${X} is dichtbij, maar dat is te veel.`, (X: string) => `Je koos ${X}. Dat is te veel.`, (X: string) => `${X} is te veel.`];
const versie = (nr: number, verschil: number) => (verschil > 2 && nr % 3 === 0 ? 1 : nr % 3);

/**
 * De fouttabel van 1 fout antwoord. Logica van de gouden les Tellen (en Rekenmix 1): Bliepo noemt het gekozen getal en de
 * richting (te weinig / te veel). Zou de richting bij deze 3 keuzes maar 1 keuze overlaten, dan noemt Bliepo de richting
 * NIET en wijst hij alleen naar de manier van tellen (15.17). Nieuw: bij 2 rijen samen is het gekozen getal soms de
 * bovenste of de onderste rij zelf ("maar een deel"); in een druk plaatje zegt de hint "alleen de raketjes".
 */
export function telFout(x: number, v: Vraag4): Fout {
  const d = v.ding;
  const X = gk(x, d);
  const goed = v.n;
  const kant = v.keuzes.filter((k) => k !== x && (x < goed ? k > x : k < x));
  const verklapt = kant.length === 1;
  const verschil = Math.abs(goed - x);
  const i = v.nr % 3;
  const noot = "richting niet genoemd: dan bleef er maar 1 keuze over";
  const n = nootVolgorde().indexOf(`${v.nr}-${x}`) % 3;
  if (v.soort === "samen" && v.delen?.includes(x) && x < goed) {
    return {
      code: "maar-een-rij",
      soort: "maar-een-rij",
      denkfout: "telde maar 1 rij (de andere rij vergeten)",
      eerste: `${X} is maar een deel.`,
      hint: HINT.weinig.samen[0](d).replace(/ Sla er geen \w+ over\./, ""),
      uitleg: `De andere rij hoort er ook bij.`,
      weer: ["Je telde weer maar een deel.", "Beide rijen tellen mee, de bovenste en de onderste."],
      scherm: SCHERM,
    };
  }
  if (x < goed) {
    const basis = { code: "te-weinig" as const, soort: "te-weinig", denkfout: "telde er te weinig (sloeg er een over)", scherm: SCHERM };
    const uitleg = verschil === 1 ? `Er mist nog ${gk(1, d)} ${d.een}.` : `Er missen nog een paar ${d.naam}.`;
    const weer = ["Je telde er weer te weinig.", `${Hoofd(d.elk)} ${d.een} krijgt ${w(1)} nummer. Dan sla je er geen over.`];
    return verklapt ? { ...basis, eerste: DICHTBIJ[n](X), hint: HINT.neutraal[v.vorm][i](d), uitleg, weer, noot } : { ...basis, eerste: WEINIG[versie(v.nr, verschil)](X), hint: HINT.weinig[v.vorm][i](d), uitleg, weer };
  }
  if (x > goed) {
    const basis = { code: "te-veel" as const, soort: "te-veel", denkfout: v.soort === "druk" ? "telde er te veel (telde ook andere dingen mee, of een 2 keer)" : "telde er te veel (telde er een 2 keer)", scherm: SCHERM };
    const uitleg = verschil === 1 ? `Er is ${gk(1, d)} ${d.een} ${w(2)} keer geteld.` : `Er zijn een paar ${d.naam} ${w(2)} keer geteld.`;
    const weer = ["Je telde er weer te veel.", `${Hoofd(d.elk)} ${d.een} krijgt ${w(1)} nummer. Dan tel je niets ${w(2)} keer.`];
    return verklapt ? { ...basis, eerste: DICHTBIJ[n](X), hint: HINT.neutraal[v.vorm][i](d), uitleg, weer, noot } : { ...basis, eerste: VEEL[versie(v.nr, verschil)](X), hint: HINT.veel[v.vorm][i](d), uitleg, weer };
  }
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: HINT.neutraal[v.vorm][0](d), uitleg: `We tellen ze ${w(1)} voor ${w(1)}.`, weer: [`We tellen ze ${w(1)} voor ${w(1)}.`], scherm: SCHERM };
}

/** Alle foute antwoorden zonder richting, in de volgorde van de les. */
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

export const dichtbijAnders = (x: number, v: Vraag4) => DICHTBIJ[nootVolgorde().indexOf(`${v.nr}-${x}`) % 3 === 2 ? 0 : 2](gk(x, v.ding));

/** Nooit 2 keer "dichtbij" bij 1 vraag: een versie zonder dat woord, zelfde betekenis. */
export function zonderDichtbij(x: number, v: Vraag4): string {
  const f = telFout(x, v);
  if (!/dichtbij/.test(f.eerste)) return f.eerste;
  const X = gk(x, v.ding);
  if (f.noot) return DICHTBIJ[2](X);
  return (x < v.n ? WEINIG : VEEL)[1](X);
}

export const foutenVan = (v: Vraag4): Record<string, Fout> => Object.fromEntries(v.keuzes.filter((k) => k !== v.n).map((k) => [String(k), telFout(k, v)]));
