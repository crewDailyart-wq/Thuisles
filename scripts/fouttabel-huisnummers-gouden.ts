/**
 * Maakt FOUTTABEL-squla-huisnummers-gouden.md uit de code (squla-huisnummers-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN- en VERKLAPCONTROLE (BOUWREGELS 11.9, 14.30, 15.17; LESRECEPT "geleerd bij Tellen").
 *   npx tsx scripts/fouttabel-huisnummers-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel keuzes er na de eerste zin + de hint
 * logisch nog over zijn (`over`). Blijft er maar 1 over, dan verklapt de zin het antwoord en stopt het script. Bij typen
 * zijn er altijd veel antwoorden over; daar kijkt het script alleen of het goede getal niet in de eerste zin of hint staat.
 * Geen zin mag het woord "fout" hebben, en geen eerste zin of hint mag 2 buren tegelijk noemen ("tussen 15 en 17").
 */
import { writeFileSync } from "node:fs";
import { VRAGEN, ZIN, buur, foutenVan, gat, hintVan, huisFout as huisFoutVoor, huisReactie, isTyp, nummers, vooruit, type Fout, type Vraag } from "../src/components/les/lessen/squla-huisnummers-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
const keuzesVan = (v: Vraag) => v.opties ?? v.losse ?? [];

const fouten: string[] = [];

