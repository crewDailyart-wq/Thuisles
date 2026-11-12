/**
 * Maakt FOUTTABEL-squla-rekenmix-mix2-1-gouden.md uit de code (squla-rekenmix2-gouden-zinnen.ts) en controleert de fouttabel
 * (12 november 2026). Gemaakt naar scripts/fouttabel-rekenmix3-gouden.ts, met dezelfde controles (LESRECEPT "Geleerd bij …"):
 *   1. inhoud: dezelfde 15 vragen (boterham of spiesje, beleg, vraag, volgorde van de 3 plaatjes) als de oude les squla-rekenmix-mix2-1;
 *   2. elk fout plaatje heeft een rij met een vaste denkfout;
 *   3. waarheidscontrole: wat Bliepo over het gekozen plaatje zegt (meer, minder, evenveel, juist het minste …) klopt;
 *   4. verklapcontrole (15.17): de hint noemt geen richting (voller, leger, meer, minder …); na eerste zin + hint blijven er 2 plaatjes over;
 *   5. de zinnen bij de 2e fout zijn uitleg, geen opdracht;
 *   6. herhaalcontrole: geen woord 2 keer in 1 reactie bij een fout;
 *   7. WOORDEN-GROEP3.md: geen woord van de niet-lijst (ook niet "vergelijk"), geen "fout", geen cijfers in de zinnen.
 *   npx tsx scripts/fouttabel-rekenmix2-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { VRAGEN, ZIN, GOEDREACTIE, AANMOEDIG_TIKKEN, foutenVan, goedPlaatje, doelNiveau, metVoorbeeld, weerGekozen, woordenVan, type Fout, type Vraag2 } from "../src/components/les/lessen/squla-rekenmix2-gouden-zinnen";

const fouten: string[] = [];

/* 1. Inhoud: dezelfde vragen als de oude les (uit de bron gelezen, de oude les wordt niet geladen of veranderd). */
{
  const bron = readFileSync(new URL("../src/components/les/lessen/squla-rekenmix.tsx", import.meta.url), "utf8");
  const blok = bron.slice(bron.indexOf('id: "squla-rekenmix-mix2-1"'), bron.indexOf("const mix2_2"));
  const vragenBlok = blok.slice(blok.indexOf("vragen: ["));
  const oud = [...vragenBlok.matchAll(/\{ t: "hoeveel", ding: "(\w+)", keuzes: \[([\d, ]+)\], wat: "(\w+)"(?:, beleg: "(\w+)")? \}/g)].map((m) => ({ soort: m[1], keuzes: JSON.parse(`[${m[2]}]`) as number[], wat: m[3], beleg: m[4] }));
  if (oud.length !== 15) fouten.push(`inhoud: in de oude les ${oud.length} vragen gevonden, 15 verwacht`);
  if (VRAGEN.length !== oud.length) fouten.push(`inhoud: ${VRAGEN.length} vragen, de oude les heeft er ${oud.length}`);
  VRAGEN.forEach((v, i) => {
    const o = oud[i];
    if (!o) return;
    if (JSON.stringify(o) !== JSON.stringify({ soort: v.soort, keuzes: v.keuzes, wat: v.wat, beleg: v.beleg })) fouten.push(`inhoud vraag ${v.nr}: oud ${JSON.stringify(o)} / nieuw ${JSON.stringify({ soort: v.soort, keuzes: v.keuzes, wat: v.wat, beleg: v.beleg })}`);
    if (!v.keuzes.includes(doelNiveau(v)) || new Set(v.keuzes).size !== 3) fouten.push(`vraag ${v.nr}: het goede plaatje staat er niet in of de 3 plaatjes zijn niet verschillend`);
  });
  console.log(`Inhoud: ${oud.length} vragen van squla-rekenmix-mix2-1 vergeleken (boterham of spiesje, beleg, vraag, volgorde van de plaatjes).`);
}

