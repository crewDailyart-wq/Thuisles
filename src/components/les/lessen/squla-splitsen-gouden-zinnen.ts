/**
 * ALLE ZINNEN VAN BLIEPO in de gouden les Splitsen (squla-splits-splitsen1-1-gouden, 9 november 2026), op één plek,
 * met de FOUTTABEL. De les zelf (squla-splitsen-gouden.tsx) bevat geen eigen zinnen.
 *
 *   - De rijtjes (lof, momenten, naam, goed na een fout, einde, eerste zin als de denkfout niet duidelijk is,
 *     aanmoedigen, overgang) zijn dezelfde als in de gouden klokles en de gouden les Tellen (BLIEPO-KARAKTER.md). Hier
 *     alleen de reactie bij Splitsen (BLIEPO-KARAKTER.md §4, zin 21, 23 en 25, plus 2 zinnen zonder "Ja").
 *   - De inhoud (15 vragen, getallen, voorwerpen) is die van squla-splits-splitsen1-1 (BOUWREGELS 15.22).
 *   - De soort reactie volgt het draaiboek Splitsen (Part Part Whole, SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/splitsen.md
 *     §3 en §7): Bliepo zegt wat er nu in het vak ligt en waar het kind moet kijken; bij de huisjes met een leeg vakje
 *     rekent hij voor ("4 en 3 is samen 7. We zoeken 6."). Het tienvak (doos van 10 met een doek) heeft Synthesis niet:
 *     daar zijn de hints EIGEN INVULLING, NIET VAN SYNTHESIS (15.22 punt 5).
 *
 * 18 november 2026 (Sara: Bliepo klinkt als een warme juf; zelfde aanpak als de proefles Tellen): elke zin is nagelopen
 * (kort, gewone woorden, lief, nooit "fout", een getal nooit 2 keer achter elkaar, opdrachtzinnen helder; 15.36) en elke
 * situatie die terugkomt heeft varianten: 3 tot 5 voor reacties en aanmoediging, 2 of 3 voor instructies en samen
 * voordoen. De les kiest met de gedeelde kiezer (nooit-dubbel.ts): nooit dezelfde zin 2 keer achter elkaar, ook niet over
 * vragen heen. Getal, antwoord en betekenis zijn niet veranderd. Oud naast nieuw: WIJZIGINGEN-ZINNEN-SPLITSEN.md.
 * Een lijst (string[]) = varianten: de les kiest er 1.
 *
 * Leesbare versie: FOUTTABEL-squla-splits-splitsen1-1-gouden.md (maak hem opnieuw met
 * `npx tsx scripts/fouttabel-splitsen-gouden.ts`; dat script doet ook de verklapcontrole).
 * {3:paars} = een getal in de kleur van het paarse vak.
 */

import type { Rijtje } from "./squla-klok-gouden-zinnen";

export {
  AANMOEDIG,
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
  OVERGANG,
  metNaam,
  type Rijtje,
} from "./squla-klok-gouden-zinnen";

const rij = (zinnen: string[], robot: number[] = []): Rijtje => ({ zinnen, robot });

/** Een getal in de zin, in de kleur van het vak of de voorwerpen waar het naar verwijst (BOUWREGELS 2.1, 2.2). */
export const g = (n: number, k = "wit") => `{${n}:${k}}`;
/** Het eerste deel (paarse vak) en het tweede deel (oranje vak of zak): dezelfde kleuren als de oude les. */
export const KA = "paars";
export const KB = "oranje";

/* ---------- de voorwerpen ---------- */

const NAAM: Record<string, [string, string]> = {
  pion: ["pion", "pionnen"],
  voetbal: ["bal", "ballen"],
  tennisbal: ["bal", "ballen"],
  pingpongbal: ["pingpongbal", "pingpongballen"],
};
/** De woorden die per vraag wisselen (voor de kiezer: "Pak een pion …" en "Pak een bal …" zijn dezelfde zin). */
export const WISSELWOORDEN = ["pingpongballen", "pingpongbal", "pionnen", "pion", "ballen", "bal"];
/** "{3} pionnen", "{1} pion". */
export const aantal = (n: number, vw: string, k = "wit") => `${g(n, k)} ${n === 1 ? NAAM[vw][0] : NAAM[vw][1]}`;
export const meervoud = (vw: string) => NAAM[vw][1];
export const enkel = (vw: string) => NAAM[vw][0];
/** "ligt er {1}" / "liggen er {3}". */
const ligt = (n: number, k: string) => `${n === 1 ? "ligt" : "liggen"} er ${g(n, k)}`;
/** "ligt 1 pion" / "liggen 4 pionnen" (kind-test punt 11: "liggen er 4" klonk stroef). */
export const ligtDing = (n: number, vw: string, k: string) => `${n === 1 ? "ligt" : "liggen"} ${aantal(n, vw, k)}`;

/* ---------- de 15 vragen van squla-splits-splitsen1-1 (zelfde volgorde, getallen en voorwerpen) ---------- */

export type HuisVraag = { soort: "huis"; nr: number; id: string; tot: number; deel: number; vw: string; zak: boolean; links: boolean };
export type ParenVraag = { soort: "paren"; nr: number; id: string; paren: [number, number][] };
export type TienVraag = { soort: "tienvak"; nr: number; id: string; zicht: number };
export type Sleepvraag = HuisVraag | ParenVraag | TienVraag;

const huis = (nr: number, tot: number, deel: number, vw = "pion", o: { zak?: boolean; links?: boolean } = {}): HuisVraag => ({
  soort: "huis",
  nr,
  id: `vraag${nr}-${tot}-${deel}-${vw}${o.zak ? "-zak" : ""}`,
  tot,
  deel,
  vw,
  zak: !!o.zak,
  links: o.links ?? true,
});
const paren = (nr: number, p: [number, number][]): ParenVraag => ({ soort: "paren", nr, id: `vraag${nr}-paren-${p.flat().join("")}`, paren: p });
const tien = (nr: number, zicht: number): TienVraag => ({ soort: "tienvak", nr, id: `vraag${nr}-tienvak-${zicht}`, zicht });

export const VRAGEN: Sleepvraag[] = [
  huis(1, 5, 2),
  huis(2, 9, 6),
  huis(3, 7, 3),
  huis(4, 6, 4),
  huis(5, 10, 8),
  huis(6, 7, 4, "voetbal", { zak: true }),
  huis(7, 6, 5, "voetbal", { zak: true }),
  huis(8, 9, 6, "voetbal", { zak: true, links: false }),
  huis(9, 8, 3, "voetbal", { zak: true, links: false }),
  paren(10, [[5, 1], [6, 4], [8, 5]]),
  tien(11, 7),
  tien(12, 9),
  tien(13, 4),
  tien(14, 5),
  tien(15, 3),
];

