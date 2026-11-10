/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Getallenlijn (squla-getallenlijn-kat-1-gouden, 10 november 2026), op één
 * plek, met de FOUTTABEL. De les zelf (squla-getallenlijn-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is) zijn
 *     dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij de getallenlijn
 *     (BLIEPO-KARAKTER.md §4 Getallenlijn, zin 26 t/m 30), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (15 vragen, getallen en keuzes) is die van squla-getallenlijn-kat-1 "Het raketje op de getallenlijn"
 *     (BOUWREGELS 15.22): bij welk getal staat het raketje (5), na 10 (1), wat is meer (1), op volgorde (2), wat staat
 *     er bij … (2), het dichtst bij (2), ongeveer (2). De vraagzinnen zijn die van de oude les.
 *   - Het skelet volgt het draaiboek Getallenlijn (Difference Dash: Count the Jumps,
 *     SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/getallenlijn.md): startvraag "laten zien wat je weet?" (stap 3; ja = proef,
 *     nee = uitleg), uitleg met tikken op de lijn en springen per 1 met blijvende bogen (stap 4, §3 A en B), de
 *     hulpvraag "hoeveel sprongen?" met de denkfout "getallen geteld in plaats van sprongen" (§3 C, §7), bij een fout
 *     de getallen vastzetten en samen springen (§3 E.3, F.3), vanzelf door (0,5 s; bij ons ±0,7 s, 15.27).
 *   - "Bij welk getal staat het", "na 10", "wat is meer", "op volgorde", "wat staat er bij", "het dichtst bij" en
 *     "ongeveer" zitten NIET in Count the Jumps (draaiboek §8 en §11 punt 2): die vragen hebben hetzelfde skelet, maar
 *     hun eerste zinnen, hints en fouttabel zijn "eigen invulling, niet van Synthesis" (BOUWREGELS 15.22 punt 5;
 *     gemarkeerd met `eigen: true`). Wel van Synthesis: samen springen met bogen en het tellen van de sprongen.
 *
 * Leesbare versie: FOUTTABEL-squla-getallenlijn-kat-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-getallenlijn-gouden.ts`; dat script doet ook de reken-, verklap- en waarheidscontrole).
 * De getallen op de lijn zijn wit; in de zinnen dus {n:wit} (BOUWREGELS 2.2: de kleur van het voorwerp; een getal op de
 * witte lijn is wit).
 */

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
  metNaam,
  type Rijtje,
} from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/** Een getal in de zin: wit, zoals op de lijn (BOUWREGELS 2.2). */
export const w = (n: number) => `{${n}:wit}`;

/* ---------- de 15 vragen van squla-getallenlijn-kat-1 (zelfde volgorde, getallen en keuzes) ---------- */

export type Wezen = "raketje" | "ufo" | "satelliet";
export type Soort = "bij" | "natien" | "meer" | "orden" | "wie" | "dichtst" | "ongeveer";

export type Vraag = {
  nr: number;
  id: string;
  soort: Soort;
  /** Het goede antwoord als tekst: een getal ("6"), een ding ("ufo") of een volgorde ("5,6,7,8"). */
  goed: string;
  /** De keuzes (getallen of dingen). Bij op volgorde: de kaarten. */
  opties: string[];
  /** De lijn. */
  van?: number;
  tot?: number;
  streepjes?: number[];
  labels?: number[];
  door?: boolean;
  /** Waar het raketje staat (op de lijn of bij "ongeveer"). */
  raketje?: number;
  /** Andere dingen op de lijn. */
  wezens?: { soort: Exclude<Wezen, "raketje">; n: number }[];
  /** Het getal waar het om gaat ("bij 17", "na 10", "dichtst bij 20"). */
  n?: number;
  /** Wat is meer: de 2 getallen en het verhaaltje van de oude les. */
  meer?: { a: number; b: number; verhaal: string[] };
  /** Op volgorde: de vakken (het eerste staat er al). */
  vakken?: (number | null)[];
  /** Het dichtst bij: de 3 bordjes. */
  bordjes?: number[];
  /** Een eigen vraagzin (zoals de oude les bij "een lange getallenlijn"). */
  vraagzin?: string[];
};

const reeks = (van: number, tot: number) => Array.from({ length: tot - van + 1 }, (_, i) => van + i);
const zonder = (lijst: number[], n: number) => lijst.filter((k) => k !== n);

const bij = (nr: number, van: number, tot: number, n: number, opties: number[], vraagzin?: string[]): Vraag => ({
  nr,
  id: `vraag${nr}-bij-${n}`,
  soort: "bij",
  goed: String(n),
  opties: opties.map(String),
  van,
  tot,
  labels: zonder(reeks(van, tot), n),
  raketje: n,
  n,
  ...(vraagzin ? { vraagzin } : {}),
});
const orden = (nr: number, eerste: number, kaarten: number[]): Vraag => ({
  nr,
  id: `vraag${nr}-orden-${eerste}`,
  soort: "orden",
  goed: [eerste, ...[...kaarten].sort((a, b) => a - b)].join(","),
  opties: kaarten.map(String),
  vakken: [eerste, null, null, null],
});
const wie = (nr: number, n: number, goed: Wezen, raketje: number, anderen: { soort: Exclude<Wezen, "raketje">; n: number }[]): Vraag => ({
  nr,
  id: `vraag${nr}-wie-${n}`,
  soort: "wie",
  goed,
  opties: ["raketje", "ufo", "satelliet"],
  van: 10,
  tot: 20,
  labels: [10, 15, 20],
  raketje,
  wezens: anderen,
  n,
});
const dichtst = (nr: number, doel: number, getallen: number[]): Vraag => {
  const goed = [...getallen].sort((a, b) => Math.abs(a - doel) - Math.abs(b - doel))[0];
  return { nr, id: `vraag${nr}-dichtst-${doel}`, soort: "dichtst", goed: String(goed), opties: getallen.map(String), bordjes: getallen, n: doel };
};
const ongeveer = (nr: number, plek: number, opties: number[]): Vraag => ({
  nr,
  id: `vraag${nr}-ongeveer-${plek}`,
  soort: "ongeveer",
  goed: String(plek),
  opties: opties.map(String),
  van: 10,
  tot: 20,
  streepjes: [10, 15, 20],
  labels: [10, 15, 20],
  raketje: plek,
  n: plek,
});

export const VRAGEN: Vraag[] = [
  /* lijn 0–10: bij welk getal staat het raketje? */
  bij(1, 0, 10, 6, [7, 5, 6]),
  bij(2, 0, 10, 2, [2, 1, 4]),
  bij(3, 0, 10, 9, [8, 9, 10]),
  /* na 10 (de lijn loopt door, zonder getallen) */
  { nr: 4, id: "vraag4-natien-11", soort: "natien", goed: "11", opties: ["11", "1", "12"], van: 0, tot: 10, labels: reeks(0, 10), door: true, raketje: 11, n: 11 },
  /* wat is meer (kies uit 2) */
  { nr: 5, id: "vraag5-meer-14", soort: "meer", goed: "14", opties: ["14", "13"], van: 10, tot: 20, labels: [10, 15, 20], meer: { a: 13, b: 14, verhaal: ["Het raketje zoekt graag sterren.", `Gisteren vond het er ${w(13)}.`, `Vandaag vond het er ${w(14)}.`] } },
  /* op volgorde, het eerste getal staat er al */
  orden(6, 5, [7, 8, 6]),
  orden(7, 12, [14, 13, 15]),
  /* een lange getallenlijn */
  bij(8, 9, 20, 14, [15, 4, 14], ["Dit is een lange getallenlijn.", "Bij welk getal staat het raketje nu?"]),
  bij(9, 9, 20, 18, [17, 18, 8]),
  /* wat staat er bij …? */
  wie(10, 17, "raketje", 17, [{ soort: "ufo", n: 12 }, { soort: "satelliet", n: 19 }]),
  wie(11, 14, "ufo", 11, [{ soort: "ufo", n: 14 }, { soort: "satelliet", n: 18 }]),
  /* welk getal ligt het dichtst bij …? */
  dichtst(12, 20, [18, 8, 14]),
  dichtst(13, 10, [17, 4, 11]),
  /* schatten: weinig streepjes */
  ongeveer(14, 11, [11, 16, 19]),
  ongeveer(15, 19, [13, 19, 16]),
];

/** Welke vragen eigen invulling zijn: allemaal (draaiboek §8: Count the Jumps heeft deze soorten vragen niet). */
export const eigenInvulling = (v: Vraag) => v.nr > 0;

/* ---------- hulpjes voor de zinnen ---------- */

export const NAAM: Record<Wezen, string> = { raketje: "het raketje", ufo: "de ufo", satelliet: "de satelliet" };
export const Naam = (z: Wezen) => NAAM[z][0].toUpperCase() + NAAM[z].slice(1);

/** Waar een ding staat. */
export function plekVan(v: Vraag, z: string): number | null {
  if (z === "raketje") return v.raketje ?? null;
  return v.wezens?.find((x) => x.soort === z)?.n ?? null;
}

/** Het getal op de lijn waar je het makkelijkst vanaf telt: het dichtstbij, bij gelijk het kleinste (zoals de oude les). */
export function ijkpunt(labels: number[], n: number) {
  return [...labels].filter((a) => a !== n).sort((a, b) => Math.abs(a - n) - Math.abs(b - n) || a - b)[0];
}

/** Het getal vanaf waar Bliepo bij het samen voordoen springt (en de hint begint). */
export function anker(v: Vraag): number {
  const n = Number(v.goed);
  if (v.soort === "bij") return n - 1;
  if (v.soort === "natien") return 10;
  if (v.soort === "wie" || v.soort === "ongeveer") return ijkpunt(v.labels ?? [], v.n ?? n);
  if (v.soort === "meer") return v.meer!.a;
  if (v.soort === "dichtst") return v.n!;
  return n;
}

/** Het begin van de sprongen bij het samen voordoen (hooguit 3 sprongen, zoals Synthesis bij kleine afstanden). */
export function sprongStart(v: Vraag): number {
  const n = Number(v.goed);
  if (v.soort === "bij") return Math.max(v.van ?? 0, n - 3);
  if (v.soort === "natien") return 8;
  if (v.soort === "dichtst") return n;
  if (v.soort === "meer") return v.meer!.a;
  return anker(v);
}

/* ---------- vaste zinnen van het verloop (draaiboek Getallenlijn §2; eigen woorden) ---------- */

const raketWoord = (v: Vraag) => (v.soort === "wie" ? NAAM[v.goed as Wezen] : "het raketje");

export const ZIN = {
  /**
   * Stap 3: "laten zien wat je weet?" (draaiboek: ja = proef, nee = uitleg). Groet en startvraag zijn 1 stuk (Sara,
   * 10 nov). Uitlegdeel en persoonlijke vraag (BOUWREGELS 4.4); Ja = beginnen, Nee = samen oefenen.
   */
  start: "In deze les zoek je bij welk getal het raketje staat. Weet jij al hoe dat gaat?",
  proefBegin: "Laat maar zien!",
  proefGoed: "Dat gaat goed. We gaan verder.",
  proefLastig: ["Dit is nog lastig.", "We oefenen eerst samen."],
  /** Stap 4: de uitleg (4.5: samen beginnen, 1 ding uitleggen en laten zien, kleine stap, vraag, waarom, minder hulp). */
  samenBeginnen: "Fijn, ik help je op weg.",
  uitlegLijn: ["Dit is een getallenlijn.", "Bij elk streepje hoort een getal."],
  uitlegStart: "Het raketje begint bij de {0:wit}.",
  uitlegSpring: ["Laat het raketje springen tot de {3:wit}.", "Tik steeds op het getal ernaast."],
  uitlegSpringHand: "Tik op dit getal.",
  /** Springen: een sprong overslaan (draaiboek §3 B.3: "dat was geen sprong van 1"; B.5: "het hele stuk in één sprong"). */
  uitlegOverslaan: ["Dat is te ver voor 1 sprong.", "Het raketje springt steeds 1 streepje."],
  uitlegHeleStuk: ["Je wilde het hele stuk in 1 keer.", "Het raketje springt steeds 1 streepje."],
  uitlegSpringZelf: "Kijk, zo springt het raketje: steeds 1 streepje verder.",
  uitlegVraag: "Hoeveel sprongen maakte het raketje?",
  uitlegVraagOpnieuw: "Hoeveel bogen zie je?",
  /** Stap 5 van 4.5: bevestigen en uitleggen waarom. */
  uitlegWaarom: "Het raketje sprong {3:wit} keer vanaf de {0:wit}. Daarom staat het bij de {3:wit}.",
  uitlegSamenTel: (k: number) => `${w(k)}.`,
  uitlegSamenKlaar: "Dat zijn {3:wit} sprongen.",
  /** Stap 6 van 4.5: met minder hulp verder. */
  nuJij: "Nu jij. Kijk goed naar de getallen naast het raketje.",

  /** De vraag van de oude les; dezelfde soort vraag = dezelfde schooltermen (3.11); niet 2 keer na elkaar precies hetzelfde (F7). */
  vraag: (v: Vraag): string[] => {
    if (v.vraagzin) return v.vraagzin;
    if (v.soort === "bij") return [v.nr === 2 ? "Bij welk getal staat het raketje nu?" : "Bij welk getal staat het raketje?"];
    if (v.soort === "natien") return [`Het raketje vliegt verder dan de ${w(10)}.`, `Welk getal komt na ${w(10)}?`];
    if (v.soort === "meer") return [...v.meer!.verhaal, `Wat is meer: ${w(v.meer!.a)} of ${w(v.meer!.b)}?`];
    if (v.soort === "orden") return ["Zet de getallen op volgorde.", "Van klein naar groot."];
    if (v.soort === "wie") return [`Wat staat er bij ${w(v.n!)}?`, "Tik erop."];
    if (v.soort === "dichtst") return [`Welk getal ligt het dichtst bij ${w(v.n!)}?`];
    return ["Bij welk getal staat het raketje ongeveer?"];
  },
  /** Op volgorde, de eerste keer: hoe het werkt (3.15: 1 keer per les uitleggen). */
  ordenHoe: "Sleep een kaart naar een vak. Of tik op een kaart.",
  /** Een nieuwe poging na de hint: de vraag in andere woorden (3.23). */
  opnieuw: (v: Vraag): string[] => {
    if (v.soort === "bij") return ["Welk getal hoort bij het raketje?"];
    if (v.soort === "natien") return [`Welk getal komt er na ${w(10)}?`];
    if (v.soort === "meer") return [`Welk getal is meer: ${w(v.meer!.a)} of ${w(v.meer!.b)}?`];
    if (v.soort === "orden") return ["Zet de kaarten nu op volgorde."];
    if (v.soort === "wie") return [`Tik op wat er bij ${w(v.n!)} staat.`];
    if (v.soort === "dichtst") return [`Welk getal ligt het dichtst bij de ${w(v.n!)}?`];
    return ["Welk getal hoort ongeveer bij het raketje?"];
  },
  /** Op volgorde: het hulphandje wijst het eerste lege vak aan (nooit de goede kaart, 15.17). */
  ordenHand: "Hier komt een kaart.",

  /** 2e fout: samen voordoen (draaiboek §3 E.3 en F.3: de getallen vastzetten, samen springen, 1 per keer). */
  samen: (v: Vraag) => (v.soort === "orden" ? "Kom, we leggen ze samen." : v.soort === "dichtst" ? "Kom, we zetten de getallen op de lijn." : "Kom, we springen samen."),
  samenBegin: (v: Vraag) => {
    const s = sprongStart(v);
    if (v.soort === "ongeveer") return [`Ik zet alle streepjes erbij.`, `Ik begin bij de ${w(s)}.`];
    if (v.soort === "dichtst") return [`Hier is de ${w(v.n!)}.`];
    if (v.soort === "meer") return [`Hier staat de ${w(s)}.`];
    return [`Ik begin bij de ${w(s)}.`];
  },
  samenSprong: (k: number) => `${w(k)}.`,
  samenTelSprong: (k: number) => `${w(k)}.`,
  /** Bij het doel: het getal komt erbij (nu pas het antwoord in beeld, 15.11). */
  samenDoel: (v: Vraag) => {
    const n = Number(v.goed);
    if (v.soort === "bij" || v.soort === "natien" || v.soort === "ongeveer") return `Hier staat het raketje: bij de ${w(n)}.`;
    if (v.soort === "wie") return `Bij de ${w(v.n!)} staat ${NAAM[v.goed as Wezen]}.`;
    if (v.soort === "meer") return `De ${w(v.meer!.b)} komt 1 verder. Dus ${w(v.meer!.b)} is meer.`;
    if (v.soort === "dichtst") {
      const d = Math.abs(n - v.n!);
      return `Van ${w(n)} naar de ${w(v.n!)}: maar ${d} ${d === 1 ? "sprong" : "sprongen"}. De andere getallen liggen verder weg.`;
    }
    return "";
  },
  samenOrden: (a: number, b: number) => `Na ${w(a)} komt ${w(b)}.`,
  /** De kleine stap van het kind (15.11). */
  samenStap: (v: Vraag) => {
    if (v.soort === "orden") return `Sleep jij de ${w(Number(v.goed.split(",").at(-1)))} naar het laatste vak?`;
    if (v.soort === "wie") return `Tik jij op ${NAAM[v.goed as Wezen]}?`;
    return `Tik jij op de ${w(Number(v.goed))}?`;
  },
  samenHand: (v: Vraag) => {
    if (v.soort === "orden") return `Sleep de ${w(Number(v.goed.split(",").at(-1)))} hierheen.`;
    if (v.soort === "wie") return `Tik op ${NAAM[v.goed as Wezen]}.`;
    return `Tik op de ${w(Number(v.goed))}.`;
  },
  samenKlaar: (v: Vraag) => {
    const n = Number(v.goed);
    if (v.soort === "orden") return `Ja, nu staan ze op volgorde.`;
    if (v.soort === "wie") return `Ja, ${NAAM[v.goed as Wezen]} staat bij de ${w(v.n!)}.`;
    if (v.soort === "meer") return `Ja, ${w(n)} is meer.`;
    if (v.soort === "dichtst") return `Ja, ${w(n)} ligt het dichtst bij.`;
    return `Ja, dat is de ${w(n)}.`;
  },
  /** Na het vangnet (Bliepo deed de stap zelf): geen "Ja" alsof het kind het deed (keuring Meer-minder, 10 nov). */
  samenZelf: (v: Vraag) => {
    const n = Number(v.goed);
    if (v.soort === "orden") return "Kijk, nu staan ze op volgorde.";
    if (v.soort === "wie") return `Kijk, hier staat ${NAAM[v.goed as Wezen]}.`;
    return `Kijk, hier is de ${w(n)}.`;
  },
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: string, v: Vraag) => (v.soort === "orden" ? "Je legde ze weer zo neer." : v.soort === "wie" ? `Je tikte weer op ${NAAM[x as Wezen]}.` : `Je koos weer ${w(Number(x))}.`),
  /** Stap 7.5: einde. */
  slot: "Je weet nu waar het raketje staat op de getallenlijn.",
  kaartTik: "Tik op de kaart.",
  raketWoord,
};

/** Aanmoediging bij het hulphandje (het kind moet slepen of tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];

/**
 * Reactie na de lof (BLIEPO-KARAKTER.md §4 Getallenlijn, zin 26 t/m 30, plus zinnen zonder "Ja").
 * Index 0 en 1 beginnen met "Ja", 2 en 3 niet, 4 is de robotzin (hooguit 1 keer per les).
 */
export function lijnReactie(v: Vraag): Rijtje {
  const g = Number(v.goed);
  const G = w(g);
  if (v.soort === "bij") return rij([`Ja, het raketje staat bij de ${G}.`, `Ja, na de ${w(g - 1)} komt de ${G}.`, `Het raketje staat bij de ${G}.`, `Na de ${w(g - 1)} komt de ${G}.`, `Nagekeken: het raketje staat precies bij de ${G}.`], [4]);
  if (v.soort === "natien") return rij([`Ja, na de ${w(10)} komt de ${w(11)}.`, "Ja, de lijn gaat gewoon door.", `Na de ${w(10)} komt de ${w(11)}.`, `De lijn gaat door: ${w(11)}.`, `Nagekeken: na de ${w(10)} komt echt de ${w(11)}.`], [4]);
  if (v.soort === "meer") return rij([`Ja, ${G} is meer dan ${w(v.meer!.a)}.`, `Ja, ${G} zeg je later als je telt.`, `${G} is meer dan ${w(v.meer!.a)}.`, `${G} komt na ${w(v.meer!.a)}.`, `Nagekeken: ${G} is meer.`], [4]);
  if (v.soort === "orden") {
    const r = v.goed.split(",").map((n) => w(Number(n))).join(", ");
    return rij([`Ja, van klein naar groot: ${r}.`, "Ja, er komt steeds 1 bij.", `Van klein naar groot: ${r}.`, "Er komt steeds 1 bij.", `Nagekeken: ${r}. Klopt!`], [4]);
  }
  if (v.soort === "wie") {
    const z = v.goed as Wezen;
    return rij([`Ja, ${NAAM[z]} staat bij de ${w(v.n!)}.`, `Ja, daar is de ${w(v.n!)}.`, `${Naam(z)} staat bij de ${w(v.n!)}.`, `Bij de ${w(v.n!)} staat ${NAAM[z]}.`, `Nagekeken: ${NAAM[z]} staat bij de ${w(v.n!)}.`], [4]);
  }
  if (v.soort === "dichtst") {
    const d = Math.abs(g - v.n!);
    return rij([`Ja, ${G} ligt maar ${d} van de ${w(v.n!)} af.`, `Ja, ${G} ligt het dichtst bij de ${w(v.n!)}.`, `${G} ligt maar ${d} van de ${w(v.n!)} af.`, `${G} ligt het dichtst bij de ${w(v.n!)}.`, `Nagekeken: ${G} ligt het dichtst bij.`], [4]);
  }
  const a = anker(v);
  const kant = g > a ? "na" : "voor";
  return rij([`Ja, het raketje staat ongeveer bij de ${G}.`, `Ja, vlak ${kant} de ${w(a)}.`, `Het raketje staat ongeveer bij de ${G}.`, `Vlak ${kant} de ${w(a)} staat de ${G}.`, `Nagekeken: ongeveer ${G}. Klopt!`], [4]);
}
export const REACTIE_JA = [0, 1];
export const REACTIE_ROBOT = 4;
/** "Dat heb je goed gezien" alleen bij kijkvragen (BLIEPO-KARAKTER §3.1): waar het kind op de lijn moet kijken. */
export const isKijkvraag = (v: Vraag) => v.soort === "bij" || v.soort === "natien" || v.soort === "wie" || v.soort === "ongeveer";

/* ---------- denkfouten (draaiboek Getallenlijn §7, plus eigen namen voor de Squla-vragen) ---------- */

export const DENKFOUTEN = [
  "streepje-ervoor",
  "streepje-erna",
  "te-ver",
  "niet-ver-genoeg",
  "tiental-vergeten",
  "streepje-overgeslagen",
  "kleiner-gekozen",
  "volgorde-omgedraaid",
  "getal-overgeslagen",
  "kleiner-erna",
  "ding-ervoor",
  "ding-erna",
  "verder-weg",
  "ander-stuk",
  "getallen-tellen-ipv-sprongen",
  "te-weinig-bogen",
  "onduidelijk",
] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export type Licht = { soort: "getal"; n: number } | { soort: "bordje"; n: number } | { soort: "vak"; i: number } | null;

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen; dan mag het antwoord in beeld, 15.11). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
  weer: string[];
  /** Wat Bliepo bij de hint aanwijst met het rode rondje (alleen wat hij noemt, nooit het antwoord; 7.8, 15.17). */
  licht: Licht;
  scherm: string;
  /** Welke keuzes de eerste zin en de hint nog toelaten (verklapcontrole van het script, 15.17). */
  over: string[];
  /** Eigen invulling, niet van Synthesis (15.22 punt 5). */
  eigen: boolean;
  /** Waar Synthesis deze reactie heeft (draaiboek). */
  bron: string;
  /** Waarom er na de eerste zin maar 1 keuze over is (alleen bij 2 keuzes). */
  noot?: string;
};

const SCHERM_KIES = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; een rood rondje om het getal dat Bliepo noemt (nooit om het antwoord); dan de vraag in andere woorden en dezelfde keuzes terug (geen pijl)";
const SCHERM_WIE = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om het getal op de lijn dat Bliepo noemt; dan de vraag in andere woorden (geen pijl)";
const SCHERM_ORDEN = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de kaarten blijven even liggen, met een rood rondje om de kaart die Bliepo noemt (nooit om het antwoord); daarna glijden ze terug (geen schudden, geen rood) en komt de opdracht opnieuw";

const kies3 = <T,>(lijst: T[], v: Vraag) => lijst[v.nr % lijst.length];

/** De hint: hoe je zoekt, vanaf een getal dat je ziet (een rood rondje om dat getal). 2 à 3 versies per soort (LESRECEPT, Tellen). */
export function hintVan(v: Vraag): string {
  const A = w(anker(v));
  const n = v.n ?? Number(v.goed);
  if (v.soort === "bij") return kies3([`Begin bij de ${A} en tel 1 streepje verder.`, `Zoek de ${A} op de lijn. Welk getal komt daarna?`, `Kijk naar de ${A}. Het raketje staat 1 streepje verder.`], v);
  if (v.soort === "natien") return `Het raketje is al voorbij de ${A}. Tel vanaf de ${A} 1 streepje verder.`;
  if (v.soort === "meer") return kies3(["Het getal dat je later zegt als je telt, is meer.", "Op de getallenlijn staat het getal dat meer is, verder naar rechts."], v);
  if (v.soort === "orden") return kies3(["Zoek steeds het kleinste getal dat nog over is.", "Er komt steeds 1 bij. Sla geen getal over."], v);
  if (v.soort === "wie") return kies3([`Begin bij de ${A} en tel streepje voor streepje ${n > anker(v) ? "verder" : "terug"} tot de ${w(n)}.`, `Zoek eerst de ${A}. Tel dan de streepjes ${n > anker(v) ? "verder" : "terug"} tot de ${w(n)}.`], v);
  if (v.soort === "dichtst") return kies3([`Tel bij elk getal hoeveel stapjes het naar de ${w(n)} is. Hoe minder stapjes, hoe dichterbij.`, `Hoe minder stapjes naar de ${w(n)}, hoe dichterbij.`], v);
  return kies3([`Kijk welk getal op de lijn het dichtst bij het raketje staat.`, `Zoek het getal op de lijn dat vlak bij het raketje staat.`], v);
}

/** Wat het rondje bij de hint aanwijst: het getal waar je vanaf telt (nooit het antwoord). */
function hintLicht(v: Vraag): Licht {
  /* Bij "ongeveer" noemt de hint geen getal (een rondje om de 10 zou bijna het antwoord aanwijzen): geen rondje. */
  if (v.soort === "bij" || v.soort === "natien" || v.soort === "wie") return { soort: "getal", n: anker(v) };
  return null;
}

/**
 * De fouttabel van 1 fout antwoord. Bliepo zegt alleen wat zeker is (BOUWREGELS 15.9): het getal staat vóór of na het
 * raketje, het staat niet op deze lijn, je slaat een streepje over, het ding staat vóór of na het getal, hoeveel stapjes
 * het van het doel af ligt. Hij noemt nooit het antwoord en nooit beide buren van het antwoord (Huisnummers, 10 nov).
 */
export function lijnFout(x: string, v: Vraag): Fout {
  const f = lijnFoutRuw(x, v);
  if (v.soort === "orden" || v.soort === "wie" || v.opties.length <= 2 || f.over.length > 1) return f;
  /*
    Verklapcontrole (15.17, geleerd bij Huisnummers): zou de eerste zin + hint maar 1 keuze overlaten (bij 17 / 18 / 8
    sluit "17 staat vóór het raketje, tel verder" ook de 8 uit), dan zegt Bliepo niet welke kant het op moet, alleen dat
    het raketje daar niet staat, en de hint geeft ook geen richting (LESRECEPT, geleerd bij Tellen). De denkfout wordt wel
    bewaard. Zo blijven er altijd 2 keuzes over.
  */
  const X = w(Number(x));
  return {
    ...f,
    eerste: kies3([`Bij de ${X} staat het raketje niet.`, `Het raketje staat niet bij de ${X}.`], v),
    hint: "Kijk recht onder het raketje. Tel de streepjes vanaf een getal dat je ziet.",
    over: v.opties.filter((k) => k !== x),
    weer: [],
    noot: "welke kant niet genoemd: dan bleef er maar 1 keuze over",
  };
}

function lijnFoutRuw(x: string, v: Vraag): Fout {
  const keuzes = v.soort === "orden" ? [] : v.opties;
  const andere = keuzes.filter((k) => k !== x);
  const hint = hintVan(v);
  const licht = hintLicht(v);
  const eigen = eigenInvulling(v);
  const g = Number(v.goed);

  if (v.soort === "bij") {
    const X = Number(x);
    const opLijn = X >= v.van! && X <= v.tot!;
    if (!opLijn)
      return {
        code: "tiental-vergeten",
        soort: "tiental",
        denkfout: `alleen het laatste cijfer (${X} voor ${g})`,
        eerste: `${w(X)} staat niet op deze lijn. Deze lijn begint bij de ${w(v.van!)}.`,
        hint,
        uitleg: "Het getal bij het raketje heeft 2 cijfers, net als de getallen ernaast.",
        weer: ["Je koos weer een getal dat niet op de lijn staat.", "Kijk naar de getallen vlak naast het raketje."],
        licht,
        scherm: SCHERM_KIES,
        over: andere.filter((k) => Number(k) >= v.van! && Number(k) <= v.tot!),
        eigen,
        bron: "eigen invulling (draaiboek §8: \"bij welk getal staat het\" zit niet in Count the Jumps)",
      };
    if (X === g - 1)
      return {
        code: "streepje-ervoor",
        soort: "ervoor",
        denkfout: `koos het getal van het streepje vóór het raketje (${X} voor ${g})`,
        eerste: kies3([`${w(X)} staat vlak vóór het raketje.`, `Bij de ${w(X)} is het raketje nog niet.`, `${w(X)} is het streepje vóór het raketje.`], v),
        hint,
        uitleg: `Het raketje staat 1 streepje verder dan de ${w(X)}.`,
        weer: ["Je koos weer het streepje vóór het raketje.", "Kijk recht onder het raketje."],
        licht,
        scherm: SCHERM_KIES,
        over: andere.filter((k) => Number(k) > X),
        eigen,
        bron: "eigen invulling; lijkt op draaiboek §3 C.4 (\"we willen weten hoe ver\")",
      };
    if (X === g + 1)
      return {
        code: "streepje-erna",
        soort: "erna",
        denkfout: `koos het getal van het streepje na het raketje (${X} voor ${g})`,
        eerste: kies3([`${w(X)} staat vlak na het raketje.`, `Zo ver als de ${w(X)} is het raketje nog niet.`, `${w(X)} is het streepje na het raketje.`], v),
        hint,
        uitleg: `Het raketje staat 1 streepje vóór de ${w(X)}.`,
        weer: ["Je koos weer het streepje na het raketje.", "Kijk recht onder het raketje."],
        licht,
        scherm: SCHERM_KIES,
        over: andere.filter((k) => Number(k) < X),
        eigen,
        bron: "eigen invulling; lijkt op draaiboek §3 B.3 (\"geen sprong van 1\")",
      };
    if (X > g)
      return {
        code: "te-ver",
        soort: "te-ver",
        denkfout: `keek te ver naar rechts (${X} voor ${g})`,
        eerste: `${w(X)} ligt verder dan het raketje.`,
        hint,
        uitleg: "Tel de streepjes vanaf een getal dat je ziet.",
        weer: ["Je koos weer een getal dat te ver ligt.", "Kijk recht onder het raketje."],
        licht,
        scherm: SCHERM_KIES,
        over: andere.filter((k) => Number(k) < X),
        eigen,
        bron: "eigen invulling",
      };
    return {
      code: "niet-ver-genoeg",
      soort: "niet-ver",
      denkfout: `keek niet ver genoeg (${X} voor ${g})`,
      eerste: `Het raketje staat verder dan de ${w(X)}.`,
      hint,
      uitleg: "Tel de streepjes vanaf een getal dat je ziet.",
      weer: ["Je koos weer een getal vóór het raketje.", "Kijk recht onder het raketje."],
      licht,
      scherm: SCHERM_KIES,
      over: andere.filter((k) => Number(k) > X),
      eigen,
      bron: "eigen invulling",
    };
  }

  if (v.soort === "natien") {
    const X = Number(x);
    if (X === g + 1)
      return {
        code: "streepje-overgeslagen",
        soort: "over",
        denkfout: `sloeg een streepje over (${X} na 10)`,
        eerste: `Met ${w(X)} sla je een streepje over.`,
        hint,
        uitleg: `Na de ${w(10)} komt eerst het getal dat 1 groter is.`,
        weer: ["Je sloeg weer een streepje over.", "Tel elk streepje mee."],
        licht,
        scherm: SCHERM_KIES,
        over: andere.filter((k) => Number(k) < X),
        eigen,
        bron: "eigen invulling; lijkt op draaiboek §3 B.3 (\"dat was geen sprong van 1\")",
      };
    if (X < 10)
      return {
        code: "tiental-vergeten",
        soort: "tiental",
        denkfout: `alleen het laatste cijfer (${X} voor ${g})`,
        eerste: `${w(X)} staat vooraan op de lijn, vlak na de ${w(0)}.`,
        hint,
        uitleg: "Na de 10 komen getallen met 2 cijfers.",
        weer: ["Je koos weer een getal van vooraan op de lijn.", `Het raketje is al voorbij de ${w(10)}.`],
        licht,
        scherm: SCHERM_KIES,
        over: andere.filter((k) => Number(k) > 10),
        eigen,
        bron: "eigen invulling",
      };
  }

  if (v.soort === "meer") {
    const X = Number(x);
    const ander = X === v.meer!.a ? v.meer!.b : v.meer!.a;
    if (X < ander)
      return {
        code: "kleiner-gekozen",
        soort: "kleiner",
        denkfout: `groter en kleiner verwisseld (${X} is minder dan ${ander})`,
        eerste: `${w(X)} zeg je eerder als je telt.`,
        hint,
        uitleg: "Hoe verder je komt als je telt, hoe meer het is.",
        weer: [],
        licht: null,
        scherm: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; geen rondje (op de lijn staan alleen 10, 15 en 20); dan de vraag in andere woorden",
        over: andere,
        eigen,
        bron: "eigen invulling (draaiboek §8: niet in Count the Jumps)",
        noot: "2 keuzes: na 1 fout blijft er altijd 1 over; Bliepo noemt alleen de regel, niet het antwoord",
      };
  }

  if (v.soort === "orden") {
    const goed = v.goed.split(",").map(Number);
    const xs = x.split(",").map(Number);
    const p = xs.findIndex((n, i) => n !== goed[i]);
    const kaarten = xs.slice(1);
    const aflopend = kaarten.every((n, i) => i === 0 || kaarten[i - 1] > n);
    if (aflopend)
      return {
        code: "volgorde-omgedraaid",
        soort: "omgedraaid",
        denkfout: "zette de kaarten van groot naar klein",
        eerste: `Na ${w(xs[0])} zette je ${w(xs[1])}, het grootste getal.`,
        hint,
        uitleg: "Van klein naar groot: het kleinste vooraan, dan steeds 1 groter.",
        weer: ["Je zette ze weer van groot naar klein.", "Begin met het kleinste getal."],
        licht: { soort: "vak", i: 1 },
        scherm: SCHERM_ORDEN,
        over: [],
        eigen,
        bron: "eigen invulling (draaiboek §8: op volgorde zetten zit niet in Count the Jumps)",
      };
    const a = xs[p - 1];
    const b = xs[p];
    if (b > a)
      return {
        code: "getal-overgeslagen",
        soort: "overgeslagen",
        denkfout: `sloeg na ${a} een getal over (${b})`,
        eerste: `Na ${w(a)} zette je ${w(b)}.`,
        hint,
        uitleg: `Na ${w(a)} komt het getal dat 1 groter is.`,
        weer: ["Je sloeg weer een getal over.", "Er komt steeds 1 bij."],
        licht: { soort: "vak", i: p },
        scherm: SCHERM_ORDEN,
        over: [],
        eigen,
        bron: "eigen invulling; lijkt op draaiboek §3 B.3 (\"spring steeds 1\")",
      };
    return {
      code: "kleiner-erna",
      soort: "kleiner-erna",
      denkfout: `zette na ${a} een kleiner getal (${b})`,
      eerste: `Na ${w(a)} zette je ${w(b)}. Dat is kleiner.`,
      hint,
      uitleg: "Van klein naar groot: elk getal is groter dan het getal ervoor.",
      weer: ["Je zette weer een kleiner getal erna.", "Elk volgend getal is groter."],
      licht: { soort: "vak", i: p },
      scherm: SCHERM_ORDEN,
      over: [],
      eigen,
      bron: "eigen invulling",
    };
  }

  if (v.soort === "wie") {
    const p = plekVan(v, x)!;
    const n = v.n!;
    const voor = p < n;
    return {
      code: voor ? "ding-ervoor" : "ding-erna",
      soort: voor ? "ervoor" : "erna",
      denkfout: `tikte op ${NAAM[x as Wezen]}, die bij ${p} staat (${voor ? "vóór" : "na"} de ${n})`,
      eerste: `${Naam(x as Wezen)} staat ${voor ? "vóór" : "na"} de ${w(n)}.`,
      hint,
      uitleg: `${Naam(x as Wezen)} staat bij de ${w(p)}. Dat is ${Math.abs(n - p)} ${Math.abs(n - p) === 1 ? "streepje" : "streepjes"} ${voor ? "vóór" : "na"} de ${w(n)}.`,
      weer: [`Je tikte weer op iets ${voor ? "vóór" : "na"} de ${w(n)}.`, `Tel de streepjes vanaf de ${w(anker(v))}.`],
      licht,
      scherm: SCHERM_WIE,
      over: andere.filter((k) => (voor ? plekVan(v, k)! > p : plekVan(v, k)! < p)),
      eigen,
      bron: "eigen invulling (draaiboek §8: \"wat staat er bij\" zit niet in Count the Jumps)",
    };
  }

  if (v.soort === "dichtst") {
    const X = Number(x);
    const d = Math.abs(X - v.n!);
    return {
      code: "verder-weg",
      soort: `verder-${X}`,
      denkfout: `koos een getal dat verder weg ligt (${X}: ${d} stapjes van ${v.n})`,
      eerste: kies3([`Van ${w(X)} naar de ${w(v.n!)} zijn het ${d} stapjes.`, `${w(X)} ligt ${d} stapjes van de ${w(v.n!)} af.`], v),
      hint,
      uitleg: `We tellen de stapjes op de getallenlijn.`,
      weer: [],
      licht: { soort: "bordje", n: X },
      scherm: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; een rood rondje om het bordje met het getal dat Bliepo noemt; dan de vraag in andere woorden en dezelfde keuzes terug",
      over: andere,
      eigen,
      bron: "eigen invulling; het tellen van de stapjes lijkt op draaiboek §3 E.3 (het verschil samen uitrekenen)",
    };
  }

  if (v.soort === "ongeveer") {
    const X = Number(x);
    let eerste: string;
    if (X - 15 === 1 || X - 10 === 1) eerste = `${w(X)} ligt vlak na de ${w(X - 1)}.`;
    else if (20 - X === 1 || 15 - X === 1) eerste = `${w(X)} ligt vlak vóór de ${w(X + 1)}.`;
    else if (X > 10 && X < 15) eerste = `${w(X)} ligt tussen de ${w(10)} en de ${w(15)}.`;
    else eerste = `${w(X)} ligt tussen de ${w(15)} en de ${w(20)}.`;
    return {
      code: "ander-stuk",
      soort: `stuk-${X}`,
      denkfout: `koos een getal in een ander stuk van de lijn (${X} voor ${g})`,
      eerste,
      hint,
      uitleg: `Het raketje staat vlak bij de ${w(anker(v))}.`,
      weer: [],
      licht,
      scherm: SCHERM_KIES,
      over: andere,
      eigen,
      bron: "eigen invulling (draaiboek §8: schatten zit niet in Count the Jumps)",
    };
  }

  return {
    code: "onduidelijk",
    soort: "onduidelijk",
    denkfout: "niet duidelijk (geen reden verzonnen)",
    eerste: "",
    hint,
    uitleg: "We springen samen over de lijn.",
    weer: [],
    licht,
    scherm: SCHERM_KIES,
    over: andere,
    eigen,
    bron: "BLIEPO-KARAKTER.md §10",
  };
}

/** Alle volgordes die een kind kan leggen (het eerste vak staat al vast). */
export function volgordes(v: Vraag): string[] {
  const k = v.opties.map(Number);
  const uit: string[] = [];
  const perm = (rest: number[], pad: number[]) => {
    if (!rest.length) uit.push([v.vakken![0], ...pad].join(","));
    rest.forEach((n, i) => perm([...rest.slice(0, i), ...rest.slice(i + 1)], [...pad, n]));
  };
  perm(k, []);
  return uit;
}

/** De fouttabel van een vraag: elk fout antwoord (bij op volgorde: elke foute volgorde). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  const lijst = v.soort === "orden" ? volgordes(v) : v.opties;
  return Object.fromEntries(lijst.filter((k) => k !== v.goed).map((k) => [k, lijnFout(k, v)]));
}

/* ---------- de uitlegvraag na Nee: "Hoeveel sprongen maakte het raketje?" (draaiboek stap 4.4, §3 C) ---------- */

export const UITLEG_VRAAG = { id: "uitleg-sprongen-3", goed: "3", opties: ["2", "3", "4"] };

/** De fouttabel van de uitlegvraag. 4 = de getallen 0, 1, 2 en 3 geteld in plaats van de sprongen (draaiboek §7, gezien en benoemd). */
export function uitlegFout(x: string): Fout {
  if (x === "4")
    return {
      code: "getallen-tellen-ipv-sprongen",
      soort: "getallen",
      denkfout: "telde de getallen (0, 1, 2 en 3) in plaats van de sprongen",
      eerste: "Je telde de getallen {0:wit}, {1:wit}, {2:wit} en {3:wit}. Dat zijn er {4:wit}.",
      hint: "Maar we tellen de sprongen. Elke boog is 1 sprong.",
      uitleg: "De {0:wit} is het begin. Daar sprong het raketje nog niet.",
      weer: ["Je telde weer de getallen.", "Tel alleen de bogen."],
      licht: { soort: "getal", n: 0 },
      scherm: "Bliepo's scherm 1,5 s rood; de knoppen weg; een rood rondje om de 0 (het begin); de bogen blijven staan; dan de vraag in andere woorden",
      over: ["2", "3"],
      eigen: false,
      bron: "draaiboek §3 C.3 en §7 `getallen-tellen-ipv-sprongen` (Synthesis benoemt dit: \"dat zijn 2 getallen, maar hoeveel sprongen?\")",
    };
  return {
    code: "te-weinig-bogen",
    soort: "te-weinig",
    denkfout: "telde een boog te weinig",
    eerste: "Er zijn meer bogen dan {2:wit}.",
    hint: "Tel elke boog, van de {0:wit} tot het raketje.",
    uitleg: "Elke boog is 1 sprong.",
    weer: ["Je telde weer te weinig bogen.", "Wijs elke boog aan."],
    licht: { soort: "getal", n: 0 },
    scherm: "Bliepo's scherm 1,5 s rood; de knoppen weg; een rood rondje om de 0 (het begin); de bogen blijven staan; dan de vraag in andere woorden",
    over: ["3", "4"],
    eigen: false,
    bron: "draaiboek §3 D.4 en §7 `een-te-weinig` (Synthesis: hulpvraag \"hoeveel sprongen?\")",
  };
}
