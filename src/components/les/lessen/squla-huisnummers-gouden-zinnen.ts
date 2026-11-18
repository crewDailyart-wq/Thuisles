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
 *
 * 18 november 2026 (Sara: Bliepo klinkt als een warme juf; zelfde aanpak als de proefles Tellen en de les Splitsen):
 * elke zin is nagelopen en waar een zin terugkomt, staat er een rijtje versies. De les kiest met de gedeelde kiezer
 * (nooit-dubbel.ts): nooit 2 keer achter elkaar dezelfde zin. Een getal klinkt nooit 2 keer vlak achter elkaar, en een
 * hint eindigt niet meer met een vraag die er meteen daarna nog eens komt. Oud naast nieuw: WIJZIGINGEN-ZINNEN-HUISNUMMERS.md.
 */

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

/** Zonder kleurcode: {12:wit} wordt 12. */
const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
/** De getallen in een zin. */
export const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
/** Noemen 2 zinnen hetzelfde getal? (Sara, 18 nov 2026: een getal klinkt nooit 2 keer vlak achter elkaar.) */
export const deeltGetal = (a: string, b: string) => getallenIn(a).some((n) => getallenIn(b).includes(n));
/** Past zin `z` achter de zinnen `eerder`: geen getal en geen stuk van 4 woorden dat er net al was. */
export const pastNa =
  (...eerder: string[]) =>
  (z: string) =>
    eerder.every((a) => !deeltGetal(a, z) && !deeltStuk(a, z, 4));

/**
 * WARME ZINNEN IN VARIANTEN (Sara, 18 november 2026; zelfde aanpak als de proefles Tellen en de les Splitsen). Waar een
 * zin in de les terugkomt, staat hier een rijtje; de les kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit 2 keer
 * achter elkaar dezelfde zin, ook niet over vragen heen. Oud naast nieuw: WIJZIGINGEN-ZINNEN-HUISNUMMERS.md.
 */
