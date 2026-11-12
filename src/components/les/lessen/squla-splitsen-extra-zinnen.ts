/**
 * ALLE ZINNEN VAN BLIEPO in de EXTRA les Splitsen (squla-splits-splitsen1-1-gouden-extra, 12 november 2026), op één plek,
 * met de FOUTTABEL. De les zelf (squla-splitsen-extra-gouden.tsx) bevat geen eigen zinnen.
 *
 * Besluit Sara (12 november 2026, 21.7): de Synthesis-opdrachten uit het draaiboek Splitsen die niet in de Squla-les zitten,
 * als EXTRA les naast de gouden les. Het zijn de stappen van SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/splitsen.md met de
 * splitsmachine (totaal boven, 2 delen onder, een min en een plus bij elk deel), met dezelfde getallen (5, 7 en 8):
 *   stap 7  de machine stap voor stap, het totaal ("wat staat er nu in het totaal?");
 *   stap 9  "welke som heb je gemaakt?" (3 + 2 = 5) met de tussenvraag "en wat is 3 + 2?" na een fout, de som in het lijstje;
 *   stap 10 "kun je 5 ook anders splitsen?" (omgedraaid telt bij 5 goed);
 *   stap 11 een nieuw totaal: welk getal is het?
 *   stap 12 zoek 2 delen die samen 7 maken (vinkje; het hulphandje komt vanzelf);
 *   stap 14 nog een manier voor 7 (omgedraaid en "al gevonden" tellen niet als fout);
 *   stap 15 kiezen: nog een getal zoals dit (8) of een groter getal (10) en dat op 2 manieren splitsen;
 *   stap 16 einde.
 * De rijtjes (lof, speciale momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is) zijn die
 * van de gouden klokles (BLIEPO-KARAKTER.md). De FOUTTABEL is EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.9).
 *
 * Leesbare versie: FOUTTABEL-squla-splits-splitsen1-1-gouden-extra.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-splitsen-extra-gouden.ts`). {5} = een getal in zijn eigen kleur (de kleur van de stippen).
 */

import { OND_FOUT, type Fout, type Rijtje } from "./squla-extra-zuiver";

export { BEVESTIG, EINDE, LOF, MOMENT, NAAM_LOF, type Rijtje } from "./squla-extra-zuiver";
export { NAAM_GROET } from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/* ---------- de getallen van het draaiboek ---------- */

export const A = 3;
export const B_DEEL = 2;
export const TOTAAL5 = 5;
export const TOTAAL7 = 7;
export const KEUZE_GELIJK = 8;
export const KEUZE_GROTER = 10;

/** "{3} + {2} = {5}" met elk getal in zijn eigen kleur. */
export const som = (a: number, b: number, t: number) => `{${a}} + {${b}} = {${t}}`;
export const paar = (a: number, b: number) => `{${a}} en {${b}}`;

/* ---------- vaste zinnen van het verloop (eigen woorden) ---------- */