/** Waar het tweede deel heen gaat: het oranje vak, of de zak. */
export const tweedeVak = (v: HuisVraag) => (v.zak ? "de zak" : "het oranje vak");
export const eersteVak = (v: HuisVraag) => (v.zak ? "het paarse vak naast de zak" : "het paarse vak");

/**
 * De opdracht (inhoud van Squla; 15.26: "stuk" → "vakje", "leg" → "sleep", "de zak, in het oranje vak"; zie
 * KEUZES-VOOR-SARA.md Ronde 21). `keer` = hoeveelste opdracht van deze soort (0 = de eerste). De eerste keer(en) de hele
 * opdracht; daarna korter en afwisselend (kind-test Splitsen punt 17: 9 keer dezelfde lange zin). Getallen en wat het
 * kind moet doen blijven gelijk. 18 nov 2026 (15.36): de korte versies zijn gewone juf-zinnen geworden, "missen" werd
 * "ontbreken", en bij de doos zegt de opdracht wat het kind echt doet (zoveel ballen slepen als er onder de doek liggen).
 */
export function opdracht(v: Sleepvraag, keer = 0): string[] {
  if (v.soort === "huis") {
    const T = aantal(v.tot, v.vw);
    const D = aantal(v.deel, v.vw, KA);
    const rest = v.zak ? "de rest in de zak" : "de rest naar het oranje vak";
    /* Korter op 10 nov 2026 (15.26, KEUZES Ronde 29): "Sleep 4 ballen naar het paarse vak naast de zak. De andere ballen
       sleep je in de zak, in het oranje vak." was te lang voor het vaste tekstvak (Bliepo werd kleiner, 15.30). */
    if (v.zak && keer === 0) return [`Er zijn ${T}.`, `Sleep ${D} naar het paarse vak.`, `De andere ${meervoud(v.vw)} gaan in de zak, in het oranje vak.`];
    if (keer < 2 && !v.zak) return [`Er zijn ${T}.`, `Sleep ${D} naar het paarse vak.`, `De andere ${meervoud(v.vw)} sleep je naar het oranje vak.`];
    return [[`Nu ${T}. Sleep er ${g(v.deel, KA)} naar het paarse vak, ${rest}.`, `Kijk, ${T}. Sleep er ${g(v.deel, KA)} naar het paarse vak, ${rest}.`, `Deze keer zijn er ${T}. Sleep er ${g(v.deel, KA)} naar het paarse vak en ${rest}.`][keer % 3]];
  }
  if (v.soort === "paren") return ["Elk huisje heeft nog een leeg vakje.", "Sleep in elk leeg vakje de ballen die nog ontbreken."];
  if (keer === 0) return [`In de doos liggen ${g(10)} pingpongballen.`, `Je ziet er ${g(v.zicht, KA)}.`, "De andere liggen onder de doek.", "Sleep net zoveel ballen naar het vak."];
  return [[`Nu zie je er ${g(v.zicht, KA)}. De rest ligt onder de doek. Sleep net zoveel ballen naar het vak.`, `Je ziet er ${g(v.zicht, KA)}. Hoeveel liggen er onder de doek? Sleep zoveel ballen naar het vak.`][keer % 2]];
}
/** Het begin van de opdracht na de 1e fout, in varianten (de kiezer neemt nooit 2 keer dezelfde). */
export const OPNIEUW_BEGIN = ["Probeer het nog eens.", "Nog 1 keer.", "Kom, nog 1 keer.", "Toe maar, nog 1 keer."];
/**
 * Na de 1e fout (draaiboek §3 F.2: daarna worden de vakken leeg en zegt de tutor de opdracht kort opnieuw; bij ons zonder
 * te wachten op de pijl, 15.27). `begin` = een zin uit OPNIEUW_BEGIN (of het nummer ervan).
 */
export function opnieuw(v: Sleepvraag, begin: number | string): string {
  const b = typeof begin === "string" ? begin : OPNIEUW_BEGIN[begin % OPNIEUW_BEGIN.length];
  /* Bij 1 over (vraag 7): "De rest gaat …" (enkelvoud, en niet "de andere" die verklapt dat het 1 is; keuring 11 nov 2026). */
  if (v.soort === "huis") return `${b} Sleep ${aantal(v.deel, v.vw, KA)} naar het paarse vak. ${v.tot - v.deel === 1 ? "De rest gaat" : "De andere gaan"} ${v.zak ? "in de zak" : "naar het oranje vak"}.`;
  if (v.soort === "paren") return `${b} Sleep in elk leeg vakje de ballen die nog ontbreken.`;
  return `${b} Hoeveel liggen er onder de doek? Sleep zoveel ballen naar het vak.`;
}

/* ---------- vaste zinnen van het verloop (draaiboek Splitsen §2; eigen woorden) ---------- */

