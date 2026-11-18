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

/* ---------- vaste zinnen van het verloop (draaiboek Meer-minder §2) ----------
 *
 * Sara, 18 november 2026 (zoals de proefles Tellen): Bliepo klinkt als een warme juf. Elke zin is nagelopen (kort, gewone
 * woorden, lief, nooit "fout", een getal nooit 2 keer achter elkaar) en elke situatie die terugkomt heeft varianten.
 * Een lijst = varianten: de les kiest er 1 met de gedeelde kiezer (nooit-dubbel.ts), nooit 2 keer achter elkaar
 * dezelfde, ook niet over vragen heen. Getal, antwoord en betekenis zijn niet veranderd. De vraagzinnen ("Tel de kralen.
 * Hoeveel kralen zijn het?", "Waar liggen de meeste koekjes?") zijn gelijk gebleven (3.11). Oud naast nieuw:
 * WIJZIGINGEN-ZINNEN-MEER-MINDER.md. Een deel is de tekst van Synthesis (More or Less, Color Count) in het Nederlands,
 * passend gemaakt voor groep 3 (besluit Sara 17 november 2026, BOUWREGELS 15.2).
 */

export const ZIN = {
  /** Stap 1: openen. Eigen beginzin van de les (BOUWREGELS 4.3); geen startvraag (draaiboek §2 stap 1). Samen met de groet 1 stuk. */
  begin: ["Vandaag tellen we eerst kralen. Daarna zoeken we waar de meeste koekjes liggen.", "We gaan eerst samen kralen tellen. Daarna zoeken we waar de meeste koekjes liggen."],
  /** Tellen: de vraag van de oude les; de eerste 2 keer helemaal, daarna korter (LESRECEPT.md). */
  /* Kort: om en om 2 zinnen, zodat dezelfde tekst niet direct terugkomt (F7: een gelijke zin stond eerst wit en werd daarna gedimd). */
  telVraag: (kort: boolean, nr = 0): string[] => (kort ? [nr % 2 ? "Hoeveel kralen liggen er?" : "Hoeveel kralen zijn het?"] : ["Tel de kralen.", "Hoeveel kralen zijn het?"]),
  /** Een nieuwe poging na de hint (een nieuwe antwoordpoging mag de vraag opnieuw stellen, 3.23), iets anders gezegd. Varianten. */
  telOpnieuw: ["Hoeveel kralen tel je nu?", "Hoeveel kralen zijn het, denk je?", "Op hoeveel kralen kom je nu?"],
  /** De overgang naar de koekjes (draaiboek §2 stap 5: "nu iets anders"); wat het kind ziet verandert. */
  naarKoekjes: ["Nu iets anders: 3 kaarten met koekjes.", "Nu doen we iets anders. Kijk, hier zijn 3 kaarten met koekjes."],
  /** De vraag van de oude les; de eerste keer met wat het kind doet (tikken), daarna alleen de vraag. */
  drieVraag: (eerste: boolean, nr = 0): string[] => (eerste ? ["Waar liggen de meeste koekjes?", "Tik op die kaart."] : [nr % 2 ? "Op welke kaart liggen de meeste koekjes?" : "Waar liggen de meeste koekjes?"]),
  drieOpnieuw: ["Waar liggen nu de meeste koekjes?", "Welke kaart heeft nu de meeste koekjes?", "Kijk nog eens goed. Welke kaart heeft de meeste koekjes?"],
  /** 1e fout bij de koekjes: het beeld verandert (draaiboek §6: op een rij leggen); dit is het eerste deel van de hint. */
  opRij: ["Ik leg de koekjes in rijen van 10.", "Kijk, ik leg de koekjes in rijen van 10.", "Geen zorgen. Ik leg de koekjes in rijen van 10."],
  /** 2e fout: Bliepo doet het samen voor (draaiboek §3 A.5: samen tellen, een getal boven elke groep). */
  samen: ["Kom, we tellen samen.", "Weet je wat? We tellen ze samen.", "Geeft niks. We tellen ze samen.", "Ik help je even. We tellen ze samen.", "Laten we ze samen tellen en kijken."],
  /** Samen tellen bij de kralen: Bliepo telt de volle rijen, het kind telt de laatste rij (de kleine stap). */
  samenVol: (n: number) => (volleRijen(n) === 5 ? ["Ik tel de eerste rij.", "Ik begin met de eerste rij."] : ["Ik tel de volle rijen.", "Ik begin met de volle rijen.", "Eerst tel ik de volle rijen."]),
  samenTelRij: (k: number) => `${kr(k)}.`,
  samenJij: (n: number) =>
    rijenVan(n).at(-1) === 1
      ? ["Tik jij op de laatste kraal?", "Nu jij! Tik op de laatste kraal."]
      : ["Tel jij verder? Tik op de kralen in de laatste rij.", "Nu jij! Tik op de kralen in de laatste rij.", "Tik jij op de kralen in de laatste rij? Ik tel mee."],
  samenHand: ["Tik op de volgende kraal.", "Tik maar op de volgende kraal.", "Welke kraal komt nu? Tik erop."],
  samenTel: (k: number) => `${kr(k)}.`,
  /** Het laatste getal is het aantal. Het getal staat er 1 keer (was: "Het zijn 12 kralen. 12 is evenveel."). */
  samenKlaar: (n: number) => [`En ${kr(n)}! Zoveel kralen zijn het.`, `En de laatste is ${kr(n)}. Zoveel kralen zijn het.`, `We hebben ${kr(n)} kralen geteld. Dat getal is evenveel.`],
  /** Samen tellen bij de koekjes: Bliepo telt elke kaart, het getal staat erboven; het kind tikt de kaart (de kleine stap). */
  samenKaart: (n: number, j: number) => [`Hier liggen er ${ko(n)}.`, `Op deze kaart ${ko(n)}.`, `En hier ${ko(n)}.`][j] ?? `Hier liggen er ${ko(n)}.`,
  samenMeeste: (max: number) => [`${ko(max)} is het meest. Tik op die kaart.`, `${ko(max)} is het grootste getal. Tik op die kaart.`, `De meeste koekjes, dat zijn er ${ko(max)}. Tik op die kaart.`],
  samenKaartHand: ["Tik op de kaart met het grootste getal.", "Zoek het grootste getal. Tik op die kaart."],
  samenKaartKlaar: (max: number) => [`Ja, daar liggen de meeste koekjes: ${ko(max)}.`, "Ja, op deze kaart liggen de meeste koekjes.", `Ja, ${ko(max)} koekjes. Dat zijn de meeste.`],
  /** Na het vangnet (Bliepo wees de kaart zelf aan): geen "Ja", want het kind tikte die kaart niet (keuring 10 nov). */
  samenKaartZelf: (max: number) => [`Kijk, hier liggen de meeste koekjes: ${ko(max)}.`, "Kijk, op deze kaart liggen de meeste koekjes."],
  /** Hetzelfde foute antwoord 2 keer: niet 2 keer dezelfde eerste zin (geleerd bij Tellen). */
  weerGekozen: (x: number) => [`Je koos weer ${kr(x)}.`, `Je tikte weer op ${kr(x)}.`, `Weer ${kr(x)}, zie ik.`],
  /** Stap 8: einde. */
  slot: ["Je kunt nu tellen hoeveel er zijn, en je ziet waar de meeste liggen.", "Je hebt goed gewerkt vandaag! Je hebt kralen geteld en de meeste koekjes gevonden.", "Mooi gewerkt! Je ziet nu snel waar de meeste liggen."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** Aanmoediging bij het hulphandje (het kind moet tikken, niet nadenken; 14.35, geleerd bij Tellen). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/** Een kort overgangszinnetje tussen de koekjes (BLIEPO-KARAKTER.md §12), af en toe. */
export { OVERGANG } from "./squla-klok-gouden-zinnen";

/**
 * Reactie na de lof bij de kralen (BLIEPO-KARAKTER.md §4 Tellen zin 6 en 10, Vergelijken zin 33, plus zinnen zonder "Ja").
 * De robotzin (laatste) hooguit 1 keer per les.
 */
export const TELREACTIE = (n: number) => rij([`Ja, het zijn ${kr(n)} kralen.`, `Ja, ${kr(n)} is evenveel.`, `Het zijn er ${kr(n)}.`, `${kr(n)} kralen, precies evenveel.`, `Ik heb ze nagekeken: ${kr(n)} kralen.`, `Er liggen ${kr(n)} kralen.`, `Dat klopt, het zijn ${kr(n)} kralen.`], [4]);
export const TELREACTIE_JA = [0, 1];
export const TELREACTIE_ROBOT = 4;

/** Reactie na de lof bij de koekjes (BLIEPO-KARAKTER.md §4 Vergelijken zin 31, 34, 35, plus zinnen zonder "Ja"). */
export function drieReactie(v: Driekaart): Rijtje {
  const [max, ...rest] = [...v.kaarten].sort((a, b) => b - a);
  return rij([`Ja, hier liggen de meeste.`, `Ja, ${ko(max)} is meer dan ${ko(rest[0])} en ${ko(rest[1])}.`, `Hier liggen er ${ko(max)}: de meeste.`, `${ko(max)} koekjes, dat is het meest.`, "Ik heb geteld en nagekeken: hier zijn er meer.", "Op deze kaart liggen de meeste koekjes.", `Dat klopt, ${ko(max)} koekjes is het meest.`], [4]);
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
  /** Alle varianten (18 november 2026); `eerste`, `hint`, `uitleg` en `weer` hierboven zijn er 1 van (voor de fouttabel). */
  v?: Varianten;
};

/**
 * Alle varianten bij 1 fout antwoord; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde).
 *   eerste      wat het kind koos (met de richting als dat niets verklapt);
 *   hint        1e keer: waar het kind moet kijken, nooit het antwoord;
 *   uitleg      2e keer: uitleg (kralen: komt na de eerste zin; koekjes: de hele reactie);
 *   weerEerste / weerUitleg   2 keer dezelfde denkfout (en Bliepo noemde hem de 1e keer al).
 */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };

/** Woorden waarmee Bliepo zegt dat het bijna goed was. Bij 1 vraag komt zo'n woord hooguit 1 keer (geleerd bij Tellen). */
const KERN = /dichtbij|bijna|scheelt/gi;
export const zelfdeKern = (a: string, b: string) => {
  const A = new Set((a.match(KERN) ?? []).map((w) => w.toLowerCase()));
  return (b.match(KERN) ?? []).some((w) => A.has(w.toLowerCase()));
};

/* ---------- tellen: de fouttabel (EIGEN INVULLING, NIET VAN SYNTHESIS: More or Less heeft geen telvraag) ---------- */

const SCHERM_TEL = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de knoppen weg; de kralen blijven staan, zonder getallen; met de hint komen de 3 knoppen meteen terug (geen pijl)";

/** Hints per soort; de les kiest steeds een andere (de vaste voor de fouttabel hangt af van het vraagnummer). */
const HINT_WEINIG = ["Tel nog een keer. Wijs elke kraal aan en sla er geen over.", "Tel eerst de volle rijen van 5. Tel dan de kralen die er nog bij komen.", "Begin bij de bovenste rij en tel elke kraal mee.", "Probeer het nog eens. Tel elke kraal mee, ook de laatste."];
const HINT_VEEL = ["Tel nog een keer. Wijs elke kraal maar 1 keer aan.", "Tel rij voor rij. Elke kraal tel je 1 keer.", "Begin bij de bovenste rij en tel rustig. Elke kraal krijgt 1 getal.", "Probeer het nog eens. Tel geen kraal 2 keer."];
/**
 * Hints ZONDER richting: alleen als Bliepo de richting niet noemt. Geen "sla er geen over", "1 keer", "maar 1",
 * "erbij" of "te veel": dat zou alsnog zeggen of het kind te weinig of te veel had, en dan blijft er maar 1 keuze over
 * (15.17). Het fouttabel-script controleert dit.
 */
const HINT_NEUTRAAL = ["Tel nog een keer, rij voor rij.", "In een volle rij liggen 5 kralen. Tel rij voor rij.", "Begin bij de bovenste rij en tel rustig opnieuw.", "Probeer het nog eens. Tel de kralen en tik op het getal."];
const HINT_VOLLE = ["De rij die niet vol is, telt ook mee. Tel die erbij.", "Kijk ook naar de laatste rij en tel opnieuw.", "Tel ook de kralen in de laatste rij."];
/**
 * Zonder richting: het gekozen getal ligt vlak naast het goede. Geen van deze zinnen geeft een richting. (Keuring 10 nov:
 * eerst stond hier 5 keer per les precies "Dat is dichtbij."; sinds 18 nov 5 hele zinnen.)
 */
const DICHTBIJ = [(X: string) => `Je koos ${X}. Dat is dichtbij.`, (X: string) => `Je koos ${X}. Je zit er dichtbij.`, (X: string) => `Je koos ${X}. Dat scheelt niet veel.`, (X: string) => `Bijna! ${X} is het net niet.`, (X: string) => `${X}? Dat is heel dichtbij.`];
/** Te weinig, met richting. */
const WEINIG = [(X: string) => `Je koos ${X}, maar er liggen meer kralen.`, (X: string) => `Je koos ${X}. Er liggen er nog meer.`, (X: string) => `Bijna! ${X} is nog iets te weinig.`, (X: string) => `${X}? Ik zie er nog meer.`, (X: string) => `${X} kralen? Je hebt ze nog niet allemaal geteld.`];
/** Te veel, met richting. */
const VEEL = [(X: string) => `Je koos ${X}, maar zoveel kralen liggen er niet.`, (X: string) => `Je koos ${X}. Dat zijn er iets te veel.`, (X: string) => `Bijna! ${X} is iets te veel.`, (X: string) => `${X}? Dat zijn er iets te veel.`, (X: string) => `${X} kralen? Ik denk dat je er te veel hebt geteld.`];
/** Alleen de volle rijen geteld. */
const VOLLE = [(X: string) => `Je koos ${X}: zoveel liggen er in de volle rijen.`, (X: string) => `Je hebt alleen de volle rijen geteld. Dat zijn er ${X}.`, (X: string) => `Je kwam op ${X}. Dat zijn alleen de volle rijen.`];
/* De uitleg bij de 2e keer (meteen daarna tellen we samen). */
const UITLEG_WEINIG_1 = ["Er is 1 kraal niet geteld.", "Je hebt 1 kraal overgeslagen.", "Er ligt nog 1 kraal meer."];
const UITLEG_WEINIG_PAAR = ["Er zijn een paar kralen niet geteld.", "Je hebt een paar kralen overgeslagen.", "Er liggen nog een paar kralen meer."];
const UITLEG_VEEL_1 = ["Er is 1 kraal 2 keer geteld.", "Je hebt 1 kraal 2 keer geteld.", "Er ligt 1 kraal minder."];
const UITLEG_VEEL_PAAR = ["Er zijn een paar kralen 2 keer geteld.", "Je hebt een paar kralen 2 keer geteld.", "Er liggen een paar kralen minder."];
const UITLEG_VOLLE = ["Ook de kralen in de laatste rij tellen mee.", "De laatste rij is niet vol. Die hoort er ook bij.", "De rij die niet vol is, telt ook mee."];
/* 2 keer dezelfde denkfout (en Bliepo noemde de 1e keer de richting): "weer", en anders uitgelegd. */
const WEER_WEINIG = ["Je telde er weer te weinig.", "Het zijn er weer iets te weinig.", "Weer iets te weinig, zie ik."];
const WEER_WEINIG_UITLEG = ["Wijs elke kraal aan en zeg er 1 getal bij.", "We geven elke kraal een getal. Zo vergeten we er geen."];
const WEER_VEEL = ["Je telde er weer te veel.", "Het zijn er weer iets te veel.", "Weer iets te veel, zie ik."];
const WEER_VEEL_UITLEG = ["Zeg bij elke kraal 1 getal. Dan tel je er geen 2 keer.", "We geven elke kraal een getal. Zo tellen we er geen 2 keer."];
const WEER_VOLLE = ["Je telde weer alleen de volle rijen.", "Je hebt weer alleen de volle rijen geteld.", "Dat zijn weer alleen de volle rijen."];
const WEER_VOLLE_UITLEG = ["Kijk ook naar de korte rij onderaan.", "De korte rij onderaan hoort er ook bij."];
/** Woorden die een richting geven (te weinig of te veel); verboden in een hint als Bliepo de richting niet noemt. */
export const RICHTINGWOORDEN = /\bmeer\b|minder|erbij|sla er geen|overgeslagen|1 keer|2 keer|maar 1|te veel|te weinig|zoveel|zo veel|niet allemaal|niet geteld|laatste|volle rijen/i;

export function telFout(x: number, v: Telvraag): Fout {
  const X = kr(x);
  const n = v.n;
  const vol = volleRijen(n);
  /* Welke keuzes de richting overlaat: bij te weinig alleen grotere, bij te veel alleen kleinere. */
  const kant = v.keuzes.filter((k) => k !== x && (x < n ? k > x : k < x));
  const verklapt = kant.length === 1;
  const andere = v.keuzes.filter((k) => k !== x);
  const verschil = Math.abs(n - x);
  const NOOT = "richting niet genoemd: dan bleef er maar 1 keuze over";
  const metX = (l: ((X: string) => string)[]) => l.map((z) => z(X));
  const vast = <T,>(l: T[], plus = 0): T => l[(v.nr + plus) % l.length];
  const maak = (d: { code: Denkfoutnaam; soort: string; denkfout: string; over: number[]; noot?: string; hintPlus?: number } & Varianten): Fout => ({
    code: d.code,
    soort: d.soort,
    denkfout: d.denkfout,
    eerste: vast(d.eerste),
    hint: vast(d.hint, d.hintPlus ?? 0),
    uitleg: vast(d.uitleg),
    weer: d.noot ? [] : [vast(d.weerEerste), vast(d.weerUitleg)],
    scherm: SCHERM_TEL,
    over: d.over,
    ...(d.noot ? { noot: d.noot } : {}),
    v: { eerste: d.eerste, hint: d.hint, uitleg: d.uitleg, weerEerste: d.weerEerste, weerUitleg: d.weerUitleg },
  });
  if (x < n && x === vol && !verklapt)
    return maak({
      code: "alleen-volle-rijen",
      soort: "alleen-volle-rijen",
      denkfout: "telde alleen de volle rijen van 5, niet de rij die niet vol is",
      eerste: metX(VOLLE),
      hint: HINT_VOLLE,
      uitleg: UITLEG_VOLLE,
      weerEerste: WEER_VOLLE,
      weerUitleg: WEER_VOLLE_UITLEG,
      over: kant,
    });
  if (x < n)
    return maak({
      code: "te-weinig-geteld",
      soort: "te-weinig",
      denkfout: x === vol ? "telde er te weinig (misschien alleen de volle rijen)" : "telde er te weinig (sloeg er een over)",
      eerste: verklapt ? metX(DICHTBIJ) : metX(WEINIG),
      hint: verklapt ? HINT_NEUTRAAL : HINT_WEINIG,
      uitleg: verschil === 1 ? UITLEG_WEINIG_1 : UITLEG_WEINIG_PAAR,
      weerEerste: WEER_WEINIG,
      weerUitleg: WEER_WEINIG_UITLEG,
      over: verklapt ? andere : kant,
      ...(verklapt ? { noot: NOOT } : {}),
    });
  if (x > n)
    return maak({
      code: "te-veel-geteld",
      soort: "te-veel",
      denkfout: "telde er te veel (telde er een 2 keer)",
      eerste: verklapt ? metX(DICHTBIJ) : metX(VEEL),
      hint: verklapt ? HINT_NEUTRAAL : HINT_VEEL,
      uitleg: verschil === 1 ? UITLEG_VEEL_1 : UITLEG_VEEL_PAAR,
      weerEerste: WEER_VEEL,
      weerUitleg: WEER_VEEL_UITLEG,
      over: verklapt ? andere : kant,
      ...(verklapt ? { noot: NOOT, hintPlus: 1 } : {}),
    });
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: HINT_NEUTRAAL[0], uitleg: "We tellen ze rustig, stuk voor stuk.", weer: [], scherm: SCHERM_TEL, over: andere };
}

