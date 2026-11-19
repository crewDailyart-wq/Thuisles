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

/* ---------- vaste zinnen van het verloop (eigen woorden) ----------
 *
 * 18 november 2026 (Sara, proefles Tellen): elke zin nagelopen (warm, kort, gewone woorden, nooit "fout", een getal
 * nooit 2 keer achter elkaar) en elke situatie die terugkomt in varianten. Een lijst = varianten: de les kiest er 1 met
 * de gedeelde kiezer (nooit-dubbel.ts), nooit 2 keer achter elkaar dezelfde. "Rooster" is "vakjes" geworden
 * (WOORDEN-GROEP3.md). Getallen, antwoorden en betekenis zijn niet veranderd. Oud naast nieuw:
 * WIJZIGINGEN-ZINNEN-TELLEN.md. Een paar zinnen zijn de tekst van Synthesis (Color Count) in het Nederlands (besluit Sara
 * 17 november 2026, BOUWREGELS 15.2): "Probeer deze eens. Van welk fruit tel je er 7?", "8 appels? Ik tel er 9.",
 * "Dat zijn er een paar te veel.", "Perfect, je hebt alle vakjes gevuld.", "Je hebt helemaal tot 10 geteld".
 */

export const ZIN = {
  /** Stap 5 (opening; het draaiboek heeft geen startvraag). */
  begin: ["Vandaag tellen we fruit dat door elkaar ligt.", "Er liggen appels, peren, pruimen en citroenen."],
  vraag1: (n: number) => `Van welk fruit zie je er ${gw(n)}?`,
  vraagEerste: "Tel goed en kies het fruit.",
  vraag2: (n: number) => `Probeer deze eens. Van welk fruit tel je er ${gw(n)}?`,
  /** Stap 6. */
  vraagTwee: (a: Fruit, b: Fruit) => `Nu tel je de ${a.naam} en de ${b.naam}. Hoeveel zijn het er samen?`,
  /** Stap 7: terugverwijzing naar het eerste deel van de les (draaiboek stap 7). */
  andersom: ["Je hebt steeds fruit geteld dat er al lag.", "Nu doen we het andersom. Ik zeg een getal en jij maakt het fruit."],
  /** Stap 8. */
  maakOpdracht: (f: Fruit, n: number) => `Maak ${gk(n, f)} ${f.naam} in de vakjes.`,
  maakUitleg: (f: Fruit) => `Tik op een leeg vakje. Dan komt er een ${f.een}.`,
  maakHand: ["Tik op een leeg vakje.", "Zoek een leeg vakje en tik erop."],
  /** Stap 9. */
  lijstOvergang: "Dit is de laatste opdracht. Kijk, hier is een lijstje.",
  lijstOpdracht: "Maak al het fruit van het lijstje. Kies eerst een fruit en tik dan op de vakjes.",
  lijstHand: ["Tik op een leeg vakje.", "Zoek een leeg vakje en tik erop."],
  /** Het lijstje voorlezen (bij de hint na de 1e fout; draaiboek stap 9). */
  lijstVoor: () => lijstZin(),
  /** Samen tellen (2e fout, soort kiezen). */
  samenHelp: ["Kom, we tellen samen.", "Weet je wat? We tellen samen.", "Geeft niks. We tellen samen.", "Ik help je even. We tellen samen.", "Laten we samen tellen en kijken."],
  samenSoort: (f: Fruit) => [`We tellen de ${f.naam}. Tik op elke ${f.een}. Ik tel mee.`, `We tellen de ${f.naam}. Tik elke ${f.een} aan. Ik zeg het getal.`, `Nu de ${f.naam}. Tik op elke ${f.een}. Ik tel hardop mee.`],
  samenTwee: (a: Fruit, b: Fruit) => [`Tik op elke ${a.een} en elke ${b.een}. Ik tel mee.`, `Tik alle ${a.naam} en ${b.naam} aan. Ik zeg het getal.`],
  samenHand: (f: Fruit) => [`Tik op een ${f.een} zonder nummer.`, `Zoek een ${f.een} zonder nummer en tik erop.`, `Welke ${f.een} heeft nog geen nummer? Tik erop.`],
  samenHandTwee: (a: Fruit, b: Fruit) => [`Tik op een ${a.een} of ${b.een} zonder nummer.`, `Zoek een ${a.een} of ${b.een} zonder nummer en tik erop.`],
  /** Het laatste getal is het aantal; het getal staat er 1 keer (was: "8. Samen telden we 8 peren."). */
  samenKlaar: (n: number, f: Fruit) => [`En ${gk(n, f)}! Zoveel ${f.naam} zijn het.`, `En ${gk(n, f)}! Nu hebben we ze samen allemaal geteld.`, `En de laatste is ${gk(n, f)}. Zoveel ${f.naam} zijn het.`],
  samenKlaarTwee: (n: number, a: Fruit, b: Fruit) => [`En ${gw(n)}! Zoveel ${a.naam} en ${b.naam} zijn het samen.`, `En de laatste is ${gw(n)}. Zoveel zijn het er samen.`],
  samenZelf: (n: number, f: Fruit) => [`Kijk, ik tel de rest. Het zijn er ${gk(n, f)}.`, `Kijk, ik tel even verder. Het zijn er ${gk(n, f)}.`],
  samenZelfTwee: (n: number) => [`Kijk, ik tel de rest. Het zijn er ${gw(n)}.`, `Kijk, ik tel even verder. Het zijn er ${gw(n)}.`],
  /** Samen maken (2e fout bij maken en bij het lijstje). */
  maakHelp: ["Ik help je. Jij tikt en ik tel mee.", "Kom, we doen het samen. Jij tikt, ik tel.", "Weet je wat? Jij tikt en ik tel hardop.", "Geeft niks. Jij tikt en ik tel mee."],
  maakSamenZin: (f: Fruit) => [`Tik op een leeg vakje voor een ${f.een}.`, `Tik steeds op een leeg vakje. Dan komt er een ${f.een}.`],
  /** Het getal staat er 1 keer (was: "En 4. Samen maakten we 4 peren."). */
  maakKlaar: (n: number, f: Fruit) => [`En ${gk(n, f)}! Nu liggen alle ${f.naam} er.`, `En ${gk(n, f)}. Samen hebben we alle ${f.naam} gemaakt.`],
  maakZelf: (n: number, f: Fruit) => [`Kijk, ik maak de rest. Zo komen er ${gk(n, f)} ${f.naam}.`, `Kijk, ik maak het af. Nu liggen er ${gk(n, f)} ${f.naam}.`],
  /* Met wat het kind nu doet (F16, 15.37; 18 nov 2026): was alleen "De rest leg ik vast neer. De appels zijn voor jou." */
  lijstHelp: (f: Fruit) => [`Ik zet de rest klaar. Jij maakt de ${f.naam}: tik op de lege vakjes.`, `De rest leg ik vast neer. De ${f.naam} zijn voor jou: tik op de lege vakjes.`],
  /** Stap 10: einde. */
  slot: [`Je hebt fruit geteld en gemaakt, tot wel ${gw(10)}!`, `Wat heb jij veel fruit geteld en gemaakt: tot wel ${gw(10)}!`, `Knap, hoor! Je hebt helemaal tot ${gw(10)} geteld en gemaakt.`],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  /** Aanmoediging bij het hulphandje tijdens samen tellen en samen maken (het kind moet tikken; 14.35). */
  aanmoedigTikken: ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."],
  weerGekozen: (f: Fruit) => `Je koos weer de ${f.naam}.`,
};

