/**
 * Maakt FOUTTABEL-squla-dagen-van-de-week-gouden.md uit de code (squla-dagen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.20, 14.22, 14.30, 15.17;
 * LESRECEPT "geleerd bij Tellen", "geleerd bij de keuring Huisnummers", "geleerd bij Geld").
 *   npx tsx scripts/fouttabel-dagen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Inhoudscontrole: dezelfde 17 vragen als squla-dagen-van-de-week (dagen, kaarten, goede antwoorden), het goede antwoord
 * staat tussen de kaarten, en er is bij elke vraag precies 1 goed antwoord, behalve bij "Tik op een dag van het weekend"
 * (zaterdag en zondag goed, 14.30).
 * Verklapcontrole: per vraag en per fout antwoord: geen eerste zin, hint of vraag-opnieuw noemt het goede antwoord
 * (behalve bij "Tik op de wagon van …", waar de vraag de dag zelf noemt), er blijven na de eerste zin minstens 2 keuzes
 * over (het goede er ook bij), geen "tussen … en …", het rondje staat nooit om het antwoord, de zin bij de 2e fout is geen
 * opdracht.
 * Waarheidscontrole: elke losse zin van ELKE variant (eerste zin, hint, uitleg, "weer", hetzelfde antwoord 2 keer) wordt
 * nagelopen tegen DEZE vraag (wat het kind koos, welke dag waar staat, wat vandaag, gisteren en morgen is). Een zin die
 * het script niet kent, telt als fout.
 *
 * 18 november 2026 (warme zinnen in varianten, zoals Tellen, Splitsen, ..., Getallenlijn en Geld): het script keurt nu
 * ALLE varianten, niet alleen de eerste: verklappen, waarheid, geen getal en geen dagnaam 2 keer in 1 stuk, geen hint die
 * met een vraag eindigt, altijd een vraag of opdracht in beeld (15.37, F16; nooit het woord "vinkje"), genoeg varianten
 * per situatie, elk stuk past in het tekstvak, en het speelt de kiezer 20.000 keer na (nooit 2 keer achter elkaar dezelfde).
 */
import { writeFileSync } from "node:fs";
import {
  AANMOEDIG_DOEN,
  ALLE,
  DENKFOUTEN,
  DENKFOUT_UITLEG,
  MAX_STUK,
  VRAGEN,
  WISSEL,
  ZIN,
  afstand,
  beeldVan,
  dagenIn,
  dagenReactie,
  deeltDag,
  deeltGetal,
  eindigtMetOpdracht,
  foutStuk,
  foutenVan,
  na,
  naam,
  nuKoos,
  opnieuwZin,
  opties,
  past,
  pastNa,
  voor,
  weekend2,
  type Fout,
  type Vraag,
} from "../src/components/les/lessen/squla-dagen-gouden-zinnen";
import { EINDE, EINDE_VEEL_FOUTEN } from "../src/components/les/lessen/squla-klok-gouden-zinnen";
import { maakKiezer, maakVorm } from "../src/components/les/lessen/nooit-dubbel";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
const NAMEN = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];
const D = (w: string) => NAMEN.indexOf(w.toLowerCase());
const vorm = maakVorm(WISSEL);
const fouten: string[] = [];

/* 1. Inhoud (11.9, 14.30): de 17 vragen van squla-dagen-van-de-week. */
const OUD: [string, number, number[], number[]][] = [
  ["tik", 3, [], [3]], ["tik", 5, [], [5]], ["tik", 1, [], [1]],
  ["na", 1, [4, 2, 0], [2]], ["na", 4, [5, 3, 6], [5]],
  ["voor", 4, [3, 5, 2], [3]], ["voor", 2, [3, 0, 1], [1]],
  ["mist", 2, [4, 2, 0], [2]], ["mist", 5, [5, 3, 6], [5]], ["mist", 0, [1, 6, 0], [0]],
  ["gm", 2, [], [1]], ["gm", 4, [], [5]],
  ["weekend1", -1, [], [5, 6]], ["weekend2", 5, [], [6]],
  ["na", 6, [5, 0, 1], [0]], ["voor", 0, [6, 1, 5], [6]],
  ["gmMaandag", 0, [1, 6, 5], [6]],
];
if (VRAGEN.length !== OUD.length) fouten.push(`${VRAGEN.length} vragen in plaats van ${OUD.length} (squla-dagen-van-de-week)`);
VRAGEN.forEach((v, i) => {
  const [soort, dag, kaarten, goed] = OUD[i];
  if (v.soort !== soort || v.dag !== dag || v.kaarten.join() !== kaarten.join() || v.goed.join() !== goed.join()) fouten.push(`${v.id}: niet gelijk aan vraag ${i + 1} van de oude les`);
  if (v.kaarten.length && v.goed.some((x) => !v.kaarten.includes(x))) fouten.push(`${v.id}: het goede antwoord ligt niet tussen de kaarten`);
  if (v.kaarten.length && new Set(v.kaarten).size !== v.kaarten.length) fouten.push(`${v.id}: 2 kaarten zijn gelijk`);
  if (v.soort !== "weekend1" && v.goed.length !== 1) fouten.push(`${v.id}: niet precies 1 goed antwoord`);
  const echt = v.soort === "tik" ? [v.dag] : v.soort === "na" ? [na(v.dag)] : v.soort === "voor" ? [voor(v.dag)] : v.soort === "mist" ? [v.dag] : v.soort === "gm" || v.soort === "gmMaandag" ? [v.wat === "gisteren" ? voor(v.dag) : na(v.dag)] : v.soort === "weekend1" ? [5, 6] : [v.dag === 5 ? 6 : 5];
  if (echt.join() !== v.goed.join()) fouten.push(`${v.id}: het goede antwoord klopt niet (${v.goed} in plaats van ${echt})`);
});

/* De vragen met beide varianten van de 2e weekendvraag (het kind koos bij de 1e zaterdag of zondag). */
const ALLE_VRAGEN: Vraag[] = [...VRAGEN, weekend2(6)];

