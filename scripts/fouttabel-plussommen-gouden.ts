/**
 * Maakt FOUTTABEL-squla-plus-bakkerij-1-gouden.md uit de code (squla-plussommen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de VERKLAPCONTROLE (BOUWREGELS 15.17; LESRECEPT "geleerd bij Tellen").
 *   npx tsx scripts/fouttabel-plussommen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel keuzes er na de eerste zin + de hint
 * logisch nog over zijn (de "beperking" in de fouttabel: meer dan, minder dan, een plussom, beide getallen). Blijft er
 * maar 1 over, dan verklapt de hint het antwoord en stopt het script. Noemt Bliepo geen richting, dan mag de hint ook
 * geen richtingwoord hebben. En: elke rekensom en elk goed antwoord wordt nagerekend (11.9).
 */
import { writeFileSync } from "node:fs";
import { VRAGEN, foutenVan, overNa, somTekst, sommenOver, type Fout, type Plusvraag } from "../src/components/les/lessen/squla-plussommen-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
/** Woorden die een richting geven; verboden in een hint als Bliepo de richting niet noemt. */
const RICHTING = /sla er geen|\bmeer\b|minder|maar 1 keer|te veel|te weinig|niet meer|precies \{?\d|alle \{?\d/i;

const fouten: string[] = [];

/* 1. Rekenen (11.9): elke vraag heeft precies 1 goed antwoord tussen de keuzes, of rekent alle goede antwoorden goed (14.30). */
for (const v of VRAGEN) {
  if (v.soort === "verhaal") {
    const n = v.keuzes.filter((k) => k === v.a + v.b).length;
    if (n !== 1) fouten.push(`${v.id}: ${n} goede keuzes`);
  } else if (v.soort === "disco") {
    const n = v.kaarten.filter((k) => k === v.a + v.b).length;
    if (n !== 1) fouten.push(`${v.id}: ${n} goede kaartjes`);
  } else if (v.soort === "som") {
    const n = v.opties.filter((o) => o === somTekst(v.a, v.b)).length;
    if (n !== 1) fouten.push(`${v.id}: ${n} goede sommen`);
    /* Elke som op een knop klopt zelf ook (een fout antwoord is een andere som, geen rekenfout). */
    for (const o of v.opties) {
      const m = o.match(/^(\d+) (.) (\d+) = (\d+)$/);
      if (!m) fouten.push(`${v.id}: "${o}" is geen som`);
      else if ((m[2] === "+" ? +m[1] + +m[3] : +m[1] - +m[3]) !== +m[4]) fouten.push(`${v.id}: "${o}" klopt niet`);
    }
  } else {
    const uit = v.sommen.map(([x, y]) => x + y).sort().join(",");
    if (uit !== [...v.antwoorden].sort().join(",")) fouten.push(`${v.id}: antwoorden passen niet 1 op 1 bij de sommen`);
  }
}
if (VRAGEN.length !== 16) fouten.push(`${VRAGEN.length} vragen in plaats van 16 (squla-plus-bakkerij-1)`);

/* 2. Fouttabel compleet en verklapcontrole. */
const verklap = (v: Plusvraag, a: string, f: Fout): string | null => {
  if (f.noot && RICHTING.test(kaal(f.hint))) return `hint geeft toch een richting: "${kaal(f.hint)}"`;
  if (f.code !== "onduidelijk" && !f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  let over: unknown[] = [];
  if (v.soort === "verhaal") over = overNa(v.keuzes, Number(a), f.beperking);
  else if (v.soort === "disco") over = overNa(v.kaarten, Number(a), f.beperking);
  else if (v.soort === "som") over = sommenOver(v, a, f.beperking);
  else {
    const z = Number(a.split("→")[1]);
    over = overNa(v.antwoorden, z, f.beperking);
  }
  return over.length <= 1 ? `na "${kaal(`${f.eerste} ${f.hint}`)}" blijft alleen ${over.join("")} over` : null;
};
let telling = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = v.soort === "verhaal" ? v.keuzes.length - 1 : v.soort === "disco" ? v.kaarten.length - 1 : v.soort === "som" ? v.opties.length - 1 : v.sommen.length * (v.antwoorden.length - 1);
  if (Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
  }
}
if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole en verklapcontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden).`);

/* 3. De tabel. */
const vraagNaam = (v: Plusvraag) =>
  v.soort === "verhaal"
    ? `${v.nr}. verhaal ${v.a} + ${v.b} ${v.wat} (keuzes ${v.keuzes.join(" / ")})`
    : v.soort === "som"
      ? `${v.nr}. welke som? ${v.a} ${v.wat} en ${v.b} erbij (${v.opties.join(" / ")})`
      : v.soort === "disco"
        ? `${v.nr}. disco ${v.a} + ${v.b} (kaartjes ${v.kaarten.join(" / ")})`
        : `${v.nr}. verbinden ${v.sommen.map(([x, y]) => `${x} + ${y}`).join(", ")} ↔ ${v.antwoorden.join(", ")}`;
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} |`,
  ),
).join("\n");
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${a} (\`${f.code}\`) | ${kaal(f.kort ?? f.eerste)} ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} |`),
).join("\n");

