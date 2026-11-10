/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Huisnummers (squla-huisnummers-gouden, 10 november 2026), op één plek, met
 * de FOUTTABEL. De les zelf (squla-huisnummers-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is) zijn
 *     dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij Huisnummers
 *     (BLIEPO-KARAKTER.md §4, zin 56 t/m 60), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (17 vragen, getallen en keuzes) is die van squla-huisnummers "Huisnummers: wat komt erna?"
 *     (BOUWREGELS 15.22): erna, ervoor, ertussen, slepen en terugtellen; eerst tot 20, dan tot 31, dan tot 50; kiezen uit
 *     3, typen of slepen. De vraagzinnen zijn die van de oude les.
 *   - Het skelet volgt het draaiboek Huisnummers (Counting On, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/huisnummers.md):
 *     geen startvraag; de vraag komt met het beeld; bij goed korte lof met het getal en vanzelf door; bij een fout een
 *     zin die past bij HOE ver het kind ernaast zit (§3 A.2 en C.2: vlak ernaast, 10 ernaast, te ver, verkeerde rij)
 *     en de vraag in andere woorden; bij de 2e fout telt Bliepo zelf langs de huizen, 1 stap per keer, en het vakje van
 *     nu licht op (§3 C.5 en D.3: "we tellen elke stap samen"); grotere getallen per blok (§2 stap 2 en 4).
 *   - "Erna" (1 verder tellen) en over het tiental (39 → 40) zitten in Counting On. ERVOOR, ERTUSSEN, SLEPEN en
 *     TERUGTELLEN niet (draaiboek §8 en §11): die vragen hebben hetzelfde skelet, maar hun hints en fouttabel zijn
 *     "eigen invulling, niet van Synthesis" (BOUWREGELS 15.22 punt 5; gemarkeerd met `eigen: true`).
 *
 * Leesbare versie: FOUTTABEL-squla-huisnummers-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-huisnummers-gouden.ts`; dat script doet ook de reken- en verklapcontrole).
 * Huisnummers staan wit op een donker bordje; in de zinnen dus {n:wit} (BOUWREGELS 2.2: de kleur van het voorwerp).
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

/** Een huisnummer in de zin: wit, zoals op het bordje (BOUWREGELS 2.2). */
export const w = (n: number) => `{${n}:wit}`;

/* ---------- de 17 vragen van squla-huisnummers (zelfde volgorde, getallen en keuzes) ---------- */

export type Soort = "na" | "voor" | "tussen" | "sleep" | "terug";
/** Een getal = huis met dat nummer, "?" = huis met een vraagteken op het bordje, null = lege plek (geen huis). */
export type Huisplek = number | "?" | null;

export type Vraag = {
  nr: number;
  id: string;
  soort: Soort;
  huizen: Huisplek[];
  goed: number;
  /** Keuzes (3). Zonder keuzes en zonder slepen: typen. */
  opties?: number[];
  /** Huizen om naar de lege plek te slepen. */
  losse?: number[];
};

const vr = (nr: number, soort: Soort, huizen: Huisplek[], goed: number, extra: { opties?: number[]; losse?: number[] } = {}): Vraag => ({ nr, id: `vraag${nr}-${soort}-${goed}`, soort, huizen, goed, ...extra });

export const VRAGEN: Vraag[] = [
  /* tot 20 */
  vr(1, "na", [6, 7, "?"], 8, { opties: [9, 8, 6] }),
  vr(2, "voor", ["?", 12, 13], 11, { opties: [13, 11, 10] }),
  vr(3, "tussen", [14, 15, "?", 17, 18], 16, { opties: [16, 19, 13] }),
  vr(4, "na", [17, 18, 19, "?"], 20),
  vr(5, "sleep", [8, 9, null, 11, 12], 10, { losse: [7, 10, 13] }),
  /* van 20 tot 31 */
  vr(6, "na", [24, 25, "?"], 26, { opties: [24, 27, 26] }),
  vr(7, "terug", ["?", 27, 28, 29], 26, { opties: [30, 26, 25] }),
  vr(8, "voor", ["?", 21, 22], 20, { opties: [22, 19, 20] }),
  vr(9, "tussen", [26, 27, "?", 29, 30], 28, { opties: [28, 26, 38] }),
  vr(10, "sleep", [21, 22, 23, null, 25], 24, { losse: [42, 24, 26] }),
  vr(11, "voor", ["?", 30, 31], 29),
  /* tot 50 */
  vr(12, "na", [38, 39, "?"], 40, { opties: [30, 41, 40] }),
  vr(13, "terug", ["?", 41, 42, 43], 40, { opties: [44, 39, 40] }),
  vr(14, "tussen", [45, 46, "?", 48, 49], 47, { opties: [44, 47, 50] }),
  vr(15, "sleep", [32, 33, null, 35, 36], 34, { losse: [37, 43, 34] }),
  vr(16, "na", [47, 48, 49, "?"], 50),
  vr(17, "terug", ["?", 35, 36, 37], 34, { opties: [34, 38, 33] }),
];

/** Typen (geen keuzes en geen losse huizen). */
export const isTyp = (v: Vraag) => !v.opties && !v.losse;
/** Vooruit tellen (erna, ertussen, slepen) of terug (ervoor, terugtellen). */
export const vooruit = (v: Vraag) => v.soort === "na" || v.soort === "tussen" || v.soort === "sleep";
/** De plek van het vraagteken of de lege plek in de rij. */
export const gat = (v: Vraag) => v.huizen.findIndex((h) => h === "?" || h === null);
/** De nummers in de straat, zonder het gat. */
export const nummers = (v: Vraag) => v.huizen.filter((h): h is number => typeof h === "number");
/** Het buurhuis waar de vraag over gaat ("komt na 7", "komt voor 12"): links van het gat bij vooruit, rechts bij terug. */
export const buur = (v: Vraag) => (vooruit(v) ? v.goed - 1 : v.goed + 1);
/** De plek van dat buurhuis in de rij. */
export const buurPlek = (v: Vraag) => v.huizen.indexOf(buur(v));
/** Welke vragen eigen invulling zijn (Counting On heeft alleen "erna" en verder tellen; draaiboek §8). */
export const eigenInvulling = (v: Vraag) => v.soort !== "na";
/** Het blok van een vraag (tot 20, tot 31, tot 50): bij een nieuw blok zegt Bliepo dat de getallen groter worden (draaiboek §2 stap 2 en 4). */
export const blok = (v: Vraag) => (v.nr <= 5 ? 0 : v.nr <= 11 ? 1 : 2);

/* ---------- vaste zinnen van het verloop (draaiboek Huisnummers §2; eigen woorden) ---------- */

const plekWoord = (v: Vraag) => (v.soort === "sleep" ? "de lege plek" : "het vraagteken");

export const ZIN = {
  /** Stap 1: openen. Eigen beginzin van de les (BOUWREGELS 4.3); geen startvraag (draaiboek §0). Samen met de groet 1 stuk. */
  begin: "In deze straat mist steeds 1 huisnummer. Jij zoekt welk nummer daar hoort.",
  /** Een nieuw blok met grotere getallen (draaiboek §2 stap 2 en 4: "nu tellen we met grotere getallen"). */
  blok: ["", "Nu komen er grotere huisnummers.", "En nu de huisnummers tot 50."],
  /** De zinnen van de oude les vóór de vraag; alleen de eerste keer per soort (LESRECEPT: dezelfde zin niet steeds helemaal). */
  aanloop: (v: Vraag): string => (v.soort === "tussen" ? "Kijk, op 1 bordje staat een vraagteken." : v.soort === "sleep" ? "Er mist 1 huis in de straat." : v.soort === "terug" ? "Nu lopen we terug." : ""),
  /** De vraag van de oude les; overal dezelfde zin voor dezelfde soort vraag (3.11). */
  vraag: (v: Vraag): string[] => {
    const typ = isTyp(v) ? ["Typ het nummer."] : [];
    if (v.soort === "na") return [`Welk huisnummer komt na ${w(buur(v))}?`, ...typ];
    if (v.soort === "voor") return [`Welk huisnummer komt voor ${w(buur(v))}?`, ...typ];
    if (v.soort === "tussen") return ["Welk huisnummer hoort bij het vraagteken?", ...typ];
    if (v.soort === "sleep") return ["Sleep het goede huis naar de lege plek."];
    return ["Welk huisnummer komt dan?", ...typ];
  },
  /** Een nieuwe poging na de hint: de vraag in andere woorden (draaiboek §3 A.2: "de vraag in andere woorden"; 3.23). */
  opnieuw: (v: Vraag): string[] => {
    const typ = isTyp(v) ? ["Typ het nummer."] : [];
    if (v.soort === "na") return [`Welk nummer komt er na ${w(buur(v))}?`, ...typ];
    if (v.soort === "voor") return [`Welk nummer komt er voor ${w(buur(v))}?`, ...typ];
    if (v.soort === "tussen") return ["Welk nummer hoort er bij het vraagteken?", ...typ];
    if (v.soort === "sleep") return ["Sleep nu het goede huis naar de lege plek."];
    return [`Welk nummer komt er voor ${w(buur(v))}?`, ...typ];
  },
  /** Typen: het vinkje zonder nummer telt niet als fout (draaiboek §2 stap 6: "vinkje zonder keuze"). */
  typEerst: "Typ eerst een nummer.",
  /** 2e fout: Bliepo doet het samen voor (draaiboek §3 C.5 en D.3: hij telt zelf, 1 stap per keer, het vakje licht op). */
  samen: "Kom, we tellen samen.",
  samenBegin: (v: Vraag) => (vooruit(v) ? "Ik tel langs de huizen." : "Ik tel terug, van rechts naar links."),
  samenTel: (n: number) => `${w(n)}.`,
  /** Bij het gat: het nummer komt op het bordje en Bliepo zegt waarom (nu pas het antwoord in beeld, 15.11). */
  samenGat: (v: Vraag) => {
    const g = w(v.goed);
    if (v.soort === "na") return `En dan ${g}. Na ${w(buur(v))} komt ${g}.`;
    if (v.soort === "voor" || v.soort === "terug") return `En dan ${g}. Voor ${w(buur(v))} komt ${g}.`;
    if (v.soort === "tussen") return `En dan ${g}. ${g} hoort tussen ${w(v.goed - 1)} en ${w(v.goed + 1)}.`;
    return `En dan ${g}. Hier hoort huis ${g}.`;
  },
  /** De kleine stap van het kind (15.11): het huis met het nieuwe nummer aantikken, of het huis naar de lege plek slepen. */
  samenStap: (v: Vraag) => (v.soort === "sleep" ? `Sleep jij huis ${w(v.goed)} naar de lege plek?` : `Tik jij op het huis met ${w(v.goed)}?`),
  samenHand: (v: Vraag) => (v.soort === "sleep" ? `Sleep huis ${w(v.goed)} hierheen.` : `Tik op het huis met ${w(v.goed)}.`),
  samenKlaar: (v: Vraag) => (v.soort === "sleep" ? `Ja, huis ${w(v.goed)} staat op zijn plek.` : `Ja, dat is huis ${w(v.goed)}.`),
  /** Na het vangnet (Bliepo deed de stap zelf): geen "Ja" alsof het kind het deed (keuring Meer-minder, 10 nov). */
  samenZelf: (v: Vraag) => (v.soort === "sleep" ? `Kijk, huis ${w(v.goed)} staat nu op zijn plek.` : `Kijk, hier staat huis ${w(v.goed)}.`),
  /** Bij een opdracht (slepen): het hulphandje wijst de lege plek aan, niet het goede huis (15.17). */
  sleepHand: "Hier moet een huis staan.",
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: number, v: Vraag) => (v.soort === "sleep" ? `Je sleepte weer huis ${w(x)}.` : isTyp(v) ? `Je typte weer ${w(x)}.` : `Je koos weer ${w(x)}.`),
  /** Stap 10: einde. */
  slot: "Je weet nu welk huisnummer erna, ervoor en ertussen komt.",
  kaartTik: "Tik op de kaart.",
};

/** Aanmoediging bij het hulphandje (het kind moet slepen of tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];

/**
 * Reactie na de lof (BLIEPO-KARAKTER.md §4 Huisnummers, zin 56 t/m 60, plus zinnen zonder "Ja").
 * De robotzin (laatste) hooguit 1 keer per les.
 */
export function huisReactie(v: Vraag): Rijtje {
  const g = w(v.goed);
  const stap = vooruit(v) ? "Ja, er komt steeds 1 bij." : "Ja, er gaat steeds 1 af.";
  const plek =
    v.soort === "na" ? `Ja, na nummer ${w(buur(v))} komt nummer ${g}.` : v.soort === "tussen" || v.soort === "sleep" ? `Ja, het huis tussen ${w(v.goed - 1)} en ${w(v.goed + 1)} heeft nummer ${g}.` : `Ja, voor nummer ${w(buur(v))} komt nummer ${g}.`;
  return rij([`Ja, het huisnummer is ${g}.`, plek, stap, `Het huisnummer is ${g}.`, `Nummer ${g} past precies.`, `Nagekeken: nummer ${g} hoort hier.`], [5]);
}
export const REACTIE_JA = [0, 1, 2];
export const REACTIE_ROBOT = 5;

/* ---------- denkfouten (draaiboek Huisnummers §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["staat-al", "een-te-veel", "verkeerde-richting", "buiten-de-rij", "cijfers-omgedraaid", "tien-ernaast", "verkeerde-rij", "alleen-tientalcijfer", "te-ver", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen tellen; dan mag het antwoord in beeld, 15.11). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
  weer: string[];
  scherm: string;
  /** Welke keuzes de eerste zin en de hint nog toelaten (verklapcontrole van het script, 15.17). Bij typen: leeg (dan zijn er altijd veel over). */
  over: number[];
  /** Eigen invulling, niet van Synthesis (15.22 punt 5). */
  eigen: boolean;
  /** Waar Synthesis deze reactie heeft (draaiboek). */
  bron: string;
  /** Waarom Bliepo hier niet zegt wát er mis is (dan bleef er maar 1 keuze over, BOUWREGELS 15.17). */
  noot?: string;
};

/** De hint: hoe je telt, vanaf het buurhuis (een rood rondje om dat huis). 3 versies, zodat het niet steeds hetzelfde is. */
export function hintVan(v: Vraag): string {
  const r = w(buur(v));
  const plek = plekWoord(v);
  const k = v.nr % 3;
  if (vooruit(v)) {
    if (v.soort === "na") return [`Kijk naar het huis links van het vraagteken. Begin bij ${r} en tel 1 verder.`, `Begin bij ${r}. Welk nummer zeg je daarna?`, `Zeg de nummers hardop tot ${r}. Welk nummer zeg je dan?`][k];
    return [`Kijk naar het huis links van ${plek}. Begin bij ${r} en tel 1 verder.`, `Er komt steeds 1 bij. Begin bij ${r}. Welk nummer zeg je daarna?`, `Zeg de nummers hardop tot ${r}. Welk nummer zeg je dan?`][k];
  }
  return [`Kijk naar het huis rechts van ${plek}. Begin bij ${r} en tel 1 terug.`, `Er gaat steeds 1 af. Begin bij ${r} en tel 1 terug.`, `Tel terug vanaf ${r}. Welk nummer zeg je dan?`][k];
}

const SCHERM_KIES = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; een rood rondje om het huis dat Bliepo noemt (het buurhuis, nooit het antwoord); dan de vraag in andere woorden en dezelfde keuzes terug (geen pijl)";
const SCHERM_TYP = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het invulvak wordt leeg; een rood rondje om het buurhuis; dan de vraag in andere woorden en het lege invulvak terug";
const SCHERM_SLEEP = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het huis glijdt terug naar beneden (geen schudden, geen rood); een rood rondje om het buurhuis; dan de opdracht opnieuw";

const kies3 = <T,>(lijst: T[], v: Vraag) => lijst[v.nr % lijst.length];

/**
 * De fouttabel van 1 fout antwoord. Bliepo zegt alleen wat zeker is (BOUWREGELS 15.9): het nummer staat al in de straat,
 * je slaat een huis over, het nummer hoort aan het begin of eind van de straat, de cijfers staan andersom, het begint met
 * een ander cijfer. Hij noemt nooit 2 buren tegelijk (dan is het antwoord verklapt: "tussen 15 en 17" = 16).
 */
export function huisFout(x: number, v: Vraag): Fout {
  const f = huisFoutRuw(x, v);
  if (isTyp(v) || f.code === "onduidelijk" || f.over.length > 1) return f;
  /*
    Verklapcontrole (15.17): zou de eerste zin maar 1 keuze overlaten (bij slepen 34: "37 komt na 36, aan het eind van
    de straat" sluit ook 43 uit), dan zegt Bliepo niet wát er mis is, alleen dat dit nummer hier niet past. De denkfout
    wordt wel bewaard. Zo blijven er altijd 2 keuzes over.
  */
  const X = w(x);
  const zinnen = v.soort === "sleep" ? [`Huis ${X} past niet op deze plek.`, `Huis ${X} hoort hier niet.`] : [`Je koos ${X}. Dat nummer hoort hier niet.`, `${X} past hier niet.`];
  return { ...f, eerste: kies3(zinnen, v), over: (v.opties ?? v.losse ?? []).filter((k) => k !== x), weer: [], noot: "wat er mis is niet genoemd: dan bleef er maar 1 keuze over" };
}

function huisFoutRuw(x: number, v: Vraag): Fout {
  const X = w(x);
  const bekend = nummers(v);
  const min = Math.min(...bekend);
  const max = Math.max(...bekend);
  const keuzes = v.opties ?? v.losse ?? [];
  const andere = keuzes.filter((k) => k !== x);
  const typ = isTyp(v);
  const sleep = v.soort === "sleep";
  const koos = sleep ? `Je sleepte huis ${X}.` : typ ? `Je typte ${X}.` : `Je koos ${X}.`;
  const scherm = typ ? SCHERM_TYP : sleep ? SCHERM_SLEEP : SCHERM_KIES;
  const hint = hintVan(v);
  const eigen = eigenInvulling(v);
  const tiental = Math.floor(v.goed / 10);
  const over = (zelf: (k: number) => boolean) => (typ ? [] : andere.filter(zelf));
  const rond = v.goed % 10 === 0 || v.goed % 10 === 9;

  if (bekend.includes(x))
    return {
      code: "staat-al",
      soort: "staat-al",
      denkfout: "koos een nummer dat al in de straat staat (keek naar het buurhuis, of telde de verkeerde kant op)",
      eerste: kies3([`${X} staat al in de straat.`, `Huis ${X} is er al.`, `Kijk, ${X} staat er al.`], v),
      hint,
      uitleg: "Elk nummer staat maar 1 keer in de straat.",
      weer: [`Je ${typ ? "typte" : sleep ? "sleepte" : "koos"} weer een nummer dat er al staat.`, "Het nummer dat we zoeken, staat er nog niet."],
      scherm,
      over: over((k) => !bekend.includes(k)),
      eigen,
      bron: eigen ? "eigen invulling (draaiboek §8: niet in Counting On)" : "draaiboek §3 C.2 (een andere zin per soort fout)",
    };
  /* Keuring 10 nov: "De nummers hier beginnen met een 2" alleen als ALLE nummers in de straat zo beginnen (bij 30, 31 → 29 niet). */
  const alleTiental = bekend.every((n) => Math.floor(n / 10) === tiental);
  if (x > 9 && Number([...String(x)].reverse().join("")) === v.goed)
    return {
      code: "cijfers-omgedraaid",
      soort: "cijfers",
      denkfout: `de cijfers andersom (${x} voor ${v.goed})`,
      eerste: alleTiental ? `${koos} De nummers hier beginnen met een ${w(tiental)}.` : `${koos} Kijk goed welk cijfer vooraan hoort.`,
      hint,
      uitleg: "De 2 cijfers staan andersom.",
      weer: ["Je draaide de cijfers weer om.", alleTiental ? `Het eerste cijfer is hier steeds een ${w(tiental)}.` : "Kijk welk cijfer vooraan hoort."],
      scherm,
      over: over((k) => Math.floor(k / 10) === tiental),
      eigen: true,
      bron: "draaiboek §7 `cijfers-omgedraaid` (gezien bij zoeken, Synthesis zei er niets over); de zin is eigen invulling",
    };
  if (typ && x === tiental)
    return {
      code: "alleen-tientalcijfer",
      soort: "tiental",
      denkfout: `typte alleen het eerste cijfer (${x} voor ${v.goed})`,
      eerste: `${koos} De huisnummers hier hebben 2 cijfers.`,
      hint,
      uitleg: "Een huisnummer hier heeft 2 cijfers, net als de buren.",
      weer: ["Je typte weer maar 1 cijfer.", "Kijk naar de bordjes: daar staan steeds 2 cijfers."],
      scherm,
      over: [],
      eigen: true,
      bron: "draaiboek §7 `alleen-tientalcijfer` (gezien bij zoeken); de zin is eigen invulling",
    };
  if (Math.abs(x - v.goed) === 10 && rond)
    return {
      code: "verkeerde-rij",
      soort: "rij",
      denkfout: x < v.goed ? `koos het tiental eronder (${x} voor ${v.goed})` : `koos het tiental erboven (${x} voor ${v.goed})`,
      /* Keuring 10 nov: altijd over het buurhuis van de vraag ("Na 39", "Voor 30"), zodat de zin bij elke soort vraag klopt. */
      eerste: `${vooruit(v) ? "Na" : "Voor"} ${w(buur(v))} komt een ${x < v.goed ? "groter" : "kleiner"} nummer dan ${X}.`,
      hint,
      uitleg: `Het nummer dat we zoeken, begint met een ${w(tiental)}.`,
      weer: [x < v.goed ? `Je ${typ ? "typte" : "koos"} weer een te klein nummer.` : `Je ${typ ? "typte" : "koos"} weer een te groot nummer.`, "Kijk goed naar het eerste cijfer."],
      scherm,
      over: over((k) => (x < v.goed ? k > x : k < x)),
      eigen: v.soort !== "na",
      bron: "draaiboek §3 C.2 `verkeerde-rij` (Synthesis: alleen \"dat klopt niet helemaal\", geen woord over het tiental) en §3 C.5 (tiental-hulp)",
    };
  if (Math.abs(x - v.goed) === 10)
    return {
      code: "tien-ernaast",
      soort: "rij",
      denkfout: `zit er 10 naast (${x} voor ${v.goed})`,
      eerste: `${X} begint met een ${w(Math.floor(x / 10))}. De huizen ernaast beginnen met een ${w(tiental)}.`,
      hint,
      uitleg: "Je zit er 10 naast.",
      weer: [`Je ${sleep ? "sleepte" : "koos"} weer een nummer met een ander cijfer vooraan.`, `Kijk naar het eerste cijfer van de buren.`],
      scherm,
      over: over((k) => Math.floor(k / 10) === tiental),
      eigen: true,
      bron: "draaiboek §3 A.2 `tien-ernaast` (\"je zit er 10 onder\", bij zoeken); hier eigen invulling",
    };
  if (x === (vooruit(v) ? v.goed + 1 : v.goed - 1))
    return {
      code: "een-te-veel",
      soort: "over",
      denkfout: vooruit(v) ? "telde 2 verder in plaats van 1 (sloeg een huis over)" : "telde 2 terug in plaats van 1 (sloeg een huis over)",
      eerste: kies3([`Met ${X} sla je een huis over.`, `${X} ligt 1 huis te ver.`, `Bij ${X} ga je een huis te ver.`], v),
      hint,
      uitleg: vooruit(v) ? "Er komt steeds 1 bij, niet 2." : "Er gaat steeds 1 af, niet 2.",
      weer: ["Je sloeg weer een huis over.", vooruit(v) ? "Tel elk huis mee: steeds 1 verder." : "Tel elk huis mee: steeds 1 terug."],
      scherm,
      over: over((k) => (vooruit(v) ? k < x : k > x)),
      eigen,
      bron: eigen ? "eigen invulling; lijkt op draaiboek §3 C.2 (\"je ging een beetje te ver\")" : "draaiboek §3 C.2 `een-te-veel` (\"je ging een beetje te ver\")",
    };
  if (!vooruit(v) && x > max)
    return {
      code: "verkeerde-richting",
      soort: "richting",
      denkfout: `telde verder in plaats van terug (${x} komt na ${max})`,
      eerste: v.soort === "terug" ? `${X} komt na ${w(max)}. We lopen terug.` : `${X} komt na ${w(max)}. We zoeken het nummer ervoor.`,
      hint,
      uitleg: "Terug tellen gaat naar de kleinere nummers.",
      weer: ["Je telde weer verder in plaats van terug.", "Bij terug tellen wordt het nummer steeds kleiner."],
      scherm,
      over: over((k) => k < x),
      eigen: true,
      bron: "eigen invulling (terugtellen en ervoor zitten niet in Counting On, draaiboek §8)",
    };
  /*
    Keuring 10 nov: staat het gat aan het begin of eind van de straat (erna, ervoor, terug), dan is "aan het begin/eind van
    de straat" en "het vraagteken staat midden in de straat" niet waar. Alleen bij typen kan het kind zo'n nummer kiezen.
  */
  const midden = gat(v) > 0 && gat(v) < v.huizen.length - 1;
  if (!midden && vooruit(v) && x < min)
    return {
      code: "verkeerde-richting",
      soort: "richting-terug",
      denkfout: `telde terug in plaats van verder (${x} komt voor ${min})`,
      eerste: `${X} komt voor ${w(min)}. We zoeken het nummer erna.`,
      hint,
      uitleg: "Verder tellen gaat naar de grotere nummers.",
      weer: [`Je ${typ ? "typte" : "koos"} weer een nummer van vóór de straat.`, "Bij verder tellen wordt het nummer steeds groter."],
      scherm,
      over: over((k) => k > x),
      eigen: true,
      bron: "eigen invulling (alleen bij typen; draaiboek §3 C.2: een zin per soort fout)",
    };
  if (!midden && (vooruit(v) ? x > v.goed : x < v.goed))
    return {
      code: "te-ver",
      soort: "te-ver",
      denkfout: vooruit(v) ? `telde te ver door (${x} in plaats van ${v.goed})` : `telde te ver terug (${x} in plaats van ${v.goed})`,
      eerste: `${X} ligt te ver van ${w(buur(v))} af.`,
      hint,
      uitleg: vooruit(v) ? `Na ${w(buur(v))} komt het nummer dat 1 groter is.` : `Voor ${w(buur(v))} komt het nummer dat 1 kleiner is.`,
      weer: [`Je ${typ ? "typte" : "koos"} weer een nummer dat te ver weg ligt.`, vooruit(v) ? "Tel maar 1 stap verder." : "Tel maar 1 stap terug."],
      scherm,
      over: over((k) => (vooruit(v) ? k < x : k > x)),
      eigen: v.soort !== "na",
      bron: "draaiboek §3 C.2 (\"je ging een beetje te ver\")",
    };
  if (x < min || x > max)
    return {
      code: "buiten-de-rij",
      soort: x < min ? "buiten-begin" : "buiten-eind",
      denkfout: x < min ? `koos een nummer van vóór de straat (${x} komt voor ${min})` : `koos een nummer van na de straat (${x} komt na ${max})`,
      eerste: `${sleep ? "Huis " : ""}${X} komt ${x < min ? `voor ${w(min)}, aan het begin` : `na ${w(max)}, aan het eind`} van de straat.`,
      hint,
      uitleg: `${plekWoord(v) === "de lege plek" ? "De lege plek" : "Het vraagteken"} staat midden in de straat.`,
      weer: [`Je ${sleep ? "sleepte" : "koos"} weer een nummer van het ${x < min ? "begin" : "eind"}.`, "Kijk alleen naar de huizen naast het gat."],
      scherm,
      over: over((k) => (x < min ? k > min : k < max)),
      eigen: true,
      bron: "eigen invulling (ertussen en slepen zitten niet in Counting On, draaiboek §8)",
    };
  return {
    code: "onduidelijk",
    soort: "onduidelijk",
    denkfout: "niet duidelijk (geen reden verzonnen)",
    eerste: "",
    hint,
    uitleg: "We tellen samen langs de huizen.",
    weer: [],
    scherm,
    over: typ ? [] : andere,
    eigen,
    bron: "BLIEPO-KARAKTER.md §10",
  };
}

/** De meest voorkomende foute antwoorden bij typen (bij typen kan alles; de rest is `onduidelijk`). */
export function typFouten(v: Vraag): number[] {
  const bekend = nummers(v);
  const t = Math.floor(v.goed / 10);
  const lijst = new Set<number>([...bekend, vooruit(v) ? v.goed + 1 : v.goed - 1, v.goed + (vooruit(v) ? -10 : 10), t]);
  if (!vooruit(v)) lijst.add(Math.max(...bekend) + 1);
  const om = Number([...String(v.goed)].reverse().join(""));
  if (om !== v.goed && om > 9) lijst.add(om);
  lijst.delete(v.goed);
  return [...lijst].sort((a, b) => a - b);
}

/** De fouttabel van een vraag: elk fout antwoord (bij typen de meest voorkomende). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  const lijst = v.opties ?? v.losse ?? typFouten(v);
  return Object.fromEntries(lijst.filter((k) => k !== v.goed).map((k) => [String(k), huisFout(k, v)]));
}
