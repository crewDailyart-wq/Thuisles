/**
 * Maakt FOUTTABEL-squla-tijd-dagen-1-gouden.md uit de code (squla-tijd-gouden-zinnen.ts), zodat de tabel altijd klopt met
 * de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.20, 14.22, 14.30, 15.17; LESRECEPT
 * "geleerd bij Tellen", "geleerd bij de keuring Huisnummers", "geleerd bij Geld", "geleerd bij Dagen").
 *   npx tsx scripts/fouttabel-tijd-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * 18 november 2026 (Sara: Bliepo als warme juf, zinnen in varianten, zoals Tellen, Geld en Klok): het script keurt nu
 * ELKE variant, niet alleen de eerste:
 *   - Inhoud: dezelfde 12 vragen als squla-tijd-dagen-1 (dagen, kaarten, getallen, goede antwoorden) en dezelfde reserve
 *     (vraag 1, 3 en 9); het goede antwoord staat tussen de keuzes; precies 1 goed antwoord per vraag (14.30).
 *   - Verklappen (15.17): geen eerste zin, hint of vraag-opnieuw noemt het antwoord; na de eerste zin blijven minstens 2
 *     keuzes over; geen "tussen … en …", geen "vlak naast", "bijna" of "dichtbij"; het rondje staat nooit om het antwoord.
 *   - Waarheid: elke losse zin van elke variant wordt nagelopen tegen DEZE vraag en dit antwoord. Een zin die het script
 *     niet kent, telt als fout.
 *   - Altijd een vraag of opdracht in beeld (15.37, F16): na de hint komt de vraag terug (nooit precies dezelfde zin als de
 *     1e keer); elke vraag, "nu jij", het hulphandje en "tik op de kaart" zijn een vraag of opdracht. Nergens "vinkje".
 *   - Geen getal 2 keer in 1 stuk en geen getal of dagnaam in 2 zinnen vlak achter elkaar; geen zin bij 1 vraag 2 keer
 *     (hint, uitleg en samen voordoen zijn verschillende zinnen, 15.29); geen opdracht in de uitleg bij de 2e keer.
 *   - Past in het tekstvak (harde eis, 15.30): elk stuk hooguit 110 tekens; bij elke hint passen minstens 2 versies van de
 *     vraag erachter; bij elke eerste zin minstens 2 hints en 2 uitleggen zonder herhaling.
 *   - De kiezer 20.000 vragen nagespeeld (hele lessen, met de vragen die terugkomen): nooit 2 keer achter elkaar dezelfde
 *     zin, nooit dezelfde eerste zin bij de 1e en 2e keer, "weer" alleen als het klopt, altijd een vraag of opdracht.
 */
import { writeFileSync } from "node:fs";
import { maakKiezer } from "../src/components/les/lessen/nooit-dubbel";
import {
  AANMOEDIG_DOEN,
  ALLE,
  DENKFOUTEN,
  DENKFOUT_UITLEG,
  EINDE,
  EINDE_VEEL_FOUTEN,
  MAX_STUK,
  NAAM_GROET,
  RESERVE,
  VRAGEN,
  WISSEL,
  ZIN,
  alsTerug,
  beeldVan,
  dagenIn,
  dagenVan,
  deeltDag,
  deeltGetal,
  foutStuk,
  foutenVan,
  getallenIn,
  kaal,
  kaartNaam,
  na,
  naGoedBeeld,
  naam,
  nuKoos,
  opnieuwZin,
  past,
  pastNa,
  tijdReactie,
  voor,
  vorm,
  type Fout,
  type Vraag,
} from "../src/components/les/lessen/squla-tijd-gouden-zinnen";

const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
const D = (w: string) => ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"].indexOf(w.toLowerCase());
const fouten: string[] = [];

/* 1. Inhoud (11.9, 14.30): de 12 vragen van squla-tijd-dagen-1 (squla-tijd.tsx, dagen1). */
const OUD: [string, string[], string][] = [
  ["eerste", ["2", "0", "6"], "0"],
  ["laatste", ["5", "1", "6"], "6"],
  ["weekendHoeveel", ["1", "2", "5"], "2"],
  ["weekendWelke", ["3-4", "5-6", "6-0"], "5-6"],
  ["na0", ["2", "1", "6"], "1"],
  ["na3", ["4", "2", "5"], "4"],
  ["na2", ["1", "6", "3"], "3"],
  ["na5", ["4", "6", "0"], "6"],
  ["na6", ["0", "5", "1"], "0"],
  ["hoeveelWeek", ["6", "7", "8"], "7"],
  ["na1", ["2", "0", "4"], "2"],
  ["na4", ["3", "5", "6"], "5"],
];
if (VRAGEN.length !== OUD.length) fouten.push(`${VRAGEN.length} vragen in plaats van ${OUD.length} (squla-tijd-dagen-1)`);
if (RESERVE.join() !== "0,2,8") fouten.push(`reserve ${RESERVE} in plaats van 0,2,8 (squla-tijd-dagen-1)`);
VRAGEN.forEach((v, i) => {
  const [soort, keuzes, goed] = OUD[i];
  const s = v.soort === "na" ? `na${v.dag}` : v.soort;
  if (s !== soort || v.keuzes.join() !== keuzes.join() || v.goed !== goed) fouten.push(`${v.id}: niet gelijk aan vraag ${i + 1} van de oude les`);
  if (!v.keuzes.includes(v.goed)) fouten.push(`${v.id}: het goede antwoord staat niet tussen de keuzes`);
  if (new Set(v.keuzes).size !== v.keuzes.length) fouten.push(`${v.id}: 2 keuzes zijn gelijk`);
  /* Rekenen: is het goede antwoord echt goed, en het enige goede (14.30)? */
  const echt = (k: string) => (v.soort === "eerste" ? k === "0" : v.soort === "laatste" ? k === "6" : v.soort === "weekendHoeveel" ? k === "2" : v.soort === "weekendWelke" ? dagenVan(k).sort().join() === "5,6" : v.soort === "na" ? Number(k) === na(v.dag) : k === "7");
  const goedeKeuzes = v.keuzes.filter(echt);
  if (goedeKeuzes.length !== 1 || goedeKeuzes[0] !== v.goed) fouten.push(`${v.id}: het goede antwoord klopt niet (${goedeKeuzes} in plaats van ${v.goed})`);
});

/* De vragen, en de versie die aan het eind terugkomt. */
const ALLE_VRAGEN: Vraag[] = [...VRAGEN, ...VRAGEN.map(alsTerug)];

