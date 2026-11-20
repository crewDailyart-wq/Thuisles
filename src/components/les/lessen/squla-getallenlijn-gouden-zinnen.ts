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
 * 18 november 2026 (Sara: Bliepo als warme juf, zoals de proefles Tellen): elke zin die terugkomt heeft varianten; de les
 * kiest met de gedeelde kiezer (nooit-dubbel.ts) nooit 2 keer achter elkaar dezelfde. Bij de 1e keer noemt Bliepo alleen
 * de kant ("verder", "te ver"), nooit "vlak voor" of "1 streepje" (15.17). Oud naast nieuw:
 * WIJZIGINGEN-ZINNEN-GETALLENLIJN.md. Geen andere les gebruikt dit bestand.
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
/** Een getal dat het aantal sterren is (het verhaaltje bij "wat is meer"): de kleur van de sterren in beeld, geel (BOUWREGELS 2.1 en 14.27; Sara 12 november 2026). */
export const ster = (n: number) => `{${n}:geel}`;

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
  { nr: 5, id: "vraag5-meer-14", soort: "meer", goed: "14", opties: ["14", "13"], van: 10, tot: 20, labels: [10, 15, 20], meer: { a: 13, b: 14, verhaal: ["Het raketje zoekt graag sterren.", `Gisteren vond het er ${ster(13)}.`, `Vandaag vond het er ${ster(14)}.`] } },
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

export const NAAM: Record<Wezen, string> = { raketje: "het raketje", ufo: "de ufo", satelliet: "het ruimteschip" };
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
/** "Die" of "dat" voor een ding: de ufo = die; het raketje en het ruimteschip (id `satelliet`, 19 nov 2026) = dat. */
const die = (z: Wezen) => (z === "raketje" || z === "satelliet" ? "Dat" : "Die");
/** Volgt deze vraag op een vraag van dezelfde soort? Dan klinkt de vraag net anders (nooit 2 keer precies dezelfde zin). */
const vervolg = (v: Vraag) => VRAGEN[v.nr - 2]?.soort === v.soort;

/**
 * ALLE ZINNEN IN VARIANTEN (Sara, 18 november 2026: Bliepo als warme juf, zoals de proefles Tellen). Elke situatie die
 * terugkomt heeft een rijtje; de les kiest er steeds 1 met de gedeelde kiezer (nooit-dubbel.ts): nooit 2 keer achter
 * elkaar dezelfde zin, ook niet over vragen heen. Een rijtje van rijtjes (string[][]) = varianten die uit meer stukken
 * bestaan (elk stuk is 1 zin in het tekstvak). De vragen zelf hebben geen varianten: dezelfde soort vraag heet overal
 * hetzelfde (BOUWREGELS 3.11). Oud naast nieuw: WIJZIGINGEN-ZINNEN-GETALLENLIJN.md.
 */
