/**
 * Maakt FOUTTABEL-squla-meten-oppervlakte-1-gouden.md uit de code (squla-meten-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les, en doet de REKEN-, VERKLAP- en WAARHEIDSCONTROLE (BOUWREGELS 11.9, 14.30, 15.17; LESRECEPT "geleerd bij
 * Tellen, Huisnummers en Getallenlijn").
 *   npx tsx scripts/fouttabel-meten-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 *
 * Verklapcontrole: per vraag en per fout antwoord rekent het script na hoeveel antwoorden er na de eerste zin + de hint
 * logisch nog over zijn (`over`). Blijft er maar 1 over, dan verklapt de zin het antwoord en stopt het script (behalve bij
 * een vraag met 2 keuzes: daar is dat altijd zo, met een noot). Bij typen kijkt het script of het goede getal niet in de
 * eerste zin of hint staat. Bij op volgorde: geen zin noemt de hele goede volgorde.
 * Waarheidscontrole (keuring Huisnummers): wat Bliepo zegt moet WAAR zijn voor ELK antwoord dat een kind kan geven: bij
 * typen elk getal van 0 tot 99, bij op volgorde elke volgorde, bij kies er 2 elk paar.
 * Uitleg bij de 2e fout is uitleg, geen opdracht (keuring Getallenlijn): geen zin die begint met Tel, Tik, Kijk, Zoek,
 * Begin, Sleep of Leg.
 */
import { writeFileSync } from "node:fs";
import { MAAT, TEGELS, VRAGEN, ZIN, foutenVan, metenFout, metenReactie, naamVan, paren, typFout, volgordes, type Fout, type Vraag } from "../src/components/les/lessen/squla-meten-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");
const getallenIn = (z: string) => (kaal(z).match(/\d+/g) ?? []).map(Number);
const fouten: string[] = [];