const REGELS: [RegExp, (z: string, k: { s: string; d: number; c: number; dagen: number[] }) => boolean][] = [
    /* Wat is de eerste dag? */
  [/^Dat is de laatste dag van de week\.$/, (z, { s, d, c, dagen }) => s === "eerste" && c === 6],
  [/^Die dag komt helemaal aan het eind\.$/, (z, { s, d, c, dagen }) => s === "eerste" && c === 6],
  [/^Die hangt achteraan, niet vooraan\.$/, (z, { s, d, c, dagen }) => s === "eerste" && c === 6],
  [/^Dat is niet de eerste dag\.$/, (z, { s, d, c, dagen }) => s === "eerste" && c !== 0],
  [/^Daarvóór komen nog andere dagen\.$/, (z, { s, d, c, dagen }) => s === "eerste" && c > 0],
  [/^Die dag komt later in de week\.$/, (z, { s, d, c, dagen }) => s === "eerste" && c > 0],
    /* Wat is de laatste dag? */
  [/^Die hoort bij het weekend, maar is niet de laatste dag\.$/, (z, { s, d, c, dagen }) => s === "laatste" && c === 5],
  [/^Die is weekend, maar niet de laatste dag\.$/, (z, { s, d, c, dagen }) => s === "laatste" && c === 5],
  [/^Dat is een weekenddag, maar niet de laatste\.$/, (z, { s, d, c, dagen }) => s === "laatste" && c === 5],
  [/^Dat is niet de laatste dag\.$/, (z, { s, d, c, dagen }) => s === "laatste" && c !== 6],
  [/^Daarna komen nog meer dagen\.$/, (z, { s, d, c, dagen }) => s === "laatste" && c < 5],
  [/^Die dag hangt niet achteraan\.$/, (z, { s, d, c, dagen }) => s === "laatste" && c !== 6],
    /* Hoeveel dagen heeft het weekend? */
  [/^Op zoveel dagen ga je naar school\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" && c === 5],
  [/^Zoveel schooldagen zijn er\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" && c === 5],
  [/^Met \d+ tel je de schooldagen\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" && c === 5],
  [/^Het weekend is langer dan dat\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" && c < 2],
  [/^Het weekend duurt langer\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" && c < 2],
  [/^Met \d+ dag ben je er nog niet\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" && c < 2],
    /* Op welke dagen is het weekend? */
  [/^Dat zijn schooldagen\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke" && dagen.every((q) => q < 5)],
  [/^Op die dagen ga je naar school\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke" && dagen.every((q) => q < 5)],
  [/^Dan is er nog school\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke" && dagen.every((q) => q < 5)],
  [/^Daar zit een schooldag bij\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke" && dagen.some((q) => q < 5) && dagen.some((q) => q >= 5)],
  [/^Op een van die dagen is er school\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke" && dagen.filter((q) => q < 5).length === 1],
  [/^Niet allebei die dagen zijn vrij\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke" && dagen.some((q) => q < 5) && dagen.some((q) => q >= 5)],
    /* Welke dag komt meteen na …? (de dagnaam is die van de vraag) */
  [/^Die komt vóór (\w+)\.$/, (z, { s, d, c, dagen }) => s === "na" && D(z.match(/vóór (\w+)/)![1]) === d && c === voor(d)],
  [/^Die dag hangt vóór (\w+)\.$/, (z, { s, d, c, dagen }) => s === "na" && D(z.match(/vóór (\w+)/)![1]) === d && c === voor(d)],
  [/^Die dag komt ervóór, niet erna\.$/, (z, { s, d, c, dagen }) => s === "na" && c === voor(d)],
  [/^Die komt niet meteen na (\w+)\.$/, (z, { s, d, c, dagen }) => s === "na" && D(z.match(/na (\w+)\./)![1]) === d && c !== na(d)],
  [/^Die hangt niet direct achter (\w+)\.$/, (z, { s, d, c, dagen }) => s === "na" && D(z.match(/achter (\w+)\./)![1]) === d && c !== na(d)],
  [/^Die dag ligt verder weg\.$/, (z, { s, d, c, dagen }) => s === "na" && c !== na(d) && c !== voor(d)],
    /* Hoeveel dagen heeft een week? */
  [/^Dat zijn te weinig dagen\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c < 7],
  [/^Een week heeft meer dagen\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c < 7],
  [/^Met \d+ ben je er nog niet\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c < 7],
  [/^Dat zijn te veel dagen\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c > 7],
  [/^Zoveel dagen heeft een week niet\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c !== 7],
  [/^Met \d+ tel je te ver door\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c > 7],
    /* Hints (hoe je zoekt, waar je kijkt; geen antwoord). */
  [/^Zeg de dagen van de week op, vanaf het begin\.$/, (z, { s, d, c, dagen }) => s === "eerste"],
  [/^Na het weekend begint een nieuwe week\.$/, (z, { s, d, c, dagen }) => s === "eerste" || (s === "na" && d === 6)],
  [/^Denk aan de dag waarop de schoolweek begint\.$/, (z, { s, d, c, dagen }) => s === "eerste"],
  [/^Zeg de dagen van de week op, tot het eind\.$/, (z, { s, d, c, dagen }) => s === "laatste"],
  [/^Na de laatste dag begint een nieuwe week\.$/, (z, { s, d, c, dagen }) => s === "laatste"],
  [/^Denk aan het eind van de week\.$/, (z, { s, d, c, dagen }) => s === "laatste"],
  [/^Het weekend zijn de vrije dagen\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel"],
  [/^Denk aan de dagen waarop je vrij bent\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel"],
  [/^Denk aan de dagen na vrijdag\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel"],
  [/^In het weekend ben je vrij\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke"],
  [/^Het weekend komt aan het eind van de week\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke"],
  [/^Het weekend zijn de dagen zonder school\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke"],
  [/^Het gaat om de dag die erachter komt\.$/, (z, { s, d, c, dagen }) => s === "na" && d !== 6],
  [/^Zeg de dagen op, vanaf het begin van de week\.$/, (z, { s, d, c, dagen }) => s === "na" && d !== 6],
  [/^De dag erna hoort op de lege plek\.$/, (z, { s, d, c, dagen }) => s === "na" && d !== 6],
  [/^Zeg de dagen op, vanaf (\w+)\.$/, (z, { s, d, c, dagen }) => s === "na" && d !== 6 && D(z.match(/vanaf (\w+)\./)![1]) === d],
  [/^Na de laatste dag begint de week opnieuw\.$/, (z, { s, d, c, dagen }) => s === "na" && d === 6],
  [/^Zeg de dagen op tot het eind\.$/, (z, { s, d, c, dagen }) => s === "na" && d === 6],
  [/^Dan begint de week weer\.$/, (z, { s, d, c, dagen }) => s === "na" && d === 6],
  [/^Zeg de dagen op van maandag tot en met zondag\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek"],
  [/^Denk aan alle dagen, van maandag tot en met zondag\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek"],
  [/^Elke dag van de week heeft een eigen wagon\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek"],
    /* Uitleg bij de 2e keer (daarna doet Bliepo het samen voor). */
  [/^De eerste dag staat vooraan in de week, niet achteraan\.$/, (z, { s, d, c, dagen }) => s === "eerste" && c === 6],
  [/^De week begint niet met het weekend\.$/, (z, { s, d, c, dagen }) => s === "eerste" && c >= 5],
  [/^De eerste dag hangt vooraan, vlak achter de locomotief\.$/, (z, { s, d, c, dagen }) => s === "eerste"],
  [/^De eerste dag hangt vooraan in de weektrein, vlak achter de locomotief\.$/, (z, { s, d, c, dagen }) => s === "eerste"],
  [/^Met de eerste dag begint de schoolweek\.$/, (z, { s, d, c, dagen }) => s === "eerste"],
  [/^Vóór de eerste dag hangt alleen de locomotief\.$/, (z, { s, d, c, dagen }) => s === "eerste"],
  [/^De laatste dag hangt helemaal achteraan in de weektrein\.$/, (z, { s, d, c, dagen }) => s === "laatste"],
  [/^De laatste dag is de allerlaatste wagon van de trein\.$/, (z, { s, d, c, dagen }) => s === "laatste"],
  [/^Na de laatste dag komt er in deze week niets meer\.$/, (z, { s, d, c, dagen }) => s === "laatste"],
  [/^Het weekend zijn de vrije dagen aan het eind van de week\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" || s === "weekendWelke"],
  [/^Na de schooldagen komt het weekend\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" || s === "weekendWelke"],
  [/^Het weekend is korter dan de schoolweek\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" && c === 5],
  [/^Na vrijdag is er geen school meer, tot het maandag is\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel"],
  [/^Zaterdag is vrij, en de dag erna ook\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel" && c < 2],
  [/^Het weekend begint na vrijdag en duurt tot maandag\.$/, (z, { s, d, c, dagen }) => s === "weekendHoeveel"],
  [/^In het weekend ga je niet naar school\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke"],
  [/^Op allebei de dagen van het weekend ben je vrij\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke"],
  [/^In het weekend is er op geen enkele dag school\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke"],
  [/^Het weekend begint na de laatste schooldag\.$/, (z, { s, d, c, dagen }) => s === "weekendWelke"],
  [/^Meteen na is de dag die erna komt, niet de dag ervoor\.$/, (z, { s, d, c, dagen }) => s === "na" && c === voor(d)],
  [/^Meteen na is de dag erachter, niet de dag ervoor\.$/, (z, { s, d, c, dagen }) => s === "na" && c === voor(d) && d !== 6],
  [/^Erna betekent: later, niet eerder\.$/, (z, { s, d, c, dagen }) => s === "na" && c === voor(d)],
  [/^Een nieuwe week begint weer vooraan in de trein\.$/, (z, { s, d, c, dagen }) => s === "na" && d === 6],
  [/^De dag erna komt later in de week\.$/, (z, { s, d, c, dagen }) => s === "na" && d !== 6],
  [/^Na zondag begint de week opnieuw vooraan in de trein\.$/, (z, { s, d, c, dagen }) => s === "na" && d === 6],
  [/^Na het eind van de week begin je weer vooraan\.$/, (z, { s, d, c, dagen }) => s === "na" && d === 6],
  [/^Een nieuwe week begint weer met de eerste dag\.$/, (z, { s, d, c, dagen }) => s === "na" && d === 6],
  [/^Meteen na (\w+) komt de dag die er direct achter hangt\.$/, (z, { s, d, c, dagen }) => s === "na" && d !== 6 && D(z.match(/na (\w+) komt/)![1]) === d],
  [/^Meteen na betekent: de dag direct erachter\.$/, (z, { s, d, c, dagen }) => s === "na" && d !== 6],
  [/^Je slaat geen dag over\.$/, (z, { s, d, c, dagen }) => s === "na" && c !== na(d) && c !== voor(d)],
  [/^Het is de dag direct erachter\.$/, (z, { s, d, c, dagen }) => s === "na" && d !== 6],
  [/^Elke dag van maandag tot en met zondag telt mee\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c < 7],
  [/^Vergeet het weekend niet\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c < 7],
  [/^Dat hoort ook bij de week\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c < 7],
  [/^Ook zaterdag en zondag horen bij de week\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c < 7],
  [/^Elke dag van de week telt maar 1 keer mee\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c > 7],
  [/^Na zondag begint een nieuwe week\.$/, (z, { s, d, c, dagen }) => (s === "hoeveelWeek" && c > 7) || (s === "na" && d === 6)],
  /* De eigen vraag aan het eind van een oude hint (dan komt er niets meer achter). */
  [/^Zeg de dagen van de week op\.$/, (z, { s }) => s === "eerste" || s === "laatste"],
  [/^Welke dag zeg je als eerste\?$/, (z, { s }) => s === "eerste"],
  [/^Welke dag zeg je als laatste\?$/, (z, { s }) => s === "laatste"],
  [/^Welke kaart heeft 2 vrije dagen\?$/, (z, { s }) => s === "weekendWelke"],
  [/^Welke dag zeg je daarna\?$/, (z, { s, d }) => s === "na" && d !== 6],
  [/^Welke dag komt dan\?$/, (z, { s, d }) => s === "na" && d === 6],
  [/^Hoeveel dagen zijn het\?$/, (z, { s }) => s === "hoeveelWeek"],
  [/^Die tel je niet mee\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c > 7],
  [/^Je telt van maandag tot en met zondag, niet verder\.$/, (z, { s, d, c, dagen }) => s === "hoeveelWeek" && c > 7],
];

/* 2. Waarheidscontrole: wat een losse zin beweert, klopt voor deze vraag en dit antwoord. Onbekende zin = fout. */
const bekend = (v: Vraag, x: string, z: string): string | null => {
  const d = v.dag;
  const c = Number(x);
  const kaart = v.invoer === "kaart";
  const dagen = kaart ? dagenVan(x) : [];
  const s = v.soort;
  const ok = (b: boolean, waarom = "klopt niet voor deze vraag of dit antwoord") => (b ? null : waarom);
  let m: RegExpMatchArray | null;
  for (const [re, f] of REGELS) if (re.test(z)) return ok(f(z, { s, d, c, dagen }));
  /* Wat het kind koos (ook "weer" en "nu"): precies dat. */
  if ((m = z.match(/^(?:Je koos weer|Je tikte weer op|Je koos|Nu koos je|Je tikte op|Nu tikte je op|Weer) (.+?)(?:, zie ik)?[.?]$/)) || (m = z.match(/^(.+)\?$/)) || (m = z.match(/^Met (\d+)(?: dag)? /))) {
    if (/^(Met) /.test(z)) {
      /* "Met 5 tel je de schooldagen." en zo: het getal is wat het kind koos; de rest hieronder. */
      if (kaart || m[1] !== x) return "noemt niet wat het kind koos";
    } else {
      const wat = m[1].toLowerCase();
      if (/^(welke|wat|hoeveel|op welke)\b/.test(wat)) return `onbekende zin (niet na te lopen): "${z}"`;
      return ok(kaart ? wat === kaartNaam(x) : wat === x, "noemt niet wat het kind koos");
    }
  }
  return `onbekende zin (niet na te lopen): "${z}"`;
};

/* 3. Keuring van elke zin en elk stuk. */
const woorden = (z: string) => z.split(/\s+/).filter(Boolean).length;
const dubbelGetal = (z: string) => {
  const n = getallenIn(z);
  return n.find((x, i) => n.indexOf(x) !== i);
};
const dubbeleDag = (z: string) => {
  /* Een dagnaam 2 keer in 2 zinnen vlak achter elkaar binnen 1 stuk. */
  const z2 = zinnenVan(z);
  for (let i = 1; i < z2.length; i++) if (deeltDag(z2[i - 1], z2[i])) return `${z2[i - 1]} ${z2[i]}`;
  return null;
};
const OPDRACHT = /(^|[.!?:] )(Tik|Zoek|Kies|Lees|Kijk|Tel|Sleep|Wijs|Zeg|Denk)\b/;
/** Staat er een vraag of een opdracht die zegt wat het kind doet (15.37, F16)? "Kijk" en "Zeg" alleen zijn geen opdracht. */
const isVraagOfOpdracht = (z: string) => /\?/.test(z) || /(^|[.!?:] )(?:Nu jij! )?(Tik|Kies)\b/.test(kaal(z));
/** Algemene keuring van 1 stuk (elke variant, elke soort). */
const keurStuk = (waar: string, z: string, o: { getalMag?: boolean } = {}) => {
  const k = kaal(z);
  if (/\bfout(en|je)?\b/i.test(k)) fouten.push(`${waar}: het woord "fout" ("${k}")`);
  if (/vinkje/i.test(k)) fouten.push(`${waar}: het woord "vinkje" (het lesscherm laat die zin weg, 15.37) ("${k}")`);
  if (!o.getalMag && dubbelGetal(z) !== undefined) fouten.push(`${waar}: het getal ${dubbelGetal(z)} staat er 2 keer ("${k}")`);
  const dd = dubbeleDag(z);
  if (dd) fouten.push(`${waar}: een dagnaam klinkt 2 keer achter elkaar ("${dd}")`);
  if (zinnenVan(z).length > 3) fouten.push(`${waar}: meer dan 3 zinnen in 1 stuk ("${k}")`);
  for (const d of zinnenVan(z)) if (woorden(d) > 14) fouten.push(`${waar}: zin van ${woorden(d)} woorden ("${d}")`);
  if (k.length > MAX_STUK) fouten.push(`${waar}: ${k.length} tekens, past niet in het tekstvak (hooguit ${MAX_STUK}) ("${k}")`);
  /* Elk getal heeft een kleur of wit (14.20): geen kaal cijfer. */
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) fouten.push(`${waar}: getal zonder kleur (14.20) ("${z}")`);
  /* Een zin die met een cijfer begint leest lastig (KEUZES Ronde 38). */
  for (const d of zinnenVan(z)) if (/^\d/.test(d)) fouten.push(`${waar}: zin begint met een cijfer ("${d}")`);
};
const genoeg = (waar: string, lijst: readonly string[], n: number) => {
  if (lijst.length < n) fouten.push(`${waar}: ${lijst.length} varianten, ${n} nodig`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${waar}: 2 varianten zijn dezelfde zin`);
};
/** Het goede antwoord in woorden (bij een kaart met 2 dagen: alleen de dag die NIET op de gekozen kaart staat). */
const goedWoorden = (v: Vraag, x: string | null) => (v.invoer === "kaart" ? dagenVan(v.goed).filter((q) => x === null || !dagenVan(x).includes(q)).map(naam) : []);
const noemtGoed = (v: Vraag, x: string | null, z: string) => {
  for (const w of goedWoorden(v, x)) if (new RegExp(`(^|[^\\wé])${w}([^\\w]|$)`, "i").test(kaal(z))) return w;
  if (v.invoer === "getal" && getallenIn(z).includes(Number(v.goed))) return v.goed;
  return null;
};

let beweringen = 0;
let variantenTeller = 0;
const verklap = (v: Vraag, x: string, f: Fout): string[] => {
  const uit: string[] = [];
  if (!f.v.eerste.length) uit.push("geen eerste zin");
  if (!f.v.hint.length) uit.push("geen hint");
  for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.hint, ...ZIN.weerGekozen(v, x)]) {
    if (/tussen .* en /i.test(kaal(z))) uit.push(`"tussen … en …" in eerste zin of hint ("${kaal(z)}")`);
    if (/vlak naast|\bbijna\b|dichtbij/i.test(kaal(z))) uit.push(`"vlak naast", "bijna" of "dichtbij" ("${kaal(z)}")`);
    const w = noemtGoed(v, x, z);
    if (w) uit.push(`de eerste zin of hint noemt het antwoord (${w}) ("${kaal(z)}")`);
    /* Kleur verklapt niets: elk getal is wit (14.22). */
    if (/\{\d+:(?!wit)/.test(z)) uit.push(`een getal met een kleur ("${z}")`);
  }
  /* Een hint met een eigen vraag aan het eind krijgt niets erachter (nooit 2 vragen achter elkaar, 3.23); die eigen vraag
     is nooit precies de vraag van de 1e keer. */
  for (const z of f.v.hint) if (/\?\s*$/.test(z) && opnieuwZin(() => "x", v, z) !== "") uit.push(`de hint eindigt met een vraag én de vraag komt erachter ("${kaal(z)}")`);
  for (const z of f.v.hint) for (const q of zinnenVan(z)) if (ZIN.vraag(v, false).map(kaal).includes(q)) uit.push(`de hint bevat precies de vraag van de 1e keer ("${q}")`);
  /* Het rondje staat nooit om het antwoord. */
  if (f.rondje && x === v.goed) uit.push("rondje om het antwoord");
  if (f.rondje !== (v.invoer === "kaart")) uit.push("rondje bij een getal of geen rondje bij een kaart");
  if (!f.over.includes(v.goed)) uit.push("het goede antwoord valt weg na de eerste zin (de zin klopt niet)");
  if (f.over.length < 2) uit.push(`na de eerste zin blijft alleen ${f.over.join("")} over`);
  /* De zinnen bij de 2e keer zijn uitleg, geen opdracht (keuring Getallenlijn): het kind kan hem daarna niet meer doen. */
  for (const z of f.v.uitleg) for (const d1 of zinnenVan(z)) if (OPDRACHT.test(d1) || /\?$/.test(d1)) uit.push(`opdracht of vraag in de uitleg bij de 2e keer: "${d1}"`);
  /* Bij 1 vraag geen zin 2 keer (15.29): hint en uitleg delen geen zin. */
  const hintZinnen = new Set(f.v.hint.flatMap(zinnenVan).map(vorm));
  for (const z of f.v.uitleg.flatMap(zinnenVan)) if (hintZinnen.has(vorm(z))) uit.push(`dezelfde zin als hint én als uitleg ("${z}")`);
  /* Genoeg varianten. */
  genoeg("eerste zin", f.v.eerste, 3);
  genoeg("hint", f.v.hint, 3);
  genoeg("uitleg", f.v.uitleg, 3);
  /* Bij elke eerste zin passen minstens 2 hints en 2 uitleggen die geen getal, geen dag en geen stuk herhalen. */
  for (const e of [...f.v.eerste, nuKoos(f.v.eerste[0])]) {
    if (new Set(f.v.hint.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 hints zonder herhaling`);
    if (new Set(f.v.uitleg.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaling`);
  }
  for (const e of ZIN.weerGekozen(v, x)) if (new Set(f.v.uitleg.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaling`);
  /* Past in het tekstvak (harde eis): bij elke hint passen minstens 2 versies van de vraag erachter, zonder herhaald getal of dag. */
  for (const h of f.v.hint) {
    if (opnieuwZin(() => "x", v, h) === "") {
      if (!isVraagOfOpdracht(h) || !past(h)) uit.push(`de hint zonder vraag erachter is geen vraag of past niet ("${kaal(h)}")`);
      continue;
    }
    const op = ZIN.opnieuw(v).filter((z) => past(h, z) && !deeltDag(h, z) && !deeltGetal(h, z));
    if (op.length < 2) uit.push(`bij de hint "${kaal(h)}" passen minder dan 2 versies van de vraag`);
  }
  /* Waarheid: elke losse zin van elke variant. */
  for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.hint, ...f.v.uitleg, ...ZIN.weerGekozen(v, x)])
    for (const d1 of zinnenVan(z)) {
      beweringen++;
      const r = bekend(v, x, d1);
      if (r) uit.push(`waarheidscontrole: ${r} ("${d1}")`);
    }
  return uit;
};

let telling = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of ALLE_VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = v.keuzes.filter((k) => k !== v.goed).length;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    if (!DENKFOUTEN.includes(f.code) || f.code === "onduidelijk") fouten.push(`${v.id} ${a}: geen vaste denkfout (${f.code})`);
    for (const r of verklap(v, a, f)) fouten.push(`${v.id} ${a}: ${r}`);
    for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.hint, ...f.v.uitleg, ...ZIN.weerGekozen(v, a)]) {
      variantenTeller++;
      keurStuk(`${v.id} ${a}`, z);
    }
    genoeg(`${v.id} ${a}: hetzelfde antwoord 2 keer`, ZIN.weerGekozen(v, a), 3);
    for (const z of ZIN.weerGekozen(v, a)) if (!/\bweer\b/i.test(z)) fouten.push(`${v.id} ${a}: "weer" ontbreekt ("${kaal(z)}")`);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    for (const h of f.v.hint) hintsPerCode.get(f.code)!.add(kaal(h));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
  }
  /* Paren foute antwoorden per vraag (keuring Tellen en Splitsen): op dezelfde plek niet 2 keer dezelfde 2e zin. */
  const rijen = Object.values(tabel);
  for (let i = 0; i < rijen.length; i++)
    for (let j = i + 1; j < rijen.length; j++)
      rijen[i].v.eerste.forEach((e, k) => {
        const a = zinnenVan(e)[1];
        const b = zinnenVan(rijen[j].v.eerste[k] ?? "")[1];
        if (a && b && a === b) fouten.push(`${v.id}: 2 foute antwoorden krijgen dezelfde zin "${a}"`);
      });
  /* De vraag zelf en de vraag opnieuw: een vraag of opdracht (15.36, 15.37); de vraag opnieuw is nooit precies de 1e zin. */
  const vraag1 = ZIN.vraag(v, true).join(" ");
  const vraag2 = ZIN.vraag(v, false).join(" ");
  for (const z of [vraag1, vraag2]) {
    keurStuk(`${v.id} vraag`, z);
    if (!isVraagOfOpdracht(z)) fouten.push(`${v.id} vraag: geen vraag en geen opdracht ("${kaal(z)}")`);
  }
  genoeg(`${v.id} vraag opnieuw`, ZIN.opnieuw(v), 3);
  for (const z of ZIN.opnieuw(v)) {
    variantenTeller++;
    keurStuk(`${v.id} vraag opnieuw`, z);
    if (!/\?$/.test(kaal(z))) fouten.push(`${v.id} vraag opnieuw: geen vraag ("${kaal(z)}")`);
    if (ZIN.vraag(v, false).includes(z)) fouten.push(`${v.id} vraag opnieuw: precies dezelfde zin als de 1e keer ("${kaal(z)}")`);
    const w = noemtGoed(v, null, z);
    if (w) fouten.push(`${v.id} vraag opnieuw: noemt het antwoord (${w}) ("${kaal(z)}")`);
  }
  /* "Tik jij …": een vraag of opdracht, zonder het antwoord nog een keer (het klonk net). */
  const jij = v.invoer === "kaart" ? ZIN.samenKaartJij : ZIN.samenGetalJij;
  for (const z of [...jij, ...(v.invoer === "kaart" ? ZIN.handKaart : [])]) {
    keurStuk(`${v.id} nu jij`, z);
    if (!isVraagOfOpdracht(z)) fouten.push(`${v.id} nu jij: geen vraag en geen opdracht ("${kaal(z)}")`);
    if (noemtGoed(v, null, z) || dagenIn(z).length) fouten.push(`${v.id} nu jij: noemt de dag of het getal nog een keer ("${kaal(z)}")`);
  }
  /* De reactie na lof noemt alleen wat bij deze vraag hoort. */
  const reactie = tijdReactie(v);
  genoeg(`${v.id} reactie na lof`, reactie.zinnen, 7);
  for (const z of reactie.zinnen) {
    keurStuk(`${v.id} reactie na lof`, z);
    if (v.soort === "weekendHoeveel" && !/zaterdag en zondag/i.test(z)) fouten.push(`${v.id}: de reactie bij het weekend noemt zaterdag en zondag niet (het rondje staat erom, 7.8) ("${kaal(z)}")`);
    if (v.invoer === "getal" && getallenIn(z).some((n) => String(n) !== v.goed)) fouten.push(`${v.id}: een reactie bij goed noemt een ander getal ("${kaal(z)}")`);
    if (v.soort === "na" && dagenIn(z).some((q) => q !== v.dag && q !== na(v.dag))) fouten.push(`${v.id}: een reactie bij goed noemt een andere dag ("${kaal(z)}")`);
  }
}

/* De zinnen van het samen voordoen: genoeg varianten, elk stuk gekeurd, ze kloppen (11.9) en ze zijn anders dan de uitleg. */
const samenLijsten: [string, readonly string[], number][] = [
  ["samen", ZIN.samen, 5],
  ["samenEerste", ZIN.samenEerste, 3],
  ["samenLaatste", ZIN.samenLaatste, 3],
  ["samenKaartJij", ZIN.samenKaartJij, 2],
  ["samenEersteKlaar", ZIN.samenEersteKlaar, 3],
  ["samenEersteZelf", ZIN.samenEersteZelf, 2],
  ["samenLaatsteKlaar", ZIN.samenLaatsteKlaar, 3],
  ["samenLaatsteZelf", ZIN.samenLaatsteZelf, 2],
  ["samenSchool", ZIN.samenSchool, 3],
  ["samenWeekendDagen", ZIN.samenWeekendDagen, 3],
  ["samenWeekendTel", ZIN.samenWeekendTel, 3],
  ["samenWelkeKlaar", ZIN.samenWelkeKlaar, 3],
  ["samenWelkeZelf", ZIN.samenWelkeZelf, 2],
  ["samenTelBegin", ZIN.samenTelBegin, 3],
  ["samenWeekTel", ZIN.samenWeekTel, 3],
  ["samenGetalJij", ZIN.samenGetalJij, 3],
  ["samenWeekendKlaar", ZIN.samenWeekendKlaar, 3],
  ["samenWeekKlaar", ZIN.samenWeekKlaar, 3],
  ["handKaart", ZIN.handKaart, 2],
  ["begin", ZIN.start, 3],
  ["terug (1)", ZIN.terug1, 3],
  ["terug (meer)", ZIN.terugN(3), 3],
  ["extra (1)", ZIN.extra1, 2],
  ["extra (meer)", ZIN.extraN(3), 2],
  ["later nog eens", ZIN.terugLastig, 2],
  ["slot", ZIN.slot, 3],
  ["bij de kaart", ZIN.kaartTik, 3],
  ["aanmoediging", AANMOEDIG_DOEN, 5],
];
for (const d of ALLE)
  samenLijsten.push([`samenHier ${naam(d)}`, ZIN.samenHier(d), 3], [`samenNa ${naam(d)}`, ZIN.samenNa(d), 3], [`samenNaKlaar ${naam(d)}`, ZIN.samenNaKlaar(d), 3], [`samenNaZelf ${naam(d)}`, ZIN.samenNaZelf(d), 2]);
for (const [naamL, lijst, n] of samenLijsten) {
  genoeg(naamL, lijst, n);
  for (const z of lijst) {
    variantenTeller++;
    keurStuk(naamL, z);
  }
}
for (const z of ALLE.map(ZIN.samenTelDag)) keurStuk("samenTelDag", z);
/* Na het vangnet geen "Ja" alsof het kind het deed (keuring Meer-minder); de test zoekt "Kijk, ". */
for (const z of [...ZIN.samenEersteZelf, ...ZIN.samenLaatsteZelf, ...ZIN.samenWelkeZelf, ...ALLE.flatMap(ZIN.samenNaZelf)]) if (!/^Kijk, /.test(z)) fouten.push(`na het vangnet begint de zin niet met "Kijk, " ("${kaal(z)}")`);
/* Samen voordoen klopt (11.9): de juiste dagen bij de juiste vraag. */
for (const d of ALLE) {
  for (const z of ZIN.samenHier(d)) if (dagenIn(z).join() !== String(d)) fouten.push(`samenHier ${naam(d)}: noemt een andere dag ("${z}")`);
  for (const z of ZIN.samenNa(d)) if (dagenIn(z).join() !== String(na(d))) fouten.push(`samenNa ${naam(d)}: het rondje staat om ${naam(na(d))}, de zin noemt iets anders ("${z}")`);
  for (const z of [...ZIN.samenNaKlaar(d), ...ZIN.samenNaZelf(d)]) if (dagenIn(z).sort().join() !== [d, na(d)].sort().join()) fouten.push(`samenNaKlaar ${naam(d)}: klopt niet ("${z}")`);
  /* Samen voordoen: de 2 stukken vlak achter elkaar noemen niet dezelfde dag. */
  for (const a of ZIN.samenHier(d)) for (const b of ZIN.samenNa(d)) if (deeltDag(a, b)) fouten.push(`samen ${naam(d)}: dezelfde dag 2 keer achter elkaar ("${a}" en "${b}")`);
}
for (const a of ZIN.samenTelBegin) if (deeltDag(a, ZIN.samenTelDag(0))) fouten.push(`samenTelBegin: maandag klinkt 2 keer achter elkaar ("${a}")`);
for (const a of ZIN.samenWeekTel) if (deeltDag(a, ZIN.samenTelDag(6))) fouten.push(`samenWeekTel: zondag klinkt 2 keer achter elkaar ("${a}")`);
for (const z of [...ZIN.samenWeekendTel, ...ZIN.samenWeekendKlaar]) if (getallenIn(z).some((n) => n !== 2)) fouten.push(`weekend samen: ander getal dan 2 ("${z}")`);
for (const z of [...ZIN.samenWeekTel, ...ZIN.samenWeekKlaar]) if (getallenIn(z).some((n) => n !== 7)) fouten.push(`week samen: ander getal dan 7 ("${z}")`);
for (const z of [...ZIN.samenEerste, ...ZIN.samenEersteKlaar, ...ZIN.samenEersteZelf]) if (dagenIn(z).join() !== "0") fouten.push(`eerste samen: noemt niet alleen maandag ("${z}")`);
for (const z of [...ZIN.samenLaatste, ...ZIN.samenLaatsteKlaar, ...ZIN.samenLaatsteZelf]) if (dagenIn(z).join() !== "6") fouten.push(`laatste samen: noemt niet alleen zondag ("${z}")`);
/* De uitleg van de 2e keer en het samen voordoen delen geen zin (15.29). */
const samenAlle = new Set(samenLijsten.flatMap(([, l]) => l.flatMap(zinnenVan)).map(vorm));
for (const v of ALLE_VRAGEN) for (const f of Object.values(foutenVan(v))) for (const z of [...f.v.uitleg, ...f.v.hint].flatMap(zinnenVan)) if (samenAlle.has(vorm(z))) fouten.push(`${v.id}: "${z}" komt als hint of uitleg én bij het samen voordoen`);
/* Het begin (met de groet in 1 stuk) is nooit langer dan de oude beginzin: die paste in het tekstvak (15.30). */
for (const z of ZIN.start) if (z.length > ZIN.start[0].length) fouten.push(`begin: langer dan de oude beginzin ("${z}")`);
void NAAM_GROET;
/* Het hulphandje: aanmoediging + opdracht in 1 stuk; het einde: eindzin + "Tik op de kaart." in 1 stuk. */
for (const a of AANMOEDIG_DOEN) for (const h of ZIN.handKaart) keurStuk("hulphandje", `${a} ${h}`);
for (const e of [...EINDE.zinnen, EINDE_VEEL_FOUTEN]) for (const k of ZIN.kaartTik) if (kaal(`${e} ${k}`).length > MAX_STUK) fouten.push(`einde: "${e} ${k}" past niet in het tekstvak`);
for (const k of ZIN.kaartTik) if (!isVraagOfOpdracht(k)) fouten.push(`bij de kaart: geen opdracht ("${k}")`);

/* De zinnen bij het samen voordoen en het beeld kloppen (11.9). */
for (const v of VRAGEN) {
  if (v.soort === "na" && kaartNaam(v.goed) !== naam(na(v.dag))) fouten.push(`${v.id}: de goede kaart is niet de dag erna`);
  const b = naGoedBeeld(v);
  if (v.invoer === "kaart" && !dagenVan(v.goed).every((q) => b.includes(q))) fouten.push(`${v.id}: na goed staat het antwoord niet in de trein`);
  if (v.invoer === "kaart" && dagenVan(v.goed).some((q) => beeldVan(v).includes(q))) fouten.push(`${v.id}: het antwoord staat al in de trein tijdens de vraag`);
  if (v.invoer === "getal" && beeldVan(v).length) fouten.push(`${v.id}: tijdens een getalvraag staat er een trein om te tellen`);
}

/* Afwisseling (5.10): elke denkfout heeft minstens 3 hints. */
for (const [code, n] of aantalPerCode) if ((hintsPerCode.get(code)?.size ?? 0) < 3) fouten.push(`denkfout ${code}: ${n} keer, maar minder dan 3 hints`);

/*
  4. De kiezer naspelen (18 nov 2026): 1.400 hele lessen (12 vragen + 3 die terugkomen = 21.000 vragen) met willekeurige
  antwoorden, met precies de keuze van de les (`foutStuk`, `opnieuwZin`, dezelfde sleutels, een nieuwe kiezer per les).
*/
{
  let zaad = 4242;
  const toeval = () => ((zaad = (zaad * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const tel = { dubbel: 0, herhaald: 0, zelfdeEerste: 0, inVraag: 0, weer: 0, lang: 0, geenOpdracht: 0, zelfdeHint: 0, reacties: 0, vragen: 0 };
  const voorbeelden: string[] = [];
  const meld = (soort: keyof typeof tel, tekst: string) => {
    tel[soort]++;
    if (voorbeelden.length < 10) voorbeelden.push(`${soort}: ${tekst}`);
  };
  const pak = <T,>(l: readonly T[]) => l[Math.floor(toeval() * l.length)];
  for (let les = 0; les < 1400; les++) {
    const K = maakKiezer({ wissel: WISSEL, toeval });
    const vorige = new Map<string, string>();
    const hints = new Map<number, string[]>();
    const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => {
      const z = K.kies(sleutel, zinnen, mag);
      if (vorige.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) meld("dubbel", `${sleutel}: 2 keer "${kaal(z)}"`);
      vorige.set(sleutel, vorm(z));
      if (kaal(z).length > MAX_STUK) meld("lang", kaal(z));
      return z;
    };
    variant("start", ZIN.start);
    const mis: number[] = [];
    const speel = (v: Vraag) => {
      tel.vragen++;
      const gezegd: string[] = [];
      const zeg = (...z: string[]) => {
        for (const q of z.flatMap(zinnenVan)) {
          /* Dezelfde zin (ook met een andere dag of een ander getal) telt; alleen "Maandag." enzovoort bij het langslopen niet. */
          if (gezegd.includes(q.toLowerCase()) && !/^(Maandag|Dinsdag|Woensdag|Donderdag|Vrijdag|Zaterdag|Zondag)\.$/.test(q)) meld("inVraag", `${v.id}: "${q}" 2 keer bij 1 vraag`);
          gezegd.push(q.toLowerCase());
        }
      };
      zeg(...ZIN.vraag(v, false));
      if (toeval() < 0.2) return true;
      const tabel = foutenVan(v);
      const antwoorden = Object.keys(tabel);
      const a1 = pak(antwoorden);
      const f1 = tabel[a1];
      const o = (a: string, zelfde: boolean) => ({ x: a, zelfdeAntwoord: zelfde, eerdereHints: hints.get(v.nr) ?? [], onduidelijk: () => "Die is lastig, hè." });
      const s1 = foutStuk(variant, f1, v, 1, null, o(a1, false));
      if ((hints.get(v.nr) ?? []).some((h) => vorm(h) === vorm(s1[1]))) meld("zelfdeHint", `${v.id}: "${kaal(s1[1])}" klonk bij deze vraag al`);
      hints.set(v.nr, [...(hints.get(v.nr) ?? []), s1[1]]);
      tel.reacties++;
      if (!pastNa(s1[0])(s1[1])) meld("herhaald", `"${kaal(s1.join(" "))}"`);
      if (/\bweer\b/i.test(s1[0])) meld("weer", `"weer" bij de 1e keer: "${kaal(s1[0])}"`);
      const op = opnieuwZin(variant, v, s1[1]);
      const stuk = `${s1[1]} ${op}`.trim();
      if (kaal(stuk).length > MAX_STUK) meld("lang", kaal(stuk));
      if (!isVraagOfOpdracht(op || s1[1])) meld("geenOpdracht", kaal(stuk));
      if (op && /\?\s*$/.test(s1[1])) meld("geenOpdracht", `2 vragen achter elkaar: ${kaal(stuk)}`);
      if (deeltGetal(s1[1], op) || deeltDag(s1[1], op)) meld("herhaald", `"${kaal(stuk)}"`);
      zeg(s1[0], s1[1]);
      if (toeval() < 0.35) return false;
      const a2 = toeval() < 0.4 ? a1 : pak(antwoorden);
      const f2 = tabel[a2];
      const s2 = foutStuk(variant, f2, v, 2, f1, { ...o(a2, a2 === a1), vorigeEerste: s1[0] });
      tel.reacties++;
      if (!pastNa(s2[0])(s2[1])) meld("herhaald", `"${kaal(s2.join(" "))}"`);
      if (vorm(s2[0]) === vorm(s1[0])) meld("zelfdeEerste", `"${kaal(s1[0])}" en daarna "${kaal(s2[0])}"`);
      if (a2 !== a1 && vorm(zinnenVan(s2[0])[0]) === vorm(zinnenVan(s1[0])[0])) meld("zelfdeEerste", `zelfde begin: "${kaal(s1[0])}" en daarna "${kaal(s2[0])}"`);
      if (/\bweer\b/i.test(s2[0]) && a2 !== a1) meld("weer", `"weer" uit het niets: "${kaal(s2[0])}"`);
      zeg(s2[0], s2[1]);
      /* Samen voordoen: dezelfde sleutels als de les. */
      zeg(variant("samen", ZIN.samen));
      const zelf = v.invoer === "kaart" && toeval() < 0.1;
      if (v.soort === "eerste" || v.soort === "laatste") zeg(variant(v.soort === "eerste" ? "samenEerste" : "samenLaatste", v.soort === "eerste" ? ZIN.samenEerste : ZIN.samenLaatste));
      else if (v.soort === "weekendWelke" || v.soort === "weekendHoeveel") {
        zeg(variant("samenSchool", ZIN.samenSchool));
        zeg(v.soort === "weekendWelke" ? variant("samenWeekendDagen", ZIN.samenWeekendDagen) : variant("samenWeekendTel", ZIN.samenWeekendTel));
      } else if (v.soort === "na") {
        const a = variant("samenHier", ZIN.samenHier(v.dag));
        const b = variant("samenNa", ZIN.samenNa(v.dag));
        if (deeltDag(a, b)) meld("herhaald", `"${a}" en "${b}"`);
        zeg(a, b);
      } else {
        const b = variant("samenTelBegin", ZIN.samenTelBegin);
        zeg(b, ...ALLE.map(ZIN.samenTelDag));
        zeg(variant("samenWeekTel", ZIN.samenWeekTel));
      }
      const jij = v.invoer === "kaart" ? variant("samenJij", ZIN.samenKaartJij) : variant("samenGetalJij", ZIN.samenGetalJij);
      if (!isVraagOfOpdracht(jij)) meld("geenOpdracht", kaal(jij));
      zeg(jij);
      if (v.invoer === "kaart" && toeval() < 0.3) {
        const h = `${variant("aanmoedig", AANMOEDIG_DOEN)} ${variant("samenHand", ZIN.handKaart)}`;
        if (kaal(h).length > MAX_STUK) meld("lang", kaal(h));
        if (!isVraagOfOpdracht(h)) meld("geenOpdracht", kaal(h));
      }
      const klaar =
        v.soort === "eerste" ? (zelf ? ZIN.samenEersteZelf : ZIN.samenEersteKlaar) : v.soort === "laatste" ? (zelf ? ZIN.samenLaatsteZelf : ZIN.samenLaatsteKlaar) : v.soort === "weekendWelke" ? (zelf ? ZIN.samenWelkeZelf : ZIN.samenWelkeKlaar) : v.soort === "na" ? (zelf ? ZIN.samenNaZelf(v.dag) : ZIN.samenNaKlaar(v.dag)) : v.soort === "weekendHoeveel" ? ZIN.samenWeekendKlaar : ZIN.samenWeekKlaar;
      zeg(variant(zelf ? "samenZelf" : "samenKlaar", klaar));
      return false;
    };
    VRAGEN.forEach((v, i) => {
      if (!speel(v)) mis.push(i);
    });
    const terug = [...mis, ...RESERVE.filter((i) => !mis.includes(i))].slice(0, 3);
    variant("terug", mis.length ? (terug.length === 1 ? ZIN.terug1 : ZIN.terugN(terug.length)) : terug.length === 1 ? ZIN.extra1 : ZIN.extraN(terug.length));
    let weerFout = 0;
    for (const i of terug) if (!speel(alsTerug(VRAGEN[i]))) weerFout++;
    if (weerFout) variant("terugLastig", ZIN.terugLastig);
    variant("slot", ZIN.slot);
    const k = variant("kaartTik", ZIN.kaartTik);
    if (!isVraagOfOpdracht(k)) meld("geenOpdracht", k);
  }
  const fout = tel.dubbel + tel.herhaald + tel.zelfdeEerste + tel.inVraag + tel.weer + tel.lang + tel.geenOpdracht + tel.zelfdeHint;
  if (fout)
    fouten.push(
      `kiezer nagespeeld: ${tel.dubbel} keer 2 keer achter elkaar dezelfde zin, ${tel.herhaald} keer een getal, dag of stuk herhaald, ${tel.zelfdeEerste} keer dezelfde eerste zin bij de 1e en 2e keer, ${tel.inVraag} keer dezelfde zin 2 keer bij 1 vraag, ${tel.weer} keer "weer" dat niet klopt, ${tel.lang} keer te lang voor het tekstvak, ${tel.geenOpdracht} keer geen vraag of opdracht, ${tel.zelfdeHint} keer dezelfde hint als toen de vraag eerder kwam\n  ${voorbeelden.join("\n  ")}`,
    );
  else console.log(`Kiezer nagespeeld: 1.400 lessen, ${tel.vragen} vragen, ${tel.reacties} reacties: 0 keer 2 keer achter elkaar dezelfde zin, 0 keer een getal, dag of stuk herhaald, 0 keer dezelfde eerste zin bij de 1e en 2e keer, 0 keer dezelfde zin 2 keer bij 1 vraag, 0 keer "weer" dat niet klopt, 0 keer te lang, altijd een vraag of opdracht, bij een vraag die terugkomt altijd een andere hint.`);
}

if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log(`Inhoudscontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen + hun terugkomende versie, ${telling} foute antwoorden, ${variantenTeller} varianten gekeurd, ${beweringen} beweringen nagelopen).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 5. De tabel. */
const lijst = (l: readonly string[]) => (l.length ? l.map(kaal).join(" / ") : "—");
const keuzeNaam = (v: Vraag, x: string) => (v.invoer === "kaart" ? kaartNaam(x) : x);
const vraagNaam = (v: Vraag) => {
  const k = ` (keuzes ${v.keuzes.map((x) => keuzeNaam(v, x)).join(" / ")})`;
  const t = v.terug ? " — terug" : "";
  return `${v.nr}${t}. ${kaal(ZIN.vraag(v, false)[ZIN.vraag(v, false).length - 1])}${k}`;
};
const rijen = VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${keuzeNaam(v, a)} | \`${f.code}\` — ${f.denkfout} | ${lijst(f.v.eerste)} | ${lijst(f.v.hint)} | ${f.scherm} |`)).join("\n");
const samenZin = (v: Vraag) => {
  const d = v.dag;
  const kaartstap = `Rondje om de kaart: ${lijst(ZIN.samenKaartJij)} (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis)`;
  if (v.soort === "eerste") return `De hele trein. Rondje om maandag: ${lijst(ZIN.samenEerste)} ${kaartstap} — ${lijst(ZIN.samenEersteKlaar)} (vangnet: ${lijst(ZIN.samenEersteZelf)})`;
  if (v.soort === "laatste") return `De hele trein. Rondje om zondag: ${lijst(ZIN.samenLaatste)} ${kaartstap} — ${lijst(ZIN.samenLaatsteKlaar)} (vangnet: ${lijst(ZIN.samenLaatsteZelf)})`;
  if (v.soort === "weekendWelke") return `De hele trein. 1 rondje om maandag t/m vrijdag: ${lijst(ZIN.samenSchool)} 1 rondje om zaterdag en zondag: ${lijst(ZIN.samenWeekendDagen)} ${kaartstap} — ${lijst(ZIN.samenWelkeKlaar)} (vangnet: ${lijst(ZIN.samenWelkeZelf)})`;
  if (v.soort === "na") return `De hele trein. Rondje om ${naam(d)}: ${lijst(ZIN.samenHier(d))} Rondje om ${naam(na(d))}: ${lijst(ZIN.samenNa(d))} ${kaartstap} — ${lijst(ZIN.samenNaKlaar(d))} (vangnet: ${lijst(ZIN.samenNaZelf(d))})`;
  if (v.soort === "weekendHoeveel") return `De hele trein. 1 rondje om maandag t/m vrijdag: ${lijst(ZIN.samenSchool)} 1 rondje om zaterdag en zondag: ${lijst(ZIN.samenWeekendTel)} Alleen de knop 2: ${lijst(ZIN.samenGetalJij)} — ${lijst(ZIN.samenWeekendKlaar)}`;
  return `De hele trein. ${lijst(ZIN.samenTelBegin)} Rondje loopt van maandag tot zondag (vast tempo, Bliepo noemt elke dag). ${lijst(ZIN.samenWeekTel)} Alleen de knop 7: ${lijst(ZIN.samenGetalJij)} — ${lijst(ZIN.samenWeekKlaar)}`;
};
const uitleg = VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${keuzeNaam(v, a)} (\`${f.code}\`) | ${lijst(f.v.uitleg)} | ${lijst(ZIN.weerGekozen(v, a))} |`)).join("\n");
const samenRijen = VRAGEN.map((v) => `| ${v.nr} | ${samenZin(v)} |`).join("\n");
const opnieuwRijen = VRAGEN.map((v) => `| ${v.nr} | ${lijst(ZIN.opnieuw(v))} | ${lijst(tijdReactie(v).zinnen)} |`).join("\n");
const vast: [string, readonly string[]][] = [
  ["Begin (na de groet)", ZIN.start],
  ['"Kom, we kijken samen."', ZIN.samen],
  ["Hulphandje (na een aanmoediging)", ZIN.handKaart],
  ["Aanmoediging bij het hulphandje", AANMOEDIG_DOEN],
  ["Vragen die terugkomen (1)", ZIN.terug1],
  ["Vragen die terugkomen (meer)", ZIN.terugN(3)],
  ["Extra vragen (1)", ZIN.extra1],
  ["Extra vragen (meer)", ZIN.extraN(3)],
  ["Een terugkomende vraag ging weer niet goed", ZIN.terugLastig],
  ["Slot", ZIN.slot],
  ["Bij de kaart", ZIN.kaartTik],
];
const vastRijen = vast.map(([n, l]) => `| ${n} | ${l.length} | ${lijst(l)} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Tijd (squla-tijd-dagen-1-gouden, "Dagen van de week")

Gemaakt op 11 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-tijd-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-tijd-gouden-zinnen.ts\` en draai het script opnieuw. Bijgewerkt op 18 november 2026: Bliepo als warme juf, **alle zinnen in varianten** (Sara; zoals Tellen, Geld en Klok; oud naast nieuw in WIJZIGINGEN-ZINNEN-TIJD.md). De inhoud (12 vragen, de dagen, de dagkaarten, de getallen en de goede antwoorden, en de 3 vragen die terugkomen) is die van squla-tijd-dagen-1 en blijft gelijk (BOUWREGELS 15.22).

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen les over dagen, de week of de kalender (KOPPELING.md §10). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: eerste en laatste verwisseld, de dag ervoor bij "meteen na", schooldagen bij het weekend, een getal te klein of te groot, of een andere dag. Bliepo zegt alleen wat waar is over wat het kind koos; hij verzint geen reden.

Getallen ("2 dagen", "7 dagen", "5 dagen", de getallen op de knoppen) zijn wit: ze verwijzen naar wagons van verschillende kleuren of naar niets in beeld.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos (bij een kaart met een rood rondje om die kaart zolang hij hem noemt). Daarna de hint en meteen de vraag erachter (nooit precies dezelfde zin als de 1e keer), en tegelijk mag het kind opnieuw kiezen. Alles gaat vanzelf door (15.27).
- **Nooit 2 keer hetzelfde:** de les kiest elke zin uit een rijtje versies met de gedeelde kiezer (\`nooit-dubbel.ts\`): nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen. De hint herhaalt geen getal, geen dagnaam en geen stuk uit de eerste zin. Komt een vraag aan het eind terug, dan kiest de les een andere hint dan de eerste keer.
- **Verklappen (15.17):** de eerste zin, de hint en de vraag opnieuw noemen het goede antwoord niet, er staat geen "tussen … en …", "vlak naast", "bijna" of "dichtbij" in, het rondje staat nooit om het antwoord, en er blijven altijd minstens 2 keuzes over ("Na zaterdag komt nog een dag" mag dus niet: dan blijft alleen zondag over). Het script rekent dat per variant na en stopt bij een verklapper.
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." (5 versies) en dan samen voordoen: de hele trein, Bliepo wijst de dagen aan met het rondje, dan staat het rondje om de goede kaart en het kind tikt hem (de kleine stap; na ± 6 s stilte het hulphandje; vangnet: 20 s niets of 3 keer een andere kaart, dan doet Bliepo het zelf: "Kijk, …", geen "Ja"). Bij een getal tikt het kind het getal (alleen die knop staat er; Bliepo noemt het getal dan niet nog een keer). Daarna gaat de les door.
- **Hetzelfde antwoord 2 keer:** de eerste zin wordt "Je koos weer …" (3 versies). Twee keer dezelfde denkfout met een ander antwoord kan in deze les niet (elke denkfout hoort bij 1 fout antwoord per vraag).
- **Een ander fout antwoord bij de 2e fout:** nooit dezelfde eerste zin als de 1e keer; "Nu koos je …" is 1 van de versies.
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
${DENKFOUTEN.map((c) => `| \`${c}\` | ${DENKFOUT_UITLEG[c]} | ${c === "onduidelijk" ? "BLIEPO-KARAKTER.md §10" : "eigen invulling, niet van Synthesis"} |`).join("\n")}

## 2. De fouttabel: per vraag elk fout antwoord, met alle versies (${VRAGEN.length} vragen; de vragen die terugkomen zijn dezelfde)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo (versies) | Hint (versies; de vraag komt erachter) | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg (versies) en hetzelfde antwoord 2 keer

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Hetzelfde antwoord 2 keer (eerste zin) |
|---|---|---|---|
${uitleg}

## 4. Samen voordoen (alle versies)

| Vraag | Samen voordoen |
|---|---|
${samenRijen}

## 5. De vraag opnieuw na de hint, en de reactie na lof

| Vraag | De vraag opnieuw (versies) | Reactie na lof (versies; de robotzin hooguit 1 keer per les) |
|---|---|---|
${opnieuwRijen}

## 6. Vaste zinnen van het verloop (versies)

| Situatie | Aantal | Versies |
|---|---|---|
${vastRijen}

Lof, korte bevestiging, eindzin, groet en overgang: het vaste rijtje uit BLIEPO-KARAKTER.md (gedeeld met alle gouden lessen; niet veranderd).
`;
writeFileSync(new URL("../FOUTTABEL-squla-tijd-dagen-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-tijd-dagen-1-gouden.md geschreven.");
