/**
 * Maakt FOUTTABEL-squla-geld-geldmachine-1-gouden.md uit de code (squla-geld-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.22, 14.30, 15.17; LESRECEPT
 * "geleerd bij Tellen", "geleerd bij de keuring Huisnummers").
 *   npx tsx scripts/fouttabel-geld-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord: de eerste zin en de hint noemen het goede antwoord niet, er blijven
 * na de eerste zin + hint minstens 2 keuzes over (het goede er ook bij), het getal dat het kind zoekt staat wit in de
 * vraag en de hint (14.22), en het rondje staat nooit om het antwoord.
 * Waarheidscontrole: elke bewering in de eerste zin, de hint, de uitleg en de "weer"-zinnen wordt nagelopen tegen het
 * beeld van DEZE vraag (wat het kind koos, vorm, getal, aantal cijfers, kleur, midden, hoeveel munten of briefjes er in
 * beeld liggen). Een zin die het script niet kent, telt als fout.
 */
import { writeFileSync } from "node:fs";
import { isBriefje, type GeldSoort } from "../src/components/les/vlakken/squla-geld-soorten";
import { DENKFOUT_UITLEG, DENKFOUTEN, FEIT, VRAGEN, ZIN, eenheid, foutenVan, geldReactie, getal, goedVan, knop, type Ding, type Fout, type Vraag } from "../src/components/les/lessen/squla-geld-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
const doelVan = (v: Vraag): GeldSoort => (v.soort === "waar" ? v.doel : v.soort === "wat" ? v.ding : v.zoek);
const inBeeld = (v: Vraag): Ding[] => (v.soort === "waar" ? v.keuzes : v.soort === "wat" ? [v.ding] : v.bellen);
const keuzes = (v: Vraag): string[] => (v.soort === "waar" ? v.keuzes : v.soort === "wat" ? v.opties.map(knop) : [...new Set(v.bellen)].filter((b) => b !== v.zoek));
const naamX = (v: Vraag, a: string): Ding => (v.soort === "wat" ? v.opties.find((o) => knop(o) === a)! : (a as Ding));

const fouten: string[] = [];

/* 1. Inhoud en rekenen (11.9, 14.30): 12 vragen zoals squla-geld-geldmachine-1; precies 1 goed antwoord. */
if (VRAGEN.length !== 12) fouten.push(`${VRAGEN.length} vragen in plaats van 12 (squla-geld-geldmachine-1)`);
const telSoort = (s: string) => VRAGEN.filter((v) => v.soort === s).length;
if (telSoort("waar") !== 6 || telSoort("wat") !== 5 || telSoort("bellen") !== 1) fouten.push("niet 6 keer 'waar zie je', 5 keer 'wat is dit' en 1 keer de zwevende munten");
for (const v of VRAGEN) {
  const d = doelVan(v);
  if (v.soort === "waar" && v.keuzes.filter((k) => k === d).length !== 1) fouten.push(`${v.id}: niet precies 1 goed kaartje`);
  if (v.soort === "waar" && new Set(v.keuzes).size !== v.keuzes.length) fouten.push(`${v.id}: 2 kaartjes zijn gelijk`);
  if (v.soort === "wat" && v.opties.filter((k) => k === d).length !== 1) fouten.push(`${v.id}: niet precies 1 goede knop`);
  if (v.soort === "wat" && new Set(v.opties.map(knop)).size !== v.opties.length) fouten.push(`${v.id}: 2 knoppen zijn gelijk`);
  if (v.soort === "bellen" && v.bellen.filter((b) => b === d).length !== 3) fouten.push(`${v.id}: niet 3 munten van 1 euro`);
}