export const ZIN = {
  /** Stap 1: eerst wat we in deze les doen (BOUWREGELS 4.3; kind-test punt 12), dan de startvraag (Ja / Nee). Varianten. */
  begin: ["Vandaag verdelen we pionnen en ballen over 2 vakken.", "We gaan pionnen en ballen verdelen over 2 vakken."],
  /* Korter gemaakt op 10 nov 2026 (15.26, KEUZES Ronde 29): groet + uitleg + vraag in 1 stuk paste niet in het vaste
     tekstvak (22 px te lang; op 1536 × 864 werd Bliepo kleiner). Was: "Kun jij een getal al in 2 delen splitsen? Bijvoorbeeld deze 5 pionnen." */
  start: `Kun jij deze ${aantal(5, "pion")} al splitsen?`,
  /** Stap 2a: Ja → de proef. Knop-uitleg: hoe je sleept (1 keer per les, 3.15). */
  proefBegin: "Fijn! Laat maar zien wat je kunt.",
  sleepUitleg: "Pak een pion met je vinger of de muis en sleep hem naar een vak.",
  proefGoed: "Je kunt het al. We gaan verder oefenen.",
  /** Stap 2a: 2 fouten in de proef → de hele les (draaiboek §3 A.4; het antwoord wordt niet gezegd). */
  /** Na de 1e fout in de proef blijven de dingen liggen (draaiboek §3 A.2): het kind schuift ze zelf goed. */
  proefOpnieuw: (v: HuisVraag) => `In het paarse vak horen ${aantal(v.deel, v.vw, KA)}. Schuif de ${meervoud(v.vw)} maar naar het goede vak.`,
  proefLastig: "Dit is nog lastig. Geeft niks! We kijken eerst samen hoe splitsen gaat.",
  /** Stap 2b: Nee. */
  /* "Dat geeft niet, we komen er wel." is de tekst van Synthesis (Part Part Whole), in het Nederlands (15.2). */
  nee: "Dat geeft niet, we komen er wel. We kijken eerst samen hoe splitsen gaat.",
  /* "Klaar met kijken? Tik dan op de blauwe pijl." en "Tik op de blauwe pijl als je het nog eens wilt proberen." zijn weg
     sinds 10 nov 2026: Bliepo praat door en het kind hoeft nooit op de pijl te tikken (BOUWREGELS 15.27; WEGGEHAALD.md). */

  /* Uitleg na Nee (draaiboek stap 7 t/m 10) met de 5 pionnen van het beginscherm (BOUWREGELS 14.21), maar als 1 en 4:
     vraag 1 is 2 en 3, en een afgerond uitlegvoorbeeld komt niet meteen terug als eerste opgave (3.23; kind-test punt 6). */
  uitlegHuis: `Dit is een splitshuisje. Onderin zijn 2 vakken. Daar komen de 2 delen in.`,
  uitlegEen: `Sleep ${g(1, KA)} pion naar het paarse vak.`, /* 1 in de kleur van het paarse vak (2.2; keuring 11 nov 2026) */
  uitlegEenKlaar: `Mooi, daar ligt ${g(1, KA)} pion.`,
  uitlegRest: "Sleep nu de andere pionnen naar het oranje vak.",
  /* Als iets op de verkeerde plek ligt (kind-test punt 2): zeggen wat er mis ligt; tikken op een pion in een vak legt hem terug. */
  uitlegAlInOranje: (n: number) => (n === 1 ? "Er ligt al een pion in het oranje vak. Tik erop, dan gaat hij terug naar boven." : "Er liggen al pionnen in het oranje vak. Tik erop, dan gaan ze terug naar boven."),
  uitlegTeVeelPaars: `In het paarse vak hoort maar ${g(1, KA)} pion. Tik op een pion in dat vak, dan gaat hij terug.`,
  /* Korte zin bij het handje als er iets verkeerd ligt (niet nog eens dezelfde lange zin; keuring punt 5). */
  handTerugOranje: "Tik op de pion in het oranje vak.",
  handTerugPaars: "Tik op een pion in het paarse vak.",
  handNaarPaars: `Sleep ${g(1, KA)} pion naar het paarse vak.`,
  uitlegPaarsLeeg: `Het paarse vak is leeg. Daar hoort ${g(1, KA)} pion in.`,
  uitlegVoordoen: "Kijk, ik doe het even voor.",
  uitlegRestKlaar: `Je hebt ${g(5)} gesplitst in ${g(1, KA)} en ${g(4, KB)}.`,
  /** Stap 7 (de vraag naar het totaal) en stap 8 (het totaal staat boven). */
  totaalVraag: "Hoeveel pionnen zijn er samen?",
  totaalGoed: "Ja, dat klopt!",
  totaalSamen: `Kijk: ${g(1, KA)} en ${g(4, KB)}. Samen zijn dat ${g(5)} pionnen.`,
  /** In 2 stukken (zelfde zinnen), zodat elk stuk in het vaste tekstvak past (15.30; omgezet 10 nov 2026). */
  totaalUitleg: [`De 2 delen zijn ${g(1, KA)} en ${g(4, KB)}. Samen maken ze ${g(5)}.`, "Alles samen heet het totaal. Dat staat boven in het dak."],
  /** Stap 10: kun je 5 ook anders splitsen? (zelf 2 delen zoeken) */
  andersVraag: `${g(5)} kun je splitsen in ${g(1, KA)} en ${g(4, KB)}. Dat kan ook anders! Zoek zelf een andere manier.`,
  andersAlGevonden: `Dat klopt, maar ${g(1, KA)} en ${g(4, KB)} hadden we al. Zoek een andere manier.`,
  andersLeegVak: "Sleep in allebei de vakken pionnen. Dan heb je 2 delen.",
  andersHelp: `Ik help je. Ik leg ${g(3, KA)} pionnen in het paarse vak. Sleep de andere naar het oranje vak.`,
  /** Na de hulp lukt het nog niet: Bliepo maakt het af en de les gaat door (geen eindeloze lus; kind-test punt 5). */
  andersAfmaken: `Kijk, ik maak het af: ${g(3, KA)} en ${g(2, KB)}. Samen is dat ook ${g(5)}.`,
  andersOmgedraaid: (a: number, b: number) => `Ja, je hebt de delen omgedraaid: ${g(a, KA)} en ${g(b, KB)}. Samen is dat ook ${g(5)}.`,
  andersGoed: (a: number, b: number) => `Ja, ${g(5)} kun je ook splitsen in ${g(a, KA)} en ${g(b, KB)}.`,
  andersKlaar: "Zo kun je een getal splitsen. Nu ga je zelf oefenen.",

  /* Hulphandje (15.19): 1 korte zin, de eerste keer per opdracht, met een aanmoediging ervoor. Varianten. */
  hand: (vw: string) => [`Pak een ${enkel(vw)} en sleep hem naar een vak.`, `Sleep een ${enkel(vw)} naar een vak.`, `Kies een ${enkel(vw)} en sleep hem naar een vak.`],
  handTien: ["Pak een bal en sleep hem naar het vak.", "Sleep een bal naar het vak."],
  /** Proef na een fout: de dingen liggen nog in de vakken; het handje wijst van het vak met te veel naar het andere vak. */
  schuifNaarAnder: (v: HuisVraag) => `Schuif een ${enkel(v.vw)} uit het paarse vak naar ${tweedeVak(v)}.`,
  schuifNaarPaars: (v: HuisVraag) => `Schuif een ${enkel(v.vw)} naar het paarse vak.`,
  /* Bij 1 over (samen voordoen, het antwoord mag dan in beeld): "de laatste bal" (enkelvoud; keuring 11 nov 2026). */
  handRest: (v: HuisVraag) => (v.tot - v.deel === 1 ? `Sleep de laatste ${enkel(v.vw)} naar ${tweedeVak(v)}.` : `Sleep de andere ${meervoud(v.vw)} naar ${tweedeVak(v)}.`),

  /* Samen voordoen na de 2e fout (15.11; draaiboek §3 F.6: de tutor zet 1 deel klaar, het kind zoekt het andere). */
  /** 5 versies die wisselen (5.10; warm, zoals de proefles Tellen). */
  samenHelp: ["Kom, we doen het samen.", "Weet je wat? We doen het samen.", "Geeft niks. We doen het samen.", "Ik help je even. We doen het samen.", "Kom, samen lukt het."],
  samenHuisDeel: (v: HuisVraag) => [`Ik leg er ${g(v.deel, KA)} in het paarse vak.`, `Eerst leg ik ${aantal(v.deel, v.vw, KA)} in het paarse vak.`],
  samenHuisRest: (v: HuisVraag) =>
    v.tot - v.deel === 1
      ? [`Sleep jij de laatste ${enkel(v.vw)} naar ${tweedeVak(v)}.`, `De laatste ${enkel(v.vw)} is voor jou. Sleep hem naar ${tweedeVak(v)}.`]
      : [`Sleep jij de andere ${meervoud(v.vw)} naar ${tweedeVak(v)}.`, `De andere ${meervoud(v.vw)} zijn voor jou. Sleep ze naar ${tweedeVak(v)}.`],
  /** Begint met "Samen" of "Kijk" (de test rekent daarop). Het totaal staat er 1 keer. */
  samenHuisKlaar: (v: HuisVraag) => [`Samen hebben we ${g(v.tot)} gesplitst in ${g(v.deel, KA)} en ${g(v.tot - v.deel, KB)}.`, `Samen is het gelukt: ${g(v.tot)} is ${g(v.deel, KA)} en ${g(v.tot - v.deel, KB)}.`, `Kijk, ${g(v.tot)} is ${g(v.deel, KA)} en ${g(v.tot - v.deel, KB)}. Dat hebben we samen gedaan.`],
  /* Vangnet (20 s niets gesleept bij het samen voordoen; LESRECEPT, geleerd bij Meer-minder): Bliepo legt de rest zelf.
     "Kijk, …", geen "Ja" en geen "samen" (keuring Meer-minder). */
  samenHuisZelf: (v: HuisVraag) => [`Kijk, ik leg de rest erbij. ${g(v.tot)} is ${g(v.deel, KA)} en ${g(v.tot - v.deel, KB)}.`, `Kijk, de rest leg ik in ${tweedeVak(v)}. ${g(v.tot)} is ${g(v.deel, KA)} en ${g(v.tot - v.deel, KB)}.`],
  samenTienDoek: (v: TienVraag) => {
    const wat = `${ligt(10 - v.zicht, KB).replace(" er ", " ")} ${10 - v.zicht === 1 ? "bal" : "ballen"}`;
    return [`Ik til de doek op. Daaronder ${wat}.`, `De doek gaat weg. Daaronder ${wat}.`];
  },
  samenTienRest: ["Ik leg ze bijna allemaal in het vak. Sleep jij de laatste erbij.", "Ik leg ze alvast in het vak. De laatste bal is voor jou. Sleep hem erbij."],
  /** Bij het hulphandje tijdens het samen voordoen: kort, niet nog eens de hele zin (18 nov 2026). */
  samenTienHand: "Sleep de laatste bal naar het vak.",
  samenTienKlaar: (v: TienVraag) => [`Samen hebben we het gevonden: ${g(10)} is ${g(v.zicht, KA)} en ${g(10 - v.zicht, KB)}.`, `Kijk, ${g(10)} is ${g(v.zicht, KA)} en ${g(10 - v.zicht, KB)}. Dat hebben we samen gedaan.`],
  samenTienZelf: (v: TienVraag) => [`Kijk, ik leg de laatste erbij. ${g(10)} is ${g(v.zicht, KA)} en ${g(10 - v.zicht, KB)}.`, `Kijk, de laatste bal leg ik in het vak. ${g(10)} is ${g(v.zicht, KA)} en ${g(10 - v.zicht, KB)}.`],
  /** 3 huisjes na elkaar: 3 versies, zodat Bliepo niet 3 keer dezelfde zin zegt. */
  samenParenHuis: (t: number, d: number) => [`In dit huisje staat ${g(t)} in het dak. In het vakje staat al ${g(d, KA)}.`, `Dit huisje heeft ${g(t)} in het dak en ${g(d, KA)} in het vakje ernaast.`, `Nu dit huisje: ${g(t)} in het dak, en ${g(d, KA)} staat er al.`],
  samenParenRest: ["Sleep jij de laatste bal erbij.", "De laatste bal is voor jou. Sleep hem erbij."],
  samenParenHand: "Sleep de laatste bal naar het lege vakje.",
  samenParenKlaar: ["Samen hebben we elk huisje vol gemaakt.", "Kijk, elk huisje is nu vol. Dat hebben we samen gedaan."],
  samenParenZelf: ["Kijk, ik leg de laatste bal erbij. Nu is elk huisje vol.", "Kijk, de laatste bal leg ik erbij. Nu zijn alle huisjes vol."],

  /* Einde (draaiboek stap 16). */
  slot: [`Je hebt getallen gesplitst tot wel ${g(10)}!`, `Wat heb jij goed gesplitst: getallen tot wel ${g(10)}!`, `Knap, hoor! Je hebt getallen tot ${g(10)} gesplitst.`],
  kaartTik: ["Tik op de kaart.", "Tik maar op de kaart.", "Kijk, een kaart voor jou! Tik erop."],
};