/** "Op het lijstje staan 4 appels, 7 peren en 10 pruimen." met elk getal in de kleur van zijn fruit. */
export function lijstZin(): string {
  const d = LIJST.regels.map((r) => `${gk(r.n, r.f)} ${r.f.naam}`);
  return `Op het lijstje staan ${d.slice(0, -1).join(", ")} en ${d.at(-1)}.`;
}

/** Reactie bij goed (draaiboek §3 A.1 (a): lof met het aantal en de soort). Elk rijtje heeft het aantal erin. */
export const TELREACTIE = (n: number, f: Fruit) => rij([`Klopt, er zijn er ${gk(n, f)}.`, `Ja, je telde ${gk(n, f)} ${f.naam}.`, `Het zijn ${gk(n, f)} ${f.naam}.`, `${gk(n, f)} ${f.naam}, precies.`, `Inderdaad, je telde tot ${gk(n, f)}.`], [4]);
export const TELREACTIE_ROBOT = 4;
export const TELREACTIE_TWEE = (n: number, a: Fruit, b: Fruit) => rij([`Klopt, ${gw(n)} samen.`, `Ja, ${a.naam} en ${b.naam} zijn samen ${gw(n)}.`, `Het zijn er ${gw(n)}.`, `${gw(n)} stuks fruit, precies.`, `Inderdaad, alles bij elkaar ${gw(n)}.`], [4]);
export const MAAKREACTIE = (n: number, f: Fruit) => rij([`Zo is het goed: ${gk(n, f)} ${f.naam}.`, `Precies, ${gk(n, f)} ${f.naam}.`, `Klopt, ${gk(n, f)} ${f.naam}.`, `Je maakte ${gk(n, f)} ${f.naam}.`, `Inderdaad, er liggen nu ${gk(n, f)} ${f.naam}.`], [4]);
export const LIJSTREACTIE = rij(["Perfect, alle vakjes zijn vol.", "Het lijstje klopt helemaal.", "Alles staat goed. Elk vakje heeft fruit.", "Precies zoals op het lijstje.", "Inderdaad, alles past bij het lijstje.", "Perfect, je hebt alle vakjes gevuld."], [4]);

