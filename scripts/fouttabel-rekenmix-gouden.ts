/**
 * Maakt FOUTTABEL-squla-rekenmix-mix1-1-gouden.md uit de code (squla-rekenmix-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en controleert de fouttabel (11 november 2026). Gemaakt naar scripts/fouttabel-tellen-gouden.ts (de
 * vragen volgen de gouden les Tellen), met de controles die later zijn geleerd (LESRECEPT "Geleerd bij …"):
 *   1. inhoud: dezelfde 15 vragen, aantallen en keuzes als de oude les squla-rekenmix-mix1-1 (gelezen uit de bron);
 *   2. elk fout antwoord heeft een rij met een vaste denkfout;
 *   3. verklapcontrole (15.17): na eerste zin + hint blijven er minstens 2 keuzes logisch over; zonder richting ook geen
 *      richtingwoord in de hint;
 *   4. waarheidscontrole: "dichtbij" alleen bij hooguit 2 verschil, "te veel"/"te weinig" in de goede richting,
 *      "rij voor rij"/"linksboven" alleen bij rijen, "van links naar rechts"/"Begin links" alleen bij 2 aan 2,
 *      "van boven naar beneden" niet bij rijen of 2 aan 2, enkelvoud bij 1;
 *   5. de zinnen bij de 2e fout zijn uitleg, geen opdracht;
 *   6. paren: 2 foute antwoorden bij 1 vraag zeggen nooit allebei "dichtbij"; zonder richting minstens 3 versies;
 *   7. herhaalcontrole (geleerd bij Rekentaal, Tijd): geen woord of getal 2 keer in 1 reactie bij een fout (eerste zin +
 *      hint; eerste zin, "Je koos weer …" of een andere eerste zin + uitleg; de "weer"-zinnen), behalve kleine woordjes,
 *      de woorden van de vraag en vaste uitdrukkingen ("rij voor rij", "1 voor 1");
 *   8. WOORDEN-GROEP3.md: geen woord van de niet-lijst (vergelijk, groep, soort, correct, selecteer …), ook niet in de
 *      reserve-versies; geen "fout";
 *   9. elk getal in een zin heeft een kleur ({n:kleur}); geen kaal cijfer in alle zinnen van de les.
 *   npx tsx scripts/fouttabel-rekenmix-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { RICHTINGWOORDEN, VRAGEN, ZIN, TELREACTIE, AANMOEDIG_TIKKEN, dichtbijAnders, foutenVan, zonderDichtbij, type Fout, type Rmvraag } from "../src/components/les/lessen/squla-rekenmix-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const fouten: string[] = [];

/* 1. Inhoud: dezelfde vragen als de oude les (uit de bron gelezen, de oude les wordt niet geladen of veranderd). */
{
  const bron = readFileSync(new URL("../src/components/les/lessen/squla-rekenmix.tsx", import.meta.url), "utf8");
  const blok = bron.slice(bron.indexOf('id: "squla-rekenmix-mix1-1"'), bron.indexOf("const mix1_2"));
  const vragenBlok = blok.slice(blok.indexOf("vragen: ["));
  const vragen = [...vragenBlok.matchAll(/\{ t: "tel", v: (\w+), gr: (los|rijen|paren)\((.*?)\), keuzes: \[([\d, ]+)\]/g)];
  const naarDing: Record<string, string> = { APPEL: "appels", BAL: "ballen", POTLOOD: "potloden", AUTO: "auto's", BLOEM: "bloemen", KNIKKER: "knikkers", STER: "sterren" };
  const oud = vragen.map((m) => {
    const vorm = m[2];
    const args = m[3];
    const n = vorm === "los" ? Number(/n: (\d+)/.exec(args)![1]) : vorm === "paren" ? Number(args.split(",")[1]) : (JSON.parse(/\[([\d, ]+)\]/.exec(args)![0]) as number[]).reduce((a, b) => a + b, 0);
    const rijen = vorm === "rijen" ? (JSON.parse(/\[([\d, ]+)\]/.exec(args)![0]) as number[]) : undefined;
    return { ding: naarDing[m[1]], vorm, n, keuzes: JSON.parse(`[${m[4]}]`) as number[], rijen };
  });
  if (oud.length !== 15) fouten.push(`inhoud: in de oude les ${oud.length} telvragen gevonden, 15 verwacht`);
  if (VRAGEN.length !== oud.length) fouten.push(`inhoud: ${VRAGEN.length} vragen, de oude les heeft er ${oud.length}`);
  VRAGEN.forEach((v, i) => {
    const o = oud[i];
    if (!o) return;
    const zelfde = o.ding === v.ding.naam && o.vorm === v.vorm && o.n === v.n && JSON.stringify(o.keuzes) === JSON.stringify(v.keuzes) && JSON.stringify(o.rijen) === JSON.stringify(v.rijen);
    if (!zelfde) fouten.push(`inhoud vraag ${v.nr}: oud ${JSON.stringify(o)} / nieuw ${JSON.stringify({ ding: v.ding.naam, vorm: v.vorm, n: v.n, keuzes: v.keuzes, rijen: v.rijen })}`);
    if (!v.keuzes.includes(v.n) || new Set(v.keuzes).size !== 3) fouten.push(`vraag ${v.nr}: het goede antwoord staat er niet in of keuzes dubbel`);
  });
  console.log(`Inhoud: ${oud.length} vragen van squla-rekenmix-mix1-1 vergeleken (ding, manier van liggen, aantal, keuzes, rijen).`);
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
    const tekst = `${f.eerste} ${f.hint}`;
    const rest = v.keuzes.filter((k) => k !== x);
    const meer = /nog niet allemaal|te weinig|sla er geen|niet geteld|\bover\b/i.test(tekst);
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
    klopt(/van links naar rechts|Begin links /, v.vorm === "paren", "van links naar rechts, maar alleen bij 2 aan 2");
    klopt(/van boven naar beneden/, v.vorm === "los", "van boven naar beneden, alleen bij door elkaar");
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
  const vraagWoorden = new Set(woordenVan(ZIN.vraag(v.ding)));
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
const alleZinnen: string[] = [ZIN.begin, ZIN.vraagEerste, ZIN.natellen, ...ZIN.samenHelp, ZIN.slot, ZIN.kaartTik, ...AANMOEDIG_TIKKEN];
for (const v of VRAGEN) {
  alleZinnen.push(ZIN.vraag(v.ding), ZIN.natellenKlaar(v.n, v.ding), ZIN.samenTik(v.ding), ZIN.samenHand(v.ding), ZIN.samenKlaar(v.n, v.ding), ZIN.samenZelf(v.n, v.ding), ...TELREACTIE(v.n, v.ding).zinnen);
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
const vormNaam = { los: "door elkaar", rijen: "in rijen", paren: "2 aan 2" } as const;
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

const tekst = `# FOUTTABEL — gouden les Rekenmix (squla-rekenmix-mix1-1-gouden, "Rekenmix 1")

Gemaakt op 11 november 2026, **uit de code** met \`npx tsx scripts/fouttabel-rekenmix-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-rekenmix-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, dingen, aantallen, manier van liggen, 3 keuzes per vraag) is die van squla-rekenmix-mix1-1 en blijft gelijk (BOUWREGELS 15.22); het script vergelijkt dat met de oude les.

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen zijn telvragen, dus ze volgen de **gouden les Tellen** (squla-tellen-fruit-1-gouden; draaiboek Tellen, Color Count). Zelfde verloop, zelfde zinnen (vraag, natellen, samen tellen, vangnet, lof met het aantal), zelfde soort reactie bij een fout (§3 A, §7): Bliepo noemt het gekozen getal en de richting (te weinig / te veel), of geen richting als die maar 1 keuze zou overlaten.

**Eigen invulling, niet van Synthesis (net als bij Tellen):** de hints, de uitleg en deze tabel. Anders dan bij Tellen: de dingen liggen hier soms **door elkaar**, soms **in rijen** en soms **2 aan 2**; de hint past bij wat het kind ziet ("rij voor rij" alleen bij rijen, "van links naar rechts" bij 2 aan 2, "van boven naar beneden" bij door elkaar). Sommige keuzes liggen 3 naast het goede getal (Squla): dan zegt Bliepo niet "dichtbij". En geen woord of getal 2 keer in 1 reactie (geleerd bij Rekentaal en Tijd).

In de les staan de getallen in de kleur van het ding (appel, bal, auto en bloem rood; potlood groen; knikker blauw; ster geel); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11), zoals de gouden les Tellen:**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de vraag en de knoppen even weg, de dingen blijven staan zonder nummers. Bliepo zegt de eerste zin (± 0,7 s na de zin gaat het vanzelf verder, 15.27); daarna komen de 3 knoppen terug met de hint (een vraag: geen pijl).
- **2e fout:** de eerste zin en een korte uitleg bij de denkfout (geen opdracht, zonder het antwoord), "Kom, we tellen ze samen." Dan tikt het kind elk ding aan (een opdracht: geen pijl); er komt een nummer bij en Bliepo zegt het getal. Het laatste getal is het aantal; de les gaat vanzelf door. Na ± 6 s stilte komt vanzelf het hulphandje; na 20 s zonder tik telt Bliepo de rest zelf ("Kijk, ik tel de rest. …").
- **Dezelfde denkfout 2 keer** (en Bliepo noemde de 1e keer de richting): "Je telde er weer …" en een andere uitleg (laatste kolom van §3). **Hetzelfde foute getal 2 keer:** "Je koos weer 9." in plaats van dezelfde eerste zin.
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (elk fout antwoord is kleiner of groter dan het goede).
- Elke fout wordt met de naam van de denkfout bewaard; elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

## 1. Denkfouten (zelfde namen als de gouden les Tellen)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-weinig\` | telde er te weinig (sloeg er een over) | draaiboek Tellen §7 |
| \`te-veel\` | telde er te veel (telde er een 2 keer) | draaiboek Tellen §7 |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

Niet gebruikt: \`alleen-volle-rijen\` van de gouden les Tellen (in deze les is geen fout antwoord gelijk aan alleen de volle rijen).

## 2. Per vraag: elk fout antwoord (${telling} rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd "Kom, we tellen ze samen." (of een andere versie) en het samen tellen (nu pas het aantal in beeld).

| Vraag | 2e fout (denkfout) | Eerste zin + uitleg bij de 2e fout | Als de 1e fout (het andere foute antwoord) dezelfde denkfout was |
|---|---|---|---|
${uitleg}

## 4. Goed (zoals de gouden les Tellen)

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje en het aantal ("Ja, er zijn er 7." / "Het zijn er 7." / …), samen als 1 uiting; de nummers 1 t/m n staan tegelijk bij de dingen (bij 2 aan 2 per paar: boven, onder, zodat onder 2, 4, 6 … staat). Vanzelf door.
- **Eerste vraag in één keer goed:** lofzin, "Laten we ze samen natellen.", Bliepo telt hardop (± 1,15 s per nummer; een tik op de pijl zet alle nummers er meteen bij), "Zie je? Het zijn er 7. Je had het precies goed."
- **Goed na een fout:** alleen een korte bevestiging; de nummers staan erbij.
- **Heel snel:** Bliepo zegt niets (BOUWREGELS 6.10, Tellen).

## 5. Controles van het script

${`Inhoud gelijk aan squla-rekenmix-mix1-1; ${telling} foute antwoorden met een vaste denkfout; verklapcontrole (na eerste zin + hint blijven er altijd minstens 2 keuzes over, het goede er altijd bij); waarheidscontrole (${beweringen} beweringen); geen opdracht bij de 2e fout; nooit 2 keer "dichtbij" of 2 keer dezelfde eerste zin bij 1 vraag; herhaalcontrole (${reacties} reacties, geen woord of getal 2 keer); ${alleZinnen.length} zinnen zonder woord van de niet-lijst, zonder "fout" en zonder kaal cijfer.`}
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekenmix-mix1-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekenmix-mix1-1-gouden.md geschreven");