const tekst = `# FOUTTABEL — gouden les Plussommen (squla-plus-bakkerij-1-gouden, "Plussommen in de bakkerij")

Gemaakt op 9 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-plussommen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-plussommen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (16 vragen, getallen, keuzes, lekkers) is die van squla-plus-bakkerij-1 en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** het draaiboek Plussommen (Adding below 10), §3 D (totaal), §3 E (welke som) en §7 (denkfouten). Synthesis zegt bij een fout totaal in welke richting het goede antwoord ligt ("iets meer dan 4", "iets minder dan 8") en laat het kind meteen opnieuw kiezen. Bliepo doet dat ook, in eigen woorden ("1 en 4 samen is meer dan 4."), en noemt erbij wat de keuze is (een getal van 1 groepje, het verschil). **Het verbinden (vraag 8 en 14) heeft Synthesis niet: die rijen zijn EIGEN INVULLING, NIET VAN SYNTHESIS** (15.22 punt 5), met dezelfde soort reactie als een totaal.

In de les staan de getallen in de kleur van het lekkers (of van de stippen); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de knoppen weg, de som en het lekkers blijven staan. Bliepo zegt de eerste zin; daarna komen dezelfde keuzes meteen terug met de hint (geen pijl, zoals het draaiboek §3 D.2).
- **Richting en verklappen (15.17):** zou "meer dan" of "minder dan" maar 1 keuze overlaten, dan noemt Bliepo de richting niet (alleen "Je koos 7.") en wijst hij naar de manier van tellen. Het script hierboven rekent dat per fout antwoord na en stopt bij een verklapper.
- **2e fout:** een korte uitleg bij de denkfout (§3, zonder nieuwe richting), "Kom, we tellen samen." (pijl). Dan telt het kind zelf verder: het tikt elk stuk lekkers van het 2e groepje aan (bij de disco en het verbinden: elke blauwe stip in de rij van 10) en Bliepo zegt het getal. Daarna staat de som met het antwoord bovenaan. Pijl, de les gaat door. Na ± 6 s stilte komt vanzelf het hulphandje. Bij "welke som?" wijst Bliepo de 2 groepjes aan ("Erbij is plus.") en tikt het kind de goede som (alleen die staat er nog, zoals de hulproute van het draaiboek §3 C.5).
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (laatste kolom van §3). Alleen als hij de 1e keer al zei wat er mis was.
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …".
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (elk fout antwoord valt onder een denkfout); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`deel-als-antwoord\` | koos het getal van 1 groepje (of 1 getal uit de som) | draaiboek §7 (gezien bij Synthesis) |
| \`min-in-plaats-van-plus\` | trok het kleine getal van het grote af, of koos een minsom | draaiboek §7 (gezien bij Synthesis) |
| \`een-te-veel\` / \`te-veel\` | het totaal 1 of meer te hoog | draaiboek §7 (gezien bij Synthesis: \`een-te-veel\`) |
| \`een-te-weinig\` / \`te-weinig\` | het totaal 1 of meer te laag | draaiboek §7 (gezien bij Synthesis: \`een-te-weinig\`) |
| \`getal-herhalen\` | koos een som met 2 keer hetzelfde getal (keek naar 1 groepje) | draaiboek §7 \`getal-herhalen\` (bij Synthesis bij aanvullen) |
| \`onduidelijk\` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

Let op vraag 11 (3 + 6, keuze 3): 3 is het getal van het 1e groepje én 6 − 3. Bliepo noemt het feit dat zeker is ("Dat zijn alleen de broodjes hier."), denkfout \`deel-als-antwoord\`.

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg en anders uitleggen

Bij de 2e fout zegt Bliepo de eerste zin van dát antwoord met de uitleg (middelste kolom), of, als het dezelfde denkfout is als bij de 1e fout (en hij die toen al benoemde), de "weer"-zinnen (rechts). Daarna altijd samen voordoen (zie boven).

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer |
|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-plus-bakkerij-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-plus-bakkerij-1-gouden.md geschreven.");