/* ---------- denkfouten (draaiboek Tellen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["soort-een-te-veel", "soort-een-te-weinig", "een-soort-vergeten", "te-weinig-samen", "te-veel-gemaakt", "te-weinig-gemaakt", "nog-niets-gemaakt", "lijst-soort-mis", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Alle varianten bij 1 fout antwoord (18 nov 2026); de les kiest er steeds 1, nooit 2 keer achter elkaar dezelfde. */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };
/** Een regel van de fouttabel met zijn varianten. `eerste`, `hint`, `uitleg` en `weer` zijn 1 vaste variant (voor de fouttabel). */
export type FoutV = Fout & { v?: Varianten };
const metV = (basis: Omit<Fout, "eerste" | "hint" | "uitleg" | "weer">, nr: number, v: Varianten): FoutV => {
  const vast = (l: string[]) => l[nr % l.length] ?? "";
  return { ...basis, eerste: vast(v.eerste), hint: vast(v.hint), uitleg: vast(v.uitleg), weer: v.weerEerste.length ? [vast(v.weerEerste), vast(v.weerUitleg)].filter(Boolean) : [], v };
};

const SCHERM_SOORT = "knoppen even weg; het gekozen fruit blijft helder en heeft nummers, de rest wordt dof (het draaiboek: de gekozen soort blijft fel); stipjes blijven staan; Bliepo's scherm 1,5 s rood; met de hint komen de knoppen meteen terug (geen pijl)";

/** De hints bij "van welk fruit zie je er N?" (zonder het antwoord; de 3e zegt nog eens wat we zoeken, 14.32). */
const HINT_SOORT = (n: number) => ["Tel ook het andere fruit. Een stipje op het fruit helpt je.", "Tel elk fruit apart. Zet een stipje op wat je al geteld hebt.", `We zoeken het fruit met ${gw(n)}. Tik op het fruit voor een stipje.`];
/** De uitleg na de 2e fout (uitleg, geen opdracht). */
const UITLEG_SOORT = ["Als je elk fruit apart telt, weet je het zeker.", "Eerst het ene fruit, dan het andere. Zo sla je niets over.", "Elk fruit apart tellen helpt. Dan vergeet je er geen."];
const EERSTE_SOORT = (f: Fruit, c: number, n: number) => [`${gw(n)} ${f.naam}? Ik tel er ${gk(c, f)}.`, `Je koos de ${f.naam}. Ik tel er ${gk(c, f)}.`, `${f.naam[0].toUpperCase()}${f.naam.slice(1)}? Daar tel ik er ${gk(c, f)}.`, `Je koos de ${f.naam}. Dat zijn er ${gk(c, f)}.`, `Je tikte op de ${f.naam}. Daar liggen er ${gk(c, f)} van.`];
const WEER_SOORT_UITLEG = ["Elk fruit tel je apart, stuk voor stuk.", "We tellen elk fruit apart. Zo weten we het zeker."];

