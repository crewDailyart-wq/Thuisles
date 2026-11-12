/**
 * ALLE ZINNEN VAN BLIEPO in de EXTRA les Tellen (squla-tellen-fruit-1-gouden-extra, 12 november 2026), op één plek, met
 * de FOUTTABEL. De les zelf (squla-tellen-extra-gouden.tsx) bevat geen eigen zinnen.
 *
 * Besluit Sara (12 november 2026, 20.3): de Synthesis-opdrachten uit het draaiboek Tellen die niet in de Squla-les zitten,
 * als EXTRA les naast de gouden les. Het zijn stap 5 t/m 9 van SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tellen.md, met FRUIT in
 * plaats van gekleurde vakjes (de Squla-les telt fruit), en de getallen van het draaiboek (tot en met 10):
 *   stap 5  van welk fruit zie je er N? (2 keer: 8 en 7), met de telhulp (een stipje op het fruit);
 *   stap 6  2 soorten samen tellen (peren en pruimen: 3 + 4 = 7);
 *   stap 7  "nu andersom" (de terugverwijzing);
 *   stap 8  zelf maken: maak 4 peren in het rooster;
 *   stap 9  het lijstje: 4 appels, 7 peren en 10 pruimen.
 * De rijtjes (lof, speciale momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is) zijn die
 * van de gouden klokles (BLIEPO-KARAKTER.md). De FOUTTABEL is EIGEN INVULLING, NIET VAN SYNTHESIS (draaiboek §6: Color
 * Count benoemt de denkfout zelden; Bliepo doet dat altijd, BOUWREGELS 15.9).
 *
 * Leesbare versie: FOUTTABEL-squla-tellen-fruit-1-gouden-extra.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-tellen-extra-gouden.ts`). {8:groen} = een getal in de kleur van het fruit; {7:wit} = een
 * getal dat naar niets bijzonders verwijst.
 */

import type { Kleurnaam, Soort } from "../vlakken/squla-tellen-tekenen";
import { VASTE_KLEUR } from "../vlakken/squla-tellen-tekenen";
import { zaad, OND_FOUT, type Fout, type Rijtje } from "./squla-extra-zuiver";
import type { ExtraCel, LijstRegel } from "../vlakken/squla-tellen-extra-vlak";

export { BEVESTIG, EINDE, LOF, MOMENT, NAAM_LOF, type Rijtje } from "./squla-extra-zuiver";
export { NAAM_GROET } from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/* ---------- het fruit ---------- */

export type Fruit = { soort: Soort; een: string; naam: string; kleur: Kleurnaam };
const fruit = (soort: Soort, een: string, naam: string): Fruit => ({ soort, een, naam, kleur: VASTE_KLEUR[soort] });
export const APPEL = fruit("appel", "appel", "appels");
export const PEER = fruit("peer", "peer", "peren");
export const PRUIM = fruit("pruim", "pruim", "pruimen");
export const CITROEN = fruit("citroen", "citroen", "citroenen");
export const ALLE_FRUIT = [APPEL, PEER, PRUIM, CITROEN];
export const FRUIT: Record<string, Fruit> = { appel: APPEL, peer: PEER, pruim: PRUIM, citroen: CITROEN };

/** Een getal in de kleur van het fruit waar het naar verwijst (BOUWREGELS 2.1, 2.2). */
export const gk = (n: number, f: Fruit) => `{${n}:${f.kleur}}`;
/** "1 peer" of "4 peren": het goede woord bij het aantal. */
export const stuks = (n: number, f: Fruit) => `${gk(n, f)} ${n === 1 ? f.een : f.naam}`;
/** Een getal dat naar niets bijzonders verwijst: wit. */
export const gw = (n: number) => `{${n}:wit}`;

/* ---------- de roosters ---------- */

export type Rooster = { id: string; kolommen: number; cellen: ExtraCel[] };