export const ZIN = {
  /**
   * Stap 3: "laten zien wat je weet?" (draaiboek: ja = proef, nee = uitleg). Groet en startvraag zijn 1 stuk (Sara,
   * 10 nov). Uitlegdeel en persoonlijke vraag (BOUWREGELS 4.4); Ja = beginnen, Nee = samen oefenen. "Weet jij al hoe dat
   * gaat?" was vaag (BOUWREGELS 15.36); de vertaalde Synthesis-vraag is sinds 19 nov 2026 een eigen zin (15.41). Niet
   * langer dan de eerste versie (79 tekens): met de groet erboven moet het in het tekstvak passen (15.30).
   */
  start: [
    "We zoeken bij welk getal het raketje staat. Kun jij dat al?",
    "Vandaag zoeken we het getal bij het raketje. Wil je het eerst zelf proberen?",
  ],
  proefBegin: ["Laat maar zien!", "Toe maar, laat maar zien!", "Fijn! Laat maar zien wat je kunt."],
  proefGoed: ["Dat gaat goed! We gaan verder.", "Je kunt het al goed. We gaan door.", "Dat gaat al heel goed. Kom, we gaan verder."],
  proefLastig: [
    ["Dit is nog een beetje lastig. Geeft niks!", "We oefenen eerst samen."],
    ["Dat is ook nog nieuw voor je. Geeft niks.", "We bekijken het eerst samen."],
    ["Dat is nog best moeilijk, hè?", "Kom, we oefenen eerst samen."],
  ],
  /** Stap 4: de uitleg (4.5: samen beginnen, 1 ding uitleggen en laten zien, kleine stap, vraag, waarom, minder hulp). */
  samenBeginnen: ["Fijn, ik help je op weg.", "Goed dat je het zegt. Ik help je.", "Dan doen we het eerst samen. Ik help je."],
  uitlegLijn: [
    ["Dit is een getallenlijn.", "Bij elk streepje hoort een getal."],
    ["Kijk, dit is een getallenlijn.", "Elk streepje heeft zijn eigen getal."],
  ],
  uitlegStart: ["Het raketje begint bij de {0:wit}.", "Kijk, hier begint het raketje: bij de {0:wit}."],
  /** De opdracht zegt wat het kind doet en waar (15.36; was: "Tik steeds op het getal ernaast."). */
  uitlegSpring: [
    ["Laat het raketje springen tot de {3:wit}.", "Tik steeds op het volgende getal."],
    ["We laten het raketje springen tot de {3:wit}.", "Tik steeds op het getal dat daarna komt."],
  ],
  uitlegSpringHand: ["Tik op dit getal.", "Tik maar op dit getal.", "Hier springt het raketje heen. Tik erop."],
  /**
   * Springen: een sprong overslaan (draaiboek §3 B.3: "dat was geen sprong van 1"; B.5: "het hele stuk in één sprong").
   * De les wacht daarna op het kind: elke variant eindigt daarom met wat het kind doet (F16, BOUWREGELS 15.37; was:
   * "Het raketje springt steeds 1 streepje.", dat is geen opdracht).
   */
  uitlegOverslaan: [
    ["Dat is te ver voor 1 sprong.", "Tik op het getal vlak naast het raketje."],
    ["Zo ver springt het raketje niet in 1 keer.", "Tik op het volgende getal."],
  ],
  uitlegOverslaanWeer: [
    ["Het raketje springt steeds 1 streepje. Tik op het volgende getal."],
    ["Elke sprong is 1 streepje. Tik op het getal vlak naast het raketje."],
  ],
  uitlegHeleStuk: [
    ["Je tikte meteen op het eind.", "Het raketje maakt kleine sprongen. Tik op het volgende getal."],
    ["Daar wil het raketje straks heen. Nu nog niet.", "Tik eerst op het getal vlak naast het raketje."],
  ],
  uitlegSpringZelf: ["Kijk, zo springt het raketje: steeds 1 streepje verder.", "Kijk, ik laat het zien. Het raketje springt steeds 1 streepje verder."],
  uitlegVraag: "Hoeveel sprongen maakte het raketje?",
  uitlegVraagOpnieuw: "Hoeveel bogen zie je?",
  /** Stap 5 van 4.5: bevestigen en uitleggen waarom. Het getal 3 staat er 1 keer in (was: "… sprong 3 keer vanaf de 0. Daarom staat het bij de 3."). */
  uitlegWaarom: [
    "Het raketje sprong {3:wit} keer vanaf de {0:wit}. Daarom staat het nu bij dat getal.",
    "Elke boog is 1 sprong. Het raketje sprong {3:wit} keer vanaf de {0:wit}.",
    "Het raketje maakte {3:wit} sprongen vanaf de {0:wit}. Kijk maar naar de bogen.",
  ],
  /** 2e keer mis bij de uitlegvraag: samen de bogen tellen. */
  uitlegSamen: ["Kom, we tellen de bogen samen.", "Weet je wat? We tellen de bogen samen.", "Geeft niks. We tellen de bogen samen.", "Ik help je even. We tellen de bogen samen."],
  uitlegSamenTel: (k: number) => `${w(k)}.`,
  /** Na "1. 2. 3.": het getal niet nog een keer (was: "Dat zijn 3 sprongen."). */
  uitlegSamenKlaar: ["Zoveel sprongen maakte het raketje.", "Zo vaak sprong het raketje.", "Zoveel bogen zijn het. Elke boog is 1 sprong."],
  uitlegSamenStap: ["Tik jij op de {3:wit}?", "Tik jij de {3:wit} aan?"],
  uitlegSamenHand: ["Tik op de {3:wit}.", "Tik maar op de {3:wit}."],
  /** Na de kleine stap (het kind tikte de 3 aan); na het vangnet zonder "Ja". */
  uitlegSamenNa: ["Ja, zo ver sprong het raketje.", "Ja, daar staat het raketje nu.", "Precies, tot daar sprong het raketje."],
  uitlegSamenZelf: ["Kijk, zo ver sprong het raketje.", "Kijk, daar staat het raketje nu."],
  /** Stap 6 van 4.5: met minder hulp verder. */
  nuJij: ["Nu jij! Kijk goed naar de getallen naast het raketje.", "Nu mag jij het proberen. De getallen naast het raketje helpen je.", "Probeer jij het nu maar. Kijk goed naar de getallen naast het raketje."],

  /**
   * De vraag van de oude les; dezelfde soort vraag = dezelfde schooltermen (3.11). Niet 2 keer na elkaar precies
   * dezelfde zin (F7): volgt een vraag op een vraag van dezelfde soort, dan klinkt hij net anders ("nu", "ook deze"),
   * zoals een juf dat doet (geen los "En" aan het begin, 19 nov 2026).
   */
  vraag: (v: Vraag): string[] => {
    if (v.vraagzin) return v.vraagzin;
    if (v.soort === "bij") return [v.nr === 2 ? "Bij welk getal staat het raketje nu?" : "Bij welk getal staat het raketje?"];
    /* Het getal 10 staat er 1 keer in (was: "… verder dan de 10. Welk getal komt na 10?"). */
    if (v.soort === "natien") return [`Het raketje vliegt verder dan de ${w(10)}.`, "Welk getal komt daarna?"];
    if (v.soort === "meer") return [...v.meer!.verhaal, `Wat is meer: ${ster(v.meer!.a)} of ${ster(v.meer!.b)}?`];
    if (v.soort === "orden") return [vervolg(v) ? "Zet ook deze getallen op volgorde." : "Zet de getallen op volgorde.", "Van klein naar groot."];
    /* 19 nov 2026 (keuring Vormen, 15.36; geldt voor alle lessen): geen los "En" aan het begin van een vraag. Was: "En wat
       staat er bij …?" en "En welk getal ligt het dichtst bij …?". */
    if (v.soort === "wie") return [`${vervolg(v) ? "Wat staat er nu" : "Wat staat er"} bij ${w(v.n!)}?`, "Tik erop."];
    if (v.soort === "dichtst") return [`${vervolg(v) ? "Welk getal ligt nu" : "Welk getal ligt"} het dichtst bij ${w(v.n!)}?`];
    return [vervolg(v) ? "Bij welk getal staat het raketje nu ongeveer?" : "Bij welk getal staat het raketje ongeveer?"];
  },
  /** Op volgorde, de eerste keer: hoe het werkt (3.15: 1 keer per les uitleggen). */
  ordenHoe: "Sleep een kaart naar een vak. Of tik op een kaart.",
  /** Een nieuwe poging na de hint: de vraag in andere woorden (3.23). Zo staat er altijd een vraag of opdracht (F16). */
  opnieuw: (v: Vraag): string[] => {
    if (v.soort === "bij") return ["Welk getal hoort bij het raketje?", "Bij welk getal staat het raketje, denk je?"];
    if (v.soort === "natien") return [`Welk getal komt er na ${w(10)}?`, `Wat komt er na de ${w(10)}?`];
    if (v.soort === "meer") return [`Welk getal is meer: ${w(v.meer!.a)} of ${w(v.meer!.b)}?`, `Wat is meer, denk je: ${w(v.meer!.a)} of ${w(v.meer!.b)}?`];
    if (v.soort === "orden") return ["Zet de kaarten nu op volgorde.", "Zet de kaarten van klein naar groot.", "Probeer het nog eens. Zet de kaarten op volgorde."];
    if (v.soort === "wie") return [`Tik op wat er bij ${w(v.n!)} staat.`, `Wat staat er bij de ${w(v.n!)}? Tik erop.`];
    if (v.soort === "dichtst") return [`Welk getal ligt het dichtst bij de ${w(v.n!)}?`, `Welk getal ligt het dichtst bij de ${w(v.n!)}, denk je?`];
    return ["Welk getal hoort ongeveer bij het raketje?", "Bij welk getal staat het raketje ongeveer, denk je?"];
  },
  /**
   * Op volgorde: het hulphandje wijst het eerste lege vak aan (nooit de goede kaart, 15.17). De zin komt in Bliepo's
   * tekstvak terwijl de les op het kind wacht, dus hij zegt wat het kind doet (F16, Sara 18 november 2026; BOUWREGELS
   * 15.37). Eerst: "Hier komt een kaart."
   */
  ordenHand: ["Sleep een kaart naar dit vak.", "Sleep maar een kaart naar dit vak.", "Hier mag een kaart liggen. Sleep hem erheen."],

  /** 2e fout: samen voordoen (draaiboek §3 E.3 en F.3: de getallen vastzetten, samen springen, 1 per keer). */
  samen: (v: Vraag): string[] =>
    v.soort === "orden"
      ? ["Kom, we leggen ze samen.", "Weet je wat? We leggen ze samen.", "Geeft niks. We leggen ze samen neer.", "Ik help je even. We leggen ze samen."]
      : v.soort === "dichtst"
        ? ["Kom, we zetten de getallen op de lijn.", "Weet je wat? We zetten de getallen op de lijn.", "Geeft niks. We zetten ze samen op de lijn.", "Ik help je even. We zetten de getallen op de lijn."]
        : ["Kom, we springen samen.", "Weet je wat? We springen samen.", "Geeft niks. We springen samen.", "Ik help je even. We springen samen over de lijn."],
  /** Bij "ongeveer" eerst: alle streepjes komen erbij. */
  samenStreepjes: ["Ik zet alle streepjes erbij.", "Kijk, ik zet alle streepjes erbij."],
  samenBegin: (v: Vraag): string[] => {
    const s = sprongStart(v);
    /* Het rondje staat om het getal waar de sprongen beginnen: Bliepo noemt dat getal (was: "Hier is de 20."). */
    if (v.soort === "dichtst") return [`We springen van de ${w(s)} naar de ${w(v.n!)}.`, `Kijk, we springen van de ${w(s)} naar de ${w(v.n!)}.`];
    if (v.soort === "meer") return [`Hier staat de ${w(s)}.`, `Kijk, hier is de ${w(s)}.`];
    return [`Ik begin bij de ${w(s)}.`, `We beginnen bij de ${w(s)}.`, `Kijk, we starten bij de ${w(s)}.`];
  },
  samenSprong: (k: number) => `${w(k)}.`,
  samenTelSprong: (k: number) => `${w(k)}.`,
  /** Bij het doel: het getal komt erbij (nu pas het antwoord in beeld, 15.11). Elk getal staat er 1 keer in. */
  samenDoel: (v: Vraag): string[] => {
    const n = Number(v.goed);
    if (v.soort === "bij" || v.soort === "natien" || v.soort === "ongeveer") return [`Hier staat het raketje: bij de ${w(n)}.`, `En hier staat het raketje: bij de ${w(n)}.`, `Kijk, bij de ${w(n)} staat het raketje.`];
    if (v.soort === "wie") return [`Bij de ${w(v.n!)} staat ${NAAM[v.goed as Wezen]}.`, `Kijk, bij de ${w(v.n!)} staat ${NAAM[v.goed as Wezen]}.`, `Hier is de ${w(v.n!)}. Daar staat ${NAAM[v.goed as Wezen]}.`];
    /* Was: "De 14 komt 1 verder. Dus 14 is meer." (het getal 2 keer achter elkaar). */
    if (v.soort === "meer") return [`De ${w(v.meer!.b)} komt 1 sprong verder. Dat getal is dus meer.`, `Daarna komt ${w(v.meer!.b)}. Wat later komt, is meer.`];
    if (v.soort === "dichtst") {
      /* De 2 getallen zijn net gezegd ("We springen van de 18 naar de 20."): hier alleen het aantal sprongen. */
      const d = Math.abs(n - v.n!);
      return d === 1 ? ["Dat is maar 1 sprong. De andere getallen liggen verder weg.", "Het is maar 1 sprong. Dichterbij kan niet."] : [`Dat zijn maar ${d} sprongen. De andere getallen liggen verder weg.`, `Het zijn maar ${d} sprongen. Dat is het dichtst bij.`];
    }
    return [];
  },
  /** Op volgorde: de 1e kaart "Na 5 komt 6.", daarna "En dan komt 7." (was 2 keer "Na … komt …": het getal 2 keer achter elkaar). */
  samenOrden: (a: number, b: number, eerste: boolean): string[] => (eerste ? [`Na ${w(a)} komt ${w(b)}.`, `Eerst de ${w(b)}: die komt na ${w(a)}.`] : [`En dan komt ${w(b)}.`, `Daarna komt ${w(b)}.`]),
  /**
   * De kleine stap van het kind (15.11). Het getal is net gezegd ("Hier staat het raketje: bij de 6."), dus de vraag
   * noemt het niet nog een keer; bij "meer" en "dichtst" stonden er 2 getallen in de zin ervoor, daar wel.
   */
  samenStap: (v: Vraag): string[] => {
    if (v.soort === "orden") {
      const n = w(Number(v.goed.split(",").at(-1)));
      return [`Sleep jij de ${n} naar het laatste vak?`, `Nu de ${n} nog. Sleep jij hem naar het laatste vak?`];
    }
    if (v.soort === "wie") return ["Tik jij erop?", "Wil jij erop tikken?"];
    if (v.soort === "meer" || v.soort === "dichtst") return [`Tik jij op de ${w(Number(v.goed))}?`, `Tik jij de ${w(Number(v.goed))} aan?`];
    return ["Tik jij op dat getal?", "Tik jij dat getal aan?"];
  },
  samenHand: (v: Vraag): string[] => {
    if (v.soort === "orden") {
      const n = w(Number(v.goed.split(",").at(-1)));
      return [`Sleep de ${n} hierheen.`, `Sleep de ${n} maar hierheen.`];
    }
    if (v.soort === "wie") return [`Tik op ${NAAM[v.goed as Wezen]}.`, `Tik maar op ${NAAM[v.goed as Wezen]}.`];
    return [`Tik op de ${w(Number(v.goed))}.`, `Tik maar op de ${w(Number(v.goed))}.`];
  },
  samenKlaar: (v: Vraag): string[] => {
    const n = Number(v.goed);
    if (v.soort === "orden") return ["Ja, nu staan ze op volgorde.", "Ja, zo gaan ze van klein naar groot.", "Precies, nu liggen ze goed."];
    if (v.soort === "wie") return [`Ja, ${NAAM[v.goed as Wezen]} staat bij de ${w(v.n!)}.`, `Precies, daar staat ${NAAM[v.goed as Wezen]}.`];
    if (v.soort === "meer") return [`Ja, ${w(n)} is meer.`, `Precies, ${w(n)} is meer dan ${w(v.meer!.a)}.`];
    if (v.soort === "dichtst") return [`Ja, ${w(n)} ligt het dichtst bij.`, `Precies, ${w(n)} ligt het dichtst bij de ${w(v.n!)}.`];
    if (v.soort === "natien") return [`Ja, dat is de ${w(n)}.`, `Ja, na de ${w(10)} komt de ${w(n)}.`, "Precies, daar staat het raketje."];
    return [`Ja, dat is de ${w(n)}.`, `Ja, bij de ${w(n)} staat het raketje.`, "Precies, daar staat het raketje."];
  },
  /** Na het vangnet (Bliepo deed de stap zelf): geen "Ja" alsof het kind het deed (keuring Meer-minder, 10 nov). */
  samenZelf: (v: Vraag): string[] => {
    const n = Number(v.goed);
    if (v.soort === "orden") return ["Kijk, nu staan ze op volgorde.", "Ik leg de laatste kaart neer. Nu staan ze op volgorde."];
    if (v.soort === "wie") return [`Kijk, hier staat ${NAAM[v.goed as Wezen]}.`, `Ik wijs het even aan. Hier staat ${NAAM[v.goed as Wezen]}.`];
    return [`Kijk, hier is de ${w(n)}.`, `Ik wijs hem even aan. Hier is de ${w(n)}.`];
  },
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: string, v: Vraag): string[] =>
    v.soort === "orden"
      ? ["Je legde ze weer zo neer.", "Ze liggen weer net zo, zie ik."]
      : v.soort === "wie"
        ? [`Je tikte weer op ${NAAM[x as Wezen]}.`, `Weer ${NAAM[x as Wezen]}, zie ik.`]
        : [`Je koos weer ${w(Number(x))}.`, `Je tikte weer op ${w(Number(x))}.`, `Weer ${w(Number(x))}, zie ik.`],
  /** Stap 7.5: einde. */
  slot: ["Je weet nu waar het raketje staat op de getallenlijn.", "Goed gewerkt! Je kent de getallenlijn al goed.", "Knap, hoor! Jij vindt het raketje op de getallenlijn."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  raketWoord,
};

