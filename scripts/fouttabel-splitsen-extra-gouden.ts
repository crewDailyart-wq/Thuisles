/**
 * Maakt FOUTTABEL-squla-splits-splitsen1-1-gouden-extra.md uit de code (squla-splitsen-extra-zinnen.ts), zodat de tabel
 * altijd klopt met de les.
 *   npx tsx scripts/fouttabel-splitsen-extra-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { NIEUWKEUZES, SOMKEUZES, TOTAAL5, TOTAAL7, TUSSENKEUZES, foutenNieuw, foutenSom, foutenTotaal, splitsFout, tussenFout } from "../src/components/les/lessen/squla-splitsen-extra-zinnen";
import { controleer, schrijf, tabel, type Rij } from "./fouttabel-extra-hulp";

const rijen: Rij[] = [];
for (const [x, f] of Object.entries(foutenTotaal())) rijen.push({ vraag: `Stap 7: wat staat er in het totaal? (goed: ${TOTAAL5}; delen 3 en 2)`, antwoord: x, f, opties: ["3", "2", "5"], goed: "5" });
for (const [x, f] of Object.entries(foutenSom())) rijen.push({ vraag: "Stap 9: welke som heb je gemaakt? (goed: 3 + 2 = 5)", antwoord: x, f, opties: SOMKEUZES, goed: SOMKEUZES[0] });
for (const x of TUSSENKEUZES.filter((k) => k !== "5")) rijen.push({ vraag: "Stap 9, tussenvraag na een fout: wat is 3 + 2? (1 poging; daarna zegt Bliepo het)", antwoord: x, f: tussenFout(x), opties: TUSSENKEUZES, goed: "5" });
for (const [x, f] of Object.entries(foutenNieuw())) rijen.push({ vraag: `Stap 11: nieuw totaal, welk getal? (goed: ${TOTAAL7})`, antwoord: x, f, opties: NIEUWKEUZES, goed: String(TOTAAL7) });
const standen: [number, number, number][] = [[3, 3, 7], [4, 4, 7], [1, 3, 7], [6, 2, 7], [7, 7, 7], [0, 7, 7], [0, 0, 7], [4, 3, 8], [5, 4, 8], [4, 5, 10], [6, 6, 10], [0, 10, 10]];
for (const [a, b, t] of standen) rijen.push({ vraag: `Stap 12, 14, 15: zoek 2 delen die samen ${t} maken (totaal ${t})`, antwoord: `${a} + ${b}`, f: splitsFout(a, b, t, 0) });

const { beweringen } = controleer(rijen);
console.log(`Controle: ${rijen.length} rijen; ${beweringen} keuzes nagelopen (geen hint verklapt het antwoord); geen opdracht in de zinnen bij de 2e fout.`);

const tekst = `# FOUTTABEL — extra les Splitsen (squla-splits-splitsen1-1-gouden-extra, "Splitsen, extra")

Gemaakt op 12 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-splitsen-extra-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-splitsen-extra-zinnen.ts\` en draai het script opnieuw. Besluit Sara 12 november 2026 (21.7): de Synthesis-opdrachten uit het draaiboek Splitsen die niet in de Squla-les zitten, als EXTRA les naast de gouden les.

**EIGEN INVULLING, NIET VAN SYNTHESIS.** De getallen zijn die van het draaiboek (5, 7, 8); het getal 12 uit "Larger" is 10 geworden, omdat Squla Splitsen tot 10 gaat. Het draaiboek rekent bij een foute splitsing de gekozen delen voor (§3 F.2) en noemt bij het totaal "dat is een van de delen" (§3 B.2); Bliepo doet dat ook, met de denkfout erbij (BOUWREGELS 15.9). Niet gebouwd: de woorden "samenstellen" en "ontleden", de piano, "weet je nog hoe dat heet?" en de tegel van 5 (Engels of niet Squla-stof, draaiboek §10).

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **Keuzevragen (stap 7, 9 en 11):** 1e fout = scherm 1,5 s rood (geen fout-geluidje), Bliepo noemt wat het kind koos en de denkfout; dan komen de knoppen terug met de hint. 2e fout = uitleg (zonder het antwoord) en samen voordoen: bij het totaal telt Bliepo de stippen bovenaan, bij de som komt de tussenvraag "wat is 3 + 2?" (1 poging; daarna zegt Bliepo het), bij een nieuw totaal telt Bliepo de stippen. De les gaat door. Elk vervolg gaat vanzelf (15.27).
- **Splitsopdrachten (stap 10, 12, 14, 15):** het kind maakt 2 delen met de plus en de min en tikt het vinkje (bij 5 wordt vanzelf nagekeken, na 0,7 s rust; draaiboek stap 10). 1e fout = Bliepo rekent de gekozen delen voor ("Je hebt 3 en 3. Samen is dat 6. Dat is te weinig.") of zegt dat een deel leeg is; de delen blijven staan; het kind mag verder. 2e fout = uitleg, en Bliepo zet het linkerdeel (draaiboek §3 F.6): het kind zoekt het andere deel, de stippen tellen mee, Bliepo zegt wat er gemaakt is. "Al gevonden" en (bij 7 en 8 en 10) "omgedraaid" tellen NIET als fout: Bliepo zegt het en het kind probeert opnieuw (draaiboek §3 F.4 en F.5). Bij 5 telt omgedraaid wel goed (§3 F.5).
- **Hulphandje (15.19):** komt vanzelf na ± 6 s stilte bij een opdracht, wijst naar een plus; nooit bij een keuzevraag, nooit een knop. **Heel snel antwoorden:** Bliepo zegt niets (draaiboek §3 B.7, F.8).
- **Verklappen (15.17):** het script controleert dat er na de eerste zin en de hint minstens 2 keuzes overblijven.
- Elke fout wordt met de naam van de denkfout bewaard (tabel \`les_uitkomsten\`, kolom denkfout; \`onduidelijk\` wordt \`onbekend\`), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`deel-ipv-totaal\` | koos een deel in plaats van het totaal | draaiboek §3 B.2 (gezien, R1) |
| \`andere-getallen-gekozen\` | koos een som met getallen die niet in de machine staan | eigen invulling (draaiboek §3 C: "4 + 2 = 6") |
| \`deel-en-totaal-opgeteld\` | gebruikte het totaal als een van de delen | eigen invulling |
| \`cijfers-naast-elkaar\` | zette de cijfers naast elkaar (3 en 2 werd 32) | draaiboek §3 C.2 (gezien, P-8nov) |
| \`som-te-weinig\` | rekende de som 1 te weinig uit | draaiboek §3 C.2 (gezien, R1: 4) |
| \`totaal-een-te-veel\` / \`totaal-een-te-weinig\` | telde 1 stip te veel of te weinig | draaiboek §3 B.2 (gezien, R1: 8 bij 7) |
| \`delen-samen-te-weinig\` / \`delen-samen-te-veel\` | de 2 delen samen zijn te weinig of te veel | draaiboek §3 F.2 (gezien, 6× R1) |
| \`een-deel-leeg\` | liet een deel leeg (of 0) | draaiboek §3 F.3 (gezien, R1) |
| \`onduidelijk\` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

## 2. Per vraag: elk fout antwoord (${rijen.length} rijen)

${tabel(rijen)}

## 3. Goed

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en de som of het aantal ("Dat werkt: 4 + 3 = 7." / "Ja, 4 en 3 maken samen 7." / "Je splitste 7 in 4 en 3." / "Precies: 7 is 4 en 3." / "Ik heb het nagekeken: 4 + 3 = 7."). Een gevonden som komt in het lijstje rechtsboven (draaiboek §3 F.1).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); vanzelf door.
- **Bij 5 omgedraaid (3 + 2 wordt 2 + 3):** "Je draaide de delen om. Dat mag." (draaiboek §3 F.5).
`;
schrijf("FOUTTABEL-squla-splits-splitsen1-1-gouden-extra.md", tekst);
