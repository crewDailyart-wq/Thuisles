/**
 * Maakt FOUTTABEL-squla-splits-splitsen1-1-gouden.md uit de code (squla-splitsen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de VERKLAPCONTROLE (BOUWREGELS 15.17; LESRECEPT "geleerd bij Tellen").
 *   npx tsx scripts/fouttabel-splitsen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan. Stopt met een foutmelding als een zin het
 * antwoord verklapt.
 */
import { writeFileSync } from "node:fs";
import { KB, OMDRAAIWOORDEN, TOTAAL_KEUZES, VRAGEN, dichtbijAnders, huisFout, parenFout, tienFout, totaalFout, type Fout, type ParenVraag } from "../src/components/les/lessen/squla-splitsen-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const fouten: string[] = [];

/* ---------- verklapcontrole ---------- */
/**
 * Wat het kind zelf moet vinden ("het antwoord"):
 *   - huisje (vraag 1–9): het andere deel (het "?" onder het oranje vak of de zak). Het eerste deel staat in de opdracht en
 *     onder het paarse vak, dat mag Bliepo noemen;
 *   - 3 huisjes (vraag 10): het getal in elk leeg vakje;
 *   - doos met doek (vraag 11–15): het aantal onder de doek;
 *   - "hoeveel samen?" (uitleg): 5.
 * Eerste zin, hint en de "weer"-zin mogen dat getal niet noemen (ook niet als "1 te veel / 1 te weinig" bij de doos) en
 * bij "omgedraaid" niet zeggen dat de delen omgedraaid zijn (dan weet het kind meteen het andere deel).
 */
