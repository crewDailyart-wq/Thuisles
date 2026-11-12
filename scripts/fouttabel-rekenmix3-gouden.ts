/**
 * Maakt FOUTTABEL-squla-rekenmix-mix3-4-gouden.md uit de code (squla-rekenmix3-gouden-zinnen.ts) en controleert de fouttabel
 * (12 november 2026). Gemaakt naar scripts/fouttabel-rekenmix4-gouden.ts, met dezelfde controles (LESRECEPT "Geleerd bij …"):
 *   1. inhoud: dezelfde 15 vragen (ding, doos of zak, totaal, deel buiten, keuzes) als de oude les squla-rekenmix-mix3-4;
 *   2. elk fout antwoord heeft een rij met een vaste denkfout;
 *   3. waarheidscontrole: de som in de eerste zin klopt (buiten + gekozen), "te veel" / "te weinig" in de goede richting,
 *      "buiten" alleen bij het deel dat je ziet, "totaal" alleen bij het totaal;
 *   4. de zinnen bij de 2e fout zijn uitleg, geen opdracht;
 *   5. herhaalcontrole: geen woord of getal 2 keer in 1 reactie bij een fout;
 *   6. WOORDEN-GROEP3.md: geen woord van de niet-lijst, geen "fout"; elk getal heeft een kleur.
 *   npx tsx scripts/fouttabel-rekenmix3-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { VRAGEN, ZIN, SPLITSREACTIE, AANMOEDIG_TIKKEN, foutenVan, splitsFout, plekken, type Fout, type Vraag3 } from "../src/components/les/lessen/squla-rekenmix3-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const fouten: string[] = [];

/* 1. Inhoud: dezelfde vragen als de oude les (uit de bron gelezen, de oude les wordt niet geladen of veranderd). */
{
  const bron = readFileSync(new URL("../src/components/les/lessen/squla-rekenmix.tsx", import.meta.url), "utf8");
  const blok = bron.slice(bron.indexOf('id: "squla-rekenmix-mix3-4"'), bron.indexOf("Rekenmix 4 (Squla 12435)"));
  const vragenBlok = blok.slice(blok.indexOf("vragen: ["));
  const oud = [...vragenBlok.matchAll(/\{ t: "splits", v: (\w+), houder: "(\w+)", tot: (\d+), buiten: (\d+), keuzes: \[([\d, ]+)\] \}/g)].map((m) => ({ ding: m[1] === "BAL" ? "ballen" : "knikkers", houder: m[2], tot: Number(m[3]), buiten: Number(m[4]), keuzes: JSON.parse(`[${m[5]}]`) as number[] }));
  if (oud.length !== 15) fouten.push(`inhoud: in de oude les ${oud.length} splitsvragen gevonden, 15 verwacht`);
  if (VRAGEN.length !== oud.length) fouten.push(`inhoud: ${VRAGEN.length} vragen, de oude les heeft er ${oud.length}`);
  VRAGEN.forEach((v, i) => {
    const o = oud[i];
    if (!o) return;
    const nieuw = { ding: v.ding.naam, houder: v.houder, tot: v.tot, buiten: v.buiten, keuzes: v.keuzes };
    if (JSON.stringify(o) !== JSON.stringify(nieuw)) fouten.push(`inhoud vraag ${v.nr}: oud ${JSON.stringify(o)} / nieuw ${JSON.stringify(nieuw)}`);
    if (!v.keuzes.includes(v.binnen) || new Set(v.keuzes).size !== 3) fouten.push(`vraag ${v.nr}: het goede antwoord staat er niet in of keuzes dubbel`);
    const pl = plekken(v);
    if (pl.filter((p) => p.rol === "buiten").length !== v.buiten || pl.filter((p) => p.rol === "binnen").length !== v.binnen) fouten.push(`vraag ${v.nr}: aantal dingen in beeld klopt niet`);
  });
  console.log(`Inhoud: ${oud.length} vragen van squla-rekenmix-mix3-4 vergeleken (ding, doos of zak, totaal, deel buiten, keuzes).`);
}

