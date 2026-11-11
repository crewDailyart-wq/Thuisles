/**
 * Maakt FOUTTABEL-squla-dagen-van-de-week-gouden.md uit de code (squla-dagen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.20, 14.22, 14.30, 15.17;
 * LESRECEPT "geleerd bij Tellen", "geleerd bij de keuring Huisnummers", "geleerd bij Geld").
 *   npx tsx scripts/fouttabel-dagen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Inhoudscontrole: dezelfde 17 vragen als squla-dagen-van-de-week (dagen, kaarten, goede antwoorden), het goede antwoord
 * staat tussen de kaarten, en er is bij elke vraag precies 1 goed antwoord, behalve bij "Tik op een dag van het weekend"
 * (zaterdag én zondag goed, 14.30).
 * Verklapcontrole: per vraag en per fout antwoord: de eerste zin en de hint noemen het goede antwoord niet (behalve bij
 * "Tik op de wagon van …", waar de vraag de dag zelf noemt), er blijven na de eerste zin minstens 2 keuzes over (het goede
 * er ook bij), geen "tussen … en …", het rondje staat nooit om het antwoord, de zin bij de 2e fout is geen opdracht.
 * Waarheidscontrole: elke bewering in de eerste zin, de hint, de uitleg en de "weer"-zinnen wordt nagelopen tegen DEZE
 * vraag (wat het kind koos, welke dag waar staat, wat vandaag, gisteren en morgen is). Een zin die het script niet kent,
 * telt als fout. Ook: elk getal in elke zin heeft een kleur of wit (14.20); versies van de zinnen tellen (5.10).
 */
import { writeFileSync } from "node:fs";
import { ALLE, DENKFOUTEN, DENKFOUT_UITLEG, VRAGEN, ZIN, afstand, beeldVan, dagenReactie, foutenVan, na, naam, opties, voor, weekend2, type Fout, type Vraag } from "../src/components/les/lessen/squla-dagen-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
const D = (w: string) => ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"].indexOf(w.toLowerCase());
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
  /* Rekenen: is het goede antwoord echt goed? */
  const echt = v.soort === "tik" ? [v.dag] : v.soort === "na" ? [na(v.dag)] : v.soort === "voor" ? [voor(v.dag)] : v.soort === "mist" ? [v.dag] : v.soort === "gm" || v.soort === "gmMaandag" ? [v.wat === "gisteren" ? voor(v.dag) : na(v.dag)] : v.soort === "weekend1" ? [5, 6] : [v.dag === 5 ? 6 : 5];
  if (echt.join() !== v.goed.join()) fouten.push(`${v.id}: het goede antwoord klopt niet (${v.goed} in plaats van ${echt})`);
});

/* De vragen met beide varianten van de 2e weekendvraag (het kind koos bij de 1e zaterdag of zondag). */
const ALLE_VRAGEN: Vraag[] = [...VRAGEN, weekend2(6)];