/* 2. Fouttabel compleet, verklapcontrole en waarheidscontrole. */
const bekend = (v: Vraag, x: Ding, z: string): string | null => {
  const d = doelVan(v);
  const xs = x as GeldSoort;
  const beeld = inBeeld(v).filter((k) => k !== "knoop") as GeldSoort[];
  const munten = beeld.filter((k) => !isBriefje(k)).length;
  const briefjes = beeld.filter((k) => isBriefje(k)).length;
  let m: RegExpMatchArray | null;
  /* Wat het kind koos. */
  if ((m = z.match(/^Je (?:koos|tikte op) (?:een|de|het) (munt|briefje) van (\d+) (euro|cent)\.$/))) return x !== "knoop" && m[1] === (isBriefje(xs) ? "briefje" : "munt") && Number(m[2]) === getal(xs) && m[3] === eenheid(xs) ? null : "noemt niet wat het kind koos";
  if ((m = z.match(/^Je koos (\d+) (euro|cent)\.$/))) return x !== "knoop" && Number(m[1]) === getal(xs) && m[2] === eenheid(xs) ? null : "noemt niet wat het kind koos";
  if (/^Je (koos|tikte op) een knoop\.$/.test(z)) return x === "knoop" ? null : "zegt knoop, maar het kind koos geen knoop";
  if (/^Je tikte weer op de knoop\.$/.test(z)) return x === "knoop" ? null : "zegt knoop";
  /* Vorm. */
  if ((m = z.match(/^Dat is geen (munt|briefje)\.$/))) return x !== "knoop" && (m[1] === "munt") === isBriefje(xs) && (m[1] === "munt") === !isBriefje(d) ? null : "klopt niet met de vorm";
  if ((m = z.match(/^Dat is een (munt|briefje)\.$/))) return x !== "knoop" && (m[1] === "briefje") === isBriefje(xs) ? null : "klopt niet met de vorm";
  if ((m = z.match(/^Je koos weer een (munt|briefje)\.$/))) return x !== "knoop" && (m[1] === "briefje") === isBriefje(xs) ? null : "klopt niet met wat het kind koos";
  /* Getal en cijfers op het gekozen geld. */
  if ((m = z.match(/^Daar staat (?:een )?(\d+) op\.$/))) return x !== "knoop" && Number(m[1]) === getal(xs) ? null : "verkeerd getal";
  if ((m = z.match(/^Op (?:dat|een) (?:briefje|munt)(?: van (\d+) (?:euro|cent))? staan (\d+) cijfers\.$/))) return x !== "knoop" && Number(m[2]) === String(getal(xs)).length && (!m[1] || Number(m[1]) === getal(xs)) ? null : "verkeerd aantal cijfers";
  /* Uiterlijk van het gekozen geld. */
  if ((m = z.match(/^De munt van (\d+) euro is (zilver|goud) in het midden\.$/))) return x !== "knoop" && Number(m[1]) === getal(xs) && FEIT.midden[xs] === m[2] ? null : "klopt niet met het midden van de munt";
  if ((m = z.match(/^Het briefje van (\d+) euro is (\w+)\.$/))) return x !== "knoop" && Number(m[1]) === getal(xs) && FEIT.kleur[xs] === m[2] ? null : "klopt niet met de kleur";
  if ((m = z.match(/^Op de munt van (\d+) cent staat een (\d+)\.$/))) return xs === "c50" && Number(m[1]) === 50 && Number(m[2]) === 50 ? null : "klopt niet";
  if (/^Een knoop heeft gaatjes\.$/.test(z)) return x === "knoop" ? null : "knoop";
  if (/^Met een knoop kun je niet betalen\.$/.test(z) || /^Een knoop is geen geld\.$/.test(z)) return x === "knoop" ? null : "knoop";
  /* Uitleg bij de 2e fout (daarna doet Bliepo het samen voor). */
  if (/^(Een munt is rond|Een munt is rond en van metaal|Een briefje is een rechthoek|Een briefje is van papier, met 4 hoeken|Een briefje is een rechthoek van papier|Munten zijn rond en van metaal|Briefjes zijn van papier|Munten zijn rond, briefjes niet|Briefjes zijn rechthoeken, munten niet)\.$/.test(z)) return null;
  /* Hints (hoe je zoekt, waar je kijkt). */
  if (/^We zoeken een munt\.$/.test(z)) return !isBriefje(d) ? null : "we zoeken geen munt";
  if (/^We zoeken een briefje\.$/.test(z)) return isBriefje(d) ? null : "we zoeken geen briefje";
  if (/^Kijk naar de vorm\.$/.test(z)) return null;
  if (/^(Kijk naar het getal op elke munt|Lees het getal op de munten)\.$/.test(z)) return munten >= 2 ? null : "er liggen geen 2 munten";
  if (/^(Kijk naar het getal op elk briefje|Lees het getal op de briefjes|Lees het hele getal op elk briefje)\.$/.test(z)) return briefjes >= 2 ? null : "er liggen geen 2 briefjes";
  if (/^Het getal op een (munt zegt hoeveel hij waard is|briefje zegt hoeveel euro het is)\.$/.test(z)) return null;
  if (/^Kijk naar alle cijfers van het getal\.$/.test(z)) return null;
  if (/^(Dit geld is een rechthoek van papier: een briefje|Kijk naar de vorm: dit is een briefje)\.$/.test(z)) return v.soort === "wat" && isBriefje(d) ? null : "dit geld is geen briefje";
  if (/^(Lees het getal erop|Lees ook het getal|Lees het getal op dit briefje|Lees het hele getal op dit briefje|Kijk naar alle cijfers op dit briefje|Kijk naar de kleur van dit briefje)\.$/.test(z)) return v.soort === "wat" && (!/briefje/.test(z) || isBriefje(d)) ? null : "past niet bij het geld in beeld";
  if (/^(Kijk naar het midden van deze munt|Lees het getal op deze munt|Kijk welk getal er op deze munt staat)\.$/.test(z)) return v.soort === "wat" && !isBriefje(d) ? null : "dit geld is geen munt";
  if (/^Dit is geld: een munt\.$/.test(z)) return v.soort === "wat" && !isBriefje(d) ? null : "dit geld is geen munt";
  if ((m = z.match(/^Tik alleen op munten met een (\d+) erop\.$/)) || (m = z.match(/^Zoek de munten met een (\d+)\.$/))) return v.soort === "bellen" && Number(m[1]) === getal(d) ? null : "klopt niet";
  if (/^Die zijn zilver in het midden\.$/.test(z)) return v.soort === "bellen" && FEIT.midden[d] === "zilver" ? null : "klopt niet";
  if (/^(Dit geld is een rechthoek, geen rondje)\.$/.test(z)) return isBriefje(d) ? null : "klopt niet";
  if (/^(Dit geld is rond, geen rechthoek)\.$/.test(z)) return !isBriefje(d) ? null : "klopt niet";
  if (/^(Het getal op het geld zegt hoeveel het (waard is|is)|Elk geld heeft een eigen getal|Het getal laat zien hoeveel het waard is|Een 0 erachter maakt het getal groter|Elk cijfer hoort bij het getal, ook de 0|Ook de 0 hoort bij het getal)\.$/.test(z)) return null;
  if ((m = z.match(/^Je koos weer een (munt|briefje) met een ander getal\.$/))) return x !== "knoop" && (m[1] === "briefje") === isBriefje(xs) && getal(xs) !== getal(d) ? null : "klopt niet met wat het kind koos";
  if (/^(Je tikte weer op een andere munt|Je keek weer alleen naar het eerste cijfer)\.$/.test(z)) return null;
  if (/^De munt van 1 euro is zilver in het midden, die van 2 euro is goud\.$/.test(z)) return FEIT.midden.m1 === "zilver" && FEIT.midden.m2 === "goud" ? null : "klopt niet";
  if (/^Elk briefje heeft een eigen kleur en een eigen getal\.$/.test(z)) return null;
  if ((m = z.match(/^Alleen een munt met een (\d+) is (\d+) euro\.$/))) return Number(m[1]) === getal(d) && Number(m[2]) === getal(d) ? null : "klopt niet";
  return `onbekende zin (niet na te lopen): "${z}"`;
};

