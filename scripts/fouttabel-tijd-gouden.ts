/**
 * Maakt FOUTTABEL-squla-tijd-dagen-1-gouden.md uit de code (squla-tijd-gouden-zinnen.ts), zodat de tabel altijd klopt met
 * de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.20, 14.22, 14.30, 15.17; LESRECEPT
 * "geleerd bij Tellen", "geleerd bij de keuring Huisnummers", "geleerd bij Geld", "geleerd bij Dagen").
 *   npx tsx scripts/fouttabel-tijd-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Inhoudscontrole: dezelfde 12 vragen als squla-tijd-dagen-1 (dagen, kaarten, getallen, goede antwoorden) en dezelfde
 * reserve (vraag 1, 3 en 9); het goede antwoord staat tussen de keuzes; precies 1 goed antwoord per vraag (14.30).
 * Verklapcontrole: per vraag (ook de terugkomende versie) en per fout antwoord: de eerste zin en de hint noemen het goede
 * antwoord niet, er blijven na de eerste zin minstens 2 keuzes over (het goede er ook bij), geen "tussen … en …", het
 * rondje staat nooit om het antwoord, de zin bij de 2e fout is geen opdracht, de hint eindigt met de vraag.
 * Waarheidscontrole: elke bewering in de eerste zin, de hint en de uitleg wordt nagelopen tegen DEZE vraag en dit
 * antwoord. Een zin die het script niet kent, telt als fout. Ook: elk getal in elke zin heeft een kleur of wit (14.20);
 * versies van de hints tellen (5.10); paren foute antwoorden per vraag (niet 2 keer hetzelfde woord in de eerste zin).
 */
import { writeFileSync } from "node:fs";
import { ALLE, DENKFOUTEN, DENKFOUT_UITLEG, RESERVE, VRAGEN, ZIN, alsTerug, beeldVan, dagenVan, foutenVan, kaartNaam, na, naGoedBeeld, naam, tijdReactie, voor, type Fout, type Vraag } from "../src/components/les/lessen/squla-tijd-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
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

/* De vragen, en de versie die aan het eind terugkomt (andere hint). */
const ALLE_VRAGEN: Vraag[] = [...VRAGEN, ...VRAGEN.map(alsTerug)];