/** Een rooster met fruit door elkaar: per soort een aantal; de plekken liggen vast per rooster (zaad). */
export function maakRooster(id: string, kolommen: number, aantallen: [Fruit, number][]): Rooster {
  const lijst: ExtraCel[] = aantallen.flatMap(([f, n]) => Array.from({ length: n }, () => f.soort));
  const r = zaad(id);
  for (let i = lijst.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [lijst[i], lijst[j]] = [lijst[j], lijst[i]];
  }
  return { id, kolommen, cellen: lijst };
}
export const leegRooster = (id: string, kolommen: number, n: number): Rooster => ({ id, kolommen, cellen: Array.from({ length: n }, () => null) });
export const aantalVan = (cellen: ExtraCel[], f: Fruit) => cellen.filter((c) => c === f.soort).length;

/* ---------- de vragen (draaiboek Tellen stap 5 t/m 9; getallen tot 10) ---------- */

/** Stap 5: van welk fruit zie je er N? (afleider: een soort met 1 meer of 1 minder, zoals het draaiboek). */
export type SoortVraag = { nr: number; id: string; rooster: Rooster; n: number; goed: Fruit };
export const SOORTVRAGEN: SoortVraag[] = [
  { nr: 1, id: "soort1-8-peren", rooster: maakRooster("tellen-extra-soort1", 9, [[APPEL, 9], [PEER, 8], [PRUIM, 6], [CITROEN, 4]]), n: 8, goed: PEER },
  { nr: 2, id: "soort2-7-pruimen", rooster: maakRooster("tellen-extra-soort2", 9, [[APPEL, 8], [PEER, 6], [PRUIM, 7], [CITROEN, 6]]), n: 7, goed: PRUIM },
];

/** Stap 6: 2 soorten samen (peren en pruimen). Antwoord 7 (draaiboek: 6 of 7). */
export const TWEE = { id: "twee-peren-pruimen-7", rooster: maakRooster("tellen-extra-twee", 7, [[APPEL, 8], [PEER, 3], [PRUIM, 4], [CITROEN, 6]]), a: PEER, b: PRUIM, n: 7, keuzes: [4, 6, 7] };

/** Stap 8: zelf maken (draaiboek: steeds 4). */
export const MAAK = { id: "maak-4-peren", rooster: leegRooster("tellen-extra-maak", 7, 21), f: PEER, n: 4 };

/** Stap 9: het lijstje (draaiboek: 4 + 7 + 10 = 21; het hele rooster). */
export const LIJST = { id: "lijstje-4-7-10", rooster: leegRooster("tellen-extra-lijst", 7, 21), regels: [{ f: APPEL, n: 4 }, { f: PEER, n: 7 }, { f: PRUIM, n: 10 }] };
export const lijstRegels = (): LijstRegel[] => LIJST.regels.map((r) => ({ soort: r.f.soort, n: r.n }));

/* ---------- vaste zinnen van het verloop (eigen woorden) ---------- */