/* 2. Waarheidscontrole: wat een zin beweert, klopt voor deze vraag en dit antwoord. */
const bekend = (v: Vraag, c: number, z: string): string | null => {
  const d = v.dag;
  const b = beeldVan(v);
  let m: RegExpMatchArray | null;
  if ((m = z.match(/^Je (?:koos|sleepte) (?:de wagon van )?(\w+)\.$/))) return D(m[1]) === c ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Je koos weer (\w+)\.$/))) {
    if (m[1] === "vandaag") return c === d ? null : "dat is niet vandaag";
    if (m[1] === "morgen") return c === na(d) ? null : "dat is niet morgen";
    if (m[1] === "gisteren") return c === voor(d) ? null : "dat is niet gisteren";
    return D(m[1]) === c ? null : "noemt niet wat het kind koos";
  }
  if (/^(Je zit er vlak naast|Die staat er vlak naast|Je bent er heel dichtbij|Je zat er weer vlak naast)\.$/.test(z)) return Math.abs(c - d) === 1 ? null : "staat niet vlak naast";
  if ((m = z.match(/^(\w+) komt vóór (\w+)\.$/))) return D(m[1]) === c && D(m[2]) === d && voor(d) === c ? null : "komt niet direct vóór";
  if ((m = z.match(/^(\w+) komt na (\w+)\.$/))) return D(m[1]) === c && D(m[2]) === d && na(d) === c ? null : "komt niet direct na";
  if ((m = z.match(/^(\w+) komt niet direct na (\w+)\.$/))) return D(m[1]) === c && na(D(m[2])) !== c ? null : "komt wel direct na";
  if ((m = z.match(/^(\w+) komt niet direct vóór (\w+)\.$/))) return D(m[1]) === c && voor(D(m[2])) !== c ? null : "komt wel direct vóór";
  if ((m = z.match(/^(\w+) hangt al vlak naast de lege plek\.$/))) return D(m[1]) === c && b.wagons.includes(c) && Math.abs(b.wagons.indexOf(c) - b.wagons.indexOf(null)) === 1 ? null : "hangt niet vlak naast de lege plek";
  if ((m = z.match(/^(\w+) hangt al ergens anders in de trein\.$/))) return D(m[1]) === c && b.wagons.includes(c) ? null : "hangt niet in de trein";
  if (/^Dat is vandaag\.$/.test(z)) return c === b.vandaag ? null : "is niet vandaag";
  if (/^Dat is morgen\.$/.test(z)) return b.vandaag !== null && c === na(b.vandaag) ? null : "is niet morgen";
  if (/^Dat was gisteren\.$/.test(z)) return b.vandaag !== null && c === voor(b.vandaag) ? null : "was niet gisteren";
  if (/^Die dag ligt verder van vandaag af\.$/.test(z)) return b.vandaag !== null && afstand(c, b.vandaag) >= 2 ? null : "is niet verder weg";
  if (/^Dat is een schooldag\.$/.test(z)) return c >= 0 && c <= 4 ? null : "is geen schooldag";
  if (/^Je koos weer een schooldag\.$/.test(z)) return c <= 4 ? null : "geen schooldag";
  /* Hints (hoe je zoekt, waar je kijkt). */
  if ((m = z.match(/^Lees de bordjes vanaf maandag, vooraan\.$/))) return b.wagons[0] === 0 ? null : "maandag staat niet vooraan";
  if ((m = z.match(/^Waar staat (\w+)\?$/)) || (m = z.match(/^Zeg de dagen op tot (\w+)\.$/))) return D(m[1]) === d ? null : "andere dag dan de vraag";
  if (/^De week begint vooraan met maandag\.$/.test(z)) return b.wagons[0] === 0 ? null : "maandag staat niet vooraan";
  if ((m = z.match(/^Na (\w+) is de dag erachter\.$/)) || (m = z.match(/^Welke dag komt na (\w+)\?$/)) || (m = z.match(/^Zeg de dagen op, vanaf (\w+)\.$/))) return D(m[1]) === d && v.soort === "na" ? null : "past niet bij de vraag";
  if ((m = z.match(/^Vóór (\w+) is de dag ervoor\.$/)) || (m = z.match(/^Welke dag komt vóór (\w+)\?$/)) || (m = z.match(/^Zeg de dagen op tot (\w+)\.$/))) return D(m[1]) === d && v.soort === "voor" ? null : "past niet bij de vraag";
  if (/^(Welke dag zeg je daarna|Welke dag komt dan)\?$/.test(z)) return v.soort === "na" ? null : "past niet";
  if (/^Welke dag zeg je net daarvoor\?$/.test(z)) return v.soort === "voor" ? null : "past niet";
  if (/^(Na zondag begint een nieuwe week|Na de laatste dag begint de week opnieuw)\.$/.test(z)) return v.soort === "na" && d === 6 ? null : "past niet";
  if (/^(Vóór maandag was de vorige week|Zeg de dagen van de week op, tot het eind)\.$/.test(z)) return v.soort === "voor" && d === 0 ? null : "past niet";
  if (/^(Hoe eindigt een week|Welke dag komt vóór een nieuwe maandag)\?$/.test(z)) return v.soort === "voor" && d === 0 ? null : "past niet";
  if (/^Kijk naar de wagons naast de lege plek\.$/.test(z) || /^Sleep de dag die daartussen hoort\.$/.test(z)) return v.soort === "mist" && d > 0 && d < 6 ? null : "de lege plek heeft geen 2 buren";
  if (/^Kijk naar de wagon achter de lege plek\.$/.test(z) || /^Sleep de dag die daarvoor komt\.$/.test(z)) return v.soort === "mist" && d === 0 ? null : "past niet";
  if (/^(Zeg de dagen op vanaf maandag|Zeg de dagen op vanaf het begin van de week)\.$/.test(z) || /^Sleep de dag die mist\.$/.test(z)) return v.soort === "mist" ? null : "past niet";
  if (/^(Gisteren is de dag vóór vandaag|Gisteren is al voorbij)\.$/.test(z) || /^Welke dag was het gisteren\?$/.test(z)) return v.wat === "gisteren" ? null : "past niet";
  if (/^(Morgen is de dag na vandaag|Morgen moet nog komen)\.$/.test(z) || /^Welke dag is het morgen\?$/.test(z)) return v.wat === "morgen" ? null : "past niet";
  if (/^(Gisteren was nog de vorige week|Maandag is de eerste dag|Gisteren was de dag daarvoor)\.$/.test(z) || /^Welke dag was dat\?$/.test(z)) return v.soort === "gmMaandag" ? null : "past niet";
  if (/^(In het weekend is er geen school|Op een schooldag ga je naar school)\.$/.test(z) || /^Tik op een dag (zonder school|van het weekend)\.$/.test(z)) return v.soort === "weekend1" ? null : "past niet";
  if ((m = z.match(/^(\w+) heb je al\.$/)) || (m = z.match(/^(\w+) is er 1 van\.$/))) return v.soort === "weekend2" && D(m[1]) === d ? null : "die dag koos het kind niet";
  if (/^Op welke andere dag is er geen school\?$/.test(z) || /^Het weekend heeft 2 dagen\.$/.test(z) || /^Tik op de andere\.$/.test(z)) return v.soort === "weekend2" ? null : "past niet";
  /* Uitleg bij de 2e fout (daarna doet Bliepo het samen voor) en "weer". */
  if (/^(De wagons staan op volgorde van de week|Maandag staat vooraan|Elke dag heeft een eigen wagon, met de naam op het bordje|Elke wagon is 1 dag|Ze staan op volgorde)\.$/.test(z)) return v.soort === "tik" ? null : "past niet";
  if ((m = z.match(/^Na (\w+) komt de dag die er direct achter hangt\.$/))) return v.soort === "na" && D(m[1]) === d && d !== 6 ? null : "past niet";
  if ((m = z.match(/^Vóór (\w+) komt de dag die er direct voor hangt\.$/))) return v.soort === "voor" && D(m[1]) === d && d !== 0 ? null : "past niet";
  if (/^Na zondag begint de week weer vooraan in de trein\.$/.test(z)) return v.soort === "na" && d === 6 ? null : "past niet";
  if (/^(Een week eindigt met zondag|Daarna begint een nieuwe week met maandag)\.$/.test(z)) return v.soort === "voor" && d === 0 ? null : "past niet";
  if ((m = z.match(/^Je koos weer de dag (vóór|na) (\w+)\.$/))) return D(m[2]) === d && c === (m[1] === "na" ? na(d) : voor(d)) ? null : "klopt niet met wat het kind koos";
  if ((m = z.match(/^Je koos weer een dag die niet direct (na|vóór) (\w+) komt\.$/))) return D(m[2]) === d && c !== (m[1] === "na" ? na(d) : voor(d)) ? null : "klopt niet";
  if (/^(Na is de dag erachter, niet de dag ervoor|Na is de dag die er direct achter komt)\.$/.test(z)) return v.soort === "na" ? null : "past niet";
  if (/^(Vóór is de dag ervoor, niet de dag erachter|Vóór is de dag die er direct voor komt)\.$/.test(z)) return v.soort === "voor" ? null : "past niet";
  if (/^(Elke dag hangt 1 keer in de trein, op volgorde|Op de lege plek hoort de dag die nog mist|Elke dag hangt maar 1 keer in de trein)\.$/.test(z)) return v.soort === "mist" ? null : "past niet";
  if (/^Je sleepte weer een dag die er al naast hangt\.$/.test(z)) return v.soort === "mist" && Math.abs(c - d) === 1 ? null : "hangt er niet naast";
  if (/^Je sleepte weer een dag die al in de trein hangt\.$/.test(z)) return v.soort === "mist" && c !== d ? null : "past niet";
  if (/^(Gisteren is de dag vóór vandaag, de wagon ervoor)\.$/.test(z)) return v.soort === "gm" && v.wat === "gisteren" ? null : "past niet";
  if (/^(Morgen is de dag na vandaag, de wagon erachter)\.$/.test(z)) return v.soort === "gm" && v.wat === "morgen" ? null : "past niet";
  if (/^Vóór maandag komt de laatste dag van de vorige week\.$/.test(z)) return v.soort === "gmMaandag" ? null : "past niet";
  if (/^(Vandaag is de dag van de pijl|Gisteren is voorbij, morgen moet nog komen)\.$/.test(z)) return v.soort === "gm" || v.soort === "gmMaandag" ? null : "past niet";
  if (/^(Het weekend is zaterdag en zondag|Zaterdag en zondag horen samen bij het weekend|Van maandag tot en met vrijdag is er school)\.$/.test(z)) return v.soort === "weekend1" || v.soort === "weekend2" ? null : "past niet";
  return `onbekende zin (niet na te lopen): "${z}"`;
};