/** Aanmoediging bij het hulphandje (het kind moet slepen of tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/** De woorden die in dezelfde zin wisselen (voor de kiezer: "Je tikte weer op de ufo." = "Je tikte weer op het raketje."). */
export const WISSELWOORDEN = ["het raketje", "de ufo", "het ruimteschip"];

/**
 * Reactie na de lof (BLIEPO-KARAKTER.md §4 Getallenlijn, zin 26 t/m 30, plus zinnen zonder "Ja").
 * Index 0 en 1 beginnen met "Ja", 2 en 3 niet, 4 is de robotzin (hooguit 1 keer per les), 5 en 6 zijn erbij sinds
 * 18 november 2026 ("Precies" is van Synthesis; "Dat klopt").
 */
export function lijnReactie(v: Vraag): Rijtje {
  const g = Number(v.goed);
  const G = w(g);
  if (v.soort === "bij")
    return rij([`Ja, het raketje staat bij de ${G}.`, `Ja, na de ${w(g - 1)} komt de ${G}.`, `Het raketje staat bij de ${G}.`, `Na de ${w(g - 1)} komt de ${G}.`, `Zie je, de ${G} hoort bij het raketje.`, `Precies, het raketje staat bij de ${G}.`, `Dat klopt: na de ${w(g - 1)} komt de ${G}.`], [4]);
  if (v.soort === "natien")
    return rij([`Ja, na de ${w(10)} komt de ${w(11)}.`, "Ja, de lijn gaat gewoon door.", `Na de ${w(10)} komt de ${w(11)}.`, `De lijn gaat door: ${w(11)}.`, `Zie je, na de ${w(10)} tel je verder: ${w(11)}.`, `Precies, na de ${w(10)} komt de ${w(11)}.`, `Dat klopt: de lijn telt gewoon verder.`], [4]);
  if (v.soort === "meer")
    return rij([`Ja, ${G} is meer dan ${w(v.meer!.a)}.`, `Ja, ${G} zeg je later als je telt.`, `${G} is meer dan ${w(v.meer!.a)}.`, `${G} komt na ${w(v.meer!.a)}.`, `Zie je, ${G} is het grootst.`, `Precies, ${G} is meer dan ${w(v.meer!.a)}.`, `Dat klopt: ${G} komt later als je telt.`], [4]);
  if (v.soort === "orden") {
    const r = v.goed.split(",").map((n) => w(Number(n))).join(", ");
    return rij([`Ja, van klein naar groot: ${r}.`, "Ja, er komt steeds 1 bij.", `Van klein naar groot: ${r}.`, "Er komt steeds 1 bij.", "Zie je, elk getal is 1 meer dan het vorige.", "Precies, er komt steeds 1 bij.", `Dat klopt: ${r}.`], [4]);
  }
  if (v.soort === "wie") {
    const z = v.goed as Wezen;
    return rij([`Ja, ${NAAM[z]} staat bij de ${w(v.n!)}.`, `Ja, daar is de ${w(v.n!)}.`, `${Naam(z)} staat bij de ${w(v.n!)}.`, `Bij de ${w(v.n!)} staat ${NAAM[z]}.`, `Zie je, ${NAAM[z]} hoort bij de ${w(v.n!)}.`, `Precies, ${NAAM[z]} staat bij de ${w(v.n!)}.`, `Dat klopt: bij de ${w(v.n!)} staat ${NAAM[z]}.`], [4]);
  }
  if (v.soort === "dichtst") {
    const d = Math.abs(g - v.n!);
    /* Sara 20 november 2026: bij een goed antwoord staan alleen de 3 bordjes in beeld, geen lijn en geen bogen. Dus
       "tellen", net als de hints (was: "18 ligt maar 2 sprongen van de 20 af."). */
    const tel = `tel je maar ${d} ${g < v.n! ? "verder" : "terug"} tot de ${w(v.n!)}`;
    return rij([`Ja, van ${G} ${tel}.`, `Ja, ${G} ligt het dichtst bij de ${w(v.n!)}.`, `Van ${G} ${tel}.`, `${G} ligt het dichtst bij de ${w(v.n!)}.`, `Zie je, geen getal ligt dichter bij de ${w(v.n!)}.`, `Precies, ${G} ligt het dichtst bij de ${w(v.n!)}.`, `Dat klopt: van ${G} ${tel}.`], [4]);
  }
  const a = anker(v);
  const kant = g > a ? "na" : "voor";
  return rij([`Ja, het raketje staat ongeveer bij de ${G}.`, `Ja, vlak ${kant} de ${w(a)}.`, `Het raketje staat ongeveer bij de ${G}.`, `Vlak ${kant} de ${w(a)} staat de ${G}.`, `Zie je, de ${G} ligt het dichtst bij het raketje.`, `Precies, het raketje staat ongeveer bij de ${G}.`, `Dat klopt: vlak ${kant} de ${w(a)} staat de ${G}.`], [4]);
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
  /** Uitleg na de 2e fout: de hele reactie (daarna meteen samen voordoen; dan mag het antwoord in beeld, 15.11). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
  weer: string[];
  /** Wat Bliepo bij de hint aanwijst met het rode rondje (alleen als hij het getal ook noemt, nooit het antwoord; 7.8, 15.17). */
  licht: Licht;
  scherm: string;
  /** Welke keuzes de eerste zin en de hint nog toelaten (verklapcontrole van het script, 15.17). */
  over: string[];
  /** Eigen invulling, niet van Synthesis (15.22 punt 5). */
  eigen: boolean;
  /** Waar Synthesis deze reactie heeft (draaiboek). */
  bron: string;
  /** Waarom Bliepo geen richting noemt, of waarom er na de eerste zin maar 1 keuze over is (alleen bij 2 keuzes). */
  noot?: string;
  /** Alle varianten (18 november 2026); `eerste`, `hint`, `uitleg` en `weer` hierboven zijn er 1 van (voor de fouttabel). */
  v?: Varianten;
};