const verklap = (v: Vraag, a: string, f: Fout): string | null => {
  const d = doelVan(v);
  if (f.code !== "onduidelijk" && !f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  if (/tussen .* en /i.test(kaal(`${f.eerste} ${f.hint}`))) return '"tussen … en …" in eerste zin of hint';
  /* Het goede antwoord niet genoemd (bij de zwevende munten noemt de vraag zelf al "1 euro"). */
  if (v.soort !== "bellen" && getallenIn(`${f.eerste} ${f.hint}`).includes(getal(d))) return `de eerste zin of hint noemt het getal van het antwoord (${getal(d)})`;
  if (v.soort === "wat" && kaal(`${f.eerste} ${f.hint}`).includes(goedVan(v))) return "de eerste zin of hint noemt het antwoord";
  /* Kleur verklapt niets: het getal dat het kind zoekt is wit in de hint (14.22). */
  if (new RegExp(`\\{${getal(d)}:(?!wit)`).test(f.hint)) return "het gezochte getal heeft een kleur in de hint";
  /* Het rondje staat nooit om het antwoord. */
  if (f.rondje === "gekozen" && a === d) return "rondje om het antwoord";
  if (!f.over.includes(v.soort === "wat" ? d : d)) return "het goede antwoord valt weg na de hint (de hint klopt niet)";
  if (f.over.length < 2) return `na de eerste zin en de hint blijft alleen ${f.over.join("")} over`;
  /* De zin bij de 2e fout is uitleg, geen opdracht (keuring Getallenlijn): het kind kan hem daarna niet meer doen. */
  for (const z of [...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) if (/^(Tik|Kijk|Lees|Zoek|Tel|Sleep|Wijs)\b/.test(z)) return `opdracht in de uitleg bij de 2e fout: "${z}"`;
  for (const z of [...zinnenVan(f.eerste), ...zinnenVan(f.hint), ...zinnenVan(f.uitleg), ...f.weer.flatMap(zinnenVan)]) {
    const r = bekend(v, naamX(v, a), z);
    if (r) return `waarheidscontrole: ${r}`;
  }
  return null;
};

let telling = 0;
let beweringen = 0;
const hintsPerCode = new Map<string, Set<string>>();
const aantalPerCode = new Map<string, number>();
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = keuzes(v).filter((k) => k !== goedVan(v)).length;
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    beweringen += zinnenVan(f.eerste).length + zinnenVan(f.hint).length + zinnenVan(f.uitleg).length + f.weer.flatMap(zinnenVan).length;
    if (!DENKFOUTEN.includes(f.code)) fouten.push(`${v.id} ${a}: onbekende denkfout ${f.code}`);
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
    if (!hintsPerCode.has(f.code)) hintsPerCode.set(f.code, new Set());
    hintsPerCode.get(f.code)!.add(kaal(f.hint));
    aantalPerCode.set(f.code, (aantalPerCode.get(f.code) ?? 0) + 1);
  }
  /* De vraag zelf: het gezochte getal is wit (14.22). */
  const vraag = v.soort === "waar" ? ZIN.waarVraag(v, true).join(" ") : v.soort === "wat" ? ZIN.watVraag(v).join(" ") : `${ZIN.bellenIntro(v)} ${ZIN.bellenOpdracht(v)}`;
  if (new RegExp(`\\{${getal(doelVan(v))}:(?!wit)`).test(vraag)) fouten.push(`${v.id}: het gezochte getal heeft een kleur in de vraag (verklapt, 14.22)`);
  if (/\{\d+\}/.test(vraag) || /(?<![{\d])\d+(?![\d:])/.test(vraag.replace(/\{\d+:[a-z]+\}/g, ""))) fouten.push(`${v.id}: een getal zonder kleur in de vraag (14.20)`);
}
/* Elk getal in een zin van Bliepo heeft een kleur of wit (14.20): geen kaal cijfer. */
const kaalCijfer = (z: string) => /\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""));
for (const v of VRAGEN) {
  const d = doelVan(v);
  const alle = [
    ...Object.values(foutenVan(v)).flatMap((f) => [f.eerste, f.hint, f.uitleg, ...f.weer]),
    ...geldReactie(v).zinnen,
    ...(v.soort === "waar" ? [...ZIN.waarVraag(v, true), ZIN.opnieuwWaar(v), ZIN.samenWaar(d), ZIN.samenWaarJij(d), ZIN.samenWaarKlaar(d), ZIN.samenWaarZelf(d)] : []),
    ...(v.soort === "wat" ? [...ZIN.watVraag(v), ZIN.opnieuwWat, ZIN.samenWatVorm(d), ZIN.samenWatGetal(d), ZIN.samenWatJij(d), ZIN.samenWatHand(d), ZIN.samenWatKlaar(d), ZIN.samenWatZelf(d)] : []),
    ...(v.soort === "bellen" ? [ZIN.bellenIntro(v), ZIN.bellenOpdracht(v), ZIN.bellenHand(v), ZIN.samenBelEen, ZIN.samenBelNog, ZIN.samenBelJij, ZIN.samenBelHand, ZIN.samenBelKlaar(3), ZIN.samenBelZelf] : []),
  ];
  for (const z of alle) if (kaalCijfer(z)) fouten.push(`${v.id}: getal zonder kleur in "${z}" (14.20)`);
}
for (const z of [ZIN.start, ...ZIN.samen, ZIN.terug1, ZIN.terugN(3), ZIN.extra1, ZIN.extraN(3), ZIN.terugLastig, ZIN.slot]) if (kaalCijfer(z) && !/\$\{/.test(z)) fouten.push(`getal zonder kleur in "${z}" (14.20)`);

/* Afwisseling (5.10): een denkfout die vaker voorkomt, heeft meer dan 1 hint. */
for (const [code, n] of aantalPerCode) if (n >= 3 && (hintsPerCode.get(code)?.size ?? 0) < 2) fouten.push(`denkfout ${code}: ${n} keer, maar maar 1 hint`);
/* De zinnen bij het samen voordoen kloppen (11.9). */
for (const v of VRAGEN) {
  const d = doelVan(v);
  const zinnen = v.soort === "waar" ? [ZIN.samenWaar(d), ZIN.samenWaarKlaar(d)] : v.soort === "wat" ? [ZIN.samenWatVorm(d), ZIN.samenWatGetal(d), ZIN.samenWatKlaar(d)] : [ZIN.samenBelKlaar(3)];
  for (const z of zinnen.map(kaal)) {
    if (v.soort !== "bellen" && !getallenIn(z).every((n) => n === getal(d) || n === 1)) fouten.push(`${v.id}: samen-zin met een ander getal: "${z}"`);
    if (/rechthoek|briefje/.test(z) && !isBriefje(d) && !/munt/.test(z)) fouten.push(`${v.id}: samen-zin zegt briefje bij een munt: "${z}"`);
    if (/\brond\b/.test(z) && isBriefje(d)) fouten.push(`${v.id}: samen-zin zegt rond bij een briefje: "${z}"`);
  }
}

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden, ${beweringen} beweringen nagelopen).`);
console.log(`Hints per denkfout: ${[...hintsPerCode].map(([c, h]) => `${c} ${h.size} versies (${aantalPerCode.get(c)} keer)`).join(", ")}.`);

/* 3. De tabel. */
const naamGeld = (x: Ding) => (x === "knoop" ? "knoop" : `${isBriefje(x) ? "briefje" : "munt"} van ${getal(x)} ${eenheid(x)}`);
const vraagNaam = (v: Vraag) =>
  v.soort === "waar" ? `${v.nr}. Waar zie je een ${naamGeld(v.doel)}? (${v.keuzes.map(naamGeld).join(" / ")})` : v.soort === "wat" ? `${v.nr}. Wat is dit? (${naamGeld(v.ding)}; knoppen ${v.opties.map(knop).join(" / ")})` : `${v.nr}. Zwevende munten: tik op alle munten van 1 euro (${v.bellen.map(naamGeld).join(", ")})`;
const rondjeTekst = (f: Fout) => (f.rondje === "gekozen" ? "rood rondje om het gekozen geld bij de eerste zin" : f.rondje === "geld" ? "rood rondje om het geld in beeld bij de hint" : "geen rondje");
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${vraagNaam(v)} | ${v.soort === "wat" ? a : naamGeld(a as Ding)} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm}; ${rondjeTekst(f)} |`),
).join("\n");
const samenZin = (v: Vraag) => {
  const d = doelVan(v);
  if (v.soort === "waar") return `Rondje om het goede kaartje: "${kaal(ZIN.samenWaar(d))}" — "${kaal(ZIN.samenWaarJij(d))}" (het kind tikt het aan; handje na ± 6 s) — "${kaal(ZIN.samenWaarKlaar(d))}" (vangnet: "${kaal(ZIN.samenWaarZelf(d))}")`;
  if (v.soort === "wat") return `Rondje om het geld: "${kaal(ZIN.samenWatVorm(d))}" "${kaal(ZIN.samenWatGetal(d))}" — "${kaal(ZIN.samenWatJij(d))}" (het kind tikt het geld aan) — "${kaal(ZIN.samenWatKlaar(d))}" (vangnet: "${kaal(ZIN.samenWatZelf(d))}")`;
  return `Bliepo wijst de munten van 1 euro aan die nog niet gevonden zijn, 1 rondje tegelijk ("${kaal(ZIN.samenBelEen)}" "${kaal(ZIN.samenBelNog)}"); de laatste: "${kaal(ZIN.samenBelJij)}" (het kind tikt hem aan) — "${kaal(ZIN.samenBelKlaar(3))}" (vangnet: "${kaal(ZIN.samenBelZelf)}")`;
};
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${v.soort === "wat" ? a : naamGeld(a as Ding)} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} + "Kom, we kijken samen." (3 versies) | ${f.weer.length ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
).join("\n");