/**
 * Stap 5. Het draaiboek (§3 B.2): de tutor telt de gekozen soort hardop en zegt het goede antwoord niet. Bij ons: de
 * gekozen soort krijgt zijn nummers, Bliepo noemt het aantal (verklapt niets over het goede fruit; 15.17).
 */
export function soortFout(x: string, v: SoortVraag): FoutV {
  const f = FRUIT[x];
  const c = aantalVan(v.rooster.cellen, f);
  const verschil = c - v.n;
  const hint = HINT_SOORT(v.n);
  const eerste = EERSTE_SOORT(f, c, v.n);
  if (verschil === 1)
    return metV({ code: "soort-een-te-veel", soort: "soort-een-te-veel", denkfout: "koos een soort met 1 meer dan gevraagd (telde er 1 te veel)", scherm: SCHERM_SOORT }, v.nr, { eerste, hint, uitleg: UITLEG_SOORT, weerEerste: ["Je koos weer fruit met net te veel.", "Dit is weer fruit met net te veel."], weerUitleg: WEER_SOORT_UITLEG });
  if (verschil === -1)
    return metV({ code: "soort-een-te-weinig", soort: "soort-een-te-weinig", denkfout: "koos een soort met 1 minder dan gevraagd (miste er 1)", scherm: SCHERM_SOORT }, v.nr, { eerste, hint, uitleg: UITLEG_SOORT, weerEerste: ["Je koos weer fruit met net te weinig.", "Dit is weer fruit met net te weinig."], weerUitleg: WEER_SOORT_UITLEG });
  /* Denkfout niet duidelijk: geen reden verzonnen; een zin uit het vaste rijtje, de hint en de uitleg in varianten. */
  const ond = OND_FOUT(hint[v.nr % hint.length], UITLEG_SOORT[v.nr % UITLEG_SOORT.length]);
  return { ...ond, eerste: "", scherm: SCHERM_SOORT, v: { eerste: [], hint, uitleg: UITLEG_SOORT, weerEerste: [], weerUitleg: [] } };
}
export const foutenSoort = (v: SoortVraag): Record<string, FoutV> => Object.fromEntries(ALLE_FRUIT.filter((f) => f !== v.goed).map((f) => [f.soort, soortFout(f.soort, v)]));

/**
 * Stap 6: 2 soorten samen. Draaiboek §3 A.2: bij maar 1 soort geteld zegt de tutor alleen dat het meer is, niet welke soort
 * mist. De keuzes zijn 4 (alleen de pruimen), 6 (1 te weinig) en 7. Bij 6 zou de richting maar 1 keuze overlaten (7), dus
 * dan alleen "dichtbij" (15.17).
 */
