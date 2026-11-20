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
 * 18 november 2026 (Sara: Bliepo klinkt als een warme juf; zelfde aanpak als de proefles Tellen): elke zin is nagelopen
 * (kort, gewone woorden, lief, nooit "fout", een getal nooit 2 keer achter elkaar, opdrachtzinnen helder; 15.36) en elke
 * situatie die terugkomt heeft varianten. De les kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit dezelfde zin 2 keer
 * achter elkaar, ook niet over vragen heen. Getal, antwoord en betekenis zijn niet veranderd. Oud naast nieuw:
 * WIJZIGINGEN-ZINNEN-SPLITSEN.md. Een lijst (string[]) in ZIN = varianten: de les kiest er 1.
 *
 * Leesbare versie: FOUTTABEL-squla-splits-splitsen1-1-gouden-extra.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-splitsen-extra-gouden.ts`). {5:tegel} = een getal in de kleur van zijn stippen (de tegelkleur; keuring 20 nov: een kaal {5} werd wit in de indeling "synthesis"). Een getal dat nergens naar verwijst (een foute keuze) blijft {5} = wit (14.27).
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
export const som = (a: number, b: number, t: number) => `{${a}:tegel} + {${b}:tegel} = {${t}:tegel}`;
export const paar = (a: number, b: number) => `{${a}:tegel} en {${b}:tegel}`;
/** "{1} stip" of "{3} stippen" (enkelvoud bij 1). */
const stip = (n: number) => `{${n}:tegel} ${n === 1 ? "stip" : "stippen"}`;

/* ---------- vaste zinnen van het verloop (eigen woorden) ---------- */

export const ZIN = {
  /** Stap 7: de machine (het draaiboek heeft geen startvraag bij deze stappen). De eerste zin in 2 varianten. */
  begin: ["Vandaag werken we met een splitsmachine.", "We gaan samen werken met een splitsmachine."],
  /* 19 nov 2026 (keuring 15.36): "totaal" uitgelegd als "alles samen" (was: "Boven staat het totaal. Onder staan de 2 delen."). */
  beginKijk: "Bovenaan komt het totaal: alle stippen samen. Onderaan staan de 2 delen.",
  /* 19 nov 2026: "linkerdeel" is moeilijk voor groep 3 (was: "Tik op de plus bij het linkerdeel, tot er {4} stippen staan."). */
  a1: `Tik op de plus bij het deel links, tot er {4:tegel} stippen in staan.`,
  a1Klaar: "Mooi, er staan {4:tegel} stippen.",
  a2: "Tik nu {1:wit} keer op de min bij dat deel.",
  a2Hand: "Tik op de min.",
  /* Het getal 3 staat er 1 keer (was: "… een 3. Kijk, bovenaan staat ook 3."). */
  a2Klaar: [`Je hebt van {4:tegel} een {3:tegel} gemaakt.`, "Kijk, bovenaan staat hetzelfde getal. Daar staat het totaal."],
  /* 19 nov 2026: was "Het rechterdeel is nog leeg. Zet er {2} stippen in met de plus." */
  a3: `Het andere deel, rechts, is nog leeg. Zet er met de plus {2:tegel} stippen in.`,
  /** Het hulphandje bij een plus (stap 7 en het samen voordoen), in 3 varianten. */
  tikPlus: ["Tik op de plus.", "Tik maar op de plus.", "Zoek de plus en tik erop."],
  /** Het hulphandje bij een splitsopdracht, in 3 varianten. */
  plusMin: ["Tik op de plus of de min.", "Tik maar op de plus of de min.", "Probeer de plus of de min."],
  vraagTotaal: "Hoeveel stippen staan er nu in het totaal?",
  totaalGoed: `Het totaal is {5:tegel}. Het staat altijd in de cirkel bovenaan.`,
  totaalUitleg: "Het totaal is alles samen. Dat zijn de stippen in de cirkel bovenaan.",
  totaalTel: (n: number) => `Het zijn er ${`{${n}:tegel}`}. Dat is het totaal.`,
  /** Stap 9: de som. */
  /* 19 nov 2026: was "Je hebt 2 delen en 1 totaal." (te moeilijk voor groep 3). */
  vraagSom: ["De 2 delen samen maken het totaal.", "Welke som heb je gemaakt?"],
  somGoed: `Je hebt de som ${som(A, B_DEEL, TOTAAL5)} gemaakt.`,
  somUitleg: `De delen zijn {3:tegel} en {2:tegel}. Die schrijf je als {3:tegel} + {2:tegel}.`,
  somSamen: ["Kom, we rekenen het samen uit."],
  tussen: "Wat is {3:tegel} + {2:tegel}?",
  /* De som staat er 1 keer (was: "Ja, 3 + 2 = 5. Dus de som is 3 + 2 = 5."). */
  tussenGoed: `Ja, ${som(A, B_DEEL, TOTAAL5)}. Dat is de som die je hebt gemaakt.`,
  /* 19 nov 2026 (Sara: losse cijfers nooit als 1 groter getal lezen; KEUZES Ronde 52): 32 staat apart en wit (het verwijst
     nergens naar, 2.1); de 3 en de 2 houden de kleur van hun deel. Was: "Je zette de cijfers naast elkaar: {32}. …". */
  tussenFout: (x: string) => (x === "32" ? `Je plakte de cijfers aan elkaar. Dan lees je {32:wit}. Maar we tellen ze op: {3:tegel} + {2:tegel} = {5:tegel}.` : `Je koos ${`{${x}}`}. Dat scheelt maar weinig. {3:tegel} en dan nog {2:tegel} erbij is {5:tegel}.`),
  /** Stap 10: een andere manier voor 5. */
  /* 19 nov 2026 (keuring 15.36): "Verander de stippen onder." was geen goede zin; nu zegt Bliepo wat het kind doet en waar. */
  anders: [`{5:tegel} kun je splitsen in ${paar(A, B_DEEL)}.`, "Kun jij het ook op een andere manier? Tik op de plus en de min bij de 2 delen onderaan. Het totaal blijft hetzelfde."],
  omgedraaid5: "Je hebt de delen omgedraaid. Dat mag ook!",
  /** Stap 11: een nieuw totaal. */
  nieuwTotaal: ["Ik zet een nieuw totaal klaar.", "Welk getal is het?"],
  nieuwGoed: "Het totaal is {7:tegel}.",
  /* "een voor een" werd "stuk voor stuk" (cijferafspraak 3.20; "1 voor 1" zou het getal 2 keer zeggen). */
  nieuwHint: "Tel de stippen in de cirkel bovenaan, stuk voor stuk.",
  nieuwUitleg: "De stippen in de cirkel bovenaan tel je stuk voor stuk.",
  nieuwTel: "Het zijn er {7:tegel}. Dat is het totaal.",
  /** Stap 12 en 14: zoek 2 delen. */
  zoekKop: { voor: "Zoek 2 delen die samen", n: 7, na: "maken." },
  /* Zonder "Tik dan op het vinkje.": een zin met "vinkje" laat het lesscherm helemaal weg (15.37; het vinkje legt het lesscherm zelf uit). */
  zoekOpdracht: "Maak met de plus en de min 2 delen die samen {7:tegel} zijn.",
  nogKop: { voor: "Zoek nog een manier om", n: 7, na: "te splitsen." },
  nogOpdracht: "Zoek nog een manier om {7:tegel} te splitsen.",
  goedSplits: (a: number, b: number, t: number) => [`Je hebt {${t}:tegel} gesplitst in {${a}:tegel} en {${b}:tegel}.`, `{${a}:tegel} en {${b}:tegel} zijn samen {${t}:tegel}.`, `Dat klopt: {${t}:tegel} is {${a}:tegel} en {${b}:tegel}.`],
  alGevonden: (a: number, b: number, t: number) => [`Zo heb je {${t}:tegel} al gesplitst, in ${paar(a, b)}. Zoek een andere manier.`, `${paar(a, b)} hadden we al. Zoek een andere manier om {${t}:tegel} te splitsen.`],
  omgedraaid: ["Je hebt de delen omgedraaid. Het zijn dezelfde getallen. Zoek een andere manier.", "Dit zijn dezelfde getallen, alleen omgedraaid. Zoek een andere manier."],
  /* 19 nov 2026: zonder "linkerdeel" (was: "Ik zet het linkerdeel op 3. Zoek jij het andere deel." / "Het linkerdeel zet ik op 3. Jij zoekt het andere deel." / "Kijk, links staat 3. Zoek jij het andere deel?"). */
  samenZet: (k: number) => [`Ik zet ${stip(k)} in het deel links. Zoek jij het andere deel?`, `In het deel links zet ik ${stip(k)}. Maak jij het andere deel?`, `Kijk, links staan nu ${stip(k)}. Zoek jij het andere deel?`].map((z) => (k === 1 ? z.replace("links staan nu", "links staat nu") : z)),
  samenKlaar: (k: number, t: number) => [`Dat is het: {${t}:tegel} is {${k}:tegel} en {${t - k}:tegel}.`, `Gevonden: {${t}:tegel} is {${k}:tegel} en {${t - k}:tegel}.`, `Samen is het gelukt: {${t}:tegel} is {${k}:tegel} en {${t - k}:tegel}.`],
  samenZelf: (k: number, t: number) => [`Kijk, ik zoek het andere deel. {${t}:tegel} is {${k}:tegel} en {${t - k}:tegel}.`, `Kijk, ik maak het andere deel. {${t}:tegel} is {${k}:tegel} en {${t - k}:tegel}.`],
  /** Stap 15: kiezen. */
  keuzeVraag: ["Nog 1 getal, dan zijn we klaar.", "Wil je nog een getal zoals dit splitsen, of een groter getal?"],
  keuzeGelijk: `Splits ${KEUZE_GELIJK}`,
  keuzeGroter: `Splits ${KEUZE_GROTER}`,
  /* Alleen de reactie: de opdracht "Splits 8 in 2 delen." zegt Bliepo meteen daarna (was 2 keer achter elkaar te horen). */
  keuzeReactie: "Goede keuze!",
  keuzeKop: (t: number) => ({ voor: "Splits", n: t, na: "in 2 delen." }),
  keuzeOpdracht: (t: number) => `Splits {${t}:tegel} in 2 delen.`,
  keuzeNog: (a: number, b: number, t: number) => `Ja, ${som(a, b, t)}.`,
  keuzeNogOpdracht: (t: number) => `Splits {${t}:tegel} nog op een andere manier.`,
  /** Stap 16: einde. */
  slot: ["Je hebt getallen op veel manieren gesplitst!", "Wat heb jij veel manieren gevonden om te splitsen!", "Knap, hoor! Je kunt getallen op veel manieren splitsen."],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  weerGekozen: (x: string) => `Je koos weer ${x}.`,
};

/** Hulphandje: de eerste keer met een aanmoediging (het kind moet tikken, niet nadenken; 14.35). 5 varianten. */
export const AANMOEDIG_TIKKEN = ["Je bent goed bezig.", "Jij kunt dit.", "Het gaat goed zo.", "Probeer het maar.", "Toe maar, je doet het goed."];

/** Reactie bij goed (draaiboek §3 F.1: lof met de 2 delen erin). */
export const SPLITSREACTIE = (a: number, b: number, t: number) => rij([`Dat klopt: ${som(a, b, t)}.`, `Ja, ${paar(a, b)} maken samen {${t}:tegel}.`, `Je hebt {${t}:tegel} gesplitst in ${paar(a, b)}.`, `Precies: {${t}:tegel} is ${paar(a, b)}.`, `Inderdaad, zo kun je {${t}:tegel} splitsen.`], [4]);
export const SPLITSREACTIE_ROBOT = 4;

/* ---------- denkfouten (draaiboek Splitsen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["deel-ipv-totaal", "andere-getallen-gekozen", "deel-en-totaal-opgeteld", "cijfers-naast-elkaar", "som-te-weinig", "totaal-een-te-veel", "totaal-een-te-weinig", "delen-samen-te-weinig", "delen-samen-te-veel", "een-deel-leeg", "onduidelijk"] as const;

/** Alle varianten bij 1 fout antwoord; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde). */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };
export type FoutV = Fout & { v?: Varianten };
/** 1 vaste variant per nummer (voor de fouttabel) en alle varianten (voor de les). */
const metV = (basis: Omit<Fout, "eerste" | "hint" | "uitleg" | "weer">, nr: number, v: Varianten): FoutV => {
  const vast = (l: string[]) => l[nr % l.length];
  return { ...basis, eerste: vast(v.eerste), hint: vast(v.hint), uitleg: vast(v.uitleg), weer: v.weerEerste.length ? [vast(v.weerEerste), vast(v.weerUitleg)] : [], v };
};

const SCHERM = "vraag en knoppen even weg; Bliepo's scherm 1,5 s rood; met de hint komen de knoppen meteen terug (geen pijl)";

const UITLEG_TOTAAL = [ZIN.totaalUitleg, "In de cirkel bovenaan staan alle stippen samen. Dat is het totaal."];
const UITLEG_SOM = [ZIN.somUitleg, "Onderaan staan {3:tegel} en {2:tegel}. Die tel je op in de som."];
const UITLEG_NIEUW = [ZIN.nieuwUitleg, "Elke stip in de cirkel bovenaan telt {1:wit} keer mee."];

/** Stap 7: wat staat er in het totaal? Keuzes 3, 2 en 5. Draaiboek §3 B.2: een deel genoemd in plaats van het totaal. */
export function totaalFout(x: string): FoutV {
  if (x === "3" || x === "2")
    return metV({ code: "deel-ipv-totaal", soort: "deel-ipv-totaal", denkfout: "koos een deel in plaats van het totaal", scherm: SCHERM }, Number(x), {
      eerste: [`Je koos {${x}:tegel}. Dat is {1:wit} van de delen.`, `{${x}:tegel}? Dat is een deel, niet het totaal.`, `Met {${x}:tegel} heb je maar {1:wit} deel. Het totaal is alles samen.`, `Je tikte op {${x}:tegel}. Zoveel stippen heeft {1:wit} deel.`],
      /* Na de hint staat alleen de hint in beeld: daarom eindigt hij met de vraag, anders verwoord (15.37; draaiboek §3 B.2). */
      hint: ["Het totaal is alles samen. Hoeveel stippen staan er in de cirkel bovenaan?", "Het totaal staat bovenaan. Hoeveel stippen tel je in de cirkel daar?"],
      uitleg: UITLEG_TOTAAL,
      weerEerste: ["Je koos weer {1:wit} van de delen.", "Dat is weer een deel.", "Weer een deel, zie ik."],
      weerUitleg: UITLEG_TOTAAL,
    });
  return OND_FOUT("Het totaal is alles samen. Kijk naar de cirkel bovenaan.", ZIN.totaalUitleg);
}
export const foutenTotaal = (): Record<string, FoutV> => Object.fromEntries(["3", "2"].map((x) => [x, totaalFout(x)]));

/** Stap 9: welke som? Draaiboek §3 C: de tutor rekent de delen voor; hier met de denkfout erbij. */
export const SOMKEUZES = [som(A, B_DEEL, TOTAAL5).replace(/[{}]/g, ""), "4 + 2 = 6", "2 + 5 = 7"];
export function somFout(x: string): FoutV {
  if (x === "4 + 2 = 6")
    return metV({ code: "andere-getallen-gekozen", soort: "andere-getallen-gekozen", denkfout: "koos een som met getallen die niet in de machine staan", scherm: SCHERM }, 0, {
      eerste: ["In die som staat een {4}. Dat deel staat niet in de machine.", "Die som begint met {4}. Zo'n deel staat niet in de machine.", "Je koos de som met {4}. Dat getal staat niet in de machine."],
      hint: ["Kijk naar de 2 delen onderaan. Welke som past daarbij?", "Welke 2 delen staan er onderaan? Kies de som met die delen."],
      uitleg: UITLEG_SOM,
      weerEerste: ["Je koos weer een som met getallen die er niet staan.", "Weer een som met een getal dat er niet staat.", "Die getallen staan weer niet in de machine."],
      weerUitleg: UITLEG_SOM,
    });
  if (x === "2 + 5 = 7")
    return metV({ code: "deel-en-totaal-opgeteld", soort: "deel-en-totaal-opgeteld", denkfout: "gebruikte het totaal als een van de delen", scherm: SCHERM }, 0, {
      eerste: ["In die som staat het totaal als deel. Een som gebruikt de 2 delen.", "In die som telt het totaal mee als deel. We tellen alleen de 2 delen op.", "Die som telt het totaal erbij op. In een som tel je de 2 delen op."],
      hint: ["Het totaal staat achter het =. Welke som begint met de 2 delen?", "Het totaal komt aan het eind van de som. Welke som heeft de 2 delen vooraan?"],
      uitleg: UITLEG_SOM,
      weerEerste: ["Het totaal zit weer in de som als deel.", "Weer telt het totaal mee als deel.", "Je koos weer de som met het totaal erin."],
      weerUitleg: UITLEG_SOM,
    });
  return OND_FOUT("Kijk naar de 2 delen onderaan.", ZIN.somUitleg);
}
export const foutenSom = (): Record<string, FoutV> => Object.fromEntries(SOMKEUZES.filter((k) => k !== SOMKEUZES[0]).map((k) => [k, somFout(k)]));

/** De tussenvraag na een fout (draaiboek §3 C.2): 1 poging, daarna zegt Bliepo het (samen voordoen). Keuzes 5, 4 en 32. */
export const TUSSENKEUZES = ["5", "4", "32"];
export function tussenFout(x: string): Fout {
  if (x === "32") return { code: "cijfers-naast-elkaar", soort: "cijfers-naast-elkaar", denkfout: "zette de cijfers naast elkaar (3 en 2 werd 32)", eerste: ZIN.tussenFout(x), hint: "", uitleg: ZIN.tussenFout(x), weer: [], scherm: "knoppen weg; Bliepo legt uit en gaat door (samen voordoen)" };
  return { code: "som-te-weinig", soort: "som-te-weinig", denkfout: "rekende de som 1 te weinig uit", eerste: ZIN.tussenFout(x), hint: "", uitleg: ZIN.tussenFout(x), weer: [], scherm: "knoppen weg; Bliepo legt uit en gaat door (samen voordoen)" };
}

/** Stap 11: een nieuw totaal van 7 (keuzes 8, 7 en 6). Draaiboek §3 B.2: "dat is net iets te veel". */
export const NIEUWKEUZES = ["8", "7", "6"];
export function nieuwFout(x: string): FoutV {
  const c = Number(x);
  const richting = c > TOTAAL7 ? "te veel" : "te weinig";
  const code = c > TOTAAL7 ? "totaal-een-te-veel" : "totaal-een-te-weinig";
  return metV({ code, soort: code, denkfout: c > TOTAAL7 ? "telde 1 stip te veel" : "telde 1 stip te weinig", scherm: SCHERM }, 0, {
    eerste: [`Je koos {${c}}. Dat is net iets ${richting}.`, `{${c}} stippen is net iets ${richting}.`, `Bijna! {${c}} is iets ${richting}.`],
    hint: [ZIN.nieuwHint, "Tel de stippen bovenaan nog eens rustig. Wijs elke stip aan."],
    uitleg: UITLEG_NIEUW,
    weerEerste: [`Je telde weer ${richting}.`, `Het zijn er weer iets ${richting}.`, `Weer iets ${richting}, zie ik.`],
    weerUitleg: UITLEG_NIEUW,
  });
}
export const foutenNieuw = (): Record<string, FoutV> => Object.fromEntries(NIEUWKEUZES.filter((k) => k !== String(TOTAAL7)).map((k) => [k, nieuwFout(k)]));

/**
 * Stap 12, 14 en 15: een splitsopdracht met het vinkje. Draaiboek §3 F.2: de tutor rekent de gekozen delen voor ("je hebt
 * 3 en 3; samen is dat 6; we zoeken 7") en geeft het goede antwoord niet. Bij een leeg deel (§3 F.3): "vul eerst beide delen in".
 * De hint mag zeggen of er stippen bij of af moeten: er zijn dan nog veel goede antwoorden (15.17).
 */
export function splitsFout(a: number, b: number, t: number, nr = 0): FoutV {
  const scherm = "kop en stippen blijven staan; vinkje even uit; Bliepo's scherm 1,5 s rood";
  if (a === 0 || b === 0) {
    const uitleg = [`Allebei de delen krijgen stippen. Samen zijn ze {${t}:tegel}.`, `Elk deel heeft minstens {1:wit} stip. Samen maken ze {${t}:tegel}.`, `De 2 delen hebben allebei stippen. Samen zijn het er {${t}:tegel}.`];
    return metV({ code: "een-deel-leeg", soort: "een-deel-leeg", denkfout: "liet een deel leeg (of 0)", scherm }, nr, {
      eerste: ["{1:wit} van je delen is nog leeg.", "Je liet een deel leeg.", "Een cirkel onderaan heeft nog geen stippen."],
      hint: [`Zet in allebei de delen stippen. Samen moeten het er {${t}:tegel} zijn.`, `Allebei de delen hebben stippen nodig. Samen is het {${t}:tegel}.`, `Geef elk deel stippen. Samen moeten het {${t}:tegel} stippen zijn.`],
      uitleg,
      weerEerste: ["Een deel is weer leeg.", "Je liet weer een deel leeg.", "Er is weer een cirkel zonder stippen."],
      weerUitleg: uitleg,
    });
  }
  const s = a + b;
  const weinig = s < t;
  const richting = weinig ? "te weinig" : "te veel";
  const soort = weinig ? "delen-samen-te-weinig" : "delen-samen-te-veel";
  const uitleg = [`Samen moeten de 2 delen {${t}:tegel} zijn.`, `De 2 delen moeten samen {${t}:tegel} maken.`, `Samen is het {${t}:tegel}: zoveel stippen horen er in de 2 delen.`];
  return metV({ code: soort, soort, denkfout: weinig ? "de 2 delen samen zijn te weinig" : "de 2 delen samen zijn te veel", scherm }, nr, {
    eerste: [`Je hebt {${a}:tegel} en {${b}:tegel}. Samen is dat {${s}:tegel}. Dat is ${richting}.`, `{${a}:tegel} en {${b}:tegel} is samen {${s}:tegel}. Dat is ${richting}.`, `Je maakte {${a}:tegel} en {${b}:tegel}. Samen is dat {${s}:tegel}. Dat is ${richting}.`],
    hint: [`Verander een deel. Samen moet het {${t}:tegel} zijn.`, "Maak een deel groter of kleiner.", "Geef een deel meer of minder stippen.", weinig ? "Er moeten nog stippen bij. Tik op een plus." : "Er moeten stippen af. Tik op een min.", `We zoeken {${t}:tegel}. Tik op een plus of een min.`],
    uitleg,
    weerEerste: [`Samen is het weer ${richting}.`, `Het zijn er weer ${richting}.`, `Weer ${richting}, zie ik.`],
    weerUitleg: uitleg,
  });
}