/**
 * Alle varianten bij 1 fout antwoord; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde).
 *   eerste      1e keer: wat het kind koos (met de richting als dat niets verklapt);
 *   hint        1e keer: hoe je zoekt, nooit het antwoord; daarna komt de vraag in andere woorden terug;
 *   uitleg      2e keer met een ander antwoord: de hele reactie (elk getal staat er hooguit 1 keer in);
 *   uitlegLos   2e keer met hetzelfde antwoord: komt na "Je koos weer …", dus zonder dat getal;
 *   weerEerste / weerUitleg   2 keer dezelfde denkfout (en Bliepo noemde hem de 1e keer al).
 */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; uitlegLos: string[]; weerEerste: string[]; weerUitleg: string[] };

/** Zonder kleurcode: {12:wit} wordt 12. */
export const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
/** De getallen in een zin. */
export const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
/** Noemen 2 zinnen hetzelfde getal? (Een getal klinkt niet 2 keer achter elkaar.) */
export const deeltGetal = (a: string, b: string) => {
  const A = new Set(getallenIn(a));
  return getallenIn(b).some((n) => A.has(n));
};
/** Woorden waarmee Bliepo zegt dat het bijna goed was. Alleen als er dan nog 2 keuzes dichtbij zijn (15.17). */
export const NABIJ = /dichtbij|bijna|iets (te ver|verder)/i;
/** Zo lang mag 1 reactie (eerste zin + hint, of de uitleg) zijn: dan past hij in het tekstvak (15.30). */
export const MAX_REACTIE = 125;

/** Hoe lang een stuk tekst op het scherm is (zonder de kleurcodes). */
export const lengte = (...zinnen: string[]) => kaal(zinnen.join(" ")).length;
/**
 * Alleen de varianten die met de rest van de reactie in het tekstvak passen (een harde eis: die haal je vooraf uit de
 * lijst, want de kiezer laat "nooit 2 keer dezelfde" voorgaan op een wens). Past er geen, dan de kortste.
 */
export const passend = (zinnen: readonly string[], ...rest: string[]): string[] => {
  const over = zinnen.filter((z) => lengte(...rest, z) <= MAX_REACTIE);
  return over.length ? over : [[...zinnen].sort((a, b) => lengte(a) - lengte(b))[0]];
};
/** Alleen de varianten die geen getal uit de zin ervoor herhalen (ook een harde eis; is er geen, dan allemaal). */
export const zonderGetalUit = (zinnen: readonly string[], ervoor: string): string[] => {
  const over = zinnen.filter((z) => !deeltGetal(ervoor, z));
  return over.length ? over : [...zinnen];
};
/** De kiezer van de les (nooit-dubbel.ts): kiest 1 zin uit een rijtje, nooit 2 keer achter elkaar dezelfde. */
export type Kies = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;
/** Het begin van een zin (de eerste 2 woorden), om niet 2 keer achter elkaar "Je koos …" te zeggen. */
const begin = (z: string) => kaal(z).toLowerCase().replace(/\d+/g, "#").split(/[.!?,:]/)[0].trim().split(/\s+/).slice(0, 2).join(" ");

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is, uit de varianten. De les en het fouttabel-script gebruiken allebei
 * deze functie, zodat het script precies naspeelt wat de les doet.
 *   1e keer: eerste zin (wat het kind koos) + hint. De hint past in het tekstvak en herhaalt geen getal uit de eerste zin.
 *   2e keer: de uitleg (1 reactie, elk getal hooguit 1 keer); of, bij 2 keer dezelfde denkfout, "weer" + een andere
 *   uitleg; of, bij hetzelfde antwoord 2 keer, "Je koos weer …" + de uitleg zonder dat getal.
 */
export function foutReactie(kies: Kies, f: Fout, poging: 1 | 2, eerder: Fout | null, zelfdeAntwoord: boolean, eersteZin: string, weerGekozen: string[]): string[] {
  const v = f.v!;
  if (poging === 1) {
    const eerste = kies("eerste", v.eerste);
    return [eerste, kies("hint", passend(zonderGetalUit(v.hint, eerste), eerste))];
  }
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  if (eerder !== null && eerder.soort === f.soort && !eerder.noot && !f.noot && v.weerEerste.length > 0) {
    const weer = kies("weer", v.weerEerste);
    return [weer, kies("weerUitleg", passend(zonderGetalUit(v.weerUitleg, weer), weer))];
  }
  /* Hetzelfde antwoord 2 keer: "Je koos weer …" en de uitleg zonder dat getal. */
  if (zelfdeAntwoord) {
    const weer = kies("weerGekozen", weerGekozen);
    return [weer, kies("uitlegLos", passend(zonderGetalUit(v.uitlegLos, weer), weer))];
  }
  /* Een ander antwoord: de uitleg, liefst met een ander begin dan de eerste zin bij deze vraag ("Je koos …" 2 keer). */
  return [kies("uitleg", passend(v.uitleg), (z) => begin(z) !== begin(eersteZin))];
}

const SCHERM_KIES = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; een rood rondje om het getal dat Bliepo noemt (nooit om het antwoord); dan de vraag in andere woorden en dezelfde keuzes terug (geen pijl)";
const SCHERM_WIE = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om het getal op de lijn dat Bliepo noemt; dan de vraag in andere woorden (geen pijl)";
const SCHERM_ORDEN = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de kaarten blijven even liggen, met een rood rondje om de kaart die Bliepo noemt (nooit om het antwoord); daarna glijden ze terug (geen schudden, geen rood) en komt de opdracht opnieuw";