const tekst = `# FOUTTABEL — gouden les Geld (squla-geld-geldmachine-1-gouden, "Munten en briefjes")

Gemaakt op 11 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-geld-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-geld-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (12 vragen, het geld, de keuzes) is die van squla-geld-geldmachine-1 en blijft gelijk (BOUWREGELS 15.22). Daarna komen 3 vragen terug (zoals de oude les), met dezelfde fouttabel.

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen les over geld (KOPPELING.md §8). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: de vorm (munt of briefje), hetzelfde eerste cijfer (5 en 50, 10 en 100), een ander getal, of de knoop. Bliepo zegt alleen wat waar is over het geld dat het kind koos; hij verzint geen reden.

In de les staan de getallen in de kleur van het geld (munten geel, 5 grijs-wit, 10 rood, 20 blauw, 50 oranje, 100 groen). Het getal dat het kind zoekt is in de vraag en de hint wit (anders verklapt de kleur het antwoord, 14.22). Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos, met een rood rondje om dat geld zolang hij het noemt (bij "Wat is dit?" gaan de knoppen weg). Daarna komt de hint, en tegelijk mag het kind opnieuw kiezen (geen 2 keer de vraag). Alles gaat vanzelf door (15.27).
- **Verklappen (15.17):** de eerste zin en de hint noemen het goede geld niet, het rondje staat nooit om het antwoord, en er blijven altijd minstens 2 keuzes over. Het script hierboven rekent dat per fout antwoord na en stopt bij een verklapper.
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." en dan samen voordoen (laatste kolom): nu staat het rondje om het goede geld, Bliepo zegt wat het is en waarom, en het kind tikt het aan (de kleine stap). Na ± 6 s stilte komt vanzelf het hulphandje. Vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf ("Kijk, …", geen "Ja"). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (4e kolom).
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …".
- **Een ander fout antwoord bij de 2e fout:** de eerste zin begint met "Nu koos je …" / "Nu tikte je op …" (niet 2 keer "Je koos …" achter elkaar; keuring Tellen en Splitsen).
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (alle foute keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
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
writeFileSync(new URL("../FOUTTABEL-squla-geld-geldmachine-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-geld-geldmachine-1-gouden.md geschreven.");