const verklap = (v: Vraag, c: number, f: Fout): string | null => {
  if (!f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  if (/tussen .* en /i.test(kaal(`${f.eerste} ${f.hint}`))) return '"tussen … en …" in eerste zin of hint';
  /* Het goede antwoord niet genoemd (bij "Tik op de wagon van …" noemt de vraag de dag zelf). */
  if (v.soort !== "tik") for (const a of v.goed) if (new RegExp(`\\b${naam(a)}\\b`, "i").test(`${f.eerste} ${f.hint}`)) return `de eerste zin of hint noemt het antwoord (${naam(a)})`;
  if (v.goed.includes(c)) return "rondje om het antwoord";
  if (!v.goed.some((a) => f.over.includes(a))) return "het goede antwoord valt weg na de eerste zin (de zin klopt niet)";
  if (f.over.length < 2) return `na de eerste zin blijft alleen ${f.over.map(naam).join("")} over`;
  /* De zin bij de 2e fout is uitleg, geen opdracht (keuring Getallenlijn): het kind kan hem daarna niet meer doen. */
  for (const z of [...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) if (/^(Tik|Kijk|Lees|Zoek|Tel|Sleep|Wijs|Zeg|Zet)\b/.test(z)) return `opdracht in de uitleg bij de 2e fout: "${z}"`;
  /* De hint eindigt met de vraag of de opdracht (F1: het kind weet waar het over gaat; hij is de nieuwe vraagzin). */
  if (!/[?]$/.test(f.hint.trim()) && !/(Tik|Sleep|Zeg) [^.]*\.$/.test(f.hint.trim().split(/(?<=[.!?])\s+/).at(-1) ?? "")) return `de hint eindigt niet met een vraag of opdracht: "${f.hint}"`;
  for (const z of [...zinnenVan(f.eerste), ...zinnenVan(f.hint), ...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) {
    const r = bekend(v, c, z);
    if (r) return `waarheidscontrole: ${r}`;
  }
  return null;
};

let telling = 0;
let beweringen = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
const eersteTweede = new Map<string, Set<string>>();
for (const v of ALLE_VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = opties(v).filter((k) => !v.goed.includes(k)).length;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    beweringen += zinnenVan(f.eerste).length + zinnenVan(f.hint).length + zinnenVan(f.uitleg).length + f.weer.flatMap(zinnenVan).length;
    if (!DENKFOUTEN.includes(f.code) || f.code === "onduidelijk") fouten.push(`${v.id} ${naam(Number(a))}: geen vaste denkfout (${f.code})`);
    const r = verklap(v, Number(a), f);
    if (r) fouten.push(`${v.id} ${naam(Number(a))}: ${r}`);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    hintsPerCode.get(f.code)!.add(kaal(f.hint));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
    /* "Je zit er vlak naast" in 3 versies over de les (geleerd bij Plussommen): tel de versies. */
    const tweede = zinnenVan(f.eerste)[1];
    if (tweede && f.code === "dag-ernaast" && v.soort === "tik") {
      if (!eersteTweede.has("naast")) eersteTweede.set("naast", new Set());
      eersteTweede.get("naast")!.add(tweede);
    }
  }
  /* Niet 2 keer hetzelfde woord bij 1 vraag in de eerste zin bij 2 verschillende foute antwoorden (keuring Tellen en
     Splitsen): bij dezelfde soort komt bij de 2e fout de "weer"-zin; anders zegt de les "Nu koos je …". */
}
for (const [k, s] of eersteTweede) if (s.size < 2) fouten.push(`"${k}": maar ${s.size} versie van de korte zin zonder richting`);

/* Elk getal in een zin van Bliepo heeft een kleur of wit (14.20): geen kaal cijfer. */
const kaalCijfer = (z: string) => /\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""));
const alleZinnen: string[] = [ZIN.start, ZIN.mistIntro, ZIN.mistHand, ...ZIN.samen, ZIN.samenTelBegin, ZIN.samenMistKlaar, ZIN.samenWeekend, ZIN.samenWeekendJij, ZIN.samenWeekendZelf, ZIN.samenWeekend2Klaar, ZIN.samenWeekend2Zelf, ZIN.handWagon, ZIN.handKaart, ZIN.handSleep, ZIN.mistVangnet, ZIN.slot, ZIN.kaartTik];
for (const v of ALLE_VRAGEN) {
  const d = v.dag;
  const a = v.goed[0];
  alleZinnen.push(...ZIN.vraag(v, true), ...Object.values(foutenVan(v)).flatMap((f) => [f.eerste, f.hint, f.uitleg, ...f.weer]), ...v.goed.flatMap((x) => dagenReactie(v, x).zinnen));
  for (const c of opties(v)) alleZinnen.push(ZIN.weerGekozen(v, c));
  if (v.soort === "tik") alleZinnen.push(...ALLE.map(ZIN.samenTelDag), ZIN.samenTikJij(d), ZIN.samenTikKlaar(d), ZIN.samenTikZelf(d));
  if (v.soort === "na" || v.soort === "voor") alleZinnen.push(ZIN.samenHier(d), ZIN.samenNa(d), ZIN.samenVoor(d), ZIN.samenKaartJij(a), ZIN.samenNaKlaar(d), ZIN.samenNaZelf(d), ZIN.samenVoorKlaar(d), ZIN.samenVoorZelf(d));
  if (v.soort === "mist") alleZinnen.push(...ZIN.samenMistBuren(d).map((x) => x[1]), ZIN.samenMistDag(d), ZIN.samenMistJij(d), ZIN.samenMistZelf(d));
  if (v.soort === "gm" || v.soort === "gmMaandag") alleZinnen.push(ZIN.samenVandaag(d), ZIN.samenGm(d, v.wat!), ZIN.samenGmJij(a), ZIN.samenGmKlaar(a, v.wat!), ZIN.samenGmZelf(a, v.wat!), ZIN.samenKaartJij(a));
  if (v.soort === "weekend1") alleZinnen.push(ZIN.samenWeekendKlaar(5), ZIN.samenWeekendKlaar(6));
  if (v.soort === "weekend2") alleZinnen.push(ZIN.samenWeekend2(a), ZIN.samenWeekend2Jij(a));
}
for (const z of alleZinnen) if (kaalCijfer(z)) fouten.push(`getal zonder kleur in "${z}" (14.20)`);