/* 2-5. Tabel, waarheid, verklappen, opdrachten. */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik|Zeg)\b/;
const RICHTING = /voller|leger|volst|leegst|meeste|minste|\bmeer\b|minder|evenveel|zelfde|precies zo/i;
let beweringen = 0;
let telling = 0;
for (const v of VRAGEN) {
  const F = foutenVan(v);
  v.keuzes.forEach((niv, k) => {
    if (niv !== doelNiveau(v) && !F[String(k)]) fouten.push(`geen rij voor ${v.id} plaatje ${k}`);
  });
  if (F[String(goedPlaatje(v))]) fouten.push(`${v.id}: het goede plaatje heeft een fouttabel-rij`);
  for (const [a, f] of Object.entries(F)) {
    telling++;
    const c = v.keuzes[Number(a)];
    const waar = `${v.id} plaatje ${a}`;
    if (f.code === "onduidelijk") fouten.push(`${waar}: geen vaste denkfout`);
    const alles = [f.eerste, f.hint, f.uitleg, ...f.weer, weerGekozen(v)];
    const klopt = (re: RegExp, ok: boolean, wat: string, bron = alles) => {
      for (const z of bron)
        if (re.test(z)) {
          beweringen++;
          if (!ok) fouten.push(`${waar}: niet waar: ${wat} ("${z}")`);
        }
    };
    if (metVoorbeeld(v)) {
      klopt(/evenveel|net zoveel/, c === 1, "evenveel, maar het gekozen plaatje heeft niet evenveel als bovenaan", [f.eerste]);
      klopt(/\bmeer\b/, c > 1, "meer dan bovenaan, maar het gekozen plaatje heeft niet meer", [f.eerste]);
      klopt(/minder/, c < 1, "minder dan bovenaan, maar het gekozen plaatje heeft niet minder", [f.eerste]);
    } else {
      klopt(/juist .*minste/, v.wat === "meest" && c === 0, "juist het minste, maar het gekozen plaatje heeft dat niet", [f.eerste]);
      klopt(/juist .*meeste/, v.wat === "minst" && c === 2, "juist het meeste, maar het gekozen plaatje heeft dat niet", [f.eerste]);
      klopt(/niet .*(meeste|volst)/, v.wat === "meest" && c === 1, "niet het meeste, maar het gekozen plaatje is het minste", [f.eerste]);
      klopt(/niet .*(minste|leegst)/, v.wat === "minst" && c === 1, "niet het minste, maar het gekozen plaatje is het meeste", [f.eerste]);
    }
    /* Verklap: de hint noemt geen richting. */
    if (RICHTING.test(f.hint)) fouten.push(`${waar}: de hint noemt een richting: "${f.hint}"`);
    /* Na de eerste zin sluit alleen het gekozen plaatje af; er blijven 2 plaatjes over (altijd het goede er bij). */
    const over = v.keuzes.filter((_, k) => k !== Number(a));
    if (over.length !== 2 || !over.includes(doelNiveau(v))) fouten.push(`${waar}: na de eerste zin blijven niet 2 plaatjes over met het goede`);
    for (const z of [f.uitleg, ...f.weer]) if (OPDRACHT.test(z)) fouten.push(`${waar}: opdracht in de zin bij de 2e fout: "${z}"`);
  }
  for (const a of Object.keys(F))
    for (const b of Object.keys(F)) {
      if (a === b) continue;
      const e = F[a];
      const f = F[b];
      const z = e.soort === f.soort ? f.weer[0] : f.eerste;
      if (z === e.eerste) fouten.push(`${v.id} ${a} dan ${b}: 2 keer dezelfde eerste zin`);
    }
}

