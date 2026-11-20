/**
 * ALLE ZINNEN VAN BLIEPO in de gouden klokles (squla-klok-hoelaat-1-gouden), op één plek, zodat ze makkelijk te
 * vervangen zijn (opdracht Sara, 8 november 2026). De les zelf (squla-klok-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, speciale momenten, naam, goed na een fout, snel, begin en einde, eerste zin als de denkfout niet
 *     duidelijk is, aanmoedigen, overgang, reactie bij de klok) komen letterlijk uit BLIEPO-KARAKTER.md (§3, §4, §5,
 *     §10, §11, §12). Robotzinnen zijn gemarkeerd; de les gebruikt ze spaarzaam (nooit 2 robotzinnen kort na elkaar).
 *   - De FOUTTABEL (BOUWREGELS 15.9): per vraag, per fout antwoord, de denkfout (een naam uit de vaste lijst in
 *     FOUTTABEL-squla-klok-gouden.md §1, die in de voortgang komt), Bliepo's eerste zin, de hint en wat er op het scherm
 *     gebeurt. Denkfout niet duidelijk: eerste zin uit BLIEPO-KARAKTER.md §10 en een algemene hint; geen reden verzonnen.
 *   - Per soort denkfout een uitleg voor de 2e fout (zonder het antwoord) en een ANDERE uitleg als het kind dezelfde
 *     denkfout nog eens maakt.
 *
 * 18 november 2026 (Sara: Bliepo klinkt als een warme juf; zelfde aanpak als de proefles Tellen): elke zin van de klokles
 * is nagelopen. Wat terugkomt, staat in varianten (VAR, de fouttabel, UITLEG, VOORDOEN); de les kiest met de gedeelde kiezer
 * (nooit-dubbel.ts): nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen. Een getal klinkt niet 2 keer vlak
 * achter elkaar. Oud naast nieuw: WIJZIGINGEN-ZINNEN-KLOK.md. De GEDEELDE rijtjes hieronder (lof, einde, groet, ...) zijn
 * van alle gouden lessen samen; wat daarin veranderde staat in WIJZIGINGEN-ZINNEN-RIJTJES.md.
 *
 * Leesbare versie: FOUTTABEL-squla-klok-gouden.md (die volgt dit bestand). {naam} = de naam van het kind (alleen op het
 * scherm en met de browserstem; zonder naam valt hij weg). {3:oranje} = kleur van de kleine wijzer, {12:paars} = kleur
 * van de grote wijzer.
 */

import { deeltStuk, maakKiezer, maakVorm, type Kiezer } from "./nooit-dubbel";

/* ---------- een rijtje: zinnen, waarvan sommige robotzinnen ---------- */

export type Rijtje = { zinnen: string[]; robot: number[] };
const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/**
 * §3.1 Gewone lofzinnen. Zin 4 ("Dat heb je goed gezien, zeg!") alleen bij een kijkvraag. Robot: 31 t/m 40.
 * Ronde 51 punt 13 (19 november 2026): 9 zinnen warmer gemaakt op dezelfde plek (RIJTJES-RESULTAAT-WARMER.md).
 */
