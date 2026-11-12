/**
 * Maakt FOUTTABEL-squla-min-machine-1-gouden.md uit de code (squla-minsommen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN- en VERKLAPCONTROLE (BOUWREGELS 11.9, 14.30, 15.17; LESRECEPT "geleerd bij Tellen").
 *   npx tsx scripts/fouttabel-minsommen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel keuzes er na de eerste zin + de hint
 * logisch nog over zijn (de "beperking": meer dan, minder dan). Blijft er maar 1 over, dan verklapt de hint het
 * antwoord en stopt het script. Noemt Bliepo geen richting, dan mag de hint ook geen richtingwoord hebben. Geen zin mag
 * het goede antwoord noemen bij de 1e fout, en geen zin mag het woord "fout" hebben.
 */
import { writeFileSync } from "node:fs";
import { INTRO, INTRO_VRAGEN, VRAGEN, ZIN, foutenVan, overNa, type Fout, type Minvraag } from "../src/components/les/lessen/squla-minsommen-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
/** Woorden die een richting geven; verboden in een hint als Bliepo de richting niet noemt. */
const RICHTING = /\bmeer\b|minder|te veel|te weinig|niet verder|precies \{?\d/i;
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);

const fouten: string[] = [];

/* 1. Rekenen (11.9, 14.30): elke vraag heeft precies 1 goed antwoord tussen de keuzes; alles binnen 10. */
if (VRAGEN.length !== 15) fouten.push(`${VRAGEN.length} vragen in plaats van 15 (squla-min-machine-1)`);
for (const v of VRAGEN) {
  const u = v.a - v.b;
  const n = v.keuzes.filter((k) => k === u).length;
  if (n !== 1) fouten.push(`${v.id}: ${n} goede keuzes`);
  if (v.a > 10 || u < 0 || v.keuzes.some((k) => k < 0 || k > 10)) fouten.push(`${v.id}: getal buiten 0 t/m 10`);
  if (v.soort === "machine" && v.a !== 10) fouten.push(`${v.id}: de machine begint niet met 10`);
}

/* 2. Fouttabel compleet en verklapcontrole. */
const verklap = (v: Minvraag, a: string, f: Fout): string | null => {
  const u = v.a - v.b;
  if (f.noot && RICHTING.test(kaal(f.hint))) return `hint geeft toch een richting: "${kaal(f.hint)}"`;
  if (f.code !== "onduidelijk" && !f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  /* De hint en de eerste zin noemen het antwoord niet (het getal u mag alleen staan als het ook een getal uit de som is). */
  const genoemd = getallenIn(`${f.eerste} ${f.hint}`).filter((x) => x === u && x !== v.a && x !== v.b && x !== Number(a));
  if (genoemd.length) return `de eerste zin of hint noemt het antwoord ${u}`;
  const over = overNa(v.keuzes, Number(a), f.beperking);
  return over.length <= 1 ? `na "${kaal(`${f.eerste} ${f.hint}`)}" blijft alleen ${over.join("")} over` : null;
};
let telling = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  if (Object.keys(tabel).length !== v.keuzes.length - 1) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${v.keuzes.length - 1} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
  }
}
/* De zin bij het samen voordoen klopt (11.9). */
for (const v of VRAGEN) {
  const z = kaal(ZIN.samenKlaar(v));
  if (!z.includes(`${v.a} − ${v.b} = ${v.a - v.b}`)) fouten.push(`${v.id}: samenKlaar klopt niet: ${z}`);
}
/* 2b. De uitleg aan het begin (ronde 34): 2 keuzevragen. Elke fout keuze een rij; hint en eerste zin verklappen het goede
   antwoord niet; het woord "fout" komt niet voor; binnen 1 reactie komt geen woord (4 letters of meer) of getal 2 keer voor (F-regels). */
