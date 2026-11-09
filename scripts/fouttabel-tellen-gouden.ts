/**
 * Maakt FOUTTABEL-squla-tellen-fruit-1-gouden.md uit de code (squla-tellen-gouden-zinnen.ts), zodat de tabel altijd
 * klopt met de les.
 *   npx tsx scripts/fouttabel-tellen-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { writeFileSync } from "node:fs";
import { VRAGEN, foutenVan, telFout } from "../src/components/les/lessen/squla-tellen-gouden-zinnen";

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

const tekst = `# FOUTTABEL — gouden les Tellen (squla-tellen-fruit-1-gouden, "Fruit tellen")

Gemaakt op 9 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-tellen-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-tellen-gouden-zinnen.ts\` en draai het script opnieuw. De inhoud (15 vragen, getallen, 3 keuzes per vraag) is die van squla-tellen-fruit-1 en blijft gelijk (BOUWREGELS 15.22).

**EIGEN INVULLING, NIET VAN SYNTHESIS.** Alle vragen gaan over 11 t/m 17; het draaiboek Tellen (Color Count) gaat tot 10. De vragen krijgen hetzelfde skelet als Color Count; de hints en deze fouttabel zijn eigen invulling (15.22 punt 5). Wel volgt de soort reactie het draaiboek (§3 A, §7): Bliepo noemt het gekozen getal en de richting (te weinig / te veel) en vraagt opnieuw te tellen.

In de les staan de getallen in de kleur van het fruit (appel rood, peer groen, pruim paars); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de vraag en de knoppen even weg, het fruit blijft staan zonder nummers. Bliepo zegt de eerste zin; daarna komen de 3 knoppen meteen terug met de hint (geen pijl, zoals het draaiboek).
- **Richting en verklappen (15.17):** zou "te weinig" of "te veel" bij deze 3 keuzes maar 1 keuze overlaten, dan noemt Bliepo de richting niet (alleen "dichtbij") en wijst hij naar de manier van tellen. Zo verklapt de hint het antwoord niet.
- **2e fout:** een korte uitleg bij de denkfout (§3, zonder het antwoord), "Kom, we tellen ze samen." (pijl). Dan tikt het kind elk stuk fruit aan; er komt een nummer bij en Bliepo zegt het getal. Het laatste getal is het aantal ("Samen telden we 12 appels."). Pijl, de les gaat door. Na ± 6 s stilte komt vanzelf het hulphandje.
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

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en het aantal (§4 Tellen: "Ja, er zijn er 12." / "Ja, je telde ze allemaal: 12." / "Ik heb ze nagekeken: het zijn er 12."). De nummers 1 t/m 12 staan tegelijk bij het fruit. Wacht op de pijl.
- **Eerste vraag in één keer goed:** lofzin, "Laten we ze samen natellen." (pijl), Bliepo telt hardop 1 t/m 12, "Zie je? Het zijn er 12. Je had het precies goed." (pijl).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); de nummers staan erbij; pijl.
- **Heel snel:** Bliepo zegt niets over snel (BOUWREGELS 6.10).
`;

writeFileSync(new URL("../FOUTTABEL-squla-tellen-fruit-1-gouden.md", import.meta.url), tekst);
console.log("FOUTTABEL-squla-tellen-fruit-1-gouden.md geschreven");