/* 1. Inhoud en rekenen (11.9, 14.30, 15.21): 12 vragen zoals squla-meten-oppervlakte-1, in dezelfde volgorde. */
const OUD: [string, string, string][] = [
  ["twee", "muur|v=1", "huis,zon"],
  ["twee", "muur|v=2", "boot,planeet"],
  ["orden", "", "a,b,c,d"],
  ["orden", "", "2,4,6"],
  ["kies", "vellen|draai=1", "Ze zijn even groot."],
  ["twee", "ruitjes|a=2x4|b=1x8", "even,tel"],
  ["kies", "matten|a=2x2|b=1x4", "Ze zijn even groot."],
  ["kies", "matten|a=2x5|b=1x10", "Ze zijn even groot."],
  ["typ", "tafel|k=5|r=2|kl=groen", "10"],
  ["typ", "tafel|k=3|r=3|kl=blauw", "9"],
  ["typ", "tafel|k=4|r=3|kl=oranje", "12"],
  ["orden", "", "3,5,7"],
];
if (VRAGEN.length !== 12) fouten.push(`${VRAGEN.length} vragen in plaats van 12 (squla-meten-oppervlakte-1; daarna komen er 3 terug: samen 15)`);
VRAGEN.forEach((v, i) => {
  const [soort, beeld, goed] = OUD[i];
  if (v.soort !== soort || v.beeld !== beeld || v.goed !== goed) fouten.push(`${v.id}: wijkt af van de oude les`);
  if (v.soort === "typ" && v.k! * v.r! !== Number(v.goed)) fouten.push(`${v.id}: ${v.k} × ${v.r} is niet ${v.goed}`);
  if (v.soort === "kies" && v.opties!.filter((o) => o === v.goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goed antwoord`);
  if (v.soort === "twee" && paren(v).filter((p) => p === v.goed).length !== 1) fouten.push(`${v.id}: niet precies 1 goed paar`);
  if (v.soort === "orden" && v.juist!.some((id, j) => j > 0 && MAAT[v.juist![j - 1]] >= MAAT[id])) fouten.push(`${v.id}: de goede volgorde loopt niet op`);
  if (v.thema === "schilderij") {
    const kl = v.kaarten!.filter((k) => k.label === "kleinst").map((k) => TEGELS[k.id]);
    const gr = v.kaarten!.filter((k) => k.label === "grootst").map((k) => TEGELS[k.id]);
    const goedKl = v.kaarten!.find((k) => k.label === "kleinst" && v.goed.split(",").includes(k.id))!;
    if (TEGELS[goedKl.id] !== Math.min(...kl) || Math.max(...gr) !== Math.max(...v.kaarten!.map((k) => TEGELS[k.id]))) fouten.push(`${v.id}: de tegels kloppen niet met kleinst/grootst`);
  }
});
/* De tegels achter de schilderijen (MUREN in squla-meten-tekeningen.ts: zon 3×3, bloem 4×4, huis 4×5, boot 3×2, boom 2×6, planeet 5×4). */
const MUUR = { zon: 9, bloem: 16, huis: 20, boot: 6, boom: 12, planeet: 20 } as Record<string, number>;
for (const [k, n] of Object.entries(MUUR)) if (TEGELS[k] !== n) fouten.push(`TEGELS ${k}: ${TEGELS[k]} in plaats van ${n}`);

/* 2. Fouttabel compleet en verklapcontrole. */
const OPDRACHT = /(^|\. )(Tel|Tik|Kijk|Zoek|Begin|Sleep|Leg)\b/;
const verklap = (v: Vraag, a: string, f: Fout): string | null => {
  if (f.code !== "onduidelijk" && !f.eerste) return "geen eerste zin";
  if (!f.hint) return "geen hint";
  if (/\bfout\b/i.test(`${f.eerste} ${f.hint} ${f.uitleg} ${f.weer.join(" ")}`)) return 'het woord "fout"';
  if (OPDRACHT.test(f.uitleg) || f.weer.some((z) => OPDRACHT.test(z))) return `de uitleg bij de 2e fout is een opdracht ("${f.uitleg} ${f.weer.join(" ")}")`;
  if (/tussen \d+ en \d+/.test(kaal(`${f.eerste} ${f.hint}`))) return "de eerste zin of hint noemt 2 buren";
  if (/\b1 te (veel|weinig)\b/.test(kaal(`${f.eerste} ${f.hint}`))) return "de eerste zin of hint zegt de richting (1 te veel of 1 te weinig)";
  if (v.soort === "typ") return getallenIn(`${f.eerste} ${f.hint}`).includes(Number(v.goed)) ? `de eerste zin of hint noemt het antwoord ${v.goed}` : null;
  if (v.soort === "orden") return kaal(`${f.eerste} ${f.hint}`).includes(v.juist!.map((id) => naamVan(v, id)).join(", ")) ? "de hele volgorde staat in de zin" : null;
  if (!f.over.includes(v.goed)) return "het goede antwoord valt weg na de eerste zin (de zin klopt niet)";
  if (f.over.length <= 1 && !f.noot) return `na "${kaal(`${f.eerste} ${f.hint}`)}" blijft alleen ${f.over.join("")} over`;
  return null;
};
let telling = 0;
for (const v of VRAGEN) {
  const tabel = foutenVan(v);
  const nodig = v.soort === "twee" ? paren(v).length - 1 : v.soort === "orden" ? volgordes(v).length - 1 : v.soort === "kies" ? v.opties!.length - 1 : 4;
  if (v.soort === "typ" ? Object.keys(tabel).length < nodig : Object.keys(tabel).length !== nodig) fouten.push(`${v.id}: ${Object.keys(tabel).length} rijen in de fouttabel, ${nodig} nodig`);
  for (const [a, f] of Object.entries(tabel)) {
    telling++;
    const r = verklap(v, a, f);
    if (r) fouten.push(`${v.id} ${a}: ${r}`);
    if (v.soort !== "typ" && f.code === "onduidelijk") fouten.push(`${v.id} ${a}: bij vaste keuzes heeft elke rij een denkfout (geleerd bij Getallenlijn)`);
  }
  /* De reacties bij goed noemen alleen getallen die bij deze vraag horen. */
  const mag = new Set([Number(v.goed), v.k, v.r, v.stukken, 8, 2, ...Object.values(TEGELS)].filter((x): x is number => typeof x === "number"));
  if (!metenReactie(v).zinnen.every((z) => getallenIn(z).every((n) => mag.has(n)))) fouten.push(`${v.id}: een reactie bij goed noemt een getal dat er niet bij hoort`);
}

/* 3. Waarheidscontrole: voor elk antwoord dat een kind kan geven, is wat Bliepo zegt waar? */
let waarheid = 0;
for (const v of VRAGEN) {
  const xs = v.soort === "typ" ? Array.from({ length: 100 }, (_, i) => String(i)) : v.soort === "twee" ? paren(v) : v.soort === "orden" ? volgordes(v) : v.opties!;
  for (const x of xs) {
    if (x === v.goed) continue;
    const f = v.soort === "typ" ? typFout(Number(x), v) : metenFout(x, v);
    const tekst = kaal([f.eerste, f.hint, f.uitleg, ...f.weer].join(" "));
    const mis = (r: string) => fouten.push(`${v.id} ${x}: niet waar: ${r} ("${tekst}")`);
    waarheid++;
    if (v.soort === "typ") {
      const n = v.k! * v.r!;
      const X = Number(x);
      if (/is de bovenste rij/.test(tekst) && X !== v.k) mis("niet de bovenste rij");
      if (/rij overgeslagen/.test(tekst) && X !== n - v.k!) mis("geen rij overgeslagen");
      if (/dichtbij|vlak naast|Bijna goed/.test(tekst) && Math.abs(X - n) !== 1) mis("niet dichtbij");
      if (/Je deed (\d+) en (\d+) bij elkaar/.test(tekst)) {
        const m = /Je deed (\d+) en (\d+) bij elkaar/.exec(tekst)!;
        if (+m[1] + +m[2] !== X || +m[1] !== v.k || +m[2] !== v.r) mis("niet de rij en de rijen bij elkaar");
      }
      if (getallenIn(`${f.eerste} ${f.hint}`).includes(n)) mis(`het antwoord ${n} staat erin`);
    }
    if (v.soort === "orden") {
      const xx = x.split(",");
      const t = v.thema === "tafels";
      if (/Je legde ze van (groot naar klein|breed naar smal)/.test(f.eerste) && !xx.every((id, i) => i === 0 || MAAT[xx[i - 1]] > MAAT[id])) mis("niet van groot naar klein");
      if (/^Vooraan ligt nog niet/.test(f.eerste) && xx[0] === v.juist![0]) mis("vooraan ligt wel de kleinste");
      const na = /^Na (.+?) legde je (.+?)\.$/.exec(kaal(f.eerste));
      if (na) {
        const a = v.losse!.find((k) => k.naam === na[1]);
        const pa = a ? xx.indexOf(a.id) : -1;
        if (pa < 0 || pa === xx.length - 1) mis(`"${na[1]}" ligt niet vóór een ander plaatje`);
        else {
          const b = xx[pa + 1];
          if (/kleinere tafel|smaller muurtje/.test(na[2])) {
            if (MAAT[b] >= MAAT[xx[pa]]) mis("het plaatje erna is niet kleiner");
          } else if (naamVan(v, b) !== na[2]) mis(`na "${na[1]}" ligt niet "${na[2]}"`);
          if (xx.slice(0, pa + 1).some((id, i) => id !== v.juist![i])) mis("vóór die plek lag al iets op de verkeerde plek (de zin wijst dan niet de eerste fout aan)");
        }
      }
      if (/Op 2 tafels staan 6 borden/.test(tekst) && !t) mis("geen tafels");
    }
    if (v.soort === "twee") {
      const ids = x.split(",");
      const labels = ids.map((id) => v.kaarten!.find((k) => k.id === id)!.label);
      if (/2 keer 'het kleinst'/.test(f.eerste) && !labels.every((l) => l === "kleinst")) mis("niet 2 keer 'het kleinst'");
      if (/^1 van je 2 kaartjes klopt/.test(f.eerste) && ids.filter((id) => v.goed.split(",").includes(id)).length !== 1) mis("niet precies 1 van de 2 klopt");
      if (/'even groot' én 'niet even groot'/.test(f.eerste) && !(ids.includes("even") && ids.includes("niet"))) mis("niet allebei gekozen");
    }
    if (v.thema === "matten") {
      const [a, b] = /a=(\d+)x(\d+)\|b=(\d+)x(\d+)/.exec(v.beeld)!.slice(1).map(Number).reduce<[number[], number[]]>((acc, n, i) => (acc[i < 2 ? 0 : 1].push(n), acc), [[], []]);
      if (/Mat 1 is hoger/.test(tekst) && !(a[0] > b[0])) mis("mat 1 is niet hoger");
      if (/Mat 2 is langer/.test(tekst) && !(b[1] > a[1])) mis("mat 2 is niet langer");
      if (a[0] * a[1] !== b[0] * b[1] || a[0] * a[1] !== v.stukken) mis("de matten zijn niet even groot");
    }
  }
}

/* 4. De zinnen bij het samen voordoen kloppen (11.9). */
for (const v of VRAGEN) {
  const z = kaal(ZIN.samenKlaar(v));
  if (v.soort === "typ" && !z.includes(` ${v.goed} blaadjes`)) fouten.push(`${v.id}: samenKlaar noemt niet ${v.goed} blaadjes`);
  if (v.thema === "matten" && !z.includes(`${v.stukken} stukken`)) fouten.push(`${v.id}: samenKlaar noemt niet ${v.stukken} stukken`);
}

if (fouten.length) {
  console.error("FOUTEN:\n" + fouten.join("\n"));
  process.exit(1);
}
console.log(`Rekencontrole, verklapcontrole en waarheidscontrole: in orde (${VRAGEN.length} vragen, ${telling} foute antwoorden in de tabel, ${waarheid} antwoorden op waarheid gecontroleerd).`);

/* 5. De tabel. */
const soortNaam = { twee: "kies er 2", orden: "op volgorde", kies: "kiezen", typ: "typen" } as const;
const vraagNaam = (v: Vraag) => `${v.nr}. ${soortNaam[v.soort]}: ${kaal([...(v.intro ?? []), ...v.vraag].join(" "))} → ${v.soort === "twee" ? v.goed.split(",").map((id) => v.kaarten!.find((k) => k.id === id)!.zeg).join(" + ") : v.soort === "orden" ? v.juist!.map((id) => naamVan(v, id)).join(", ") : v.goed}`;
const antwoord = (v: Vraag, a: string) => (v.soort === "twee" ? a.split(",").map((id) => v.kaarten!.find((k) => k.id === id)!.zeg).join(" + ") : v.soort === "orden" ? a.split(",").map((id) => naamVan(v, id).replace(/^(de|het) /, "")).join(" · ") : a);
const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) => `| ${vraagNaam(v)} | ${antwoord(v, a)} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} | ${f.eigen ? "**eigen invulling, niet van Synthesis**" : "Synthesis"} — ${f.bron} |`,
  ),
).join("\n");
const samenZin = (v: Vraag) => `${kaal(ZIN.samen(v))} … ${kaal(ZIN.samenKlaar(v))}`;
const uitleg = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v))
    .filter(([, f], i, alle) => alle.findIndex(([, g]) => g.soort === f.soort) === i)
    .map(([a, f]) => `| ${v.nr} | ${antwoord(v, a)} (\`${f.code}\`) | ${kaal(f.eerste) || "(zin uit §10)"} ${kaal(f.uitleg)} | ${f.weer.length && !f.noot ? f.weer.map(kaal).join(" ") : "— (dan de uitleg links)"} | ${samenZin(v)} |`),
).join("\n");
const typAlgemeen = VRAGEN.filter((v) => v.soort === "typ").map((v) => `| ${v.nr} | ${kaal(typFout(50, v).hint)} | ${kaal(typFout(50, v).uitleg)} |`).join("\n");

const tekst = `# FOUTTABEL — gouden les Meten (squla-meten-oppervlakte-1-gouden, "Hoe groot is het?")

Gemaakt op 10 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-meten-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-meten-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (12 vragen, daarna 3 die terugkomen; tekeningen, getallen, keuzes) is die van squla-meten-oppervlakte-1 en blijft gelijk (BOUWREGELS 15.21, 15.22).

**Bron van de reacties:** het draaiboek Meten (Area: Cover It Up), §3 C (een eigen zin per fout getal bij "hoeveel tegels?": de bovenste rij, een rij gemist, 1 te veel), §3 G (samen tellen: het kind tikt elk ding aan, Bliepo zegt het getal) en §7 (denkfouten: \`een-rij-geteld\`, \`rij-gemist\`, \`een-te-veel\`, \`lang-lijkt-groter\`, \`groot-vierkant-lijkt-groter\`, \`vorm-verandert-grootte\`).

**Eigen invulling, niet van Synthesis (15.22 punt 5):** Cover It Up heeft geen "kies er 2", geen "op volgorde" en geen speelmatten of gedraaid kaartje (draaiboek §8). Die vragen hebben hetzelfde skelet (vraag met het beeld, 1e fout zin + hint + vraag in andere woorden, 2e fout uitleg en samen voordoen), maar hun eerste zinnen en hints zijn eigen invulling; de laatste kolom zegt het per rij.

**Getalkleur (2.1, 2.2):** blaadjes groen, blauw of oranje; blauwe en gele hokjes blauw en geel; tegels op de muur geel; stenen rood; borden, puzzelstukken in allerlei kleuren en kale getallen wit. Hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje). De knoppen of vinkjes gaan weg (bij typen wordt het vak leeg; bij op volgorde glijden de plaatjes terug). Bliepo zegt de eerste zin en de hint; een rood rondje staat om wat hij noemt (de bovenste rij, mat 1 of 2, kaartje 2, het vak), nooit om het antwoord. Bij de schilderijen worden de tegels erachter zichtbaar. Daarna gaat de les vanzelf door (15.27): de vraag in andere woorden en het kind mag opnieuw. De nummers die het kind op de blaadjes zette, blijven staan (draaiboek §3 C.3).
- **Verklappen (15.17):** de eerste zin zegt alleen wat zeker is over het gekozen antwoord. Bij typen nooit "1 te veel" of "1 te weinig" (dan weet je het antwoord), wel "Dat is dichtbij." Bij kies er 2 zegt Bliepo "1 van je 2 kaartjes klopt." en niet welke (anders blijft er maar 1 paar over). Het script rekent het per fout antwoord na.
- **2e fout:** een korte uitleg bij de denkfout (uitleg, geen opdracht), dan samen voordoen: bij de tafel tikt het kind elk blaadje aan en Bliepo zegt het getal (samen tellen, §3 G); bij de matten en de ruitjes telt Bliepo de eerste en het kind de tweede; bij de schilderijen noemt Bliepo per schilderij de tegels en tikt het kind de 2 goede kaartjes aan; bij het gedraaide kaartje tikt het kind kaartje 2 en het draait terug; bij op volgorde legt Bliepo ze en sleept het kind de laatste. Het hulphandje komt vanzelf na ± 6 s. Daarna gaat de les door.
- **Twee keer dezelfde denkfout:** Bliepo zegt "weer" en legt het anders uit (alleen als hij de 1e keer al zei wat er mis was).
- **Hetzelfde foute antwoord 2 keer:** de eerste zin wordt "Je koos weer …" ("Je typte weer …", "Je legde ze weer zo neer.").
- **Niet duidelijk (\`onduidelijk\`):** bij typen, voor elk getal dat niet in de tabel staat (of waar 2 denkfouten passen): een zin uit BLIEPO-KARAKTER.md §10 en de algemene hint hieronder. Geen reden verzonnen.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`een-rij-geteld\` | telde alleen de bovenste rij blaadjes | draaiboek §7 (gezien) |
| \`rij-gemist\` | sloeg een hele rij over | draaiboek §7 (gezien) |
| \`een-ernaast\` | telde er 1 te veel of 1 te weinig | draaiboek §7 \`een-te-veel\` (gezien); de richting zegt Bliepo niet |
| \`rij-en-rijen-opgeteld\` | deed de blaadjes van 1 rij en het aantal rijen bij elkaar | de oude les (Squla); niet gezien bij Synthesis |
| \`twee-keer-kleinst\` | koos 2 keer "het kleinst" | eigen invulling |
| \`verkeerde-kleinste\` | koos het verkeerde schilderij als kleinste | eigen invulling |
| \`even-en-niet-samen\` | koos "even groot" én "niet even groot" | eigen invulling |
| \`vorm-verandert-grootte\` | denkt dat een andere vorm een andere grootte heeft | draaiboek §7 (gezien bij het trapkleed) |
| \`draaien-verandert-grootte\` | denkt dat een gedraaid kaartje een andere grootte heeft | draaiboek §7 \`vorm-verandert-grootte\` |
| \`hoog-lijkt-groter\` | vindt de hogere mat groter | draaiboek §7 \`groot-vierkant-lijkt-groter\` (gezien) |
| \`lang-lijkt-groter\` | vindt de langere mat groter | draaiboek §7 (gezien) |
| \`volgorde-omgedraaid\` | legde ze van groot naar klein | eigen invulling |
| \`kleinste-niet-vooraan\` | legde vooraan niet het kleinste | eigen invulling |
| \`kleiner-erna\` | legde na een plaatje een kleiner plaatje | eigen invulling |
| \`overgeslagen\` | sloeg een plaatje over | eigen invulling |
| \`plek-over-niet-gezien\` | zag niet dat op de tafel met plek over meer borden passen | eigen invulling (de oude les legt het zo uit) |
| \`onduidelijk\` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

## 2. De fouttabel: per vraag elk fout antwoord (${telling} rijen; bij typen de meest voorkomende getallen)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint | Op het scherm | Bron |
|---|---|---|---|---|---|---|
${rijen}

**Typen, elk ander getal (algemeen, \`onduidelijk\`):**

| Vraag | Hint | Uitleg bij de 2e fout |
|---|---|---|
${typAlgemeen}

## 3. De 2e fout: uitleg, anders uitleggen en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Dezelfde denkfout 2 keer | Samen voordoen (begin … einde) |
|---|---|---|---|---|
${uitleg}
`;
writeFileSync(new URL("../FOUTTABEL-squla-meten-oppervlakte-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-meten-oppervlakte-1-gouden.md geschreven.");
