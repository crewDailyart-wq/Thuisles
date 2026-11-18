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
import { AANMOEDIG_TIKKEN, HINT_DRIE_DELEN, RICHTINGWOORDEN, TELREACTIE, VRAGEN, ZIN, drieReactie, foutenVan, rijenVan, tweedeEerste, volleRijen, zelfdeKern, type Driekaart, type Fout, type Telvraag, type Vraag } from "../src/components/les/lessen/squla-meer-minder-gouden-zinnen";
import { maakVorm } from "../src/components/les/lessen/nooit-dubbel";

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
  if (f.over.length <= 1) return `na "${kaal(`${f.eerste} ${f.hint}`)}" blijft alleen ${f.over.join("")} over`;
  /* Strenger sinds 18 november 2026 (zoals Tellen): ELKE variant wordt nagelopen, niet alleen de vaste. */
  if (!f.v) return "geen varianten";
  const x = Number(a);
  const vorm = maakVorm();
  const alle: [string, string[]][] = [["eerste zin", f.v.eerste], ["hint", f.v.hint], ["uitleg", f.v.uitleg], ["weer", f.v.weerEerste], ["weer-uitleg", f.v.weerUitleg]];
  for (const [naam, lijst] of alle) {
    if (lijst.length < 2) return `${naam}: maar ${lijst.length} variant`;
    if (new Set(lijst.map(vorm)).size !== lijst.length) return `${naam}: 2 varianten zijn dezelfde zin`;
    for (const z of lijst) {
      if (/\bfout\b/i.test(z)) return `${naam}: het woord "fout" in "${kaal(z)}"`;
      const g = getallenIn(z);
      /* Geen enkele variant noemt het antwoord (het komt pas bij het samen tellen in beeld); 1, 2, 5 en 10 zijn telwoorden ("1 keer", "rijen van 10"). */
      if (g.some((n) => n === goed && n !== x && ![1, 2, 5, 10].includes(n))) return `${naam}: "${kaal(z)}" noemt het antwoord ${goed}`;
      /* Het gekozen getal staat hooguit 1 keer in 1 zin (nooit 2 keer hetzelfde getal achter elkaar). */
      if (v.soort === "tel" && g.filter((n) => n === x).length > 1) return `${naam}: het getal ${x} staat 2 keer in "${kaal(z)}"`;
    }
  }
  /* Zonder richting: geen enkele eerste zin of hint heeft een richtingwoord. */
  if (f.noot) for (const z of [...f.v.eerste, ...f.v.hint]) if (RICHTINGWOORDEN.test(kaal(z))) return `richting niet genoemd, maar "${kaal(z)}" geeft toch een richting`;
  /* De reactie past in het tekstvak (15.30): bij elke eerste zin is er een hint waarmee het samen hooguit 115 tekens is
     (koekjes: 128), en bij elke eerste zin van de 2e keer een uitleg die met de kortste "we tellen samen" hooguit 113 tekens is (zo lang
     waren de langste reacties van de eerste versie; de les kiest alleen varianten die passen). */
  const len = (...z: string[]) => kaal(z.join(" ")).length;
  const hints = v.soort === "tel" ? f.v.hint : HINT_DRIE_DELEN.opRij.flatMap((o) => HINT_DRIE_DELEN.kijk.map((k) => `${o} ${k}`));
  for (const e of f.v.eerste) if (!hints.some((h) => len(e, h) <= (v.soort === "tel" ? 115 : 128))) return `te lang: geen hint past bij "${kaal(e)}" (${Math.min(...hints.map((h) => len(e, h)))} tekens)`;
  const kortSamen = [...ZIN.samen].sort((a, b) => a.length - b.length)[0];
  const past2 = (eersten: string[], uitleg: string[]) => eersten.find((e) => !uitleg.some((u) => len(e, u, kortSamen) <= 113));
  const mis = v.soort === "tel" ? past2([...f.v.eerste, ...ZIN.weerGekozen(x)], f.v.uitleg) ?? past2(f.v.weerEerste, f.v.weerUitleg) : past2([""], f.v.uitleg) ?? past2(f.v.weerEerste, f.v.weerUitleg);
  if (mis !== undefined) return `te lang: bij de 2e keer past geen uitleg achter "${kaal(mis)}"`;
  /* Te weinig mag nooit "te veel" zeggen en omgekeerd. */
  const fouteKant = f.soort === "te-veel" ? /te weinig|nog meer|overgeslagen|niet allemaal/i : f.soort === "te-weinig" || f.soort === "alleen-volle-rijen" ? /te veel|2 keer|minder/i : null;
  if (fouteKant) for (const [naam, lijst] of alle) for (const z of lijst) if (fouteKant.test(kaal(z))) return `${naam}: "${kaal(z)}" wijst de verkeerde kant op`;
  /* Kralen: bij de 2e keer met een ander getal blijft er altijd een eerste zin over zonder een woord dat al gezegd is. */
  if (v.soort === "tel") for (const w of v.keuzes.filter((k) => k !== goed)) for (const e of foutenVan(v)[String(w)].v!.eerste) if (tweedeEerste(x, v, e).some((z) => zelfdeKern(e, z))) return `2e keer na "${kaal(e)}": geen eerste zin zonder hetzelfde woord (dichtbij/bijna/scheelt)`;
  /* Koekjes: geen zin wijst 1 kaart aan (links, rechts, midden, eerste, laatste) en geen zin noemt een aantal. */
  if (v.soort === "drie") for (const [naam, lijst] of alle) for (const z of lijst) if (/\blinks|rechts|midden|eerste kaart|laatste kaart/i.test(z) || getallenIn(z).some((n) => n !== 10)) return `${naam}: "${kaal(z)}" wijst een kaart aan of noemt een aantal`;
  return null;
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
  /* Elke variant noemt het goede aantal precies 1 keer (nooit 2 keer hetzelfde getal achter elkaar). */
  if (v.soort === "tel") for (const z of ZIN.samenKlaar(v.n).map(kaal)) if (getallenIn(z).join() !== String(v.n) || !/kralen/.test(z)) fouten.push(`${v.id}: samenKlaar klopt niet: ${z}`);
  if (v.soort === "tel" && volleRijen(v.n) >= v.n) fouten.push(`${v.id}: het kind heeft niets meer te tellen`);
  if (v.soort === "tel") for (const z of TELREACTIE(v.n).zinnen.map(kaal)) if (getallenIn(z).join() !== String(v.n)) fouten.push(`${v.id}: reactie klopt niet: ${z}`);
  if (v.soort === "drie") {
    const max = goedVan(v);
    for (const z of ZIN.samenMeeste(max).map(kaal)) if (getallenIn(z).join() !== String(max)) fouten.push(`${v.id}: samenMeeste klopt niet: ${z}`);
    for (const z of [...ZIN.samenKaartKlaar(max), ...ZIN.samenKaartZelf(max)].map(kaal)) if (getallenIn(z).some((n) => n !== max) || !/meeste/.test(z)) fouten.push(`${v.id}: samenKaartKlaar klopt niet: ${z}`);
    for (const z of drieReactie(v).zinnen.map(kaal)) if (getallenIn(z).length && !getallenIn(z).includes(max)) fouten.push(`${v.id}: reactie klopt niet: ${z}`);
  }
}
/* Alle vaste varianten: geen "fout", genoeg varianten voor wat terugkomt, geen 2 dezelfde. */
const eersteTel = VRAGEN.find((v): v is Telvraag => v.soort === "tel")!;
const eersteDrie = VRAGEN.find((v): v is Driekaart => v.soort === "drie")!;
const VAST: [string, string[], number][] = [
  ["begin", ZIN.begin, 2], ["de telvraag opnieuw", ZIN.telOpnieuw, 2], ["naar de koekjes", ZIN.naarKoekjes, 2], ["de koekjesvraag opnieuw", ZIN.drieOpnieuw, 2],
  ["koekjes in rijen van 10", ZIN.opRij, 2], ["hint bij de koekjes (2e deel)", HINT_DRIE_DELEN.kijk, 2], ["samen tellen: begin", ZIN.samen, 3],
  ["samen: Bliepo telt de volle rijen", ZIN.samenVol(12), 2], ["samen: Bliepo telt de eerste rij", ZIN.samenVol(9), 2], ["samen: het kind telt de laatste rij", ZIN.samenJij(12), 2], ["samen: het kind tikt de laatste kraal", ZIN.samenJij(16), 2],
  ["hulphandje: aanmoediging", AANMOEDIG_TIKKEN, 3], ["hulphandje: kraal", ZIN.samenHand, 2], ["samen: klaar (kralen)", ZIN.samenKlaar(12), 2],
  ["samen: de meeste", ZIN.samenMeeste(13), 2], ["hulphandje: kaart", ZIN.samenKaartHand, 2], ["samen: klaar (koekjes)", ZIN.samenKaartKlaar(13), 2], ["samen: Bliepo wijst zelf aan", ZIN.samenKaartZelf(13), 2],
  ["hetzelfde getal 2 keer", ZIN.weerGekozen(12), 3], ["slot", ZIN.slot, 2], ["de kaart", ZIN.kaartTik, 2],
  ["reactie na lof (kralen)", TELREACTIE(eersteTel.n).zinnen, 3], ["reactie na lof (koekjes)", drieReactie(eersteDrie).zinnen, 3],
];
{
  const vorm = maakVorm();
  for (const [naam, lijst, min] of VAST) {
    if (lijst.length < min) fouten.push(`${naam}: ${lijst.length} varianten, minstens ${min} nodig`);
    if (new Set(lijst.map(vorm)).size !== lijst.length) fouten.push(`${naam}: 2 varianten zijn dezelfde zin`);
    for (const z of lijst) if (/\bfout\b/i.test(z)) fouten.push(`${naam}: het woord "fout" in "${kaal(z)}"`);
  }
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
    ? `${ZIN.samenVol(v.n)[0]} ${rijenVan(v.n)
        .reduce<number[]>((a, r) => [...a, (a.at(-1) ?? 0) + r], [])
        .filter((e) => e <= volleRijen(v.n))
        .join(", ")} — ${ZIN.samenJij(v.n)[0]} (het kind tikt de kralen, het getal boven de kralen telt mee) — ${kaal(ZIN.samenKlaar(v.n)[v.nr % 3])}`
    : `${v.kaarten.map((n, j) => kaal(ZIN.samenKaart(n, j))).join(" ")} — ${kaal(ZIN.samenMeeste(goedVan(v))[v.nr % 3])} (het kind tikt de kaart) — ${kaal(ZIN.samenKaartKlaar(goedVan(v))[v.nr % 3])}`;
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${v.soort === "tel" ? a : `kaart met ${a}`} (\`${f.code}\`) | ${v.soort === "tel" ? `${kaal(f.eerste) || "(zin uit §10)"} ` : ""}${kaal(f.uitleg)} ${ZIN.samen[v.nr % ZIN.samen.length]} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
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
const lijst = (naam: string, l: string[]) => `| ${naam} | ${l.map(kaal).join(" / ")} |`;
const T = (nr: number, x: number) => foutenVan(VRAGEN[nr - 1])[String(x)].v!;
const varianten = [
  ...VAST.map(([naam, l]) => lijst(naam, l)),
  lijst("kralen, eerste zin: te weinig (12 kralen, koos 11)", T(2, 11).eerste),
  lijst("kralen, eerste zin: te veel (12 kralen, koos 13)", T(2, 13).eerste),
  lijst("kralen, eerste zin zonder richting (9 kralen, koos 10)", T(1, 10).eerste),
  lijst("kralen, eerste zin: alleen de volle rijen (16 kralen, koos 15)", T(3, 15).eerste),
  lijst("kralen, hint: te weinig", T(2, 11).hint),
  lijst("kralen, hint: te veel", T(2, 13).hint),
  lijst("kralen, hint zonder richting", T(1, 10).hint),
  lijst("kralen, hint: alleen de volle rijen", T(3, 15).hint),
  lijst("kralen, uitleg 2e keer: 1 te weinig", T(2, 11).uitleg),
  lijst("kralen, uitleg 2e keer: een paar te weinig", T(5, 8).uitleg),
  lijst("kralen, uitleg 2e keer: 1 te veel", T(2, 13).uitleg),
  lijst("kralen, uitleg 2e keer: een paar te veel", T(1, 11).uitleg),
  lijst("kralen, uitleg 2e keer: alleen de volle rijen", T(3, 15).uitleg),
  lijst("kralen, weer te weinig", [...T(2, 11).weerEerste, ...T(2, 11).weerUitleg]),
  lijst("kralen, weer te veel", [...T(2, 13).weerEerste, ...T(2, 13).weerUitleg]),
  lijst("kralen, weer alleen de volle rijen", [...T(3, 15).weerEerste, ...T(3, 15).weerUitleg]),
  lijst("koekjes, eerste zin: de kaart met de minste", T(9, 11).eerste),
  lijst("koekjes, eerste zin: veel, maar niet de meeste", T(9, 12).eerste),
  lijst("koekjes, hint (de 2 delen wisselen los van elkaar)", T(9, 11).hint),
  lijst("koekjes, uitleg 2e keer: de kaart met de minste", T(9, 11).uitleg),
  lijst("koekjes, uitleg 2e keer: veel, maar niet de meeste", T(9, 12).uitleg),
  lijst("koekjes, weer de kaart met de minste", [...T(9, 11).weerEerste, ...T(9, 11).weerUitleg]),
  lijst("koekjes, weer dezelfde kaart", [...T(9, 12).weerEerste, ...T(9, 12).weerUitleg]),
].join("\n");
const tekstMetVarianten = `${tekst}
## 4. Alle varianten (18 november 2026: Bliepo als warme juf; nooit 2 keer achter elkaar dezelfde zin)

De les kiest uit elk rijtje steeds 1 zin met de gedeelde kiezer (\`nooit-dubbel.ts\`): nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen. In §2 en §3 hierboven staat steeds 1 vaste variant; hier staan ze allemaal (met voorbeeldgetallen). Het script loopt ELKE variant na: geen "fout", geen antwoord in welke zin dan ook, geen richtingwoord waar de richting het antwoord zou verklappen, geen getal 2 keer in 1 zin, en bij de koekjes wijst geen zin 1 kaart aan. Oud naast nieuw: WIJZIGINGEN-ZINNEN-MEER-MINDER.md.

| Situatie | Varianten |
|---|---|
${varianten}
`;
writeFileSync(new URL("../FOUTTABEL-squla-meer-minder-evenveel2-1-gouden.md", import.meta.url), tekstMetVarianten);
console.log("FOUTTABEL-squla-meer-minder-evenveel2-1-gouden.md geschreven.");
