/**
 * Maakt FOUTTABEL-squla-meer-minder-evenveel2-1-gouden.md uit de code (squla-meer-minder-gouden-zinnen.ts), zodat de
 * tabel altijd klopt met de les, en doet de REKEN- en VERKLAPCONTROLE (BOUWREGELS 11.9, 14.30, 15.17; LESRECEPT "geleerd
 * bij Tellen").
 *   npx tsx scripts/fouttabel-meer-minder-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel keuzes er na de eerste zin + de hint
 * logisch nog over zijn (`over`). Blijft er maar 1 over, dan verklapt de hint het antwoord en stopt het script. Noemt
 * Bliepo geen richting, dan mag de hint ook geen richtingwoord hebben. Geen zin mag het goede antwoord noemen bij de
 * 1e fout, en geen zin mag het woord "fout" hebben.
 */
import { writeFileSync } from "node:fs";
import { RICHTINGWOORDEN, VRAGEN, ZIN, foutenVan, rijenVan, volleRijen, type Fout, type Vraag } from "../src/components/les/lessen/squla-meer-minder-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
const goedVan = (v: Vraag) => (v.soort === "tel" ? v.n : Math.max(...v.kaarten));
const keuzesVan = (v: Vraag) => (v.soort === "tel" ? v.keuzes : v.kaarten);

const fouten: string[] = [];