/* 6. Herhaalcontrole per reactie. */
const KLEIN = new Set("de het een en is in op je ze die dat dit deze er van niet nog dan zo als hij met tot maar naar wat hier daar al bij hoe waar welke welk".split(" "));
const woordenIn = (t: string) => t.toLowerCase().split(/[^a-zà-ÿ0-9']+/).filter(Boolean);
const zinnenVan = (t: string) => t.split(/(?<=[.!?])\s+/).filter(Boolean);
function dubbel(v: Vraag2, delen: string[]): string | null {
  const vraagWoorden = new Set(woordenIn(ZIN.vraag(v).join(" ")));
  const gezien = new Map<string, number>();
  for (const w of delen.flatMap(woordenIn)) gezien.set(w, (gezien.get(w) ?? 0) + 1);
  for (const [w, n] of gezien) {
    if (n < 2) continue;
    if (KLEIN.has(w) || vraagWoorden.has(w)) continue;
    return `"${w}" ${n} keer`;
  }
  const zinnen = delen.flatMap(zinnenVan);
  for (let i = 1; i < zinnen.length; i++) {
    const a = woordenIn(zinnen[i - 1]).at(-1);
    const b = woordenIn(zinnen[i])[0];
    if (a && b && a === b && !KLEIN.has(a)) return `"${a}" 2 keer achter elkaar`;
  }
  return null;
}
let reacties = 0;
for (const v of VRAGEN) {
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const lijst: [string, string[]][] = [
      ["1e fout", [f.eerste, f.hint]],
      ["2e fout", [f.eerste, f.uitleg]],
      ["2e fout (zelfde plaatje)", [weerGekozen(v), f.uitleg]],
      ["2e fout (weer)", f.weer],
    ];
    for (const [wat, delen] of lijst) {
      reacties++;
      const r = dubbel(v, delen);
      if (r) fouten.push(`${v.id} plaatje ${a}: herhaling in 1 reactie (${wat}): ${r} — ${delen.join(" | ")}`);
    }
  }
}

/* 7. Alle zinnen van de les: niet-lijst, "fout", cijfers. */
const alleZinnen: string[] = [ZIN.begin, ...ZIN.samenHelp, ZIN.slot, ZIN.kaartTik, ...AANMOEDIG_TIKKEN];
for (const v of VRAGEN) {
  alleZinnen.push(...ZIN.vraag(v, false), ...ZIN.vraag(v, true), ZIN.samenKijk(v), ZIN.samenPlaatje(v, 0), ZIN.samenPlaatje(v, 1), ZIN.samenPlaatje(v, 2), ZIN.samenTik(v), ZIN.samenHand(v), ZIN.samenKlaar(v), ZIN.samenZelf(v), ...GOEDREACTIE(v).zinnen, weerGekozen(v));
  for (const f of Object.values(foutenVan(v))) alleZinnen.push(f.eerste, f.hint, f.uitleg, ...f.weer);
}
const NIET = /\b(vergelijk\w*|groep(je|jes|en)?|soort|categorie|combineer\w*|selecteer\w*|aanklik\w*|correct|incorrect|eigenschap\w*|kenmerk\w*|identiek|verhouding)\b/i;
let cijfers = 0;
for (const z of alleZinnen) {
  if (NIET.test(z)) fouten.push(`woord van de niet-lijst (WOORDEN-GROEP3.md): "${z}"`);
  if (/\bfout\b/i.test(z)) fouten.push(`het woord "fout": "${z}"`);
  if (/\d/.test(z.replace(/\{\d+:[a-z]+\}/g, ""))) {
    cijfers++;
    fouten.push(`cijfer in een zin (een getal heeft een kleur, 14.20): "${z}"`);
  }
  if (/\b(de|het)\s+(de|het)\b/i.test(z)) fouten.push(`dubbel lidwoord: "${z}"`);
}
/* Elke zin hoort bij een bestaand ding: "boterham" of "spiesje" en "elk spiesje", niet "elke spiesje". */
for (const z of alleZinnen) if (/\belke spiesje\b/i.test(z) || /\belk boterham\b/i.test(z)) fouten.push(`verkeerd lidwoord: "${z}"`);
void woordenVan;

console.log(`Fouttabel: ${VRAGEN.length} vragen, ${telling} foute plaatjes; waarheidscontrole ${beweringen} beweringen; herhaalcontrole ${reacties} reacties; ${alleZinnen.length} zinnen nagelopen op de niet-lijst, "fout" en cijfers (${cijfers} cijfers)`);
if (fouten.length) {
  console.error("FOUTEN:\n" + [...new Set(fouten)].join("\n"));
  process.exit(1);
}
console.log("Alles in orde: alles waar, geen richting in een hint, geen herhaling in 1 reactie, geen woord van de niet-lijst.");

/* De leesbare tabel. */
const SOORT = { meer: "meer", minder: "minder", evenveel: "evenveel", meest: "de meeste", minst: "de minste" } as const;
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]: [string, Fout]) => `| ${v.nr}. ${woordenVan(v).ding} met ${woordenVan(v).wat}, ${SOORT[v.wat]} (plaatjes ${v.keuzes.map((n) => ["weinig", "veel", "heel veel"][n]).join(" / ")}) | plaatje ${Number(a) + 1} (${["weinig", "veel", "heel veel"][v.keuzes[Number(a)]]}) | \`${f.code}\` — ${f.denkfout} | ${f.eerste} | ${f.hint} | ${f.scherm} |`),
).join("\n");
const uitleg = VRAGEN.flatMap((v) => {
  const F = Object.entries(foutenVan(v));
  return F.map(([a, f]) => {
    const ander = F.find(([b]) => b !== a)?.[1];
    const weer = !ander || ander.soort !== f.soort ? "— (1e fout was een andere denkfout: dan de uitleg links)" : f.weer.join(" ");
    return `| ${v.nr}. ${woordenVan(v).ding} met ${woordenVan(v).wat}, ${SOORT[v.wat]} | plaatje ${Number(a) + 1} (\`${f.code}\`) | ${f.eerste} ${f.uitleg} | ${weer} |`;
  });
}).join("\n");