/** BLIEPO-KARAKTER.md §4 Splitsen: zin 21, 23 en 25, plus 2 zinnen zonder "Ja" (voor na een lofzin die al met "Ja" begint). */
export const SPLITSREACTIE = (tot: number, a: number, b: number) =>
  rij([`Ja, ${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(b, KB)}.`, `Ja, alle ${g(tot)} zijn verdeeld.`, `${g(tot)} kun je splitsen in ${g(a, KA)} en ${g(b, KB)}.`, `${g(a, KA)} en ${g(b, KB)} maken samen ${g(tot)}.`, `Zie je, ${g(tot)} is ${g(a, KA)} en nog ${g(b, KB)}.`], [4]);
export const SPLITSREACTIE_JA = [0, 1];
export const SPLITSREACTIE_ROBOT = 4;
/** Dezelfde 5 (zelfde plekken: 0 en 1 met "Ja", 4 de robotzin) met 3 zinnen erbij (18 nov 2026). */
export const SPLITSREACTIE_WARM = (tot: number, a: number, b: number) =>
  rij([...SPLITSREACTIE(tot, a, b).zinnen, `Precies, ${g(tot)} is ${g(a, KA)} en ${g(b, KB)}.`, `Dat klopt: ${g(a, KA)} en ${g(b, KB)} is samen ${g(tot)}.`, `Je hebt ${g(tot)} gesplitst in ${g(a, KA)} en ${g(b, KB)}.`], [4]);
/** Bij de 3 huisjes (vraag 10). */
export const PARENREACTIE = rij(["Ja, alle 3 huisjes kloppen.", "In elk huisje klopt het.", "Zie je, alle huisjes zijn vol.", "Alle 3 huisjes zijn goed gevuld."], [2]);
export const PARENREACTIE_JA = [0];
/** Aanmoediging bij het hulphandje (het kind moet slepen, niet nadenken; 14.35). 5 versies. */
export const AANMOEDIG_SLEPEN = ["Je bent goed bezig.", "Jij kunt dit.", "Geen haast, hoor.", "Het gaat goed zo.", "Probeer het maar."];

/* ---------- denkfouten (draaiboek Splitsen §7; namen voor de voortgang) ---------- */