/* De zinnen bij het samen voordoen kloppen (11.9): elke dag die genoemd wordt, staat op de goede plek in de week. */
for (const v of ALLE_VRAGEN) {
  const d = v.dag;
  if (v.soort === "na" && ZIN.samenNaKlaar(d) !== `Ja, na ${naam(d)} komt ${naam(na(d))}.`) fouten.push(`${v.id}: samen-zin klopt niet`);
  if (v.soort === "voor" && ZIN.samenVoorKlaar(d) !== `Ja, vóór ${naam(d)} komt ${naam(voor(d))}.`) fouten.push(`${v.id}: samen-zin klopt niet`);
  if (v.soort === "mist") for (const [id, z] of ZIN.samenMistBuren(d)) if (!z.includes(naam(Number(id.slice(1))))) fouten.push(`${v.id}: het rondje staat om een andere wagon dan Bliepo noemt ("${z}")`);
}

/* Afwisseling (5.10): een denkfout die vaker voorkomt, heeft meer dan 1 hint. */
for (const [code, n] of aantalPerCode) if (n >= 3 && (hintsPerCode.get(code)?.size ?? 0) < 2) fouten.push(`denkfout ${code}: ${n} keer, maar maar 1 hint`);

/* Lengte: elk stuk past in het vaste tekstvak (15.30; ± 110 tekens is bij de andere gouden lessen het langste dat past). */
for (const z of alleZinnen) if (kaal(z).length > 110) fouten.push(`te lang voor het tekstvak (${kaal(z).length} tekens): "${kaal(z)}"`);

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Inhoudscontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen + de 2e weekendvraag na zondag, ${telling} foute antwoorden, ${beweringen} beweringen nagelopen, ${alleZinnen.length} zinnen op kale cijfers en lengte).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 3. De tabel. */
const vraagNaam = (v: Vraag) => {
  const k = v.kaarten.length ? ` (kaarten ${v.kaarten.map(naam).join(" / ")})` : "";
  if (v.soort === "tik") return `${v.nr}. Tik op de wagon van ${naam(v.dag)}`;
  if (v.soort === "na") return `${v.nr}. Welke dag komt na ${naam(v.dag)}?${k}`;
  if (v.soort === "voor") return `${v.nr}. Welke dag komt vóór ${naam(v.dag)}?${k}`;
  if (v.soort === "mist") return `${v.nr}. Er mist een dag (${naam(v.dag)}); slepen${k}`;
  if (v.soort === "gm") return `${v.nr}. Vandaag is het ${naam(v.dag)}. ${v.wat === "gisteren" ? "Gisteren?" : "Morgen?"}`;
  if (v.soort === "gmMaandag") return `${v.nr}. Vandaag is het maandag. Gisteren?${k}`;
  if (v.soort === "weekend1") return `${v.nr}. Tik op een dag van het weekend (zaterdag en zondag goed)`;
  return `${v.nr}. Tik op de andere dag van het weekend (al gekozen: ${naam(v.dag)})`;
};
const rijen = ALLE_VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${naam(Number(a))} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm} |`)).join("\n");
const samenZin = (v: Vraag) => {
  const d = v.dag;
  const a = v.goed[0];
  if (v.soort === "tik") return `"${ZIN.samenTelBegin}" Rondje loopt van maandag tot ${naam(d)} (vast tempo, Bliepo noemt elke dag). "${ZIN.samenTikJij(d)}" (het kind tikt; handje na ± 6 s) — "${ZIN.samenTikKlaar(d)}" (vangnet: "${ZIN.samenTikZelf(d)}")`;
  if (v.soort === "na" || v.soort === "voor") return `De hele trein. Rondje om ${naam(d)}: "${ZIN.samenHier(d)}" Rondje om ${naam(a)}: "${v.soort === "na" ? ZIN.samenNa(d) : ZIN.samenVoor(d)}" Rondje om de kaart: "${ZIN.samenKaartJij(a)}" — "${v.soort === "na" ? ZIN.samenNaKlaar(d) : ZIN.samenVoorKlaar(d)}"`;
  if (v.soort === "mist") return `${ZIN.samenMistBuren(d).map(([id, z]) => `Rondje om ${naam(Number(id.slice(1)))}: "${z}"`).join(" ")} Rondje om de kaart: "${ZIN.samenMistDag(d)}" "${kaal(ZIN.samenMistJij(d))}" (het handje doet het slepen voor) — "${ZIN.samenMistKlaar}" (vangnet: "${ZIN.samenMistZelf(d)}")`;
  if (v.soort === "gm" || v.soort === "gmMaandag") return `${v.soort === "gmMaandag" ? "De hele trein. " : ""}Rondje om vandaag: "${ZIN.samenVandaag(d)}" Rondje om ${naam(a)}: "${ZIN.samenGm(d, v.wat!)}" "${v.soort === "gmMaandag" ? ZIN.samenKaartJij(a) : ZIN.samenGmJij(a)}" — "${ZIN.samenGmKlaar(a, v.wat!)}"`;
  if (v.soort === "weekend1") return `1 rondje om zaterdag en zondag: "${ZIN.samenWeekend}" "${ZIN.samenWeekendJij}" — "${ZIN.samenWeekendKlaar(5)}" (vangnet: "${ZIN.samenWeekendZelf}")`;
  return `Rondje om ${naam(a)}: "${ZIN.samenWeekend2(a)}" "${ZIN.samenWeekend2Jij(a)}" — "${ZIN.samenWeekend2Klaar}"`;
};
const uitleg = ALLE_VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${naam(Number(a))} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} + "Kom, we kijken samen." (3 versies) | ${f.weer.length ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`)).join("\n");