/**
 * Wat Bliepo bij de 2e keer als eerste zin mag zeggen als het kind een ANDER getal koos dan de 1e keer: elke variant van
 * de eerste zin, behalve die met een woord dat hij bij deze vraag al zei ("dichtbij", "bijna", "scheelt").
 */
export function tweedeEerste(x: number, v: Telvraag, eersteZin: string): string[] {
  const alle = telFout(x, v).v?.eerste ?? [];
  const over = alle.filter((z) => !zelfdeKern(eersteZin, z));
  return over.length ? over : alle;
}

/* ---------- de meeste koekjes: de fouttabel (draaiboek §3 A/B en §7) ---------- */

const SCHERM_DRIE =
  "Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat van de kaart; de koekjes gaan in rijen van 10 liggen (zoals Synthesis de blokken op een rij laat zakken, draaiboek §6), zodat je onder de rij van 10 ziet wat er nog bij komt; geen getallen; daarna mag het kind opnieuw een kaart kiezen";

/** Het tweede deel van de hint (na "Ik leg de koekjes in rijen van 10."), in varianten. */
/* Het getal 10 staat er 1 keer (was: "… in rijen van 10. Kijk wat er onder de rij van 10 nog ligt."): de rij van 10 is de bovenste rij. */
const HINT_DRIE = ["Kijk wat er onder de bovenste rij nog ligt.", "Wat ligt er op elke kaart onder de bovenste rij?", "Zo zie je beter waar de meeste liggen."];
/** De hele hint: elke variant van "Ik leg …" met een tweede deel (de les kiest de 2 delen los, steeds een andere). */
export const HINT_DRIE_DELEN = { opRij: ZIN.opRij, kijk: HINT_DRIE };