/* 2-4. Tabel, waarheid, opdrachten. */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zeg)\b/;
let beweringen = 0;
let telling = 0;
for (const v of VRAGEN) {
  const F = foutenVan(v);
  for (const k of v.keuzes) if (k !== v.binnen && !F[String(k)]) fouten.push(`geen rij voor ${v.id} ${k}`);
  for (const [a, f] of Object.entries(F)) {
    telling++;
    const x = Number(a);
    const waar = `${v.id} ${a}`;
    if (f.code === "onduidelijk") fouten.push(`${waar}: geen vaste denkfout`);
    const alles = [f.eerste, f.hint, f.uitleg, ...f.weer, ZIN.weerGekozen(x, v.ding)].map(kaal);
    const klopt = (re: RegExp, ok: boolean, wat: string) => {
      for (const z of alles)
        if (re.test(z)) {
          beweringen++;
          if (!ok) fouten.push(`${waar}: niet waar: ${wat} ("${z}")`);
        }
    };
    klopt(/te veel|meer dan|te hoog/, x > v.binnen && x !== v.tot, "te veel, maar het kind koos niet te veel");
    klopt(/te weinig|minder dan|te laag/, x < v.binnen, "te weinig, maar het kind koos niet te weinig");
    klopt(/liggen er buiten|Die \d+ zie je al|die buiten liggen/, x === v.buiten, "buiten, maar het gekozen getal is niet het deel dat je ziet");
    klopt(/is het totaal|zijn er samen|Dat zijn ze allemaal|alle \w+ samen/, x === v.tot, "totaal, maar het gekozen getal is niet het totaal");
    const m = /samen (?:met de \w+ buiten is dat |met buiten is dat )?(\d+)|zijn er (\d+) |maakt samen (\d+)/.exec(f.eerste ? kaal(f.eerste) : "");
    if (m && f.code !== "buiten-genoemd" && f.code !== "totaal-genoemd") {
      beweringen++;
      const som = Number(m[1] ?? m[2] ?? m[3]);
      if (som !== v.buiten + x) fouten.push(`${waar}: de som klopt niet: ${som} i.p.v. ${v.buiten + x}`);
    }
    for (const z of [f.uitleg, ...f.weer]) if (OPDRACHT.test(kaal(z))) fouten.push(`${waar}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
  }
  /* Paren (de les kiest bij dezelfde denkfout 2 keer de "weer"-zin): nooit 2 keer dezelfde eerste zin. */
  for (const a of Object.keys(F))
    for (const b of Object.keys(F)) {
      if (a === b) continue;
      const e = F[a];
      const f = F[b];
      const z = e.soort === f.soort ? f.weer[0] : f.eerste;
      if (kaal(z) === kaal(e.eerste)) fouten.push(`${v.id} ${a} dan ${b}: 2 keer dezelfde eerste zin`);
    }
}

/* 5. Herhaalcontrole per reactie. */
const KLEIN = new Set("de het een en is in op je ze die dat dit deze er van niet nog dan zo als hij met tot maar naar wat hier daar al bij hoe waar welke welk".split(" "));
const woordenVan = (t: string) => kaal(t).toLowerCase().split(/[^a-zà-ÿ0-9']+/).filter(Boolean);
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
function dubbel(v: Vraag3, delen: string[]): string | null {
  const vraagWoorden = new Set(woordenVan(ZIN.vraag(v).join(" ")));
  const gezien = new Map<string, number>();
  for (const w of delen.flatMap(woordenVan)) gezien.set(w, (gezien.get(w) ?? 0) + 1);
  for (const [w, n] of gezien) {
    if (n < 2) continue;
    if (/^\d+$/.test(w)) return `getal ${w} ${n} keer`;
    if (KLEIN.has(w) || vraagWoorden.has(w)) continue;
    return `"${w}" ${n} keer`;
  }
  const zinnen = delen.flatMap(zinnenVan);
  for (let i = 1; i < zinnen.length; i++) {
    const a = woordenVan(zinnen[i - 1]).at(-1);
    const b = woordenVan(zinnen[i])[0];
    if (a && b && a === b && !KLEIN.has(a)) return `"${a}" 2 keer achter elkaar`;
  }
  return null;
}
let reacties = 0;
for (const v of VRAGEN) {
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const x = Number(a);
    const lijst: [string, string[]][] = [
      ["1e fout", [f.eerste, f.hint]],
      ["2e fout", [f.eerste, f.uitleg]],
      ["2e fout (zelfde getal)", [ZIN.weerGekozen(x, v.ding), f.uitleg]],
      ["2e fout (weer)", f.weer],
    ];
    for (const [wat, delen] of lijst) {
      reacties++;
      const r = dubbel(v, delen);
      if (r) fouten.push(`${v.id} ${a}: herhaling in 1 reactie (${wat}): ${r} — ${delen.map(kaal).join(" | ")}`);
    }
  }
}

/* 6. Alle zinnen van de les: niet-lijst, "fout", kale cijfers, enkelvoud bij 1. */
const alleZinnen: string[] = [ZIN.begin, ZIN.natellen, ...ZIN.samenHelp, ZIN.slot, ZIN.kaartTik, ...AANMOEDIG_TIKKEN];
for (const v of VRAGEN) {
  alleZinnen.push(...ZIN.vraag(v, false), ...ZIN.vraag(v, true), ZIN.natellenKlaar(v), ZIN.samenBuiten(v), ZIN.samenKomen(v), ZIN.samenTik(v), ZIN.samenHand(v), ZIN.samenKlaar(v), ZIN.samenZelf(v), ...SPLITSREACTIE(v).zinnen);
  for (const [a, f] of Object.entries(foutenVan(v))) alleZinnen.push(f.eerste, f.hint, f.uitleg, ...f.weer, ZIN.weerGekozen(Number(a), v.ding));
}
const NIET = /\b(vergelijk\w*|groep(je|jes|en)?|soort|categorie|combineer\w*|selecteer\w*|aanklik\w*|correct|incorrect|eigenschap\w*|kenmerk\w*|identiek|verhouding)\b/i;
let kaleCijfers = 0;
for (const z of alleZinnen) {
  if (NIET.test(z)) fouten.push(`woord van de niet-lijst (WOORDEN-GROEP3.md): "${z}"`);
  if (/\bfout\b/i.test(z)) fouten.push(`het woord "fout": "${z}"`);
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) {
    kaleCijfers++;
    fouten.push(`kaal cijfer (geen kleur, 14.20): "${z}"`);
  }
}
for (const v of VRAGEN) for (const z of alleZinnen) if (new RegExp(`\\{1:[a-z]+\\} ${v.ding.naam}\\b`).test(z)) fouten.push(`meervoud bij 1: "${z}"`);

console.log(`Fouttabel: ${VRAGEN.length} vragen, ${telling} foute antwoorden; waarheidscontrole ${beweringen} beweringen; herhaalcontrole ${reacties} reacties; ${alleZinnen.length} zinnen nagelopen op de niet-lijst, "fout" en kale cijfers (${kaleCijfers} kaal)`);
if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log("Alles in orde: alles waar, geen herhaling in 1 reactie, geen woord van de niet-lijst.");

/* De leesbare tabel. */
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]: [string, Fout]) => `| ${v.nr}. ${v.tot} ${v.ding.naam}, ${v.buiten} buiten, rest in de ${v.houder} (keuzes ${v.keuzes.join(" / ")}) | ${a} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm} |`),
).join("\n");
const uitleg = VRAGEN.flatMap((v) => {
  const F = Object.entries(foutenVan(v));
  return F.map(([a, f]) => {
    const ander = F.find(([b]) => b !== a)?.[1];
    const weer = !ander || ander.soort !== f.soort ? "— (1e fout was een andere denkfout: dan de uitleg links)" : f.weer.map(kaal).join(" ");
    return `| ${v.nr}. ${v.tot} ${v.ding.naam} | ${a} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} | ${weer} |`;
  });
}).join("\n");

const tekst = `# FOUTTABEL — gouden les Rekenmix 3 heel moeilijk (squla-rekenmix-mix3-4-gouden)

Gemaakt op 12 november 2026, **uit de code** met \`npx tsx scripts/fouttabel-rekenmix3-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-rekenmix3-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, totalen, deel buiten, doos of zak, keuzes, volgorde) is die van de oude les squla-rekenmix-mix3-4 (BOUWREGELS 15.22).

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen zijn splitsvragen ("Er zijn 6 ballen. Hoeveel zitten er in de doos?"), dus ze volgen de **gouden les Splitsen** (het totaal, het deel dat je ziet, het deel dat je zoekt) in het verloop van de gouden Rekenmix. **Eigen invulling, niet van Synthesis:** de hints, de uitleg en deze tabel.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):** 1e fout = Bliepo's scherm 1,5 s rood, de eerste zin hieronder, dan de hint en de 3 knoppen terug. 2e fout = de eerste zin en de uitleg (geen opdracht), "Kom, we tellen ze samen.", Bliepo telt wat buiten ligt, de dingen komen uit de doos en het kind tikt ze aan; Bliepo telt verder. De les gaat door. Dezelfde denkfout 2 keer: "weer"-zinnen; hetzelfde foute getal 2 keer: "Je koos weer 3.".

## 1. Denkfouten

| Naam in de voortgang | Wat het kind waarschijnlijk deed |
|---|---|
| \`buiten-genoemd\` | noemde het deel dat je ziet (buiten) |
| \`totaal-genoemd\` | noemde het totaal |
| \`te-veel\` | koos te veel: buiten en gekozen getal samen komt boven het totaal |
| \`te-weinig\` | koos te weinig: buiten en gekozen getal samen komt onder het totaal |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen (komt niet voor) |

## 2. Per vraag: elk fout antwoord (${telling} rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

| Vraag | 2e fout (denkfout) | Eerste zin + uitleg bij de 2e fout | Als de 1e fout (het andere foute antwoord) dezelfde denkfout was |
|---|---|---|---|
${uitleg}

## 4. Controles van het script

Inhoud gelijk aan squla-rekenmix-mix3-4; ${telling} foute antwoorden met een vaste denkfout; waarheidscontrole (${beweringen} beweringen, ook of de som in de eerste zin klopt); geen opdracht in de uitleg; herhaalcontrole (${reacties} reacties); geen woord van de niet-lijst en geen "fout"; elk getal heeft een kleur.
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekenmix-mix3-4-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekenmix-mix3-4-gouden.md geschreven");