function controleer(waar: string, f: Fout, verboden: string[], extra: RegExp | null) {
  for (const [naam, tekst] of [["eerste zin", f.eerste], ["hint", f.hint], ["weer", f.weer.join(" ")]] as const) {
    for (const v of verboden) if (tekst.includes(v)) fouten.push(`${waar}: ${naam} noemt het antwoord (${kaal(v)}): "${kaal(tekst)}"`);
    if (extra && extra.test(tekst)) fouten.push(`${waar}: ${naam} verklapt het antwoord: "${kaal(tekst)}"`);
  }
  if (!f.eerste && f.code !== "onduidelijk") fouten.push(`${waar}: geen eerste zin`);
  if (!f.hint) fouten.push(`${waar}: geen hint`);
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg}`)) fouten.push(`${waar}: het woord "fout"`);
}

type Rij = { vraag: string; antwoord: string; f: Fout };
const rijen: Rij[] = [];

/** De meest voorkomende foute verdelingen bij de 3 huisjes (alles 9 ballen). */
function parenFoutePogingen(v: ParenVraag): number[][] {
  const r = v.paren.map(([t, d]) => t - d);
  const n = r.reduce((a, b) => a + b, 0);
  const lijst = [
    [3, 3, 3],
    [r[1], r[0], r[2]],
    [r[0], r[2], r[1]],
    [r[0] + 1, r[1] - 1, r[2]],
    [r[0], r[1] + 1, r[2] - 1],
    [n, 0, 0],
    [0, 0, n],
  ];
  return lijst.filter((t) => t.every((x) => x >= 0) && t.reduce((a, b) => a + b, 0) === n && !t.every((x, i) => x === r[i]));
}

for (const v of VRAGEN) {
  if (v.soort === "huis") {
    const rest = v.tot - v.deel;
    for (let p = 0; p <= v.tot; p++) {
      if (p === v.deel) continue;
      const f = huisFout(v, p);
      controleer(`${v.id} ${p}+${v.tot - p}`, f, [`{${rest}:${KB}}`], f.code === "omgedraaid" ? OMDRAAIWOORDEN : null);
      if (f.code === "omgedraaid" && !f.noot) fouten.push(`${v.id}: omgedraaid zonder noot`);
      rijen.push({ vraag: `${v.nr}. ${v.tot} ${v.vw === "pion" ? "pionnen" : "ballen"}${v.zak ? " (zak)" : ""}: ${v.deel} paars + ? (goed: ${rest})`, antwoord: `${p} paars, ${v.tot - p} ${v.zak ? "zak" : "oranje"}`, f });
    }
  } else if (v.soort === "tienvak") {
    const r = 10 - v.zicht;
    for (let n = 1; n <= 10; n++) {
      if (n === r) continue;
      const f = tienFout(v, n);
      controleer(`${v.id} ${n}`, f, [`{${r}:${KB}}`, `{${r}:wit}`], /\b1 te (veel|weinig)\b|er \{?1(:[a-z]+\})? te/i);
      rijen.push({ vraag: `${v.nr}. doos: ${v.zicht} te zien, ? onder de doek (goed: ${r})`, antwoord: `${n} in het vak`, f });
    }
  } else {
    const r = v.paren.map(([t, d]) => t - d);
    for (const tel of parenFoutePogingen(v)) {
      const f = parenFout(v, tel);
      const i = tel.findIndex((c, j) => c !== r[j]);
      controleer(`${v.id} ${tel.join("-")}`, f, [`{${r[i]}:${KB}}`], null);
      rijen.push({ vraag: `${v.nr}. 3 huisjes ${v.paren.map(([t, d]) => `${t}=${d}+?`).join(", ")} (goed: ${r.join(", ")})`, antwoord: tel.join(", "), f });
    }
  }
}
for (const x of TOTAAL_KEUZES.filter((k) => k !== 5)) {
  const f = totaalFout(x);
  controleer(`uitleg-totaal ${x}`, f, ["{5:", " 5 ", " 5."], null);
  rijen.push({ vraag: "Uitleg (na Nee): hoeveel pionnen zijn er samen? (1 / 4 / 5; goed: 5)", antwoord: String(x), f });
}

/*
 * Waarheidscontrole (keuring Huisnummers, 10 nov 2026) en geen opdracht bij de 2e fout (keuring Getallenlijn): voor elk
 * mogelijk fout antwoord (huisje: elke verdeling, doos: 1 t/m 10 ballen) moet elke bewering kloppen, en de zinnen bij de 2e
 * fout (uitleg en "weer") zijn uitleg: meteen daarna doet Bliepo het samen voor.
 */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Leg|Sleep|Schuif|Pak|Zoek|Tik)\b/;
let beweringen = 0;
const dichtVersies = new Set<string>();
for (const r of rijen) {
  const f = r.f;
  for (const z of [f.uitleg, ...f.weer]) if (OPDRACHT.test(kaal(z))) fouten.push(`${r.vraag} ${r.antwoord}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
}
for (const v of VRAGEN) {
  if (v.soort === "tienvak") {
    const goed = 10 - v.zicht;
    for (let n = 1; n <= 10; n++) {
      if (n === goed) continue;
      const f = tienFout(v, n);
      const alles = kaal([f.eerste, f.hint, f.uitleg, ...f.weer].join(" "));
      const klopt = (re: RegExp, ok: boolean, wat: string) => {
        if (!re.test(alles)) return;
        beweringen++;
        if (!ok) fouten.push(`${v.id} ${n}: niet waar: ${wat} ("${alles}")`);
      };
      klopt(/dichtbij|scheelt niet veel/, Math.abs(n - goed) === 1, "dichtbij");
      klopt(/te veel/, n > goed, "te veel");
      klopt(/te weinig/, n < goed, "te weinig");
      klopt(/hele doos/, n === 10, "hele doos");
      klopt(/zoveel ballen zie je al/i, n === v.zicht, "zoveel zie je al");
      klopt(new RegExp(`Je legde er ${n}\\b`), true, "");
      if (f.noot) {
        dichtVersies.add(kaal(f.eerste).replace(/\d+/g, "#"));
        if (dichtbijAnders(n, v) === f.eerste) fouten.push(`${v.id} ${n}: dichtbijAnders is dezelfde zin`);
      }
    }
  } else if (v.soort === "huis") {
    for (let p = 0; p <= v.tot; p++) {
      if (p === v.deel) continue;
      const f = huisFout(v, p);
      const e = kaal(f.eerste);
      const m = /In het paarse vak (?:ligt|liggen) (\d+)/.exec(e);
      if (m) {
        beweringen++;
        if (Number(m[1]) !== p) fouten.push(`${v.id} ${p}: niet waar: "${e}"`);
      }
      if (/te veel/.test(e)) { beweringen++; if (!(p > v.deel)) fouten.push(`${v.id} ${p}: niet waar (te veel): "${e}"`); }
      if (/te weinig/.test(e)) { beweringen++; if (!(p < v.deel)) fouten.push(`${v.id} ${p}: niet waar (te weinig): "${e}"`); }
    }
  }
}
if (dichtVersies.size < 3) fouten.push(`eerste zin "dichtbij" bij de doos heeft maar ${dichtVersies.size} versie(s)`);
console.log(`Waarheidscontrole: ${beweringen} beweringen nagelopen; ${dichtVersies.size} versies van "dichtbij"; geen opdracht in de zinnen bij de 2e fout.`);