/* 2. Waarheidscontrole: wat een zin beweert, klopt voor deze vraag en dit antwoord. */
const bekend = (v: Vraag, x: string, z: string): string | null => {
  const d = v.dag;
  const c = Number(x);
  const kaart = v.invoer === "kaart";
  let m: RegExpMatchArray | null;
  if ((m = z.match(/^Je koos (\d+)\.$/))) return !kaart && m[1] === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Je koos (\w+) en (\w+)\.$/))) return kaart && sleutelVan([D(m[1]), D(m[2])]) === x ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Je koos (\w+)\.$/))) return kaart && String(D(m[1])) === x ? null : "noemt niet wat het kind koos";
  if (/^Dat is de laatste dag van de week\.$/.test(z)) return v.soort === "eerste" && x === "6" ? null : "past niet";
  if (/^Dat is niet de eerste dag\.$/.test(z)) return v.soort === "eerste" && x !== "0" ? null : "klopt niet";
  if (/^Dat is niet de laatste dag\.$/.test(z)) return v.soort === "laatste" && x !== "6" ? null : "klopt niet";
  if (/^Die hoort bij het weekend, maar is niet de laatste dag\.$/.test(z)) return v.soort === "laatste" && x === "5" ? null : "past niet";
  if (/^Op zoveel dagen ga je naar school\.$/.test(z)) return v.soort === "weekendHoeveel" && x === "5" ? null : "klopt niet";
  if (/^Het weekend is langer dan dat\.$/.test(z)) return v.soort === "weekendHoeveel" && c < 2 ? null : "klopt niet";
  if (/^Dat zijn schooldagen\.$/.test(z)) return kaart && dagenVan(x).every((q) => q < 5) ? null : "geen schooldagen";
  if ((m = z.match(/^Op (\w+) ga je naar school\.$/))) return kaart && dagenVan(x).includes(D(m[1])) && D(m[1]) < 5 ? null : "geen schooldag of niet gekozen";
  if ((m = z.match(/^Die komt vóór (\w+)\.$/))) return v.soort === "na" && D(m[1]) === d && voor(d) === c ? null : "komt niet direct vóór";
  if ((m = z.match(/^Die komt niet meteen na (\w+)\.$/))) return v.soort === "na" && D(m[1]) === d && na(d) !== c ? null : "komt wel meteen na";
  if (/^Dat zijn te weinig dagen\.$/.test(z)) return v.soort === "hoeveelWeek" && c < 7 ? null : "niet te weinig";
  if (/^Dat zijn te veel dagen\.$/.test(z)) return v.soort === "hoeveelWeek" && c > 7 ? null : "niet te veel";
  /* Hints (hoe je zoekt, waar je kijkt). */
  if (/^Zeg de dagen van de week op\.$/.test(z)) return v.soort === "eerste" || v.soort === "laatste" ? null : "past niet";
  if (/^Welke dag zeg je als eerste\?$/.test(z) || /^Na het weekend begint een nieuwe week\.$/.test(z) || /^Wat is de eerste dag van de week\?$/.test(z)) return v.soort === "eerste" ? null : "past niet";
  if (/^Welke dag zeg je als laatste\?$/.test(z) || /^Na de laatste dag begint een nieuwe week\.$/.test(z) || /^Wat is de laatste dag van de week\?$/.test(z)) return v.soort === "laatste" ? null : "past niet";
  if (/^(Het weekend zijn de vrije dagen|Denk aan de dagen waarop je vrij bent)\.$/.test(z) || /^Hoeveel dagen heeft het weekend\?$/.test(z)) return v.soort === "weekendHoeveel" ? null : "past niet";
  if (/^In het weekend ben je vrij\.$/.test(z) || /^Welke kaart heeft 2 vrije dagen\?$/.test(z) || /^Het weekend komt aan het eind van de week\.$/.test(z) || /^Op welke dagen is het weekend\?$/.test(z)) return v.soort === "weekendWelke" ? null : "past niet";
  if ((m = z.match(/^Zeg de dagen op, vanaf (\w+)\.$/))) return v.soort === "na" && D(m[1]) === d && d !== 6 ? null : "past niet";
  if (/^Welke dag zeg je daarna\?$/.test(z)) return v.soort === "na" ? null : "past niet";
  if (/^Zeg de dagen van de week op, vanaf maandag\.$/.test(z) || (m = z.match(/^Welke dag zeg je na (\w+)\?$/))) return v.soort === "na" && d !== 0 && d !== 6 && (!m || D(m[1]) === d) ? null : "past niet";
  if (/^Begin bij maandag en zeg de dagen op\.$/.test(z)) return v.soort === "na" && d === 0 ? null : "past niet";
  if (/^(Na zondag begint een nieuwe week|Na de laatste dag begint de week opnieuw)\.$/.test(z) || /^Welke dag komt (dan|meteen na zondag)\?$/.test(z)) return v.soort === "na" && d === 6 ? null : "past niet";
  if (/^(Zeg de dagen op van maandag tot en met zondag|Denk aan alle dagen, van maandag tot en met zondag)\.$/.test(z) || /^(Hoeveel dagen zijn het|Hoeveel dagen heeft een week)\?$/.test(z)) return v.soort === "hoeveelWeek" ? null : "past niet";
  /* Uitleg bij de 2e fout (daarna doet Bliepo het samen voor). */
  if (/^De eerste dag staat vooraan in de week, niet achteraan\.$/.test(z)) return v.soort === "eerste" && x === "6" ? null : "past niet";
  if (/^De eerste dag hangt vooraan in de weektrein, vlak achter de locomotief\.$/.test(z)) return v.soort === "eerste" ? null : "past niet";
  if (/^De laatste dag hangt helemaal achteraan in de weektrein\.$/.test(z)) return v.soort === "laatste" ? null : "past niet";
  if (/^Het weekend zijn de vrije dagen aan het eind van de week\.$/.test(z)) return v.soort === "weekendHoeveel" || v.soort === "weekendWelke" ? null : "past niet";
  if (/^Na vrijdag is er geen school meer, tot het maandag is\.$/.test(z)) return v.soort === "weekendHoeveel" ? null : "past niet";
  if (/^Op allebei de dagen van het weekend ben je vrij\.$/.test(z)) return v.soort === "weekendWelke" ? null : "past niet";
  if (/^Meteen na is de dag erachter, niet de dag ervoor\.$/.test(z)) return v.soort === "na" && c === voor(d) ? null : "past niet";
  if ((m = z.match(/^Meteen na (\w+) komt de dag die er direct achter hangt\.$/))) return v.soort === "na" && D(m[1]) === d && d !== 6 ? null : "past niet";
  if (/^Na zondag begint de week opnieuw vooraan in de trein\.$/.test(z)) return v.soort === "na" && d === 6 ? null : "past niet";
  if (/^Elke dag van maandag tot en met zondag telt mee\.$/.test(z)) return v.soort === "hoeveelWeek" && c < 7 ? null : "past niet";
  if (/^Elke dag van de week telt maar 1 keer mee\.$/.test(z)) return v.soort === "hoeveelWeek" && c > 7 ? null : "past niet";
  return `onbekende zin (niet na te lopen): "${z}"`;
};
const sleutelVan = (dagen: number[]) => dagen.join("-");