export const ZIN = {
  /** Stap 5 (opening; het draaiboek heeft geen startvraag). */
  begin: ["Nu tel je fruit dat door elkaar ligt.", "Er liggen appels, peren, pruimen en citroenen."],
  vraag1: (n: number) => `Van welk fruit zie je er ${gw(n)}?`,
  vraagEerste: "Tel goed en tik op het fruit.",
  vraag2: (n: number) => `Dit is een ander rooster. Van welk fruit tel je er ${gw(n)}?`,
  /** Stap 6. */
  vraagTwee: (a: Fruit, b: Fruit) => `Nu tel je ${a.naam} en ${b.naam} samen. Hoeveel zijn het er samen?`,
  /** Stap 7: terugverwijzing naar het eerste deel van de les (draaiboek stap 7). */
  andersom: ["Tot nu toe telde je het fruit dat er lag.", "Nu gaan we andersom: ik zeg een getal en jij maakt zoveel stukken fruit."],
  /** Stap 8. */
  maakOpdracht: (f: Fruit, n: number) => `Maak ${gk(n, f)} ${f.naam} in het rooster.`,
  maakUitleg: "Tik op een leeg vakje voor een stuk fruit.",
  maakHand: "Tik op een leeg vakje.",
  /** Stap 9. */
  lijstOvergang: "Nog 1 laatste opdracht. Nu maak je een lijstje.",
  lijstOpdracht: "Maak het lijstje in het rooster. Kies eerst een fruit en tik dan op de vakjes.",
  lijstHand: "Tik op een leeg vakje.",
  /** Het lijstje voorlezen (bij de hint na de 1e fout; draaiboek stap 9). */
  lijstVoor: () => lijstZin(),
  /** Samen tellen (2e fout, soort kiezen). */
  samenHelp: ["Kom, we tellen samen.", "We tellen het samen.", "Kom, dan tellen we samen."],
  samenSoort: (f: Fruit) => `We tellen de ${f.naam}. Tik op elke ${f.een}. Ik tel mee.`,
  samenTwee: (a: Fruit, b: Fruit) => `Tik op elke ${a.een} en elke ${b.een}. Ik tel mee.`,
  samenHand: (f: Fruit) => `Tik op een ${f.een} zonder nummer.`,
  samenHandTwee: "Tik op een stuk fruit zonder nummer.",
  samenKlaar: (n: number, f: Fruit) => `${gk(n, f)}. Samen telden we ${gk(n, f)} ${f.naam}.`,
  samenKlaarTwee: (n: number, a: Fruit, b: Fruit) => `${gw(n)}. Samen telden we ${gw(n)} stuks fruit: ${a.naam} en ${b.naam}.`,
  samenZelf: (n: number, f: Fruit) => `Kijk, ik tel de rest. Het zijn er ${gk(n, f)}.`,
  samenZelfTwee: (n: number) => `Kijk, ik tel de rest. Het zijn er ${gw(n)}.`,
  /** Samen maken (2e fout bij maken en bij het lijstje). */
  maakHelp: ["Ik help je: jij tikt en ik tel mee.", "Kom, jij tikt en ik tel.", "Ik help je. Jij tikt, ik tel mee."],
  maakSamenZin: (f: Fruit) => `Tik op een leeg vakje voor een ${f.een}. Ik tel mee.`,
  maakKlaar: (n: number, f: Fruit) => `En ${gk(n, f)}. Samen maakten we ${gk(n, f)} ${f.naam}.`,
  maakZelf: (n: number, f: Fruit) => `Kijk, ik maak de rest. Zo komen er ${gk(n, f)} ${f.naam}.`,
  lijstHelp: (f: Fruit) => `Ik zet de rest klaar. Jij maakt de ${f.naam}. Ik tel mee.`,
  /** Stap 10: einde. */
  slot: `Je telde en maakte fruit tot wel ${gw(10)}.`,
  weerGekozen: (f: Fruit) => `Je koos weer de ${f.naam}.`,
};

/** "4 appels, 7 peren en 10 pruimen." met elk getal in de kleur van zijn fruit. */
export function lijstZin(): string {
  const d = LIJST.regels.map((r) => `${gk(r.n, r.f)} ${r.f.naam}`);
  return `Het lijstje: ${d.slice(0, -1).join(", ")} en ${d.at(-1)}.`;
}

