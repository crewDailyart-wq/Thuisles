/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Tellen (squla-tellen-fruit-1-gouden, 9 november 2026), op één plek, met de
 * FOUTTABEL. De les zelf (squla-tellen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, speciale momenten, naam, goed na een fout, begin en einde, eerste zin als de denkfout niet
 *     duidelijk is, aanmoedigen, overgang) zijn dezelfde als in de gouden klokles: ze komen uit BLIEPO-KARAKTER.md en
 *     staan in squla-klok-gouden-zinnen.ts. Hier alleen de reactie bij Tellen (BLIEPO-KARAKTER.md §4, zin 6, 7 en 10).
 *   - De inhoud (15 vragen, getallen en 3 keuzes per vraag) is die van squla-tellen-fruit-1 (BOUWREGELS 15.22).
 *   - De FOUTTABEL is EIGEN INVULLING, NIET VAN SYNTHESIS: alle vragen gaan over 11 t/m 17 en het draaiboek Tellen
 *     (Color Count) gaat tot 10 (BOUWREGELS 15.22 punt 5). De soort reactie (richting noemen, opnieuw tellen) volgt wel
 *     het draaiboek §3 A en §7.
 *
 * Leesbare versie: FOUTTABEL-squla-tellen-fruit-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-tellen-gouden.ts`). {12:rood} = een getal in de kleur van het fruit.
 */

import type { Kleurnaam, Soort } from "../vlakken/squla-tellen-tekenen";
import { VASTE_KLEUR } from "../vlakken/squla-tellen-tekenen";
import type { Rijtje } from "./squla-klok-gouden-zinnen";

export {
  AANMOEDIG,
  AANMOEDIG_KIEST,
  BEVESTIG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  LOF,
  LOF_KIJK_INDEX,
  MOMENT,
  NAAM_GROET,
  NAAM_LOF,
  ONDUIDELIJK,
  ONDUIDELIJK_ANDERE,
  ONDUIDELIJK_NOG_1_KEER,
  OVERGANG,
  metNaam,
  type Rijtje,
} from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/* ---------- het fruit ---------- */

export type Fruit = { soort: Soort; een: string; naam: string; kleur: Kleurnaam };
const fruit = (soort: Soort, een: string, naam: string): Fruit => ({ soort, een, naam, kleur: VASTE_KLEUR[soort] });
export const APPEL = fruit("appel", "appel", "appels");
export const PEER = fruit("peer", "peer", "peren");
export const PRUIM = fruit("pruim", "pruim", "pruimen");

/** Een getal in de kleur van het fruit waar het naar verwijst (BOUWREGELS 2.1, 2.2). */
export const gk = (n: number, f: Fruit) => `{${n}:${f.kleur}}`;

/* ---------- de 15 vragen van squla-tellen-fruit-1 (zelfde volgorde, getallen en keuzes) ---------- */

export type Telvraag = { nr: number; id: string; fruit: Fruit; n: number; keuzes: number[] };
const V = (nr: number, f: Fruit, n: number, keuzes: number[]): Telvraag => ({ nr, id: `vraag${nr}-${n}-${f.naam}`, fruit: f, n, keuzes });

export const VRAGEN: Telvraag[] = [
  V(1, APPEL, 12, [10, 11, 12]),
  V(2, PEER, 11, [11, 12, 13]),
  V(3, PRUIM, 13, [12, 13, 14]),
  V(4, APPEL, 14, [14, 15, 16]),
  V(5, PEER, 12, [11, 12, 13]),
  V(6, PRUIM, 15, [13, 14, 15]),
  V(7, APPEL, 16, [15, 16, 17]),
  V(8, PEER, 13, [13, 14, 15]),
  V(9, PRUIM, 17, [15, 16, 17]),
  V(10, PEER, 14, [13, 14, 15]),
  V(11, APPEL, 13, [12, 13, 14]),
  V(12, PRUIM, 16, [16, 17, 18]),
  V(13, PEER, 15, [14, 15, 16]),
  V(14, APPEL, 17, [16, 17, 18]),
  V(15, PRUIM, 11, [9, 10, 11]),
];

/* ---------- de eerste versie (9–17 nov), letterlijk bewaard: de gouden Rekenmix-lessen gebruiken haar nog ---------- */

export { AANMOEDIG_TIKKEN, TELREACTIE, TELREACTIE_JA, TELREACTIE_ROBOT, ZIN } from "./squla-tellen-zinnen-v1";

/* ---------- de zinnen van de gouden les Tellen (18 november 2026: warmer, en in varianten) ----------
 *
 * Sara, 18 november 2026 (proefles): Bliepo klinkt als een warme juf, niet als een robot. Elke zin is nagelopen (kort,
 * gewone woorden, lief, nooit "fout", een getal nooit 2 keer achter elkaar) en elke situatie die terugkomt heeft
 * varianten: 3 tot 5 voor reacties en aanmoediging, 2 of 3 voor instructies en samen voordoen. De les kiest met de
 * gedeelde kiezer (nooit-dubbel.ts): nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen.
 * Getal, antwoord en betekenis zijn niet veranderd. Oud naast nieuw: WIJZIGINGEN-ZINNEN-TELLEN.md.
 * Een deel van de zinnen is de tekst van Synthesis (Color Count), in het Nederlands en passend gemaakt voor groep 3
 * (besluit Sara 17 november 2026, BOUWREGELS 15.2): "13 pruimen? Ik denk dat je er te veel hebt geteld.", "Probeer het
 * nog eens. Tel de appels en tik op het getal.", "Laten we ze samen tellen en kijken.", "Kijk, daar heb je het: 12. Je
 * zat precies goed.", "Precies, 12 appels.", "Dat klopt, er zijn 12 appels.", "Je hebt helemaal tot 17 geteld.".
 * Een lijst = varianten (de les kiest er 1). Schooltermen blijven gelijk: "tellen", "samen tellen", "rij", "nummer".
 */
export const TEL = {
  /** Stap 1: openen. Eerst wat we gaan doen (1 van de varianten), dan wat het kind ziet. */
  begin: ["Vandaag gaan we fruit tellen.", "We gaan samen fruit tellen."],
  beginKijk: `Kijk, de appels liggen in rijen van ${gk(5, APPEL)}.`,
  /** De vraag (Squla: "Hoeveel … zie je?") blijft overal gelijk; de eerste keer met wat het kind moet doen (3.15). */
  vraag: (f: Fruit) => `Hoeveel ${f.naam} zie je?`,
  vraagEerste: "Tel ze en tik op het goede getal.",
  /** Draaiboek §3 A.1 (b): bij de eerste telvraag telt Bliepo hardop na (het kind tikt niet). */
  natellen: ["Ik tel ze hardop voor je. Tel maar mee!", "Kom, ik tel ze hardop. Tel maar mee!", "Laten we ze samen tellen. Ik tel hardop."],
  /* Het laatste getal zegt Bliepo in deze zin, niet ook nog bij het hardop tellen: zo klinkt het maar 1 keer (18 nov 2026,
     zoals Rekenmix 1; was "… 11. 12. Zie je? Het zijn er 12."). */
  natellenKlaar: (n: number, f: Fruit) => [`En ${gk(n, f)}! Je had het precies goed.`, `En de laatste is ${gk(n, f)}. Jij had het goed geteld.`, `En ${gk(n, f)}! Zie je? Je zat precies goed.`],
  /** Tikte het kind op de pijl (alle nummers staan er meteen, Bliepo telde niet hardop af), dan de oude zinnen. */
  natellenKlaarSnel: (n: number, f: Fruit) => [`Zie je? Het zijn er ${gk(n, f)}. Je had het precies goed.`, `Zie je wel? Het zijn er ${gk(n, f)}. Jij had het goed geteld.`, `Kijk, daar heb je het: ${gk(n, f)}. Je zat precies goed.`],
  /** Draaiboek §3 A.3: na de 2e keer samen tellen. */
  samenHelp: ["Kom, we tellen ze samen.", "Weet je wat? We tellen ze samen.", "Geeft niks. We tellen ze samen.", "Ik help je even. We tellen ze samen.", "Laten we ze samen tellen en kijken."],
  samenTik: (f: Fruit) => [`Tik op elke ${f.een}. Ik tel mee.`, `Tik elke ${f.een} aan. Ik zeg het getal.`, `Tik op alle ${f.naam}. Ik tel hardop mee.`],
  samenHand: (f: Fruit) => [`Tik op een ${f.een} zonder nummer.`, `Zoek een ${f.een} zonder nummer en tik erop.`, `Welke ${f.een} heeft nog geen nummer? Tik erop.`],
  /** Het laatste getal is het aantal. Het getal staat er 1 keer (was: "12. Samen telden we 12 appels."). */
  samenKlaar: (n: number, f: Fruit) => [`En ${gk(n, f)}! Zoveel ${f.naam} zijn het.`, `En ${gk(n, f)}! Nu hebben we ze samen allemaal geteld.`, `En de laatste is ${gk(n, f)}. Zoveel ${f.naam} zijn het.`],
  /** Vangnet: 20 s geen tik, dan telt Bliepo de rest zelf (geen "Ja", geen "samen"; begint met "Kijk,"). */
  samenZelf: (n: number, f: Fruit) => [`Kijk, ik tel de rest. Het zijn er ${gk(n, f)}.`, `Kijk, ik tel even verder. Het zijn er ${gk(n, f)}.`],
  /** Stap 10: einde. */
  slot: ["Je hebt fruit geteld tot wel 17!", "Wat heb jij veel fruit geteld: tot wel 17!", "Knap, hoor! Je hebt helemaal tot 17 geteld."],
  /** Draaiboek stap 10: Bliepo zegt kort wat het kind met de kaart doet. */
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  /** Hetzelfde getal 2 keer gekozen: niet 2 keer dezelfde eerste zin. */
  weerGekozen: (x: number, f: Fruit) => [`Je koos weer ${gk(x, f)}.`, `Je tikte weer op ${gk(x, f)}.`, `Weer ${gk(x, f)}, zie ik.`],
  /** Aanmoediging bij het hulphandje tijdens het samen tellen (het kind moet tikken, niet nadenken; 14.35). */
  aanmoedigTikken: ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."],
};

/**
 * De zin met het aantal na de lof (BLIEPO-KARAKTER.md §4 Tellen). Zelfde plekken als de eerste versie: 0 en 1 beginnen
 * met "Ja" (TELREACTIE_JA), 4 is de robotzin (TELREACTIE_ROBOT, hooguit 1 keer per les); 5 en 6 zijn erbij gekomen.
 */
export const TELREACTIE_WARM = (n: number, f: Fruit) =>
  rij([`Ja, er zijn er ${gk(n, f)}.`, `Ja, je hebt ze allemaal geteld: ${gk(n, f)}.`, `Het zijn er ${gk(n, f)}.`, `Je hebt er ${gk(n, f)} geteld.`, `Inderdaad, je telde tot ${gk(n, f)}.`, `Er liggen ${gk(n, f)} ${f.naam}.`, `${gk(n, f)} ${f.naam}, precies!`, `Precies, ${gk(n, f)} ${f.naam}.`, `Dat klopt, er zijn ${gk(n, f)} ${f.naam}.`], [4]);

/* ---------- denkfouten (draaiboek Tellen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["te-weinig", "te-veel", "alleen-volle-rijen", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Alle varianten bij 1 fout antwoord; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde). */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };

export type Fout = {
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (dezelfde soort 2 keer = "weer"). */
  soort: string;
  denkfout: string;
  /** Bliepo's eerste zin: 1 vaste variant voor de fouttabel (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (zonder het antwoord; na deze uitleg volgt meteen het samen tellen). */
  uitleg: string;
  /** Als het kind dezelfde denkfout 2 keer maakt en Bliepo de 1e keer de richting noemde: zeggen dat het weer gebeurt, en anders uitleggen. */
  weer: string[];
  /** Wat er op het scherm gebeurt. */
  scherm: string;
  /** Waarom de richting niet genoemd wordt (zou het antwoord verklappen, BOUWREGELS 15.17). */
  noot?: string;
  /** Alle varianten (18 nov 2026); `eerste`, `hint`, `uitleg` en `weer` hierboven zijn er 1 van. */
  v?: Varianten;
};

const SCHERM = "vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl)";

/* --- de hints (1e keer mis): waar het kind moet kijken, nooit het antwoord (15.17) --- */

/** Te weinig, en Bliepo noemde de richting. */
const HINT_WEINIG = [(f: Fruit) => `Tel ze nog eens rustig. Wijs elke ${f.een} aan.`, (f: Fruit) => `Tel nog eens, rij voor rij. Sla geen ${f.een} over.`, (f: Fruit) => `Begin bovenaan en tel opnieuw. Wijs elke ${f.een} aan.`, (f: Fruit) => `Probeer het nog eens. Tel elke ${f.een} mee, ook de laatste.`];
/** Te veel, en Bliepo noemde de richting. */
const HINT_VEEL = [(f: Fruit) => `Tel nog eens, rij voor rij. Elke ${f.een} tel je maar {1:wit} keer.`, (f: Fruit) => `Tel ze opnieuw. Wijs elke ${f.een} maar {1:wit} keer aan.`, (f: Fruit) => `Begin bovenaan en tel rustig. Elke ${f.een} telt {1:wit} keer mee.`, (f: Fruit) => `Probeer het nog eens. Tel geen ${f.een} {2:wit} keer.`];
/**
 * Hints ZONDER richting: alleen als Bliepo de richting niet noemt ("… dichtbij."). Geen "sla geen over", "1 keer",
 * "maar 1", "te veel" of "ook de laatste": dat zou alsnog zeggen of het kind te weinig of te veel had, en dan blijft er
 * maar 1 keuze over (15.17; keuring 9 nov). `npx tsx scripts/fouttabel-tellen-gouden.ts` controleert dit.
 */
const HINT_NEUTRAAL = [(f: Fruit) => `Begin bovenaan en tel opnieuw. Wijs elke ${f.een} aan.`, (f: Fruit) => `Tel nog eens, rij voor rij. Wijs elke ${f.een} aan.`, (f: Fruit) => `Tel ze nog eens rustig. Wijs elke ${f.een} aan en zeg het getal.`, (f: Fruit) => `Probeer het nog eens. Tel hardop en wijs elke ${f.een} aan.`, (f: Fruit) => `Probeer het nog eens. Tel de ${f.naam} en tik op het getal.`];
/** Alleen de volle rijen geteld (en de richting verklapt niets). */
const HINT_VOLLE = [() => "Kijk ook naar de laatste rij en tel opnieuw.", () => "De laatste rij telt ook mee. Tel nog eens.", (f: Fruit) => `Tel ook de ${f.naam} in de laatste rij.`];

/* --- de eerste zin (1e keer mis): Bliepo zegt wat het kind koos, vriendelijk, nooit "fout" --- */

/**
 * ZONDER richting (als de richting maar 1 keuze zou overlaten, 15.17). Elke variant is waar voor elk fout antwoord van
 * deze les: alle foute keuzes liggen 1 of 2 naast het goede.
 */
const DICHTBIJ: ((X: string, f: Fruit) => string)[] = [(X: string) => `Je koos ${X}. Je zit er dichtbij.`, (X: string) => `Je koos ${X}. Dat scheelt niet veel.`, (X: string) => `Bijna! ${X} is het net niet.`, (X: string) => `${X}? Dat is heel dichtbij.`, (X: string) => `Je tikte op ${X}. Het scheelt maar een klein beetje.`];
/** Te weinig, met richting. */
const WEINIG: ((X: string, f: Fruit) => string)[] = [(X: string) => `Je koos ${X}. Er liggen er nog meer.`, (X: string) => `Je koos ${X}. Je hebt ze nog niet allemaal geteld.`, (X: string) => `Bijna! ${X} is nog iets te weinig.`, (X: string) => `${X}? Ik zie er nog meer.`, (X: string) => `Je zit er dichtbij met ${X}. Je hebt ze nog niet allemaal geteld.`, (X: string, f: Fruit) => `${X} ${f.naam}? Je hebt ze nog niet allemaal geteld.`];
/** Te veel, met richting. */
const VEEL: ((X: string, f: Fruit) => string)[] = [(X: string) => `Je koos ${X}. Dat zijn er iets te veel.`, (X: string) => `${X}? Dat zijn er iets te veel.`, (X: string) => `Bijna! ${X} is iets te veel.`, (X: string) => `Je zit er dichtbij, maar ${X} is te veel.`, (X: string) => `Je tikte op ${X}. Zo veel liggen er niet.`, (X: string, f: Fruit) => `${X} ${f.naam}? Ik denk dat je er te veel hebt geteld.`];
/** Alleen de volle rijen geteld. */
const VOLLE: ((X: string, f: Fruit) => string)[] = [(X: string) => `Je hebt alleen de volle rijen geteld. Dat zijn er ${X}.`, (X: string) => `Je koos ${X}. Zoveel liggen er in de volle rijen.`, (X: string) => `Je kwam op ${X}. Dat zijn alleen de volle rijen.`];

/* --- de uitleg (2e keer mis): uitleg, geen opdracht; meteen daarna tellen we samen --- */

const UITLEG_WEINIG_1 = [(f: Fruit) => `Er ligt nog ${gk(1, f)} ${f.een} meer.`, (f: Fruit) => `Je hebt ${gk(1, f)} ${f.een} overgeslagen.`, (f: Fruit) => `Je hebt ${gk(1, f)} ${f.een} niet geteld.`];
const UITLEG_WEINIG_PAAR = [(f: Fruit) => `Er liggen nog een paar ${f.naam} meer.`, (f: Fruit) => `Je hebt een paar ${f.naam} overgeslagen.`, (f: Fruit) => `Je hebt een paar ${f.naam} niet geteld.`];
const UITLEG_VEEL_1 = [(f: Fruit) => `Je hebt ${gk(1, f)} ${f.een} {2:wit} keer geteld.`, (f: Fruit) => `Er ligt ${gk(1, f)} ${f.een} minder.`, (f: Fruit) => `Je telde ${gk(1, f)} ${f.een} te veel.`];
const UITLEG_VEEL_PAAR = [(f: Fruit) => `Je hebt een paar ${f.naam} {2:wit} keer geteld.`, (f: Fruit) => `Er liggen een paar ${f.naam} minder.`, (f: Fruit) => `Je telde een paar ${f.naam} te veel.`];
const UITLEG_VOLLE = [() => "De rij die niet vol is, telt ook mee.", () => "De laatste rij is niet vol. Die hoort er ook bij.", (f: Fruit) => `Ook de ${f.naam} in de laatste rij tellen mee.`];

/* --- 2 keer dezelfde denkfout (en Bliepo noemde de 1e keer de richting): "weer", en anders uitgelegd --- */

const WEER_WEINIG = ["Je telde er weer te weinig.", "Het zijn er weer iets te weinig.", "Weer iets te weinig, zie ik."];
const WEER_WEINIG_UITLEG = [(f: Fruit) => `Elke ${f.een} krijgt {1:wit} nummer. Dan sla je er geen over.`, (f: Fruit) => `We geven elke ${f.een} een nummer. Zo vergeten we er geen.`];
const WEER_VEEL = ["Je telde er weer te veel.", "Het zijn er weer iets te veel.", "Weer iets te veel, zie ik."];
const WEER_VEEL_UITLEG = [(f: Fruit) => `Elke ${f.een} krijgt {1:wit} nummer. Dan tel je niets {2:wit} keer.`, (f: Fruit) => `We geven elke ${f.een} een nummer. Zo tellen we er geen {2:wit} keer.`];
const WEER_VOLLE = ["Je hebt weer alleen de volle rijen geteld.", "Dat zijn weer alleen de volle rijen.", "Je keek weer alleen naar de volle rijen."];
const WEER_VOLLE_UITLEG = [(f: Fruit) => `Ook de ${f.naam} in de laatste rij horen erbij.`, () => "De laatste rij is korter, maar hoort er ook bij."];

/** Woorden die een richting geven (te weinig of te veel); verboden in een hint als Bliepo de richting niet noemt. */
export const RICHTINGWOORDEN = /\bover\b|niet geteld|\bmeer\b|1 keer|maar 1|te veel|te weinig|dubbel|laatste rij/i;
/** Hetzelfde voor de zinnen van 18 november 2026 (strenger; RICHTINGWOORDEN hierboven blijft zoals hij was voor Rekenmix). */
export const RICHTINGWOORDEN_TEL = /\bover\b|overgeslagen|niet geteld|niet allemaal|\bmeer\b|\bminder\b|1 keer|2 keer|maar 1|te veel|te weinig|zo veel|dubbel|laatste|volle rijen/i;
/** Woorden waarmee Bliepo zegt dat het bijna goed was. Bij 1 vraag komt zo'n woord hooguit 1 keer (keuring 11 nov). */
const KERN = /dichtbij|bijna|scheelt/gi;
export const zelfdeKern = (a: string, b: string) => {
  const A = new Set((a.match(KERN) ?? []).map((w) => w.toLowerCase()));
  return (b.match(KERN) ?? []).some((w) => A.has(w.toLowerCase()));
};

/**
 * De fouttabel van 1 fout antwoord. EIGEN INVULLING, NIET VAN SYNTHESIS (boven 10).
 * Het draaiboek noemt bij een fout het gekozen getal en de richting (te weinig / te veel). Zou de richting bij deze 3
 * keuzes maar 1 keuze overlaten, dan noemt Bliepo de richting NIET (anders verklapt de hint het antwoord, 15.17) en
 * wijst hij alleen naar de manier van tellen. Dat geldt sinds 18 november 2026 ook bij "alleen de volle rijen" (vraag 15,
 * keuze 10: was een open vraag in KEUZES Ronde 20; Sara: hints verraden het antwoord nooit).
 */
export function telFout(x: number, v: Telvraag): Fout {
  const f = v.fruit;
  const X = gk(x, f);
  const goed = v.n;
  const vol = Math.floor(goed / 5) * 5;
  const kant = v.keuzes.filter((k) => k !== x && (x < goed ? k > x : k < x));
  const verklapt = kant.length === 1;
  const verschil = Math.abs(goed - x);
  const NOOT = "richting niet genoemd: dan bleef er maar 1 keuze over";
  const metX = (l: ((X: string, f: Fruit) => string)[]) => l.map((z) => z(X, f));
  const metF = (l: ((f: Fruit) => string)[]) => l.map((z) => z(f));
  const vast = <T>(l: T[]): T => l[v.nr % l.length];
  const maak = (d: { code: Denkfoutnaam; denkfout: string; noot?: string } & Varianten): Fout => ({
    code: d.code,
    soort: d.code,
    denkfout: d.denkfout,
    eerste: vast(d.eerste),
    hint: vast(d.hint),
    uitleg: vast(d.uitleg),
    weer: [vast(d.weerEerste), vast(d.weerUitleg)],
    scherm: SCHERM,
    ...(d.noot ? { noot: d.noot } : {}),
    v: { eerste: d.eerste, hint: d.hint, uitleg: d.uitleg, weerEerste: d.weerEerste, weerUitleg: d.weerUitleg },
  });
  if (x < goed && x === vol)
    return maak({
      code: "alleen-volle-rijen",
      denkfout: "telde alleen de volle rijen van 5, niet de rij die niet vol is",
      eerste: verklapt ? metX(DICHTBIJ) : metX(VOLLE),
      hint: verklapt ? metF(HINT_NEUTRAAL) : metF(HINT_VOLLE),
      /* Uitleg, geen opdracht: meteen daarna tellen we samen (LESRECEPT, keuring Getallenlijn). */
      uitleg: metF(UITLEG_VOLLE),
      weerEerste: WEER_VOLLE,
      weerUitleg: metF(WEER_VOLLE_UITLEG),
      ...(verklapt ? { noot: NOOT } : {}),
    });
  if (x < goed)
    return maak({
      code: "te-weinig",
      denkfout: "telde er te weinig (sloeg er een over)",
      eerste: verklapt ? metX(DICHTBIJ) : metX(WEINIG),
      hint: verklapt ? metF(HINT_NEUTRAAL) : metF(HINT_WEINIG),
      uitleg: metF(verschil === 1 ? UITLEG_WEINIG_1 : UITLEG_WEINIG_PAAR),
      weerEerste: WEER_WEINIG,
      weerUitleg: metF(WEER_WEINIG_UITLEG),
      ...(verklapt ? { noot: NOOT } : {}),
    });
  if (x > goed)
    return maak({
      code: "te-veel",
      denkfout: "telde er te veel (telde er een 2 keer)",
      eerste: verklapt ? metX(DICHTBIJ) : metX(VEEL),
      hint: verklapt ? metF(HINT_NEUTRAAL) : metF(HINT_VEEL),
      uitleg: metF(verschil === 1 ? UITLEG_VEEL_1 : UITLEG_VEEL_PAAR),
      weerEerste: WEER_VEEL,
      weerUitleg: metF(WEER_VEEL_UITLEG),
      ...(verklapt ? { noot: NOOT } : {}),
    });
  return { code: "onduidelijk", soort: "onduidelijk", denkfout: "niet duidelijk (geen reden verzonnen)", eerste: "", hint: HINT_NEUTRAAL[0](f), uitleg: "We tellen ze rustig, stuk voor stuk.", weer: ["We tellen ze rustig, stuk voor stuk."], scherm: SCHERM };
}

/**
 * Wat Bliepo bij de 2e fout als eerste zin mag zeggen als het kind een ANDER fout getal koos dan de 1e keer (en het niet
 * dezelfde denkfout is): elke variant van de eerste zin, behalve die met een woord dat hij bij deze vraag al zei
 * ("dichtbij", "bijna", "scheelt"; keuring 11 nov 2026: nooit 2 keer "dichtbij" bij 1 vraag). De les en het
 * fouttabel-script gebruiken allebei deze functie.
 */
export function tweedeEerste(x: number, v: Telvraag, eersteZin: string): string[] {
  const alle = telFout(x, v).v?.eerste ?? [];
  const over = alle.filter((z) => !zelfdeKern(eersteZin, z));
  return over.length ? over : alle;
}

/**
 * Bewaard van de eerste versie (het fouttabel-script loopt ze nog na): een andere variant van de eerste zin dan de
 * vaste, en een variant zonder het woord "dichtbij". De les kiest sinds 18 november 2026 met `tweedeEerste`.
 */
export const dichtbijAnders = (x: number, v: Telvraag) => {
  const f = telFout(x, v);
  return (f.v?.eerste ?? [f.eerste]).find((z) => z !== f.eerste && !zelfdeKern(f.eerste, z)) ?? f.eerste;
};
export function zonderDichtbij(x: number, v: Telvraag): string {
  const f = telFout(x, v);
  if (!/dichtbij/.test(f.eerste)) return f.eerste;
  return (f.v?.eerste ?? []).find((z) => !/dichtbij/.test(z)) ?? f.eerste;
}

/** De fouttabel van een vraag: elk fout antwoord. */
export const foutenVan = (v: Telvraag): Record<string, Fout> => Object.fromEntries(v.keuzes.filter((k) => k !== v.n).map((k) => [String(k), telFout(k, v)]));

/** Alle variantenrijtjes bij een fout, met een naam (voor de fouttabel en voor WIJZIGINGEN-ZINNEN-TELLEN.md). */
export const VARIANTEN_FOUT = (f: Fruit, X: string): [string, string[]][] => [
  ["Eerste zin, zonder richting", DICHTBIJ.map((z) => z(X, f))],
  ["Eerste zin, te weinig", WEINIG.map((z) => z(X, f))],
  ["Eerste zin, te veel", VEEL.map((z) => z(X, f))],
  ["Eerste zin, alleen de volle rijen", VOLLE.map((z) => z(X, f))],
  ["Hint, zonder richting", HINT_NEUTRAAL.map((z) => z(f))],
  ["Hint, te weinig", HINT_WEINIG.map((z) => z(f))],
  ["Hint, te veel", HINT_VEEL.map((z) => z(f))],
  ["Hint, alleen de volle rijen", HINT_VOLLE.map((z) => z(f))],
  ["Uitleg 2e keer, 1 te weinig", UITLEG_WEINIG_1.map((z) => z(f))],
  ["Uitleg 2e keer, een paar te weinig", UITLEG_WEINIG_PAAR.map((z) => z(f))],
  ["Uitleg 2e keer, 1 te veel", UITLEG_VEEL_1.map((z) => z(f))],
  ["Uitleg 2e keer, een paar te veel", UITLEG_VEEL_PAAR.map((z) => z(f))],
  ["Uitleg 2e keer, alleen de volle rijen", UITLEG_VOLLE.map((z) => z(f))],
  ["Weer te weinig", WEER_WEINIG],
  ["Weer te weinig, uitleg", WEER_WEINIG_UITLEG.map((z) => z(f))],
  ["Weer te veel", WEER_VEEL],
  ["Weer te veel, uitleg", WEER_VEEL_UITLEG.map((z) => z(f))],
  ["Weer alleen de volle rijen", WEER_VOLLE],
  ["Weer alleen de volle rijen, uitleg", WEER_VOLLE_UITLEG.map((z) => z(f))],
];