const tekst = `# FOUTTABEL — gouden les Dagen (squla-dagen-van-de-week-gouden, "Dagen van de week")

Gemaakt op 11 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-dagen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-dagen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (17 vragen, de dagen, de dagkaarten en de goede antwoorden) is die van squla-dagen-van-de-week en blijft gelijk (BOUWREGELS 15.22). De 2e weekendvraag staat er 2 keer in: na zaterdag en na zondag (wat het kind bij de 1e koos).

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen les over dagen, de week of de kalender (KOPPELING.md §9). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: de dag ernaast, vóór en na verwisseld, gisteren en morgen verwisseld, vandaag gekozen, een schooldag bij het weekend, of een dag die verder weg ligt. Bliepo zegt alleen wat waar is over de dag die het kind koos; hij verzint geen reden.

Er staan bijna geen getallen in deze les; "2 dagen", "1 dag" en "7 dagen" zijn wit (ze verwijzen naar wagons van verschillende kleuren of naar niets in beeld).

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos, met een rood rondje om die wagon of kaart zolang hij hem noemt. Daarna komt de hint (die eindigt met de vraag of de opdracht), en tegelijk mag het kind opnieuw kiezen (geen 2 keer de vraag). Alles gaat vanzelf door (15.27).
- **Verklappen (15.17):** de eerste zin en de hint noemen de goede dag niet, er staat geen "tussen … en …" in, het rondje staat nooit om het antwoord, en er blijven altijd minstens 2 keuzes over ("Je zit er vlak naast." alleen als de gekozen wagon 2 buren heeft). Het script hierboven rekent dat per fout antwoord na en stopt bij een verklapper.
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." en dan samen voordoen (laatste kolom): nu staat het rondje om de goede wagon of kaart en het kind tikt of sleept hem (de kleine stap). Na ± 6 s stilte komt vanzelf het hulphandje. Vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf ("Kijk, …", geen "Ja"). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (4e kolom).
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …" / "Je sleepte weer …".
- **Een ander fout antwoord bij de 2e fout:** de eerste zin begint met "Nu koos je …" / "Nu sleepte je …" (keuring Tellen en Splitsen).
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
${DENKFOUTEN.map((c) => `| \`${c}\` | ${DENKFOUT_UITLEG[c]} | ${c === "onduidelijk" ? "BLIEPO-KARAKTER.md §10" : "eigen invulling, niet van Synthesis"} |`).join("\n")}

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg, anders uitleggen en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen voordoen |
|---|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-dagen-van-de-week-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-dagen-van-de-week-gouden.md geschreven.");