export const ZIN = {
  /** Stap 1: openen. Eigen beginzin van de les (BOUWREGELS 4.3); geen startvraag (draaiboek §0). Samen met de groet 1 stuk. */
  begin: ["Vandaag zoeken we huisnummers. In elke straat ontbreekt er 1.", "We gaan samen huisnummers zoeken. In elke straat ontbreekt 1 nummer."],
  /** Een nieuw blok met grotere getallen (draaiboek §2 stap 2 en 4: "nu tellen we met grotere getallen", "we gaan een stukje verder"). */
  blok: ["", "Nu komen er grotere huisnummers.", "We gaan nog een stukje verder. Nu komen de huisnummers tot 50."],
  /** De zinnen van de oude les vóór de vraag; alleen de eerste keer per soort (bij terugtellen elke keer, dus daar 3 versies). */
  aanloop: (v: Vraag): string[] =>
    v.soort === "tussen"
      ? ["Kijk, op 1 bordje staat een vraagteken."]
      : v.soort === "sleep"
        ? ["Er ontbreekt 1 huis in de straat."]
        : v.soort === "terug"
          ? ["Nu lopen we terug.", "We lopen terug door de straat.", "Kom, we lopen terug langs de huizen."]
          : [],
  /** De vraag van de oude les; overal dezelfde zin voor dezelfde soort vraag (3.11). */
  vraag: (v: Vraag): string[] => {
    const typ = isTyp(v) ? ["Typ het nummer."] : [];
    if (v.soort === "na") return [`Welk huisnummer komt na ${w(buur(v))}?`, ...typ];
    if (v.soort === "voor") return [`Welk huisnummer komt voor ${w(buur(v))}?`, ...typ];
    if (v.soort === "tussen") return ["Welk huisnummer hoort bij het vraagteken?", ...typ];
    if (v.soort === "sleep") return ["Sleep het goede huis naar de lege plek."];
    return ["Welk huisnummer komt dan?", ...typ];
  },
  /**
   * Een nieuwe poging na de hint: de vraag in andere woorden (draaiboek §3 A.2: "probeer het nog eens; tik op 34"; 3.23).
   * 3 versies per soort: 1 met het buurhuis en 2 zonder getal, voor als de hint dat getal net al noemde. Bij typen zit
   * "typ" in de zin zelf (1 zin in plaats van 2).
   */
  opnieuw: (v: Vraag): string[] => {
    const b = w(buur(v));
    if (v.soort === "sleep") return ["Sleep nu het goede huis naar de lege plek.", "Welk huis hoort op de lege plek? Sleep het erheen."];
    const bordje = "Welk nummer komt er op het bordje met het vraagteken?";
    if (isTyp(v)) return [vooruit(v) ? `Typ het nummer dat na ${b} komt.` : `Typ het nummer dat voor ${b} komt.`, "Typ het nummer bij het vraagteken.", "Typ het nummer dat op het bordje hoort."];
    if (v.soort === "na") return [`Welk nummer komt er na ${b}?`, "Welk nummer hoort bij het vraagteken?", bordje];
    if (v.soort === "tussen") return ["Welk nummer hoort er bij het vraagteken?", "Welk nummer hoort ertussen?", bordje];
    return [`Welk nummer komt er voor ${b}?`, "Welk nummer hoort bij het vraagteken?", bordje];
  },
  /** Typen: het vinkje zonder nummer telt niet als fout (draaiboek §2 stap 6: "vinkje zonder keuze"). */
  typEerst: "Typ eerst een nummer.",
  /** 2e fout: Bliepo doet het samen voor (draaiboek §3 C.5 en D.3: hij telt zelf, 1 stap per keer, het vakje licht op). */
  samen: ["Kom, we tellen samen.", "Weet je wat? We tellen samen.", "Geeft niks. We tellen samen.", "Ik help je even. We tellen samen.", "Laten we samen tellen en kijken."],
  samenBegin: (v: Vraag): string[] =>
    vooruit(v)
      ? ["Ik tel langs de huizen.", "Ik wijs elk huis aan en zeg het nummer.", "Ik tel hardop langs de huizen. Tel maar mee!"]
      : ["Ik tel terug, van rechts naar links.", "Ik loop terug en zeg elk nummer.", "Ik tel hardop terug. Tel maar mee!"],
  samenTel: (n: number) => `${w(n)}.`,
  /**
   * Bij het gat: het nummer komt op het bordje (nu pas het antwoord in beeld, 15.11). Het nummer klinkt 1 keer (was:
   * "En dan 8. Na 7 komt 8."), en de buur die Bliepo net telde, noemt hij niet nog een keer.
   */
  samenGat: (v: Vraag): string[] => {
    const g = w(v.goed);
    if (v.soort === "sleep") return [`En dan ${g}! Dat huis zoeken we.`, `En dan komt ${g}. Dat huis ontbreekt nog.`, `En daarna ${g}. Dat huis hoort op de lege plek.`];
    const waar = v.soort === "na" ? "erna" : v.soort === "tussen" ? "ertussen" : "ervoor";
    return [`En dan ${g}! Dat is het nummer dat we zoeken.`, `En dan komt ${g}. Dat nummer hoort op het bordje.`, `En daarna ${g}. Dat nummer komt ${waar}.`];
  },
  /**
   * De kleine stap van het kind (15.11): het huis met het nieuwe nummer aantikken, of het huis naar de lege plek slepen.
   * Bij tikken zonder getal (Bliepo zei het net); bij slepen met het getal: het kind kiest uit 3 huizen.
   */
  samenStap: (v: Vraag): string[] =>
    v.soort === "sleep"
      ? [`Sleep jij huis ${w(v.goed)} naar de lege plek?`, `Nu jij. Sleep huis ${w(v.goed)} naar de lege plek.`]
      : ["Tik jij op het huis met het nieuwe nummer?", "Nu jij. Tik op het huis met het nieuwe nummer.", "Zie je het nieuwe nummer? Tik op dat huis."],
  samenHand: (v: Vraag): string[] =>
    v.soort === "sleep" ? [`Sleep huis ${w(v.goed)} hierheen.`, `Pak huis ${w(v.goed)} en sleep het naar de lege plek.`] : [`Tik op het huis met ${w(v.goed)}.`, "Tik op het huis met het nieuwe nummer."],
  samenKlaar: (v: Vraag): string[] =>
    v.soort === "sleep"
      ? [`Ja, huis ${w(v.goed)} staat op zijn plek.`, `Precies, daar hoort huis ${w(v.goed)}.`, `Samen is het gelukt: huis ${w(v.goed)} staat erbij.`]
      : [`Ja, dat is huis ${w(v.goed)}.`, `Precies, daar staat huis ${w(v.goed)}.`, `Samen is het gelukt: dat is huis ${w(v.goed)}.`],
  /** Na het vangnet (Bliepo deed de stap zelf): geen "Ja" alsof het kind het deed (keuring Meer-minder, 10 nov). */
  samenZelf: (v: Vraag): string[] =>
    v.soort === "sleep" ? [`Kijk, huis ${w(v.goed)} staat nu op zijn plek.`, `Kijk, ik zet huis ${w(v.goed)} op de lege plek.`] : [`Kijk, hier staat huis ${w(v.goed)}.`, `Kijk, dit is huis ${w(v.goed)}.`],
  /**
   * Bij een opdracht (slepen): het hulphandje wijst de lege plek aan, niet het goede huis (15.17). Elke versie zegt ook
   * wat het kind doet (15.37): de zin komt in Bliepo's tekstvak terwijl de les op het kind wacht.
   */
  sleepHand: ["Hier moet een huis staan. Welk huis past hier?", "Sleep het goede huis naar deze plek.", "Kijk, deze plek is leeg. Sleep het goede huis erheen."],
  /** Hetzelfde antwoord 2 keer (en geen "weer" van de denkfout): niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: number, v: Vraag): string[] =>
    v.soort === "sleep"
      ? [`Je sleepte weer huis ${w(x)}.`, `Weer huis ${w(x)}, zie ik.`, `Daar is huis ${w(x)} weer.`]
      : isTyp(v)
        ? [`Je typte weer ${w(x)}.`, `Weer ${w(x)}, zie ik.`, `Daar is ${w(x)} weer.`]
        : [`Je koos weer ${w(x)}.`, `Je tikte weer op ${w(x)}.`, `Weer ${w(x)}, zie ik.`],
  /** Stap 10: einde. */
  slot: ["Je weet nu welk huisnummer erna, ervoor en ertussen komt.", "Knap, hoor! Je weet welk huisnummer erna, ervoor en ertussen komt.", "Wat heb jij goed geteld: verder en terug, tot wel 50!"],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** Het begin van een nieuwe poging (draaiboek §3 A.2: "probeer het nog eens" / "nog een keer"). */
export const OPNIEUW_BEGIN = ["Probeer het nog eens.", "Toe maar, probeer het nog eens.", "Kom, we proberen het nog eens.", "Nog 1 keer."];

/** Aanmoediging bij het hulphandje (het kind moet slepen of tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/**
 * Reactie na de lof (BLIEPO-KARAKTER.md §4 Huisnummers, zin 56 t/m 60, plus zinnen zonder "Ja"; 18 nov 2026: 3 warme
 * zinnen erbij, naar Synthesis "precies" en "dat klopt" + het getal). De robotzin (laatste) hooguit 1 keer per les.
 */
export function huisReactie(v: Vraag): Rijtje {
  const g = w(v.goed);
  const stap = vooruit(v) ? "Ja, er komt steeds 1 bij." : "Ja, er gaat steeds 1 af.";
  const plek =
    v.soort === "na" ? `Ja, na nummer ${w(buur(v))} komt nummer ${g}.` : v.soort === "tussen" || v.soort === "sleep" ? `Ja, het huis tussen ${w(v.goed - 1)} en ${w(v.goed + 1)} heeft nummer ${g}.` : `Ja, voor nummer ${w(buur(v))} komt nummer ${g}.`;
  return rij([`Ja, het huisnummer is ${g}.`, plek, stap, `Het huisnummer is ${g}.`, `Nummer ${g} past precies.`, `Precies, nummer ${g}.`, `Dat klopt, het is nummer ${g}.`, `Op het bordje hoort ${g}.`, `Nagekeken: nummer ${g} hoort hier.`], [REACTIE_ROBOT]);
}
export const REACTIE_JA = [0, 1, 2];
export const REACTIE_ROBOT = 8;

/* ---------- denkfouten (draaiboek Huisnummers §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["staat-al", "een-te-veel", "verkeerde-richting", "buiten-de-rij", "cijfers-omgedraaid", "tien-ernaast", "verkeerde-rij", "alleen-tientalcijfer", "te-ver", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Alle versies van wat Bliepo bij 1 fout antwoord kan zeggen; de les kiest er steeds 1 (nooit 2 keer dezelfde). */
export type Varianten = {
  /** De eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string[];
  hint: string[];
  /** Uitleg na de 2e fout (daarna meteen samen tellen; dan mag het antwoord in beeld, 15.11). */
  uitleg: string[];
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): "weer …" en een andere uitleg. */
  weerEerste: string[];
  weerUitleg: string[];
};

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** De eerste versie van elke zin (voor de leesbare fouttabel); de les kiest uit `v`. */
  eerste: string;
  hint: string;
  uitleg: string;
  weer: string[];
  v: Varianten;
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