export const DENKFOUTEN = ["een-te-veel", "een-te-weinig", "te-veel", "te-weinig", "omgedraaid", "alles-in-1-vak", "som-klopt-niet", "zichtbaar-gelegd", "totaal-als-deel", "deel-voor-totaal", "onduidelijk"] as const;
export type Denkfoutnaam = (typeof DENKFOUTEN)[number];

/** Alle varianten bij 1 fout antwoord; de les kiest er steeds 1 (nooit 2 keer achter elkaar dezelfde). */
export type Varianten = { eerste: string[]; hint: string[]; uitleg: string[]; weerEerste: string[]; weerUitleg: string[] };

export type Fout = {
  code: Denkfoutnaam;
  /** Welke "weer"-zin erbij hoort, als die per geval verschilt (alles in het paarse vak / alles in het andere vak). */
  soort?: string;
  denkfout: string;
  /** Bliepo's eerste zin: 1 vaste variant voor de fouttabel (leeg bij "onduidelijk": dan een zin uit BLIEPO-KARAKTER.md §10). */
  eerste: string;
  hint: string;
  /** Uitleg na de 2e fout (daarna meteen samen voordoen). */
  uitleg: string;
  /** Dezelfde denkfout 2 keer (en Bliepo zei de 1e keer echt wat er mis was): "weer" + een andere uitleg. */
  weer: string[];
  scherm: string;
  /** Waarom Bliepo de denkfout niet hardop noemt (zou het antwoord verklappen, 15.17). */
  noot?: string;
  /** Eigen invulling, niet van Synthesis (15.22 punt 5). */
  eigen?: boolean;
  /** Alle varianten (18 nov 2026); `eerste`, `hint`, `uitleg` en `weer` hierboven zijn er 1 van. */
  v?: Varianten;
};

/** Maakt de regel van de fouttabel: 1 vaste variant per vraagnummer (voor de tabel) en alle varianten (voor de les). */
function maak(nr: number, d: Omit<Fout, "eerste" | "hint" | "uitleg" | "weer" | "v"> & Varianten): Fout {
  const { eerste, hint, uitleg, weerEerste, weerUitleg, ...basis } = d;
  const vast = (l: string[]) => l[nr % l.length];
  return { ...basis, eerste: vast(eerste), hint: vast(hint), uitleg: vast(uitleg), weer: weerEerste.length ? [vast(weerEerste), vast(weerUitleg)] : [], v: { eerste, hint, uitleg, weerEerste, weerUitleg } };
}

const SCHERM_HUIS = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de pionnen schudden even en blijven liggen; daarna gaan de vakken leeg en zegt Bliepo de opdracht kort opnieuw";
const SCHERM_PROEF = "in de proef blijven de pionnen liggen (draaiboek §3 A.2): het kind schuift ze zelf goed";

/**
 * De hints bij een huisje, in varianten; ze wijzen naar het getal onder het paarse vak (de opdracht zelf), nooit naar het
 * andere deel. "1 voor 1" werd "stuk voor stuk" (het getal 1 stond 2 keer achter elkaar). Geen "Probeer het nog eens":
 * daar begint de opdracht na de hint al mee.
 */
const HINT_PAARS = [
  (v: HuisVraag) => `Kijk naar het getal onder het paarse vak. Zoveel ${meervoud(v.vw)} horen erin.`,
  (v: HuisVraag) => `Onder het paarse vak staat een getal. Zoveel ${meervoud(v.vw)} horen in dat vak.`,
  (v: HuisVraag) => `Tel de ${meervoud(v.vw)} in het paarse vak nog eens. Kijk dan naar het getal eronder.`,
  (v: HuisVraag) => `Wijs de ${meervoud(v.vw)} in het paarse vak stuk voor stuk aan. Het getal eronder zegt hoeveel erin horen.`,
];

/** Hetzelfde foute antwoord 2 keer bij een huisje: "weer", in 3 versies (slepen: "legde", niet "koos"; 14.35). */
export const weerGelegd = (p: number, vw: string) => [`Er ${p === 1 ? "ligt" : "liggen"} weer ${aantal(p, vw, KA)} in het paarse vak.`, `Weer ${aantal(p, vw, KA)} in het paarse vak, zie ik.`, `Je legde weer ${aantal(p, vw, KA)} in het paarse vak.`];

/**
 * De fouttabel van een huisje (vraag 1 t/m 9): wat ligt er in het paarse vak (`p`)? Alle dingen liggen in een vak,
 * dus in het andere vak ligt de rest. Het antwoord dat het kind zelf moet vinden is het andere deel (het "?").
 */