export function tweeFout(x: string): FoutV {
  const c = Number(x);
  const schermTwee = "knoppen even weg; peren en pruimen blijven helder, de rest wordt dof; stipjes blijven staan; Bliepo's scherm 1,5 s rood; met de hint komen de knoppen terug";
  if (c === aantalVan(TWEE.rooster.cellen, TWEE.b) || c === aantalVan(TWEE.rooster.cellen, TWEE.a))
    return metV({ code: "een-soort-vergeten", soort: "een-soort-vergeten", denkfout: "telde maar 1 van de 2 soorten", scherm: schermTwee }, 0, {
      eerste: [`Je koos ${gw(c)}. Dat is nog niet genoeg.`, `${gw(c)}? Dat zijn er nog niet genoeg.`, `Je tikte op ${gw(c)}. Dat is nog te weinig.`],
      hint: ["Tel de peren én de pruimen. Allebei horen erbij.", "Tel eerst de peren en dan de pruimen. Ze horen er allebei bij."],
      uitleg: ["Peren en pruimen horen allebei bij de vraag. Die tel je samen.", "De peren en de pruimen tellen allebei mee."],
      weerEerste: ["Je telde weer maar 1 van de 2.", "Dat is weer maar 1 van de 2."],
      weerUitleg: ["De peren en de pruimen tel je samen.", "De peren en de pruimen horen bij elkaar."],
    });
  if (c === TWEE.n - 1)
    return metV({ code: "te-weinig-samen", soort: "te-weinig-samen", denkfout: "telde er 1 te weinig (sloeg er 1 over)", scherm: "knoppen even weg; peren en pruimen blijven helder; Bliepo's scherm 1,5 s rood", noot: "richting niet genoemd: dan bleef er maar 1 keuze over" }, 0, {
      eerste: [`Je koos ${gw(c)}. Je zit er dichtbij.`, `${gw(c)}? Dat is heel dichtbij.`, `Bijna! ${gw(c)} is het net niet.`],
      hint: ["Tel nog eens, eerst de peren en dan de pruimen. Zet stipjes op wat je geteld hebt.", "Tel ze nog eens rustig. Een stipje op elk stuk fruit helpt je."],
      uitleg: [`Je hebt er net ${gw(1)} overgeslagen. We tellen ze rustig, stuk voor stuk.`, `Er ligt er nog ${gw(1)} meer. We tellen ze rustig, stuk voor stuk.`],
      weerEerste: ["Je zit er weer dichtbij.", "Weer heel dichtbij."],
      weerUitleg: ["We tellen ze rustig, stuk voor stuk."],
    });
  return OND_FOUT("Tel de peren én de pruimen. Zet stipjes op wat je geteld hebt.", "De peren en pruimen tel je samen, stuk voor stuk.");
}
export const foutenTwee = (): Record<string, FoutV> => Object.fromEntries(TWEE.keuzes.filter((k) => k !== TWEE.n).map((k) => [String(k), tweeFout(String(k))]));

/** Stap 8: zelf maken. Draaiboek §3 C: te veel = "tik er een om hem uit te zetten". */
export function maakFout(c: number): FoutV {
  const f = MAAK.f;
  const schermMaak = "kop en fruit blijven staan; Bliepo's scherm 1,5 s rood; vinkje en handje even uit";
  if (c === 0)
    return metV({ code: "nog-niets-gemaakt", soort: "nog-niets-gemaakt", denkfout: "nog geen fruit gezet", scherm: "kop blijft staan; Bliepo's scherm 1,5 s rood; vinkje en handje even uit" }, 0, {
      eerste: ["Er ligt nog geen peer in de vakjes.", "Ik zie nog geen peer in de vakjes."],
      hint: ["Tik op een leeg vakje voor een peer.", "Tik op een leeg vakje. Dan komt er een peer."],
      uitleg: ["Elk vakje dat je aantikt, krijgt een peer.", "In elk vakje dat je aantikt, komt een peer."],
      weerEerste: ["Er ligt nog steeds geen peer in de vakjes.", "Ik zie nog steeds geen peer."],
      weerUitleg: ["Elk vakje dat je aantikt, krijgt een peer.", "In elk vakje dat je aantikt, komt een peer."],
    });
  if (c > MAAK.n)
    return metV({ code: "te-veel-gemaakt", soort: "te-veel-gemaakt", denkfout: "maakte er te veel", scherm: schermMaak }, 0, {
      eerste: [`Je maakte ${stuks(c, f)}. Dat zijn er te veel.`, `Ik tel ${stuks(c, f)}. Dat zijn er te veel.`, `Er liggen nu ${stuks(c, f)}. Zo veel hoeven er niet.`, ...(c >= MAAK.n + 2 ? [`Je maakte ${stuks(c, f)}. Dat zijn er een paar te veel.`] : [])],
      hint: ["Tik op een peer om hem weer weg te halen.", "Tik op een peer. Dan gaat hij weer weg."],
      uitleg: ["Een stuk fruit dat je weer aantikt, gaat weg. Het getal in de opdracht zegt hoeveel er komen.", "Het getal in de opdracht zegt hoeveel peren er komen. Een peer die je aantikt, gaat weer weg."],
      weerEerste: ["Je maakte er weer te veel.", "Het zijn er weer te veel."],
      weerUitleg: ["Een peer die je weer aantikt, gaat weg.", "Een peer gaat weg als je hem aantikt."],
    });
  return metV({ code: "te-weinig-gemaakt", soort: "te-weinig-gemaakt", denkfout: "maakte er te weinig", scherm: schermMaak }, 0, {
    eerste: [`Je maakte ${stuks(c, f)}. Dat zijn er nog niet genoeg.`, `Ik tel ${stuks(c, f)}. Dat zijn er nog niet genoeg.`, `Er liggen nu ${stuks(c, f)}. Er moeten er meer komen.`],
    hint: ["Tik op een leeg vakje. Dan komt er een peer bij.", "Tik nog op een leeg vakje voor een peer erbij."],
    uitleg: ["In de opdracht staat hoeveel er komen. Zoveel vakjes tik je aan.", "Het getal in de opdracht zegt hoeveel peren er komen."],
    weerEerste: ["Je maakte er weer te weinig.", "Het zijn er weer te weinig."],
    weerUitleg: ["Een leeg vakje dat je aantikt, krijgt een peer.", "In een leeg vakje dat je aantikt, komt een peer."],
  });
}
export const foutenMaak = (): Record<string, FoutV> => Object.fromEntries([0, 1, 2, 3, 5, 6, 7, 21].map((c) => [String(c), maakFout(c)]));