/** Reactie bij goed (draaiboek §3 A.1 (a): lof met het aantal en de soort). Elk rijtje heeft het aantal erin. */
export const TELREACTIE = (n: number, f: Fruit) => rij([`Klopt, er zijn er ${gk(n, f)}.`, `Ja, je telde ${gk(n, f)} ${f.naam}.`, `Het zijn ${gk(n, f)} ${f.naam}.`, `${gk(n, f)} ${f.naam}, precies.`, `Ik heb ze nagekeken: ${gk(n, f)} ${f.naam}.`], [4]);
export const TELREACTIE_ROBOT = 4;
export const TELREACTIE_TWEE = (n: number, a: Fruit, b: Fruit) => rij([`Klopt, ${gw(n)} samen.`, `Ja, ${a.naam} en ${b.naam} zijn samen ${gw(n)}.`, `Het zijn er ${gw(n)}.`, `${gw(n)} stuks fruit, precies.`, `Ik heb ze nagekeken: samen ${gw(n)}.`], [4]);
export const MAAKREACTIE = (n: number, f: Fruit) => rij([`Dat is hem: ${gk(n, f)} ${f.naam}.`, `Precies, ${gk(n, f)} ${f.naam}.`, `Klopt, ${gk(n, f)} ${f.naam}.`, `Je maakte ${gk(n, f)} ${f.naam}.`, `Ik heb ze nagekeken: ${gk(n, f)} ${f.naam}.`], [4]);
export const LIJSTREACTIE = rij(["Perfect, je vulde het hele rooster.", "Het lijstje klopt helemaal.", "Alles staat goed. Het hele rooster is vol.", "Precies zoals het lijstje.", "Ik heb alles nagekeken: het klopt."], [4]);

/* ---------- denkfouten (draaiboek Tellen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["soort-een-te-veel", "soort-een-te-weinig", "een-soort-vergeten", "te-weinig-samen", "te-veel-gemaakt", "te-weinig-gemaakt", "nog-niets-gemaakt", "lijst-soort-mis", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

const SCHERM_SOORT = "knoppen even weg; het gekozen fruit blijft helder en heeft nummers, de rest wordt dof (het draaiboek: de gekozen soort blijft fel); stipjes blijven staan; Bliepo's scherm 1,5 s rood; met de hint komen de knoppen meteen terug (geen pijl)";

/** 3 hints per soort, in eigen woorden; welke hangt af van het vraagnummer (niet steeds dezelfde). */
const HINT_SOORT = [
  "Tel ook het andere fruit. Een stipje op het fruit helpt je.",
  "Tel nog eens, het ene fruit na het andere. Zet een stipje op wat je telde.",
  "Kijk goed naar elk fruit. Je mag stipjes zetten.",
];
/** De uitleg na de 2e fout in 3 versies (niet 2 keer dezelfde zin kort na elkaar; F8). */
const UITLEG_SOORT = ["Als je elk fruit apart telt, weet je het zeker.", "Je telt het ene fruit na het andere. Zo mis je niets.", "Elk fruit apart tellen helpt. Dan raak je niets kwijt."];
const EERSTE_SOORT = [(f: Fruit, c: number) => `Je koos de ${f.naam}. Ik tel er ${gk(c, f)}.`, (f: Fruit, c: number) => `${f.naam[0].toUpperCase()}${f.naam.slice(1)}? Daar tel ik er ${gk(c, f)}.`, (f: Fruit, c: number) => `Je koos de ${f.naam}. Dat zijn er ${gk(c, f)}.`];

/**
 * Stap 5. Het draaiboek (§3 B.2): de tutor telt de gekozen soort hardop en zegt het goede antwoord niet. Bij ons: de
 * gekozen soort krijgt zijn nummers, Bliepo noemt het aantal (verklapt niets over het goede fruit; 15.17).
 */
