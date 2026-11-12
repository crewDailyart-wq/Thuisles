/**
 * Maakt FOUTTABEL-squla-tellen-fruit-1-gouden.md uit de code (squla-tellen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les.
 *   npx tsx scripts/fouttabel-tellen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { writeFileSync } from "node:fs";
import { RICHTINGWOORDEN, VRAGEN, dichtbijAnders, foutenVan, telFout, zonderDichtbij } from "../src/components/les/lessen/squla-tellen-gouden-zinnen";

const kaal = (z: string) => z.replace(/\{(\d+):[a-z]+\}/g, "$1");

const rijen = VRAGEN.flatMap((v) =>
  Object.entries(foutenVan(v)).map(
    ([a, f]) =>
      `| ${v.nr}. ${v.n} ${v.fruit.naam} (keuzes ${v.keuzes.join(" / ")}) | ${a} | \`${f.code}\` — ${f.denkfout}${f.noot ? ` *(${f.noot})*` : ""} | ${kaal(f.eerste) || "(zin uit BLIEPO-KARAKTER.md §10)"} | ${kaal(f.hint)} | ${f.scherm} |`,
  ),
).join("\n");

const uitleg = VRAGEN.flatMap((v) => {
  const fouten = Object.entries(foutenVan(v));
  return fouten.map(([a, f]) => {
    /* De 1e fout was dan het andere foute antwoord (er zijn er maar 2). */
    const ander = fouten.find(([b]) => b !== a)?.[1];
    const weer = !ander || ander.soort !== f.soort ? "— (1e fout was een andere denkfout: dan de uitleg links)" : ander.noot ? "— (1e keer zei Bliepo alleen \"… is dichtbij\": dan de uitleg links, geen \"weer\")" : f.weer.map(kaal).join(" ");
    return `| ${v.nr}. ${v.n} ${v.fruit.naam} | ${a} (\`${f.code}\`) | ${kaal(f.eerste)} ${kaal(f.uitleg)} | ${weer} |`;
  });
}).join("\n");
const telling = VRAGEN.reduce((n, v) => n + Object.keys(foutenVan(v)).length, 0);
/* Controle: elk fout antwoord van elke vraag staat erin. */
for (const v of VRAGEN) for (const k of v.keuzes) if (k !== v.n && !foutenVan(v)[String(k)]) throw new Error(`geen rij voor ${v.id} ${k}`);
void telFout;
/*
 * Verklapcontrole (15.17; keuring 9 nov): noemt Bliepo de richting niet (alleen "… is dichtbij."), dan mag de hint ook
 * geen richting geven. En: blijft er na eerste zin + hint logisch maar 1 keuze over? Dan is het een verklapper.
 */
const verklappers: string[] = [];
for (const v of VRAGEN)
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const x = Number(a);
    const tekst = `${f.eerste} ${f.hint}`;
    const rest = v.keuzes.filter((k) => k !== x);
    /* Wat de zinnen zeggen: "te weinig" (meer nodig), "te veel" (minder nodig) of niets. */
    const meer = /nog niet allemaal|volle rijen|laatste rij|sla er geen|niet geteld/i.test(tekst);
    const minder = /te veel|1 keer|maar 1/i.test(tekst);
    const over = rest.filter((k) => (meer ? k > x : true) && (minder ? k < x : true));
    if (f.noot && RICHTINGWOORDEN.test(kaal(f.hint))) verklappers.push(`${v.id} ${a}: hint geeft toch een richting: "${f.hint}"`);
    if (over.length <= 1 && f.code !== "alleen-volle-rijen") verklappers.push(`${v.id} ${a}: na "${tekst}" blijft alleen ${over.join("")} over`);
  }
/*
 * Waarheidscontrole (keuring Huisnummers, 10 nov 2026): elke bewering in de eerste zin, de hint, de uitleg en de
 * "weer"-zin moet kloppen voor DIT antwoord bij DEZE vraag. En (keuring Getallenlijn): de zinnen bij de 2e fout zijn
 * uitleg, geen opdracht (meteen daarna tellen we samen; het kind kan "Tel ook …" niet meer doen).
 */