/* 2. Waarheidscontrole: elke losse zin van elke variant, tegen DEZE vraag en wat het kind koos. */
const bekend = (v: Vraag, c: number, z: string): string | null => {
  const d = v.dag;
  const b = beeldVan(v);
  const vandaag = b.vandaag;
  const s = v.soort;
  const gm = s === "gm" || s === "gmMaandag";
  const gist = v.wat === "gisteren";
  const ok = (w: boolean, r: string) => (w ? null : r);
  let m: RegExpMatchArray | null;
  /* Wat het kind koos (ook "Je koos weer maandag." bij hetzelfde antwoord 2 keer). */
  if ((m = z.match(/^(?:Je koos de wagon van|Nu koos je de wagon van|Dit is de wagon van|Je koos|Nu koos je|Je tikte op|Nu tikte je op|Je sleepte|Nu sleepte je|Je koos weer|Je tikte weer op|Je sleepte weer|Dat is weer) (\w+)\.$/)) && D(m[1]) >= 0) return ok(D(m[1]) === c, "noemt niet wat het kind koos");
  if ((m = z.match(/^(\w+)\?$/)) && D(m[1]) >= 0) return ok(D(m[1]) === c, "noemt niet wat het kind koos");
  if ((m = z.match(/^Weer (\w+), zie ik\.$/)) && D(m[1]) >= 0) return ok(D(m[1]) === c, "noemt niet wat het kind koos");
  /* Tik op de wagon van …: vlak naast. */
  if (/^(Je zit er vlak naast|Die wagon staat er vlak naast|Je bent er heel dichtbij|Je zat er weer vlak naast|Weer vlak ernaast, zie ik)\.$/.test(z)) return ok(s === "tik" && Math.abs(c - d) === 1, "staat niet vlak naast");
  /* Na en voor. */
  if ((m = z.match(/^Die dag (?:komt|hangt) voor (\w+)\.$/))) return ok(D(m[1]) === d && c === voor(d) && s === "na", "komt niet direct voor");
  if ((m = z.match(/^Die dag (?:komt na|hangt achter) (\w+)\.$/))) return ok(D(m[1]) === d && c === na(d) && s === "voor", "komt niet direct na");
  if (/^Die dag komt ervoor, niet erna\.$/.test(z)) return ok(s === "na" && c === voor(d), "komt niet ervoor");
  if (/^Die dag komt erna, niet ervoor\.$/.test(z)) return ok(s === "voor" && c === na(d), "komt niet erna");
  if ((m = z.match(/^(?:Die dag komt niet direct na|Die hangt niet direct achter) (\w+)\.$/))) return ok(D(m[1]) === d && c !== na(d), "komt wel direct na");
  if ((m = z.match(/^(?:Die dag komt niet direct voor|Die hangt niet direct voor) (\w+)\.$/))) return ok(D(m[1]) === d && c !== voor(d), "komt wel direct voor");
  if (/^(Die dag ligt verder weg|Die is verder weg|Weer een dag verder weg, zie ik)\.$/.test(z)) return ok(["na", "voor", "gm", "gmMaandag"].includes(s) && afstand(c, d) >= 2, "ligt niet verder weg");
  if ((m = z.match(/^Je koos weer de dag (voor|na) (\w+)\.$/))) return ok(D(m[2]) === d && c === (m[1] === "na" ? na(d) : voor(d)) && s === (m[1] === "na" ? "voor" : "na"), "klopt niet met wat het kind koos");
  if (/^Weer de dag ervoor, zie ik\.$/.test(z)) return ok(s === "na" && c === voor(d), "klopt niet");
  if (/^Weer de dag erna, zie ik\.$/.test(z)) return ok(s === "voor" && c === na(d), "klopt niet");
  if ((m = z.match(/^Je koos weer een dag die niet direct (na|voor) (\w+) komt\.$/))) return ok(D(m[2]) === d && c !== (m[1] === "na" ? na(d) : voor(d)), "klopt niet");
  /* Er mist een dag. */
  if (/^(Die dag hangt al vlak naast de lege plek|Die hangt al naast de lege plek|Die dag rijdt al mee, vlak ernaast|Je sleepte weer een dag die er al naast hangt|Weer een dag die er al naast hangt, zie ik)\.$/.test(z)) return ok(s === "mist" && b.wagons.includes(c) && Math.abs(b.wagons.indexOf(c) - b.wagons.indexOf(null)) === 1, "hangt niet vlak naast de lege plek");
  if (/^(Die dag hangt al ergens anders in de trein|Die rijdt al mee in de trein|Die dag heeft al een wagon|Je sleepte weer een dag die al in de trein hangt|Weer een dag die al meerijdt, zie ik)\.$/.test(z)) return ok(s === "mist" && b.wagons.includes(c), "hangt niet in de trein");
  /* Gisteren, vandaag en morgen. */
  if (/^(Dat is vandaag|Dat is vandaag, bij de pijl|Je tikte op de dag van vandaag|Je koos weer vandaag|Weer vandaag, zie ik)\.$/.test(z)) return ok(vandaag !== null && c === vandaag, "is niet vandaag");
  if (/^(Dat is morgen|Dat is morgen, de dag erna|Die dag moet nog komen|Je koos weer morgen|Weer morgen, zie ik)\.$/.test(z)) return ok(vandaag !== null && c === na(vandaag), "is niet morgen");
  if (/^(Dat was gisteren|Dat was gisteren, de dag ervoor|Die dag is al voorbij|Je koos weer gisteren|Weer gisteren, zie ik)\.$/.test(z)) return ok(vandaag !== null && c === voor(vandaag), "was niet gisteren");
  if (/^(Die dag ligt verder van vandaag af|Die dag ligt verder weg van vandaag|Je koos weer een dag die verder van vandaag af ligt)\.$/.test(z)) return ok(vandaag !== null && afstand(c, vandaag) >= 2, "is niet verder weg");
  /* Het weekend. */
  if (/^(Dat is een schooldag|Dan ga je naar school|Die dag hoort niet bij het weekend|Je koos weer een schooldag|Weer een schooldag, zie ik)\.$/.test(z)) return ok(c >= 0 && c <= 4, "is geen schooldag");
  /* Hints (hoe je zoekt, waar je kijkt). */
  if (/^(Lees de bordjes vanaf maandag, vooraan|De week begint vooraan met maandag|Lees de bordjes van voor naar achter|De wagons staan op volgorde van de week)\.$/.test(z)) return ok(s === "tik" && b.wagons[0] === 0, "past niet");
  if ((m = z.match(/^Zeg de dagen op tot (\w+)\.$/))) return ok(s === "tik" && D(m[1]) === d, "andere dag dan de vraag");
  if (/^Tik dan op die wagon\.$/.test(z)) return ok(s === "tik", "past niet");
  if (/^(Na is de dag die erachter komt|De dag erna hoort op de lege plek|De lege plek is de wagon erachter)\.$/.test(z)) return ok(s === "na" && b.wagons[1] === null, "past niet");
  if (/^(Voor is de dag die ervoor komt|De dag ervoor hoort op de lege plek|De lege plek is de wagon ervoor)\.$/.test(z)) return ok(s === "voor" && b.wagons[0] === null, "past niet");
  if (/^Zeg de dagen op, vanaf het begin van de week\.$/.test(z)) return ok(s === "na" || s === "voor", "past niet");
  if (/^(Na de laatste dag begint de week opnieuw|Na het weekend begint een nieuwe week|Zeg de dagen op tot het eind|Dan begint de week weer)\.$/.test(z)) return ok(s === "na" && d === 6, "past niet");
  if (/^(Ervoor was de vorige week|Zeg de dagen van de week op, tot het eind)\.$/.test(z)) return ok(s === "voor" && d === 0, "past niet");
  if (/^Denk aan het eind van de vorige week\.$/.test(z)) return ok((s === "voor" && d === 0) || s === "gmMaandag", "past niet");
  if (/^(Kijk naar de wagons naast de lege plek|Sleep de dag die daartussen hoort|Lees de bordjes naast de lege plek|Sleep de dag die daar hoort)\.$/.test(z)) return ok(s === "mist" && d > 0 && d < 6, "de lege plek heeft geen 2 buren");
  if (/^(Kijk naar de wagon achter de lege plek|Sleep de dag die daarvoor komt)\.$/.test(z)) return ok(s === "mist" && d === 0, "past niet");
  if (/^Zeg de dagen op vanaf maandag\.$/.test(z)) return ok(s === "mist" && d !== 0, "past niet");
  if (/^(Zeg de dagen op vanaf het begin van de week|Sleep de dag die mist|Sleep die naar de lege plek)\.$/.test(z) || /^Welke dag hangt er niet in de trein\?$/.test(z)) return ok(s === "mist", "past niet");
  if (/^(Gisteren is de dag voor vandaag|Gisteren is al voorbij|Gisteren is de wagon voor vandaag)\.$/.test(z)) return ok(s === "gm" && gist, "past niet");
  if (/^(Morgen is de dag na vandaag|Morgen moet nog komen|Morgen is de wagon achter vandaag)\.$/.test(z)) return ok(s === "gm" && !gist, "past niet");
  if (/^Bij de pijl is het vandaag\.$/.test(z)) return ok(s === "gm" && vandaag !== null, "geen pijl");
  if (/^(Gisteren was nog de vorige week|Maandag is de eerste dag|Gisteren was de dag daarvoor)\.$/.test(z)) return ok(s === "gmMaandag", "past niet");
  if (/^(In het weekend is er geen school|Op een schooldag ga je naar school|Het weekend zijn de dagen zonder school)\.$/.test(z)) return ok(s === "weekend1" || s === "weekend2", "past niet");
  if ((m = z.match(/^(\w+) heb je al\.$/)) || (m = z.match(/^(\w+) is 1 van de 2 dagen van het weekend\.$/))) return ok(s === "weekend2" && D(m[1]) === d, "die dag koos het kind niet");
  if (/^(Het weekend heeft 2 dagen|Er is nog een dag zonder school)\.$/.test(z)) return ok(s === "weekend2" || s === "weekend1", "past niet");
  /* Uitleg bij de 2e keer en "weer" (daarna doet Bliepo het samen voor). */
  if (/^(Maandag staat vooraan|Daarna komen de andere dagen, op volgorde|Elke dag heeft een eigen wagon, met de naam op het bordje|De trein rijdt met de dagen op volgorde, net als de week|Elke wagon is 1 dag|Ze staan op volgorde|De dagen staan in de trein op volgorde van de week)\.$/.test(z)) return ok(s === "tik", "past niet");
  if ((m = z.match(/^Na (\w+) komt de dag die er direct achter hangt\.$/))) return ok(s === "na" && D(m[1]) === d && d !== 6, "past niet");
  if (/^(Na is altijd de dag erachter in de week|De dag erna hangt direct achter de andere|Na is de dag erachter, niet de dag ervoor|Na kijk je vooruit in de week, niet terug|Na is de dag die er direct achter komt|De dag erna hangt meteen erachter, niet verder)\.$/.test(z)) return ok(s === "na", "past niet");
  if (/^(Na zondag begint de week weer vooraan in de trein|Daarna begint de week opnieuw|Na de laatste dag begint een nieuwe week)\.$/.test(z)) return ok(s === "na" && d === 6, "past niet");
  if ((m = z.match(/^Voor (\w+) komt de dag die er direct voor hangt\.$/))) return ok(s === "voor" && D(m[1]) === d && d !== 0, "past niet");
  if (/^(Voor is altijd de dag ervoor in de week|De dag ervoor hangt direct voor de andere|Voor is de dag ervoor, niet de dag erachter|Voor kijk je terug in de week, niet vooruit|Voor is de dag die er direct voor komt|De dag ervoor hangt meteen ervoor, niet verder)\.$/.test(z)) return ok(s === "voor", "past niet");
  if (/^(Een week eindigt met zondag|Daarna begint een nieuwe week met maandag|Voor de eerste dag komt het eind van de vorige week|De vorige week eindigde met de laatste dag)\.$/.test(z)) return ok(s === "voor" && d === 0, "past niet");
  if (/^Een week heeft 7 dagen\.$/.test(z)) return null;
  if (/^(Elke dag hangt 1 keer in de trein, op volgorde|Op de lege plek hoort de dag die nog mist|Elke dag hangt maar 1 keer in de trein|Wat al in de trein hangt, hoort niet op de lege plek|Elke wagon heeft een andere dag)\.$/.test(z)) return ok(s === "mist", "past niet");
  if (/^Er rijden er nu 6 mee\.$/.test(z)) return ok(s === "mist" && b.wagons.filter((x) => x !== null).length === 6, "er rijden er geen 6 mee");
  if (/^(Gisteren is de dag voor vandaag, de wagon ervoor|Gisteren is de dag die net voorbij is|Eerst was het gisteren, nu is het vandaag|Gisteren is maar 1 dag geleden|Gisteren ligt vlak naast vandaag)\.$/.test(z)) return ok(s === "gm" && gist, "past niet");
  if (/^(Morgen is de dag na vandaag, de wagon erachter|Morgen is de dag die nu nog komt|Eerst is het vandaag, daarna morgen|Morgen is over 1 dag|Morgen ligt vlak naast vandaag)\.$/.test(z)) return ok(s === "gm" && !gist, "past niet");
  if (/^(Gisteren is voorbij, morgen moet nog komen|Gisteren was de dag ervoor|Morgen is de dag erna)\.$/.test(z)) return ok(gm, "past niet");
  if (/^(Vandaag is de dag van de pijl|De pijl wijst naar vandaag|We zoeken een andere dag)\.$/.test(z)) return ok(gm && vandaag !== null, "past niet");
  if (/^(Voor maandag komt de laatste dag van de vorige week|Gisteren hoort bij de vorige week|De vorige week eindigde gisteren)\.$/.test(z)) return ok(s === "gmMaandag", "past niet");
  if (/^(Het weekend is zaterdag en zondag|Van maandag tot en met vrijdag is er school|In het weekend ga je niet naar school|Zaterdag en zondag horen samen bij het weekend|Het weekend heeft 2 dagen, achteraan in de week|In het weekend niet|Op zaterdag en zondag is er geen school)\.$/.test(z)) return ok(s === "weekend1" || s === "weekend2", "past niet");
  return `onbekende zin (niet na te lopen): "${z}"`;
};

