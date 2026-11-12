/**
 * Maakt FOUTTABEL-squla-plus-bakkerij-1-gouden-extra.md uit de code (squla-plussommen-extra-zinnen.ts), zodat de tabel
 * altijd klopt met de les.
 *   npx tsx scripts/fouttabel-plussommen-extra-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { aanvulFout, dichtbij, getalFout, omwisselFout, somFout, somKeuzes, totaalFout } from "../src/components/les/lessen/squla-plussommen-extra-zinnen";
import { controleer, schrijf, tabel, type Rij } from "./fouttabel-extra-hulp";

const rijen: Rij[] = [];
/* Stap 2: welk getal? Alle tegels 1 t/m 9 die het kind kan kiezen. */
for (let n = 1; n <= 9; n++) {
  const opties = dichtbij(n, 9);
  for (const x of opties.filter((k) => k !== n)) rijen.push({ vraag: `Stap 2: welk getal is dit? (tegel ${n}; keuzes ${opties.join(" / ")})`, antwoord: String(x), f: getalFout(x, n, opties, n), opties: opties.map(String), goed: String(n) });
}
/* Stap 4 en 6: het totaal van 2 tegels (een paar echte voorbeelden). */
for (const [a, b] of [[2, 3], [3, 4], [4, 5], [1, 1]] as [number, number][]) {
  const opties = dichtbij(a + b, 18);
  for (const x of opties.filter((k) => k !== a + b)) rijen.push({ vraag: `Stap 4 en 6: totaal van ${a} en ${b} (keuzes ${opties.join(" / ")})`, antwoord: String(x), f: totaalFout(x, a, b, opties, a), opties: opties.map(String), goed: String(a + b) });
}
/* Stap 7, 8 en 12: de tegel zoeken die er samen met de gekozen tegel `doel` van maakt. */
for (const [gekozen, doel, k] of [[6, 7, 2], [6, 7, 1 + 6], [3, 7, 1], [3, 10, 4], [4, 10, 8], [5, 10, 4]] as [number, number, number][]) rijen.push({ vraag: `Stap 7, 8, 12: maak samen ${doel} met de ${gekozen}`, antwoord: `tegel ${k}`, f: aanvulFout(gekozen, k, doel) });
/* Stap 9: de som kiezen. */
for (const [p, q] of [[3, 7], [4, 6]] as [number, number][]) for (const x of somKeuzes(p, q).slice(1)) rijen.push({ vraag: `Stap 9: welke som hoort bij ${p} en ${q}? (goed: ${somKeuzes(p, q)[0]})`, antwoord: x, f: somFout(x, p, q), opties: somKeuzes(p, q), goed: somKeuzes(p, q)[0] });
/* Stap 11: omwisselen. */
for (const x of [9, 11]) rijen.push({ vraag: "Stap 11: omwisselen, wat is het totaal nu? (goed: 10; keuzes 10 / 9 / 11)", antwoord: String(x), f: omwisselFout(x), opties: ["10", "9", "11"], goed: "10" });

const { beweringen } = controleer(rijen);
console.log(`Controle: ${rijen.length} rijen; ${beweringen} keuzes nagelopen (geen hint verklapt het antwoord); geen opdracht in de zinnen bij de 2e fout.`);

const tekst = `# FOUTTABEL — extra les Plussommen (squla-plus-bakkerij-1-gouden-extra, "Plussommen met tegels, extra")

Gemaakt op 12 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-plussommen-extra-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-plussommen-extra-zinnen.ts\` en draai het script opnieuw. Besluit Sara 12 november 2026 (22.3): de Synthesis-opdrachten uit het draaiboek Plussommen die niet in de Squla-les zitten, als EXTRA les naast de gouden les.

**EIGEN INVULLING, NIET VAN SYNTHESIS.** De getallen zijn die van het draaiboek (tegels 1 t/m 9, totalen tot 10, doelen 7 en 10). Het draaiboek laat het kind bij een foute tegel zelf zien wat het maakte (§3 C), en noemt bij het totaal de richting (§3 D); Bliepo doet dat ook, met de denkfout erbij (BOUWREGELS 15.9). Niet gebouwd: de som zelf typen (stap 10), de slot-tegels van stap 5 en de zijroute na 2 fouten (vervangen door 2 pogingen).

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **Keuzevragen (welk getal, totaal, de som, omwisselen):** 1e fout = scherm 1,5 s rood (geen fout-geluidje), Bliepo noemt wat het kind koos en de denkfout; dan komen de knoppen terug met de hint. 2e fout = uitleg (zonder het antwoord) en samen voordoen: Bliepo telt de vakjes (een voor een), of laat de som zien. De les gaat door. Elk vervolg gaat vanzelf (15.27).
- **De tegel zoeken (samen 7, samen 10, nog een manier):** een foute tegel verschijnt even en verdwijnt weer (zonder het woord "fout"). 1e fout = Bliepo rekent voor wat het kind maakte ("3 en 4 is samen 7. Dat is te weinig.") en het kind mag nog 1 keer een tegel zetten. 2e fout = uitleg, en een schaduw van de tegel die erbij past komt in het rooster; het kind zet hem zelf (kleine stap), Bliepo zegt wat er gemaakt is.
- **Richting en verklappen (15.17):** zou "te weinig" of "te veel" maar 1 keuze overlaten (bij tegel 1, 2 of 9), dan noemt Bliepo alleen "dichtbij". Het script controleert dat er na de eerste zin en de hint minstens 2 keuzes overblijven.
- **Hulphandje (15.19):** komt vanzelf na ± 6 s stilte bij een opdracht (een tegel kiezen en zetten), als het handje dat laat zien hoe je een tegel naar het rooster sleept; nooit bij een keuzevraag, nooit een knop. **Heel snel antwoorden:** Bliepo zegt niets (BOUWREGELS 6.10).
- **Omwisselen (15.20):** het antwoord staat NIET in beeld zolang de vraag open is (het draaiboek liet het wel zien); pas na het antwoord komt de som er helemaal te staan.
- Elke fout wordt met de naam van de denkfout bewaard (tabel \`les_uitkomsten\`, kolom denkfout; \`onduidelijk\` wordt \`onbekend\`), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`te-weinig-hokjes\` / \`te-veel-hokjes\` | telde de vakjes van 1 tegel verkeerd | draaiboek §3 A (gezien, R1, P-8nov) |
| \`samen-te-weinig\` / \`samen-te-veel\` | de tegels samen zijn te weinig of te veel (bij het totaal, en bij het aanvullen) | draaiboek §3 C en D (gezien) |
| \`cijfers-naast-elkaar\` | zette de getallen naast elkaar (3 en 7 werd 37) | draaiboek §3 E (gezien, 3×) |
| \`plus-min-verwisseld\` | koos een min in plaats van een plus | draaiboek §3 E (gezien) |
| \`totaal-verandert-bij-omwisselen\` | denkt dat het totaal verandert als de tegels omgedraaid liggen | draaiboek §3 F (gezien, R3) |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

## 2. Per vraag: elk fout antwoord (${rijen.length} rijen)

${tabel(rijen)}

## 3. Goed

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en de som of het getal ("Dat werkt: 3 + 4 = 7." / "Ja, 3 en 4 maken samen 7." / "3 + 4 = 7, precies." / "Het is een 5."); de tegel krijgt een lichtgolf (draaiboek §3 A.1, D.1).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); vanzelf door.
- **Nog een manier voor 10:** komt alleen als omwisselen niet "samen gedaan" was (draaiboek stap 12).
`;
schrijf("FOUTTABEL-squla-plus-bakkerij-1-gouden-extra.md", tekst);