export function huisFout(v: HuisVraag, p: number): Fout {
  const { tot, deel, vw } = v;
  const rest = tot - deel;
  const mv = meervoud(vw);
  const ander = tweedeVak(v);
  /* Bij 1 ding in het paarse vak geen "Tel de pionnen … nog eens" of "Wijs ze stuk voor stuk aan". */
  const hints = HINT_PAARS.slice(0, p === 1 ? 2 : 4).map((h) => h(v));
  if (p === tot)
    return maak(v.nr, {
      code: "alles-in-1-vak",
      soort: "alles-paars",
      denkfout: "alles in 1 vak gelegd; het andere vak bleef leeg",
      eerste: [`Alle ${aantal(tot, vw)} liggen in het paarse vak.`, `Je legde alle ${aantal(tot, vw)} in het paarse vak.`, `Nu liggen alle ${aantal(tot, vw)} in het paarse vak.`],
      /* "De rest gaat …" past bij 1 en bij meer (vraag 7 heeft 1 bal over; "De andere bal" zou verklappen dat het er 1 is; keuring 11 nov 2026). */
      hint: [
        `Er komen 2 delen. Kijk naar het getal onder het paarse vak. ${rest === 1 ? `De rest gaat naar ${ander}.` : `De andere ${mv} gaan naar ${ander}.`}`,
        `We maken 2 delen. Het getal onder het paarse vak zegt hoeveel daar horen. De rest gaat naar ${ander}.`,
        `Splitsen doe je in 2 delen. Kijk naar het getal onder het paarse vak. De rest gaat naar ${ander}.`,
      ],
      uitleg: [`Splitsen is in 2 delen verdelen. In allebei de vakken komen ${mv}.`, `Bij splitsen maak je 2 delen. Elk vak krijgt ${mv}.`],
      weerEerste: ["Ze liggen weer allemaal in het paarse vak.", "Weer alles in het paarse vak, zie ik.", `Er ligt weer niets in ${ander}.`],
      weerUitleg: [`In het paarse vak horen er maar ${g(deel, KA)}. De rest hoort in ${ander}.`, `Onder het paarse vak staat ${g(deel, KA)}. Zoveel horen er daar. De rest hoort in ${ander}.`],
      scherm: SCHERM_HUIS,
    });
  if (p === 0) {
    const waar = v.zak ? "in de zak" : "in het oranje vak";
    return maak(v.nr, {
      code: "alles-in-1-vak",
      soort: "alles-ander",
      denkfout: "alles in 1 vak gelegd; het paarse vak bleef leeg",
      eerste: [`Alle ${mv} liggen ${waar}. Het paarse vak is leeg.`, `Je legde alle ${mv} ${waar}. Het paarse vak is nog leeg.`, `Het paarse vak is nog leeg. Alle ${mv} liggen ${waar}.`],
      hint: ["Begin bij het paarse vak. Kijk naar het getal eronder.", `Het paarse vak krijgt ook ${mv}. Kijk naar het getal eronder.`, `Kijk naar het getal onder het paarse vak. Zoveel ${mv} horen daar.`],
      uitleg: [`Splitsen is in 2 delen verdelen. In allebei de vakken komen ${mv}.`, `Bij splitsen maak je 2 delen. Elk vak krijgt ${mv}.`],
      weerEerste: ["Het paarse vak is weer leeg.", "Er ligt weer niets in het paarse vak.", "Weer een leeg paars vak, zie ik."],
      weerUitleg: [`Het getal onder het paarse vak zegt dat er ${g(deel, KA)} in horen.`, `Onder het paarse vak staat ${g(deel, KA)}. Zoveel horen er daar.`],
      scherm: SCHERM_HUIS,
    });
  }
  if (p === rest && rest !== deel)
    return maak(v.nr, {
      code: "omgedraaid",
      denkfout: "de 2 delen omgedraaid (het getal van het paarse vak in het andere vak)",
      eerste: [`In het paarse vak ${ligtDing(p, vw, KA)}.`, `Je legde ${aantal(p, vw, KA)} in het paarse vak.`, `Ik tel ${aantal(p, vw, KA)} in het paarse vak.`],
      hint: hints,
      uitleg: [`Het getal onder het paarse vak hoort bij het paarse vak. Daar horen ${aantal(deel, vw, KA)} in.`, `Onder het paarse vak staat ${g(deel, KA)}. Zoveel ${mv} horen daar.`],
      weerEerste: [],
      weerUitleg: [],
      scherm: SCHERM_HUIS,
      noot: "Bliepo zegt niet dat de delen omgedraaid zijn: dan weet het kind meteen wat er in het andere vak moet",
    });
  const meer = p > deel;
  const een = Math.abs(p - deel) === 1;
  const teVeel = meer ? "veel" : "weinig";
  /* Bij 1 ding in het vak: enkelvoud, en het getal 1 niet 2 keer achter elkaar ("ligt 1 pion. Dat is er 1 te weinig."). */
  const eerste =
    p === 1
      ? [`In het paarse vak ${ligtDing(p, vw, KA)}. Dat is te weinig.`, `Je legde ${aantal(p, vw, KA)} in het paarse vak. Dat is te weinig.`, `${aantal(p, vw, KA)} in het paarse vak? Dat is te weinig.`]
      : een
        ? [
            `In het paarse vak ${ligtDing(p, vw, KA)}. Dat is er ${g(1, KA)} te ${teVeel}.`,
            `Je legde ${aantal(p, vw, KA)} in het paarse vak. Dat is er ${g(1, KA)} te ${teVeel}.`,
            `Bijna! Er ligt ${g(1, KA)} ${enkel(vw)} te ${teVeel} in het paarse vak.`,
            `${aantal(p, vw, KA)} in het paarse vak? Dat is er net ${g(1, KA)} te ${teVeel}.`,
          ]
        : [
            `In het paarse vak ${ligtDing(p, vw, KA)}. Dat zijn er te ${teVeel}.`,
            `Je legde ${aantal(p, vw, KA)} in het paarse vak. Dat zijn er te ${teVeel}.`,
            `${aantal(p, vw, KA)} in het paarse vak? Dat zijn er te ${teVeel}.`,
            `Ik tel ${aantal(p, vw, KA)} in het paarse vak. Dat zijn er te ${teVeel}.`,
          ];
  return maak(v.nr, {
    code: een ? (meer ? "een-te-veel" : "een-te-weinig") : meer ? "te-veel" : "te-weinig",
    denkfout: een ? `1 ${enkel(vw)} ${meer ? "te veel" : "te weinig"} in het paarse vak (verkeerd geteld)` : `${meer ? "te veel" : "te weinig"} ${mv} in het paarse vak`,
    eerste,
    hint: hints,
    uitleg: [`Het getal onder het paarse vak zegt hoeveel ${mv} erin horen: ${g(deel, KA)}.`, `Onder het paarse vak staat ${g(deel, KA)}. Zoveel ${mv} horen erin.`, `In het paarse vak horen ${aantal(deel, vw, KA)}. Dat zegt het getal eronder.`],
    weerEerste: [`Weer te ${teVeel} in het paarse vak.`, `Het zijn er weer te ${teVeel} in het paarse vak.`, `Weer te ${teVeel}, zie ik.`],
    weerUitleg: [`Er horen er precies ${g(deel, KA)} in. Dat is het getal eronder.`, `Onder het paarse vak staat ${g(deel, KA)}. Precies zoveel horen erin.`],
    scherm: SCHERM_HUIS,
  });
}
export const SCHERM_PROEF_NOOT = SCHERM_PROEF;

/**
 * De eerste zin als het kind er precies 1 naast zit (doos), in 5 versies (zoals de proefles Tellen; "6 is dichtbij." was te
 * kaal). Geen richting: "1 te veel" of "1 te weinig" verklapt het antwoord (15.17). Waar voor elk antwoord dat precies 1
 * naast het goede ligt.
 */
const DICHTBIJ = [(N: string) => `Je legde er ${N}. Je zit er dichtbij.`, (N: string) => `Je legde er ${N}. Dat scheelt niet veel.`, (N: string) => `Bijna! ${N} is het net niet.`, (N: string) => `${N} ballen? Dat is heel dichtbij.`, (N: string) => `Je legde er ${N}. Het is bijna goed.`];
/** De uitleg bij de 2e fout bij de doos, in 3 versies (het getal 10 staat er 1 keer). */
const UITLEG_DOEK = [`In de doos passen er ${g(10)}. Onder de doek liggen de ballen die nog ontbreken.`, `Een volle doos heeft ${g(10)} ballen. Onder de doek liggen de ballen die je niet ziet.`, `De ballen die je ziet en de ballen onder de doek zijn samen ${g(10)}.`];
/** Woorden waarmee Bliepo zegt dat het bijna goed was. Bij 1 vraag komt zo'n woord hooguit 1 keer (keuring 11 nov). */
const KERN = /dichtbij|bijna|scheelt/gi;
export const zelfdeKern = (a: string, b: string) => {
  const A = new Set((a.match(KERN) ?? []).map((w) => w.toLowerCase()));
  return (b.match(KERN) ?? []).some((w) => A.has(w.toLowerCase()));
};
/**
 * Wat Bliepo bij de 2e fout als eerste zin mag zeggen als het kind iets ANDERS fout deed dan de 1e keer: elke variant van de
 * eerste zin, behalve die met een woord dat hij bij deze vraag al zei ("dichtbij", "bijna", "scheelt") en behalve de zin
 * die hij net zei. De les en het fouttabel-script gebruiken allebei deze functie.
 */