/* 3. Keuring van elke zin en elk stuk. */
const woorden = (z: string) => z.split(/\s+/).filter(Boolean).length;
const dubbelGetal = (z: string) => {
  const n = getallenIn(z);
  return n.find((x, i) => n.indexOf(x) !== i);
};
/** Een dagnaam die 2 keer in 1 stuk staat ("Je koos maandag. Maandag …"). */
const dubbelDag = (z: string) => NAMEN.find((n) => (kaal(z).toLowerCase().match(new RegExp(`\\b${n}\\b`, "g")) ?? []).length > 1);
const OPDRACHT = /(^|[.!?:] )(Tik|Zoek|Kies|Lees|Kijk|Tel|Sleep|Wijs|Zeg|Zet)\b/;
/** Staat er een vraag of een opdracht die zegt wat het kind doet (15.37, F16)? "Kijk" en "Lees" alleen zijn geen opdracht. */
const isVraagOfOpdracht = (z: string) => /\?/.test(z) || /(^|[.!?:] )(?:Nu jij! )?(Tik|Zoek|Kies|Sleep)\b/.test(kaal(z));
const keurStuk = (waar: string, z: string, o: { dagMag?: boolean } = {}) => {
  const k = kaal(z);
  if (/\bfout(en|je)?\b/i.test(k)) fouten.push(`${waar}: het woord "fout" ("${k}")`);
  if (/vinkje/i.test(k)) fouten.push(`${waar}: het woord "vinkje" (het lesscherm laat die zin weg, 15.37) ("${k}")`);
  if (dubbelGetal(z) !== undefined) fouten.push(`${waar}: het getal ${dubbelGetal(z)} staat er 2 keer ("${k}")`);
  if (!o.dagMag && dubbelDag(z)) fouten.push(`${waar}: de dag ${dubbelDag(z)} staat er 2 keer ("${k}")`);
  if (zinnenVan(z).length > 3) fouten.push(`${waar}: meer dan 3 zinnen in 1 stuk ("${k}")`);
  for (const d of zinnenVan(z)) if (woorden(d) > 14) fouten.push(`${waar}: zin van ${woorden(d)} woorden ("${d}")`);
  if (k.length > MAX_STUK) fouten.push(`${waar}: ${k.length} tekens, past niet in het tekstvak (hooguit ${MAX_STUK}) ("${k}")`);
  /* Elk getal heeft een kleur of wit (14.20): geen kaal cijfer. */
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) fouten.push(`${waar}: getal zonder kleur (14.20) ("${z}")`);
};
const genoeg = (waar: string, lijst: readonly string[], n: number) => {
  if (lijst.length < n) fouten.push(`${waar}: ${lijst.length} varianten, ${n} nodig`);
  if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${waar}: 2 varianten zijn dezelfde zin`);
};
const keuzeVraag = (v: Vraag) => v.invoer !== "sleep";
/** Welke versies van de vraag passen achter een hint (zoals `opnieuwZin` kiest). */
const opnieuwBij = (v: Vraag, h: string) => (eindigtMetOpdracht(h) ? [""] : ZIN.opnieuw(v).filter((z) => past(h, z) && !deeltDag(h, z) && !deeltGetal(h, z)));

let beweringen = 0;
const verklap = (v: Vraag, c: number, f: Fout): string[] => {
  const uit: string[] = [];
  if (!f.v.eerste.length) uit.push("geen eerste zin");
  if (!f.v.hint.length) uit.push("geen hint");
  for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.hint, ...(keuzeVraag(v) ? ZIN.opnieuw(v) : [])]) {
    if (/tussen .* en /i.test(kaal(z))) uit.push(`"tussen … en …" in eerste zin of hint ("${kaal(z)}")`);
    /* Het goede antwoord niet genoemd (bij "Tik op de wagon van …" noemt de vraag de dag zelf). */
    if (v.soort !== "tik") for (const a of v.goed) if (dagenIn(z).includes(a)) uit.push(`de eerste zin, hint of vraag noemt het antwoord (${naam(a)}) ("${kaal(z)}")`);
  }
  if (v.goed.includes(c)) uit.push("rondje om het antwoord");
  if (!v.goed.some((a) => f.over.includes(a))) uit.push("het goede antwoord valt weg na de eerste zin (de zin klopt niet)");
  if (f.over.length < 2) uit.push(`na de eerste zin blijft alleen ${f.over.map(naam).join("")} over`);
  /* Hints: bij kiezen eindigt geen hint met een vraag; eindigt hij niet met een opdracht, dan passen er 2 versies van de
     vraag achter (in het tekstvak, zonder dezelfde dag of hetzelfde getal). Bij slepen is de hint de nieuwe opdracht. */
  for (const h of f.v.hint) {
    if (/\?\s*$/.test(kaal(h))) uit.push(`de hint eindigt met een vraag ("${kaal(h)}")`);
    if (!keuzeVraag(v)) {
      if (!eindigtMetOpdracht(h)) uit.push(`de hint is geen opdracht (15.37) ("${kaal(h)}")`);
      continue;
    }
    if (eindigtMetOpdracht(h)) continue;
    if (isVraagOfOpdracht(h)) uit.push(`er staat een opdracht midden in de hint ("${kaal(h)}")`);
    const op = opnieuwBij(v, h);
    if (op.length < 2) uit.push(`bij de hint "${kaal(h)}" passen minder dan 2 versies van de vraag`);
    for (const z of op) if (!isVraagOfOpdracht(z)) uit.push(`de vraag achter de hint is geen vraag of opdracht ("${kaal(z)}")`);
  }
  /* De zinnen bij de 2e keer zijn uitleg, geen opdracht (keuring Getallenlijn). */
  for (const z of [...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg]) for (const d1 of zinnenVan(z)) if (OPDRACHT.test(d1)) uit.push(`opdracht in de uitleg bij de 2e keer: "${d1}"`);
  for (const z of f.v.weerEerste) if (!/\bweer\b/i.test(z)) uit.push(`"weer" ontbreekt ("${kaal(z)}")`);
  /* Genoeg varianten. */
  genoeg("eerste zin", f.v.eerste, 3);
  genoeg("hint", f.v.hint, 3);
  genoeg("uitleg", f.v.uitleg, 3);
  if (f.v.weerEerste.length) {
    genoeg('"weer"', f.v.weerEerste, 2);
    genoeg('uitleg bij "weer"', f.v.weerUitleg, 2);
  }
  /* Bij elke eerste zin passen minstens 2 hints en 2 uitleggen zonder herhaald getal, dagnaam of stuk. */
  for (const e of [...f.v.eerste, nuKoos(f.v.eerste[0])]) {
    if (new Set(f.v.hint.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 hints zonder herhaling`);
    if (new Set(f.v.uitleg.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaling`);
  }
  for (const e of ZIN.weerGekozen(v, c)) if (new Set(f.v.uitleg.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaling`);
  for (const e of f.v.weerEerste) if (new Set(f.v.weerUitleg.filter(pastNa(e)).map(vorm)).size < 2) uit.push(`bij "${kaal(e)}" passen minder dan 2 uitleggen zonder herhaling`);
  /* Waarheid: elke losse zin van elke variant. */
  for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.hint, ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg, ...ZIN.weerGekozen(v, c)])
    for (const d1 of zinnenVan(z)) {
      beweringen++;
      const r = bekend(v, c, d1);
      if (r) uit.push(`waarheidscontrole: ${r} ("${d1}")`);
    }
  return uit;
};