const verklap = (v: Vraag, x: string, f: Fout): string | null => {
  if (!f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  if (/tussen .* en /i.test(kaal(`${f.eerste} ${f.hint}`))) return '"tussen … en …" in eerste zin of hint';
  /* Het goede antwoord niet genoemd in de eerste zin of de hint. */
  /* Bij een kaart met 2 dagen mag Bliepo de dag noemen die ook op de gekozen kaart staat ("Je koos zondag en maandag."),
     maar nooit de dag die alleen op de goede kaart staat (zaterdag). */
  const goedWoorden = v.invoer === "kaart" ? dagenVan(v.goed).filter((q) => !dagenVan(x).includes(q)).map(naam) : [v.goed];
  for (const w of goedWoorden) if (new RegExp(`(^|[^\\w])${w}([^\\w]|$)`, "i").test(kaal(`${f.eerste} ${f.hint}`))) return `de eerste zin of hint noemt het antwoord (${w})`;
  if (x === v.goed) return "rondje om het antwoord";
  if (!f.over.includes(v.goed)) return "het goede antwoord valt weg na de eerste zin (de zin klopt niet)";
  if (f.over.length < 2) return `na de eerste zin blijft alleen ${f.over.join("")} over`;
  /* De zin bij de 2e fout is uitleg, geen opdracht (keuring Getallenlijn): het kind kan hem daarna niet meer doen. */
  for (const z of [...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) if (/^(Tik|Kijk|Lees|Zoek|Tel|Sleep|Wijs|Zeg|Zet|Denk)\b/.test(z)) return `opdracht in de uitleg bij de 2e fout: "${z}"`;
  /* De hint eindigt met de vraag (F1: het kind weet waar het over gaat; hij is de nieuwe vraagzin). */
  if (!/[?]$/.test(f.hint.trim())) return `de hint eindigt niet met een vraag: "${f.hint}"`;
  for (const z of [...zinnenVan(f.eerste), ...zinnenVan(f.hint), ...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) {
    const r = bekend(v, x, z);
    if (r) return `waarheidscontrole: ${r}`;
  }
  return null;
};

let telling = 0;
let beweringen = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of ALLE_VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = v.keuzes.filter((k) => k !== v.goed).length;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    beweringen += zinnenVan(f.eerste).length + zinnenVan(f.hint).length + zinnenVan(f.uitleg).length + f.weer.flatMap(zinnenVan).length;
    if (!DENKFOUTEN.includes(f.code) || f.code === "onduidelijk") fouten.push(`${v.id} ${a}: geen vaste denkfout (${f.code})`);
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    hintsPerCode.get(f.code)!.add(kaal(f.hint));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
    /* Het rondje alleen om een kaart (een getal is een knop bij Bliepo). */
    if (f.rondje !== (v.invoer === "kaart")) fouten.push(`${v.id} ${a}: rondje bij een getal of geen rondje bij een kaart`);
  }
  /* Paren foute antwoorden per vraag (keuring Tellen en Splitsen): de 2e zin van de eerste zin niet 2 keer gelijk. */
  const rijen = Object.values(tabel);
  for (let i = 0; i < rijen.length; i++)
    for (let j = i + 1; j < rijen.length; j++) {
      const a = zinnenVan(rijen[i].eerste)[1];
      const b = zinnenVan(rijen[j].eerste)[1];
      if (a && b && a === b) fouten.push(`${v.id}: 2 foute antwoorden krijgen dezelfde zin "${a}"`);
    }
  /* Een vraag en zijn terugkomende versie: niet dezelfde hint (5.10). */
  if (v.terug) {
    const orig = foutenVan(VRAGEN.find((q) => q.nr === v.nr)!);
    for (const [a, f] of Object.entries(tabel)) if (orig[a] && orig[a].hint === f.hint) fouten.push(`${v.id} ${a}: dezelfde hint als de eerste keer`);
  }
}

/* Elk getal in een zin van Bliepo heeft een kleur of wit (14.20): geen kaal cijfer. */
const kaalCijfer = (z: string) => /\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""));
const alleZinnen: string[] = [ZIN.start, ...ZIN.samen, ZIN.samenTrein, ZIN.samenEerste, ZIN.samenLaatste, ZIN.samenEersteKlaar, ZIN.samenEersteZelf, ZIN.samenLaatsteKlaar, ZIN.samenLaatsteZelf, ZIN.samenSchool, ZIN.samenWeekendDagen, ZIN.samenWeekendTel, ZIN.samenWelkeKlaar, ZIN.samenWelkeZelf, ZIN.samenTelBegin, ZIN.samenWeekTel, ZIN.samenWeekendKlaar, ZIN.samenWeekKlaar, ZIN.handKaart, ZIN.terug1, ZIN.terugN(2), ZIN.terugN(3), ZIN.extra1, ZIN.extraN(3), ZIN.terugLastig, ZIN.slot, ZIN.kaartTik, ...ALLE.map(ZIN.samenTelDag)];
for (const v of ALLE_VRAGEN) {
  alleZinnen.push(...ZIN.vraag(v, true), ...ZIN.vraag(v, false), ...Object.values(foutenVan(v)).flatMap((f) => [f.eerste, f.hint, f.uitleg, ...f.weer]), ...tijdReactie(v).zinnen);
  for (const c of v.keuzes) alleZinnen.push(ZIN.weerGekozen(v, c));
  if (v.invoer === "kaart") alleZinnen.push(ZIN.samenKaartJij(v.goed));
  else alleZinnen.push(ZIN.samenGetalJij(v.goed));
  if (v.soort === "na") alleZinnen.push(ZIN.samenHier(v.dag), ZIN.samenNa(v.dag), ZIN.samenNaKlaar(v.dag), ZIN.samenNaZelf(v.dag));
}
for (const z of alleZinnen) if (kaalCijfer(z)) fouten.push(`getal zonder kleur in "${z}" (14.20)`);