export function soortFout(x: string, v: SoortVraag): Fout {
  const f = FRUIT[x];
  const c = aantalVan(v.rooster.cellen, f);
  const verschil = c - v.n;
  const hint = HINT_SOORT[v.nr % 3];
  const uitleg = UITLEG_SOORT[v.nr % 3];
  const eerste = EERSTE_SOORT[v.nr % 3](f, c);
  if (verschil === 1)
    return { code: "soort-een-te-veel", soort: "soort-een-te-veel", denkfout: "koos een soort met 1 meer dan gevraagd (telde er 1 te veel)", eerste, hint, uitleg, weer: ["Je koos weer fruit met net te veel.", "Elk fruit tel je apart, een voor een."], scherm: SCHERM_SOORT };
  if (verschil === -1)
    return { code: "soort-een-te-weinig", soort: "soort-een-te-weinig", denkfout: "koos een soort met 1 minder dan gevraagd (miste er 1)", eerste, hint, uitleg, weer: ["Je koos weer fruit met net te weinig.", "Elk fruit tel je apart, een voor een."], scherm: SCHERM_SOORT };
  return { ...OND_FOUT(hint, uitleg), eerste: "", scherm: SCHERM_SOORT };
}
export const foutenSoort = (v: SoortVraag): Record<string, Fout> => Object.fromEntries(ALLE_FRUIT.filter((f) => f !== v.goed).map((f) => [f.soort, soortFout(f.soort, v)]));

/**
 * Stap 6: 2 soorten samen. Draaiboek §3 A.2: bij maar 1 soort geteld zegt de tutor alleen dat het meer is, niet welke soort
 * mist. De keuzes zijn 4 (alleen de pruimen), 6 (1 te weinig) en 7. Bij 6 zou de richting maar 1 keuze overlaten (7), dus
 * dan alleen "dichtbij" (15.17).
 */
export function tweeFout(x: string): Fout {
  const c = Number(x);
  const hintTwee = "Tel de peren én de pruimen. Allebei horen erbij.";
  if (c === aantalVan(TWEE.rooster.cellen, TWEE.b) || c === aantalVan(TWEE.rooster.cellen, TWEE.a))
    return { code: "een-soort-vergeten", soort: "een-soort-vergeten", denkfout: "telde maar 1 van de 2 soorten", eerste: `Je koos ${gw(c)}. Dat is nog niet genoeg.`, hint: hintTwee, uitleg: "Peren en pruimen horen allebei bij de vraag. Die tel je samen.", weer: ["Je telde weer maar 1 van de 2.", "De peren en de pruimen tel je samen."], scherm: "knoppen even weg; peren en pruimen blijven helder, de rest wordt dof; stipjes blijven staan; Bliepo's scherm 1,5 s rood; met de hint komen de knoppen terug" };
  if (c === TWEE.n - 1)
    return { code: "te-weinig-samen", soort: "te-weinig-samen", denkfout: "telde er 1 te weinig (sloeg er 1 over)", eerste: `${gw(c)} is dichtbij.`, hint: "Tel nog eens, eerst de peren en dan de pruimen. Zet stipjes op wat je geteld hebt.", uitleg: "Je hebt er net een gemist. Je telt ze rustig, een voor een.", weer: ["Je zit er weer dichtbij.", "Je telt ze rustig, een voor een."], scherm: "knoppen even weg; peren en pruimen blijven helder; Bliepo's scherm 1,5 s rood", noot: "richting niet genoemd: dan bleef er maar 1 keuze over" };
  return OND_FOUT("Tel de peren én de pruimen. Zet stipjes op wat je geteld hebt.", "De peren en pruimen tel je samen, een voor een.");
}
export const foutenTwee = (): Record<string, Fout> => Object.fromEntries(TWEE.keuzes.filter((k) => k !== TWEE.n).map((k) => [String(k), tweeFout(String(k))]));