/** De vaste variant voor de fouttabel (per vraag een andere, zodat de tabel ze allemaal laat zien). */
const vast = <T,>(lijst: T[], v: { nr: number }) => lijst[v.nr % lijst.length];

/**
 * Het getal waar de hint vanaf telt bij "bij welk getal": het grootste getal op de lijn voor het raketje dat geen keuze
 * is die nog over is (en niet het getal dat het kind koos). Zou de hint een keuze noemen ("Kijk naar de 5." terwijl 5 en 6 nog over zijn), dan valt die keuze
 * af en blijft er maar 1 over (15.17). Het getal dat het kind zelf koos mag wel: dat is al afgevallen.
 */
export function hintAnker(v: Vraag, over: string[], x?: string): number {
  if (v.soort !== "bij") return anker(v);
  const g = Number(v.goed);
  /* Ook niet het getal dat het kind net koos: dat zegt Bliepo al in de eerste zin (een getal klinkt niet 2 keer achter elkaar). */
  const kan = (v.labels ?? []).filter((n) => n < g && !over.includes(String(n)) && String(n) !== x);
  return kan.length ? Math.max(...kan) : anker(v);
}

/** Hints zonder getal en zonder richting bij "bij welk getal" (ook voor als Bliepo geen richting mag noemen). */
const HINT_BIJ_KAAL = ["Kijk recht onder het raketje. Tel de streepjes vanaf een getal dat je ziet.", "Zoek een getal dat je ziet. Tel vanaf daar de streepjes tot het raketje.", "Probeer het nog eens. Tel de streepjes tot het raketje."];

/**
 * De hints: hoe je zoekt, vanaf een getal dat je ziet (een rood rondje om dat getal als Bliepo het noemt). Een hint zegt
 * nooit hoeveel streepjes het is (was: "Begin bij de 5 en tel 1 streepje verder.": dat is bijna het antwoord, 15.17). Elk
 * rijtje heeft een hint zonder getal, zodat een getal niet 2 keer achter elkaar klinkt.
 */
export function hintsVan(v: Vraag, over: string[] = [], x?: string): string[] {
  const n = v.n ?? Number(v.goed);
  if (v.soort === "bij") {
    const A = w(hintAnker(v, over, x));
    return [`Kijk naar de ${A}. Tel vanaf daar de streepjes tot het raketje.`, `Zoek de ${A} op de lijn. Tel vanaf daar de streepjes tot het raketje.`, `Begin bij de ${A}. Tel de streepjes tot je bij het raketje bent.`, "Probeer het nog eens. Tel de streepjes vanaf een getal dat je ziet.", "Zoek een getal dat je ziet. Tel vanaf daar de streepjes tot het raketje."];
  }
  const A = w(anker(v));
  if (v.soort === "natien") return [`Het raketje is al voorbij de ${A}. Tel vanaf daar de streepjes.`, `Zoek de ${A} op de lijn. Tel de streepjes tot het raketje.`, `Na de ${A} gaat de lijn gewoon door. Tel verder vanaf dat getal.`, "Probeer het nog eens. Tel de streepjes vanaf het laatste getal dat je ziet."];
  if (v.soort === "meer") return ["Het getal dat je later zegt als je telt, is meer.", "Op de getallenlijn staat het getal dat meer is, verder naar rechts.", "Tel maar in je hoofd. Welk getal zeg je later?"];
  if (v.soort === "orden") return ["Zoek steeds het kleinste getal dat nog over is.", "Er komt steeds 1 bij. Sla geen getal over.", "Tel maar hardop verder. Welk getal komt dan?"];
  if (v.soort === "wie") {
    const kant = n > anker(v) ? "verder" : "terug";
    /* Zonder het getal van de vraag: dat staat al in de eerste zin en komt daarna terug in de vraag (niet 2 keer achter elkaar). */
    return [`Zoek eerst de ${A}. Tel dan de streepjes ${kant}.`, `Begin bij de ${A}. Tel streepje voor streepje ${kant}.`, `Kijk naar de ${A}. Tel vanaf daar de streepjes ${kant}.`];
  }
  /* Keuring 20 november 2026 (15.36, 15.37): bij "het dichtst bij" staan alleen de 3 bordjes in beeld, geen lijn en geen
     sprongen. De hint zegt dus niets over sprongen, maar over tellen in je hoofd vanaf de bordjes die het kind ziet. */
  if (v.soort === "dichtst") return ["Tel in je hoofd vanaf elk bordje. Hoe minder je hoeft te tellen, hoe dichterbij.", "Hoe minder tellen, hoe dichterbij. Probeer het bij elk bordje in je hoofd.", "Tel bij elk bordje in je hoofd hoe ver het is. Kies het getal dat het minst ver is."];
  return ["Kijk welk getal op de lijn het dichtst bij het raketje staat.", "Zoek het getal op de lijn dat vlak bij het raketje staat.", "Het raketje staat vlak bij een getal op de lijn. Zoek dat getal."];
}
/** De vaste hint van een vraag (voor de fouttabel). */
export const hintVan = (v: Vraag): string => vast(hintsVan(v), v);

/** Wat het rondje bij de hint aanwijst: het getal waar je vanaf telt (nooit het antwoord). */
function hintLicht(v: Vraag, over: string[], x?: string): Licht {
  /* Bij "ongeveer" noemt de hint geen getal (een rondje om de 10 zou bijna het antwoord aanwijzen): geen rondje. */
  if (v.soort === "bij" || v.soort === "natien" || v.soort === "wie") return { soort: "getal", n: hintAnker(v, over, x) };
  return null;
}

type Ruw = { x: string; code: Denkfoutnaam; soort: string; denkfout: string; licht?: Licht; scherm: string; over: string[]; bron: string; noot?: string } & Varianten;

/** Van de varianten naar 1 rij van de fouttabel. */
function maak(v: Vraag, d: Ruw): Fout {
  const kanWeer = !d.noot && d.weerEerste.length > 0;
  return {
    code: d.code,
    soort: d.soort,
    denkfout: d.denkfout,
    eerste: vast(d.eerste, v),
    hint: vast(d.hint, v),
    uitleg: vast(d.uitleg, v),
    weer: kanWeer ? [vast(d.weerEerste, v), vast(d.weerUitleg, v)] : [],
    licht: d.licht === undefined ? hintLicht(v, d.over, d.x) : d.licht,
    scherm: d.scherm,
    over: d.over,
    eigen: eigenInvulling(v),
    bron: d.bron,
    ...(d.noot ? { noot: d.noot } : {}),
    v: { eerste: d.eerste, hint: d.hint, uitleg: d.uitleg, uitlegLos: d.uitlegLos, weerEerste: kanWeer ? d.weerEerste : [], weerUitleg: kanWeer ? d.weerUitleg : [] },
  };
}

/**
 * De fouttabel van 1 fout antwoord. Bliepo zegt alleen wat zeker is (BOUWREGELS 15.9): het raketje staat verder of minder
 * ver dan het gekozen getal, het getal staat niet op deze lijn, het ding staat voor of na het getal, hoeveel sprongen het
 * van het doel af ligt. Bij de 1e keer noemt hij nooit het antwoord, nooit "vlak voor" of "1 streepje" (dan weet je het
 * antwoord), en "bijna" of "dichtbij" alleen als er dan nog 2 keuzes dichtbij zijn (15.17). Sinds 18 november 2026 heeft
 * elke zin varianten (`v`); de vaste velden (`eerste`, `hint`, …) zijn er 1 van.
 */