/* De zinnen bij het samen voordoen en de reactie kloppen (11.9). */
for (const v of VRAGEN) {
  const d = v.dag;
  if (v.soort === "na" && ZIN.samenNaKlaar(d) !== `Ja, meteen na ${naam(d)} komt ${naam(na(d))}.`) fouten.push(`${v.id}: samen-zin klopt niet`);
  if (v.soort === "na" && kaartNaam(v.goed) !== naam(na(d))) fouten.push(`${v.id}: de goede kaart is niet de dag erna`);
  /* Het beeld na goed: de goede dag staat in de trein. */
  const b = naGoedBeeld(v);
  if (v.invoer === "kaart" && !dagenVan(v.goed).every((q) => b.includes(q))) fouten.push(`${v.id}: na goed staat het antwoord niet in de trein`);
  /* Tijdens de vraag verklapt het beeld niets: bij een kaartvraag staat het antwoord niet al in de trein. */
  if (v.invoer === "kaart" && dagenVan(v.goed).some((q) => beeldVan(v).includes(q))) fouten.push(`${v.id}: het antwoord staat al in de trein tijdens de vraag`);
  if (v.invoer === "getal" && beeldVan(v).length) fouten.push(`${v.id}: tijdens een getalvraag staat er een trein om te tellen`);
}