let telling = 0;
let variantenTeller = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of ALLE_VRAGEN) {
  const tabel = foutenVan(v);
  const d = v.dag;
  const a = v.goed[0];
  const nodig = opties(v).filter((k) => !v.goed.includes(k)).length;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [k, f] of Object.entries(tabel)) {
    const c = Number(k);
    telling++;
    if (!DENKFOUTEN.includes(f.code) || f.code === "onduidelijk") fouten.push(`${v.id} ${naam(c)}: geen vaste denkfout (${f.code})`);
    for (const r of verklap(v, c, f)) fouten.push(`${v.id} ${naam(c)}: ${r}`);
    for (const z of [...f.v.eerste, nuKoos(f.v.eerste[0]), ...f.v.uitleg, ...f.v.weerEerste, ...f.v.weerUitleg, ...ZIN.weerGekozen(v, c)]) {
      variantenTeller++;
      keurStuk(`${v.id} ${naam(c)}`, z);
    }
    /* De hint samen met de vraag erachter is 1 stuk. */
    for (const h of f.v.hint)
      for (const z of keuzeVraag(v) ? opnieuwBij(v, h) : [""]) {
        variantenTeller++;
        keurStuk(`${v.id} ${naam(c)} hint`, `${h} ${z}`.trim(), { dagMag: v.soort === "tik" });
        if (!isVraagOfOpdracht(`${h} ${z}`)) fouten.push(`${v.id} ${naam(c)}: na de hint staat er geen vraag of opdracht (15.37) ("${kaal(`${h} ${z}`)}")`);
      }
    genoeg(`${v.id} ${naam(c)}: hetzelfde antwoord 2 keer`, ZIN.weerGekozen(v, c), 3);
    for (const z of ZIN.weerGekozen(v, c)) if (!/\bweer\b/i.test(z)) fouten.push(`${v.id} ${naam(c)}: "weer" ontbreekt ("${kaal(z)}")`);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    for (const h of f.v.hint) hintsPerCode.get(f.code)!.add(kaal(h));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
  }
  /* De vraag zelf: een vraag of opdracht (15.36, 15.37). */
  for (const vraag of [ZIN.vraag(v, true).join(" "), ZIN.vraag(v, false).join(" ")]) {
    keurStuk(`${v.id} vraag`, vraag);
    if (!isVraagOfOpdracht(vraag)) fouten.push(`${v.id} vraag: geen vraag en geen opdracht (15.37) ("${kaal(vraag)}")`);
  }
  if (keuzeVraag(v)) {
    genoeg(`${v.id} opnieuw`, ZIN.opnieuw(v), 3);
    for (const z of ZIN.opnieuw(v)) if (!isVraagOfOpdracht(z)) fouten.push(`${v.id} opnieuw: geen vraag en geen opdracht ("${kaal(z)}")`);
  }
  /* Samen voordoen: alle varianten per stap, en wat het kind dan doet (F16). */
  const verloop: [string, readonly string[], number][] = [["samen", ZIN.samen, 5]];
  const wacht: [string, readonly string[]][] = [];
  const klopt: string[] = [];
  if (v.soort === "tik") {
    verloop.push(["samenTelBegin", ZIN.samenTelBegin, 3], ["samenKlaar", ZIN.samenTikKlaar(d), 3], ["samenZelf", ZIN.samenTikZelf(d), 2]);
    wacht.push(["samen: nu jij", ZIN.samenWagonJij], ["hulphandje", ZIN.handWagon]);
    klopt.push(...ZIN.samenTikKlaar(d), ...ZIN.samenTikZelf(d));
    for (const z of [...ZIN.samenTikKlaar(d), ...ZIN.samenTikZelf(d)]) if (dagenIn(z).join() !== String(d)) fouten.push(`${v.id}: samen-zin noemt een andere dag ("${kaal(z)}")`);
  }
  if (v.soort === "na" || v.soort === "voor") {
    const isNa = v.soort === "na";
    const stap = isNa ? ZIN.samenNa(d) : ZIN.samenVoor(d);
    const klaar = isNa ? ZIN.samenNaKlaar(d) : ZIN.samenVoorKlaar(d);
    const zelf = isNa ? ZIN.samenNaZelf(d) : ZIN.samenVoorZelf(d);
    verloop.push(["samenHier", ZIN.samenHier(d), 3], [isNa ? "samenNa" : "samenVoor", stap, 3], ["samenKlaar", klaar, 3], ["samenZelf", zelf, 2]);
    wacht.push(["samen: nu jij", ZIN.samenKaartJij], ["hulphandje", ZIN.handKaart]);
    for (const z of ZIN.samenHier(d)) if (dagenIn(z).join() !== String(d)) fouten.push(`${v.id}: samen-zin noemt een andere dag ("${kaal(z)}")`);
    for (const z of stap) if (!dagenIn(z).includes(a) || dagenIn(z).some((x) => x !== a)) fouten.push(`${v.id}: het rondje staat om ${naam(a)}, maar Bliepo noemt iets anders ("${kaal(z)}")`);
    for (const z of [...klaar, ...zelf]) if (dagenIn(z).sort().join() !== [a, d].sort().join()) fouten.push(`${v.id}: samen-zin klopt niet ("${kaal(z)}")`);
  }
  if (v.soort === "mist") {
    for (const [i, [id, zinnen]] of ZIN.samenMistBuren(d).entries()) {
      verloop.push([`samenMistBuur${i}`, zinnen, 2]);
      for (const z of zinnen) if (!dagenIn(z).includes(Number(id.slice(1)))) fouten.push(`${v.id}: het rondje staat om een andere wagon dan Bliepo noemt ("${kaal(z)}")`);
    }
    verloop.push(["samenMistDag", ZIN.samenMistDag(d), 2], ["samenMistKlaar", ZIN.samenMistKlaar, 3], ["samenZelf", ZIN.samenMistZelf(d), 2]);
    for (const z of [...ZIN.samenMistDag(d), ...ZIN.samenMistZelf(d)]) if (!dagenIn(z).includes(d)) fouten.push(`${v.id}: samen-zin noemt de dag die mist niet ("${kaal(z)}")`);
    wacht.push(["samen: nu jij", ZIN.samenMistJij], ["hulphandje", ZIN.handSleep], ["opdracht: hulphandje", ZIN.mistHand]);
  }
  if (v.soort === "gm" || v.soort === "gmMaandag") {
    verloop.push(["samenVandaag", ZIN.samenVandaag(d), 2], ["samenGm", ZIN.samenGm(d, v.wat!), 2], ["samenKlaar", ZIN.samenGmKlaar(a, v.wat!), 3], ["samenZelf", ZIN.samenGmZelf(a, v.wat!), 2]);
    wacht.push(["samen: nu jij", v.soort === "gmMaandag" ? ZIN.samenKaartJij : ZIN.samenWagonJij], ["hulphandje", v.soort === "gmMaandag" ? ZIN.handKaart : ZIN.handWagon]);
    for (const z of ZIN.samenVandaag(d)) if (dagenIn(z).join() !== String(d)) fouten.push(`${v.id}: samen-zin noemt een andere dag als vandaag ("${kaal(z)}")`);
    for (const z of [...ZIN.samenGm(d, v.wat!), ...ZIN.samenGmKlaar(a, v.wat!), ...ZIN.samenGmZelf(a, v.wat!)]) if (dagenIn(z).join() !== String(a)) fouten.push(`${v.id}: samen-zin noemt een andere dag ("${kaal(z)}")`);
  }
  if (v.soort === "weekend1") {
    verloop.push(["samenWeekend", ZIN.samenWeekend, 2], ["samenKlaar", ZIN.samenWeekendKlaar(5), 3], ["samenKlaar", ZIN.samenWeekendKlaar(6), 3], ["samenZelf", ZIN.samenWeekendZelf, 2]);
    wacht.push(["samen: nu jij", ZIN.samenWeekendJij], ["hulphandje", ZIN.handWagon]);
  }
  if (v.soort === "weekend2") {
    verloop.push(["samenWeekend2", ZIN.samenWeekend2(a), 2], ["samenKlaar", ZIN.samenWeekend2Klaar, 3], ["samenZelf", ZIN.samenWeekend2Zelf, 2]);
    wacht.push(["samen: nu jij", ZIN.samenWagonJij], ["hulphandje", ZIN.handWagon]);
    for (const z of ZIN.samenWeekend2(a)) if (dagenIn(z).join() !== String(a)) fouten.push(`${v.id}: samen-zin noemt een andere dag ("${kaal(z)}")`);
  }
  for (const [n, lijst, k] of verloop) {
    genoeg(`${v.id} ${n}`, lijst, k);
    for (const z of lijst) {
      variantenTeller++;
      keurStuk(`${v.id} ${n}`, z);
    }
  }
  for (const [n, lijst] of wacht) {
    genoeg(`${v.id} ${n}`, lijst, 2);
    for (const z of lijst) {
      keurStuk(`${v.id} ${n}`, z);
      if (!isVraagOfOpdracht(z)) fouten.push(`${v.id} ${n}: geen vraag en geen opdracht (15.37) ("${kaal(z)}")`);
    }
  }
  /* Na het vangnet geen "Ja" alsof het kind het deed (keuring Meer-minder); de test zoekt "Kijk, ". */
  const zelfZinnen = v.soort === "tik" ? ZIN.samenTikZelf(d) : v.soort === "na" ? ZIN.samenNaZelf(d) : v.soort === "voor" ? ZIN.samenVoorZelf(d) : v.soort === "mist" ? ZIN.samenMistZelf(d) : v.soort === "weekend1" ? ZIN.samenWeekendZelf : v.soort === "weekend2" ? ZIN.samenWeekend2Zelf : ZIN.samenGmZelf(a, v.wat!);
  for (const z of zelfZinnen) if (!/^Kijk, /.test(z)) fouten.push(`${v.id}: de zin na het vangnet begint niet met "Kijk, " ("${kaal(z)}")`);
  void klopt;
  /* De reactie na lof: genoeg varianten, alleen dagen van deze vraag. */
  for (const x of v.goed) {
    const reactie = dagenReactie(v, x);
    genoeg(`${v.id} reactie na lof`, reactie.zinnen, 7);
    const mag = new Set([d, ...v.goed, ...(v.soort === "na" && d === 6 ? [0] : []), ...(v.soort === "weekend2" ? [5, 6] : []), ...(v.soort === "mist" ? [voor(d)] : [])]);
    for (const z of reactie.zinnen) {
      keurStuk(`${v.id} reactie na lof`, z);
      for (const y of dagenIn(z)) if (!mag.has(y)) fouten.push(`${v.id}: een reactie bij goed noemt een andere dag (${naam(y)}) ("${kaal(z)}")`);
    }
  }
}
/* De vaste zinnen van het verloop: genoeg varianten, elk stuk gekeurd. */
const VAST: [string, readonly string[], number][] = [
  ["begin", ZIN.start, 3], ["er mist een dag", ZIN.mistIntro, 3], ["vangnet slepen", ZIN.mistVangnet, 2], ["slot", ZIN.slot, 3], ["bij de kaart", ZIN.kaartTik, 3], ["aanmoediging", AANMOEDIG_DOEN, 5],
];
for (const [n, lijst, k] of VAST) {
  genoeg(n, lijst, k);
  for (const z of lijst) {
    variantenTeller++;
    keurStuk(n, z);
  }
}
for (const z of ALLE.map(ZIN.samenTelDag)) keurStuk("samen tellen", z);
/* Het begin (met de groet in 1 stuk) is nooit langer dan de oude beginzin: die paste in het tekstvak (15.30). */
for (const z of ZIN.start) if (z.length > ZIN.start[0].length) fouten.push(`begin: langer dan de oude beginzin ("${z}")`);
/* Het hulphandje: aanmoediging + opdracht in 1 stuk; het einde: eindzin + "Tik op de kaart." in 1 stuk. */
for (const a of AANMOEDIG_DOEN) for (const h of [...ZIN.handWagon, ...ZIN.handKaart, ...ZIN.handSleep, ...ZIN.mistHand]) keurStuk("hulphandje", `${a} ${h}`);
for (const e of [...EINDE.zinnen, EINDE_VEEL_FOUTEN]) for (const k of ZIN.kaartTik) if (kaal(`${e} ${k}`).length > MAX_STUK) fouten.push(`einde: "${e} ${k}" past niet in het tekstvak`);
for (const k of ZIN.kaartTik) if (!isVraagOfOpdracht(k)) fouten.push(`bij de kaart: geen opdracht ("${k}")`);

