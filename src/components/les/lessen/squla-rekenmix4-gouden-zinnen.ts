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

import { deeltStuk } from "./nooit-dubbel";
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
/* Keuring 19 nov 2026: "satelliet" is te moeilijk voor groep 3. Het plaatje (public/voorwerpen/satelliet.png, een groen
   ding met blauwe panelen in de ruimte) heet nu overal "ruimteschip" (in tekst en zin; het plaatje en de kleur blijven).
   Oud: ding("satelliet", "satelliet", "satellieten", "groen"). WIJZIGINGEN-ZINNEN-REKENMIX34.md, WEGGEHAALD.md. */
export const SATELLIET = ding("satelliet", "ruimteschip", "ruimteschepen", "groen", "elk");
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
  /* Het id blijft "satellieten" (voortgang en controles kennen de vraag onder die naam); alleen het woord is veranderd. */
  V(11, "druk", SATELLIET, 6, [6, 7, 8], { zaad: 71, extra: [{ ding: PLANEET, n: 3 }, { ding: STER, n: 3 }], id: "vraag11-6-satellieten" }),
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
 * De hints, per soort beeld en per denkfout, in 3 versies die per vraag wisselen. "Rij voor rij" en "bovenaan" (was: "linksboven", 19 nov 2026) alleen
 * bij rijen; "van boven naar beneden" alleen door elkaar; "alleen de raketjes" alleen in een druk plaatje; "de bovenste
 * rij" alleen bij 2 rijen samen.
 */