/**
 * De hints: hoe je telt, vanaf het buurhuis (een rood rondje om dat huis als de hint het noemt). 5 versies; geen enkele
 * eindigt met een vraag (de vraag zelf komt er meteen achteraan, 3.23), en 2 versies noemen geen getal, voor als de
 * eerste zin dat getal net al zei.
 */
export function hintsVan(v: Vraag): string[] {
  const r = w(buur(v));
  const plek = plekWoord(v);
  if (vooruit(v))
    return [
      `Kijk naar het huis links van ${plek}. Tel vanaf dat huis verder.`,
      `Begin bij ${r} en tel 1 verder.`,
      "Zeg de nummers hardop, van links naar rechts. Tel dan gewoon verder.",
      `Kijk naar huis ${r}. We zoeken het nummer dat erna komt.`,
      `Er komt steeds 1 bij. Kijk naar huis ${r} en tel verder.`,
    ];
  return [
    `Kijk naar het huis rechts van ${plek}. Tel vanaf dat huis terug.`,
    `Begin bij ${r} en tel 1 terug.`,
    "Zeg de nummers hardop, van rechts naar links. Zo tel je terug.",
    `Kijk naar huis ${r}. We zoeken het nummer dat ervoor komt.`,
    `Er gaat steeds 1 af. Kijk naar huis ${r} en tel terug.`,
  ];
}
/** De eerste versie van de hint (voor de leesbare fouttabel). */
export const hintVan = (v: Vraag): string => hintsVan(v)[0];
/** Noemt deze hint het buurhuis? Dan krijgt dat huis het rode rondje (7.8: een rondje alleen als Bliepo iets noemt). */
export const hintNoemtHuis = (hint: string) => /\bhuis\b|begin bij/i.test(kaal(hint));