/* 1. Inhoud en rekenen (11.9, 14.30): 15 vragen zoals squla-meer-minder-evenveel2-1; precies 1 goed antwoord. */
if (VRAGEN.length !== 15) fouten.push(`${VRAGEN.length} vragen in plaats van 15 (squla-meer-minder-evenveel2-1)`);
if (VRAGEN.filter((v) => v.soort === "tel").length !== 8) fouten.push("niet 8 telvragen");
for (const v of VRAGEN) {
  const k = keuzesVan(v);
  const goed = goedVan(v);
  if (k.filter((x) => x === goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goed antwoord`);
  if (new Set(k).size !== k.length) fouten.push(`${v.id}: 2 keuzes zijn gelijk (dan zijn er 2 goede antwoorden)`);
  if (v.soort === "tel" && rijenVan(v.n).reduce((a, r) => a + r, 0) !== v.n) fouten.push(`${v.id}: rijen kloppen niet`);
}

/* 2. Fouttabel compleet en verklapcontrole. */
const verklap = (v: Vraag, a: string, f: Fout): string | null => {
  const goed = goedVan(v);
  if (f.code !== "onduidelijk" && !f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (f.noot && RICHTINGWOORDEN.test(kaal(`${f.eerste} ${f.hint}`))) return `geen richting genoemd, maar de hint geeft er toch een: "${kaal(f.hint)}"`;
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  /* De eerste zin en de hint noemen het antwoord niet (een getal dat ook het gekozen antwoord of een rijgetal is mag). */
  const genoemd = getallenIn(`${f.eerste} ${f.hint}`).filter((x) => x === goed && x !== Number(a) && x !== 5 && x !== 10 && x !== 1);
  if (genoemd.length) return `de eerste zin of hint noemt het antwoord ${goed}`;
  if (!f.over.includes(goed)) return "het goede antwoord valt weg na de hint (de hint klopt niet)";
  return f.over.length <= 1 ? `na "${kaal(`${f.eerste} ${f.hint}`)}" blijft alleen ${f.over.join("")} over` : null;
};
let telling = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  if (Object.keys(tabel).length !== keuzesVan(v).length - 1) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${keuzesVan(v).length - 1} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
  }
}
/* De zinnen bij het samen tellen kloppen (11.9). */
for (const v of VRAGEN) {
  if (v.soort === "tel" && !kaal(ZIN.samenKlaar(v.n)).includes(`${v.n} kralen`)) fouten.push(`${v.id}: samenKlaar klopt niet`);
  if (v.soort === "tel" && volleRijen(v.n) >= v.n) fouten.push(`${v.id}: het kind heeft niets meer te tellen`);
  if (v.soort === "drie" && !kaal(ZIN.samenMeeste(goedVan(v))).startsWith(`${goedVan(v)} `)) fouten.push(`${v.id}: samenMeeste klopt niet`);
}
if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole en verklapcontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden).`);

/* 3. De tabel. */
const vraagNaam = (v: Vraag) => (v.soort === "tel" ? `${v.nr}. kralen tellen: ${v.n} (keuzes ${v.keuzes.join(" / ")})` : `${v.nr}. de meeste koekjes: kaarten ${v.kaarten.join(" / ")}`);
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${v.soort === "tel" ? a : `kaart met ${a}`} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} |`,
  ),
).join("\n");
const samenZin = (v: Vraag) =>
  v.soort === "tel"
    ? `${ZIN.samenVol(v.n)} ${rijenVan(v.n)
        .reduce<number[]>((a, r) => [...a, (a.at(-1) ?? 0) + r], [])
        .filter((e) => e <= volleRijen(v.n))
        .join(", ")} — ${ZIN.samenJij(v.n)} (het kind tikt de kralen, het getal boven de kralen telt mee) — ${kaal(ZIN.samenKlaar(v.n))}`
    : `${v.kaarten.map((n, j) => kaal(ZIN.samenKaart(n, j))).join(" ")} — ${kaal(ZIN.samenMeeste(goedVan(v)))} (het kind tikt de kaart) — ${kaal(ZIN.samenKaartKlaar(goedVan(v)))}`;
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${v.soort === "tel" ? a : `kaart met ${a}`} (\`${f.code}\`) | ${kaal(f.eerste) || "(zin uit §10)"} ${kaal(f.uitleg)} ${ZIN.samen} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
).join("\n");

const tekst = `# FOUTTABEL — gouden les Meer-minder (squla-meer-minder-evenveel2-1-gouden, "De meeste")

Gemaakt op 10 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-meer-minder-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-meer-minder-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, getallen, keuzes) is die van squla-meer-minder-evenveel2-1 en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** het draaiboek Meer-minder (More or Less), §3 A/B (grootste groep), §6 (hulp = het beeld veranderen) en §7 (denkfouten). Synthesis benoemt de denkfout bijna nooit; het beeld doet het werk (op een rij leggen, samen tellen). Bliepo reageert wél op de denkfout (BOUWREGELS 15.9), maar alleen met wat zeker is: de gekozen kaart heeft de minste koekjes, of veel maar niet de meeste; bij tellen: het gekozen getal is te klein, te groot, of precies de volle rijen. Bij de koekjes zijn \`kleinste-groep-gekozen\` en "meer en minder verwisseld" niet uit elkaar te houden (draaiboek §7); Bliepo noemt dus geen reden, alleen wat er op de kaart ligt.

**Kralen tellen is eigen invulling, niet van Synthesis:** More or Less heeft geen telvraag. De hulp bij de 2e fout (samen tellen, het getal boven de groep telt mee, het kind tikt) komt wel uit het draaiboek (§3 A.5 en G).

In de les staan de getallen in de kleur van de kralen (paars) of de koekjes (bruin). Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje). Bij de kralen gaan de knoppen weg, bij de koekjes het vinkje. Bliepo zegt de eerste zin en de hint; bij de koekjes gaan ze in rijen van 10 liggen (zoals Synthesis de blokken op een rij laat zakken). Daarna gaat de les vanzelf door (15.27) en mag het kind opnieuw kiezen.
- **Richting en verklappen (15.17):** zou "meer" of "te veel" maar 1 keuze overlaten, dan noemt Bliepo de richting niet ("Je koos 10. Dat is dichtbij.") en zegt hij alleen hoe je telt. Bij de koekjes blijven er na de hint altijd 2 kaarten over. Het script hierboven rekent dat per fout antwoord na en stopt bij een verklapper.
- **2e fout:** een korte uitleg bij de denkfout, "Kom, we tellen samen." en dan samen tellen (laatste kolom). Bij de kralen telt Bliepo de volle rijen en tikt het kind de kralen van de laatste rij; bij de koekjes telt Bliepo elke kaart en tikt het kind de kaart met het grootste getal. Het getal staat boven de groep (15.20-gedachte: pas nu, nooit zolang de vraag open is). Na ± 6 s stilte komt vanzelf het hulphandje. Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit. Alleen als hij de 1e keer al zei wat er mis was.
- **Hetzelfde foute getal 2 keer:** de eerste zin wordt "Je koos weer …".
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor; als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-weinig-geteld\` | telde er te weinig (sloeg er een over) | eigen invulling (telvraag niet in More or Less) |
| \`te-veel-geteld\` | telde er te veel (telde er een 2 keer) | eigen invulling |
| \`alleen-volle-rijen\` | telde alleen de volle rijen van 5 | eigen invulling (zoals de gouden les Tellen) |
| \`kleinste-groep-gekozen\` | koos de kaart met de minste koekjes | draaiboek §7 (gezien bij Synthesis) |
| \`niet-de-meeste\` | koos een kaart met veel, maar niet de meeste koekjes | draaiboek §7 (\`kleinste-groep-gekozen\` bij 2 groepen; bij 3 kaarten het middelste) |
| \`onduidelijk\` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg, anders uitleggen en samen tellen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen tellen |
|---|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-meer-minder-evenveel2-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-meer-minder-evenveel2-1-gouden.md geschreven.");