export function tweedeEerste(f: Fout, eersteZin: string): string[] {
  const alle = f.v?.eerste ?? [f.eerste];
  const over = alle.filter((z) => z !== eersteZin && !zelfdeKern(eersteZin, z));
  return over.length ? over : alle;
}
/** Twee keer 1 ernaast bij dezelfde doos (bijvoorbeeld eerst 2 en dan 4): een andere versie, zonder hetzelfde woord. Bewaard voor het fouttabel-script; de les kiest met `tweedeEerste`. */
export const dichtbijAnders = (n: number, v: TienVraag) => {
  const f = tienFout(v, n);
  return tweedeEerste(f, f.eerste)[0];
};
/** Hetzelfde aantal 2 keer bij de doos. */
export const weerGelegdTien = (n: number) => [`Je legde er weer ${g(n, KB)}.`, `Weer ${g(n, KB)} ${n === 1 ? "bal" : "ballen"}, zie ik.`, `Er ${n === 1 ? "ligt" : "liggen"} weer ${g(n, KB)} ${n === 1 ? "bal" : "ballen"} in het vak.`];

/**
 * De fouttabel van het tienvak (vraag 11 t/m 15): hoeveel ballen legde het kind in het vak (`n`)? EIGEN INVULLING, NIET
 * VAN SYNTHESIS (Part Part Whole heeft geen doos met een doek). Het antwoord is het aantal onder de doek: "1 te veel"
 * of "1 te weinig" zou dat verklappen, dus dan zegt Bliepo alleen dat het dichtbij is (zoals de gouden les Tellen).
 */
export function tienFout(v: TienVraag, n: number): Fout {
  const z = v.zicht;
  const r = 10 - z;
  const N = g(n, KB);
  const ballen = n === 1 ? "bal" : "ballen";
  const SCHERM = "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de ballen schudden even; daarna gaat het vak leeg en zegt Bliepo de opdracht kort opnieuw";
  /* De doek is 1 lap: de plekken eronder zie je niet apart. Daarom: aanvullen tot 10 (zonder het antwoord).
     "Tel door vanaf 9 tot 10" (1 of 2 onder de doek) en "2 rijen van 5" (5 onder de doek) zouden het antwoord geven. */
  const DOOR = `In de doos passen er ${g(10)}. Tel door vanaf ${g(z, KA)}.`;
  const ZIE = `Tel de ballen die je ziet. Tel dan door tot ${g(10)}.`;
  const RIJEN = `Een volle doos heeft 2 rijen van ${g(5)}. Hoeveel ballen zie je niet?`;
  const ERBIJ = `Tel eerst de ballen die je ziet. Hoeveel komen er nog bij tot ${g(10)}?`;
  const tel = r === 5 ? [DOOR, ZIE, ERBIJ] : r <= 2 ? [ZIE, ERBIJ] : [DOOR, ZIE, RIJEN, ERBIJ];
  const basis = { scherm: SCHERM, eigen: true as const };
  if (n === 10)
    return maak(v.nr, {
      ...basis,
      code: "totaal-als-deel",
      denkfout: "legde alle 10 ballen (het totaal) in plaats van alleen de ballen onder de doek",
      eerste: [`Je legde er ${N}. Zoveel passen er in de hele doos.`, `${N} ballen? Zoveel passen er in de hele doos.`, `Je legde er ${N}. Dat is de hele doos vol.`],
      hint: ["Een paar ballen zie je al. Wij zoeken alleen de ballen onder de doek.", "Kijk naar de doos. Een paar ballen zie je al. Hoeveel liggen er onder de doek?"],
      uitleg: [`In de doos passen er ${g(10)}. ${g(z, KA)} zie je al. Het vak is alleen voor de ballen onder de doek.`, `De hele doos heeft ${g(10)} ballen. ${g(z, KA)} zie je al. De rest ligt onder de doek.`],
      weerEerste: ["Dat is weer de hele doos.", "Weer de hele doos, zie ik.", "Je legde weer alle ballen in het vak."],
      weerUitleg: [`${g(z, KA)} ballen zie je al. In het vak horen alleen de ballen die nog ontbreken tot ${g(10)}.`, `${g(z, KA)} ballen zie je al. Met de ballen onder de doek zijn het er samen ${g(10)}.`],
    });
  if (n === z)
    return maak(v.nr, {
      ...basis,
      code: "zichtbaar-gelegd",
      denkfout: "legde net zoveel als hij al zag (de ballen boven de doek)",
      eerste: [`Je legde er ${N}. Zoveel ballen zie je al in de doos.`, `${N} ${ballen}? Zoveel zie je er al in de doos.`, `Je legde er ${N}. Dat zijn de ballen die je al ziet.`],
      hint: ["Wij zoeken de ballen die je niet ziet. Die liggen onder de doek.", "Kijk naar de doek. Daaronder liggen de ballen die we zoeken."],
      uitleg: ["De ballen die je ziet, liggen al in de doos. Het vak is voor de ballen onder de doek.", "Wat je ziet, ligt al in de doos. In het vak komen net zoveel ballen als onder de doek."],
      weerEerste: ["Weer net zoveel als je ziet.", "Dat zijn weer de ballen die je al ziet.", "Je legde er weer net zoveel als je ziet."],
      weerUitleg: [`Onder de doek liggen de ballen die nog ontbreken tot ${g(10)}.`, `Met de ballen onder de doek zijn het er samen ${g(10)}.`],
    });
  if (Math.abs(n - r) === 1)
    return maak(v.nr, {
      ...basis,
      code: n > r ? "een-te-veel" : "een-te-weinig",
      denkfout: `1 bal ${n > r ? "te veel" : "te weinig"} (de plekken onder de doek verkeerd geteld)`,
      eerste: DICHTBIJ.map((d) => d(N)).filter((s) => n !== 1 || !/ballen\?/.test(s)),
      hint: tel,
      uitleg: UITLEG_DOEK,
      weerEerste: [],
      weerUitleg: [],
      noot: "richting niet genoemd: \"1 te veel\" of \"1 te weinig\" verklapt het antwoord",
    });
  const meer = n > r;
  const eerste =
    n === 1 /* enkelvoud bij 1 bal (keuring 11 nov 2026) */
      ? [`Je legde er ${N}. Dat is te weinig.`, `${N} bal? Dat is te weinig.`, `Je legde ${N} bal in het vak. Onder de doek liggen er meer.`]
      : meer
        ? [`Je legde er ${N}. Dat zijn er te veel.`, `${N} ballen? Dat zijn er te veel.`, `Je legde ${N} ballen in het vak. Dat zijn er te veel.`, `Ik tel ${N} ballen in het vak. Zo veel liggen er niet onder de doek.`]
        : [`Je legde er ${N}. Dat zijn er te weinig.`, `${N} ballen? Dat zijn er te weinig.`, `Je legde ${N} ballen in het vak. Dat zijn er te weinig.`, `Ik tel ${N} ballen in het vak. Onder de doek liggen er meer.`];
  return maak(v.nr, {
    ...basis,
    code: meer ? "te-veel" : "te-weinig",
    denkfout: `${meer ? "te veel" : "te weinig"} ballen in het vak`,
    eerste,
    hint: tel,
    uitleg: UITLEG_DOEK,
    weerEerste: [`Het zijn er weer te ${meer ? "veel" : "weinig"}.`, `Weer te ${meer ? "veel" : "weinig"}, zie ik.`, `Je legde er weer te ${meer ? "veel" : "weinig"}.`],
    weerUitleg: [`Je ziet er ${g(z, KA)}. Onder de doek liggen de ballen die nog ontbreken tot ${g(10)}.`, `Je ziet er ${g(z, KA)}. Met de ballen onder de doek zijn het er samen ${g(10)}.`],
  });
}