if (fouten.length) {
  console.error("VERKLAPPERS / FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Verklapcontrole: ${rijen.length} foute antwoorden nagelopen; geen zin noemt het antwoord, geen "omgedraaid" bij omgedraaid, geen "1 te veel/weinig" bij de doos.`);

/* ---------- de tabel ---------- */
const cel = (z: string) => kaal(z).replace(/\|/g, "/");
const tabel = rijen.map((r) => `| ${r.vraag} | ${r.antwoord} | \`${r.f.code}\` — ${r.f.denkfout}${r.f.noot ? ` *(${r.f.noot})*` : ""}${r.f.eigen ? " *(eigen invulling, niet van Synthesis)*" : ""} | ${cel(r.f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${cel(r.f.hint)} | ${cel(r.f.scherm)} |`).join("\n");
const uitleg = rijen.map((r) => `| ${r.vraag.split(":")[0]} | ${r.antwoord} (\`${r.f.code}\`) | ${cel(r.f.eerste)} ${cel(r.f.uitleg)} | ${r.f.weer.length ? cel(r.f.weer.join(" ")) : "— (1e keer niet gezegd wat er mis was: dan de gewone uitleg, geen \"weer\")"} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Splitsen (squla-splits-splitsen1-1-gouden, "Splitsen tot 10")

Gemaakt op 9 november 2026, bijgewerkt op 10 november 2026 (omgezet naar de nieuwste gouden stijl, KEUZES-VOOR-SARA.md Ronde 29), **uit de code** met \`npx tsx scripts/fouttabel-splitsen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-splitsen-gouden-zinnen.ts\` en draai het script opnieuw (het doet ook de verklapcontrole en stopt bij een verklapper). De inhoud (15 vragen, getallen, voorwerpen) is die van squla-splits-splitsen1-1 en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** draaiboek Splitsen (Part Part Whole), §3 en §7: Bliepo zegt wat er nu ligt (de getallen van het kind), en bij de huisjes met een leeg vakje rekent hij voor ("4 en 3 is samen 7. We zoeken 6.", \`som-klopt-niet\`). **Eigen invulling, niet van Synthesis:** de doos van 10 met de doek (vraag 11–15; Part Part Whole heeft geen doos met een doek) en de hints die naar het getal onder het paarse vak wijzen (Synthesis heeft geen opdracht met 1 deel gegeven, alleen het handje). Gemarkeerd in de tabel.

In de les staan de getallen in de kleur van het vak: paars = het eerste deel, oranje = het andere deel; het totaal is wit (de pionnen hebben allemaal een andere kleur). Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **Nakijken:** bij de huisjes vanzelf zodra alles in een vak ligt en het kind 0,4 s niets sleept (in de proef na een fout 1,6 s), zodat het kind nog kan schuiven (14.26, 14.30). Bij de doos met het vinkje (zie KEUZES-VOOR-SARA.md, Ronde 21).
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de dingen schudden even en blijven liggen. Bliepo zegt de eerste zin en de hint (1 uiting); de pijl staat erbij als snelkoppeling en ± 0,7 s na de zin gaat het vanzelf verder (BOUWREGELS 15.27, sinds 10 november 2026; het draaiboek wacht hier op de pijl, 15.27 gaat voor). Noemt de hint het getal onder het paarse vak, dan krijgt dat getal een rondje; bij de 3 huisjes het huisje, bij de doos de doos. Na de pijl gaan de vakken leeg en zegt Bliepo de opdracht kort opnieuw (§3 F.2). **In de proef** (na Ja) blijven de dingen liggen (§3 A.2).
- **2e fout:** de uitleg bij de denkfout (laatste tabel), dan "Kom, we doen het samen." Bliepo legt het ene deel zelf in het paarse vak (bij de doos: de doek gaat open en Bliepo legt de ballen op 1 na; bij de huisjes alles op 1 bal na) en het kind sleept de rest (de kleine stap; het handje van Synthesis, §3 F.6). Daarna het andere deel onder het vak, "Samen splitsten we …", en de les gaat vanzelf door. Sleept het kind 20 s niets, dan legt Bliepo de rest zelf ("Kijk, ik leg de rest erbij. …").
- **2e fout in de proef:** geen samen voordoen: "Dat is nog lastig. We kijken eerst samen hoe splitsen werkt." en dan de uitleg (draaiboek §3 A.4).
- **Verklappen (15.17):** de hint wijst naar het getal onder het paarse vak (dat staat al in de opdracht) of naar de doek, nooit naar het andere deel. Bij \`omgedraaid\` zegt Bliepo niet dat de delen omgedraaid zijn; bij de doos zegt hij bij 1 ernaast alleen "… is dichtbij." (in 3 versies die per vraag wisselen; zoals de gouden les Tellen).
- **Twee keer dezelfde denkfout:** "weer" en een andere uitleg (laatste kolom), alleen als Bliepo de 1e keer al zei wat er mis was. Hetzelfde foute antwoord 2 keer: de eerste zin wordt "Weer liggen er … in het paarse vak." / "Je koos weer …".
- **Niet duidelijk (\`onduidelijk\`):** komt hier niet voor (elke foute verdeling heeft een denkfout); als vangnet een zin uit BLIEPO-KARAKTER.md §10.
- **Bewaard:** elke fout met de naam van de denkfout (tabel \`les_uitkomsten\`, alleen als er een kind gekozen is), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-veel\` / \`te-weinig\` | te veel of te weinig in het paarse vak (of in de doos-opdracht in het vak) | draaiboek §7 (\`som-klopt-niet\`, tellen) |
| \`een-te-veel\` / \`een-te-weinig\` | er precies 1 naast (verkeerd geteld) | draaiboek §7 (gezien) |
| \`omgedraaid\` | het getal van het paarse vak in het andere vak gelegd | draaiboek §7 (gezien, bij vrije splitsingen) |
| \`alles-in-1-vak\` | alles in 1 vak, het andere bleef leeg | draaiboek §7 \`deel-is-totaal-ander-leeg\` |
| \`som-klopt-niet\` | bij een huisje zijn het getal en de ballen samen niet het getal in het dak | draaiboek §7 (gezien, vaak) |
| \`totaal-als-deel\` | alle 10 ballen in het vak gelegd (het totaal) | draaiboek §7 (gezien bij een keuzevraag); eigen invulling bij de doos |
| \`zichtbaar-gelegd\` | net zoveel gelegd als er al te zien zijn | eigen invulling, niet van Synthesis |
| \`deel-voor-totaal\` | bij "hoeveel samen?" een deel gekozen | draaiboek §7 (gezien) |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

Niet gebruikt uit draaiboek §7: \`cijfers-naast-elkaar\` en \`verkeerde-som\` (er is geen somvraag in deze Squla-les), \`woord-verkeerd\` (geen woordvraag), \`al-gevonden\` (alleen in de uitleg "splits 5 op een andere manier": daar telt het niet als fout), \`te-weinig-delen-geteld\` (geen tegel).

## 2. Per vraag: elk fout antwoord (${rijen.length} rijen)

Bij de huisjes ligt alles in een vak (anders wordt er nog niet nagekeken), dus het andere vak heeft steeds de rest. Bij de doos kan het kind 1 tot 10 ballen leggen. Bij de 3 huisjes staan de meest voorkomende foute verdelingen.

| Vraag | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
${tabel}

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd "Kom, we doen het samen." en het samen voordoen (nu pas het antwoord in beeld).

| Vraag | 2e fout (denkfout) | Uitleg bij de 2e fout (eerste zin + uitleg) | Als de 1e fout dezelfde denkfout was |
|---|---|---|---|
${uitleg}

## 4. Goed

- **Goed in één keer:** scherm 1 s groen, de dingen wippen op met een lichtgolf; een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en wat er gesplitst is (§4 Splitsen: "Ja, 7 kun je splitsen in 4 en 3." / "Ja, alle 7 zijn verdeeld." / "7 kun je splitsen in 4 en 3." / "4 en 3 maken samen 7." / "Nagekeken: 4 en 3 maken samen 7."), als 1 uiting. Het andere deel komt onder het vak en het totaal in het dak. Begint de lofzin met "Ja", dan komt een reactie zonder "Ja"; de robotreactie hooguit 1 keer per les. **Daarna vanzelf door** (0,6 s na de zin; draaiboek §0).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); vanzelf door.
- **Heel snel:** Bliepo zegt niets over snel (draaiboek §3 B.7 en F.8). Slepen tijdens Bliepo's zin telt gewoon mee.
- **Lang niets doen:** na ± 6 s stilte bij een opdracht komt vanzelf het hulphandje: van het hoopje naar een leeg vak (nooit naar een vak dat al iets heeft: dat zou zeggen of het genoeg is). De eerste keer per opdracht met een aanmoediging en 1 korte zin ("Pak een pion en sleep hem naar een vak."). Ligt er bij de doos al iets in het vak, dan komt er niets (het kind is bezig). Bij een keuzevraag: niets.
- **Vinkje (doos):** de eerste keer legt het lesscherm het zelf uit ("Klaar? Tik dan op het vinkje."); de les zegt er niets bij.
- **Rust voor het nakijken:** 0,4 s zonder slepen (dan meteen de reactie); in de proef na een fout (de dingen blijven liggen) 1,6 s, zodat het kind er een paar kan schuiven.
- **Proef na een fout, lang stil:** het handje wijst van het vak met te veel naar het andere vak ("Schuif een pion uit het paarse vak naar het oranje vak."), zonder aanmoediging ervoor.
`;

writeFileSync(new URL("../FOUTTABEL-squla-splits-splitsen1-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-splits-splitsen1-1-gouden.md geschreven");
