/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Meer-minder (squla-meer-minder-evenveel2-1-gouden, 10 november 2026), op één
 * plek, met de FOUTTABEL. De les zelf (squla-meer-minder-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is, overgang)
 *     zijn dezelfde als in de andere gouden lessen (BLIEPO-KARAKTER.md). Hier alleen de reactie bij Vergelijken
 *     (BLIEPO-KARAKTER.md §4, zin 31 t/m 35) en bij Tellen (zin 6, 7, 10), met zinnen zonder "Ja" voor na een lofzin met "Ja".
 *   - De inhoud (15 vragen, getallen en keuzes) is die van squla-meer-minder-evenveel2-1 "De meeste" (BOUWREGELS 15.22):
 *     8 keer kralen tellen en het getal kiezen dat evenveel is, daarna 7 keer 3 kaarten met koekjes: waar liggen de
 *     meeste? De vraagzinnen zijn die van de oude les; alleen waar LESRECEPT.md het vraagt (dezelfde zin niet steeds
 *     helemaal herhalen) zijn ze later korter (KEUZES-VOOR-SARA.md, Ronde 25).
 *   - Het skelet volgt het draaiboek Meer-minder (More or Less, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/meer-minder.md):
 *     tik op de groep met de meeste + vinkje (§2 stap 2), bij een fout het beeld zo veranderen dat je het verschil ziet
 *     (§6: op een rij leggen), bij de 2e fout samen tellen met een getal boven elke groep (§3 A.5). Synthesis noemt de
 *     denkfout bijna nooit; Bliepo wel (15.9), maar alleen wat zeker is: de gekozen kaart heeft de minste, of veel maar
 *     niet de meeste; bij tellen: het gekozen getal is te klein, te groot, of alleen de volle rijen.
 *   - Kralen tellen en een getal kiezen zit NIET in More or Less: de vraag zelf is "eigen invulling, niet van Synthesis"
 *     (het samen tellen bij de 2e fout wel: draaiboek §3 A.5 en G).
 *
 * Leesbare versie: FOUTTABEL-squla-meer-minder-evenveel2-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-meer-minder-gouden.ts`; dat script doet ook de reken- en verklapcontrole).
 * {12:paars} = een getal in de kleur van de kralen; {13:bruin} = in de kleur van de koekjes (BOUWREGELS 2.1, 2.2).
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

/** De kleur van de kralen en de koekjes (dezelfde als in het vlak: MM_VASTE_KLEUR). */
export const KRAAL = "paars";
export const KOEKJE = "bruin";
/** Een getal in de zin, in de kleur van het voorwerp waar het naar verwijst (BOUWREGELS 2.1, 2.2). */
export const g = (n: number, k: string) => `{${n}:${k}}`;
const kr = (n: number) => g(n, KRAAL);
const ko = (n: number) => g(n, KOEKJE);

/* ---------- de 15 vragen van squla-meer-minder-evenveel2-1 (zelfde volgorde, getallen en keuzes) ---------- */

export type Telvraag = { nr: number; id: string; soort: "tel"; n: number; keuzes: number[] };
export type Driekaart = { nr: number; id: string; soort: "drie"; kaarten: number[] };
export type Vraag = Telvraag | Driekaart;

const tel = (nr: number, n: number, keuzes: number[]): Telvraag => ({ nr, id: `vraag${nr}-kralen-${n}`, soort: "tel", n, keuzes });
const drie = (nr: number, kaarten: number[]): Driekaart => ({ nr, id: `vraag${nr}-koekjes-${kaarten.join("-")}`, soort: "drie", kaarten });

export const VRAGEN: Vraag[] = [
  tel(1, 9, [9, 10, 11]),
  tel(2, 12, [11, 12, 13]),
  tel(3, 16, [15, 16, 17]),
  tel(4, 13, [13, 14, 15]),
  tel(5, 10, [8, 9, 10]),
  tel(6, 17, [15, 16, 17]),
  tel(7, 11, [10, 11, 12]),
  tel(8, 14, [12, 13, 14]),
  drie(9, [11, 13, 12]),
  drie(10, [14, 16, 15]),
  drie(11, [12, 10, 11]),
  drie(12, [13, 17, 14]),
  drie(13, [15, 14, 13]),
  drie(14, [16, 15, 17]),
  drie(15, [12, 14, 13]),
];

/** Rijen van 5 (de laatste rij is het restje), zoals de oude les de kralen en koekjes neerlegt. */
export const rijenVan = (n: number, per = 5) => Array.from({ length: Math.ceil(n / per) }, (_, r) => Math.min(per, n - r * per));
/** Waar de volle rijen ophouden: 5, 10, 15 … (het getal na de volle rijen). */
export const volleRijen = (n: number) => Math.floor((n - 1) / 5) * 5;

/* ---------- vaste zinnen van het verloop (draaiboek Meer-minder §2; eigen woorden) ---------- */

export const ZIN = {
  /** Stap 1: openen. Eigen beginzin van de les (BOUWREGELS 4.3); geen startvraag (draaiboek §2 stap 1). Samen met de groet 1 stuk. */
  begin: "In deze les tel je eerst kralen. Daarna zoek je waar de meeste koekjes liggen.",
  /** Tellen: de vraag van de oude les; de eerste 2 keer helemaal, daarna korter (LESRECEPT.md). */
  /* Kort: om en om 2 zinnen, zodat dezelfde tekst niet direct terugkomt (F7: een gelijke zin stond eerst wit en werd daarna gedimd). */
  telVraag: (kort: boolean, nr = 0): string[] => (kort ? [nr % 2 ? "Hoeveel kralen liggen er?" : "Hoeveel kralen zijn het?"] : ["Tel de kralen.", "Hoeveel kralen zijn het?"]),
  /** Een nieuwe poging na de hint (een nieuwe antwoordpoging mag de vraag opnieuw stellen, 3.23), iets anders gezegd. */
  telOpnieuw: ["Hoeveel kralen tel je nu?"],
  /** De overgang naar de koekjes (draaiboek §2 stap 5: "nu iets anders"); wat het kind ziet verandert. */
  naarKoekjes: "Nu iets anders: 3 kaarten met koekjes.",
  /** De vraag van de oude les; de eerste keer met wat het kind doet (tikken), daarna alleen de vraag. */
  drieVraag: (eerste: boolean, nr = 0): string[] => (eerste ? ["Waar liggen de meeste koekjes?", "Tik op die kaart."] : [nr % 2 ? "Op welke kaart liggen de meeste koekjes?" : "Waar liggen de meeste koekjes?"]),
  drieOpnieuw: ["Waar liggen nu de meeste koekjes?"],
  /** 1e fout bij de koekjes: het beeld verandert (draaiboek §6: op een rij leggen); dit is het eerste deel van de hint. */
  opRij: "Ik leg de koekjes in rijen van 10.",
  /** 2e fout: Bliepo doet het samen voor (draaiboek §3 A.5: samen tellen, een getal boven elke groep). */
  samen: "Kom, we tellen samen.",
  /** Samen tellen bij de kralen: Bliepo telt de volle rijen, het kind telt de laatste rij (de kleine stap). */
  samenVol: (n: number) => (volleRijen(n) === 5 ? "Ik tel de eerste rij." : "Ik tel de volle rijen."),
  samenTelRij: (k: number) => `${kr(k)}.`,
  samenJij: (n: number) => (rijenVan(n).at(-1) === 1 ? "Tik jij op de laatste kraal?" : "Tel jij verder? Tik op de kralen in de laatste rij."),
  samenHand: "Tik op de volgende kraal.",
  samenTel: (k: number) => `${kr(k)}.`,
  samenKlaar: (n: number) => `Het zijn ${kr(n)} kralen. ${kr(n)} is evenveel.`,
  /** Samen tellen bij de koekjes: Bliepo telt elke kaart, het getal staat erboven; het kind tikt de kaart (de kleine stap). */
  samenKaart: (n: number, j: number) => [`Hier liggen er ${ko(n)}.`, `Op deze kaart ${ko(n)}.`, `En hier ${ko(n)}.`][j] ?? `Hier liggen er ${ko(n)}.`,
  samenMeeste: (max: number) => `${ko(max)} is het meest. Tik op die kaart.`,
  samenKaartHand: "Tik op de kaart met het grootste getal.",
  samenKaartKlaar: (max: number) => `Ja, daar liggen de meeste koekjes: ${ko(max)}.`,
  /** Na het vangnet (Bliepo wees de kaart zelf aan): geen "Ja", want het kind tikte die kaart niet (keuring 10 nov). */
  samenKaartZelf: (max: number) => `Kijk, hier liggen de meeste koekjes: ${ko(max)}.`,
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: number) => `Je koos weer ${kr(x)}.`,
  /** Stap 8: einde. */
  slot: "Je kunt nu tellen hoeveel er zijn, en je ziet waar de meeste liggen.",
  kaartTik: "Tik op de kaart.",
};

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];

/** Een kort overgangszinnetje tussen de koekjes (BLIEPO-KARAKTER.md §12), af en toe. */
export { OVERGANG } from "./squla-klok-gouden-zinnen";

/**
 * Reactie na de lof bij de kralen (BLIEPO-KARAKTER.md §4 Tellen zin 6 en 10, Vergelijken zin 33, plus zinnen zonder "Ja").
 * De robotzin (laatste) hooguit 1 keer per les.
 */
export const TELREACTIE = (n: number) => rij([`Ja, het zijn ${kr(n)} kralen.`, `Ja, ${kr(n)} is evenveel.`, `Het zijn er ${kr(n)}.`, `${kr(n)} kralen, precies evenveel.`, `Ik heb ze nagekeken: ${kr(n)} kralen.`], [4]);
export const TELREACTIE_JA = [0, 1];
export const TELREACTIE_ROBOT = 4;

/** Reactie na de lof bij de koekjes (BLIEPO-KARAKTER.md §4 Vergelijken zin 31, 34, 35, plus zinnen zonder "Ja"). */
export function drieReactie(v: Driekaart): Rijtje {
  const [max, ...rest] = [...v.kaarten].sort((a, b) => b - a);
  return rij([`Ja, hier liggen de meeste.`, `Ja, ${ko(max)} is meer dan ${ko(rest[0])} en ${ko(rest[1])}.`, `Hier liggen er ${ko(max)}: de meeste.`, `${ko(max)} koekjes, dat is het meest.`, "Ik heb geteld en nagekeken: hier zijn er meer."], [4]);
}
export const DRIEREACTIE_JA = [0, 1];
export const DRIEREACTIE_ROBOT = 4;

/* ---------- denkfouten (draaiboek Meer-minder §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["te-weinig-geteld", "te-veel-geteld", "alleen-volle-rijen", "kleinste-groep-gekozen", "niet-de-meeste", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen tellen; dan mag de richting, want het antwoord komt toch in beeld). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en de 1e keer zei Bliepo al wat er mis was): anders uitleggen. */
  weer: string[];
  scherm: string;
  /** Welke keuzes de eerste zin en de hint nog toelaten (voor de verklapcontrole van het script, 15.17). */
  over: number[];
  /** Waarom de richting niet genoemd wordt (zou het antwoord verklappen, BOUWREGELS 15.17). */
  noot?: string;
};

/* ---------- tellen: de fouttabel (EIGEN INVULLING, NIET VAN SYNTHESIS: More or Less heeft geen telvraag) ---------- */

const SCHERM_TEL = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; de kralen blijven staan, zonder getallen; met de hint komen de 3 knoppen meteen terug (geen pijl)";

/** 3 hints per soort, in eigen woorden; welke hangt af van het vraagnummer, zodat niet steeds dezelfde komt. */
const HINT_WEINIG = ["Tel nog een keer. Raak elke kraal aan en sla er geen over.", "Tel eerst de volle rijen van 5. Tel dan de kralen die er nog bij komen.", "Begin bij de bovenste rij en tel elke kraal mee."];
const HINT_VEEL = ["Tel nog een keer. Raak elke kraal maar 1 keer aan.", "Tel rij voor rij. Elke kraal tel je 1 keer.", "Begin bij de bovenste rij en tel rustig. Elke kraal krijgt 1 getal."];
/**
 * Hints ZONDER richting: alleen als Bliepo de richting niet noemt. Geen "sla er geen over", "1 keer", "maar 1",
 * "erbij" of "te veel": dat zou alsnog zeggen of het kind te weinig of te veel had, en dan blijft er maar 1 keuze over
 * (15.17). Het fouttabel-script controleert dit.
 */
const HINT_NEUTRAAL = ["Tel nog een keer, rij voor rij.", "In een volle rij liggen 5 kralen. Tel zo verder.", "Begin bij de bovenste rij en tel rustig opnieuw."];
/**
 * Zonder richting: het gekozen getal ligt vlak naast het goede (het middelste van de 3). Keuring 10 nov: eerst stond hier
 * 5 keer per les precies "Dat is dichtbij." (BOUWREGELS 5.10: afwisselen); nu 3 versies, geen ervan geeft een richting.
 */
const DICHTBIJ = ["Dat is dichtbij.", "Je zit er dichtbij.", "Dat scheelt niet veel."];
/** Woorden die een richting geven (te weinig of te veel); verboden in een hint als Bliepo de richting niet noemt. */
export const RICHTINGWOORDEN = /\bmeer\b|minder|erbij|sla er geen|1 keer|maar 1|te veel|te weinig|niet allemaal|laatste rij/i;

export function telFout(x: number, v: Telvraag): Fout {
  const X = kr(x);
  const n = v.n;
  const vol = volleRijen(n);
  /* Welke keuzes de richting overlaat: bij te weinig alleen grotere, bij te veel alleen kleinere. */
  const kant = v.keuzes.filter((k) => k !== x && (x < n ? k > x : k < x));
  const verklapt = kant.length === 1;
  const andere = v.keuzes.filter((k) => k !== x);
  const verschil = Math.abs(n - x);
  if (x < n && x === vol && !verklapt)
    return {
      code: "alleen-volle-rijen",
      soort: "alleen-volle-rijen",
      denkfout: "telde alleen de volle rijen van 5, niet de rij die niet vol is",
      eerste: `Je koos ${X}: zoveel liggen er in de volle rijen.`,
      hint: "De rij die niet vol is, telt ook mee. Tel die erbij.",
      uitleg: "Ook de kralen in de laatste rij tellen mee.",
      weer: ["Je telde weer alleen de volle rijen.", "Kijk ook naar de korte rij onderaan."],
      scherm: SCHERM_TEL,
      over: kant,
    };
  if (x < n) {
    const basis = { code: "te-weinig-geteld" as const, soort: "te-weinig", denkfout: x === vol ? "telde er te weinig (misschien alleen de volle rijen)" : "telde er te weinig (sloeg er een over)", scherm: SCHERM_TEL };
    const uitleg = verschil === 1 ? "Er is 1 kraal niet geteld." : "Er zijn een paar kralen niet geteld.";
    const weer = ["Je telde er weer te weinig.", "Wijs elke kraal aan en zeg er 1 getal bij."];
    return verklapt
      ? { ...basis, eerste: `Je koos ${X}. ${DICHTBIJ[v.nr % 3]}`, hint: HINT_NEUTRAAL[v.nr % 3], uitleg, weer: [], over: andere, noot: "richting niet genoemd: dan bleef er maar 1 keuze over" }
      : { ...basis, eerste: `Je koos ${X}, maar er liggen meer kralen.`, hint: HINT_WEINIG[v.nr % 3], uitleg, weer, over: kant };
  }
  if (x > n) {
    const basis = { code: "te-veel-geteld" as const, soort: "te-veel", denkfout: "telde er te veel (telde er een 2 keer)", scherm: SCHERM_TEL };
    const uitleg = verschil === 1 ? "Er is 1 kraal 2 keer geteld." : "Er zijn een paar kralen 2 keer geteld.";
    const weer = ["Je telde er weer te veel.", "Zeg bij elke kraal 1 getal. Dan tel je er geen 2 keer."];
    return verklapt
      ? { ...basis, eerste: `Je koos ${X}. ${DICHTBIJ[v.nr % 3]}`, hint: HINT_NEUTRAAL[(v.nr + 1) % 3], uitleg, weer: [], over: andere, noot: "richting niet genoemd: dan bleef er maar 1 keuze over" }
      : { ...basis, eerste: `Je koos ${X}, maar zoveel kralen liggen er niet.`, hint: HINT_VEEL[v.nr % 3], uitleg, weer, over: kant };
  }
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: HINT_NEUTRAAL[0], uitleg: "We tellen ze 1 voor 1.", weer: [], scherm: SCHERM_TEL, over: andere };
}

/* ---------- de meeste koekjes: de fouttabel (draaiboek §3 A/B en §7) ---------- */

const SCHERM_DRIE =
  "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de kaart; de koekjes gaan in rijen van 10 liggen (zoals Synthesis de blokken op een rij laat zakken, draaiboek §6), zodat je onder de rij van 10 ziet wat er nog bij komt; geen getallen; daarna mag het kind opnieuw een kaart kiezen";

/** 2 versies van het tweede deel van de hint (na "Ik leg de koekjes in rijen van 10."), zodat het niet steeds hetzelfde is. */
const HINT_DRIE = ["Kijk wat er onder de rij van 10 nog ligt.", "Wat ligt er op elke kaart onder de rij van 10?"];

/**
 * De fouttabel van 1 foute kaart. Het kind ziet alleen kaarten: de eerste zin zegt wat zeker is over de gekozen kaart
 * (de minste, of veel maar niet de meeste). Er blijven dan altijd 2 kaarten over; Bliepo wijst nooit naar 1 kaart (15.17).
 */
export function drieFout(x: number, v: Driekaart): Fout {
  const min = Math.min(...v.kaarten);
  const andere = v.kaarten.filter((k) => k !== x);
  const hint = `${ZIN.opRij} ${HINT_DRIE[v.nr % 2]}`;
  if (x === min)
    return {
      code: "kleinste-groep-gekozen",
      soort: "kleinste",
      denkfout: "koos de kaart met de minste koekjes (meeste en minste verwisseld, of niet goed gekeken; draaiboek §7: niet te onderscheiden)",
      eerste: "Je tikte op de kaart met de minste koekjes.",
      hint,
      uitleg: "Op die kaart liggen er juist het minst.",
      weer: ["Je koos weer de kaart met de minste.", "We zoeken juist waar er het meest liggen."],
      scherm: SCHERM_DRIE,
      over: andere,
    };
  return {
    code: "niet-de-meeste",
    soort: "midden",
    denkfout: "koos een kaart met veel koekjes, maar niet de meeste (niet goed vergeleken)",
    eerste: "Daar liggen veel koekjes, maar niet de meeste.",
    hint,
    uitleg: "Er is een kaart met nog meer koekjes.",
    /* Keuring 10 nov: was "Je koos weer een kaart met bijna de meeste." (stroef; er is maar 1 zo'n kaart). */
    weer: ["Je koos weer dezelfde kaart.", "Als we tellen, zie je het verschil."],
    scherm: SCHERM_DRIE,
    over: andere,
  };
}

/** De fouttabel van een vraag: elk fout antwoord (bij de koekjes: elk fout aantal, de kaart met dat aantal). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  if (v.soort === "tel") return Object.fromEntries(v.keuzes.filter((k) => k !== v.n).map((k) => [String(k), telFout(k, v)]));
  const max = Math.max(...v.kaarten);
  return Object.fromEntries(v.kaarten.filter((k) => k !== max).map((k) => [String(k), drieFout(k, v)]));
}