/* Afwisseling (5.10): elke denkfout heeft minstens 3 hints. */
for (const [code, n] of aantalPerCode) if ((hintsPerCode.get(code)?.size ?? 0) < 3) fouten.push(`denkfout ${code}: ${n} keer, maar minder dan 3 hints`);

/*
  4. De kiezer naspelen (18 nov 2026): 20.000 vragen met willekeurige antwoorden die niet goed zijn, met precies de keuze
  van de les (`foutStuk`, `opnieuwZin`, dezelfde sleutels). Nooit 2 keer achter elkaar dezelfde zin binnen 1 situatie; de
  2e keer nooit dezelfde eerste zin als de 1e keer; geen zin 2 keer in 1 reactie; de hint herhaalt geen getal, dagnaam of
  stuk uit de eerste zin; "weer" alleen als het klopt; elk stuk past in het tekstvak; altijd een vraag of opdracht.
*/
{
  let zaad = 12345;
  const toeval = () => ((zaad = (zaad * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const K = maakKiezer({ wissel: WISSEL, toeval });
  const vorige = new Map<string, string>();
  const tel = { dubbel: 0, herhaald: 0, zelfdeEerste: 0, inReactie: 0, weer: 0, lang: 0, geenOpdracht: 0, reacties: 0 };
  const voorbeelden: string[] = [];
  const meld = (soort: keyof typeof tel, tekst: string) => {
    tel[soort]++;
    if (voorbeelden.length < 8) voorbeelden.push(`${soort}: ${tekst}`);
  };
  const variant = (sleutel: string, zinnen: readonly string[], mag?: (z: string) => boolean) => {
    const z = K.kies(sleutel, zinnen, mag);
    if (vorige.get(sleutel) === vorm(z) && new Set(zinnen.map(vorm)).size > 1) meld("dubbel", `${sleutel}: 2 keer "${kaal(z)}"`);
    vorige.set(sleutel, vorm(z));
    if (kaal(z).length > MAX_STUK) meld("lang", kaal(z));
    return z;
  };
  const pak = <T,>(l: readonly T[]) => l[Math.floor(toeval() * l.length)];
  const hand = (sleutel: string, lijst: readonly string[]) => {
    const z = `${variant("aanmoedig", AANMOEDIG_DOEN)} ${variant(sleutel, lijst)}`;
    if (kaal(z).length > MAX_STUK) meld("lang", kaal(z));
    if (!isVraagOfOpdracht(z)) meld("geenOpdracht", kaal(z));
  };
  variant("start", ZIN.start);
  for (let i = 0; i < 20000; i++) {
    const v = pak(ALLE_VRAGEN);
    const d = v.dag;
    const a = v.goed[0];
    const tabel = foutenVan(v);
    const antwoorden = Object.keys(tabel);
    if (v.soort === "mist") {
      variant("mistIntro", ZIN.mistIntro);
      if (toeval() < 0.3) hand("mistHand", ZIN.mistHand);
      if (toeval() < 0.05) variant("mistVangnet", ZIN.mistVangnet);
    }
    if (toeval() < 0.15) continue; /* meteen goed */
    const a1 = pak(antwoorden);
    const f1 = tabel[a1];
    const o = (k: string, zelfde: boolean) => ({ x: Number(k), zelfdeAntwoord: zelfde, onduidelijk: () => "Die is lastig, hè." });
    const s1 = foutStuk(variant, f1, v, 1, null, o(a1, false));
    tel.reacties++;
    if (!pastNa(s1[0])(s1[1])) meld("herhaald", `"${kaal(s1.join(" "))}"`);
    if (/\bweer\b/i.test(s1[0])) meld("weer", `"weer" bij de 1e keer: "${kaal(s1[0])}"`);
    const op = opnieuwZin(variant, v, s1[1]);
    const stuk = `${s1[1]} ${op}`.trim();
    if (kaal(stuk).length > MAX_STUK) meld("lang", kaal(stuk));
    if (!isVraagOfOpdracht(stuk)) meld("geenOpdracht", kaal(stuk));
    if (op && (deeltDag(s1[1], op) || deeltGetal(s1[1], op))) meld("herhaald", `"${kaal(stuk)}"`);
    if (toeval() < 0.3) continue; /* de 2e keer goed */
    const a2 = toeval() < 0.4 ? a1 : pak(antwoorden);
    const f2 = tabel[a2];
    const s2 = foutStuk(variant, f2, v, 2, f1, o(a2, a2 === a1));
    tel.reacties++;
    if (!pastNa(s2[0])(s2[1])) meld("herhaald", `"${kaal(s2.join(" "))}"`);
    if (vorm(s2[0]) === vorm(s1[0])) meld("zelfdeEerste", `"${kaal(s1[0])}" en daarna "${kaal(s2[0])}"`);
    if (vorm(s2[0]) === vorm(s2[1]) || vorm(s1[0]) === vorm(s1[1])) meld("inReactie", kaal(s2.join(" ")));
    if (/\bweer\b/i.test(s2[0]) && !(a2 === a1 || f1.soort === f2.soort)) meld("weer", `"weer" uit het niets: "${kaal(s2[0])}"`);
    /* Samen voordoen: dezelfde sleutels als de les. */
    const sm = variant("samen", ZIN.samen);
    if (vorm(sm) === vorm(s2[0])) meld("inReactie", kaal(sm));
    const zelf = toeval() < 0.1;
    let jij: readonly string[] = ZIN.samenWagonJij;
    let handZ: readonly string[] = ZIN.handWagon;
    let klaar: readonly string[] = [];
    let zelfZ: readonly string[] = [];
    if (v.soort === "tik") {
      variant("samenTelBegin", ZIN.samenTelBegin);
      klaar = ZIN.samenTikKlaar(d);
      zelfZ = ZIN.samenTikZelf(d);
    } else if (v.soort === "na" || v.soort === "voor") {
      variant("samenHier", ZIN.samenHier(d));
      if (v.soort === "na") variant("samenNa", ZIN.samenNa(d));
      else variant("samenVoor", ZIN.samenVoor(d));
      jij = ZIN.samenKaartJij;
      handZ = ZIN.handKaart;
      klaar = v.soort === "na" ? ZIN.samenNaKlaar(d) : ZIN.samenVoorKlaar(d);
      zelfZ = v.soort === "na" ? ZIN.samenNaZelf(d) : ZIN.samenVoorZelf(d);
    } else if (v.soort === "mist") {
      for (const [k, [, zinnen]] of ZIN.samenMistBuren(d).entries()) variant(`samenMistBuur${k}`, zinnen);
      variant("samenMistDag", ZIN.samenMistDag(d));
      jij = ZIN.samenMistJij;
      handZ = ZIN.handSleep;
      klaar = ZIN.samenMistKlaar;
      zelfZ = ZIN.samenMistZelf(d);
    } else if (v.soort === "gm" || v.soort === "gmMaandag") {
      variant("samenVandaag", ZIN.samenVandaag(d));
      variant("samenGm", ZIN.samenGm(d, v.wat!));
      if (v.soort === "gmMaandag") {
        jij = ZIN.samenKaartJij;
        handZ = ZIN.handKaart;
      }
      klaar = ZIN.samenGmKlaar(a, v.wat!);
      zelfZ = ZIN.samenGmZelf(a, v.wat!);
    } else if (v.soort === "weekend1") {
      variant("samenWeekend", ZIN.samenWeekend);
      jij = ZIN.samenWeekendJij;
      klaar = ZIN.samenWeekendKlaar(a);
      zelfZ = ZIN.samenWeekendZelf;
    } else {
      variant("samenWeekend2", ZIN.samenWeekend2(a));
      klaar = ZIN.samenWeekend2Klaar;
      zelfZ = ZIN.samenWeekend2Zelf;
    }
    const j = variant("samenJij", jij);
    if (!isVraagOfOpdracht(j)) meld("geenOpdracht", kaal(j));
    if (toeval() < 0.3) hand("samenHand", handZ);
    variant(zelf ? "samenZelf" : "samenKlaar", zelf ? zelfZ : klaar);
    if (i % 17 === 0) {
      variant("slot", ZIN.slot);
      variant("kaartTik", ZIN.kaartTik);
    }
  }
  const mis = tel.dubbel + tel.herhaald + tel.zelfdeEerste + tel.inReactie + tel.weer + tel.lang + tel.geenOpdracht;
  if (mis)
    fouten.push(
      `kiezer nagespeeld: ${tel.dubbel} keer 2 keer achter elkaar dezelfde zin, ${tel.herhaald} keer een getal, dagnaam of stuk herhaald, ${tel.zelfdeEerste} keer dezelfde eerste zin bij de 1e en 2e keer, ${tel.inReactie} keer dezelfde zin 2 keer in 1 reactie, ${tel.weer} keer "weer" dat niet klopt, ${tel.lang} keer te lang voor het tekstvak, ${tel.geenOpdracht} keer geen vraag of opdracht\n  ${voorbeelden.join("\n  ")}`,
    );
  else console.log(`Kiezer 20.000 keer nagespeeld (${tel.reacties} reacties): 0 keer 2 keer achter elkaar dezelfde zin, 0 keer een getal, dagnaam of stuk herhaald, 0 keer dezelfde eerste zin bij de 1e en 2e keer, 0 keer "weer" dat niet klopt, 0 keer te lang, altijd een vraag of opdracht.`);
}

if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log(`Inhoudscontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen + de 2e weekendvraag na zondag, ${telling} foute antwoorden, ${variantenTeller} varianten gekeurd, ${beweringen} beweringen nagelopen).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 5. De tabel. */
const lijst = (l: readonly string[]) => (l.length ? l.map(kaal).join(" / ") : "—");
const vraagNaam = (v: Vraag) => {
  const k = v.kaarten.length ? ` (kaarten ${v.kaarten.map(naam).join(" / ")})` : "";
  if (v.soort === "tik") return `${v.nr}. Tik op de wagon van ${naam(v.dag)}`;
  if (v.soort === "na") return `${v.nr}. Welke dag komt na ${naam(v.dag)}?${k}`;
  if (v.soort === "voor") return `${v.nr}. Welke dag komt voor ${naam(v.dag)}?${k}`;
  if (v.soort === "mist") return `${v.nr}. Er mist een dag (${naam(v.dag)}); slepen${k}`;
  if (v.soort === "gm") return `${v.nr}. Vandaag is het ${naam(v.dag)}. ${v.wat === "gisteren" ? "Gisteren?" : "Morgen?"}`;
  if (v.soort === "gmMaandag") return `${v.nr}. Vandaag is het maandag. Gisteren?${k}`;
  if (v.soort === "weekend1") return `${v.nr}. Tik op een dag van het weekend (zaterdag en zondag goed)`;
  return `${v.nr}. Tik op de andere dag van het weekend (al gekozen: ${naam(v.dag)})`;
};
const eersteOpnieuw = (v: Vraag, h: string) => (keuzeVraag(v) ? opnieuwBij(v, h)[0] ?? "" : "");
const rijen = ALLE_VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${naam(Number(a))} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(`${f.hint} ${eersteOpnieuw(v, f.hint)}`.trim())} | ${f.scherm} |`)).join("\n");
const samenZin = (v: Vraag) => {
  const d = v.dag;
  const a = v.goed[0];
  if (v.soort === "tik") return `"${ZIN.samenTelBegin[0]}" Rondje loopt van maandag tot ${naam(d)} (vast tempo, Bliepo noemt elke dag). "${ZIN.samenWagonJij[0]}" (het kind tikt; handje na ± 6 s) — "${ZIN.samenTikKlaar(d)[0]}" (vangnet: "${ZIN.samenTikZelf(d)[0]}")`;
  if (v.soort === "na" || v.soort === "voor") return `De hele trein. Rondje om ${naam(d)}: "${ZIN.samenHier(d)[0]}" Rondje om ${naam(a)}: "${(v.soort === "na" ? ZIN.samenNa(d) : ZIN.samenVoor(d))[0]}" Rondje om de kaart: "${ZIN.samenKaartJij[0]}" — "${(v.soort === "na" ? ZIN.samenNaKlaar(d) : ZIN.samenVoorKlaar(d))[0]}"`;
  if (v.soort === "mist") return `${ZIN.samenMistBuren(d).map(([id, z]) => `Rondje om ${naam(Number(id.slice(1)))}: "${z[0]}"`).join(" ")} Rondje om de kaart: "${ZIN.samenMistDag(d)[0]}" "${ZIN.samenMistJij[0]}" (het handje doet het slepen voor) — "${ZIN.samenMistKlaar[0]}" (vangnet: "${ZIN.samenMistZelf(d)[0]}")`;
  if (v.soort === "gm" || v.soort === "gmMaandag") return `${v.soort === "gmMaandag" ? "De hele trein. " : ""}Rondje om vandaag: "${ZIN.samenVandaag(d)[0]}" Rondje om ${naam(a)}: "${ZIN.samenGm(d, v.wat!)[0]}" "${(v.soort === "gmMaandag" ? ZIN.samenKaartJij : ZIN.samenWagonJij)[0]}" — "${ZIN.samenGmKlaar(a, v.wat!)[0]}"`;
  if (v.soort === "weekend1") return `1 rondje om zaterdag en zondag: "${ZIN.samenWeekend[0]}" "${ZIN.samenWeekendJij[0]}" — "${ZIN.samenWeekendKlaar(5)[0]}" (vangnet: "${ZIN.samenWeekendZelf[0]}")`;
  return `Rondje om ${naam(a)}: "${ZIN.samenWeekend2(a)[0]}" "${ZIN.samenWagonJij[0]}" — "${ZIN.samenWeekend2Klaar[0]}"`;
};
const uitleg = ALLE_VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${naam(Number(a))} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} + "Kom, we kijken samen." (5 versies) | ${f.weer.length ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`)).join("\n");

/* Alle varianten: per soort vraag en denkfout 1 voorbeeld (het eerste antwoord in de les met die denkfout). */
const gezien = new Set<string>();
const variantRijen: string[] = [];
for (const v of ALLE_VRAGEN)
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const sleutel = `${v.soort}|${f.soort}|${v.soort === "na" && v.dag === 6 ? "zo" : v.soort === "voor" && v.dag === 0 ? "ma" : v.soort === "mist" && v.dag === 0 ? "ma" : v.wat ?? ""}`;
    if (gezien.has(sleutel)) continue;
    gezien.add(sleutel);
    variantRijen.push(`| ${vraagNaam(v)} — \`${f.code}\` — antwoord ${naam(Number(a))} | ${lijst(f.v.eerste)} | ${lijst(f.v.hint)} | ${lijst(f.v.uitleg)} | ${lijst(f.v.weerEerste)} | ${lijst(f.v.weerUitleg)} | ${lijst(ZIN.weerGekozen(v, Number(a)))} |`);
  }