type H = ((d: Ding) => string)[];
const HINT: Record<"weinig" | "veel" | "neutraal", Record<Vorm4, H>> = {
  weinig: {
    rijen: [(d) => `Tel nog eens, rij voor rij. Sla er geen ${d.een} over.`, (d) => `Begin bovenaan en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
    los: [(d) => `Tel nog eens. Sla er geen ${d.een} over.`, (d) => `Tel opnieuw, van boven naar beneden. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
    druk: [(d) => `Zoek alle ${d.naam} en tel opnieuw. Sla er geen over.`, (d) => `Tel nog eens, alleen de ${d.naam}. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
    samen: [(d) => `Begin bij de bovenste rij en tel dan door in de onderste. Sla er geen ${d.een} over.`, (d) => `Tel nog eens, beide rijen samen. Wijs ${d.elk} ${d.een} aan.`, (d) => `Wijs ${d.elk} ${d.een} aan en zeg het getal. Sla er geen over.`],
  },
  veel: {
    rijen: [(d) => `Tel nog eens, rij voor rij. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Begin bovenaan en tel rustig. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
    los: [(d) => `Tel nog eens. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Tel rustig, van boven naar beneden. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
    druk: [(d) => `Let op, tel alleen de ${d.naam}. De rest telt niet mee.`, (d) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Tel rustig, alleen de ${d.naam}. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
    samen: [(d) => `Tel nog eens, beide rijen samen. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`, (d) => `Begin opnieuw. ${Hoofd(d.elk)} ${d.een} tel je maar ${w(1)} keer.`, (d) => `Begin bij de bovenste rij en tel dan door in de onderste. Wijs ${d.elk} ${d.een} ${w(1)} keer aan.`],
  },
  /** ZONDER richting (de richting zou maar 1 keuze overlaten, 15.17): geen "over", "1 keer", "maar 1", "te veel", "meer". */
  neutraal: {
    rijen: [(d) => `Begin bovenaan en tel opnieuw. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens, rij voor rij. Wijs ${d.elk} ${d.een} aan.`, (d) => `Tel nog eens rustig. Wijs ${d.elk} ${d.een} aan en zeg het getal.`],
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

/* =====================================================================================================================
 * DE ZINNEN VAN 18 NOVEMBER 2026: Bliepo als warme juf, in varianten (Sara; zelfde aanpak als de proefles Tellen en de
 * lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten, Getallenlijn, Geld, Klok, Vormen, Dagen, Tijd
 * en Rekentaal). Oud naast nieuw: WIJZIGINGEN-ZINNEN-REKENMIX34.md.
 *
 * Voor de gouden lessen Rekenmix 4 (squla-rekenmix4-gouden.tsx) en Rekenmix 3 (via squla-rekenmix3-gouden-zinnen.ts) en
 * de fouttabel-scripts. Alles hierboven (ZIN, HINT, telFout, foutenVan, plekken, de dingen) blijft precies zoals het was;
 * de denkfout (code, soort, noot) komt nog steeds uit telFout. De oude zinnen zijn telkens 1 van de varianten.
 * Elke situatie die terugkomt heeft varianten; de les kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit dezelfde
 * zin 2 keer achter elkaar, ook niet over vragen heen. Getallen, antwoorden, keuzes en de betekenis zijn niet veranderd.
 * De vraag "Hoeveel … zie je?" blijft gelijk (3.11, 15.36). Een deel is de tekst van Synthesis (Color Count), in het
 * Nederlands (besluit Sara 17 nov 2026), net als bij Tellen: "Ik denk dat je er te veel hebt geteld.", "Probeer het nog
 * eens.", "Laten we ze samen tellen en kijken.", "Kijk, daar heb je het", "Precies, 8 raketjes.", "Dat klopt, er zijn …".
 * ===================================================================================================================== */

/** Wisselwoorden voor de kiezer: "Tik op elke bal." en "Tik op elk raketje." tellen als dezelfde zin. */
export const WISSEL_4 = [...new Set([APPEL, BAL, KNIKKER, STER, AARDBEI, KRAAL, RAKET, PLANEET, UFO, SATELLIET, KNOOP].flatMap((d) => [d.een, d.naam])), "elke", "elk", "doos", "zak", "bovenste", "onderste"];

/** Zonder kleurcode: {7:rood} wordt 7. */
export const kaal4 = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
const getallenIn = (z: string): string[] => kaal4(z).match(/\d+/g) ?? [];
/** Noemen 2 zinnen hetzelfde getal? (Een getal klinkt nooit 2 keer vlak achter elkaar.) */
export const deeltGetal4 = (a: string, b: string) => getallenIn(a).some((n) => getallenIn(b).includes(n));
/** Zo lang mag 1 stuk tekst hooguit zijn (tekens zonder kleurcode, en hooguit 3 zinnen): anders past het niet in het vaste tekstvak (15.30). */
export const MAX_STUK_4 = 110;
export const zinnenIn4 = (t: string) => kaal4(t).split(/(?<=[.!?])\s+/).filter(Boolean);
export const past4 = (...delen: string[]) => {
  const t = kaal4(delen.filter(Boolean).join(" "));
  return t.length <= MAX_STUK_4 && zinnenIn4(t).length <= 3;
};
/** Eindigt een stuk met een vraag of met een opdracht om te tikken (15.37)? Dan hoeft de vraag niet terug. */
export const eindigtMetOpdracht4 = (z: string) => {
  const laatste = zinnenIn4(z.trim()).at(-1) ?? "";
  return /\?$/.test(laatste) || /^(Tik|Kies)\b/.test(laatste);
};

/* ---------- geen woord 2 keer in 1 reactie (de herhaalcontrole, ook een harde eis bij het kiezen) ---------- */

/** Kleine woordjes die wel 2 keer mogen. */
export const KLEIN_4 = new Set("de het een en is in op je ze die dat dit deze er van niet nog dan zo als hij met tot maar naar wat hier daar al bij hoe waar welke welk".split(" "));
const VAST_4 = [/\brij voor rij\b/g, /\b1 voor 1\b/g];
export const woordenVan4 = (t: string) =>
  VAST_4.reduce((s, re) => s.replace(re, (m) => m.replace(/ /g, "")), kaal4(t).toLowerCase())
    .split(/[^a-zà-ÿ0-9']+/)
    .filter(Boolean);
/**
 * Staat er in deze stukken (samen 1 reactie) een woord of getal 2 keer, of hetzelfde woord vlak achter elkaar? Kleine
 * woordjes en de woorden van de vraag zelf tellen niet mee. Geeft de reden, of null.
 */
export function herhaling4(delen: string[], vraagWoorden: ReadonlySet<string> = new Set()): string | null {
  const gezien = new Map<string, number>();
  for (const w of delen.flatMap(woordenVan4)) gezien.set(w, (gezien.get(w) ?? 0) + 1);
  for (const [w, n] of gezien) {
    if (n < 2) continue;
    if (/^\d+$/.test(w)) return `getal ${w} ${n} keer`;
    if (KLEIN_4.has(w) || vraagWoorden.has(w)) continue;
    return `"${w}" ${n} keer`;
  }
  const zinnen = delen.flatMap(zinnenIn4);
  for (let i = 1; i < zinnen.length; i++) {
    const a = woordenVan4(zinnen[i - 1]).at(-1);
    const b = woordenVan4(zinnen[i])[0];
    if (a && b && a === b && !KLEIN_4.has(a)) return `"${a}" 2 keer achter elkaar`;
  }
  return null;
}
/** Hard filteren: wat niet mag gaat eruit, behalve als er dan niets over is. */
export const hard4 = (lijst: readonly string[], mag: (z: string) => boolean) => {
  const over = lijst.filter(mag);
  return over.length ? over : [...lijst];
};

/** Woorden waarmee Bliepo zegt dat het bijna goed was: bij 1 vraag hooguit 1 keer hetzelfde woord (keuring Tellen 11 nov). */
const KERN_4 = /dichtbij|bijna|scheelt/gi;
export const zelfdeKern4 = (a: string, b: string) => {
  const A = new Set((a.match(KERN_4) ?? []).map((x) => x.toLowerCase()));
  return (b.match(KERN_4) ?? []).some((x) => A.has(x.toLowerCase()));
};
/** Woorden die zeggen dat het bijna goed was: alleen als het hooguit 2 scheelt. */
export const BIJNA_4 = /dichtbij|bijna|scheelt|net niet|\biets\b|klein beetje/i;

/** De kiezer van de les (nooit-dubbel.ts): een zin uit `zinnen`, nooit 2 keer achter elkaar dezelfde binnen 1 `sleutel`. */
export type Variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

/* ---------- de vaste zinnen van het verloop, in varianten ---------- */

const E4 = (d: Ding) => Hoofd(d.elk);

export const RM4 = {
  /** Stap 1: openen (samen met de groet 1 stuk). De eerste versie is de oude zin. */
  begin: ["In deze les tel je allerlei dingen in de ruimte.", "Vandaag tellen we allerlei dingen in de ruimte.", "We gaan samen dingen tellen in de ruimte."],
  /**
   * De vraag (gouden les Tellen; schoolterm "Hoeveel … zie je?"), overal gelijk. De eerste keer van elke soort met wat het
   * kind moet doen (3.15), 1 ding per zin (15.36): in een druk plaatje zegt Bliepo welke dingen niet meetellen (keuring
   * V2: niet "Tel alleen die"), bij 2 rijen welke rijen (niet 2 keer "samen" in 1 vraag).
   */
  vraag: (v: Vraag4, eersteVanSoort = false): string[] => {
    const d = v.ding;
    const basis = v.soort === "samen" ? `Hoeveel ${d.naam} zie je samen?` : `Hoeveel ${d.naam} zie je?`;
    if (!eersteVanSoort) return v.soort === "druk" ? [basis, `Tel alleen de ${d.naam}.`] : [basis];
    if (v.soort === "druk") {
      const rest = (v.extra ?? []).map((e) => `de ${e.ding.naam}`);
      const lijst = rest.length > 1 ? `${rest.slice(0, -1).join(", ")} en ${rest.at(-1)}` : (rest[0] ?? "de andere dingen");
      return [basis, `${Hoofd(lijst)} tellen niet mee.`, "Tik op het goede getal."];
    }
    if (v.soort === "samen") return [basis, "Tel de bovenste en de onderste rij.", "Tik dan op het goede getal."];
    return [basis, "Tel ze en tik op het goede getal."];
  },
  /**
   * De vraag terug na de hint (15.37, F16), in andere woorden dan de vraag zelf (nooit precies dezelfde zin 2 keer). Noemt
   * nooit een getal. Niet als de hint zelf al met een vraag of "Tik …" eindigt.
   */
  opnieuw: (v: Vraag4): string[] =>
    v.soort === "samen"
      ? ["Hoeveel zijn het er samen?", `Hoeveel ${v.ding.naam} zijn het samen, denk je?`, "Tik dan op het goede getal."]
      : ["Hoeveel zijn het er dan?", `Hoeveel ${v.ding.naam} zijn het, denk je?`, "Tik dan op het goede getal."],
  /** Draaiboek Tellen §3 A.1 (b): bij de eerste vraag telt Bliepo hardop na (vraag 1: een druk plaatje, dus "de raketjes"). */
  natellen: (d: Ding) => [`Ik tel de ${d.naam} hardop. Tel maar mee!`, `Kom, we tellen de ${d.naam} samen na.`, `Laten we de ${d.naam} samen natellen.`],
  /** Na het hardop tellen. Het laatste getal zegt Bliepo hier (niet ook nog los ervoor): zo klinkt het maar 1 keer. */
  natellenKlaar: (n: number, d: Ding) => [`En ${gk(n, d)}! Je had het precies goed.`, `En de laatste is ${gk(n, d)}. Jij had het goed geteld.`, `En ${gk(n, d)}! Zie je? Je zat precies goed.`],
  /** Als het kind op de pijl tikte (alle nummers staan er meteen): Bliepo noemde nog geen getal. */
  natellenKlaarSnel: (n: number, d: Ding) => [`Zie je? Het zijn er ${gk(n, d)}. Je had het precies goed.`, `Zie je wel? Het zijn er ${gk(n, d)}. Jij had het goed geteld.`, `Kijk, daar heb je het: ${gk(n, d)}. Je zat precies goed.`],
  /** Na de 2e keer: samen tellen. */
  samenHelp: ["Kom, we tellen ze samen.", "Weet je wat? We tellen ze samen.", "Geeft niks. We tellen ze samen.", "Ik help je even. We tellen ze samen.", "Laten we ze samen tellen en kijken."],
  samenTik: (d: Ding) => [`Tik op ${d.elk} ${d.een}. Ik tel mee.`, `Tik ${d.elk} ${d.een} aan. Ik zeg het getal.`, `Tik op alle ${d.naam}. Ik tel hardop mee.`],
  samenHand: (d: Ding) => [`Tik op een ${d.een} zonder nummer.`, `Zoek een ${d.een} zonder nummer en tik erop.`, `${d.elk === "elk" ? "Welk" : "Welke"} ${d.een} heeft nog geen nummer? Tik erop.`],
  /** Het laatste getal is het aantal; het getal staat er 1 keer (was: "8. Samen telden we 8 raketjes."). */
  samenKlaar: (n: number, d: Ding) => [`En ${gk(n, d)}! Zoveel ${d.naam} zijn het.`, `En ${gk(n, d)}! Nu hebben we ze samen allemaal geteld.`, `En de laatste is ${gk(n, d)}. Zoveel ${d.naam} zijn het.`],
  /** Vangnet: 20 s geen tik, dan telt Bliepo de rest zelf (geen "Ja", geen "samen"; begint met "Kijk,"). */
  samenZelf: (n: number, d: Ding) => [`Kijk, ik tel de rest. Het zijn er ${gk(n, d)}.`, `Kijk, ik tel even verder. Het zijn er ${gk(n, d)}.`],
  /** Stap 10: einde (12 is het grootste aantal; een getal zonder ding: wit). De eerste versie is de oude zin. */
  slot: [`Je telde alles in de ruimte, tot wel ${w(12)}.`, `Wat heb jij veel geteld in de ruimte: tot wel ${w(12)}!`, `Knap, hoor! Je hebt helemaal tot ${w(12)} geteld.`],
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
export const TELREACTIE_4 = (n: number, d: Ding): { zinnen: string[]; robot: number[] } => ({
  zinnen: [`Ja, er zijn er ${gk(n, d)}.`, `Ja, je hebt ze allemaal geteld: ${gk(n, d)}.`, `Het zijn er ${gk(n, d)}.`, `Je hebt er ${gk(n, d)} geteld.`, `Inderdaad, je telde tot ${gk(n, d)}.`, `${gk(n, d)} ${d.naam}, precies!`, `Precies, ${gk(n, d)} ${d.naam}.`, `Dat klopt, er zijn ${gk(n, d)} ${d.naam}.`],
  robot: [4],
});

/* ---------- de fout-varianten (18 nov 2026) ---------- */

/** Alle varianten bij 1 antwoord dat niet goed is; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde). */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };
type Z = (d: Ding) => string;
type ZX = (X: string, d: Ding) => string;

/* De eerste zin (1e keer): wat het kind koos, 1 keer genoemd, vriendelijk, nooit "fout". De oude zinnen zijn er 1 van. */
const DICHTBIJ_4: ZX[] = [(X) => `${X} is dichtbij.`, (X) => `Je koos ${X}. Je zit er dichtbij.`, (X) => `Je koos ${X}. Dat scheelt niet veel.`, (X) => `Bijna! ${X} is het net niet.`, (X) => `${X}? Dat is heel dichtbij.`, (X) => `Je tikte op ${X}. Het scheelt maar een klein beetje.`];
const WEINIG_4: ZX[] = [(X) => `${X} is dichtbij, maar je hebt ze nog niet allemaal geteld.`, (X) => `Je koos ${X}. Je hebt ze nog niet allemaal geteld.`, (X) => `${X} is te weinig.`, (X) => `${X}? Ik zie er nog meer.`, (X) => `Bijna! ${X} is nog iets te weinig.`, (X, d) => `${X} ${d.naam}? Je hebt ze nog niet allemaal geteld.`];
const VEEL_4: ZX[] = [(X) => `${X} is dichtbij, maar dat is te veel.`, (X) => `Je koos ${X}. Dat is te veel.`, (X) => `${X} is te veel.`, (X) => `${X}? Dat zijn er iets te veel.`, (X) => `Bijna! ${X} is iets te veel.`, (X, d) => `${X} ${d.naam}? Ik denk dat je er te veel hebt geteld.`, (X) => `Je tikte op ${X}. Zo veel zijn er niet.`];
/** Alleen bij 2 rijen samen, als het gekozen getal precies 1 rij is (`rij` = "bovenste" of "onderste"). */
const DEEL_4 = (X: string, rij: string) => [`${X} is maar een deel.`, `${X}? Dat zijn ze nog niet allemaal.`, `Je koos ${X}. Zoveel zie je alleen ${rij === "bovenste" ? "bovenaan" : "onderaan"}.`];

/* De hints (1e keer): hoe je telt, nooit het antwoord (15.17). Per soort beeld, zodat ze kloppen met wat het kind ziet.
   De oude 3 per soort zijn er nog (HINT hierboven); er is er telkens 1 bij. */
const HINT_ERBIJ: Record<"weinig" | "veel" | "neutraal", Record<Vorm4, Z>> = {
  weinig: {
    rijen: (d) => `Probeer het nog eens. Tel ${d.elk} ${d.een} mee, ook de laatste.`,
    los: (d) => `Probeer het nog eens. Tel ${d.elk} ${d.een} mee, ook de laatste.`,
    druk: (d) => `Kijk overal goed. Tel ${d.elk} ${d.een} mee.`,
    samen: (d) => `Tel eerst de bovenste rij. Tel dan verder in de onderste. Sla geen ${d.een} over.`,
  },
  veel: {
    rijen: (d) => `Probeer het nog eens. Tel geen ${d.een} ${w(2)} keer.`,
    los: (d) => `Probeer het nog eens. Tel geen ${d.een} ${w(2)} keer.`,
    druk: (d) => `Kijk goed: alleen de ${d.naam} tellen mee.`,
    samen: (d) => `Probeer het nog eens. Tel geen ${d.een} ${w(2)} keer.`,
  },
  neutraal: {
    rijen: (d) => `Probeer het nog eens. Tel hardop en wijs ${d.elk} ${d.een} aan.`,
    los: (d) => `Probeer het nog eens. Tel hardop en wijs ${d.elk} ${d.een} aan.`,
    druk: (d) => `Probeer het nog eens. Tel hardop en wijs ${d.elk} ${d.een} aan.`,
    samen: (d) => `Probeer het nog eens. Tel hardop en wijs ${d.elk} ${d.een} aan.`,
  },
};
const hintsVan = (r: "weinig" | "veel" | "neutraal", v: Vraag4) => [...HINT[r][v.vorm].map((h) => h(v.ding)), HINT_ERBIJ[r][v.vorm](v.ding)];
const HINT_DEEL = (d: Ding, ander: string) => [HINT.weinig.samen[0](d).replace(/ Sla er geen \w+ over\./, ""), "Kijk naar beide rijen, de bovenste en de onderste.", `Tel ook de ${ander} rij mee.`];

/* De uitleg (2e keer): uitleg, geen opdracht; meteen daarna tellen we samen. De oude zinnen zijn er 1 van. */
const UITLEG_WEINIG_1: Z[] = [(d) => `Er mist nog ${gk(1, d)} ${d.een}.`, (d) => `Je hebt ${gk(1, d)} ${d.een} overgeslagen.`, (d) => `Je hebt ${gk(1, d)} ${d.een} niet geteld.`, (d) => `Er hoort nog ${gk(1, d)} ${d.een} bij.`];
const UITLEG_WEINIG_PAAR: Z[] = [(d) => `Er missen nog een paar ${d.naam}.`, (d) => `Je hebt een paar ${d.naam} overgeslagen.`, (d) => `Je hebt een paar ${d.naam} niet geteld.`, (d) => `Er horen nog een paar ${d.naam} bij.`];
const UITLEG_VEEL_1: Z[] = [(d) => `Er is ${gk(1, d)} ${d.een} ${w(2)} keer geteld.`, (d) => `Je hebt ${gk(1, d)} ${d.een} ${w(2)} keer geteld.`, (d) => `Dan krijgt ${gk(1, d)} ${d.een} ${w(2)} nummers.`, (d) => `Dan telt ${gk(1, d)} ${d.een} ${w(2)} keer mee.`];
const UITLEG_VEEL_PAAR: Z[] = [(d) => `Er zijn een paar ${d.naam} ${w(2)} keer geteld.`, (d) => `Je hebt een paar ${d.naam} ${w(2)} keer geteld.`, (d) => `Dan krijgen een paar ${d.naam} ${w(2)} nummers.`, (d) => `Dan tellen een paar ${d.naam} ${w(2)} keer mee.`];
/** In een druk plaatje kan te veel ook komen doordat het kind andere dingen meetelde: dat zegt Bliepo als uitleg, niet als reden. */
const UITLEG_DRUK_VEEL: Z[] = [(d) => `Alleen de ${d.naam} tellen mee.`, () => "De andere dingen tellen niet mee."];
const UITLEG_DEEL: string[] = ["De andere rij hoort er ook bij.", "Beide rijen tellen mee.", "De bovenste en de onderste rij horen erbij."];

/* 2 keer dezelfde denkfout (en Bliepo noemde de 1e keer de richting): "weer", en anders uitgelegd. */
const WEER_WEINIG_4 = ["Je telde er weer te weinig.", "Weer iets te weinig, zie ik.", "Je hebt er weer te weinig geteld."];
const WEER_WEINIG_UITLEG_4: Z[] = [(d) => `${E4(d)} ${d.een} krijgt ${w(1)} nummer. Dan sla je er geen over.`, (d) => `We geven ${d.elk} ${d.een} een nummer. Zo vergeten we er geen.`];
const WEER_VEEL_4 = ["Je telde er weer te veel.", "Weer iets te veel, zie ik.", "Je hebt er weer te veel geteld."];
const WEER_VEEL_UITLEG_4: Z[] = [(d) => `${E4(d)} ${d.een} krijgt ${w(1)} nummer. Dan tel je niets ${w(2)} keer.`, (d) => `We geven ${d.elk} ${d.een} een nummer. Zo tellen we er geen ${w(2)} keer.`];
const WEER_DEEL_4 = ["Je telde weer maar een deel.", "Weer maar een deel, zie ik."];
const WEER_DEEL_UITLEG_4 = ["Beide rijen tellen mee, de bovenste en de onderste.", "De bovenste en de onderste rij horen er allebei bij."];

/** Alle varianten bij 1 antwoord dat niet goed is (dezelfde denkfout en richting-keuze als telFout hierboven). */
export function variantenVan4(x: number, v: Vraag4): Varianten {
  const d = v.ding;
  const X = gk(x, d);
  const f = telFout(x, v);
  const verschil = Math.abs(v.n - x);
  const nabij = (l: string[]) => (verschil <= 2 ? l : l.filter((z) => !BIJNA_4.test(kaal4(z))));
  const mX = (l: ZX[]) => nabij(l.map((z) => z(X, d)));
  const mD = (l: Z[]) => l.map((z) => z(d));
  if (f.code === "maar-een-rij") {
    const rij = v.delen?.[0] === x ? "bovenste" : "onderste";
    return { eerste: DEEL_4(X, rij), hint: HINT_DEEL(d, rij === "bovenste" ? "onderste" : "bovenste"), uitleg: UITLEG_DEEL, weerEerste: WEER_DEEL_4, weerUitleg: WEER_DEEL_UITLEG_4 };
  }
  if (f.code === "te-weinig")
    return { eerste: f.noot ? mX(DICHTBIJ_4) : mX(WEINIG_4), hint: hintsVan(f.noot ? "neutraal" : "weinig", v), uitleg: mD(verschil === 1 ? UITLEG_WEINIG_1 : UITLEG_WEINIG_PAAR), weerEerste: nabij(WEER_WEINIG_4), weerUitleg: mD(WEER_WEINIG_UITLEG_4) };
  if (f.code === "te-veel")
    return { eerste: f.noot ? mX(DICHTBIJ_4) : mX(VEEL_4), hint: hintsVan(f.noot ? "neutraal" : "veel", v), uitleg: [...mD(verschil === 1 ? UITLEG_VEEL_1 : UITLEG_VEEL_PAAR), ...(v.soort === "druk" ? mD(UITLEG_DRUK_VEEL) : [])], weerEerste: nabij(WEER_VEEL_4), weerUitleg: mD(WEER_VEEL_UITLEG_4) };
  return { eerste: [], hint: hintsVan("neutraal", v), uitleg: ["We tellen ze rustig, stuk voor stuk."], weerEerste: [], weerUitleg: ["We tellen ze rustig, stuk voor stuk."] };
}

export type Fout4 = Fout & { v: Varianten };
/** De fouttabel van een vraag met alle varianten (telFout hierboven + `v`). */
export const fouten4 = (v: Vraag4): Record<string, Fout4> => Object.fromEntries(v.keuzes.filter((k) => k !== v.n).map((k) => [String(k), { ...telFout(k, v), v: variantenVan4(k, v) }]));

/** De woorden van de vraag zelf (die mogen in een reactie terugkomen). */
const VW4 = new Map<string, Set<string>>();
export const vraagWoorden4 = (v: Vraag4) => VW4.get(v.id) ?? VW4.set(v.id, new Set(woordenVan4(RM4.vraag(v, false).join(" ")))).get(v.id)!;
/** Een klein geheugen: dezelfde vraag + dezelfde zinnen geven altijd dezelfde lijst (sneller; verandert niets). */
const GEHEUGEN4 = new Map<string, string[]>();
const onthoud4 = (sleutel: string, maak: () => string[]) => GEHEUGEN4.get(sleutel) ?? GEHEUGEN4.set(sleutel, maak()).get(sleutel)!;

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is. De les en het fouttabel-script gebruiken precies deze functie.
 *   1e keer: eerste zin (wat het kind koos) + hint. Daarna komt de vraag terug (opnieuw4).
 *   2e keer: bij 2 keer dezelfde denkfout (en de 1e keer met richting) "weer …" + een andere uitleg; bij hetzelfde getal
 *   "Je koos weer …" + uitleg; anders een eerste zin zonder het woord dat Bliepo bij deze vraag al zei (nooit 2 keer
 *   "dichtbij" bij 1 vraag) + uitleg. Daarna tellen we samen.
 * Harde eisen (vooraf uit de lijst): het stuk past in het tekstvak, geen getal en geen woord 2 keer in 1 reactie.
 */
/** Past zin `z` achter `a` in 1 reactie? Geen getal, geen stuk van 2 woorden en geen woord 2 keer; als `stuk`: ook samen in het tekstvak. */
const na4 = (v: Vraag4, a: string, stuk: boolean) => (z: string) => !deeltGetal4(a, z) && !deeltStuk(a, z) && herhaling4([a, z], vraagWoorden4(v)) === null && (!stuk || past4(a, z));
/** De vragen die na eerste zin + hint passen (15.37, F16). */
export const opnieuwNa4 = (v: Vraag4, eerste: string, hint: string) => onthoud4(`o|${v.id}|${eerste}|${hint}`, () => RM4.opnieuw(v).filter((z) => past4(hint, z) && !deeltGetal4(`${eerste} ${hint}`, z) && herhaling4([eerste, hint, z], vraagWoorden4(v)) === null));
/** De hints die na deze eerste zin passen, en waarachter de vraag nog past (of die zelf al een vraag of "Tik …" zijn). */
export const hintsNa4 = (f: Fout4, v: Vraag4, eerste: string) => onthoud4(`h|${v.id}|${f.v.hint.join("|")}|${eerste}`, () => f.v.hint.filter((h) => na4(v, eerste, false)(h) && (eindigtMetOpdracht4(h) || opnieuwNa4(v, eerste, h).length > 0)));
/** De uitleggen (of "weer"-uitleggen) die na deze eerste zin passen. */
export const uitlegNa4 = (lijst: readonly string[], v: Vraag4, eerste: string) => onthoud4(`u|${v.id}|${lijst.join("|")}|${eerste}`, () => lijst.filter(na4(v, eerste, true)));
const ofAlles = (l: string[], alles: readonly string[]) => (l.length ? l : [...alles]);

export function foutReactie4(variant: Variant, f: Fout4, v: Vraag4, o: { x: number; poging: 1 | 2; eerder: Fout | null; eersteX: number | null; eersteZin: string; onduidelijk: () => string }): string[] {
  if (f.code === "onduidelijk") {
    const e = o.onduidelijk();
    return o.poging === 1 ? [e, variant("hint", ofAlles(hintsNa4(f, v, e), f.v.hint))] : [e, variant("uitleg", ofAlles(uitlegNa4(f.v.uitleg, v, e), f.v.uitleg))];
  }
  if (o.poging === 1) {
    /* Alleen een eerste zin waarachter minstens 1 hint past (harde eis), dan de hint. */
    const e = variant("eerste", hard4(f.v.eerste, (z) => hintsNa4(f, v, z).length > 0));
    return [e, variant("hint", ofAlles(hintsNa4(f, v, e), f.v.hint))];
  }
  if (o.eerder !== null && o.eerder.soort === f.soort && !o.eerder.noot && f.v.weerEerste.length) {
    const weer = variant("weer", hard4(f.v.weerEerste, (z) => !zelfdeKern4(o.eersteZin, z) && uitlegNa4(f.v.weerUitleg, v, z).length > 0));
    return [weer, variant("weerUitleg", ofAlles(uitlegNa4(f.v.weerUitleg, v, weer), f.v.weerUitleg))];
  }
  let e: string;
  if (o.x === o.eersteX) e = variant("weerGekozen", hard4(RM4.weerGekozen(o.x, v.ding), (z) => uitlegNa4(f.v.uitleg, v, z).length > 0));
  else e = variant("eerste", hard4(f.v.eerste, (z) => !zelfdeKern4(o.eersteZin, z) && z !== o.eersteZin && uitlegNa4(f.v.uitleg, v, z).length > 0));
  return [e, variant("uitleg", ofAlles(uitlegNa4(f.v.uitleg, v, e), f.v.uitleg))];
}

/**
 * De vraag terug na de hint (15.37, F16): een versie die samen met de hint in het tekstvak past, geen getal of woord uit
 * de eerste zin en de hint herhaalt. Eindigt de hint al met een vraag of "Tik …", dan niets.
 */
export function opnieuw4(variant: Variant, v: Vraag4, eerste: string, hint: string): string {
  if (eindigtMetOpdracht4(hint)) return "";
  return variant("opnieuw", ofAlles(opnieuwNa4(v, eerste, hint), RM4.opnieuw(v)));
}