const STOP = new Set(["deze", "daar", "dan", "dat", "dit", "een", "het", "met", "naar", "nog", "nu", "van", "voor", "zijn", "zoveel", "kijk", "goed", "hij", "ook", "die", "maar", "wat", "als", "elke", "steeds", "juist", "straks"]);
const dubbel = (zinnen: string[]): string[] => {
  const w = kaal(zinnen.join(" ")).toLowerCase().replace(/[^a-zà-ÿ0-9 ]/g, " ").split(/\s+/).filter((x) => x && !STOP.has(x) && (x.length >= 4 || /^\d+$/.test(x)));
  return w.filter((x, i) => w.indexOf(x) !== i);
};
const reacties = (q: (typeof INTRO_VRAGEN)[number]): [string, string[]][] => [
  [`${q.id} vraag`, q.vraag],
  [`${q.id} opnieuw`, q.opnieuw],
  [`${q.id} samen opdracht`, q.samen.opdracht],
  [`${q.id} samen klaar`, q.samen.klaar],
  ...q.goedReactie.map((z, i): [string, string[]] => [`${q.id} goed ${i + 1}`, [z]]),
  ...Object.entries(q.fouten).flatMap(([a, f]): [string, string[]][] => [
    [`${q.id} ${a} 1e fout`, [f.eerste, f.hint]],
    [`${q.id} ${a} 2e fout`, [...f.tweede, ZIN.samen]],
  ]),
];
if (INTRO_VRAGEN.length !== 2) fouten.push(`${INTRO_VRAGEN.length} vragen in de uitleg in plaats van 2 (draaiboek stap 4 en 7)`);
for (const q of INTRO_VRAGEN) {
  if (!q.keuzes.includes(q.goed)) fouten.push(`${q.id}: het goede antwoord staat niet bij de keuzes`);
  for (const k of q.keuzes.filter((x) => x !== q.goed)) if (!q.fouten[k]) fouten.push(`${q.id}: geen fouttabel voor "${k}"`);
  const stam = q.goed.toLowerCase().replace(/^het wordt /, "").slice(0, 6);
  for (const [a, f] of Object.entries(q.fouten)) {
    if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.tweede.join(" ")}`)) fouten.push(`${q.id} ${a}: het woord "fout"`);
    if (kaal(`${f.eerste} ${f.hint}`).toLowerCase().includes(stam)) fouten.push(`${q.id} ${a}: eerste zin of hint noemt het goede antwoord ("${stam}")`);
    if (!f.hint || !f.eerste || f.tweede.length < 2) fouten.push(`${q.id} ${a}: fouttabel niet compleet`);
  }
  for (const [naam, zinnen] of reacties(q)) {
    const d = dubbel(zinnen);
    if (d.length) fouten.push(`${naam}: ${[...new Set(d)].join(", ")} komt 2 keer voor in 1 reactie`);
  }
}
for (const [naam, z] of [["eerste stip", INTRO.eersteStip], ["meer", INTRO.meer.join(" ")], ["begin", INTRO.begin], ["einde", INTRO.einde]]) {
  const d = dubbel([z]);
  if (d.length) fouten.push(`uitleg ${naam}: ${[...new Set(d)].join(", ")} komt 2 keer voor in 1 reactie`);
}
if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole en verklapcontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden).`);

/* 3. De tabel. */
const soortNaam = { machine: "min-machine", bord: "schoolbord", midden: "som in het midden" } as const;
const vraagNaam = (v: Minvraag) => `${v.nr}. ${soortNaam[v.soort]} ${v.a} − ${v.b} (keuzes ${v.keuzes.join(" / ")})`;
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} |`,
  ),
).join("\n");
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(([a, f]) => `| ${v.nr} | ${a} (\`${f.code}\`) | ${kaal(f.kort ?? f.eerste) || "(zin uit §10)"} ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${kaal(ZIN.samenStippen(v))} ${kaal(ZIN.samenWeg(v))} … ${kaal(ZIN.samenKlaar(v))} |`),
).join("\n");

const introRijen = INTRO_VRAGEN.flatMap((q) =>
  Object.entries(q.fouten).map(([a, f]) => `| ${q.id}: ${q.vraag.join(" ")} (keuzes ${q.keuzes.join(" / ")}) | ${a} | \`${f.code}\` — ${f.denkfout} | ${kaal(f.eerste)} | ${kaal(f.hint)} (rondje om ${f.ring === "teller" ? "de teller" : "de plusknop"}) | ${kaal(f.tweede.join(" "))} ${ZIN.samen} ${kaal(q.samen.opdracht.join(" "))} … ${kaal(q.samen.klaar.join(" "))} |`),
).join("\n");