/** Stap 8: zelf maken. Draaiboek §3 C: te veel = "tik er een om hem uit te zetten". */
export function maakFout(c: number): Fout {
  const f = MAAK.f;
  const hintTe = "Tik op een peer om hem weer weg te halen.";
  if (c === 0) return { code: "nog-niets-gemaakt", soort: "nog-niets-gemaakt", denkfout: "nog geen fruit gezet", eerste: "Er staat nog geen peer in het rooster.", hint: "Tik op een leeg vakje voor een peer.", uitleg: "Elk vakje dat je aantikt, krijgt een stuk fruit.", weer: ["Er staat nog steeds geen peer in het rooster.", "Elk vakje dat je aantikt, krijgt een stuk fruit."], scherm: "kop blijft staan; Bliepo's scherm 1,5 s rood; vinkje en handje even uit" };
  if (c > MAAK.n) return { code: "te-veel-gemaakt", soort: "te-veel-gemaakt", denkfout: "maakte er te veel", eerste: `Je maakte ${stuks(c, f)}. Dat zijn er te veel.`, hint: hintTe, uitleg: "Een stuk fruit dat je weer aantikt, gaat weg. Het getal in de opdracht zegt hoeveel er komen.", weer: ["Je maakte er weer te veel.", "Een peer die je weer aantikt, gaat weg."], scherm: "kop en fruit blijven staan; Bliepo's scherm 1,5 s rood; vinkje en handje even uit" };
  return { code: "te-weinig-gemaakt", soort: "te-weinig-gemaakt", denkfout: "maakte er te weinig", eerste: `Je maakte ${stuks(c, f)}. Dat zijn er nog niet genoeg.`, hint: "Tik nog op een leeg vakje voor een peer erbij.", uitleg: "In de opdracht staat hoeveel er komen. Zoveel vakjes tik je aan.", weer: ["Je maakte er weer te weinig.", "Een leeg vakje dat je aantikt, krijgt een peer."], scherm: "kop en fruit blijven staan; Bliepo's scherm 1,5 s rood; vinkje en handje even uit" };
}
export const foutenMaak = (): Record<string, Fout> => Object.fromEntries([0, 1, 2, 3, 5, 6, 7, 21].map((c) => [String(c), maakFout(c)]));

/**
 * Stap 9: het lijstje. Draaiboek §3 D: de tutor noemt welke soort klopt en welke nog niet; de 2e keer andere woorden; de
 * 3e keer het precieze aantal (bij ons is dat de 2e fout: 2 pogingen, 15.11). `tel` = hoeveel van elke soort er staan.
 */
export function lijstFout(tel: number[]): Fout {
  const regels = LIJST.regels;
  const mis = regels.filter((r, i) => tel[i] !== r.n);
  const goed = regels.filter((r, i) => tel[i] === r.n);
  const naam = (f: Fruit) => `de ${f.naam}`;
  let eerste: string;
  if (goed.length === 0) eerste = "Nog geen enkel fruit klopt. Kijk nog eens naar het lijstje.";
  else if (mis.length === 1) eerste = `De ${goed.map((r) => r.f.naam).join(" en de ")} kloppen. Kijk nu naar ${naam(mis[0].f)}.`;
  else eerste = `${naam(goed[0].f)[0].toUpperCase()}${naam(goed[0].f).slice(1)} kloppen. Kijk naar ${mis.map((r) => naam(r.f)).join(" en ")}.`;
  const eerstMis = regels.findIndex((r, i) => tel[i] !== r.n);
  const m = regels[eerstMis];
  const uitleg = tel[eerstMis] > 0 ? `Ik tel ${stuks(tel[eerstMis], m.f)}. Het lijstje wil er ${gk(m.n, m.f)}.` : `Ik tel nog geen ${m.f.naam}. Het lijstje wil er ${gk(m.n, m.f)}.`;
  return { code: "lijst-soort-mis", soort: "lijst-soort-mis", denkfout: "bij het lijstje klopt minstens 1 soort niet", eerste, hint: lijstZin(), uitleg, weer: [uitleg], scherm: "kop (het lijstje) en de vakjes blijven staan; vinkje even uit; Bliepo's scherm 1,5 s rood; na de zin komt het lijstje nog eens, dan is het vinkje weer aan (geen pijl)" };
}

/** De goede stand van het lijstje: soort per vakje (alle vakjes vol). */
export const LIJST_OPLOSSING: ExtraCel[] = LIJST.regels.flatMap((r) => Array.from({ length: r.n }, () => r.f.soort));