const OPDRACHT = /(^|[.!?] )(Tel|Wijs|Begin|Kijk|Geef|Sla|Leg|Sleep|Schuif|Pak|Zoek|Tik)\b/;
let beweringen = 0;
for (const v of VRAGEN)
  for (const [a, f] of Object.entries(foutenVan(v))) {
    const x = Number(a);
    const waar = `${v.id} ${a}`;
    const alles = [f.eerste, f.hint, f.uitleg, ...f.weer, dichtbijAnders(x, v)].map(kaal).join(" ");
    const klopt = (zin: RegExp, ok: boolean, wat: string) => {
      if (!zin.test(alles)) return;
      beweringen++;
      if (!ok) verklappers.push(`${waar}: niet waar: ${wat} ("${alles}")`);
    };
    klopt(/dichtbij|scheelt niet veel/, Math.abs(x - v.n) <= 2, "dichtbij, maar het scheelt meer dan 2");
    klopt(/te veel/, x > v.n, "te veel, maar het kind koos minder");
    klopt(/nog niet allemaal|te weinig|niet geteld/, x < v.n, "te weinig, maar het kind koos meer");
    klopt(/alleen de volle rijen/, x === Math.floor(v.n / 5) * 5, "alleen de volle rijen, maar dat aantal is het niet");
    klopt(new RegExp(`\\b${x}\\b`), true, "");
    for (const z of [f.uitleg, ...f.weer]) if (OPDRACHT.test(kaal(z))) verklappers.push(`${waar}: opdracht in de zin bij de 2e fout: "${kaal(z)}"`);
    if (f.noot && dichtbijAnders(x, v) === f.eerste) verklappers.push(`${waar}: dichtbijAnders is dezelfde zin als de eerste zin`);
    const z2 = kaal(zonderDichtbij(x, v));
    if (/dichtbij/.test(z2)) verklappers.push(`${waar}: zonderDichtbij zegt toch "dichtbij": "${z2}"`);
    if ((x > v.n && !/te veel|scheelt niet veel/.test(z2)) || (x < v.n && !/niet allemaal|te weinig|volle rijen|scheelt niet veel/.test(z2))) verklappers.push(`${waar}: zonderDichtbij klopt niet: "${z2}"`);
  }
/*
 * Keuring 11 nov 2026: 2 verschillende foute getallen bij 1 vraag zeggen nooit allebei "dichtbij". Zelfde keuze van de
 * eerste zin bij de 2e fout als de les (squla-tellen-gouden.tsx telVraag).
 */
for (const v of VRAGEN) {
  const F = foutenVan(v);
  for (const a of Object.keys(F))
    for (const b of Object.keys(F)) {
      if (a === b) continue;
      const e = F[a];
      const f = F[b];
      const zelfde = e.soort === f.soort && !e.noot && f.code !== "onduidelijk";
      let z = zelfde ? f.weer[0] : f.eerste;
      if (!zelfde && e.noot && f.noot) z = dichtbijAnders(Number(b), v);
      if (/dichtbij/.test(e.eerste) && /dichtbij/.test(z)) z = zonderDichtbij(Number(b), v);
      if (/dichtbij/.test(e.eerste) && /dichtbij/.test(z)) verklappers.push(`${v.id} ${a} dan ${b}: 2 keer "dichtbij"`);
    }
}
/* "… is dichtbij." niet steeds dezelfde zin (keuring Meer-minder): bij de foute antwoorden zonder richting minstens 3 versies. */
const zonderRichting = new Set(VRAGEN.flatMap((v) => Object.values(foutenVan(v)).filter((f) => f.noot).map((f) => kaal(f.eerste).replace(/\d+/g, "#"))));
if (zonderRichting.size < 3) verklappers.push(`eerste zin zonder richting heeft maar ${zonderRichting.size} versie(s): ${[...zonderRichting].join(" | ")}`);
console.log(`Waarheidscontrole: ${beweringen} beweringen nagelopen; ${zonderRichting.size} versies van de eerste zin zonder richting; geen opdracht in de zinnen bij de 2e fout.`);
if (verklappers.length) {
  console.error("VERKLAPPERS:\n" + verklappers.join("\n"));
  process.exit(1);
}
console.log("Verklapcontrole: geen hint laat maar 1 keuze over (behalve de bekende open vraag bij alleen-volle-rijen, KEUZES Ronde 20 vraag 2).");