const SCHERM_KIES = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; een rood rondje om het huis dat Bliepo noemt (het buurhuis, nooit het antwoord); dan de vraag in andere woorden en dezelfde keuzes terug (geen pijl)";
const SCHERM_TYP = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het invulvak wordt leeg; een rood rondje om het buurhuis; dan de vraag in andere woorden en het lege invulvak terug";
const SCHERM_SLEEP = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het huis glijdt terug naar beneden (geen schudden, geen rood); een rood rondje om het buurhuis; dan de opdracht opnieuw";

type Ruw = Omit<Fout, "eerste" | "hint" | "uitleg" | "weer">;
const maak = (d: Ruw): Fout => ({ ...d, eerste: d.v.eerste[0] ?? "", hint: d.v.hint[0], uitleg: d.v.uitleg[0] ?? "", weer: d.v.weerEerste.length ? [d.v.weerEerste[0], d.v.weerUitleg[0]] : [] });

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
  const eerste =
    v.soort === "sleep"
      ? [`Huis ${X} past niet op deze plek.`, `Huis ${X} hoort hier niet.`, `Je sleepte huis ${X}. Dat huis past hier niet.`, `Kijk, huis ${X} past hier niet.`]
      : [`Je koos ${X}. Dat nummer hoort hier niet.`, `${X} past hier niet.`, `${X}? Dat nummer past niet bij het vraagteken.`];
  return maak({ ...f, v: { ...f.v, eerste, weerEerste: [], weerUitleg: [] }, over: (v.opties ?? v.losse ?? []).filter((k) => k !== x), noot: "wat er mis is niet genoemd: dan bleef er maar 1 keuze over" });
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
  /** "9?" (bij slepen "Huis 9?"): Bliepo herhaalt wat het kind koos, zoals Synthesis ("39? heel dichtbij"). */
  const vraagt = sleep ? `Huis ${X}?` : `${X}?`;
  /** "koos", "typte" of "sleepte". */
  const ww = typ ? "typte" : sleep ? "sleepte" : "koos";
  const scherm = typ ? SCHERM_TYP : sleep ? SCHERM_SLEEP : SCHERM_KIES;
  const hint = hintsVan(v);
  const eigen = eigenInvulling(v);
  const tiental = Math.floor(v.goed / 10);
  const T = w(tiental);
  const B = w(buur(v));
  const plek = plekWoord(v);
  const over = (zelf: (k: number) => boolean) => (typ ? [] : andere.filter(zelf));
  const rond = v.goed % 10 === 0 || v.goed % 10 === 9;

  if (bekend.includes(x))
    return maak({
      code: "staat-al",
      soort: "staat-al",
      denkfout: "koos een nummer dat al in de straat staat (keek naar het buurhuis, of telde de verkeerde kant op)",
      v: {
        eerste: [`${X} staat al in de straat.`, `Huis ${X} is er al.`, `Kijk, ${X} staat er al.`, `${koos} Dat nummer zie je al in de straat.`, `${vraagt} Dat huis staat er al.`],
        hint,
        uitleg: ["Elk nummer staat maar 1 keer in de straat.", "In een straat heeft elk huis een eigen nummer.", "Een nummer dat er al staat, komt niet nog een keer."],
        weerEerste: [`Je ${ww} weer een nummer dat er al staat.`, "Kijk maar: dit nummer staat er ook al.", "Weer een nummer dat er al staat, zie ik."],
        weerUitleg: ["Het nummer dat we zoeken, staat er nog niet.", "We zoeken een nummer dat je nog niet ziet."],
      },
      scherm,
      over: over((k) => !bekend.includes(k)),
      eigen,
      bron: eigen ? "eigen invulling (draaiboek §8: niet in Counting On)" : "draaiboek §3 C.2 (een andere zin per soort fout)",
    });
  /* Keuring 10 nov: "De nummers hier beginnen met een 2" alleen als ALLE nummers in de straat zo beginnen (bij 30, 31 → 29 niet). */
  const alleTiental = bekend.every((n) => Math.floor(n / 10) === tiental);
  if (x > 9 && Number([...String(x)].reverse().join("")) === v.goed)
    return maak({
      code: "cijfers-omgedraaid",
      soort: "cijfers",
      denkfout: `de cijfers andersom (${x} voor ${v.goed})`,
      v: {
        /* Geen versie zegt dát de cijfers andersom staan: dan wist het kind het antwoord (15.17). Dat komt pas bij de uitleg. */
        eerste: alleTiental
          ? [`${koos} De nummers hier beginnen met een ${T}.`, `${vraagt} In deze straat begint elk nummer met een ${T}.`, `${koos} Kijk naar de buren: die beginnen met een ${T}.`]
          : [`${koos} Kijk goed welk cijfer vooraan hoort.`, `${vraagt} Kijk nog eens welk cijfer vooraan staat.`, `${koos} Let goed op het eerste cijfer.`],
        hint,
        uitleg: ["De cijfers staan andersom.", "Je hebt de goede cijfers, maar ze staan omgedraaid."],
        weerEerste: ["Je hebt de cijfers weer omgedraaid.", "De cijfers staan weer andersom.", "Weer andersom, zie ik."],
        weerUitleg: alleTiental ? [`Het eerste cijfer is hier steeds een ${T}.`, `Kijk naar de buren: vooraan staat steeds een ${T}.`] : ["Kijk welk cijfer vooraan hoort.", "Kijk naar de buren. Welk cijfer staat daar vooraan?"],
      },
      scherm,
      over: over((k) => Math.floor(k / 10) === tiental),
      eigen: true,
      bron: "draaiboek §7 `cijfers-omgedraaid` (gezien bij zoeken, Synthesis zei er niets over); de zin is eigen invulling",
    });
  if (typ && x === tiental)
    return maak({
      code: "alleen-tientalcijfer",
      soort: "tiental",
      denkfout: `typte alleen het eerste cijfer (${x} voor ${v.goed})`,
      v: {
        /* Zonder het getypte cijfer erbij: "Je typte 2. De huisnummers hier hebben 2 cijfers." zei 2 keer 2. */
        eerste: ["Je typte 1 cijfer. De huisnummers hier hebben er 2.", "Ik zie maar 1 cijfer. Op de bordjes staan er steeds 2.", `${X}? Dat is nog maar het begin van het nummer.`],
        hint,
        uitleg: ["Een huisnummer hier heeft 2 cijfers, net als de buren.", "Kijk naar de buren: elk nummer heeft 2 cijfers.", "Er hoort nog een cijfer achter.", "Het nummer is nog niet af."],
        weerEerste: ["Je typte weer maar 1 cijfer.", "Weer maar 1 cijfer, zie ik.", "Ik zie weer maar 1 cijfer."],
        weerUitleg: ["Kijk naar de bordjes: daar staan steeds 2 cijfers.", "Elk bordje in deze straat heeft 2 cijfers.", "Er hoort nog een cijfer achter."],
      },
      scherm,
      over: [],
      eigen: true,
      bron: "draaiboek §7 `alleen-tientalcijfer` (gezien bij zoeken); de zin is eigen invulling",
    });
  if (Math.abs(x - v.goed) === 10 && rond) {
    const klein = x < v.goed ? "klein" : "groot";
    const gk = x < v.goed ? "groter" : "kleiner";
    const Na = vooruit(v) ? "Na" : "Voor";
    return maak({
      code: "verkeerde-rij",
      /* "Weer te klein" klopt alleen als het de 1e keer ook te klein was (18 nov: was 1 soort voor klein, groot en 10 ernaast). */
      soort: `rij-${klein}`,
      denkfout: x < v.goed ? `koos het tiental eronder (${x} voor ${v.goed})` : `koos het tiental erboven (${x} voor ${v.goed})`,
      v: {
        /* Keuring 10 nov: altijd over het buurhuis van de vraag ("Na 39", "Voor 30"), zodat de zin bij elke soort vraag klopt. */
        eerste: [`${Na} ${B} komt een ${gk} nummer dan ${X}.`, `${vraagt} ${Na} ${B} komt een ${gk} nummer.`, `${koos} Dat nummer is te ${klein}.`],
        hint,
        uitleg: [`Het nummer dat we zoeken, begint met een ${T}.`, `Let op het eerste cijfer. Dat is hier een ${T}.`],
        weerEerste: [`Je ${ww} weer een te ${klein} nummer.`, `Dat nummer is weer te ${klein}.`, `Weer te ${klein}, zie ik.`],
        weerUitleg: ["Kijk goed naar het eerste cijfer.", "Let op het cijfer vooraan."],
      },
      scherm,
      over: over((k) => (x < v.goed ? k > x : k < x)),
      eigen: v.soort !== "na",
      bron: "draaiboek §3 C.2 `verkeerde-rij` (Synthesis: alleen \"dat klopt niet helemaal\", geen woord over het tiental) en §3 C.5 (tiental-hulp)",
    });
  }
  if (Math.abs(x - v.goed) === 10)
    return maak({
      code: "tien-ernaast",
      soort: "tien",
      denkfout: `zit er 10 naast (${x} voor ${v.goed})`,
      v: {
        eerste: [`${X} begint met een ${w(Math.floor(x / 10))}. De huizen ernaast beginnen met een ${T}.`, `${koos} Kijk naar de buren: die beginnen met een ${T}.`, `${vraagt} De huizen ernaast beginnen met een ${T}.`],
        hint,
        uitleg: ["Je zit er 10 naast.", "Dat scheelt precies 10."],
        weerEerste: [`Je ${ww} weer een nummer met een ander cijfer vooraan.`, "Weer een ander cijfer vooraan, zie ik.", "Vooraan staat weer een ander cijfer dan bij de buren."],
        weerUitleg: ["Kijk naar het eerste cijfer van de buren.", "De buren laten zien welk cijfer vooraan hoort."],
      },
      scherm,
      over: over((k) => Math.floor(k / 10) === tiental),
      eigen: true,
      bron: "draaiboek §3 A.2 `tien-ernaast` (\"je zit er 10 onder\", bij zoeken); hier eigen invulling",
    });
  if (x === (vooruit(v) ? v.goed + 1 : v.goed - 1))
    return maak({
      code: "een-te-veel",
      soort: "over",
      denkfout: vooruit(v) ? "telde 2 verder in plaats van 1 (sloeg een huis over)" : "telde 2 terug in plaats van 1 (sloeg een huis over)",
      v: {
        /* "Je ging een beetje te ver" is de zin van Synthesis (draaiboek §3 C.2), in het Nederlands. */
        eerste: [`Met ${X} sla je een huis over.`, `${X} ligt 1 huis te ver.`, `Bij ${X} ga je een huis te ver.`, `${koos} Je ging een beetje te ver.`, `${vraagt} Dat is net 1 huis te ver.`],
        hint,
        uitleg: [vooruit(v) ? "Er komt steeds 1 bij, niet 2." : "Er gaat steeds 1 af, niet 2.", "Elk huis telt mee. We slaan er geen over.", "We zoeken het huis er vlak naast."],
        weerEerste: ["Je hebt weer een huis overgeslagen.", "Weer een huis te ver, zie ik.", "Dat is weer net te ver."],
        weerUitleg: vooruit(v) ? ["We tellen elk huis mee: steeds 1 verder.", "We gaan maar 1 huis verder, niet meer."] : ["We tellen elk huis mee: steeds 1 terug.", "We gaan maar 1 huis terug, niet meer."],
      },
      scherm,
      over: over((k) => (vooruit(v) ? k < x : k > x)),
      eigen,
      bron: eigen ? "eigen invulling; lijkt op draaiboek §3 C.2 (\"je ging een beetje te ver\")" : "draaiboek §3 C.2 `een-te-veel` (\"je ging een beetje te ver\")",
    });
  if (!vooruit(v) && x > max) {
    const terug = v.soort === "terug";
    return maak({
      code: "verkeerde-richting",
      soort: "richting",
      denkfout: `telde verder in plaats van terug (${x} komt na ${max})`,
      v: {
        eerste: terug
          ? [`${X} komt na ${w(max)}. We lopen terug.`, `${koos} Dat nummer komt pas na ${w(max)}.`, `${vraagt} Zo tel je verder, maar wij tellen terug.`]
          : [`${X} komt na ${w(max)}. We zoeken het nummer ervoor.`, `${koos} Dat nummer komt pas na ${w(max)}.`, `${vraagt} Zo tel je verder, maar we zoeken het nummer ervoor.`],
        hint,
        uitleg: ["Terug tellen gaat naar de kleinere nummers.", terug ? "Als we terug lopen, worden de nummers kleiner." : "Het nummer ervoor is altijd kleiner."],
        weerEerste: ["Je hebt weer verder geteld in plaats van terug.", "Weer de andere kant op, zie ik.", "Dat is weer verder tellen."],
        weerUitleg: ["Bij terug tellen wordt het nummer steeds kleiner.", "We gaan naar links. Daar staan de kleinere nummers."],
      },
      scherm,
      over: over((k) => k < x),
      eigen: true,
      bron: "eigen invulling (terugtellen en ervoor zitten niet in Counting On, draaiboek §8)",
    });
  }
  /*
    Keuring 10 nov: staat het gat aan het begin of eind van de straat (erna, ervoor, terug), dan is "aan het begin/eind van
    de straat" en "het vraagteken staat midden in de straat" niet waar. Alleen bij typen kan het kind zo'n nummer kiezen.
  */
  const midden = gat(v) > 0 && gat(v) < v.huizen.length - 1;
  if (!midden && vooruit(v) && x < min)
    return maak({
      code: "verkeerde-richting",
      soort: "richting-terug",
      denkfout: `telde terug in plaats van verder (${x} komt voor ${min})`,
      v: {
        eerste: [`${X} komt voor ${w(min)}. We zoeken het nummer erna.`, `${koos} Dat nummer komt al voor ${w(min)}.`, `${vraagt} Zo tel je terug, maar we zoeken het nummer erna.`],
        hint,
        uitleg: ["Verder tellen gaat naar de grotere nummers.", "Het nummer erna is altijd groter."],
        weerEerste: [`Je ${ww} weer een nummer dat voor de straat komt.`, "Weer de andere kant op, zie ik.", "Dat is weer terug tellen."],
        weerUitleg: ["Bij verder tellen wordt het nummer steeds groter.", "We gaan naar rechts. Daar staan de grotere nummers."],
      },
      scherm,
      over: over((k) => k > x),
      eigen: true,
      bron: "eigen invulling (alleen bij typen; draaiboek §3 C.2: een zin per soort fout)",
    });
  if (!midden && (vooruit(v) ? x > v.goed : x < v.goed))
    return maak({
      code: "te-ver",
      soort: "te-ver",
      denkfout: vooruit(v) ? `telde te ver door (${x} in plaats van ${v.goed})` : `telde te ver terug (${x} in plaats van ${v.goed})`,
      v: {
        eerste: [`${X} ligt te ver van ${B} af.`, `${koos} Zo ver hoeven we niet te tellen.`, `${vraagt} Dat is te ver geteld.`],
        hint,
        uitleg: vooruit(v) ? [`Na ${B} komt het nummer dat 1 groter is.`, "Het nummer dat we zoeken, komt er meteen na.", "We gaan maar een klein stukje verder."] : [`Voor ${B} komt het nummer dat 1 kleiner is.`, "Het nummer dat we zoeken, komt er meteen voor.", "We gaan maar een klein stukje terug."],
        weerEerste: [`Je ${ww} weer een nummer dat te ver weg ligt.`, "Dat is weer te ver.", "Weer te ver, zie ik."],
        weerUitleg: vooruit(v) ? ["We tellen maar 1 stap verder.", "We gaan maar 1 huis verder."] : ["We tellen maar 1 stap terug.", "We gaan maar 1 huis terug."],
      },
      scherm,
      over: over((k) => (vooruit(v) ? k < x : k > x)),
      eigen: v.soort !== "na",
      bron: "draaiboek §3 C.2 (\"je ging een beetje te ver\")",
    });
  if (x < min || x > max) {
    const be = x < min ? "begin" : "eind";
    const ding = sleep ? "huis" : "nummer";
    return maak({
      code: "buiten-de-rij",
      soort: x < min ? "buiten-begin" : "buiten-eind",
      denkfout: x < min ? `koos een nummer van vóór de straat (${x} komt voor ${min})` : `koos een nummer van na de straat (${x} komt na ${max})`,
      v: {
        eerste: [
          `${sleep ? "Huis " : ""}${X} komt ${x < min ? `voor ${w(min)}, aan het begin` : `na ${w(max)}, aan het eind`} van de straat.`,
          `${koos} Dat ${ding} komt ${x < min ? `al voor ${w(min)}` : `pas na ${w(max)}`}.`,
          `${vraagt} Dat hoort helemaal aan het ${be} van de straat.`,
        ],
        hint,
        uitleg: [`${plek === "de lege plek" ? "De lege plek" : "Het vraagteken"} staat midden in de straat.`, "We zoeken een nummer dat tussen de andere huizen past."],
        weerEerste: [`Je ${ww} weer een ${ding} dat aan het ${be} hoort.`, `Dat ${ding} hoort weer aan het ${be} van de straat.`, `Weer een ${ding} van het ${be}, zie ik.`],
        weerUitleg: [`Kijk alleen naar de huizen naast ${plek}.`, `De buren van ${plek} helpen je.`],
      },
      scherm,
      over: over((k) => (x < min ? k > min : k < max)),
      eigen: true,
      bron: "eigen invulling (ertussen en slepen zitten niet in Counting On, draaiboek §8)",
    });
  }
  return maak({
    code: "onduidelijk",
    soort: "onduidelijk",
    denkfout: "niet duidelijk (geen reden verzonnen)",
    /* Geen eigen uitleg: "We tellen samen langs de huizen." zei hetzelfde als "Kom, we tellen samen." erna (15.29). */
    v: { eerste: [], hint, uitleg: [], weerEerste: [], weerUitleg: [] },
    scherm,
    over: typ ? [] : andere,
    eigen,
    bron: "BLIEPO-KARAKTER.md §10",
  });
}