/**
 * De fouttabel van 1 foute kaart. Het kind ziet alleen kaarten: de eerste zin zegt wat zeker is over de gekozen kaart
 * (de minste, of veel maar niet de meeste). Er blijven dan altijd 2 kaarten over; Bliepo wijst nooit naar 1 kaart (15.17).
 * Bij de 2e keer is de uitleg de hele reactie (was: de eerste zin en dan nog eens bijna hetzelfde).
 */
export function drieFout(x: number, v: Driekaart): Fout {
  const min = Math.min(...v.kaarten);
  const andere = v.kaarten.filter((k) => k !== x);
  const hints = HINT_DRIE.map((h, i) => `${ZIN.opRij[i % ZIN.opRij.length]} ${h}`);
  const vast = <T,>(l: T[]): T => l[v.nr % l.length];
  const maak = (d: { code: Denkfoutnaam; soort: string; denkfout: string } & Omit<Varianten, "hint">): Fout => ({
    code: d.code,
    soort: d.soort,
    denkfout: d.denkfout,
    eerste: vast(d.eerste),
    hint: vast(hints),
    uitleg: vast(d.uitleg),
    weer: [vast(d.weerEerste), vast(d.weerUitleg)],
    scherm: SCHERM_DRIE,
    over: andere,
    v: { eerste: d.eerste, hint: hints, uitleg: d.uitleg, weerEerste: d.weerEerste, weerUitleg: d.weerUitleg },
  });
  if (x === min)
    return maak({
      code: "kleinste-groep-gekozen",
      soort: "kleinste",
      denkfout: "koos de kaart met de minste koekjes (meeste en minste verwisseld, of niet goed gekeken; draaiboek §7: niet te onderscheiden)",
      eerste: ["Je tikte op de kaart met de minste koekjes.", "Je koos de kaart met de minste koekjes.", "Op die kaart liggen de minste koekjes."],
      uitleg: ["Op die kaart liggen er juist het minst.", "Je tikte op de kaart met de minste koekjes. We zoeken de meeste.", "Daar liggen de minste koekjes. We zoeken waar de meeste liggen."],
      weerEerste: ["Je koos weer de kaart met de minste.", "Dat is weer de kaart met de minste koekjes."],
      weerUitleg: ["We zoeken juist waar er het meest liggen.", "We zoeken de kaart met de meeste koekjes."],
    });
  return maak({
    code: "niet-de-meeste",
    soort: "midden",
    denkfout: "koos een kaart met veel koekjes, maar niet de meeste (niet goed vergeleken)",
    eerste: ["Daar liggen veel koekjes, maar niet de meeste.", "Veel koekjes! Maar het zijn niet de meeste.", "Dat zijn veel koekjes, maar niet de meeste."],
    uitleg: ["Er is een kaart met nog meer koekjes.", "Daar liggen veel koekjes. Op een andere kaart liggen er nog meer.", "Dat zijn veel koekjes. Een andere kaart heeft er nog meer."],
    /* Keuring 10 nov: was "Je koos weer een kaart met bijna de meeste." (stroef; er is maar 1 zo'n kaart). */
    weerEerste: ["Je koos weer dezelfde kaart.", "Dat is weer dezelfde kaart."],
    weerUitleg: ["Als we tellen, zie je het verschil.", "We tellen de koekjes. Dan zie je het verschil."],
  });
}

/** De fouttabel van een vraag: elk fout antwoord (bij de koekjes: elk fout aantal, de kaart met dat aantal). */
export function foutenVan(v: Vraag): Record<string, Fout> {
  if (v.soort === "tel") return Object.fromEntries(v.keuzes.filter((k) => k !== v.n).map((k) => [String(k), telFout(k, v)]));
  const max = Math.max(...v.kaarten);
  return Object.fromEntries(v.kaarten.filter((k) => k !== max).map((k) => [String(k), drieFout(k, v)]));
}