/* Afwisseling (5.10): een denkfout die vaker voorkomt, heeft meer dan 1 hint. */
for (const [code, n] of aantalPerCode) if (n >= 3 && (hintsPerCode.get(code)?.size ?? 0) < 2) fouten.push(`denkfout ${code}: ${n} keer, maar maar 1 hint`);

/* Lengte: elk stuk past in het vaste tekstvak (15.30; ± 110 tekens is bij de andere gouden lessen het langste dat past). */
for (const z of alleZinnen) if (kaal(z).length > 110) fouten.push(`te lang voor het tekstvak (${kaal(z).length} tekens): "${kaal(z)}"`);

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Inhoudscontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen + hun terugkomende versie, ${telling} foute antwoorden, ${beweringen} beweringen nagelopen, ${alleZinnen.length} zinnen op kale cijfers en lengte).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 3. De tabel. */
const keuzeNaam = (v: Vraag, x: string) => (v.invoer === "kaart" ? kaartNaam(x) : x);
const vraagNaam = (v: Vraag) => {
  const k = ` (keuzes ${v.keuzes.map((x) => keuzeNaam(v, x)).join(" / ")})`;
  const t = v.terug ? " — terug" : "";
  if (v.soort === "eerste") return `${v.nr}${t}. Wat is de eerste dag van de week?${k}`;
  if (v.soort === "laatste") return `${v.nr}${t}. Wat is de laatste dag van de week?${k}`;
  if (v.soort === "weekendHoeveel") return `${v.nr}${t}. Hoeveel dagen heeft het weekend?${k}`;
  if (v.soort === "weekendWelke") return `${v.nr}${t}. Op welke dagen is het weekend?${k}`;
  if (v.soort === "na") return `${v.nr}${t}. Welke dag komt meteen na ${naam(v.dag)}?${k}`;
  return `${v.nr}${t}. Hoeveel dagen heeft een week?${k}`;
};
const rijen = ALLE_VRAGEN.flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${keuzeNaam(v, a)} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm} |`)).join("\n");
const samenZin = (v: Vraag) => {
  const d = v.dag;
  const kaartstap = `Rondje om de kaart: "${ZIN.samenKaartJij(v.goed)}" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis)`;
  if (v.soort === "eerste") return `De hele trein. Rondje om maandag: "${ZIN.samenEerste}" ${kaartstap} — "${ZIN.samenEersteKlaar}" (vangnet: "${ZIN.samenEersteZelf}")`;
  if (v.soort === "laatste") return `De hele trein. Rondje om zondag: "${ZIN.samenLaatste}" ${kaartstap} — "${ZIN.samenLaatsteKlaar}" (vangnet: "${ZIN.samenLaatsteZelf}")`;
  if (v.soort === "weekendWelke") return `De hele trein. 1 rondje om maandag t/m vrijdag: "${ZIN.samenSchool}" 1 rondje om zaterdag en zondag: "${ZIN.samenWeekendDagen}" ${kaartstap} — "${ZIN.samenWelkeKlaar}" (vangnet: "${ZIN.samenWelkeZelf}")`;
  if (v.soort === "na") return `De hele trein. Rondje om ${naam(d)}: "${ZIN.samenHier(d)}" Rondje om ${naam(na(d))}: "${ZIN.samenNa(d)}" ${kaartstap} — "${ZIN.samenNaKlaar(d)}" (vangnet: "${ZIN.samenNaZelf(d)}")`;
  if (v.soort === "weekendHoeveel") return `De hele trein. 1 rondje om maandag t/m vrijdag: "${ZIN.samenSchool}" 1 rondje om zaterdag en zondag: "${kaal(ZIN.samenWeekendTel)}" Alleen de knop 2: "${kaal(ZIN.samenGetalJij(v.goed))}" — "${kaal(ZIN.samenWeekendKlaar)}"`;
  return `De hele trein. "${ZIN.samenTelBegin}" Rondje loopt van maandag tot zondag (vast tempo, Bliepo noemt elke dag). 1 rondje om alle wagons: "${kaal(ZIN.samenWeekTel)}" Alleen de knop 7: "${kaal(ZIN.samenGetalJij(v.goed))}" — "${kaal(ZIN.samenWeekKlaar)}"`;
};
const uitleg = ALLE_VRAGEN.filter((v) => !v.terug).flatMap((v) => Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${keuzeNaam(v, a)} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} + "Kom, we kijken samen." (3 versies) | ${samenZin(v)} |`)).join("\n");