export const ZIN = {
  /** Stap 7: de machine (het draaiboek heeft geen startvraag bij deze stappen). */
  begin: ["In deze les werk je met een splitsmachine.", "Boven staat het totaal. Onder staan de 2 delen."],
  a1: `Tik op de plus bij het linkerdeel, tot er {4} stippen staan.`,
  a1Hand: "Tik op de plus.",
  a1Klaar: "Mooi, er staan {4} stippen.",
  a2: "Tik nu op de min bij dat deel.",
  a2Hand: "Tik op de min.",
  a2Klaar: [`Je maakte van {4} een {3}.`, "Kijk, bovenaan staat ook {3}. Daar staat het totaal."],
  a3: `Het rechterdeel is nog leeg. Zet er {2} stippen in met de plus.`,
  a3Hand: "Tik op de plus.",
  vraagTotaal: "Wat staat er nu in het totaal?",
  totaalGoed: `Het totaal is {5}. Het staat altijd in de cirkel bovenaan.`,
  totaalUitleg: "Het totaal is alles samen. Dat zijn de stippen in de cirkel bovenaan.",
  totaalTel: (n: number) => `Het zijn er ${`{${n}}`}. Dat is het totaal.`,
  /** Stap 9: de som. */
  vraagSom: ["Je hebt 2 delen en 1 totaal.", "Welke som heb je gemaakt?"],
  somGoed: `Je maakte ${som(A, B_DEEL, TOTAAL5)}.`,
  somUitleg: `De delen zijn {3} en {2}. Die schrijf je als {3} + {2}.`,
  somSamen: ["Kom, we rekenen het samen uit."],
  tussen: "Wat is {3} + {2}?",
  tussenGoed: `Ja, {3} + {2} = {5}. Dus de som is ${som(A, B_DEEL, TOTAAL5)}.`,
  tussenFout: (x: string) => (x === "32" ? `De cijfers naast elkaar worden {32}. Maar je telt ze op: {3} + {2} = {5}.` : `${`{${x}}`} is dichtbij. Met {3} en dan nog {2} kom je op {5}.`),
  /** Stap 10: een andere manier voor 5. */
  anders: [`${paar(A, B_DEEL)} is 1 manier om {5} te splitsen.`, "Kun jij het ook op een andere manier? Verander de stippen onder, zodat ze samen weer {5} zijn."],
  andersHand: "Tik op de plus of de min.",
  omgedraaid5: "Je draaide de delen om. Dat mag.",
  /** Stap 11: een nieuw totaal. */
  nieuwTotaal: ["Ik zet een nieuw totaal klaar.", "Welk getal is het?"],
  nieuwGoed: "Het totaal is {7}.",
  nieuwHint: "Tel de stippen in de cirkel bovenaan, een voor een.",
  nieuwUitleg: "De stippen in de cirkel bovenaan tel je een voor een.",
  nieuwTel: "Het zijn er {7}. Dat is het totaal.",
  /** Stap 12 en 14: zoek 2 delen. */
  zoekKop: { voor: "Zoek 2 delen die samen", n: 7, na: "maken." },
  zoekOpdracht: "Maak met de plus en de min 2 delen die samen {7} zijn. Tik dan op het vinkje.",
  zoekHand: "Tik op de plus of de min.",
  nogKop: { voor: "Zoek nog een manier om", n: 7, na: "te splitsen." },
  nogOpdracht: "Zoek nog een manier om {7} te splitsen. Tik op het vinkje als je klaar bent.",
  goedSplits: (a: number, b: number, t: number) => `Je splitste {${t}} in {${a}} en {${b}}.`,
  alGevonden: (a: number, b: number, t: number) => `Zo heb je {${t}} al gesplitst, in ${paar(a, b)}. Zoek een andere manier.`,
  omgedraaid: "Je draaide de delen om. Het zijn dezelfde getallen. Zoek een andere manier.",
  samenZet: (k: number, nr = 0) => [`Ik zet het linkerdeel op {${k}}. Zoek jij het andere deel.`, `Het linkerdeel zet ik op {${k}}. Jij zoekt het andere deel.`, `Kijk, links staat {${k}}. Zoek jij het andere deel?`][nr % 3],
  samenHand: "Tik op de plus.",
  samenKlaar: (k: number, t: number) => `Dat is het: {${t}} is {${k}} en {${t - k}}.`,
  samenZelf: (k: number, t: number) => `Kijk, ik zoek het andere deel. {${t}} is {${k}} en {${t - k}}.`,
  /** Stap 15: kiezen. */
  keuzeVraag: ["Nog 1 getal, dan zijn we klaar.", "Wil je nog een getal zoals dit splitsen, of een groter getal?"],
  keuzeGelijk: `Splits ${KEUZE_GELIJK}`,
  keuzeGroter: `Splits ${KEUZE_GROTER}`,
  keuzeReactie: (t: number) => `Goede keuze. Splits {${t}} in 2 delen.`,
  keuzeKop: (t: number) => ({ voor: "Splits", n: t, na: "in 2 delen." }),
  keuzeOpdracht: (t: number) => `Splits {${t}} in 2 delen. Tik op het vinkje als je klaar bent.`,
  keuzeNog: (a: number, b: number, t: number) => `Ja, ${som(a, b, t)}.`,
  keuzeNogOpdracht: (t: number) => `Splits {${t}} nog op een andere manier. Tik op het vinkje als je klaar bent.`,
  /** Stap 16: einde. */
  slot: "Je splitste getallen op veel manieren.",
  weerGekozen: (x: string) => `Je koos weer ${x}.`,
};

/** Hulphandje: de eerste keer met een aanmoediging (het kind moet tikken, niet nadenken; 14.35). */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit."];