export const LOF = rij(
  ["Ja, dat is goed!", "Helemaal goed, knap van jou!", "Super gedaan!", "Dat heb je goed gezien, zeg!", "Knap gedaan!", "Ja, zo is het!", "Heel goed, ik ben blij!", "Wauw, goed zeg!", "Dat zit goed!", "Jij weet het!", "Precies goed!", "Goed zo, dat kun jij!", "Ja, die klopt!", "Mooi zo!", "Ja, die is het!", "Prima gedaan!", "Netjes gedaan, hoor!", "Klopt helemaal!", "Ja hoor, goed!", "Wat goed van jou!", "Top, daar word ik blij van!", "Heel knap!", "Zo doe je dat!", "Lekker bezig!", "Dat ging goed!", "Goed gekozen!", "Ja, dat is het goede antwoord!", "Helemaal raak!", "Dat weet jij al!", "Fijn, die is goed!", "Kijk, mijn scherm wordt er groen van!", "Mijn scherm is helemaal groen. Dat komt door jou!", "Inderdaad, zo moet het!", "Zie je, jij snapt het!", "Groen scherm! Die is goed.", "Dat stop ik in mijn geheugen: jij kunt dit!", "Mijn scherm straalt groen voor jou!", "Even kijken… ja, goed!", "Die bewaar ik in mijn geheugen. Fijn!", "Mijn scherm kleurt groen. Knap!"],
  [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
);
export const LOF_KIJK_INDEX = 3;
/**
 * Ronde 51 punt 1 (19 november 2026, advies ja): "Goed gekozen!" (LOF) en "Gevonden!" (BEVESTIG) alleen als het kind
 * net op een keuzeknop tikte (l.kies), niet na tikken in het vlak, slepen of de wijzer zetten. Net als "Dat heb je goed
 * gezien." alleen bij een kijkvraag. De zinnen blijven op hun plek in het rijtje (zelfde index); ze worden alleen
 * overgeslagen. Gebruik: `kies(l, LOF, [..., ...alleenBijKeuze(l, LOF)])` en `kies(l, BEVESTIG, alleenBijKeuze(l, BEVESTIG))`.
 */
export const LOF_KIES_INDEX = 25;
export const BEVESTIG_KIES_INDEX = 5;
const laatsteWasKeuze = new WeakMap<object, boolean>();
const gevolgd = new WeakSet<object>();
/**
 * Onthoudt per les (per gids) of het laatste antwoord van een keuzeknop kwam. Wikkelt de wacht-functies van de gids 1 keer
 * in; verder verandert er niets aan hoe ze werken. Voor de eerste meting geldt "geen keuze" (de zin wordt dan overgeslagen).
 */
export function volgKeuzes(l: object): void {
  if (gevolgd.has(l)) return;
  gevolgd.add(l);
  const g = l as Record<string, unknown>;
  for (const naam of ["kies", "wachtOpVlak", "getal", "pak", "somVak", "knoppen", "verder"]) {
    const f = g[naam];
    if (typeof f !== "function") continue;
    g[naam] = (...a: unknown[]) => {
      const p = (f as (...x: unknown[]) => unknown).apply(l, a);
      Promise.resolve(p).then(() => laatsteWasKeuze.set(l, naam === "kies"), () => {});
      return p;
    };
  }
}
/** De plekken die bij dit rijtje overgeslagen worden als het laatste antwoord geen keuzeknop was. `keuze` = de les weet het zelf. */
export function alleenBijKeuze(l: object, r: Rijtje, keuze?: boolean): number[] {
  volgKeuzes(l);
  if (keuze ?? laatsteWasKeuze.get(l) ?? false) return [];
  if (r === LOF) return [LOF_KIES_INDEX];
  if (r === BEVESTIG) return [BEVESTIG_KIES_INDEX];
  return [];
}

/** §3.2 Lof voor speciale momenten (per les hooguit 1 keer per soort). */
export const MOMENT = {
  drieOpRij: rij(["Al {3:wit} goed achter elkaar!", "{3:wit} keer op rij goed. Wauw!", "Het gaat lekker: al {3:wit} goed!", "{3:wit} keer goed! Dat zet ik in mijn geheugen."], [3]),
  moeilijk: rij(["Dit was een moeilijke, en jij weet het!", "Wauw, ook de lastige is goed!", "Die was echt lastig. Knap van jou!", "Moeilijke vraag, groen scherm. Super!"], [3]),
  eerste: rij(["Goed begin!", "De eerste is al goed!", "Zo, wat een goede start!", "Zie je, jij begint meteen goed!"], [3]),
  laatste: rij(["En de laatste is ook goed!", "Goed tot het eind!", "Ook de laatste klopt. Knap!", "De laatste vraag, en een groen scherm!"], [3]),
};

/** §3.3 Lof met de naam (nooit bij een fout of na een fout; minstens 3 vragen ertussen; hooguit 2 keer per les). */
export const NAAM_LOF = rij(["Goed zo, {naam}!", "Knap gedaan, {naam}!", "{naam}, dat is helemaal goed!", "Ja, {naam}, zo is het!", "Wat goed, {naam}!", "Jij weet het, {naam}!", "{naam}, mijn scherm wordt groen van jou!", "{naam}, dat zet ik in mijn geheugen!"], [6, 7]);
export const NAAM_GROET = "Hoi {naam}! Fijn dat je er bent.";

/** §3.4 Goed na een fout: alleen een korte bevestiging. Ronde 51 punt 13: plek 2, 3, 4 en 7 warmer (RIJTJES-RESULTAAT-WARMER.md). */
export const BEVESTIG = rij(["Ja, nu is het goed.", "Nu heb je hem!", "Die is goed. Fijn!", "Zo is het. Goed doorgezet!", "Ja, nu klopt het.", "Gevonden!", "Nu zit het goed. Mooi!", "Ja, deze is het.", "Nu wordt mijn scherm groen.", "Inderdaad, nu is hij raak."], [8, 9]);

/** §3.5 Heel snel geantwoord. */
export const SNEL = rij(["Dat ging snel!", "Wat was jij snel!", "Snel en goed!"]);

/** §4 Reactie op wat het kind koos, bij de klok (zin 4, half, past niet bij hele uren). */
export const KLOKREACTIE = (uur: number) => rij([`Ja, de kleine wijzer staat op de {${uur}:oranje}.`, "Ja, de grote wijzer staat bovenaan, dus het is een heel uur.", `Ja, het is precies {${uur}:oranje} uur.`, `Inderdaad, de klok zegt {${uur}:oranje} uur.`, `Precies, het is {${uur}:oranje} uur.`, `Dat klopt, de kleine wijzer wijst naar de {${uur}:oranje}.`], [3]);

/**
 * §5 Einde. Zin 6 alleen na veel fouten (4 of meer vragen met een fout).
 * Ronde 51 punt 10 (besluit Sara 19 november 2026, weg b; BOUWREGELS 15.50): de eindzin komt voor "Tik op de kaart.", en
 * terwijl de les op de tik wacht is die opdracht het laatste wat in beeld staat (15.37). Daarom staat er in EINDE geen
 * afscheid ("Tot snel!", "Tot de volgende keer!"): dat zegt Bliepo pas NA de tik op de kaart (`afscheidNa`). Elke zin
 * staat op zijn oude plek (robotplekken 7 en 8 gelijk); EINDE_AFSCHEID[i] hoort bij EINDE.zinnen[i] (null = geen afscheid).
 * Ronde 51 punt 13 (19 november 2026): plek 1, 7 en 8 zijn warmer (RIJTJES-RESULTAAT-WARMER.md).
 */
export const EINDE = rij(["Goed gedaan!", "De les is klaar. Wat heb jij goed gewerkt!", "Klaar! Je hebt veel geoefend vandaag.", "Dat was de laatste. Fijn dat je meedeed!", "Je bent klaar. Ik vond het leuk met jou!", "Klaar! Wat heb je goed je best gedaan!", "Dat was de les. Ik vond het fijn.", "Alles is af. Wat ben jij goed bezig geweest!", "Deze les bewaar ik in mijn geheugen."], [7, 8]);
export const EINDE_AFSCHEID: (string | null)[] = ["Ik zie je graag de volgende keer.", null, null, null, null, null, "Tot snel!", null, "Tot de volgende keer!"];
export const EINDE_VEEL_FOUTEN = "Je hebt goed doorgezet. Volgende keer gaat het nog beter.";
/** Het afscheid dat bij deze eindzin hoort, of null. Bliepo zegt het pas na de tik op de kaart (Ronde 51 punt 10). */
export function afscheidNa(eind: string): string | null {
  const i = EINDE.zinnen.indexOf(eind);
  return i >= 0 ? (EINDE_AFSCHEID[i] ?? null) : null;
}

/** §10 Eerste zin als de denkfout niet duidelijk is (binnen 1 vraag nooit 2 keer dezelfde). */
export const ONDUIDELIJK = rij(["Die is lastig, hè.", "We zoeken het samen.", "Ik help je een stukje.", "Goed dat je het probeert.", "Kom, we kijken samen.", "Ik geef je een tip.", "Ik bedoelde een andere.", "Dat geeft niks, zo leer je het.", "Rustig maar, we doen het stap voor stap.", "Probeer het nog {1:wit} keer, met een tip.", "Even in mijn geheugen kijken… ik heb een tip!", "Mijn geheugen zegt: samen lukt dit vast.", "Ik weet een hulpje voor jou."], [10, 11, 12]);

/** Plaats in ONDUIDELIJK van twee zinnen die niet overal passen: "Ik bedoelde een andere." (alleen bij een keuzevraag) en "Probeer het nog {1:wit} keer, met een tip." (alleen na de 1e fout: na de 2e is er geen poging meer). */
export const ONDUIDELIJK_ANDERE = 6;
export const ONDUIDELIJK_NOG_1_KEER = 9;
/** Plaats in AANMOEDIG van "Als je kiest, zie ik meteen of het klopt.": alleen bij een keuzevraag, niet bij tikken of zetten. */
export const AANMOEDIG_KIEST = 9;
/** Plaats in AANMOEDIG van "Denk maar even na.": niet bij een tik- of zetopdracht (BLIEPO-KARAKTER.md §2; Ronde 51 punt 11). */
export const AANMOEDIG_DENK = 2;

/** §11 Aanmoedigen bij een opdracht waar het kind na het hulphandje nog steeds niets doet (± 15 s; 1 keer per opdracht). */
export const AANMOEDIG = rij(["Neem rustig de tijd.", "Je mag goed kijken.", "Denk maar even na.", "Je bent goed bezig.", "Geen haast, hoor.", "Rustig kijken mag.", "Ik wacht wel even.", "Jij kunt dit.", "Ik sta klaar voor jouw antwoord.", "Als je kiest, zie ik meteen of het klopt."], [8, 9]);

/** §12 Overgang tussen vragen (af en toe, niet na elke vraag). */
export const OVERGANG = rij(["Daar komt de volgende.", "Op naar de volgende!", "Hier is er weer een.", "Nu de volgende.", "Kijk, een nieuwe.", "We gaan door.", "Daar gaan we weer.", "En nu deze.", "Dan de volgende vraag.", "Let goed op bij deze.", "Hop, verder!", "Nieuwe vraag!", "Kijk mee naar de volgende.", "Deze is voor jou.", "Verder maar weer.", "Die zit erop. Daar komt er nog een.", "Opgeslagen in mijn geheugen. Verder!", "Die is af. Ik heb er nog een.", "Mijn geheugen heeft nog een vraag voor jou.", "Dat was hem. Door naar de volgende!"], [15, 16, 17, 18, 19]);

/**
 * De zinnen die tot 19 november 2026 "nagekeken" of "nakijken" zeiden (Sara: dat woord is weg uit de gouden lessen). Ze
 * zeggen nu op een andere manier dat iets klopt: "Zie je, …", "Inderdaad, …", plus de vaste zinnen hieronder. Elke
 * gouden les laat deze zinnen, net als vroeger de nakijkzinnen, hooguit 2 keer per les komen (NAKIJK in de les).
 * Geen bestaande zin begint zo; een nieuwe zin die zo begint, telt dus mee.
 */
export const WAS_NAKIJKEN = /^(Zie je|Inderdaad), |^Even kijken… ja|^Alles is af\. |^Ik weet een hulpje|^Die zit erop\. |^Die is af\. |^Dat was hem\. /;

/**
 * {naam} invullen; zonder naam valt hij netjes weg (BOUWREGELS 3.17), met de komma's goed:
 * "Goed zo, {naam}!" → "Goed zo!", "Ja, {naam}, zo is het!" → "Ja, zo is het!", "{naam}, dat is …" → "Dat is …",
 * "Hoi {naam}! …" → "Hoi! …" (zelfde uitkomst als zonderNaam in lib/stem-server.ts).
 * 19 november 2026 (B9, rijtjes nalopen): tot dan bleef bij "Goed zo, {naam}!" de komma staan ("Goed zo,!") en werd
 * "Ja {naam}, zo is het!" zonder komma "Ja zo is het!" (WIJZIGINGEN-ZINNEN-RIJTJES.md).
 */
export function metNaam(zin: string, naam: string | undefined): string {
  const n = (naam ?? "").trim();
  if (n) return zin.replace(/\{naam\}/g, n);
  return zin
    .replace(/,\s*\{naam\}(?=[!.?:,])/g, "")
    .replace(/(\p{L})\s+\{naam\},/gu, "$1,")
    .replace(/\{naam\},\s*/g, "")
    .replace(/\s+\{naam\}!/g, "!")
    .replace(/\s*\{naam\}/g, "")
    .replace(/^\s*(\p{Ll})/u, (m) => m.toUpperCase());
}

/* ---------- vaste zinnen van het verloop (draaiboek klokkijken §1.1; eigen beginzin per les, BOUWREGELS 4.3) ---------- */

/**
 * Zinnen die 1 keer per les komen en altijd hetzelfde zijn. Wat terugkomt of bij elke keer spelen anders mag zijn,
 * staat in VAR (varianten; 18 november 2026).
 */
export const ZIN = {
  pijlUitleg: "Klaar met kijken? Tik dan op de blauwe pijl.",
  lijnKijk: "Kijk eens wat de klok nu doet.",
  tikGetal: "Tik op een getal op de lijn.",
  tikGetalHand: "Kies maar een getal op de lijn en tik erop.",
  metDeKlokMee: "Zo draaien de wijzers rond. Dat heet: met de klok mee.",
  tweeWijzers: "Kijk, er staan nu 2 wijzers op de klok.",
  urenUitleg: ["Met de kleine wijzer lees je het uur.", "Kijk maar hoe hij werkt."],
  urenKlaar: "Je kunt het uur lezen met de kleine wijzer.",
  groteWijzerKijk: "Nu gaan we kijken wat de grote wijzer doet.",
  na2: "Kijk: de grote wijzer draaide een rondje. Hij wijst recht omhoog, naar de {12:paars}.",
  na3: "Weer een rondje. De grote wijzer staat weer op de {12:paars}.",
  heelUur: ["Bij elk heel uur wijst de grote wijzer naar de {12:paars}.", "Dan begint er een nieuw uur.", "Zo'n tijd heet een heel uur."],
  /* De opdracht zelf blijft overal hetzelfde (BOUWREGELS 3.11: dezelfde soort opdracht, dezelfde woorden). */
  zetOpdracht: (n: number) => `Zet de kleine wijzer op de {${n}:oranje}.`,
  zetKop: (n: number) => `Kleine wijzer op de ${n}`,
};

/**
 * VARIANTEN (Sara, 18 november 2026: Bliepo klinkt als een warme juf; zelfde aanpak als de proefles Tellen). Elk rijtje
 * is 1 situatie; de les kiest er 1 uit met de gedeelde kiezer (nooit-dubbel.ts): nooit 2 keer achter elkaar dezelfde
 * zin, ook niet over vragen heen. Een rijtje van rijtjes (string[][]) = stukken van meer zinnen die bij elkaar horen.
 * Het script scripts/fouttabel-klok-gouden.ts loopt ELKE variant na. Oud naast nieuw: WIJZIGINGEN-ZINNEN-KLOK.md.
 */
export const VAR = {
  /** Het begin: wat we gaan doen, en de vraag of het kind het al kan (Ja = proef van 2 klokken, Nee = samen leren). */
  start: [
    "Vandaag lezen we op de klok hoe laat het is. We kijken naar de wijzers. Kun jij al klokkijken?",
    "We gaan samen klokkijken. De wijzers laten zien hoe laat het is. Kun jij de klok al lezen?",
    "Vandaag leren we klokkijken. We kijken naar de wijzers en lezen het uur. Lukt jou dat al?",
  ],
  proefBegin: ["Fijn! Dan kijken we eerst of het lukt.", "Mooi! Dan proberen we er eerst 2.", "Wat goed! We beginnen met 2 klokken."],
  proefLastig: [
    ["Dit is nog lastig.", "We gaan het eerst samen bekijken."],
    ["Dat geeft niks.", "We kijken er eerst samen naar."],
    ["Weet je wat?", "We leren het eerst samen, stap voor stap."],
  ],
  proefGoed: ["Mooi, dat kun je al!", "Kijk eens aan, je kunt het al!", "Zie je wel, dat lukt jou al!"],
  samenBeginnen: ["Prima! Dan gaan we het samen leren.", "Geen probleem. We leren het samen, stap voor stap.", "Dan doen we het samen. Ik help je."],
  oefenBegin: ["Nu mag jij de klokken lezen.", "Nu ga jij zelf klokkijken."],
  oefenVerder: ["Nu nog meer klokken.", "We gaan door met nog meer klokken."],
  terug: (n: number) =>
    n === 1
      ? ["Er komt nog 1 klok van net terug.", "We doen nog 1 klok van net.", "Nog 1 klok van net. Die oefenen we nog even."]
      : [`Er komen nog ${n} klokken van net terug.`, `We doen nog ${n} klokken van net.`, `Nog ${n} klokken van net. Die oefenen we nog even.`],
  /* Het kind miste niets: dan zijn het gewoon extra klokken om te oefenen (geen "van net terug"). */
  extra: (n: number) => (n === 1 ? ["Nog 1 klok om te oefenen.", "We oefenen nog 1 klok."] : [`Nog ${n} klokken om te oefenen.`, `We oefenen nog ${n} klokken.`]),
  terugLastig: ["Deze klokken oefenen we een andere keer nog eens.", "Dit oefenen we een andere keer nog eens. Dat komt goed."],
  slot: ["Nu kun je het uur lezen met de kleine wijzer.", "Je hebt goed gewerkt vandaag! Je kunt nu zien welk uur het is.", "Mooi gewerkt! Jij kunt nu de hele uren lezen op de klok."],
  /** Ronde 51 punt 10 (19 november 2026, 15.37/15.50): ook bij de klok zegt Bliepo wat het kind met de kaart doet; die opdracht is het laatste in beeld. Dezelfde 3 als de andere gouden lessen. */
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
  /** Het hulphandje bij "zet de kleine wijzer op de …" (na de aanmoediging uit het vaste rijtje). */
  zetHand: (n: number) => [`Sleep de kleine wijzer naar de {${n}:oranje}. Tikken mag ook.`, `Tik maar op de {${n}:oranje}. Slepen met de wijzer mag ook.`],
  /** Samen doen bij zetten (na de 2e keer mis): waar het getal staat. `metGetal` alleen als het getal niet net genoemd is. */
  zetHier: (n: number) => ({
    metGetal: [`Hier is de {${n}:oranje}, in het oranje rondje.`, `Kijk, het handje wijst naar de {${n}:oranje}.`],
    zonderGetal: ["Het handje wijst het getal aan.", "Kijk, het staat in het oranje rondje."],
  }),
  zetTik: ["Tik er maar op.", "Tik jij erop?", "Tik het maar aan."],
  /** De vraag opnieuw na de hint, bij een klok ("Hoe laat is het?"). */
  klokOpnieuw: ["Hoe laat is het?", "Hoe laat is het, denk je?", "Wat denk je nu? Hoe laat is het?", "Kijk nog eens goed. Hoe laat is het?"],
  /** De vraag opnieuw na de hint, bij "naar welk getal wijst de kleine wijzer?". */
  wijstOpnieuw: ["Naar welk getal wijst de kleine wijzer?", "Naar welk getal wijst de kleine wijzer, denk je?", "Wat denk je nu? Waar wijst de kleine wijzer naar?"],
};

/* ---------- denkfouten ---------- */

/** De vaste namen voor de voortgang (FOUTTABEL-squla-klok-gouden.md §1; elke les gebruikt dezelfde lijst). */
export const DENKFOUTEN = ["verkeerde-wijzer", "andere-kant", "spiegelbeeld", "getal-ernaast", "een-te-veel", "een-te-weinig", "plus-min-verwisseld", "groter-kleiner-verwisseld", "verkeerde-richting", "doortellen-na-12", "boven-onder-verwisseld", "wijzers-verwisseld", "uur-minuten-verwisseld", "geen-heel-uur", "beeld-van-net", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Wat er op het scherm gebeurt bij een hint (de les zet dit om in beeld). */
export type Scherm = "licht-uur" | "licht-minuut" | "driehoek-12" | "driehoek-6" | "pijl-6-7" | "pijl-12-1" | "ring-hand" | "lijn" | "rondje-getallen" | "geen";

export const SCHERM_TEKST: Record<Scherm, string> = {
  "licht-uur": "de kleine wijzer licht op, de grote wordt vaag",
  "licht-minuut": "de grote wijzer licht op, de kleine wordt vaag",
  "driehoek-12": "blauw pijltje boven de 12 (alleen na het antwoord: bij goed of bij het samen voordoen; als hint niet meer gebruikt, Ronde 33 punt 1)",
  "driehoek-6": "blauw pijltje onder de 6 (alleen na het antwoord: bij goed of bij het samen voordoen; als hint niet meer gebruikt, Ronde 33 punt 1)",
  "pijl-6-7": "blauwe pijl die eindigt op de 6 (van de 5 naar de 6, met de klok mee): wijst alleen de richting, eindigt op het getal waar je begint",
  "pijl-12-1": "blauwe pijl die eindigt op de 12 (van de 11 naar de 12, met de klok mee): wijst alleen de richting, eindigt op het getal waar je begint",
  "ring-hand": "oranje rondje om het doel blijft, het hulphandje wijst naar het doel",
  lijn: "de getallenlijn blijft recht in beeld",
  "rondje-getallen": "de klok blijft in beeld, getallen in een rondje",
  geen: "niets extra",
};

export type Fout = {
  /** De naam van de denkfout uit de vaste lijst (komt in de voortgang). */
  code: Denkfoutnaam;
  /** Welke uitleg bij de 2e fout hoort (sleutel in UITLEG; kan per vraag preciezer zijn dan de naam). */
  soort: string;
  /** De waarschijnlijke denkfout in gewone woorden. */
  denkfout: string;
  /** Bliepo's eerste zin, in varianten (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string[];
  /** De hint die precies die denkfout aanpakt (zonder het antwoord te noemen), in varianten. */
  hint: string[];
  scherm: Scherm;
};

/**
 * Na de 2e fout, per soort denkfout (zonder opdracht bij een keuzevraag: meteen daarna doet Bliepo het samen voor):
 *   - `uitleg`: 1 korte uitleg, in varianten (bij een NIEUWE denkfout, na Bliepo's eerste zin);
 *   - `weer`: maakte het kind dezelfde denkfout nog eens, dan zegt Bliepo dat vriendelijk (varianten; leeg = niets);
 *   - `anders`: en legt hij het op een ANDERE manier uit (varianten).
 * Bij ZETTEN (zet-…) zet het kind daarna zelf de wijzer: daar mag de zin een opdracht zijn.
 */
export const UITLEG: Record<string, { uitleg: string[]; weer: string[]; anders: string[] }> = {
  "lange-wijzer": {
    uitleg: ["Het uur lees je bij de kleine wijzer.", "De kleine wijzer vertelt hoe laat het is.", "Voor het uur hebben we de kleine wijzer nodig."],
    weer: ["Je keek weer naar de grote wijzer.", "Weer de grote wijzer, zie ik.", "Dat is weer het getal van de grote wijzer."],
    anders: ["Het uur staat bij de punt van de kleine, dikke wijzer.", "De kleine wijzer is kort en dik. Die wijst het uur aan."],
  },
  "andere-kant": {
    uitleg: ["Het uur staat bij de punt van de kleine wijzer.", "De punt van de kleine wijzer wijst het uur aan.", "Het uur staat waar de punt naartoe wijst."],
    weer: ["Weer de andere kant.", "Weer de andere kant van de klok, zie ik.", "Je koos weer het getal aan de overkant."],
    anders: ["Vanuit het midden wijst de punt naar het uur.", "De wijzer begint in het midden. Zijn punt wijst naar het uur."],
  },
  ernaast: {
    uitleg: ["Het uur is het getal precies bij de punt van de kleine wijzer.", "De punt van de kleine wijzer raakt maar 1 getal. Dat is het uur.", "Het uur staat precies waar de punt naar wijst."],
    weer: ["Weer net ernaast. Je bent er bijna!", "Weer vlak ernaast, zie ik.", "Ook dit getal staat er net naast."],
    anders: ["Het goede getal raakt de punt precies.", "De punt wijst maar naar 1 getal. Dat getal is het uur."],
  },
  spiegel: {
    uitleg: ["Op de klok maakt het uit of de punt links of rechts staat.", "Links en rechts zijn op de klok niet hetzelfde.", "Het uur staat aan de kant waar de punt naartoe wijst."],
    weer: ["Weer het getal aan de andere kant. Links en rechts zijn omgedraaid.", "Je draaide links en rechts weer om.", "Weer links en rechts door elkaar, zie ik."],
    anders: ["Het getal bij de punt van de kleine wijzer is het uur.", "Het uur staat aan de kant van de punt, niet aan de overkant."],
  },
  "zet-spiegel": {
    uitleg: ["Kijk of het oranje rondje links of rechts staat. Draai de punt daarheen.", "Het oranje rondje staat aan de andere kant. Draai de punt erheen."],
    weer: ["Weer links en rechts omgedraaid.", "Links en rechts zijn weer omgedraaid, zie ik."],
    anders: ["Kijk naar het oranje rondje en draai de punt daarheen.", "Zoek het oranje rondje. Daar moet de punt naartoe."],
  },
  "tussendoor-uur": {
    uitleg: ["De kleine wijzer vertelt het uur.", "Het uur hoort bij de kleine wijzer."],
    weer: ["Je koos weer de grote wijzer.", "Weer de grote wijzer, zie ik."],
    anders: ["Het uur lees je bij de kleine wijzer.", "De grote wijzer telt de minuten. Het uur lees je bij de kleine."],
  },
  "bonus-min": {
    uitleg: ["Straks is het later. De kleine wijzer gaat dan een stukje verder, met de klok mee.", "Later is met de klok mee. De kleine wijzer schuift dan naar het volgende getal."],
    weer: ["Je ging weer terug.", "Weer terug in de tijd, zie ik."],
    anders: ["Later is met de klok mee.", "Straks is het later. Dan gaat de wijzer met de klok mee."],
  },
  "bonus-nul": {
    uitleg: ["Straks is het later dan nu.", "Straks staat de kleine wijzer niet meer op dezelfde plek."],
    weer: ["Weer de tijd van nu.", "Je koos weer de tijd van nu."],
    anders: ["Straks staat de kleine wijzer bij het volgende getal.", "De tijd staat niet stil. Straks wijst de kleine wijzer naar het volgende getal."],
  },
  onduidelijk: {
    uitleg: ["Het uur staat bij de punt van de kleine wijzer.", "De kleine wijzer wijst met zijn punt naar het uur.", "Het uur lees je bij de punt van de kleine wijzer."],
    weer: [],
    anders: ["Bij de punt van de kleine wijzer staat het uur.", "Het getal bij de punt van de kleine wijzer is het uur."],
  },
  "uur-minuten": {
    uitleg: ["Bij een heel uur zeg je het getal en dan het woord uur.", "Bij de kleine wijzer hoort het woord uur."],
    weer: ["Weer minuten.", "Je koos weer minuten."],
    anders: ["De grote wijzer staat bovenaan, dus het is een heel uur.", "De grote wijzer wijst recht omhoog. Dan zeg je uur, geen minuten."],
  },
  "korte-wijzer": {
    uitleg: ["Het gaat nu alleen om de grote paarse wijzer.", "We letten nu alleen op de grote wijzer."],
    weer: ["Je keek weer naar de kleine wijzer.", "Weer de kleine wijzer, zie ik."],
    anders: ["Nu telt alleen de paarse wijzer die licht geeft.", "De grote wijzer is de lange, paarse wijzer. Die licht nu op."],
  },
  "geen-heel-uur": {
    uitleg: ["De grote wijzer telt ook mee.", "Voor een heel uur is ook de grote wijzer nodig."],
    weer: ["De kleine wijzer staat vlak bij de {7:oranje}, dat klopt.", "Je ziet de kleine wijzer bij de {7:oranje}. Dat klopt."],
    anders: ["Maar bij een heel uur staat de grote wijzer bovenaan.", "Maar bij een heel uur wijst de grote wijzer naar boven."],
  },
  "klok-van-net": {
    uitleg: ["Een klok is rond. Deze getallen staan op een rechte lijn.", "Bij een klok staan de getallen in een rondje. Hier staan ze op een lijn."],
    weer: ["Je denkt weer aan de klok van net.", "Weer de klok, zie ik."],
    anders: ["Deze getallen staan niet in een rondje.", "De getallen staan nu naast elkaar, op een rij."],
  },
  "lijn-van-net": {
    uitleg: ["De getallen staan nu in een rondje, net als aan de muur.", "Een getallenlijn is recht. Dit is rond."],
    weer: ["Je denkt nog aan de lijn van net.", "Weer de getallenlijn, zie ik."],
    anders: ["Een rondje met getallen hangt aan de muur.", "Dit is rond en er staan getallen op. Zoiets hangt aan de muur."],
  },
  "boven-onder": {
    uitleg: ["Het hoogste getal staat bovenaan de rand, het laagste onderaan.", "Bovenaan is het hoogste punt van de klok. Onderaan het laagste."],
    weer: ["Weer boven en onder door elkaar.", "Boven en onder zijn weer omgedraaid, zie ik."],
    anders: ["Het hoogste punt is helemaal boven. Het laagste punt is helemaal onder.", "Bovenaan is de top van de klok. Onderaan is het laagste punt."],
  },
  "net-niet-hoogst": {
    uitleg: ["Het hoogste getal staat waar de rand niet hoger gaat.", "Het hoogste punt is de top van de klok."],
    weer: ["Weer net naast de top.", "Weer vlak naast de top, zie ik."],
    anders: ["Het hoogste getal staat recht boven het midden van de klok.", "De top is precies in het midden, helemaal bovenaan."],
  },
  laagste: {
    uitleg: ["Het laagste getal staat waar de rand niet lager gaat.", "Het laagste punt is helemaal onderaan de klok."],
    weer: [],
    anders: ["Het laagste getal staat recht onder het midden van de klok.", "Onderaan is waar de klok het laagst is."],
  },
  "voor-na": {
    uitleg: ["Erna is de kant op van de blauwe pijl.", "Erna betekent: verder, met de pijl mee."],
    weer: ["Weer de andere kant.", "Weer het getal ervoor, zie ik."],
    anders: ["Erna is 1 stap de kant op van de blauwe pijl.", "Ervoor is terug. Erna is 1 stap verder."],
  },
  "te-ver": {
    uitleg: ["Erna is maar 1 stap verder, de kant op van de pijl.", "Erna is het getal dat er meteen achter komt."],
    weer: ["Weer een stap te ver.", "Weer te ver gesprongen, zie ik."],
    anders: ["Erna is precies 1 stap.", "Erna is het volgende getal. Je slaat er geen over."],
  },
  "door-na-12": {
    uitleg: ["Op de klok begin je daarna weer opnieuw.", "De klok heeft geen hogere getallen. Hij begint weer opnieuw."],
    weer: ["Je telde weer verder.", "Weer doorgeteld, zie ik."],
    anders: ["De blauwe pijl laat zien waar het verder gaat.", "De klok telt niet steeds verder. Hij begint opnieuw bij het begin."],
  },
  "lang-is-uur": {
    uitleg: ["De grote wijzer draait snel rond. Hij telt iets dat kort duurt.", "De grote wijzer heeft haast. Hij telt iets dat snel voorbij is."],
    weer: ["Je koos weer de uren.", "Weer de uren, zie ik."],
    anders: ["De grote wijzer gaat in 1 uur een heel rondje.", "De grote wijzer draait veel sneller dan de kleine."],
  },
  namen: {
    uitleg: ["De grote wijzer is lang, de kleine wijzer is kort.", "De naam zegt het al: groot is lang, klein is kort."],
    weer: ["Je koos weer de andere naam.", "Weer de andere naam, zie ik."],
    anders: ["De naam hoort bij hoe lang de wijzer is.", "Een lange wijzer heet groot. Een korte wijzer heet klein."],
  },
  "zet-12": {
    uitleg: ["Draai de punt naar het getal in het oranje rondje.", "De kleine wijzer hoort nu in het oranje rondje. Draai hem daarheen."],
    weer: ["Weer bij de {12:paars}. Daar staat de grote wijzer.", "De punt staat weer bij de {12:paars}, bij de grote wijzer."],
    anders: ["Zet de kleine wijzer in het oranje rondje.", "Draai de kleine wijzer naar het oranje rondje."],
  },
  "zet-andere-kant": {
    uitleg: ["Draai de punt helemaal naar het oranje rondje.", "Het oranje rondje staat aan de overkant. Draai de punt erheen."],
    weer: ["Weer de andere kant.", "De punt staat weer aan de overkant."],
    anders: ["Kijk waar het oranje rondje is. Daar hoort de punt.", "Zoek het oranje rondje. Daar hoort de punt."],
  },
  "zet-ernaast": {
    uitleg: ["De punt moet precies in het oranje rondje staan.", "De punt hoort midden in het oranje rondje."],
    weer: ["Weer net ernaast. Je bent er bijna!", "Weer vlak naast het rondje, zie ik."],
    anders: ["Draai nog een heel klein stukje, tot in het oranje rondje.", "Nog een klein stukje, dan staat de punt in het oranje rondje."],
  },
  "zet-ring": {
    uitleg: ["Zet de punt van de kleine wijzer in het oranje rondje.", "De punt van de kleine wijzer hoort in het oranje rondje."],
    weer: ["Weer een ander getal.", "Ook dit getal is het nog niet."],
    anders: ["Kijk waar het handje wijst. Daar moet de punt heen.", "Het handje wijst de goede plek aan."],
  },
};

/* ---------- de fouttabel per vraag ---------- */

export type Vraag = {
  id: string;
  /** Waar in de les (draaiboekstap of klok in het oefenblok). */
  waar: string;
  vraag: string[];
  opties: string[];
  goed: string;
  fouten: Record<string, Fout>;
  /** De vraag bij de 2e poging, na de hint: VARIANTEN (de les kiest er 1; nooit precies de vraag van de 1e keer). */
  opnieuw: string[];
  /** Na de lof of bevestiging. */
  naGoed?: string[];
  /** Samen voordoen na de 2e fout (nu pas het antwoord). */
  samen?: string[];
  /** Kijkvraag: het kind moest iets zien of vinden ("Dat heb je goed gezien" mag). */
  kijk?: boolean;
  /** Een vraag die in de les als lastig staat (lof voor een moeilijke vraag mag). */
  lastig?: boolean;
};

const o = (n: number) => `{${n}:oranje}`;
const lijst = (x: string | string[]) => (Array.isArray(x) ? x : [x]).filter(Boolean);
const F = (code: Denkfoutnaam, soort: string, denkfout: string, eerste: string | string[], hint: string | string[], scherm: Scherm): Fout => ({ code, soort, denkfout, eerste: lijst(eerste), hint: lijst(hint), scherm });

/** Het spiegelbeeld van een uur op de klok (links en rechts omgedraaid): 2 en 10, 1 en 11, 4 en 8, 5 en 7. 12 en 6 blijven staan. */
export const spiegel = (n: number) => (24 - n) % 12 || 12;
/** Staan 2 getallen op de klok naast elkaar? (12 en 1 ook.) */
export const naastElkaar = (a: number, b: number) => Math.abs(a - b) === 1 || Math.abs(a - b) === 11;

/**
 * Een klok lezen (hele uren): de foute keuze → de denkfout. `metUur`: de keuzes zijn "3 uur" (anders "3").
 * `opties`: alle keuzes van de vraag. "Vlak naast" en "bijna" zegt Bliepo alleen als er dan nog minstens 2 keuzes
 * vlak naast liggen; anders zou het woord het antwoord verklappen (BOUWREGELS 15.17) en zegt hij alleen wat het kind koos.
 */
export function klokFout(gekozen: number, uur: number, metUur: boolean, opties: readonly number[] = []): Fout {
  if (gekozen === 12 && uur !== 12)
    return F("verkeerde-wijzer", "lange-wijzer", "keek naar de grote (lange) wijzer in plaats van de kleine", ["Je keek naar de grote wijzer.", "Je koos het getal bij de grote wijzer.", "Dat is het getal van de grote wijzer."], ["Bij een heel uur kijken we naar de kleine wijzer.", "We zoeken de kleine wijzer. Die licht nu op.", "Zoek de kleine wijzer. Die vertelt het uur."], "licht-uur");
  if (gekozen === ((uur + 5) % 12) + 1)
    return F("andere-kant", "andere-kant", "nam het getal aan de andere kant van de klok", ["Je keek naar de andere kant van de klok.", "Dat getal staat aan de andere kant van de klok.", "Je koos het getal aan de overkant."], ["Kijk waar de punt van de kleine wijzer is.", "De wijzer begint in het midden. Kijk waar zijn punt is.", "Volg de kleine wijzer van het midden naar de punt."], "licht-uur");
  if (gekozen === spiegel(uur)) {
    const koos = uur < 6 ? "links" : "rechts";
    const wijst = uur < 6 ? "rechts" : "links";
    return F("spiegelbeeld", "spiegel", "koos het spiegelbeeld: het getal links in plaats van rechts van de klok, of andersom", [`Je koos het getal ${koos}, maar de wijzer wijst naar ${wijst}.`, `Dat getal staat ${koos}. De kleine wijzer wijst naar ${wijst}.`, `Je keek ${koos}, maar de punt van de wijzer staat ${wijst}.`], ["Kijk of de punt van de kleine wijzer links of rechts staat, en neem het getal precies daar.", "Kijk goed naar welke kant de punt wijst. Daar zoek je het getal.", "Volg de kleine wijzer tot aan zijn punt. Aan die kant staat het getal."], "licht-uur");
  }
  if (naastElkaar(gekozen, uur)) {
    /* Hoeveel keuzes liggen er vlak naast wat het kind koos? Minder dan 2: "vlak naast" zou het antwoord verklappen. */
    const over = opties.filter((n) => n !== gekozen && naastElkaar(n, gekozen)).length;
    const wat = metUur ? `${gekozen} uur` : `de ${gekozen}`;
    const eerste = over >= 2 ? ["Je zat er vlak naast.", "Bijna! Je zit er vlak naast.", "Dat getal staat er net naast."] : metUur ? [`Je koos ${wat}. Ik lees een andere tijd.`, `${gekozen} uur? Ik zie een ander uur op de klok.`, `Je tikte op ${wat}. De kleine wijzer zegt iets anders.`] : [`Je koos ${wat}. Ik zie een ander getal.`, `Je tikte op ${wat}. De kleine wijzer wijst ergens anders naar.`];
    return F("getal-ernaast", "ernaast", "nam het getal vlak naast het goede", eerste, ["Volg de kleine wijzer tot het getal waar hij precies naar wijst.", "Kijk heel precies waar de punt van de kleine wijzer staat.", "Volg de kleine wijzer vanaf het midden, helemaal tot zijn punt."], "licht-uur");
  }
  return F("onduidelijk", "onduidelijk", "niet duidelijk (geen reden verzonnen)", [], metUur ? ["Kijk naar de kleine wijzer. Zijn punt wijst naar het uur.", "Zoek de punt van de kleine wijzer. Daar staat het uur.", "De kleine wijzer licht op. Kijk waar zijn punt naartoe wijst."] : ["Volg de kleine wijzer vanaf het midden tot aan de punt.", "Zoek de punt van de kleine wijzer. Daar staat het getal.", "De kleine wijzer licht op. Kijk waar zijn punt naartoe wijst."], "licht-uur");
}

/** Een fout getal bij "zet de kleine wijzer op de …" (de meest voorkomende fouten). Elke hint zegt wat het kind doet (15.37). */
export function zetFout(gekozen: number, doel: number): Fout {
  if (gekozen === 12 && doel !== 12)
    return F("verkeerde-wijzer", "zet-12", "zette de kleine wijzer waar de grote hoort (bij de 12)", ["Bij de {12:paars} hoort de grote wijzer.", "De {12:paars} is de plek van de grote wijzer.", "Daar staat de grote wijzer al, bij de {12:paars}."], [`Zet de kleine wijzer bij de ${o(doel)}.`, `Draai de kleine wijzer naar de ${o(doel)}.`, `Tik op de ${o(doel)}, in het oranje rondje.`], "ring-hand");
  if (gekozen === spiegel(doel) && gekozen !== ((doel + 5) % 12) + 1) {
    const nu = doel < 6 ? "links" : "rechts";
    const hoort = doel < 6 ? "rechts" : "links";
    return F("spiegelbeeld", "zet-spiegel", "zette de punt op het spiegelbeeld: links in plaats van rechts van de klok, of andersom", [`Je zette de punt ${nu}, maar de ${o(doel)} staat ${hoort}.`, `De punt staat nu ${nu}. De ${o(doel)} staat ${hoort}.`, `Je draaide naar ${nu}, maar de ${o(doel)} staat ${hoort}.`], ["Draai de punt naar het oranje rondje.", "Draai de punt naar de andere kant.", "Tik op het getal in het oranje rondje."], "ring-hand");
  }
  if (gekozen === ((doel + 5) % 12) + 1)
    return F("andere-kant", "zet-andere-kant", "zette de punt aan de andere kant van de klok", ["De punt staat nu aan de andere kant.", "Je draaide naar de andere kant van de klok.", "Nu wijst de punt naar de overkant."], [`Draai de punt naar de ${o(doel)}.`, `Draai de wijzer verder, tot bij de ${o(doel)}.`, `Zet de punt bij de ${o(doel)}, in het oranje rondje.`], "ring-hand");
  if (naastElkaar(gekozen, doel))
    return F("getal-ernaast", "zet-ernaast", "zette de wijzer vlak naast het doel", [`Je zette hem vlak naast de ${o(doel)}.`, `Bijna! De punt staat naast de ${o(doel)}.`, "De punt staat er vlak naast."], ["Draai een klein stukje verder of terug, naar het oranje rondje.", "Draai de punt nog een klein stukje, naar het oranje rondje.", "Schuif de punt nog een beetje op, naar het oranje rondje."], "ring-hand");
  return F("onduidelijk", "zet-ring", "niet duidelijk (geen reden verzonnen)", [], ["Kijk naar het oranje rondje. Draai de punt daarheen.", "Zoek het oranje rondje. Zet de punt erin.", "Tik op het getal in het oranje rondje."], "ring-hand");
}

const heleKlok = (uur: number, opties: number[], metUur: boolean): Record<string, Fout> =>
  Object.fromEntries(opties.filter((n) => n !== uur).map((n) => [metUur ? `${n} uur` : String(n), klokFout(n, uur, metUur, opties)]));

/** "Bij de 6 staat de kleine wijzer": het kind keek naar de kleine wijzer, terwijl de vraag over de grote ging. */
const bijKleine = (n: number, nu = false) => [`Bij de ${o(n)} staat ${nu ? "nu " : ""}de kleine wijzer.`, `De ${o(n)}? Daar wijst de kleine wijzer naar.`, "Je koos de plek van de kleine wijzer."];

/** De vragen van de uitleg (draaiboek stap 4 t/m 18), in volgorde. */
export const UITLEGVRAGEN: Vraag[] = [
  {
    id: "stap4-hoe-heet", waar: "uitleg, stap 4 (de klok is een getallenlijn geworden)", kijk: true, vraag: ["Hoe heet dit?"], opties: ["een getallenlijn", "een klok"], goed: "een getallenlijn",
    opnieuw: ["Hoe heet dit, denk je?", "Wat denk je nu? Hoe heet dit?"],
    samen: ["Kijk, de getallen staan op een rechte lijn. Dat is een getallenlijn."],
    fouten: { "een klok": F("beeld-van-net", "klok-van-net", "noemde wat er net nog op het scherm stond (de klok)", ["Net was het nog een klok, ja.", "Dat was het net nog, ja."], ["Nu staan de getallen op een rij.", "Kijk hoe de getallen nu staan: naast elkaar, op een rij."], "lijn") },
  },
  {
    id: "stap6-hoe-heet-nu", waar: "uitleg, stap 6 (de lijn is weer rond)", kijk: true, vraag: ["Kijk, de getallenlijn is weer rond.", "Hoe heet dit nu?"], opties: ["een klok", "een getallenlijn"], goed: "een klok",
    opnieuw: ["Hoe heet dit nu?", "Hoe heet dit nu, denk je?"], samen: ["De getallen staan in een rondje. Dat is een klok."],
    fouten: { "een getallenlijn": F("beeld-van-net", "lijn-van-net", "noemde wat er net nog op het scherm stond (de getallenlijn)", ["Net was het een getallenlijn, ja.", "Dat was het net nog, ja."], ["Kijk: nu staan de getallen in een rondje.", "De lijn is nu gebogen tot een rondje."], "rondje-getallen") },
  },
  {
    id: "stap7-hoogste", waar: "uitleg, stap 7 (het hoogste punt)", kijk: true, vraag: ["Kijk eens naar de bovenkant van de klok.", "Welk getal zie je daar?"], opties: ["1", "6", "12"], goed: "12",
    opnieuw: ["Welk getal staat helemaal bovenaan?", "Welk getal staat op het hoogste punt, denk je?"], naGoed: ["De 12 staat helemaal bovenaan."], samen: ["Kijk, in het oranje rondje: de 12 staat helemaal bovenaan."],
    fouten: {
      "1": F("getal-ernaast", "net-niet-hoogst", "nam een getal dat hoog staat, maar net naast de top", ["De 1 staat hoog, maar nog niet op het hoogste punt.", "De 1 staat hoog. Maar er staat een getal nog hoger."], ["Ga langs de rand omhoog.", "Volg de rand tot je niet hoger kunt."], "geen"),
      "6": F("boven-onder-verwisseld", "boven-onder", "haalde bovenaan en onderaan door elkaar", ["De 6 staat juist helemaal onderaan.", "Dat is het laagste punt. De 6 staat onderaan."], ["Ga langs de rand helemaal omhoog.", "We zoeken de top. Volg de rand helemaal naar boven."], "geen"),
    },
  },
  {
    id: "stap8-laagste", waar: "uitleg, stap 8 (het laagste punt)", kijk: true, vraag: ["Ga nu met je ogen naar de onderkant van de klok.", "Welk getal staat daar beneden?"], opties: ["3", "6", "12"], goed: "6",
    opnieuw: ["Welk getal staat helemaal onderaan?", "Welk getal staat op het laagste punt, denk je?"], naGoed: ["De 6 staat helemaal onderaan."], samen: ["Kijk, in het oranje rondje: de 6 staat helemaal onderaan."],
    fouten: {
      "3": F("onduidelijk", "laagste", "niet duidelijk (geen reden verzonnen)", [], ["Ga langs de rand helemaal omlaag.", "Volg de rand tot je niet lager kunt."], "geen"),
      "12": F("boven-onder-verwisseld", "boven-onder", "haalde bovenaan en onderaan door elkaar", ["De 12 staat juist bovenaan.", "Dat is het hoogste punt. De 12 staat bovenaan."], ["Ga langs de rand helemaal omlaag.", "We zoeken het laagste punt. Volg de rand helemaal naar beneden."], "geen"),
    },
  },
  {
    id: "stap9-na-6", waar: "uitleg, stap 9 (wat komt na de 6?)", vraag: ["Zoek de 6 op de klok.", "Welk getal is het volgende?"], opties: ["5", "7", "8"], goed: "7",
    opnieuw: ["Welk getal komt na de 6?", "Wat denk je nu? Welk getal komt na de 6?"], naGoed: ["Van de 6 ga je deze kant op, naar de 7."], samen: ["Van de 6 ga je 1 getal verder, naar de 7 in het oranje rondje."],
    fouten: {
      "5": F("verkeerde-richting", "voor-na", "nam het getal ervoor in plaats van erna", ["De 5 komt voor de 6.", "De 5 staat ervoor, niet erna."], ["Erna betekent: deze kant op. Ga verder, de kant op van de blauwe pijl.", "Erna is de andere kant op. Kijk maar naar de blauwe pijl."], "pijl-6-7"),
      "8": F("een-te-veel", "te-ver", "telde 1 te veel (2 getallen verder)", ["Je ging 2 getallen verder.", "Je sprong over een getal heen."], ["Erna is het getal dat er meteen achter staat.", "We zoeken het getal dat er meteen achter komt."], "geen"),
    },
  },
  {
    id: "stap10-na-12", waar: "uitleg, stap 10 (wat komt na de 12?)", lastig: true, vraag: ["Nu wordt het moeilijker.", "Wat komt er na de 12?"], opties: ["1", "11", "13"], goed: "1",
    opnieuw: ["Welk getal komt na de 12?", "Wat denk je nu? Welk getal komt na de 12?"], naGoed: ["Na de 12 begint de klok weer bij de 1."], samen: ["Na de 12 begint de klok weer opnieuw, bij de 1 in het oranje rondje."],
    fouten: {
      "13": F("doortellen-na-12", "door-na-12", "telde door zoals op een getallenlijn (13 na 12)", ["Op een getallenlijn komt de 13 na de 12, dat snap ik.", "Bij tellen komt daarna de 13, dat klopt.", "Je telde door, zoals op de getallenlijn."], ["Maar zo'n groot getal staat niet op de klok. Ga verder, de kant op van de blauwe pijl.", "Maar de klok heeft geen hogere getallen. Kijk maar naar de blauwe pijl."], "pijl-12-1"),
      "11": F("verkeerde-richting", "voor-na", "nam het getal ervoor in plaats van erna", ["De 11 komt voor de 12.", "De 11 staat ervoor, niet erna."], ["We zoeken het getal erna. Ga verder, de kant op van de blauwe pijl.", "Erna is de andere kant op. Kijk maar naar de blauwe pijl."], "pijl-12-1"),
    },
  },
  {
    id: "stap11-lange-telt", waar: "uitleg, stap 11 (wat telt de grote wijzer?)", vraag: ["De ene wijzer telt de minuten. De andere wijst het uur aan.", "Wat telt de grote wijzer?"], opties: ["de minuten", "de uren"], goed: "de minuten",
    opnieuw: ["Wat telt de grote wijzer?", "Wat telt de grote wijzer, denk je?"], naGoed: ["De grote wijzer telt de minuten."], samen: ["De grote wijzer gaat snel rond. Hij telt de minuten."],
    fouten: { "de uren": F("wijzers-verwisseld", "lang-is-uur", "dacht: een uur duurt lang, dus de grote wijzer telt de uren", ["Dat klinkt logisch: een uur duurt lang.", "Dat snap ik: een uur duurt lang."], ["Kijk hoe snel de grote wijzer straks draait.", "Maar de grote wijzer draait juist heel snel rond."], "licht-minuut") },
  },
  {
    id: "stap12-lange-naam", waar: "uitleg, stap 12 (hoe heet de wijzer die de minuten telt?)", vraag: ["Deze paarse wijzer telt de minuten.", "Hoe heet hij?"], opties: ["de grote wijzer", "de kleine wijzer"], goed: "de grote wijzer",
    /* De vraag opnieuw noemt de naam niet: "Hoe heet de grote wijzer?" verklapte het antwoord (15.17; 18 november 2026). */
    opnieuw: ["Hoe heet deze paarse wijzer?", "Hoe heet de wijzer die de minuten telt?"], samen: ["Deze lange wijzer is de grote wijzer.", "Hij telt de minuten."],
    fouten: { "de kleine wijzer": F("wijzers-verwisseld", "namen", "haalde de namen van de wijzers door elkaar", ["De kleine wijzer is de korte.", "De kleine wijzer is korter dan deze."], ["Deze wijzer is lang.", "Kijk hoe lang deze paarse wijzer is."], "licht-minuut") },
  },
  {
    id: "stap12-korte-naam", waar: "uitleg, stap 12 (hoe heet de korte wijzer?)", vraag: ["En nu de korte oranje wijzer.", "Wat is de naam van deze wijzer?"], opties: ["de kleine wijzer", "de grote wijzer"], goed: "de kleine wijzer",
    opnieuw: ["Hoe heet deze korte oranje wijzer?", "Hoe heet deze oranje wijzer, denk je?"], samen: ["Deze korte wijzer is de kleine wijzer.", "Hij laat het uur zien."],
    fouten: { "de grote wijzer": F("wijzers-verwisseld", "namen", "haalde de namen van de wijzers door elkaar", ["De grote wijzer is de lange.", "De grote wijzer is langer dan deze."], ["Deze wijzer is kort.", "Kijk hoe kort deze oranje wijzer is."], "licht-uur") },
  },
  ...[3, 7, 11].map((uur, i): Vraag => ({
    id: `stap13-wijst-${uur}`, waar: `uitleg, stap 13 (de kleine wijzer draait naar de ${uur})`, kijk: true,
    vraag: [["Naar welk getal wijst de kleine wijzer?"], ["Hij draait weer.", "Waar wijst hij nu naar?"], ["Nog 1 keer.", "Naar welk getal wijst hij nu?"]][i],
    opnieuw: VAR.wijstOpnieuw,
    opties: [String(uur), String(((uur + 5) % 12) + 1), "12"], goed: String(uur), fouten: heleKlok(uur, [uur, ((uur + 5) % 12) + 1, 12], false),
  })),
  {
    id: "stap15-grote-steeds", waar: "uitleg, stap 15 (waar stond de grote wijzer steeds?)", kijk: true, vraag: ["Waar stond de grote wijzer elke keer?"], opties: ["6", "12"], goed: "12",
    opnieuw: ["Waar stopte de grote wijzer?", "Waar stopte de grote wijzer, denk je?"], naGoed: ["Elke keer recht omhoog, naar de {12:paars}."], samen: ["De grote wijzer wijst recht omhoog, naar de {12:paars} in het oranje rondje."],
    fouten: { "6": F("verkeerde-wijzer", "korte-wijzer", "keek naar de kleine wijzer, die nu bij de 6 staat", bijKleine(6, true), ["Let goed op de grote wijzer.", "We kijken nog een keer. Let op de grote wijzer."], "licht-minuut") },
  },
  /* Stap 16: de 2 uitlegvragen van de oude les squla-klok-hoelaat-1 (uitlegHeel), met dezelfde keuzes. */
  { id: "stap16-wijst-3", waar: "uitleg, stap 16 (klok op 3 uur; vraag uit de oude les)", kijk: true, vraag: ["Naar welk getal wijst de kleine wijzer?"], opnieuw: VAR.wijstOpnieuw, opties: ["12", "3", "6"], goed: "3", fouten: heleKlok(3, [12, 3, 6], false) },
  { id: "stap16-hoe-laat", waar: "uitleg, stap 16 (klok op 3 uur; vraag uit de oude les)", vraag: ["Hoe laat is het dus?"], opnieuw: VAR.klokOpnieuw, opties: ["12 uur", "6 uur", "3 uur"], goed: "3 uur", naGoed: ["De kleine wijzer wijst naar de {3:oranje} en de grote staat op de {12:paars}."], fouten: heleKlok(3, [12, 6, 3], true) },
  {
    id: "stap17-6-uur", waar: "uitleg, stap 17 (klok op 6 uur)", vraag: ["Hoe laat is het nu?"], opnieuw: VAR.klokOpnieuw, opties: ["6 uur", "12 uur", "6 minuten"], goed: "6 uur",
    fouten: {
      "12 uur": klokFout(12, 6, true),
      "6 minuten": F("uur-minuten-verwisseld", "uur-minuten", "zag de 6 goed, maar zei minuten in plaats van uur", ["Je vond het juiste getal, dat zag je goed.", "Het getal klopt. Dat zag je goed."], ["Welke wijzer wijst ernaar? Die vertelt het uur.", "Daar wijst de kleine wijzer naar. Die telt geen minuten."], "licht-uur"),
    },
  },
  {
    id: "stap18-strik", waar: "uitleg, stap 18 (half 8: is het 7 uur?)", lastig: true, vraag: ["Kijk heel goed naar deze klok.", "Is het nu {7:oranje} uur?"], opties: ["Ja", "Nee"], goed: "Nee",
    opnieuw: ["Is het nu {7:oranje} uur?", "Wat denk je nu? Is het {7:oranje} uur?"],
    naGoed: ["Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden.", "De kleine wijzer is de {7:oranje} al voorbij, maar nog niet bij de {8:oranje}."],
    samen: ["Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden.", "De kleine wijzer is de {7:oranje} al voorbij, maar nog niet bij de {8:oranje}.", "Dus zo laat is het nog niet."],
    fouten: { Ja: F("geen-heel-uur", "geen-heel-uur", "keek alleen naar de kleine wijzer bij de 7, niet naar de grote", ["Je keek naar de kleine wijzer bij de {7:oranje}.", "Je zag de kleine wijzer bij de {7:oranje}."], ["Kijk ook naar de grote wijzer. Bij een heel uur wijst die recht omhoog.", "Let ook op de grote wijzer. Die licht nu op."], "licht-minuut") },
  },
];

/** De 13 klokken van het oefenblok (inhoud van squla-klok-hoelaat-1). */
export const KLOKKEN = [
  /* Sara 20 nov 2026 (15.36): bij deze klokken staat alleen de bus in beeld, geen bakkerij. Was: "De bezorgbus staat
     klaar bij de bakkerij." (klok 1 en klok 6). */
  { uur: 1, opties: [1, 9, 8], zin: "De bezorgbus staat klaar.", ding: "bezorgbus", plek: "naast", naspeel: "laden" },
  { uur: 12, opties: [12, 10, 11], zin: "De zon staat hoog aan de hemel.", ding: "zon", plek: "hoog" },
  { uur: 1, opties: [2, 12, 1], zin: "De bus rijdt weer terug.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 4, opties: [6, 4, 5], zin: "De zon staat al lager.", ding: "zon", plek: "laag" },
  { uur: 11, opties: [11, 7, 8], zin: "Kijk, de bakkerij is open. De broodjes zijn klaar.", ding: "bakkerij", plek: "sfeer" },
  { uur: 7, opties: [7, 11, 6], zin: "De bezorgbus staat weer klaar.", ding: "bezorgbus", plek: "naast", naspeel: "laden", weetje: "Vroeg in de ochtend begint de dag." },
  { uur: 8, opties: [8, 9, 1], zin: "De bezorgbus vertrekt.", ding: "bezorgbus", plek: "naast", naspeel: "wegrijden" },
  { uur: 9, opties: [9, 3, 10], zin: "De zon schijnt vrolijk.", ding: "zon", plek: "sfeer", weetje: "De zon schijnt overdag." },
  { uur: 10, opties: [10, 2, 11], zin: "De bus rijdt weer een stukje.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 2, opties: [2, 10, 1], zin: "De bus rijdt weer weg.", ding: "bezorgbus", plek: "naast", naspeel: "wegrijden" },
  { uur: 3, opties: [3, 9, 4], zin: "De bus rijdt nog een stukje verder.", ding: "bezorgbus", plek: "naast", naspeel: "rijden" },
  { uur: 5, opties: [5, 4, 11], zin: "Kijk, hier is de bakkerij weer.", ding: "bakkerij", plek: "sfeer" },
  { uur: 6, opties: [6, 5, 12], zin: "Het wordt donker. De maan komt op.", ding: "maan", plek: "sfeer", weetje: "De maan zie je als het donker wordt." },
] as const;

/** Klok 2 (12 uur): de 2 wijzers staan op hetzelfde getal; "verkeerde wijzer" kan daar niet. Geen vraag in de hint: de vraag komt er meteen achteraan. */
const HINT_12_UUR = ["Hier staat de kleine wijzer op hetzelfde getal als de grote.", "De kleine en de grote wijzer wijzen hier naar hetzelfde getal."];

export const KLOKVRAGEN: Vraag[] = KLOKKEN.map((k, i) => {
  const fouten = heleKlok(k.uur, [...k.opties], true);
  if (k.uur === 12) for (const f of Object.values(fouten)) f.hint = HINT_12_UUR;
  return {
    id: `klok${i + 1}-${k.uur}uur`,
    waar: `oefenblok, klok ${i + 1} (${k.uur} uur)`,
    vraag: [`${k.zin} Hoe laat is het?`],
    opties: k.opties.map((n) => `${n} uur`),
    goed: `${k.uur} uur`,
    opnieuw: VAR.klokOpnieuw,
    ...("weetje" in k ? { naGoed: [k.weetje] } : {}),
    fouten,
  };
});

/**
 * Draaiboek stap 19 (vragen tussendoor) en stap 20 (bonus), aangezet op 9 november 2026 (besluit Sara, ronde 14 punt 2).
 * Alleen hele uren; geen getallen buiten het bereik van de Squla-les (1 t/m 12).
 */
export const EXTRAVRAGEN: Vraag[] = [
  {
    id: "tussendoor-welke-wijzer", waar: "oefenblok, tussendoor (stap 19): na de eerste klok", kijk: true, vraag: ["Welke wijzer liet het uur zien?"], opties: ["de kleine wijzer", "de grote wijzer"], goed: "de kleine wijzer",
    opnieuw: ["Welke wijzer liet het uur zien, denk je?", "Wat denk je nu? Welke wijzer liet het uur zien?"],
    samen: ["De kleine wijzer laat het uur zien."],
    fouten: { "de grote wijzer": F("wijzers-verwisseld", "tussendoor-uur", "dacht dat de grote wijzer het uur laat zien", ["De grote wijzer staat bij de {12:paars}.", "De grote wijzer wees naar de {12:paars}."], ["Het uur lees je bij de andere wijzer, die nu oplicht.", "Het uur stond bij de andere wijzer. Die licht nu op."], "licht-uur") },
  },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((uur): Vraag => ({
    id: `tussendoor-grote-${uur}uur`, waar: `oefenblok, tussendoor (stap 19): waar wijst de grote wijzer? (klok van ${uur} uur)`, kijk: true, vraag: ["Waar wijst de grote wijzer?"], opties: [String(uur), "12"], goed: "12",
    opnieuw: ["Waar wijst de grote wijzer naar, denk je?", "Wat denk je nu? Waar wijst de grote wijzer?"],
    samen: ["De grote wijzer wijst recht omhoog, naar de {12:paars} in het oranje rondje."],
    fouten: { [String(uur)]: F("verkeerde-wijzer", "korte-wijzer", "keek naar de kleine wijzer, die bij het uur staat", bijKleine(uur), ["Kijk naar de grote wijzer die oplicht.", "De grote wijzer licht nu op. Kijk waar die naar wijst."], "licht-minuut") },
  })),
  {
    id: "bonus-over-1-uur", waar: "oefenblok, bonus (stap 20): alleen als alles in 1 keer goed ging", lastig: true, vraag: ["Je had ze allemaal meteen goed! Hier is nog een toetje.", "Het is nu {12:oranje} uur. Hoe laat is het over 1 uur?"], opties: ["1 uur", "11 uur", "12 uur"], goed: "1 uur",
    opnieuw: ["Hoe laat is het over 1 uur?", "Wat denk je nu? Hoe laat is het over 1 uur?"], naGoed: ["Na de 12 begint de klok weer bij de 1."], samen: ["Na de 12 komt de {1:oranje}, in het oranje rondje.", "Zo laat is het straks."],
    fouten: {
      "11 uur": F("plus-min-verwisseld", "bonus-min", "ging 1 uur terug in plaats van 1 uur vooruit", ["Je ging terug in de tijd.", "Dat is eerder, niet later."], ["We zoeken een tijd die later is. Ga verder, de kant op van de blauwe pijl.", "Straks is het later dan nu. Kijk maar naar de blauwe pijl."], "pijl-12-1"),
      "12 uur": F("een-te-weinig", "bonus-nul", "bleef bij de tijd van nu, 1 uur te weinig verder", ["Dat is de tijd van nu.", "Zo laat is het nu."], ["Straks is het later dan nu. Begin bij de 12 en ga met de klok mee.", "De kleine wijzer blijft niet staan. Hij gaat verder, met de klok mee."], "geen"),
    },
  },
];

/** Samen voordoen na de 2e fout (nu pas het antwoord). Varianten; de les kiest er 1. */
export const VOORDOEN = {
  /** Een klok lezen: stukken van 2 zinnen. Bij 12 uur staan de 2 wijzers op hetzelfde getal. */
  klok: (uur: number): string[][] =>
    uur === 12
      ? [
          [`Kijk, de 2 wijzers wijzen allebei naar de ${o(12)}. Dat zie je in het oranje rondje.`, "Dus het is 12 uur."],
          [`De kleine wijzer en de grote wijzer staan allebei op de ${o(12)}. Kijk maar in het oranje rondje.`, "Dus het is 12 uur."],
        ]
      : [
          [`Kijk, de kleine wijzer wijst naar de ${o(uur)}, in het oranje rondje.`, `De grote wijzer staat op de {12:paars}. Dus het is ${o(uur)} uur.`],
          [`De punt van de kleine wijzer staat bij de ${o(uur)}.`, `De grote wijzer wijst recht omhoog. Dus het is ${o(uur)} uur.`],
          [`Kijk, in het oranje rondje staat de ${o(uur)}. Daar wijst de kleine wijzer naar.`, `Het is dus ${o(uur)} uur.`],
        ],
  /** Naar welk getal wijst de kleine wijzer? */
  getal: (uur: number) => [`De punt van de kleine wijzer staat bij de ${o(uur)}, in het oranje rondje.`, `Kijk, de kleine wijzer wijst naar de ${o(uur)}, in het oranje rondje.`, `In het oranje rondje staat de ${o(uur)}. Daar wijst de kleine wijzer naar.`],
  /** De kleine stap: het kind tikt zelf op het antwoord (alleen die knop staat er nog). Zonder het antwoord nog eens te noemen. */
  tik: ["Tik nu zelf op het antwoord.", "Nu jij! Tik op het antwoord.", "Tik jij het antwoord nu aan?"],
};

/* ---------- kiezen: nooit 2 keer hetzelfde (zuiver; de les en het fouttabel-script gebruiken dezelfde functies) ---------- */

/** Woorden die wisselen in dezelfde zin ("links" en "rechts"): tellen voor de kiezer als dezelfde zin. */
export const WISSEL = ["links", "rechts"] as const;
const VORM = maakVorm(WISSEL);
export const nieuweKiezer = (toeval?: () => number): Kiezer => maakKiezer({ wissel: WISSEL, toeval });

/** Zonder kleurcode: {12:paars} wordt 12. */
export const kaal = (z: string) => z.replace(/\{([^}:]+):[a-zA-Z]+\}/g, "$1");
/** De losse zinnen in een stuk tekst. */
export const losseZinnen = (z: string) => kaal(z).split(/(?<=[.!?])\s+/).filter(Boolean);
export const getallenIn = (z: string): string[] => kaal(z).match(/\d+/g) ?? [];
/** Hoort een getal 2 keer vlak achter elkaar? (De laatste zin van `voor` en de eerste zin van `na` noemen hetzelfde getal.) */
export function getalDubbel(voor: string, na: string): boolean {
  const a = getallenIn(losseZinnen(voor).at(-1) ?? "");
  const b = getallenIn(losseZinnen(na)[0] ?? "");
  return a.some((n) => b.includes(n));
}

/** Harde eis: deze zinnen zijn bij deze vraag al gezegd, of noemen het getal van net nog eens → uit de lijst (blijft er niets over: de hele lijst). */
function zonder(zinnen: readonly string[], al: readonly string[], voor = ""): string[] {
  const gezegd = new Set(al.map(VORM));
  const stap1 = zinnen.filter((z) => !gezegd.has(VORM(z)));
  const basis = stap1.length ? stap1 : [...zinnen];
  const stap2 = voor ? basis.filter((z) => !getalDubbel(voor, z)) : basis;
  return stap2.length ? stap2 : basis;
}

/** Zo lang mag 1 stuk in het tekstvak zijn (tekens zonder kleurcode); zo lang waren de langste oude stukken. */
export const MAX = { eerste: 60, zin: 91, samenStuk: 95, zetFout1: 98, zetFout2: 176, klokVoordoen: 113, start: 121 };

/**
 * Wat Bliepo zegt als een antwoord niet goed is. `eerder` = de denkfout van de 1e keer bij deze vraag; `al` = wat Bliepo
 * bij deze vraag al zei (die zinnen komen niet nog eens). `onduidelijk` geeft een zin uit het vaste rijtje (§10).
 *   - 1e keer: de eerste zin en de hint.
 *   - 2e keer, dezelfde denkfout: vriendelijk "weer" en een ANDERE uitleg.
 *   - 2e keer, een nieuwe denkfout: een eerste zin (een andere dan de 1e keer) en 1 korte uitleg.
 */
export function foutReactie(k: Kiezer, f: Fout, poging: 1 | 2, eerder: Fout | null, al: readonly string[], onduidelijk: () => string): string[] {
  const eerste = () => (f.eerste.length ? k.kies("eerste", zonder(f.eerste, al)) : onduidelijk());
  if (poging === 1) {
    const e = eerste();
    return [e, k.kies("hint", zonder(f.hint, al, e), (z) => !deeltStuk(e, z, 3))];
  }
  const uit = UITLEG[f.soort];
  if (!uit) {
    const e = eerste();
    return [e, k.kies("hint", zonder(f.hint, al, e))];
  }
  if (eerder !== null && eerder.soort === f.soort) {
    const w = uit.weer.length ? k.kies("weer", zonder(uit.weer, al)) : "";
    const a = k.kies("anders", zonder(uit.anders, al, w), (z) => !w || !deeltStuk(w, z, 3));
    return w ? [w, a] : [a];
  }
  const e = eerste();
  return [e, k.kies("uitleg", zonder(uit.uitleg, al, e), (z) => !deeltStuk(e, z, 3))];
}

/** De vraag opnieuw na de hint: een variant, maar nooit precies de vraag van de 1e keer, en geen getal dat net klonk. */
export function vraagOpnieuw(k: Kiezer, v: Vraag, al: readonly string[]): string {
  const voor = al.at(-1) ?? "";
  return k.kies("opnieuw", zonder(v.opnieuw, [v.vraag.join(" ")], voor), (z) => !deeltStuk(voor, z, 3));
}

/** Samen doen bij zetten, na de uitleg: waar het getal staat, en dan tikt het kind zelf. `voor` = wat Bliepo net zei. */
export function zetSamen(k: Kiezer, doel: number, voor: readonly string[]): string[] {
  const laatste = voor.at(-1) ?? "";
  const hier = VAR.zetHier(doel);
  const lijstHier = hier.metGetal.some((z) => getalDubbel(laatste, z)) ? hier.zonderGetal : [...hier.metGetal, ...hier.zonderGetal];
  const z = k.kies("zetHier", lijstHier, (x) => !deeltStuk(laatste, x, 2));
  return [z, k.kies("zetTik", VAR.zetTik)];
}

/** De kleine stap na het samen voordoen. */
export const kleineStap = (k: Kiezer, voor: string) => k.kies("kleineStap", VOORDOEN.tik, (z) => !deeltStuk(voor, z, 2));

/** Een stuk van meer zinnen kiezen (string[][]). */
export function kiesStuk(k: Kiezer, sleutel: string, stukken: readonly (readonly string[])[]): string[] {
  return k.kies(sleutel, stukken.map((s) => s.join("\n"))).split("\n");
}

export function vraagMet(id: string): Vraag {
  const v = [...UITLEGVRAGEN, ...KLOKVRAGEN, ...EXTRAVRAGEN].find((x) => x.id === id);
  if (!v) throw new Error(`Geen vraag met id ${id}`);
  return v;
}
