/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Rekenmix 2 (squla-rekenmix-mix2-1-gouden, 12 november 2026), op één plek, met de
 * FOUTTABEL. De les zelf (squla-rekenmix2-gouden.tsx) bevat geen eigen zinnen.
 *
 * Alle 15 vragen van Rekenmix 2 level 1 (squla-rekenmix-mix2-1) zijn vergelijkvragen: "Op welke boterham zit meer kaas?"
 * (meer, minder, evenveel, de meeste, de minste; een boterham of een spiesje, zonder getal). Ze volgen de GOUDEN LES
 * MEER-MINDER (squla-meer-minder-evenveel2-1-gouden): tik op een plaatje (alleen een vinkje erop) en dan op het vinkje van
 * het lesscherm; 1e fout = eerste zin + hint, 2e fout = uitleg en samen kijken (Bliepo wijst elk plaatje aan en zegt hoeveel
 * erop zit; het kind tikt het goede plaatje); goed = lof en een korte reactie; hulphandje alleen bij samen kijken; einde
 * met slotzin en kaart. De rijtjes (lof, bevestiging, onduidelijk, einde) komen uit squla-rekenmix-gouden-zinnen.ts.
 * EIGEN INVULLING, NIET VAN SYNTHESIS: de fouttabel, de hints en de zinnen bij het samen kijken (More or Less heeft geen
 * plaatjes zonder getal).
 * Inhoud (BOUWREGELS 15.22): dezelfde 15 vragen als squla-rekenmix-mix2-1, in dezelfde volgorde, met dezelfde boterhammen
 * en spiesjes (en beleg), dezelfde volgorde van de 3 plaatjes en dezelfde vraag (meer, minder, evenveel, meeste, minste).
 * "Plaatje" wordt in de zinnen "boterham" of "spiesje" (de gouden les Meer-minder zegt "kaart").
 *
 * Leesbare versie: FOUTTABEL-squla-rekenmix-mix2-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-rekenmix2-gouden.ts`).
 */

import { ZIN as ZIN1 } from "./squla-rekenmix-gouden-zinnen";

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
  metNaam,
  type Rijtje,
} from "./squla-rekenmix-gouden-zinnen";

/* ---------- wat er op de plaatjes staat ---------- */

export type Wat = "meer" | "minder" | "evenveel" | "meest" | "minst";
export type Beleg = "banaan" | "komkommer" | "tomaat" | "ei";
export type Soort = "boterham" | "spies";

/** De woorden bij 1 soort plaatje (zelfde woorden als de oude les: HOEVEEL en BELEG in squla-rekenmix.tsx). */
export type Woorden = {
  /** De namen van de 3 plaatjes: weinig, veel, heel veel (bestanden in public/voorwerpen). */
  namen: [string, string, string];
  ding: string;
  /** Wat erop zit: kaas, fruit, banaan … */
  wat: string;
  /** "de" of "het" voor "meeste": de meeste kaas, het meeste fruit. */
  lw: "de" | "het";
  /** Het lidwoord van het ding zelf: de boterham, het spiesje. */
  het: "de" | "het";
  elk: "elke" | "elk";
  die: "die" | "dat";
  welk: string;
};

const BOTERHAM = (wat: string, lw: "de" | "het", namen: Woorden["namen"]): Woorden => ({ namen, ding: "boterham", wat, lw, het: "de", elk: "elke", die: "die", welk: "welke boterham" });
const SPIES: Woorden = { namen: ["spies-leeg", "spies-twee", "spies-vol"], ding: "spiesje", wat: "fruit", lw: "het", het: "het", elk: "elk", die: "dat", welk: "welk spiesje" };
export const woordenVan = (v: Pick<Vraag2, "soort" | "beleg">): Woorden =>
  v.soort === "spies"
    ? SPIES
    : v.beleg
      ? BOTERHAM(v.beleg, v.beleg === "ei" ? "het" : "de", [`boterham-${v.beleg}-weinig`, `boterham-${v.beleg}-veel`, `boterham-${v.beleg}-heel-veel`])
      : BOTERHAM("kaas", "de", ["boterham-weinig-kaas", "boterham-veel-kaas", "boterham-heel-veel-kaas"]);

/* ---------- de 15 vragen van squla-rekenmix-mix2-1 ---------- */

/** `keuzes`: per plaatje (van links naar rechts) hoeveel erop zit: 0 = weinig, 1 = veel, 2 = heel veel. */
export type Vraag2 = { nr: number; id: string; soort: Soort; wat: Wat; keuzes: number[]; beleg?: Beleg };
const V = (nr: number, soort: Soort, keuzes: number[], wat: Wat, beleg?: Beleg): Vraag2 => ({ nr, id: `vraag${nr}-${soort}${beleg ? "-" + beleg : ""}-${wat}`, soort, wat, keuzes, beleg });

/* Squla level 1 van Rekenmix 2 (oude les: squla-rekenmix.tsx mix2_1): meer, meeste, minder, minste, evenveel. */
export const VRAGEN: Vraag2[] = [
  V(1, "boterham", [2, 1, 0], "meer"),
  V(2, "spies", [2, 0, 1], "meest"),
  V(3, "boterham", [1, 0, 2], "minder", "banaan"),
  V(4, "spies", [2, 0, 1], "minst"),
  V(5, "boterham", [2, 1, 0], "evenveel", "komkommer"),
  V(6, "boterham", [0, 2, 1], "meer", "tomaat"),
  V(7, "boterham", [1, 2, 0], "meest", "ei"),
  V(8, "boterham", [2, 0, 1], "minder"),
  V(9, "spies", [1, 2, 0], "minst"),
  V(10, "boterham", [0, 1, 2], "evenveel", "banaan"),
  V(11, "boterham", [1, 0, 2], "meer", "komkommer"),
  V(12, "spies", [0, 1, 2], "meest"),
  V(13, "boterham", [0, 2, 1], "minder", "tomaat"),
  V(14, "boterham", [2, 1, 0], "minst", "ei"),
  V(15, "boterham", [1, 2, 0], "evenveel"),
];

/** Met een plaatje bovenaan (meer, minder, evenveel) of zonder (de meeste, de minste). */
export const metVoorbeeld = (v: Vraag2) => v.wat === "meer" || v.wat === "minder" || v.wat === "evenveel";
/** Welk niveau is goed: 2 (heel veel) bij meer en de meeste, 0 bij minder en de minste, 1 bij evenveel. */
export const doelNiveau = (v: Vraag2) => (v.wat === "meer" || v.wat === "meest" ? 2 : v.wat === "minder" || v.wat === "minst" ? 0 : 1);
/** Het plaatje (0, 1 of 2 van links naar rechts) dat goed is. */
export const goedPlaatje = (v: Vraag2) => v.keuzes.indexOf(doelNiveau(v));

/* ---------- vaste zinnen van het verloop ---------- */

/** Een getal dat nergens naar verwijst: wit (14.20, 14.27). */
const w = (n: number) => `{${n}:wit}`;
const Hoofd = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const vergelijking = (v: Vraag2) => (v.wat === "meer" ? "meer" : v.wat === "minder" ? "minder" : "evenveel");

export const ZIN = {
  begin: "In deze les kijk je hoeveel er op een boterham of een spiesje zit.",
  /** De vraag (zoals de oude les). De eerste keer met wat het kind moet doen (de knoppen 1 keer uitleggen, 3.15). */
  vraag: (v: Vraag2, eerste = false): string[] => {
    const h = woordenVan(v);
    const basis = metVoorbeeld(v) ? [`Kijk naar ${h.het} ${h.ding} bovenaan.`, `Op ${h.welk} zit ${vergelijking(v)} ${h.wat}?`] : [`Op ${h.welk} zit ${h.lw} ${v.wat === "meest" ? "meeste" : "minste"} ${h.wat}?`];
    return eerste ? [...basis, `Tik op de goede ${h.ding} en dan op het vinkje.`] : basis;
  },
  samenHelp: ZIN1.samenHelp,
  /** Samen kijken na de 2e fout: Bliepo wijst elk plaatje aan. */
  samenKijk: (v: Vraag2) => `Kijk, we gaan ze samen langs.`,
  samenPlaatje: (v: Vraag2, niveau: number): string => {
    const h = woordenVan(v);
    if (niveau === 0) return `Hier zit ${h.lw} minste ${h.wat}.`;
    if (niveau === 2) return `Hier zit ${h.lw} meeste ${h.wat}.`;
    return metVoorbeeld(v) ? `Hier zit evenveel ${h.wat} als bovenaan.` : `Hier zit iets meer ${h.wat}.`;
  },
  samenTik: (v: Vraag2) => {
    const h = woordenVan(v);
    return v.wat === "meest" ? `Tik op ${h.het} ${h.ding} met ${h.lw} meeste ${h.wat}.` : v.wat === "minst" ? `Tik op ${h.het} ${h.ding} met ${h.lw} minste ${h.wat}.` : `Tik op ${h.het} ${h.ding} met ${vergelijking(v)} ${h.wat} ${v.wat === "evenveel" ? "als" : "dan"} bovenaan.`;
  },
  samenHand: (v: Vraag2) => `Tik op ${woordenVan(v).het} ${woordenVan(v).ding}.`,
  samenKlaar: (v: Vraag2) => {
    const h = woordenVan(v);
    return v.wat === "meest" ? `Ja, hier zit ${h.lw} meeste ${h.wat}.` : v.wat === "minst" ? `Ja, hier zit ${h.lw} minste ${h.wat}.` : `Ja, hier zit ${vergelijking(v)} ${h.wat} ${v.wat === "evenveel" ? "als" : "dan"} bovenaan.`;
  },
  /** Vangnet: 20 s geen tik, dan wijst Bliepo zelf. */
  samenZelf: (v: Vraag2) => {
    const h = woordenVan(v);
    return `Kijk, ik wijs hem aan. ${v.wat === "meest" ? `Hier zit ${h.lw} meeste ${h.wat}.` : v.wat === "minst" ? `Hier zit ${h.lw} minste ${h.wat}.` : `Hier zit ${vergelijking(v)} ${h.wat} ${v.wat === "evenveel" ? "als" : "dan"} bovenaan.`}`;
  },
  slot: "Je zag waar meer en minder zit.",
  kaartTik: ZIN1.kaartTik,
};

/** De reactie bij goed (zoals de goedZin van de oude les), in 3 versies die wisselen. */
export const GOEDREACTIE = (v: Vraag2) => {
  const h = woordenVan(v);
  const A = v.wat === "evenveel" ? `Daar zit evenveel ${h.wat} op als bovenaan.` : v.wat === "meest" || v.wat === "minst" ? `Daar zit ${h.lw} ${v.wat === "meest" ? "meeste" : "minste"} ${h.wat} op.` : `Daar zit ${v.wat} ${h.wat} op dan bovenaan.`;
  const B = v.wat === "evenveel" ? `${Hoofd(h.die)} ${h.ding} heeft net zoveel ${h.wat} als bovenaan.` : v.wat === "meest" ? `${Hoofd(h.die)} ${h.ding} is ${h.het === "de" ? "de" : "het"} volst.` : v.wat === "minst" ? `${Hoofd(h.die)} ${h.ding} is ${h.het === "de" ? "de" : "het"} leegst.` : `${Hoofd(h.die)} ${h.ding} heeft ${v.wat} ${h.wat} dan bovenaan.`;
  const C = v.wat === "evenveel" ? `Je zag dat het evenveel is.` : v.wat === "meest" ? `Je vond ${h.het} ${h.ding} ${h.die} het volst is.` : v.wat === "minst" ? `Je vond ${h.het} ${h.ding} ${h.die} het leegst is.` : `Je koos ${h.het} ${h.ding} met ${v.wat} ${h.wat}.`;
  return { zinnen: [A, B, C], robot: [] as number[] };
};

/* ---------- denkfouten ---------- */

export const DENKFOUTEN = ["koos-evenveel", "koos-meer", "koos-minder", "koos-het-tegenovergestelde", "koos-het-middelste", "onduidelijk"] as const;
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

const SCHERM = "vraag en plaatjes even weg; de plaatjes blijven staan; Bliepo's scherm 1,5 s rood; met de hint komen de plaatjes meteen terug (geen pijl)";

/**
 * De fouttabel van 1 fout plaatje (het niveau van het plaatje dat het kind koos). Bliepo zegt wat er klopt van het
 * gekozen plaatje ("Daar zit evenveel kaas op als bovenaan"): dat sluit alleen dat plaatje uit, nooit het goede (15.17).
 * De hint is neutraal: kijk wat erop zit, zonder "voller" of "leger".
 */
export function vergelijkFout(c: number, v: Vraag2): Fout {
  const h = woordenVan(v);
  const i = v.nr % 3;
  const basis = { scherm: SCHERM };
  if (metVoorbeeld(v)) {
    const rel = c < 1 ? "minder" : c > 1 ? "meer" : "evenveel";
    const eerste =
      rel === "evenveel"
        ? [`Daar zit evenveel ${h.wat} op als bovenaan.`, `${Hoofd(h.die)} ${h.ding} heeft net zoveel ${h.wat} als bovenaan.`, `Je koos evenveel ${h.wat} als bovenaan.`][i]
        : [`Daar zit ${rel} ${h.wat} op dan bovenaan.`, `${Hoofd(h.die)} ${h.ding} heeft ${rel} ${h.wat} dan bovenaan.`, `Je koos ${rel} ${h.wat} dan bovenaan.`][i];
    const uitleg = { meer: `Je zoekt ${h.het} ${h.ding} ${h.die} voller is.`, minder: `Je zoekt ${h.het} ${h.ding} ${h.die} leger is.`, evenveel: `Je zoekt ${h.het} ${h.ding} ${h.die} er precies zo uitziet.` }[vergelijking(v)];
    return {
      ...basis,
      code: rel === "evenveel" ? "koos-evenveel" : rel === "meer" ? "koos-meer" : "koos-minder",
      soort: `koos-${rel}`,
      denkfout: rel === "evenveel" ? "koos het plaatje met evenveel" : rel === "meer" ? "koos het plaatje met meer" : "koos het plaatje met minder",
      eerste,
      hint: [`Kijk hoeveel ${h.wat} er bovenaan zit.`, `Kijk wat er anders is dan bovenaan.`, `Kijk goed naar ${h.het} ${h.ding} bovenaan.`][i],
      uitleg,
      weer: [`Je koos weer ${h.het} ${h.ding} ${h.die} niet klopt.`, uitleg],
    };
  }
  const meest = v.wat === "meest";
  const tegen = meest ? c === 0 : c === 2;
  const lwMeest = `${h.lw} ${meest ? "meeste" : "minste"}`;
  const uitleg = meest ? `Je zoekt ${h.het} ${h.ding} ${h.die} het volst is.` : `Je zoekt ${h.het} ${h.ding} ${h.die} het leegst is.`;
  const hint = [`Kijk hoeveel ${h.wat} er op ${h.elk} ${h.ding} zit.`, `Kijk naar ${h.elk} ${h.ding} en kies dan.`, `Kijk nog eens goed naar alle ${w(3)}.`][i];
  if (tegen) {
    return {
      ...basis,
      code: "koos-het-tegenovergestelde",
      soort: "koos-het-tegenovergestelde",
      denkfout: meest ? "koos juist het plaatje met het minste" : "koos juist het plaatje met het meeste",
      eerste: meest
        ? [`Daar zit juist ${h.lw} minste ${h.wat} op.`, `${Hoofd(h.die)} ${h.ding} heeft ${h.lw} minste ${h.wat}.`, `Je koos juist ${h.lw} minste ${h.wat}.`][i]
        : [`Daar zit juist ${h.lw} meeste ${h.wat} op.`, `${Hoofd(h.die)} ${h.ding} heeft ${h.lw} meeste ${h.wat}.`, `Je koos juist ${h.lw} meeste ${h.wat}.`][i],
      hint,
      uitleg,
      weer: [`Je koos weer het tegenovergestelde.`, uitleg],
    };
  }
  return {
    ...basis,
    code: "koos-het-middelste",
    soort: "koos-het-middelste",
    denkfout: meest ? "koos het plaatje dat niet het meeste heeft (en ook niet het minste)" : "koos het plaatje dat niet het minste heeft (en ook niet het meeste)",
    eerste: [`Daar zit niet ${lwMeest} ${h.wat} op.`, `Het is niet ${h.het} ${h.ding} ${h.die} je koos.`, `Je koos niet ${lwMeest} ${h.wat}.`][i],
    hint,
    uitleg,
    weer: [`Je koos weer ${h.het} ${h.ding} ${h.die} net niet klopt.`, uitleg],
  };
}

/** Er is geen "dichtbij" bij plaatjes zonder getal; deze twee bestaan alleen omdat de gedeelde les ze kent. */
export const dichtbijAnders = (c: number, v: Vraag2) => vergelijkFout(c, v).eerste;
export const zonderDichtbij = (c: number, v: Vraag2) => vergelijkFout(c, v).eerste;
/** Hetzelfde foute plaatje 2 keer: niet 2 keer dezelfde eerste zin. */
export const weerGekozen = (v: Vraag2) => `Je koos weer ${woordenVan(v).het} ${woordenVan(v).ding} ${woordenVan(v).die} niet klopt.`;

/** De fouttabel van een vraag: per fout plaatje (sleutel = plaats 0, 1 of 2 van links naar rechts). */
export const foutenVan = (v: Vraag2): Record<string, Fout> => Object.fromEntries(v.keuzes.map((niv, plek) => [String(plek), niv === doelNiveau(v) ? null : vergelijkFout(niv, v)]).filter(([, f]) => f)) as Record<string, Fout>;