/** Reactie bij goed (draaiboek §3 F.1: lof met de 2 delen erin). */
export const SPLITSREACTIE = (a: number, b: number, t: number) => rij([`Dat werkt: ${som(a, b, t)}.`, `Ja, ${paar(a, b)} maken samen {${t}}.`, `Je splitste {${t}} in ${paar(a, b)}.`, `Precies: {${t}} is ${paar(a, b)}.`, `Ik heb het nagekeken: ${som(a, b, t)}.`], [4]);
export const SPLITSREACTIE_ROBOT = 4;

/* ---------- denkfouten (draaiboek Splitsen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["deel-ipv-totaal", "andere-getallen-gekozen", "deel-en-totaal-opgeteld", "cijfers-naast-elkaar", "som-te-weinig", "totaal-een-te-veel", "totaal-een-te-weinig", "delen-samen-te-weinig", "delen-samen-te-veel", "een-deel-leeg", "onduidelijk"] as const;

const SCHERM = "vraag en knoppen even weg; Bliepo's scherm 1,5 s rood; met de hint komen de knoppen meteen terug (geen pijl)";

/** Stap 7: wat staat er in het totaal? Keuzes 3, 2 en 5. Draaiboek §3 B.2: een deel genoemd in plaats van het totaal. */
export function totaalFout(x: string): Fout {
  if (x === "3" || x === "2")
    return { code: "deel-ipv-totaal", soort: "deel-ipv-totaal", denkfout: "koos een deel in plaats van het totaal", eerste: `Je koos {${x}}. Dat is een van de delen.`, hint: "Het totaal is alles samen. Kijk naar de cirkel bovenaan.", uitleg: ZIN.totaalUitleg, weer: ["Je koos weer een van de delen.", ZIN.totaalUitleg], scherm: SCHERM };
  return OND_FOUT("Het totaal is alles samen. Kijk naar de cirkel bovenaan.", ZIN.totaalUitleg);
}
export const foutenTotaal = (): Record<string, Fout> => Object.fromEntries(["3", "2"].map((x) => [x, totaalFout(x)]));

/** Stap 9: welke som? Draaiboek §3 C: de tutor rekent de delen voor; hier met de denkfout erbij. */
export const SOMKEUZES = [som(A, B_DEEL, TOTAAL5).replace(/[{}]/g, ""), "4 + 2 = 6", "2 + 5 = 7"];
export function somFout(x: string): Fout {
  if (x === "4 + 2 = 6")
    return { code: "andere-getallen-gekozen", soort: "andere-getallen-gekozen", denkfout: "koos een som met getallen die niet in de machine staan", eerste: "Die som heeft een {4}. Zo'n deel staat niet in de machine.", hint: "Kijk naar de 2 delen onder in de machine.", uitleg: ZIN.somUitleg, weer: ["Je koos weer een som met getallen die er niet staan.", ZIN.somUitleg], scherm: SCHERM };
  if (x === "2 + 5 = 7")
    return { code: "deel-en-totaal-opgeteld", soort: "deel-en-totaal-opgeteld", denkfout: "gebruikte het totaal als een van de delen", eerste: "In die som staat het totaal als deel. Een som gebruikt de 2 delen.", hint: "Het totaal staat achter het =. Kijk naar de 2 delen onder.", uitleg: ZIN.somUitleg, weer: ["Het totaal zit weer in de som als deel.", ZIN.somUitleg], scherm: SCHERM };
  return OND_FOUT("Kijk naar de 2 delen onder in de machine.", ZIN.somUitleg);
}
export const foutenSom = (): Record<string, Fout> => Object.fromEntries(SOMKEUZES.filter((k) => k !== SOMKEUZES[0]).map((k) => [k, somFout(k)]));

/** De tussenvraag na een fout (draaiboek §3 C.2): 1 poging, daarna zegt Bliepo het (samen voordoen). Keuzes 5, 4 en 32. */
export const TUSSENKEUZES = ["5", "4", "32"];
export function tussenFout(x: string): Fout {
  if (x === "32") return { code: "cijfers-naast-elkaar", soort: "cijfers-naast-elkaar", denkfout: "zette de cijfers naast elkaar (3 en 2 werd 32)", eerste: ZIN.tussenFout(x), hint: "", uitleg: ZIN.tussenFout(x), weer: [], scherm: "knoppen weg; Bliepo legt uit en gaat door (samen voordoen)" };
  return { code: "som-te-weinig", soort: "som-te-weinig", denkfout: "rekende de som 1 te weinig uit", eerste: ZIN.tussenFout(x), hint: "", uitleg: ZIN.tussenFout(x), weer: [], scherm: "knoppen weg; Bliepo legt uit en gaat door (samen voordoen)" };
}