const tekst = `# FOUTTABEL — gouden les Tijd (squla-tijd-dagen-1-gouden, "Dagen van de week")

Gemaakt op 11 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-tijd-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-tijd-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (12 vragen, de dagen, de dagkaarten, de getallen en de goede antwoorden, en de 3 vragen die terugkomen) is die van squla-tijd-dagen-1 en blijft gelijk (BOUWREGELS 15.22). Elke vraag staat er 2 keer in: de eerste keer en de versie die aan het eind terugkomt (met de andere hint).

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen les over dagen, de week of de kalender (KOPPELING.md §10). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: eerste en laatste verwisseld, de dag ervoor bij "meteen na", schooldagen bij het weekend, een getal te klein of te groot, of een andere dag. Bliepo zegt alleen wat waar is over wat het kind koos; hij verzint geen reden.

Getallen ("2 dagen", "7 dagen", "5 dagen", de getallen op de knoppen) zijn wit: ze verwijzen naar wagons van verschillende kleuren of naar niets in beeld.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos (bij een kaart met een rood rondje om die kaart zolang hij hem noemt). Daarna komt de hint (die eindigt met de vraag), en tegelijk mag het kind opnieuw kiezen (geen 2 keer de vraag). Alles gaat vanzelf door (15.27).
- **Verklappen (15.17):** de eerste zin en de hint noemen het goede antwoord niet, er staat geen "tussen … en …" in, het rondje staat nooit om het antwoord, en er blijven altijd minstens 2 keuzes over ("Na zaterdag komt nog een dag" mag dus niet: dan blijft alleen zondag over). Het script hierboven rekent dat per fout antwoord na en stopt bij een verklapper.
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." en dan samen voordoen (laatste kolom): de hele trein, Bliepo wijst de dagen aan met het rondje, dan staat het rondje om de goede kaart en het kind tikt hem (de kleine stap; na ± 6 s stilte het hulphandje; vangnet: 20 s niets of 3 keer een andere kaart, dan doet Bliepo het zelf: "Kijk, …", geen "Ja"). Bij een getal tikt het kind het getal (alleen die knop staat er). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** kan in deze les alleen met hetzelfde antwoord (elke denkfout hoort bij 1 fout antwoord per vraag); dan wordt de eerste zin "Je koos weer …" en volgt de uitleg (anders dan de hint van de 1e keer).
- **Een ander fout antwoord bij de 2e fout:** de eerste zin begint met "Nu koos je …" (keuring Tellen en Splitsen).
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

## 3. De 2e fout: uitleg en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Samen voordoen |
|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-tijd-dagen-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-tijd-dagen-1-gouden.md geschreven.");