/** Na het lijstje voorlezen (hint 1e fout) zegt Bliepo wat het kind doet (F16, 15.37; 18 nov 2026: de hint was alleen het lijstje). */
const LIJST_HINT = ["Zet in elk vakje het goede fruit.", "Kies een fruit en tik op de vakjes."];

/**
 * Stap 9: het lijstje. Draaiboek §3 D: de tutor noemt welke soort klopt en welke nog niet; de 2e keer andere woorden; de
 * 3e keer het precieze aantal (bij ons is dat de 2e fout: 2 pogingen, 15.11). `tel` = hoeveel van elke soort er staan.
 */
export function lijstFout(tel: number[]): FoutV {
  const regels = LIJST.regels;
  const mis = regels.filter((r, i) => tel[i] !== r.n);
  const goed = regels.filter((r, i) => tel[i] === r.n);
  const naam = (f: Fruit) => `de ${f.naam}`;
  const groot = (z: string) => `${z[0].toUpperCase()}${z.slice(1)}`;
  let eerste: string[];
  if (goed.length === 0) eerste = ["Het fruit klopt nog niet met het lijstje. Kijk er nog eens naar.", "Het lijstje en de vakjes zijn nog niet gelijk. Kijk nog eens naar het lijstje."];
  else if (mis.length === 1) eerste = [`De ${goed.map((r) => r.f.naam).join(" en de ")} kloppen. Kijk nu naar ${naam(mis[0].f)}.`, `De ${goed.map((r) => r.f.naam).join(" en de ")} kloppen al. Nu nog ${naam(mis[0].f)}.`];
  else eerste = [`${groot(naam(goed[0].f))} kloppen. Kijk naar ${mis.map((r) => naam(r.f)).join(" en ")}.`, `${groot(naam(goed[0].f))} kloppen al. Nu nog ${mis.map((r) => naam(r.f)).join(" en ")}.`];
  const eerstMis = regels.findIndex((r, i) => tel[i] !== r.n);
  const m = regels[eerstMis];
  const ikTel = tel[eerstMis] > 0 ? `Ik tel ${stuks(tel[eerstMis], m.f)}.` : `Ik tel nog geen ${m.f.naam}.`;
  const uitleg = [`${ikTel} Op het lijstje staan er ${gk(m.n, m.f)}.`, `${ikTel} Het moeten er ${gk(m.n, m.f)} zijn.`];
  return metV({ code: "lijst-soort-mis", soort: "lijst-soort-mis", denkfout: "bij het lijstje klopt minstens 1 soort niet", scherm: "kop (het lijstje) en de vakjes blijven staan; vinkje even uit; Bliepo's scherm 1,5 s rood; na de zin komt het lijstje nog eens, dan is het vinkje weer aan (geen pijl)" }, 0, { eerste, hint: LIJST_HINT.map((o) => `${lijstZin()} ${o}`), uitleg, weerEerste: uitleg, weerUitleg: [] });
}

/** De goede stand van het lijstje: soort per vakje (alle vakjes vol). */
export const LIJST_OPLOSSING: ExtraCel[] = LIJST.regels.flatMap((r) => Array.from({ length: r.n }, () => r.f.soort));
