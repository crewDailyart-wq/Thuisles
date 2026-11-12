/**
 * Maakt FOUTTABEL-squla-tellen-fruit-1-gouden-extra.md uit de code (squla-tellen-extra-zinnen.ts), zodat de tabel altijd
 * klopt met de les.
 *   npx tsx scripts/fouttabel-tellen-extra-gouden.ts
 * Schrijft alleen dat ene bestand. Raakt de database en de lessen niet aan.
 */
import { ALLE_FRUIT, LIJST, MAAK, SOORTVRAGEN, TWEE, aantalVan, foutenMaak, foutenSoort, foutenTwee, lijstFout } from "../src/components/les/lessen/squla-tellen-extra-zinnen";
import { controleer, schrijf, tabel, type Rij } from "./fouttabel-extra-hulp";

const rijen: Rij[] = [];
for (const v of SOORTVRAGEN)
  for (const [soort, f] of Object.entries(foutenSoort(v))) {
    const fr = ALLE_FRUIT.find((x) => x.soort === soort)!;
    rijen.push({ vraag: `Stap 5.${v.nr}: van welk fruit zie je er ${v.n}? (goed: ${v.goed.naam}; ${ALLE_FRUIT.map((x) => `${x.naam} ${aantalVan(v.rooster.cellen, x)}`).join(", ")})`, antwoord: fr.naam, f, opties: ALLE_FRUIT.map((x) => x.naam), goed: v.goed.naam });
  }
for (const [x, f] of Object.entries(foutenTwee())) rijen.push({ vraag: `Stap 6: peren en pruimen samen (goed: ${TWEE.n}; peren ${aantalVan(TWEE.rooster.cellen, TWEE.a)}, pruimen ${aantalVan(TWEE.rooster.cellen, TWEE.b)})`, antwoord: x, f, opties: TWEE.keuzes.map(String), goed: String(TWEE.n) });
for (const [c, f] of Object.entries(foutenMaak())) rijen.push({ vraag: `Stap 8: maak ${MAAK.n} peren (het kind maakte ${c})`, antwoord: `${c} gemaakt`, f });
const lijstStanden: number[][] = [[0, 0, 0], [4, 7, 9], [4, 6, 11], [5, 7, 9], [3, 8, 10], [0, 7, 10], [4, 7, 10].map((n, i) => (i === 2 ? 8 : n))];
for (const t of lijstStanden) rijen.push({ vraag: `Stap 9: het lijstje (4 appels, 7 peren, 10 pruimen)`, antwoord: `${t[0]} appels, ${t[1]} peren, ${t[2]} pruimen`, f: lijstFout(t) });
void LIJST;

/* Waarheidscontrole: de eerste zin noemt alleen soorten die kloppen of niet kloppen zoals het kind ze zette. */
const { beweringen } = controleer(rijen);
console.log(`Controle: ${rijen.length} rijen; ${beweringen} keuzes nagelopen (geen hint verklapt het antwoord); geen opdracht in de zinnen bij de 2e fout.`);