/* ---------- welke versie Bliepo zegt (zuiver: de les en het fouttabel-script gebruiken precies dit) ---------- */

/** De kiezer van de les (nooit-dubbel.ts): een zin uit `zinnen`, nooit 2 keer achter elkaar dezelfde binnen 1 `sleutel`. */
export type Variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => string;

/**
 * Wat Bliepo zegt bij een antwoord dat niet goed is.
 *   1e keer: eerste zin (wat het kind koos) + hint. De hint noemt geen getal dat de eerste zin net noemde.
 *   2e keer: eerste zin + uitleg; of, bij 2 keer dezelfde denkfout, "weer …" + een andere uitleg; of, bij hetzelfde
 *   antwoord 2 keer, "Je koos weer …" + uitleg. Daarna telt Bliepo samen met het kind.
 * `onduidelijk` = een zin uit het vaste rijtje (BLIEPO-KARAKTER.md §10) als de denkfout niet duidelijk is.
 */
export function foutStuk(variant: Variant, f: Fout, v: Vraag, poging: 1 | 2, eerder: Fout | null, o: { x: number; zelfdeAntwoord: boolean; onduidelijk: () => string }): string[] {
  if (f.code === "onduidelijk") {
    const e = o.zelfdeAntwoord && poging === 2 ? variant("weerGekozen", ZIN.weerGekozen(o.x, v)) : o.onduidelijk();
    return poging === 1 ? [e, variant("hint", f.v.hint, pastNa(e))] : [e];
  }
  if (poging === 1) {
    const e = variant("eerste", f.v.eerste);
    return [e, variant("hint", f.v.hint, pastNa(e))];
  }
  /* "Weer" alleen als Bliepo de 1e keer al zei wat er mis was. */
  if (eerder !== null && eerder.soort === f.soort && eerder.code !== "onduidelijk" && !eerder.noot && !f.noot && f.v.weerEerste.length > 0) {
    const weer = variant("weer", f.v.weerEerste);
    return [weer, variant("uitleg", f.v.weerUitleg, pastNa(weer))];
  }
  const e = o.zelfdeAntwoord ? variant("weerGekozen", ZIN.weerGekozen(o.x, v)) : variant("eerste", f.v.eerste);
  return [e, variant("uitleg", f.v.uitleg, pastNa(e))];
}

/** De nieuwe poging na de hint: "Probeer het nog eens." + de vraag in andere woorden, zonder een getal dat net al klonk. */
export function opnieuwZin(variant: Variant, v: Vraag, net: string[]): string {
  const geenGetal = (z: string) => net.every((a) => !deeltGetal(a, z));
  return `${variant("opnieuwBegin", OPNIEUW_BEGIN, geenGetal)} ${variant("opnieuw", ZIN.opnieuw(v), geenGetal)}`;
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
