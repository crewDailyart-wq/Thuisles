/**
 * Maakt FOUTTABEL-squla-rekenmix-mix4-1-gouden.md uit de code (squla-rekenmix4-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en controleert de fouttabel (12 november 2026). Gemaakt naar scripts/fouttabel-rekenmix-gouden.ts
 * (Rekenmix 1), met dezelfde controles (LESRECEPT "Geleerd bij …"):
 *   1. inhoud: dezelfde 15 vragen (ding, soort, aantal, keuzes, rijen, andere dingen, delen) als de oude les
 *      squla-rekenmix-mix4-1 (gelezen uit de bron);
 *   2. elk fout antwoord heeft een rij met een vaste denkfout;
 *   3. verklapcontrole (15.17): na eerste zin + hint blijven er minstens 2 keuzes logisch over;
 *   4. waarheidscontrole: "dichtbij" alleen bij hooguit 2 verschil, "te veel"/"te weinig" in de goede richting,
 *      "rij voor rij"/"linksboven" alleen bij rijen, "van boven naar beneden" alleen door elkaar, "alleen de …" alleen in een
 *      druk plaatje, "bovenste rij"/"beide rijen" alleen bij 2 rijen samen, enkelvoud bij 1;
 *   5. de zinnen bij de 2e fout zijn uitleg, geen opdracht;
 *   6. paren: 2 foute antwoorden bij 1 vraag zeggen nooit allebei "dichtbij";
 *   7. herhaalcontrole: geen woord of getal 2 keer in 1 reactie bij een fout;
 *   8. WOORDEN-GROEP3.md: geen woord van de niet-lijst (ook niet "groep"), geen "fout";
 *   9. elk getal in een zin heeft een kleur; geen kaal cijfer in alle zinnen van de les.
 *   npx tsx scripts/fouttabel-rekenmix4-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { RICHTINGWOORDEN, VRAGEN, ZIN, TELREACTIE, AANMOEDIG_TIKKEN, dichtbijAnders, foutenVan, zonderDichtbij, plekken, type Fout, type Vraag4 as Rmvraag } from "../src/components/les/lessen/squla-rekenmix4-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const fouten: string[] = [];

/* 1. Inhoud: dezelfde vragen als de oude les (uit de bron gelezen, de oude les wordt niet geladen of veranderd). */
{
  const bron = readFileSync(new URL("../src/components/les/lessen/squla-rekenmix.tsx", import.meta.url), "utf8");
  const blok = bron.slice(bron.indexOf('id: "squla-rekenmix-mix4-1"'), bron.indexOf("const mix4_2"));
  const vragenBlok = blok.slice(blok.indexOf("vragen: ["));
  const regels = [...vragenBlok.matchAll(/\{ t: "tel", v: (\w+), gr: (.*?), keuzes: \[([\d, ]+)\], soort: "(\w+)"/g)];
  const naarDing: Record<string, string> = { APPEL: "appels", BAL: "ballen", KNIKKER: "knikkers", STER: "sterren", AARDBEI: "aardbeien", KRAAL: "kralen", RAKET: "raketjes", PLANEET: "planeten", UFO: "ufo's", SATELLIET: "satellieten", KNOOP: "knopen" };
  const beeldNaam: Record<string, string> = { raketje: "raketjes", ster: "sterren", planeet: "planeten", ufo: "ufo's", satelliet: "satellieten", bal: "ballen", appel: "appels", knikker: "knikkers" };
  const oud = regels.map((m) => {
    const gr = m[2];
    const soort = m[4];
    const o: Record<string, unknown> = { ding: naarDing[m[1]], soort, keuzes: JSON.parse(`[${m[3]}]`) };
    if (gr.startsWith("los(")) {
      const soorten = [...gr.matchAll(/naam: "(\w+)", n: (\d+)/g)].map((x) => ({ ding: beeldNaam[x[1]] ?? x[1], n: Number(x[2]) }));
      o.n = soorten[0].n;
      if (soort === "druk") o.extra = soorten.slice(1);
    } else if (gr.startsWith("rijen(")) {
      const r = JSON.parse(/\[([\d, ]+)\]/.exec(gr)![0]) as number[];
      o.n = r.reduce((x, y) => x + y, 0);
      o.rijen = r;
    } else if (gr.startsWith("tweeGroepen(")) {
      const g = /tweeGroepen\("\w+", (\d+), (\d+)/.exec(gr)!;
      o.n = Number(g[1]) + Number(g[2]);
      o.delen = [Number(g[1]), Number(g[2])];
    }
    return o;
  });
  if (oud.length !== 15) fouten.push(`inhoud: in de oude les ${oud.length} telvragen gevonden, 15 verwacht`);
  if (VRAGEN.length !== oud.length) fouten.push(`inhoud: ${VRAGEN.length} vragen, de oude les heeft er ${oud.length}`);
  VRAGEN.forEach((v, i) => {
    const o = oud[i];
    if (!o) return;
    const nieuw: Record<string, unknown> = { ding: v.ding.naam, soort: v.soort, keuzes: v.keuzes, n: v.n };
    if (v.rijen) nieuw.rijen = v.rijen;
    if (v.delen) nieuw.delen = v.delen;
    if (v.soort === "druk") nieuw.extra = (v.extra ?? []).map((e) => ({ ding: e.ding.naam, n: e.n }));
    const sleutels = (x: Record<string, unknown>) => JSON.stringify(Object.keys(x).sort().map((k) => [k, x[k]]));
    if (sleutels(o) !== sleutels(nieuw)) fouten.push(`inhoud vraag ${v.nr}: oud ${JSON.stringify(o)} / nieuw ${JSON.stringify(nieuw)}`);
    if (!v.keuzes.includes(v.n) || new Set(v.keuzes).size !== 3) fouten.push(`vraag ${v.nr}: het goede antwoord staat er niet in of keuzes dubbel`);
    const pl = plekken(v);
    if (pl.filter((p) => p.doel).length !== v.n) fouten.push(`vraag ${v.nr}: ${pl.filter((p) => p.doel).length} dingen om te tellen in beeld, ${v.n} verwacht`);
    if (v.soort === "druk" && pl.length !== v.n + (v.extra ?? []).reduce((t, e) => t + e.n, 0)) fouten.push(`vraag ${v.nr}: aantal dingen in beeld klopt niet`);
  });
  console.log(`Inhoud: ${oud.length} vragen van squla-rekenmix-mix4-1 vergeleken (ding, soort, aantal, keuzes, rijen, andere dingen, delen).`);
}

/* 2–6. Tabel, verklappen, waarheid, opdrachten, paren. */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zeg)\b/;
let beweringen = 0;
let telling = 0;
for (const v of VRAGEN) {
  const F = foutenVan(v);
  for (const k of v.keuzes) if (k !== v.n && !F[String(k)]) fouten.push(`geen rij voor ${v.id} ${k}`);
  for (const [a, f] of Object.entries(F)) {
    telling++;
    const x = Number(a);
    const waar = `${v.id} ${a}`;
    if (f.code === "onduidelijk") fouten.push(`${waar}: geen vaste denkfout`);
    /* Zonder kleurcode ({1:wit} → 1), anders herkent de verklapcontrole "1 keer" en "maar 1" niet (keuring 12 nov). */
    const tekst = kaal(`${f.eerste} ${f.hint}`);
    const rest = v.keuzes.filter((k) => k !== x);
    const meer = /nog niet allemaal|te weinig|sla er geen|niet geteld|\bover\b|maar een deel/i.test(tekst);
    const minder = /te veel|1 keer|maar 1/i.test(tekst);
    const over = rest.filter((k) => (meer ? k > x : true) && (minder ? k < x : true));
    if (f.noot && RICHTINGWOORDEN.test(kaal(f.hint))) fouten.push(`${waar}: hint geeft toch een richting: "${f.hint}"`);
    if (over.length <= 1) fouten.push(`${waar}: na "${kaal(tekst)}" blijft alleen ${over.join("")} over`);
    if (!over.includes(v.n)) fouten.push(`${waar}: het goede antwoord valt weg na "${kaal(tekst)}" (de zin klopt niet)`);
    const alles = [f.eerste, f.hint, f.uitleg, ...f.weer, ...(f.noot ? [dichtbijAnders(x, v)] : []), zonderDichtbij(x, v), ZIN.weerGekozen(x, v.ding)].map(kaal);
    const klopt = (re: RegExp, ok: boolean, wat: string) => {
      for (const z of alles)
        if (re.test(z)) {
          beweringen++;
          if (!ok) fouten.push(`${waar}: niet waar: ${wat} ("${z}")`);
        }
    };
    klopt(/dichtbij|scheelt niet veel/, Math.abs(x - v.n) <= 2, "dichtbij, maar het scheelt meer dan 2");
    klopt(/te veel|2 keer geteld/, x > v.n, "te veel, maar het kind koos minder");
    klopt(/nog niet allemaal|te weinig|Er mist|Er missen/, x < v.n, "te weinig, maar het kind koos meer");
    klopt(/Er mist nog 1 |Er is 1 /, Math.abs(x - v.n) === 1, "1 verschil, maar het is meer");
    klopt(/een paar/, Math.abs(x - v.n) >= 2, "een paar, maar het is er 1");
    klopt(/rij voor rij|linksboven/, v.vorm === "rijen", "rij voor rij / linksboven, maar ze liggen niet in rijen");
    klopt(/van boven naar beneden/, v.vorm === "los", "van boven naar beneden, alleen bij door elkaar");
    klopt(/alleen de |de rest telt niet mee|Zoek /, v.vorm === "druk", "alleen de …, maar het is geen druk plaatje");
    klopt(/bovenste|onderste|beide rijen|andere rij/, v.vorm === "samen", "bovenste/onderste rij, maar het zijn geen 2 rijen samen");
    klopt(/maar een deel/, v.vorm === "samen" && !!v.delen?.includes(x) && x < v.n, "maar een deel, maar het gekozen getal is geen rij");
    klopt(new RegExp(`\\b${v.ding.een}\\b`), true, "");
    for (const z of [f.uitleg, ...f.weer]) if (OPDRACHT.test(kaal(z))) fouten.push(`${waar}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
    if (f.noot && dichtbijAnders(x, v) === f.eerste) fouten.push(`${waar}: dichtbijAnders is dezelfde zin als de eerste zin`);
    const z2 = kaal(zonderDichtbij(x, v));
    if (/dichtbij/.test(z2)) fouten.push(`${waar}: zonderDichtbij zegt toch "dichtbij": "${z2}"`);
  }
  /* Paren (zelfde keuze van de eerste zin bij de 2e fout als de les): nooit 2 keer "dichtbij". */
  for (const a of Object.keys(F))
    for (const b of Object.keys(F)) {
      if (a === b) continue;
      const e = F[a];
      const f = F[b];
      const zelfde = e.soort === f.soort && !e.noot && f.code !== "onduidelijk";
      let z = zelfde ? f.weer[0] : f.eerste;
      if (!zelfde && e.noot && f.noot) z = dichtbijAnders(Number(b), v);
      if (/dichtbij/.test(e.eerste) && /dichtbij/.test(z)) z = zonderDichtbij(Number(b), v);
      if (/dichtbij/.test(e.eerste) && /dichtbij/.test(z)) fouten.push(`${v.id} ${a} dan ${b}: 2 keer "dichtbij"`);
      if (kaal(z) === kaal(e.eerste)) fouten.push(`${v.id} ${a} dan ${b}: 2 keer dezelfde eerste zin`);
    }
}
const zonderRichting = new Set(VRAGEN.flatMap((v) => Object.values(foutenVan(v)).filter((f) => f.noot).map((f) => kaal(f.eerste).replace(/\d+/g, "#"))));
const aantalZonderRichting = VRAGEN.flatMap((v) => Object.values(foutenVan(v)).filter((f) => f.noot)).length;
if (zonderRichting.size < Math.min(3, aantalZonderRichting)) fouten.push(`eerste zin zonder richting heeft maar ${zonderRichting.size} versie(s): ${[...zonderRichting].join(" | ")}`);

/* 7. Herhaalcontrole per reactie. */
const KLEIN = new Set("de het een en is in op je ze die dat dit deze er van niet nog dan zo als hij met tot maar naar wat hier daar al bij hoe waar welke welk".split(" "));
const VAST = [/\brij voor rij\b/g, /\b1 voor 1\b/g];
const woordenVan = (t: string) => VAST.reduce((s, re) => s.replace(re, (m) => m.replace(/ /g, "")), kaal(t).toLowerCase()).split(/[^a-zà-ÿ0-9']+/).filter(Boolean);
const zinnenVan = (t: string) => kaal(t).split(/(?<=[.!?])\s+/).filter(Boolean);
function dubbel(v: Rmvraag, delen: string[]): string | null {
  const vraagWoorden = new Set(woordenVan(ZIN.vraag(v, false).join(" ")));
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
  const F = foutenVan(v);
  for (const [a, f] of Object.entries(F)) {
    const x = Number(a);
    const lijst: [string, string[]][] = [
      ["1e fout", [f.eerste, f.hint]],
      ["2e fout", [f.eerste, f.uitleg]],
      ["2e fout (zelfde getal)", [ZIN.weerGekozen(x, v.ding), f.uitleg]],
      ...(f.noot ? [["2e fout (andere versie)", [dichtbijAnders(x, v), f.uitleg]] as [string, string[]]] : []),
      ["2e fout (zonder dichtbij)", [zonderDichtbij(x, v), f.uitleg]],
      ["2e fout (weer)", f.weer],
    ];
    for (const [wat, delen] of lijst) {
      reacties++;
      const r = dubbel(v, delen);
      if (r) fouten.push(`${v.id} ${a}: herhaling in 1 reactie (${wat}): ${r} — ${delen.map(kaal).join(" | ")}`);
    }
  }
}

/* 8 en 9. Alle zinnen van de les: niet-lijst, "fout", kale cijfers. */
const alleZinnen: string[] = [ZIN.begin, ZIN.natellen, ...ZIN.samenHelp, ZIN.slot, ZIN.kaartTik, ...AANMOEDIG_TIKKEN];
for (const v of VRAGEN) {
  alleZinnen.push(ZIN.vraag(v, false).join(" "), ZIN.natellenKlaar(v.n, v.ding), ZIN.samenTik(v.ding), ZIN.samenHand(v.ding), ZIN.samenKlaar(v.n, v.ding), ZIN.samenZelf(v.n, v.ding), ...TELREACTIE(v.n, v.ding).zinnen);
  for (const [a, f] of Object.entries(foutenVan(v))) alleZinnen.push(f.eerste, f.hint, f.uitleg, ...f.weer, ...(f.noot ? [dichtbijAnders(Number(a), v)] : []), zonderDichtbij(Number(a), v), ZIN.weerGekozen(Number(a), v.ding));
}
const NIET = /\b(vergelijk\w*|groep(je|jes|en)?|soort|categorie|combineer\w*|selecteer\w*|aanklik\w*|correct|incorrect|eigenschap\w*|kenmerk\w*|identiek|verhouding)\b/i;
let kaleCijfers = 0;
for (const z of alleZinnen) {
  if (NIET.test(z)) fouten.push(`woord van de niet-lijst (WOORDEN-GROEP3.md): "${z}"`);
  if (/\bfout\b/i.test(z)) fouten.push(`het woord "fout": "${z}"`);
  const zonderMarkup = z.replace(/\{\d+:[a-z]+\}/g, "");
  if (/\d/.test(zonderMarkup)) {
    kaleCijfers++;
    fouten.push(`kaal cijfer (geen kleur, 14.20): "${z}"`);
  }
}
/* "elk potlood", niet "elke potlood" (het-woord). */
for (const z of alleZinnen) if (/\belke potlood\b/i.test(z)) fouten.push(`"elke potlood": "${z}"`);
/* Enkelvoud bij 1 (keuring Tellen en Splitsen): "1 bal", nooit "1 ballen". */
for (const v of VRAGEN) for (const z of alleZinnen) if (new RegExp(`\\{1:[a-z]+\\} ${v.ding.naam.replace(/'/g, "'")}\\b`).test(z)) fouten.push(`meervoud bij 1: "${z}"`);

console.log(`Fouttabel: ${VRAGEN.length} vragen, ${telling} foute antwoorden; waarheidscontrole ${beweringen} beweringen; herhaalcontrole ${reacties} reacties; ${alleZinnen.length} zinnen nagelopen op de niet-lijst, "fout" en kale cijfers (${kaleCijfers} kaal); ${zonderRichting.size} versies van de eerste zin zonder richting.`);
if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log("Alles in orde: geen verklapper, alles waar, geen herhaling in 1 reactie, geen woord van de niet-lijst.");

/* De leesbare tabel. */
const vormNaam = { los: "door elkaar", rijen: "in rijen", druk: "in een druk plaatje (alleen deze soort tellen)", samen: "2 rijen samen" } as const;
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]: [string, Fout]) => `| ${v.nr}. ${v.n} ${v.ding.naam}, ${vormNaam[v.vorm]}${v.rijen ? ` (${v.rijen.join("+")})` : ""} (keuzes ${v.keuzes.join(" / ")}) | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste)} | ${kaal(f.hint)} | ${f.scherm} |`),
).join("\n");
const uitleg = VRAGEN.flatMap((v) => {
  const F = Object.entries(foutenVan(v));
  return F.map(([a, f]) => {
    const ander = F.find(([b]) => b !== a)?.[1];
    const weer = !ander || ander.soort !== f.soort ? "— (1e fout was een andere denkfout: dan de uitleg links)" : ander.noot ? "— (1e keer zei Bliepo alleen \"… is dichtbij\": dan de uitleg links)" : f.weer.map(kaal).join(" ");
    return `| ${v.nr}. ${v.n} ${v.ding.naam} | ${a} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} | ${weer} |`;
  });
}).join("\n");

const tekst = `# FOUTTABEL — gouden les Rekenmix 4 (squla-rekenmix-mix4-1-gouden, "Rekenmix 4")

Gemaakt op 12 november 2026, **uit de code** met \`npx tsx scripts/fouttabel-rekenmix4-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-rekenmix4-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, dingen, aantallen, soorten, keuzes, volgorde) is die van de oude les squla-rekenmix-mix4-1 (BOUWREGELS 15.22).

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen zijn telvragen, dus ze volgen de **gouden les Tellen** en de gouden Rekenmix 1 (zelfde verloop, zelfde zinnen voor vraag, natellen, samen tellen, vangnet en lof met het aantal). **Eigen invulling, niet van Synthesis:** de hints en de uitleg, passend bij de 3 soorten telvraag: gewoon tellen (door elkaar of in rijen), tellen in een druk plaatje (de andere dingen tellen niet mee) en 2 rijen samen tellen. Het woord "groepje" van de oude les staat op de niet-lijst; hier heten het "rijen".

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):** 1e fout = Bliepo's scherm 1,5 s rood, de eerste zin hieronder, dan de hint en de 3 knoppen terug. 2e fout = de eerste zin en de uitleg (geen opdracht), "Kom, we tellen ze samen." en het kind tikt elk ding aan dat meetelt (in een druk plaatje alleen de gevraagde soort); de les gaat door. Dezelfde denkfout 2 keer: "weer"-zinnen; hetzelfde foute getal 2 keer: "Je koos weer 9.".

## 1. Denkfouten

| Naam in de voortgang | Wat het kind waarschijnlijk deed |
|---|---|
| \`te-weinig\` | telde er te weinig (sloeg er een over) |
| \`te-veel\` | telde er te veel (een 2 keer, of in een druk plaatje ook andere dingen mee) |
| \`maar-een-rij\` | alleen bij 2 rijen samen: koos het aantal van 1 rij |
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

Inhoud gelijk aan squla-rekenmix-mix4-1; ${telling} foute antwoorden met een vaste denkfout; verklapcontrole; waarheidscontrole (${beweringen} beweringen); geen opdracht in de uitleg; herhaalcontrole (${reacties} reacties); geen woord van de niet-lijst en geen "fout"; elk getal heeft een kleur.
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekenmix-mix4-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekenmix-mix4-1-gouden.md geschreven");