const tekst = `# FOUTTABEL — extra les Tellen (squla-tellen-fruit-1-gouden-extra, "Fruit tellen, extra")

Gemaakt op 12 november 2026 **uit de code** met \`npx tsx scripts/fouttabel-tellen-extra-gouden.ts\`; pas zinnen aan in \`src/components/les/lessen/squla-tellen-extra-zinnen.ts\` en draai het script opnieuw. Besluit Sara 12 november 2026 (20.3): de Synthesis-opdrachten uit het draaiboek Tellen die niet in de Squla-les zitten, als EXTRA les naast de gouden les.

**EIGEN INVULLING, NIET VAN SYNTHESIS.** Het draaiboek Tellen (Color Count, stap 5 t/m 9) benoemt de denkfout zelden (§6); Bliepo doet dat altijd (BOUWREGELS 15.9). De getallen zijn die van het draaiboek (tot en met 10): van welk fruit zie je er 8 en 7, peren en pruimen samen (3 + 4 = 7), maak 4 peren, het lijstje 4 + 7 + 10. Het fruit (appel rood, peer groen, pruim paars, citroen geel) komt in de plaats van de gekleurde vakjes; in de les staan de getallen in de kleur van het fruit, hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **Keuzevragen (stap 5 en 6):** 1e fout = scherm 1,5 s rood (geen fout-geluidje), Bliepo noemt wat het kind koos (en bij stap 5 hoeveel dat er zijn: de gekozen soort krijgt zijn nummers, de rest wordt dof; draaiboek §3 B.2); dan komen de knoppen terug met de hint. 2e fout = uitleg (zonder het antwoord), "Kom, we tellen samen.", het kind tikt elk stuk fruit van het goede fruit, Bliepo telt mee, het laatste getal is het aantal; de les gaat door. Elk vervolg gaat vanzelf (15.27).
- **Maken en het lijstje (stap 8 en 9):** het kind maakt het rooster en tikt het vinkje. 1e fout = Bliepo zegt wat er mis is (te veel of te weinig; bij het lijstje welke soort klopt en welke niet, draaiboek §3 C en D), dan komt de hint (het lijstje wordt opnieuw voorgelezen) en mag het kind verder tikken: de vakjes blijven staan. 2e fout = uitleg (bij het lijstje het precieze aantal van de eerste soort die niet klopt), Bliepo helpt: hij zet de rest klaar, het kind tikt de laatste vakjes en Bliepo telt mee.
- **Hulphandje (15.19):** komt vanzelf na ± 6 s stilte bij maken, het lijstje en samen tellen; nooit bij een keuzevraag, nooit een knop.
- **Richting en verklappen (15.17):** de hint wijst naar de plek waar het kind moet kijken en zegt het antwoord niet. Het script controleert dat er na de eerste zin en de hint minstens 2 keuzes overblijven (stap 6, kiezen 6: alleen "dichtbij"; zou de richting maar 1 keuze overlaten, dan noemt Bliepo hem niet).
- **Twee keer dezelfde denkfout** bij dezelfde vraag: Bliepo zegt "weer" en legt het anders uit (kolom "Als dezelfde denkfout nog eens komt"); alleen als hij de 1e keer al zei wat er mis was.
- **Heel snel antwoorden:** Bliepo zegt niets (draaiboek §3 A.7, BOUWREGELS 6.10). **Lang wachten bij een keuzevraag:** niets (draaiboek §4).
- Elke fout wordt met de naam van de denkfout bewaard (tabel \`les_uitkomsten\`, kolom denkfout; \`onduidelijk\` wordt \`onbekend\`), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| \`soort-een-te-veel\` | koos de soort met 1 meer dan gevraagd (telde er 1 te veel) | draaiboek §7 \`verkeerde-kleur\` / \`te-veel\` (afleider gezien, R3) |
| \`soort-een-te-weinig\` | koos de soort met 1 minder dan gevraagd (miste er 1) | draaiboek §7 \`verkeerde-kleur\` / \`te-weinig\` |
| \`een-soort-vergeten\` | telde maar 1 van de 2 soorten | draaiboek §7 \`een-kleur-vergeten\` (gezien, R1) |
| \`te-weinig-samen\` | telde er bij 2 soorten 1 te weinig | draaiboek §7 \`te-weinig\` |
| \`te-veel-gemaakt\` / \`te-weinig-gemaakt\` / \`nog-niets-gemaakt\` | maakte te veel, te weinig of nog niets | draaiboek §7 \`niet-alles-gemaakt\` / \`te-veel-gemaakt\` (gezien, P-8nov) |
| \`lijst-soort-mis\` | bij het lijstje klopt minstens 1 soort niet | draaiboek §7 \`lijst-kleur-mis\` (gezien, R1 en R3) |
| \`onduidelijk\` | niet duidelijk (een fout antwoord dat 2 of meer scheelt); geen reden verzonnen | BOUWREGELS 15.9 |

## 2. Per vraag: elk fout antwoord (${rijen.length} rijen)

${tabel(rijen)}

## 3. Goed

- **Goed in één keer (stap 5 en 6):** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en het aantal met de soort ("Klopt, er zijn er 8." / "Ja, je telde 8 peren." / "Het zijn 8 peren." / "8 peren, precies." / "Ik heb ze nagekeken: 8 peren."); alle nummers 1 t/m N verschijnen tegelijk bij dat fruit (leesvolgorde), de rest wordt dof (draaiboek §3 A.1 (a)).
- **Goed in één keer (stap 8 en 9):** lofzin en het aantal; bij het lijstje "Perfect, je vulde het hele rooster." (draaiboek §3 D.1).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); vanzelf door.
- **Telhulp (stap 5 en 6):** een tik op het fruit zet een zwart stipje, nog een tik haalt het weg; Bliepo zegt er niets bij (draaiboek §2 stap 5).
`;
schrijf("FOUTTABEL-squla-tellen-fruit-1-gouden-extra.md", tekst);