const tekst = `# FOUTTABEL — gouden les Tellen (squla-tellen-fruit-1-gouden, "Fruit tellen")

Gemaakt op 9 november 2026, bijgewerkt op 10 november 2026 (omgezet naar de nieuwste gouden stijl, KEUZES-VOOR-SARA.md Ronde 29), **uit de code** met \`npx tsx scripts/fouttabel-tellen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-tellen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, getallen, 3 keuzes per vraag) is die van squla-tellen-fruit-1 en blijft gelijk (BOUWREGELS 15.22).

**EIGEN INVULLING, NIET VAN SYNTHESIS.** Alle vragen gaan over 11 t/m 17; het draaiboek Tellen (Color Count) gaat tot 10. De vragen krijgen hetzelfde skelet als Color Count; de hints en deze fouttabel zijn eigen invulling (15.22 punt 5). Wel volgt de soort reactie het draaiboek (§3 A, §7): Bliepo noemt het gekozen getal en de richting (te weinig / te veel) en vraagt opnieuw te tellen.

In de les staan de getallen in de kleur van het fruit (appel rood, peer groen, pruim paars); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de vraag en de knoppen even weg, het fruit blijft staan zonder nummers. Bliepo zegt de eerste zin (de pijl staat erbij als snelkoppeling; ± 0,7 s na de zin gaat het vanzelf verder, 15.27); daarna komen de 3 knoppen terug met de hint (een vraag: geen pijl).
- **Richting en verklappen (15.17):** zou "te weinig" of "te veel" bij deze 3 keuzes maar 1 keuze overlaten, dan noemt Bliepo de richting niet (alleen "dichtbij", in 3 versies die per vraag wisselen) en wijst hij naar de manier van tellen. Zo verklapt de hint het antwoord niet. Komt bij dezelfde vraag een 2e fout getal zonder richting, dan een andere versie.
- **2e fout:** een korte uitleg bij de denkfout (§3, zonder het antwoord, uitleg en geen opdracht), "Kom, we tellen ze samen." (vanzelf door). Dan tikt het kind elk stuk fruit aan (een opdracht: geen pijl); er komt een nummer bij en Bliepo zegt het getal. Het laatste getal is het aantal ("Samen telden we 12 appels."), de les gaat vanzelf door. Na ± 6 s stilte komt vanzelf het hulphandje; na 20 s zonder tik telt Bliepo de rest zelf ("Kijk, ik tel de rest. Het zijn er 12.").
- **Twee keer dezelfde denkfout** bij dezelfde vraag: Bliepo zegt "weer" en legt het anders uit (§3, laatste kolom). Alleen als hij de 1e keer al zei wat er mis was; na alleen "… is dichtbij." komt de gewone uitleg.
- **Hints wisselen:** per soort denkfout zijn er 3 hints; welke komt, hangt af van het vraagnummer.
- **Niet duidelijk (\`onduidelijk\`):** komt in deze les niet voor (elk fout antwoord is kleiner of groter dan het goede); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard (tabel \`les_uitkomsten\`, kolom denkfout; \`onduidelijk\` wordt \`onbekend\`), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-weinig\` | telde er te weinig (sloeg er een over) | draaiboek §7 (gezien bij Synthesis) |
| \`te-veel\` | telde er te veel (telde er een 2 keer) | draaiboek §7 (gezien bij Synthesis) |
| \`alleen-volle-rijen\` | telde alleen de volle rijen van 5 (bijvoorbeeld 10 bij 12), niet de rij die niet vol is | eigen invulling, lijkt op \`alleen-tiental\` uit draaiboek §7 (The Next 10) |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

Niet gebruikt uit draaiboek §7: \`een-kleur-vergeten\`, \`verkeerde-kleur\`, \`lijst-kleur-mis\`, \`niet-alles-gemaakt\` (deze les heeft maar 1 soort fruit per vraag en geen maak-opdracht), \`cijfers-naast-elkaar\` en \`cijfers-omgedraaid\` (geen keuze als 101 of 31 bij Squla), \`dubbel-geteld\` en \`getal-overgeslagen\` (niet los te zien van te-veel en te-weinig; draaiboek §7 "Let op").

## 2. Per vraag: elk fout antwoord (${telling} rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
${rijen}

## 3. Uitleg na de 2e fout (zonder het antwoord), en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd: "Kom, we tellen ze samen." en het samen tellen (nu pas het aantal in beeld).

| Vraag | 2e fout (denkfout) | Uitleg bij de 2e fout (eerste zin + uitleg) | Als de 1e fout (het andere foute antwoord) dezelfde denkfout was |
|---|---|---|---|
${uitleg}

## 4. Goed

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en het aantal (§4 Tellen: "Ja, er zijn er 12." / "Ja, je telde ze allemaal: 12." / "Het zijn er 12." / "Je telde er 12." / "Ik heb ze nagekeken: het zijn er 12."), samen als 1 uiting. Begint de lofzin met "Ja", dan komt een telzin zonder "Ja". De robotzin "Ik heb ze nagekeken …" hooguit 1 keer per les. De nummers 1 t/m 12 staan tegelijk bij het fruit. Vanzelf door (± 0,7 s na de zin; 15.27).
- **Eerste vraag in één keer goed:** lofzin, "Laten we ze samen natellen.", Bliepo telt hardop 1 t/m 12 (± 1,15 s per nummer; een tik op de pijl zet alle nummers er meteen bij), "Zie je? Het zijn er 12. Je had het precies goed." Alles vanzelf door.
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); de nummers staan erbij; vanzelf door.
- **Heel snel:** Bliepo zegt niets over snel (BOUWREGELS 6.10).
- **Hetzelfde foute getal 2 keer:** de eerste zin wordt "Je koos weer 11." (niet 2 keer dezelfde zin).
- **Verklapcontrole:** het script stopt met een foutmelding als een hint zonder richting toch een richting geeft, of als er na eerste zin + hint maar 1 keuze logisch overblijft (open: vraag 15, keuze 10, KEUZES Ronde 20 vraag 2).
`;

writeFileSync(new URL("../FOUTTABEL-squla-tellen-fruit-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-tellen-fruit-1-gouden.md geschreven");