/** Stap 11: een nieuw totaal van 7 (keuzes 8, 7 en 6). Draaiboek §3 B.2: "dat is net iets te veel". */
export const NIEUWKEUZES = ["8", "7", "6"];
export function nieuwFout(x: string): Fout {
  const c = Number(x);
  const richting = c > TOTAAL7 ? "te veel" : "te weinig";
  return { code: c > TOTAAL7 ? "totaal-een-te-veel" : "totaal-een-te-weinig", soort: c > TOTAAL7 ? "totaal-een-te-veel" : "totaal-een-te-weinig", denkfout: c > TOTAAL7 ? "telde 1 stip te veel" : "telde 1 stip te weinig", eerste: `Je koos {${c}}. Dat is net iets ${richting}.`, hint: ZIN.nieuwHint, uitleg: ZIN.nieuwUitleg, weer: [`Je telde weer ${richting}.`, ZIN.nieuwUitleg], scherm: SCHERM };
}
export const foutenNieuw = (): Record<string, Fout> => Object.fromEntries(NIEUWKEUZES.filter((k) => k !== String(TOTAAL7)).map((k) => [k, nieuwFout(k)]));

/**
 * Stap 12, 14 en 15: een splitsopdracht met het vinkje. Draaiboek §3 F.2: de tutor rekent de gekozen delen voor ("je hebt
 * 3 en 3; samen is dat 6; we zoeken 7") en geeft het goede antwoord niet. Bij een leeg deel (§3 F.3): "vul eerst beide delen in".
 */
export function splitsFout(a: number, b: number, t: number, nr = 0): Fout {
  /* 3 versies die per opdracht wisselen (niet 2 keer dezelfde zin kort na elkaar; F8). */
  const v = nr % 3;
  if (a === 0 || b === 0) {
    const uitleg = [`Allebei de delen krijgen stippen. Samen zijn ze {${t}}.`, `Elk deel heeft minstens {1:wit} stip. Samen maken ze {${t}}.`, `De 2 delen hebben allebei stippen. Samen zijn het er {${t}}.`][v];
    return { code: "een-deel-leeg", soort: "een-deel-leeg", denkfout: "liet een deel leeg (of 0)", eerste: ["Een van je delen is leeg.", "Je liet een deel leeg.", "Een cirkel onder heeft nog geen stippen."][v], hint: [`Zet in allebei de delen stippen. Samen moeten het er {${t}} zijn.`, `Allebei de delen hebben stippen nodig. Samen is het {${t}}.`, `Maak allebei de delen vol. Samen moeten het {${t}} stippen zijn.`][v], uitleg, weer: [["Een deel is weer leeg.", "Je liet weer een deel leeg.", "Weer heeft een cirkel onder geen stippen."][v], uitleg], scherm: "kop en stippen blijven staan; vinkje even uit; Bliepo's scherm 1,5 s rood" };
  }
  const s = a + b;
  const richting = s < t ? "Dat is te weinig." : "Dat is te veel.";
  const soort = s < t ? "delen-samen-te-weinig" : "delen-samen-te-veel";
  const uitleg = [`Samen moeten de 2 delen {${t}} zijn.`, `De 2 delen moeten samen {${t}} maken.`, `Samen is het {${t}}: zoveel stippen horen er in de 2 delen.`][v];
  return { code: soort, soort, denkfout: s < t ? "de 2 delen samen zijn te weinig" : "de 2 delen samen zijn te veel", eerste: `Je hebt {${a}} en {${b}}. Samen is dat {${s}}. ${richting}`, hint: ["Verander een deel en tik weer op het vinkje.", "Maak een deel groter of kleiner en tik dan weer op het vinkje.", "Probeer een ander deel. Tik daarna weer op het vinkje."][v], uitleg, weer: [["Het klopt weer niet.", "Dit klopt ook niet.", "Weer past het niet."][v], uitleg], scherm: "kop en stippen blijven staan; vinkje even uit; Bliepo's scherm 1,5 s rood" };
}