const V = (nr: number) => ALLE_VRAGEN.find((v) => v.nr === nr)!;
const vast: [string, readonly string[]][] = [
  ["Begin van de les (na de groet)", ZIN.start],
  ["Tik op de wagon: de vraag opnieuw na de hint (voorbeeld donderdag)", ZIN.opnieuw(V(1))],
  ["Welke dag komt na …?: de vraag opnieuw (voorbeeld dinsdag)", ZIN.opnieuw(V(4))],
  ["Welke dag komt voor …?: de vraag opnieuw (voorbeeld vrijdag)", ZIN.opnieuw(V(6))],
  ["Gisteren: de vraag opnieuw", ZIN.opnieuw(V(11))],
  ["Morgen: de vraag opnieuw", ZIN.opnieuw(V(12))],
  ["Weekend: de vraag opnieuw", ZIN.opnieuw(V(13))],
  ["Andere dag van het weekend: de vraag opnieuw", ZIN.opnieuw(V(14))],
  ["Er mist een dag: wat er is", ZIN.mistIntro],
  ["Er mist een dag: het hulphandje", ZIN.mistHand],
  ["Er mist een dag: lang niets nagekeken", ZIN.mistVangnet],
  ["Hulphandje: aanmoediging (komt voor de opdracht)", AANMOEDIG_DOEN],
  ["2e keer mis: samen", ZIN.samen],
  ["Samen, tik op de wagon: begin", ZIN.samenTelBegin],
  ["Samen: nu het kind (wagon)", ZIN.samenWagonJij],
  ["Samen: nu het kind (kaart)", ZIN.samenKaartJij],
  ["Samen: hulphandje (wagon, kaart, slepen)", [...ZIN.handWagon, ...ZIN.handKaart, ...ZIN.handSleep]],
  ["Samen, tik op de wagon: klaar (donderdag)", ZIN.samenTikKlaar(3)],
  ["Samen, tik op de wagon: Bliepo deed het zelf", ZIN.samenTikZelf(3)],
  ["Samen, na/voor: de dag van de vraag (dinsdag)", ZIN.samenHier(1)],
  ["Samen, na: de dag erachter (dinsdag)", ZIN.samenNa(1)],
  ["Samen, na zondag", ZIN.samenNa(6)],
  ["Samen, voor: de dag ervoor (vrijdag)", ZIN.samenVoor(4)],
  ["Samen, voor maandag", ZIN.samenVoor(0)],
  ["Samen, na: klaar (dinsdag)", ZIN.samenNaKlaar(1)],
  ["Samen, voor: klaar (vrijdag)", ZIN.samenVoorKlaar(4)],
  ["Samen, er mist een dag: de buren (woensdag)", ZIN.samenMistBuren(2).flatMap(([, z]) => z)],
  ["Samen, er mist een dag: de buren (maandag)", ZIN.samenMistBuren(0).flatMap(([, z]) => z)],
  ["Samen, er mist een dag: welke dag (woensdag)", ZIN.samenMistDag(2)],
  ["Samen, er mist een dag: nu het kind", ZIN.samenMistJij],
  ["Samen, er mist een dag: klaar", ZIN.samenMistKlaar],
  ["Samen, gisteren en morgen: vandaag (woensdag)", ZIN.samenVandaag(2)],
  ["Samen, gisteren (woensdag)", ZIN.samenGm(2, "gisteren")],
  ["Samen, morgen (vrijdag)", ZIN.samenGm(4, "morgen")],
  ["Samen, gisteren als vandaag maandag is", ZIN.samenGm(0, "gisteren")],
  ["Samen, het weekend", ZIN.samenWeekend],
  ["Samen, het weekend: nu het kind", ZIN.samenWeekendJij],
  ["Samen, het weekend: klaar (zaterdag)", ZIN.samenWeekendKlaar(5)],
  ["Samen, andere dag van het weekend (zondag)", ZIN.samenWeekend2(6)],
  ["Samen, andere dag van het weekend: klaar", ZIN.samenWeekend2Klaar],
  ["Zin na lof: tik op de wagon (donderdag)", dagenReactie(V(1), 3).zinnen],
  ["Zin na lof: na dinsdag", dagenReactie(V(4), 2).zinnen],
  ["Zin na lof: er mist een dag (woensdag)", dagenReactie(V(8), 2).zinnen],
  ["Zin na lof: gisteren (woensdag)", dagenReactie(V(11), 1).zinnen],
  ["Slot", ZIN.slot],
  ["Bij de kaart", ZIN.kaartTik],
];
const vastRijen = vast.map(([n, l]) => `| ${n} | ${l.length} | ${lijst(l)} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Dagen (squla-dagen-van-de-week-gouden, "Dagen van de week")

Gemaakt op 11 november 2026, bijgewerkt op 18 november 2026 (warme zinnen in varianten, §4 en §5) **uit de code** met \`npx tsx scripts/fouttabel-dagen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-dagen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (17 vragen, de dagen, de dagkaarten en de goede antwoorden) is die van squla-dagen-van-de-week en blijft gelijk (BOUWREGELS 15.22). De 2e weekendvraag staat er 2 keer in: na zaterdag en na zondag (wat het kind bij de 1e koos).

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen les over dagen, de week of de kalender (KOPPELING.md §9). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: de dag ernaast, voor en na verwisseld, gisteren en morgen verwisseld, vandaag gekozen, een schooldag bij het weekend, of een dag die verder weg ligt. Bliepo zegt alleen wat waar is over de dag die het kind koos; hij verzint geen reden.

Er staan bijna geen getallen in deze les; "2 dagen", "1 dag", "6" en "7 dagen" zijn wit (ze verwijzen naar wagons van verschillende kleuren of naar niets in beeld).

**Zo werkt het bij een antwoord dat niet goed is — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e keer:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos, met een rood rondje om die wagon of kaart zolang hij hem noemt. Daarna komt de hint met de vraag kort erachter ("Welke dag komt na dinsdag?"), en tegelijk mag het kind opnieuw kiezen. Eindigt de hint zelf al met een opdracht ("Tik dan op die wagon."), dan komt er niets achter. Bij "Er mist een dag" is de hint de nieuwe opdracht ("Sleep …"). Zo staat er altijd een vraag of opdracht in beeld (15.37). Alles gaat vanzelf door (15.27).
- **Verklappen (15.17):** de eerste zin, de hint en de vraag erachter noemen de goede dag niet, er staat geen "tussen … en …" in, het rondje staat nooit om het antwoord, en er blijven altijd minstens 2 keuzes over ("vlak naast" alleen als de gekozen wagon 2 buren heeft). Het script rekent dat voor ELKE variant na en stopt bij een verklapper.
- **2e keer:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." (5 versies) en dan samen voordoen (laatste kolom): nu staat het rondje om de goede wagon of kaart en het kind tikt of sleept hem (de kleine stap; Bliepo zegt "in het rondje", niet nog een keer de dag). Na ± 6 s stilte komt vanzelf het hulphandje. Vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf ("Kijk, …", geen "Ja"). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (4e kolom).
- **Hetzelfde antwoord 2 keer:** de eerste zin wordt "Je koos weer …" / "Je sleepte weer …" (3 versies).
- **Een ander antwoord bij de 2e keer:** nooit dezelfde eerste zin als de 1e keer; 1 van de versies is "Nu koos je …" / "Nu sleepte je …".
- **Varianten (18 november 2026):** elke zin die terugkomt heeft een rijtje versies (§4 en §5). De les kiest met de gedeelde kiezer (\`nooit-dubbel.ts\`): nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen ("Je koos maandag." en "Je koos vrijdag." tellen als dezelfde zin). In de tabellen van §2 en §3 staat steeds de eerste versie. Een getal en een dagnaam klinken nooit 2 keer in 1 stuk, en de hint herhaalt geen dag en geen stuk uit de zin ervoor.
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke keer wordt de naam van de denkfout bewaard, en elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
${DENKFOUTEN.map((c) => `| \`${c}\` | ${DENKFOUT_UITLEG[c]} | ${c === "onduidelijk" ? "BLIEPO-KARAKTER.md §10" : "eigen invulling, niet van Synthesis"} |`).join("\n")}

## 2. De fouttabel: per vraag elk antwoord dat niet goed is (${telling} rijen; steeds de eerste versie)

| Vraag | Antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint (met de vraag erachter) | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e keer: uitleg, anders uitleggen en samen voordoen (steeds de eerste versie)

| Vraag | Antwoord | Uitleg bij de 2e keer | Dezelfde denkfout 2 keer | Samen voordoen |
|---|---|---|---|---|
${uitleg}

## 4. Alle varianten per denkfout (1 voorbeeld per soort vraag en denkfout; het script keurt ze bij elk antwoord)

| Vraag — denkfout — voorbeeld | Eerste zin | Hint (bij kiezen komt de vraag erachter) | Uitleg (2e keer) | "Weer" (2 keer dezelfde denkfout) | Uitleg bij "weer" | Hetzelfde antwoord 2 keer |
|---|---|---|---|---|---|---|
${variantRijen.join("\n")}

## 5. Alle varianten van de vaste zinnen

| Situatie | Aantal | Zinnen |
|---|---|---|
${vastRijen}
`;
writeFileSync(new URL("../FOUTTABEL-squla-dagen-van-de-week-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-dagen-van-de-week-gouden.md geschreven.");