const tekst = `# FOUTTABEL — gouden les Minsommen (squla-min-machine-1-gouden, "Minsommen: hoeveel over?")

Gemaakt op 10 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-minsommen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-minsommen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, getallen, 3 keuzes per vraag) is die van squla-min-machine-1 en blijft gelijk (BOUWREGELS 15.22).

**Bron van de reacties:** het draaiboek Minsommen (Dot Destruction), §3 E (10 − 4 met de machine), §3 G (de oefenreeks), §6 en §7 (denkfouten). Synthesis noemt bij een som de denkfout niet; het laat de machine het voordoen. Bliepo reageert wél op de denkfout (BOUWREGELS 15.9), maar alleen met wat zeker is: het gekozen getal is het begingetal, het getal dat eraf gaat, of meer of minder dan het goede antwoord. Een reden die we niet zeker weten (bijvoorbeeld "je telde het begingetal mee") zegt Bliepo niet; die staat alleen in de kolom denkfout als mogelijke uitleg.

In de les staan de getallen bij de machine in de kleur van de blokjes; bij een kale som (bord, midden) wit; bij het samen voordoen in de kleur van de stippen. Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de knoppen weg; de machine of de som blijft staan. Bliepo zegt de eerste zin en de hint (de hint zegt HOE je het uitrekent: terugtellen vanaf het begingetal); het rode rondje staat om het getal dat eraf gaat zolang hij praat. Daarna gaat de les vanzelf door (15.27) en komen dezelfde 3 keuzes terug.
- **Richting en verklappen (15.17):** zou "meer dan" of "minder dan" maar 1 keuze overlaten, dan noemt Bliepo de richting niet (alleen "Je koos 7.") en zegt hij alleen hoe je terugtelt. Het script hierboven rekent dat per fout antwoord na en stopt bij een verklapper.
- **2e fout:** een korte uitleg bij de denkfout (nu mag de richting, want het antwoord komt daarna toch in beeld), "Kom, we doen het samen." Dan het samen voordoen zoals het draaiboek bij 10 − 4 (§3 E): de stippen in beeld, de som bovenaan en de TELLER (15.20: pas nu); het kind tikt zelf zoveel stippen weg als er in de som staat (meer kan niet), Bliepo telt hardop mee (§3 F). Daarna "Er blijven … over. … − … = …" en de les gaat door. Na ± 6 s stilte komt vanzelf het hulphandje bij een stip die nog weg moet.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (laatste kolom van §3). Alleen als hij de 1e keer al zei wat er mis was.
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …".
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (elk fout antwoord is het begingetal, het getal dat eraf gaat, of te veel/te weinig); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en de algemene hint "Begin bij … en tel … terug."
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`begingetal-als-antwoord\` | koos het getal waarmee de som begint (alsof er niets af gaat) | draaiboek §7 (gezien bij Synthesis: 5 bij 5 − 1) |
| \`aftrekgetal-als-antwoord\` | koos het getal dat eraf gaat | draaiboek §7 (gezien: 2 bij 5 − 2, 4 bij 10 − 4) |
| \`een-te-veel\` / \`te-veel\` | 1 of meer te veel over (te weinig teruggeteld, of het begingetal meegeteld) | draaiboek §7 (gezien: \`een-te-veel\`, \`tellen-inclusief-begingetal\`) |
| \`een-te-weinig\` / \`te-weinig\` | 1 of meer te weinig over (te ver teruggeteld) | draaiboek §7 (gezien: \`een-te-weinig\`) |
| \`onduidelijk\` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

\`plus-in-plaats-van-min\` (draaiboek §7) komt in deze les niet voor: geen enkele keuze is a + b.

## 1b. De uitleg aan het begin: de stippenmachine (ronde 34, 12 november 2026)

Voor de 15 vragen komt een korte uitleg van de machine (draaiboek Minsommen, onderdeel \`intro\`, stap 1 t/m 4 en 7), in eigen woorden: Bliepo legt uit waar de stippenmachine voor dient, het kind tikt op de plusknop, de teller telt mee, het kind doet er nog 2 stippen bij, en dan komen 2 keuzevragen: wat doet het totaal, en hoe heet "erbij doen". De vraag "blijft het totaal stijgen?" (stap 5 en 6 van het draaiboek, alleen na een fout) is niet gebouwd; bij een fout volgt de gewone hint en de 2e fout = samen voordoen (15.11).

**Wat Bliepo zegt en het kind ziet (stippen en teller paars: het getal hoort bij de stippen, 2.1):**
1. Na de groet en de beginzin van de les: "${INTRO.begin}" De lege machine, teller 0, plusknop dof.
2. Opdracht: "${INTRO.plusEerst.join(" ")}" (rondje om de plusknop; geen pijl; na ± 6 s het hulphandje bij de plusknop met "Je bent goed bezig. ${INTRO.plusHand[0]}" (daarna wisselen de zinnen, F8)). Na de tik: 1 stip, teller 1.
3. "${kaal(INTRO.eersteStip)}" (rondje om de teller; vanzelf door).
4. Opdracht: "${kaal(INTRO.meer.join(" "))}" (geen pijl; hulphandje als bij 2; de knop wordt dof bij 3 stippen).
5. Vraag 1 en vraag 2 hieronder, met de keuzes tegelijk (de tik is het antwoord, geen "Weet ik niet").
6. "${INTRO.einde}" Dan de eerste minsom (de machine met blokjes).

**Goed in 1 keer:** een lofzin uit het rijtje + 1 zin die uitlegt waarom (afwisselend). **Goed na een fout:** alleen een korte bevestiging + die zin. **1e fout:** scherm 1,5 s rood, de knoppen weg, de eerste zin en de hint (met het rondje), dan dezelfde vraag iets anders gezegd. **2e fout:** de uitleg, "Kom, we doen het samen.", het kind tikt zelf 1 keer op de plusknop (de kleine stap), Bliepo zegt wat er nu klopt, en de les gaat door.

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | 2e fout: uitleg en samen voordoen |
|---|---|---|---|---|---|
${introRijen}

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. De 2e fout: uitleg, anders uitleggen en samen voordoen

Bij de 2e fout zegt Bliepo de eerste zin van dát antwoord met de uitleg, of, als het dezelfde denkfout is als bij de 1e fout (en hij die toen al benoemde), de "weer"-zinnen. Daarna altijd "Kom, we doen het samen." en het samen voordoen (laatste kolom).

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen voordoen |
|---|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-min-machine-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-min-machine-1-gouden.md geschreven.");