const tekst = `# FOUTTABEL — gouden les Rekenmix 2 (squla-rekenmix-mix2-1-gouden)

Gemaakt op 12 november 2026, **uit de code** met \`npx tsx scripts/fouttabel-rekenmix2-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-rekenmix2-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, boterham of spiesje, beleg, vraag, volgorde van de 3 plaatjes) is die van de oude les squla-rekenmix-mix2-1 (BOUWREGELS 15.22).

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen vergelijken hoeveel er op een boterham of spiesje zit (meer, minder, evenveel, de meeste, de minste; zonder getal), dus ze volgen de **gouden les Meer-minder**: tik op een plaatje (alleen een vinkje) en dan op het vinkje van het lesscherm. **Eigen invulling, niet van Synthesis:** de hints, de uitleg en deze tabel (More or Less heeft geen plaatjes zonder getal).

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):** 1e fout = Bliepo's scherm 1,5 s rood, de eerste zin hieronder, dan de hint en de plaatjes terug. De eerste zin zegt wat er klopt van het gekozen plaatje en sluit alleen dat plaatje uit; de hint noemt geen richting. 2e fout = de eerste zin en de uitleg (geen opdracht), "Kom, we tellen ze samen." (of een andere versie), Bliepo wijst elk plaatje aan en zegt hoeveel erop zit, en het kind tikt het goede plaatje; de les gaat door. Dezelfde denkfout 2 keer: "weer"-zinnen.

## 1. Denkfouten

| Naam in de voortgang | Wat het kind waarschijnlijk deed |
|---|---|
| \`koos-evenveel\` | koos het plaatje met evenveel als bovenaan |
| \`koos-meer\` | koos het plaatje met meer dan bovenaan |
| \`koos-minder\` | koos het plaatje met minder dan bovenaan |
| \`koos-het-tegenovergestelde\` | koos juist het minste (bij de meeste) of het meeste (bij de minste) |
| \`koos-het-middelste\` | koos het plaatje dat niet het meeste of minste heeft |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen (komt niet voor) |

## 2. Per vraag: elk fout plaatje (${telling} rijen)

| Vraag | Fout plaatje | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

| Vraag | 2e fout (denkfout) | Eerste zin + uitleg bij de 2e fout | Als de 1e fout (het andere foute plaatje) dezelfde denkfout was |
|---|---|---|---|
${uitleg}

## 4. Controles van het script

Inhoud gelijk aan squla-rekenmix-mix2-1; ${telling} foute plaatjes met een vaste denkfout; waarheidscontrole (${beweringen} beweringen); de hint noemt nooit een richting en na de eerste zin blijven 2 plaatjes over; geen opdracht in de uitleg; herhaalcontrole (${reacties} reacties); geen woord van de niet-lijst, geen "fout", geen cijfers.
`;
writeFileSync(new URL("../FOUTTABEL-squla-rekenmix-mix2-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-rekenmix-mix2-1-gouden.md geschreven");