/* 1. Inhoud en rekenen (11.9, 14.30): 17 vragen zoals squla-huisnummers; precies 1 goed antwoord. */
const OUD: [string, string, number, string][] = [
  ["na", "6,7,?", 8, "9,8,6"], ["voor", "?,12,13", 11, "13,11,10"], ["tussen", "14,15,?,17,18", 16, "16,19,13"], ["na", "17,18,19,?", 20, ""], ["sleep", "8,9,_,11,12", 10, "7,10,13"],
  ["na", "24,25,?", 26, "24,27,26"], ["terug", "?,27,28,29", 26, "30,26,25"], ["voor", "?,21,22", 20, "22,19,20"], ["tussen", "26,27,?,29,30", 28, "28,26,38"], ["sleep", "21,22,23,_,25", 24, "42,24,26"], ["voor", "?,30,31", 29, ""],
  ["na", "38,39,?", 40, "30,41,40"], ["terug", "?,41,42,43", 40, "44,39,40"], ["tussen", "45,46,?,48,49", 47, "44,47,50"], ["sleep", "32,33,_,35,36", 34, "37,43,34"], ["na", "47,48,49,?", 50, ""], ["terug", "?,35,36,37", 34, "34,38,33"],
];
if (VRAGEN.length !== 17) fouten.push(`${VRAGEN.length} vragen in plaats van 17 (squla-huisnummers)`);
VRAGEN.forEach((v, i) => {
  const [soort, huizen, goed, keuzes] = OUD[i];
  if (v.soort !== soort || v.huizen.map((h) => (h === null ? "_" : h)).join(",") !== huizen || v.goed !== goed || keuzesVan(v).join(",") !== keuzes) fouten.push(`${v.id}: wijkt af van de oude les`);
  const k = keuzesVan(v);
  if (k.length && k.filter((x) => x === v.goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goed antwoord`);
  if (new Set(k).size !== k.length) fouten.push(`${v.id}: 2 keuzes zijn gelijk`);
  /* De rij klopt: steeds 1 erbij, met het goede antwoord op het gat. */
  const rij = v.huizen.map((h, j) => (j === gat(v) ? v.goed : h));
  if (rij.some((h, j) => j > 0 && (h as number) !== (rij[j - 1] as number) + 1)) fouten.push(`${v.id}: de straat telt niet steeds 1 verder`);
  if (nummers(v).includes(v.goed)) fouten.push(`${v.id}: het goede nummer staat al in de straat`);
  if (!vooruit(v) && v.goed !== buur(v) - 1) fouten.push(`${v.id}: buur klopt niet`);
});

/* 2. Fouttabel compleet en verklapcontrole. */
const verklap = (v: Vraag, a: string, f: Fout): string | null => {
  if (f.code !== "onduidelijk" && !f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  if (getallenIn(`${f.eerste} ${f.hint}`).includes(v.goed)) return `de eerste zin of hint noemt het antwoord ${v.goed}`;
  if (/tussen \d+ en \d+/.test(kaal(`${f.eerste} ${f.hint}`))) return "de eerste zin of hint noemt 2 buren (dan is het antwoord verklapt)";
  if (isTyp(v)) return null;
  if (!f.over.includes(v.goed)) return "het goede antwoord valt weg na de eerste zin (de zin klopt niet)";
  return f.over.length <= 1 ? `na "${kaal(`${f.eerste} ${f.hint}`)}" blijft alleen ${f.over.join("")} over` : null;
};
let telling = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const k = keuzesVan(v);
  if (k.length && Object.keys(tabel).length !== k.length - 1) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${k.length - 1} nodig`);
  if (!k.length && Object.keys(tabel).length < 5) fouten.push(`${v.id}: te weinig rijen voor een typvraag`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
  }
  /* De samen-zinnen kloppen (11.9). */
  if (!kaal(ZIN.samenGat(v)).startsWith(`En dan ${v.goed}.`)) fouten.push(`${v.id}: samenGat klopt niet`);
  const mag = [v.goed, v.goed - 1, v.goed + 1, 1];
  if (!huisReactie(v).zinnen.every((z) => getallenIn(z).every((n) => mag.includes(n)))) fouten.push(`${v.id}: een reactie bij goed noemt een getal dat er niet bij hoort`);
}
/*
  3. Waarheidscontrole (keuring 10 nov): bij typen kan het kind elk nummer typen. Voor elk nummer van 0 tot 99 moet wat
  Bliepo zegt WAAR zijn bij deze straat (eerder: "De nummers hier beginnen met een 2" bij 30, 31; "het vraagteken staat
  midden in de straat" terwijl het aan het eind stond).
*/
let waarheid = 0;
for (const v of VRAGEN) {
  const g = gat(v);
  const midden = g > 0 && g < v.huizen.length - 1;
  const bekend = nummers(v);
  const xs = isTyp(v) ? Array.from({ length: 100 }, (_, i) => i) : keuzesVan(v);
  for (const x of xs) {
    if (x === v.goed) continue;
    const f = foutenVan(v)[String(x)] ?? huisFoutVoor(x, v);
    const tekst = kaal([f.eerste, f.uitleg, ...f.weer].join(" "));
    const mis = (r: string) => fouten.push(`${v.id} ${x}: niet waar: ${r} ("${tekst}")`);
    waarheid++;
    if (!midden && /midden in de straat|aan het (begin|eind) van de straat/.test(tekst)) mis("het gat staat niet midden in de straat");
    for (const m of tekst.matchAll(/(?:beginnen met een|steeds een) (\d)\b/g)) {
      const t = Number(m[1]);
      const ernaast = /huizen ernaast/.test(tekst) ? [v.huizen[g - 1], v.huizen[g + 1]].filter((h): h is number => typeof h === "number") : bekend;
      if (!ernaast.every((n) => Math.floor(n / 10) === t)) mis(`niet alle nummers beginnen met een ${t}`);
    }
    for (const m of tekst.matchAll(/(Na|Voor) (\d+) komt een (groter|kleiner) nummer dan (\d+)/g)) {
      const goedBuur = (m[1] === "Na" ? v.goed - 1 : v.goed + 1) === Number(m[2]);
      const goedKant = m[3] === "groter" ? v.goed > Number(m[4]) : v.goed < Number(m[4]);
      if (!goedBuur || !goedKant) mis(m[0]);
    }
    for (const m of tekst.matchAll(/(\d+) komt (voor|na) (\d+)/g)) if (m[2] === "voor" ? +m[1] >= +m[3] : +m[1] <= +m[3]) mis(m[0]);
    if (/begint met een (\d)\./.test(tekst) && /zoeken, begint met een (\d)/.test(tekst) && Number(tekst.match(/zoeken, begint met een (\d)/)![1]) !== Math.floor(v.goed / 10)) mis("tiental van het antwoord");
  }
}

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden in de tabel, ${waarheid} nummers op waarheid gecontroleerd).`);

/* 3. De tabel. */
const straat = (v: Vraag) => v.huizen.map((h) => (h === null ? "_" : h)).join(" ");
const soortNaam = { na: "erna", voor: "ervoor", tussen: "ertussen", sleep: "slepen", terug: "terugtellen" } as const;
const vraagNaam = (v: Vraag) => `${v.nr}. ${soortNaam[v.soort]}: ${straat(v)} → ${v.goed} (${v.opties ? `keuzes ${v.opties.join(" / ")}` : v.losse ? `huizen ${v.losse.join(" / ")}` : "typen"})`;
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} | ${f.eigen ? "**eigen invulling, niet van Synthesis**" : "Synthesis"} — ${f.bron} |`,
  ),
).join("\n");
const samenZin = (v: Vraag) => {
  const g = gat(v);
  const idx = v.huizen.map((_, i) => i).filter((i) => (vooruit(v) ? i < g : i > g));
  const reeks = (vooruit(v) ? idx : idx.reverse()).map((i) => v.huizen[i]).join(", ");
  return `${ZIN.samen} ${ZIN.samenBegin(v)} ${reeks} — ${kaal(ZIN.samenGat(v))} — ${kaal(ZIN.samenStap(v))} — ${kaal(ZIN.samenKlaar(v))}`;
};
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${a} (\`${f.code}\`) | ${kaal(f.eerste) || "(zin uit §10)"} ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
).join("\n");
const hints = VRAGEN.map((v) => `| ${v.nr} | ${soortNaam[v.soort]} | ${kaal(hintVan(v))} | ${v.huizen[v.huizen.indexOf(buur(v))]} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Huisnummers (squla-huisnummers-gouden, "Huisnummers: wat komt erna?")

Gemaakt op 10 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-huisnummers-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-huisnummers-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (17 vragen, getallen, keuzes) is die van squla-huisnummers en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** het draaiboek Huisnummers (Counting On), §3 A.2 en C.2 (een andere zin per soort fout: vlak ernaast, 10 ernaast, te ver, verkeerde rij), §3 C.5 en D.3 (de 2e fout: Bliepo telt zelf, 1 stap per keer) en §7 (denkfouten). Synthesis noemt bij verder tellen alleen wat zeker is ("je ging een beetje te ver"); Bliepo ook (BOUWREGELS 15.9).

**Eigen invulling, niet van Synthesis (15.22 punt 5):** Counting On heeft alleen "erna" (verder tellen) en over het tiental. **Ervoor, ertussen, slepen en terugtellen** zitten er niet in (draaiboek §8 en §11). Die vragen hebben hetzelfde skelet (vraag met het beeld, 1e fout zin + hint + vraag in andere woorden, 2e fout samen tellen), maar hun eerste zinnen en hints zijn eigen invulling; de laatste kolom zegt het per rij.

Huisnummers staan wit op een donker bordje; in de les zijn de getallen in Bliepo's zinnen dus wit (2.2). Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje). De knoppen gaan weg (bij typen wordt het vak leeg; bij slepen glijdt het huis terug). Bliepo zegt de eerste zin en de hint; een rood rondje staat om het buurhuis dat hij noemt (nooit om het antwoord). Daarna gaat de les vanzelf door (15.27): de vraag in andere woorden en het kind mag opnieuw.
- **Verklappen (15.17):** de eerste zin zegt alleen iets over het gekozen nummer; er blijven altijd 2 keuzes over. Bliepo noemt nooit 2 buren tegelijk ("tussen 15 en 17" zou 16 verklappen). Zou de eerste zin toch maar 1 keuze overlaten, dan zegt hij alleen "Huis 37 past niet op deze plek." Het script rekent dat per fout antwoord na.
- **2e fout:** een korte uitleg bij de denkfout, "Kom, we tellen samen." en dan telt Bliepo langs de huizen (elk huis krijgt even het rondje, hij zegt het nummer). Bij het gat komt het nummer op het bordje. Dan de kleine stap: het kind tikt het huis met het nieuwe nummer aan, of sleept het goede huis naar de lege plek (het hulphandje komt vanzelf na ± 6 s). Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (alleen als hij de 1e keer al zei wat er mis was).
- **Hetzelfde foute getal 2 keer:** de eerste zin wordt "Je koos weer …" ("Je typte weer …", "Je sleepte weer huis …").
- **Niet duidelijk (\`onduidelijk\`):** bij typen, voor elk getal dat niet in de tabel staat: een zin uit BLIEPO-KARAKTER.md §10 en de hint. Geen reden verzonnen.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`staat-al\` | koos een nummer dat al in de straat staat | eigen invulling (wat zeker is) |
| \`een-te-veel\` | telde 2 verder of 2 terug (sloeg een huis over) | draaiboek §7 \`een-te-veel\` ("je ging een beetje te ver") |
| \`verkeerde-richting\` | telde verder in plaats van terug | eigen invulling (terugtellen zit niet in Counting On) |
| \`buiten-de-rij\` | koos een nummer van vóór of na de straat | eigen invulling (ertussen en slepen zitten niet in Counting On) |
| \`cijfers-omgedraaid\` | de cijfers andersom (42 voor 24) | draaiboek §7 (gezien bij zoeken; Synthesis zei er niets over) |
| \`tien-ernaast\` | zit er 10 naast (38 voor 28) | draaiboek §7 ("je zit er 10 onder") |
| \`verkeerde-rij\` | na 39 terug naar 30, of het verkeerde tiental (39 voor 29) | draaiboek §7 \`verkeerde-rij\` en tiental-hulp |
| \`alleen-tientalcijfer\` | typte alleen het eerste cijfer (2 voor 20) | draaiboek §7 (gezien bij zoeken) |
| \`onduidelijk\` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

## 2. De hint per vraag (het buurhuis krijgt een rood rondje)

| Vraag | Soort | Hint (de versie wisselt per vraag) | Rondje om huis |
|---|---|---|---|
${hints}

## 3. De fouttabel: per vraag elk fout antwoord (${telling} rijen; bij typen de meest voorkomende)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm | Bron |
|---|---|---|---|---|---|---|
${rijen}

## 4. De 2e fout: uitleg, anders uitleggen en samen tellen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen tellen (Bliepo telt, het kind doet de laatste stap) |
|---|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-huisnummers-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-huisnummers-gouden.md geschreven.");