/**
 * De fouttabel van de 3 huisjes (vraag 10): wat ligt er in elk leeg vakje (`tel`)? Draaiboek §3 F.2 (`som-klopt-niet`):
 * Bliepo rekent het eerste huisje dat niet klopt voor ("4 en 3 is samen 7. We zoeken 6.") en noemt nooit het getal dat
 * erin moet. Dat huisje krijgt een rondje; daarom mag Bliepo "dit huisje" zeggen.
 */
export function parenFout(v: ParenVraag, tel: number[]): Fout {
  const rests = v.paren.map(([t, d]) => t - d);
  const i = Math.max(0, tel.findIndex((c, j) => c !== rests[j]));
  const [t, d] = v.paren[i];
  const c = tel[i] ?? 0;
  return maak(v.nr, {
    code: "som-klopt-niet",
    denkfout: "in een huisje zijn het getal en de ballen samen niet het getal in het dak",
    eerste:
      c === 0
        ? [`In het huisje met ${g(t)} is het vakje nog leeg.`, `Het huisje met ${g(t)} heeft nog een leeg vakje.`]
        : [`Bij het huisje met ${g(t)}: ${g(d, KA)} en ${g(c, KB)} is samen ${g(d + c)}. We zoeken ${g(t)}.`, `Even rekenen bij dit huisje: ${g(d, KA)} en ${g(c, KB)} is samen ${g(d + c)}. We zoeken ${g(t)}.`, `In dit huisje is ${g(d, KA)} en ${g(c, KB)} samen ${g(d + c)}. In het dak staat ${g(t)}.`],
    hint: ["Kijk ook naar de andere huisjes. Tel bij elk huisje door tot het getal in het dak.", "Begin bij het getal in het vakje ernaast en tel door tot het getal in het dak.", "Doe het huisje voor huisje. Het getal ernaast en de ballen zijn samen het getal in het dak."],
    uitleg: ["In elk huisje zijn het getal ernaast en de ballen samen het getal in het dak.", "Het getal in het vakje en de ballen ernaast zijn samen het getal in het dak."],
    weerEerste: [`Bij het huisje met ${g(t)} klopt het weer niet.`, `Het huisje met ${g(t)} klopt weer niet.`],
    /* Het getal van het dak staat al in de zin ervoor: hier niet nog een keer (was: "… moeten 6 zijn."). */
    weerUitleg: ["Het getal ernaast en de ballen moeten samen het getal in het dak zijn.", "Het getal in het vakje en de ballen zijn samen het getal in het dak."],
    scherm: "Bliepo's scherm 1,5 s rood (geen fout-geluidje); de ballen schudden even; daarna gaan de vakjes leeg en zegt Bliepo de opdracht kort opnieuw",
  });
}

/** De uitlegvraag "Hoeveel pionnen zijn er samen?" (draaiboek stap 7; de 2 delen en het totaal: 1 / 4 / 5). */
export const TOTAAL_KEUZES = [1, 4, 5];
export function totaalFout(x: number): Fout {
  const k = x === 1 ? KA : KB;
  const vak = x === 1 ? "paarse" : "oranje";
  return maak(x, {
    code: "deel-voor-totaal",
    denkfout: "koos 1 van de delen in plaats van alles samen",
    eerste: [`${g(x, k)} is het deel in het ${vak} vak.`, `Je koos ${g(x, k)}. Dat is het deel in het ${vak} vak.`, x === 1 ? `${g(x, k)}? Dat is alleen de pion in het ${vak} vak.` : `${g(x, k)}? Dat zijn alleen de pionnen in het ${vak} vak.`],
    hint: ["Ik bedoel alle pionnen samen. Tel de pionnen in allebei de vakken.", "Tel alle pionnen: die in het paarse vak en die in het oranje vak."],
    uitleg: ["Het totaal is alles samen: de pionnen in allebei de vakken.", "Het totaal zijn alle pionnen: die in het paarse en die in het oranje vak."],
    weerEerste: ["Dat is weer 1 van de delen.", "Je koos weer een deel.", "Weer een deel, zie ik."],
    weerUitleg: ["Het totaal zijn de pionnen in allebei de vakken samen.", "Bij het totaal horen de pionnen van allebei de vakken."],
    scherm: "Bliepo's scherm 1,5 s rood; de knoppen gaan even weg en komen terug met de hint (draaiboek §3 B.2)",
  });
}
/** Hetzelfde getal 2 keer gekozen bij "hoeveel samen?". */
export const weerGekozen = (x: number) => [`Je koos weer ${g(x, x === 1 ? KA : KB)}.`, `Je tikte weer op ${g(x, x === 1 ? KA : KB)}.`, `Weer ${g(x, x === 1 ? KA : KB)}, zie ik.`];

/* ---------- verklapcontrole (15.17), ook gebruikt door scripts/fouttabel-splitsen-gouden.ts ---------- */

/** Woorden die zeggen dat de delen omgedraaid zijn (dan weet het kind meteen het andere deel). */
export const OMDRAAIWOORDEN = /\b(omgedraaid|andersom|verwissel\w*|omgewisseld|wisselde|draaide|kanten)\b/i;