export function lijnFout(x: string, v: Vraag): Fout {
  const andere = (v.soort === "orden" ? [] : v.opties).filter((k) => k !== x);
  const g = Number(v.goed);

  if (v.soort === "bij") {
    const X = Number(x);
    const Xw = w(X);
    const opLijn = (n: number) => n >= v.van! && n <= v.tot!;
    const bron = "eigen invulling (draaiboek §8: \"bij welk getal staat het\" zit niet in Count the Jumps)";
    if (!opLijn(X)) {
      const over = andere.filter((k) => opLijn(Number(k)));
      return maak(v, {
      x,
        code: "tiental-vergeten",
        soort: "tiental",
        denkfout: `alleen het laatste cijfer (${X} voor ${g})`,
        scherm: SCHERM_KIES,
        over,
        bron,
        eerste: [`${Xw} staat niet op deze lijn. Deze lijn begint bij de ${w(v.van!)}.`, `Je koos ${Xw}. Dat getal staat niet op deze lijn.`, `${Xw}? Dat getal vind ik niet op deze lijn.`, `Je tikte op ${Xw}. Deze lijn begint pas bij de ${w(v.van!)}.`],
        hint: hintsVan(v, over, x),
        uitleg: [`${Xw} staat niet op deze lijn. Het getal bij het raketje heeft 2 cijfers.`, "Het getal bij het raketje heeft 2 cijfers, net als de getallen ernaast."],
        uitlegLos: ["Het getal bij het raketje heeft 2 cijfers, net als de getallen ernaast.", "Dat getal staat niet op deze lijn."],
        weerEerste: ["Je koos weer een getal dat niet op de lijn staat.", "Dat getal staat weer niet op de lijn.", "Weer een getal dat niet op de lijn staat, zie ik."],
        weerUitleg: ["Het getal bij het raketje heeft 2 cijfers.", "De getallen naast het raketje hebben 2 cijfers."],
      });
    }
    /* Voor het raketje (X < g) of erna (X > g). De richting mag alleen als er dan nog 2 keuzes over zijn. */
    const voor = X < g;
    const naast = Math.abs(X - g) === 1;
    const overRichting = andere.filter((k) => (voor ? Number(k) > X : Number(k) < X));
    const verklapt = overRichting.length <= 1;
    const over = verklapt ? andere : overRichting;
    /* "Bijna": alleen als het er 1 naast zit en er in die richting nog 2 keuzes dichtbij (hooguit 2 verder) zijn. */
    const bijnaMag = !verklapt && naast && overRichting.filter((k) => Math.abs(Number(k) - X) <= 2).length >= 2;
    const eersteRichting = voor
      ? [`Het raketje staat verder dan de ${Xw}.`, `Je koos ${Xw}. Het raketje staat verder.`, `${Xw}? Het raketje is al verder.`, `Je tikte op ${Xw}. Daar is het raketje al voorbij.`, ...(bijnaMag ? [`Bijna! Het raketje staat net iets verder dan de ${Xw}.`, `${Xw}? Dat is heel dichtbij. Het raketje staat iets verder.`] : [])]
      : [`${Xw} ligt verder dan het raketje.`, `Je koos ${Xw}. Zo ver is het raketje nog niet.`, `${Xw}? Daar is het raketje nog niet.`, `Je tikte op ${Xw}. Dat is te ver.`, ...(bijnaMag ? [`Bijna! ${Xw} is net iets te ver.`, `${Xw}? Dat is heel dichtbij. Maar het is iets te ver.`] : [])];
    /* Zonder richting (15.17, geleerd bij Huisnummers): alleen dat het raketje daar niet staat. */
    const eersteKaal = [`Bij de ${Xw} staat het raketje niet.`, `Het raketje staat niet bij de ${Xw}.`, `Je koos ${Xw}. Daar staat het raketje niet.`, `${Xw}? Daar staat het raketje niet.`, `Je tikte op ${Xw}. Het raketje staat ergens anders.`];
    const recht = "Recht onder het raketje hoort het getal dat we zoeken.";
    return maak(v, {
      x,
      code: naast ? (voor ? "streepje-ervoor" : "streepje-erna") : voor ? "niet-ver-genoeg" : "te-ver",
      soort: naast ? (voor ? "ervoor" : "erna") : voor ? "niet-ver" : "te-ver",
      denkfout: naast ? `koos het getal van het streepje ${voor ? "voor" : "na"} het raketje (${X} voor ${g})` : voor ? `keek niet ver genoeg (${X} voor ${g})` : `keek te ver naar rechts (${X} voor ${g})`,
      scherm: SCHERM_KIES,
      over,
      bron: naast ? (voor ? "eigen invulling; lijkt op draaiboek §3 C.4 (\"we willen weten hoe ver\")" : "eigen invulling; lijkt op draaiboek §3 B.3 (\"geen sprong van 1\")") : "eigen invulling",
      ...(verklapt ? { noot: "welke kant niet genoemd: dan bleef er maar 1 keuze over" } : {}),
      eerste: verklapt ? eersteKaal : eersteRichting,
      hint: verklapt ? HINT_BIJ_KAAL : hintsVan(v, over, x),
      /* Bij de 2e keer mag "vlak voor" en "het volgende streepje": het antwoord komt daarna toch in beeld (15.11). Niet
         "1 streepje verder dan de 1": dan klinkt het getal 2 keer achter elkaar. */
      uitleg: naast
        ? voor
          ? [`Het raketje staat bij het streepje na de ${Xw}.`, `${Xw} staat vlak voor het raketje. Het raketje staat bij het volgende streepje.`, `Vlak na de ${Xw} staat het raketje.`]
          : [`Het raketje staat bij het streepje voor de ${Xw}.`, `${Xw} staat vlak na het raketje. Het raketje staat bij het streepje ervoor.`, `Vlak voor de ${Xw} staat het raketje.`]
        : voor
          ? [`Het raketje staat verder dan de ${Xw}. ${recht}`, `Bij de ${Xw} staat het raketje niet. We zoeken het getal recht onder het raketje.`]
          : [`${Xw} ligt verder dan het raketje. ${recht}`, `Zo ver als de ${Xw} is het raketje niet. We zoeken het getal recht onder het raketje.`],
      uitlegLos: naast ? (voor ? ["Het raketje staat bij het volgende streepje.", "Dat getal staat vlak voor het raketje."] : ["Het raketje staat bij het streepje ervoor.", "Dat getal staat vlak na het raketje."]) : [recht, voor ? "Het raketje staat verder dan dat getal." : "Dat getal ligt verder dan het raketje."],
      weerEerste: voor ? ["Je koos weer een getal voor het raketje.", "Dat is weer voor het raketje.", "Weer een getal voor het raketje, zie ik."] : ["Je koos weer een getal dat te ver ligt.", "Dat is weer te ver.", "Weer te ver, zie ik."],
      weerUitleg: naast ? [voor ? "Het raketje staat bij het volgende streepje." : "Het raketje staat bij het streepje ervoor.", recht] : [recht, voor ? "Het raketje staat verder." : "Het raketje staat minder ver."],
    });
  }

  if (v.soort === "natien") {
    const X = Number(x);
    const Xw = w(X);
    if (X > g)
      return maak(v, {
      x,
        code: "streepje-overgeslagen",
        soort: "over",
        denkfout: `sloeg een streepje over (${X} na 10)`,
        scherm: SCHERM_KIES,
        over: andere.filter((k) => Number(k) < X && Number(k) > 10),
        bron: "eigen invulling; lijkt op draaiboek §3 B.3 (\"dat was geen sprong van 1\")",
        /* De vraag zegt al "verder dan de 10": de 1 valt daardoor af en na deze keuze is er nog 1 getal over. Bliepo zegt
           daarom alleen dat het te ver is, niet dat het 1 streepje scheelt (was: "Met 12 sla je een streepje over."). */
        noot: "de vraag zegt al \"verder dan de 10\": na deze keuze is er nog 1 getal over; Bliepo noemt alleen de kant, niet hoeveel",
        eerste: [`Zo ver als ${Xw} is het raketje nog niet.`, `Je koos ${Xw}. Zo ver is het raketje nog niet.`, `${Xw}? Daar is het raketje nog niet.`, `Je tikte op ${Xw}. Dat is te ver.`],
        hint: hintsVan(v),
        uitleg: [`Met ${Xw} sla je een streepje over.`, `Je koos ${Xw}. Dan sla je een streepje over.`, `Na de ${w(10)} komt eerst het getal dat 1 groter is.`],
        uitlegLos: ["Dan sla je een streepje over.", `Na de ${w(10)} komt eerst het getal dat 1 groter is.`],
        weerEerste: [],
        weerUitleg: [],
      });
    if (X < 10)
      return maak(v, {
      x,
        code: "tiental-vergeten",
        soort: "tiental",
        denkfout: `alleen het laatste cijfer (${X} voor ${g})`,
        scherm: SCHERM_KIES,
        over: andere.filter((k) => Number(k) > 10),
        bron: "eigen invulling",
        eerste: [`${Xw} staat vooraan op de lijn, vlak na de ${w(0)}.`, `Je koos ${Xw}. Dat getal staat vooraan op de lijn.`, `${Xw}? Dat staat helemaal vooraan op de lijn.`],
        hint: hintsVan(v),
        uitleg: [`Na de ${w(10)} komen getallen met 2 cijfers.`, `${Xw} staat vooraan op de lijn. Het raketje is al veel verder.`],
        uitlegLos: [`Na de ${w(10)} komen getallen met 2 cijfers.`, "Dat getal staat vooraan. Het raketje is al veel verder."],
        weerEerste: ["Je koos weer een getal van vooraan op de lijn.", "Dat staat weer vooraan op de lijn."],
        weerUitleg: [`Het raketje is al voorbij de ${w(10)}.`, `Na de ${w(10)} komen getallen met 2 cijfers.`],
      });
  }

  if (v.soort === "meer") {
    const X = Number(x);
    const Xw = w(X);
    const ander = X === v.meer!.a ? v.meer!.b : v.meer!.a;
    if (X < ander)
      return maak(v, {
      x,
        code: "kleiner-gekozen",
        soort: "kleiner",
        denkfout: `groter en kleiner verwisseld (${X} is minder dan ${ander})`,
        licht: null,
        scherm: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; geen rondje (op de lijn staan alleen 10, 15 en 20); dan de vraag in andere woorden",
        over: andere,
        bron: "eigen invulling (draaiboek §8: niet in Count the Jumps)",
        noot: "2 keuzes: na 1 fout blijft er altijd 1 over; Bliepo noemt alleen de regel, niet het antwoord",
        eerste: [`${Xw} zeg je eerder als je telt.`, `Je koos ${Xw}. Dat getal zeg je eerder als je telt.`, `${Xw}? Dat komt eerder als je telt.`],
        hint: hintsVan(v),
        uitleg: ["Hoe verder je komt als je telt, hoe meer het is.", `${Xw} zeg je eerder als je telt. Wat later komt, is meer.`],
        uitlegLos: ["Hoe verder je komt als je telt, hoe meer het is.", "Wat je later zegt als je telt, is meer."],
        weerEerste: [],
        weerUitleg: [],
      });
  }

  if (v.soort === "orden") {
    const goed = v.goed.split(",").map(Number);
    const xs = x.split(",").map(Number);
    const p = xs.findIndex((n, i) => n !== goed[i]);
    const kaarten = xs.slice(1);
    const aflopend = kaarten.every((n, i) => i === 0 || kaarten[i - 1] > n);
    const hint = hintsVan(v);
    /* Bij slepen "legde", niet "zette" of "koos" (BLIEPO-KARAKTER §2). */
    if (aflopend)
      return maak(v, {
      x,
        code: "volgorde-omgedraaid",
        soort: "omgedraaid",
        denkfout: "zette de kaarten van groot naar klein",
        licht: { soort: "vak", i: 1 },
        scherm: SCHERM_ORDEN,
        over: [],
        bron: "eigen invulling (draaiboek §8: op volgorde zetten zit niet in Count the Jumps)",
        eerste: [`Na ${w(xs[0])} legde je ${w(xs[1])}, het grootste getal.`, `Je legde ${w(xs[1])} vlak na ${w(xs[0])}. Dat is het grootste getal.`, `Na ${w(xs[0])} komt bij jou meteen ${w(xs[1])}, het grootste getal.`],
        hint,
        uitleg: ["Van klein naar groot: het kleinste vooraan, dan steeds 1 groter.", `Je legde het grootste getal vlak na ${w(xs[0])}. Het kleinste komt eerst.`, "Je legde ze van groot naar klein. We gaan van klein naar groot."],
        uitlegLos: ["We gaan van klein naar groot.", "Het kleinste getal komt eerst. Dan steeds 1 groter."],
        weerEerste: ["Je legde ze weer van groot naar klein.", "Ze liggen weer van groot naar klein.", "Weer van groot naar klein, zie ik."],
        weerUitleg: ["Het kleinste getal komt eerst.", "We beginnen met het kleinste getal."],
      });
    const a = xs[p - 1];
    const b = xs[p];
    if (b > a)
      return maak(v, {
      x,
        code: "getal-overgeslagen",
        soort: "overgeslagen",
        denkfout: `sloeg na ${a} een getal over (${b})`,
        licht: { soort: "vak", i: p },
        scherm: SCHERM_ORDEN,
        over: [],
        bron: "eigen invulling; lijkt op draaiboek §3 B.3 (\"spring steeds 1\")",
        eerste: [`Na ${w(a)} legde je ${w(b)}.`, `Je legde ${w(b)} na ${w(a)}.`, `Na ${w(a)} komt bij jou ${w(b)}.`],
        hint,
        uitleg: [`Tussen ${w(a)} en ${w(b)} hoort nog een getal.`, `Je legde ${w(b)} na ${w(a)}. Daar hoort nog een getal tussen.`, `Na ${w(a)} komt het getal dat 1 groter is.`],
        uitlegLos: ["Er hoort nog een getal tussen.", "Elk getal is 1 groter dan het getal ervoor."],
        /* Zonder "weer": de 1e keer zei Bliepo alleen waar het misging ("Na 5 legde je 7."), niet dat er een getal was overgeslagen. */
        weerEerste: ["Je sloeg een getal over.", "Er is een getal overgeslagen.", "Ik mis een getal in de rij."],
        weerUitleg: ["Er komt steeds 1 bij.", "Elk getal is 1 groter dan het getal ervoor."],
      });
    return maak(v, {
      x,
      code: "kleiner-erna",
      soort: "kleiner-erna",
      denkfout: `zette na ${a} een kleiner getal (${b})`,
      licht: { soort: "vak", i: p },
      scherm: SCHERM_ORDEN,
      over: [],
      bron: "eigen invulling",
      eerste: [`Na ${w(a)} legde je ${w(b)}. Dat is kleiner.`, `Je legde ${w(b)} na ${w(a)}. Maar dat getal is kleiner.`],
      hint,
      uitleg: ["Van klein naar groot: elk getal is groter dan het getal ervoor.", `Na ${w(a)} legde je een kleiner getal. Elk volgend getal is groter.`],
      uitlegLos: ["Elk volgend getal is groter.", "Elk getal is groter dan het getal ervoor."],
      weerEerste: ["Je legde weer een kleiner getal erna.", "Er ligt weer een kleiner getal achter."],
      weerUitleg: ["Elk volgend getal is groter.", "We gaan van klein naar groot."],
    });
  }

  if (v.soort === "wie") {
    const z = x as Wezen;
    const p = plekVan(v, x)!;
    const n = v.n!;
    const voor = p < n;
    const kant = voor ? "voor" : "na";
    const d = Math.abs(n - p);
    const ver = `${d} ${d === 1 ? "streepje" : "streepjes"}`;
    return maak(v, {
      x,
      code: voor ? "ding-ervoor" : "ding-erna",
      soort: voor ? "ervoor" : "erna",
      denkfout: `tikte op ${NAAM[z]}, ${die(z).toLowerCase()} bij ${p} staat (${kant} de ${n})`,
      scherm: SCHERM_WIE,
      over: andere.filter((k) => (voor ? plekVan(v, k)! > p : plekVan(v, k)! < p)),
      bron: "eigen invulling (draaiboek §8: \"wat staat er bij\" zit niet in Count the Jumps)",
      eerste: [`${Naam(z)} staat ${kant} de ${w(n)}.`, `Je tikte op ${NAAM[z]}. ${die(z)} staat ${kant} de ${w(n)}.`, voor ? `${Naam(z)}? ${die(z)} staat nog voor de ${w(n)}.` : `${Naam(z)}? ${die(z)} staat al voorbij de ${w(n)}.`],
      hint: hintsVan(v),
      uitleg: [`${Naam(z)} staat bij de ${w(p)}. Dat is ${ver} ${kant} de ${w(n)}.`, `Je tikte op ${NAAM[z]}. ${die(z)} staat ${ver} ${kant} de ${w(n)}.`],
      uitlegLos: [`${die(z)} staat bij de ${w(p)}. Dat is ${ver} ${kant} de ${w(n)}.`, `${die(z)} staat ${ver} ${kant} de ${w(n)}.`],
      weerEerste: [`Je tikte weer op iets ${kant} de ${w(n)}.`, `Dat staat weer ${kant} de ${w(n)}.`, `Weer iets ${kant} de ${w(n)}, zie ik.`],
      weerUitleg: [`De ${w(anker(v))} helpt je tellen.`, `Vanaf de ${w(anker(v))} kun je de streepjes tellen.`],
    });
  }

  if (v.soort === "dichtst") {
    const X = Number(x);
    const Xw = w(X);
    const d = Math.abs(X - v.n!);
    const kant = X < v.n! ? "verder" : "terug";
    return maak(v, {
      x,
      code: "verder-weg",
      soort: `verder-${X}`,
      denkfout: `koos een getal dat verder weg ligt (${X}: ${d} sprongen van ${v.n})`,
      licht: { soort: "bordje", n: X },
      scherm: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; een rood rondje om het bordje met het getal dat Bliepo noemt; dan de vraag in andere woorden en dezelfde keuzes terug",
      over: andere,
      bron: "eigen invulling; het tellen van de stapjes lijkt op draaiboek §3 E.3 (het verschil samen uitrekenen)",
      /* Keuring 20 november 2026 (15.36): er staat nog geen lijn in beeld (die komt pas bij het samen springen), dus
         "tellen" in plaats van "sprongen". */
      eerste: [`Van ${Xw} naar de ${w(v.n!)} tel je ${d} ${kant}.`, `Van ${Xw} tot de ${w(v.n!)} moet je ${d} ${kant} tellen.`, `Je koos ${Xw}. Dan tel je ${d} ${kant} tot de ${w(v.n!)}.`],
      hint: hintsVan(v),
      uitleg: [`Van ${Xw} naar de ${w(v.n!)} is het ver: je telt ${d} ${kant}.`, `Van ${Xw} tel je ${d} ${kant} tot de ${w(v.n!)}. Dat is niet het dichtst bij.`, "We zetten de getallen op een lijn en tellen de sprongen."],
      uitlegLos: ["We zetten de getallen op een lijn en tellen de sprongen.", "Dat getal ligt verder weg."],
      weerEerste: [],
      weerUitleg: [],
    });
  }

  if (v.soort === "ongeveer") {
    const X = Number(x);
    const Xw = w(X);
    let plek: string;
    if (X - 15 === 1 || X - 10 === 1) plek = `ligt vlak na de ${w(X - 1)}`;
    else if (20 - X === 1 || 15 - X === 1) plek = `ligt vlak voor de ${w(X + 1)}`;
    else if (X > 10 && X < 15) plek = `ligt tussen de ${w(10)} en de ${w(15)}`;
    else plek = `ligt tussen de ${w(15)} en de ${w(20)}`;
    const A = w(anker(v));
    return maak(v, {
      x,
      code: "ander-stuk",
      soort: `stuk-${X}`,
      denkfout: `koos een getal in een ander stuk van de lijn (${X} voor ${g})`,
      /* De hint noemt geen getal: geen rondje. */
      licht: null,
      scherm: SCHERM_KIES,
      over: andere,
      bron: "eigen invulling (draaiboek §8: schatten zit niet in Count the Jumps)",
      eerste: [`${Xw} ${plek}.`, `Je koos ${Xw}. Dat getal ${plek}.`, `${Xw}? Dat ${plek}.`],
      hint: hintsVan(v),
      uitleg: [`Het raketje staat vlak bij de ${A}.`, `Het raketje staat vlak bij de ${A}. Daar ligt ${Xw} niet.`],
      uitlegLos: [`Het raketje staat vlak bij de ${A}.`, `Dat getal ligt niet vlak bij de ${A}. Het raketje wel.`],
      weerEerste: [],
      weerUitleg: [],
    });
  }

  return {
    code: "onduidelijk",
    soort: "onduidelijk",
    denkfout: "niet duidelijk (geen reden verzonnen)",
    eerste: "",
    hint: hintVan(v),
    uitleg: "We springen samen over de lijn.",
    weer: [],
    licht: hintLicht(v, andere),
    scherm: SCHERM_KIES,
    over: andere,
    eigen: eigenInvulling(v),
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
  const scherm = "Bliepo's scherm 1,5 s rood; de knoppen weg; een rood rondje om de 0 (het begin) als Bliepo de 0 noemt; de bogen blijven staan; dan de vraag in andere woorden";
  const vraag = { nr: 0 };
  const rij = (d: { code: Denkfoutnaam; soort: string; denkfout: string; over: string[]; bron: string } & Varianten): Fout => ({
    code: d.code,
    soort: d.soort,
    denkfout: d.denkfout,
    eerste: vast(d.eerste, vraag),
    hint: vast(d.hint, vraag),
    uitleg: vast(d.uitleg, vraag),
    weer: [vast(d.weerEerste, vraag), vast(d.weerUitleg, vraag)],
    licht: { soort: "getal", n: 0 },
    scherm,
    over: d.over,
    eigen: false,
    bron: d.bron,
    v: { eerste: d.eerste, hint: d.hint, uitleg: d.uitleg, uitlegLos: d.uitlegLos, weerEerste: d.weerEerste, weerUitleg: d.weerUitleg },
  });
  if (x === "4")
    return rij({
      code: "getallen-tellen-ipv-sprongen",
      soort: "getallen",
      denkfout: "telde de getallen (0, 1, 2 en 3) in plaats van de sprongen",
      over: ["2", "3"],
      bron: "draaiboek §3 C.3 en §7 `getallen-tellen-ipv-sprongen` (Synthesis benoemt dit: \"dat zijn 2 getallen, maar hoeveel sprongen?\")",
      eerste: ["Je telde de getallen {0:wit}, {1:wit}, {2:wit} en {3:wit}. Dat zijn er {4:wit}.", "{4:wit}? Zoveel getallen zijn het: {0:wit}, {1:wit}, {2:wit} en {3:wit}."],
      hint: ["Maar we tellen de sprongen, niet de getallen.", "We zoeken hoeveel sprongen het zijn. Kijk naar de bogen."],
      uitleg: ["De {0:wit} is het begin. Daar sprong het raketje nog niet.", "Bij de {0:wit} begon het raketje. Daar sprong het nog niet."],
      uitlegLos: ["Het begin telt niet mee. Daar sprong het raketje nog niet.", "Alleen de bogen tellen mee."],
      weerEerste: ["Je telde weer de getallen.", "Dat zijn weer de getallen.", "Weer de getallen geteld, zie ik."],
      weerUitleg: ["Alleen de bogen tellen mee.", "Elke boog is 1 sprong."],
    });
  return rij({
    code: "te-weinig-bogen",
    soort: "te-weinig",
    denkfout: "telde een boog te weinig",
    over: ["3", "4"],
    bron: "draaiboek §3 D.4 en §7 `een-te-weinig` (Synthesis: hulpvraag \"hoeveel sprongen?\")",
    eerste: ["Er zijn meer bogen dan {2:wit}.", "Je koos {2:wit}. Ik zie meer bogen.", "{2:wit}? Ik tel meer bogen."],
    hint: ["Tel elke boog, van de {0:wit} tot het raketje.", "Wijs de bogen stuk voor stuk aan en tel ze.", "Begin bij de {0:wit}. Tel de bogen tot het raketje."],
    uitleg: ["Er zijn meer bogen dan {2:wit}. Elke boog is 1 sprong.", "Je koos {2:wit}. Er zijn meer bogen."],
    uitlegLos: ["Elke boog is 1 sprong.", "Er zijn meer bogen."],
    weerEerste: ["Je telde weer te weinig bogen.", "Dat zijn er weer te weinig.", "Weer te weinig bogen, zie ik."],
    weerUitleg: ["Bij elke sprong hoort 1 boog.", "Elke boog telt mee."],
  });
}
