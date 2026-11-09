# FOUTTABEL — gouden les Tellen (squla-tellen-fruit-1-gouden, "Fruit tellen")

Gemaakt op 9 november 2026 **uit de code** met `npx tsx scripts/fouttabel-tellen-gouden.ts`; pas zinnen aan in `src/components/les/lessen/squla-tellen-gouden-zinnen.ts` en draai het script opnieuw. De inhoud (15 vragen, getallen, 3 keuzes per vraag) is die van squla-tellen-fruit-1 en blijft gelijk (BOUWREGELS 15.22).

**EIGEN INVULLING, NIET VAN SYNTHESIS.** Alle vragen gaan over 11 t/m 17; het draaiboek Tellen (Color Count) gaat tot 10. De vragen krijgen hetzelfde skelet als Color Count; de hints en deze fouttabel zijn eigen invulling (15.22 punt 5). Wel volgt de soort reactie het draaiboek (§3 A, §7): Bliepo noemt het gekozen getal en de richting (te weinig / te veel) en vraagt opnieuw te tellen.

In de les staan de getallen in de kleur van het fruit (appel rood, peer groen, pruim paars); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de vraag en de knoppen even weg, het fruit blijft staan zonder nummers. Bliepo zegt de eerste zin; daarna komen de 3 knoppen meteen terug met de hint (geen pijl, zoals het draaiboek).
- **Richting en verklappen (15.17):** zou "te weinig" of "te veel" bij deze 3 keuzes maar 1 keuze overlaten, dan noemt Bliepo de richting niet (alleen "dichtbij") en wijst hij naar de manier van tellen. Zo verklapt de hint het antwoord niet.
- **2e fout:** een korte uitleg bij de denkfout (§3, zonder het antwoord), "Kom, we tellen ze samen." (pijl). Dan tikt het kind elk stuk fruit aan; er komt een nummer bij en Bliepo zegt het getal. Het laatste getal is het aantal ("Samen telden we 12 appels."). Pijl, de les gaat door. Na ± 6 s stilte komt vanzelf het hulphandje.
- **Twee keer dezelfde denkfout** bij dezelfde vraag: Bliepo zegt "weer" en legt het anders uit (§3, laatste kolom). Alleen als hij de 1e keer al zei wat er mis was; na alleen "… is dichtbij." komt de gewone uitleg.
- **Hints wisselen:** per soort denkfout zijn er 3 hints; welke komt, hangt af van het vraagnummer.
- **Niet duidelijk (`onduidelijk`):** komt in deze les niet voor (elk fout antwoord is kleiner of groter dan het goede); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- Elke fout wordt met de naam van de denkfout bewaard (tabel `les_uitkomsten`, kolom denkfout; `onduidelijk` wordt `onbekend`), elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| `te-weinig` | telde er te weinig (sloeg er een over) | draaiboek §7 (gezien bij Synthesis) |
| `te-veel` | telde er te veel (telde er een 2 keer) | draaiboek §7 (gezien bij Synthesis) |
| `alleen-volle-rijen` | telde alleen de volle rijen van 5 (bijvoorbeeld 10 bij 12), niet de rij die niet vol is | eigen invulling, lijkt op `alleen-tiental` uit draaiboek §7 (The Next 10) |
| `onduidelijk` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

Niet gebruikt uit draaiboek §7: `een-kleur-vergeten`, `verkeerde-kleur`, `lijst-kleur-mis`, `niet-alles-gemaakt` (deze les heeft maar 1 soort fruit per vraag en geen maak-opdracht), `cijfers-naast-elkaar` en `cijfers-omgedraaid` (geen keuze als 101 of 31 bij Squla), `dubbel-geteld` en `getal-overgeslagen` (niet los te zien van te-veel en te-weinig; draaiboek §7 "Let op").

## 2. Per vraag: elk fout antwoord (30 rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
| 1. 12 appels (keuzes 10 / 11 / 12) | 10 | `alleen-volle-rijen` — telde alleen de volle rijen van 5, niet de rij die niet vol is | Je telde alleen de volle rijen. Dat zijn er 10. | Kijk ook naar de laatste rij en tel opnieuw. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 1. 12 appels (keuzes 10 / 11 / 12) | 11 | `te-weinig` — telde er te weinig (sloeg er een over) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | 11 is dichtbij. | Tel nog eens, rij voor rij. Wijs elke appel aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 2. 11 peren (keuzes 11 / 12 / 13) | 12 | `te-veel` — telde er te veel (telde er een 2 keer) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | 12 is dichtbij. | Tel nog eens rustig. Wijs elke peer aan en zeg het getal. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 2. 11 peren (keuzes 11 / 12 / 13) | 13 | `te-veel` — telde er te veel (telde er een 2 keer) | 13 is dichtbij, maar dat zijn er te veel. | Begin linksboven en tel rustig. Wijs elke peer 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 3. 13 pruimen (keuzes 12 / 13 / 14) | 12 | `te-weinig` — telde er te weinig (sloeg er een over) | 12 is dichtbij, maar je hebt ze nog niet allemaal geteld. | Tel nog eens. Wijs elke pruim aan en tel rustig mee. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 3. 13 pruimen (keuzes 12 / 13 / 14) | 14 | `te-veel` — telde er te veel (telde er een 2 keer) | 14 is dichtbij, maar dat zijn er te veel. | Tel nog eens, rij voor rij. Wijs elke pruim 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 4. 14 appels (keuzes 14 / 15 / 16) | 15 | `te-veel` — telde er te veel (telde er een 2 keer) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | 15 is dichtbij. | Tel nog eens, rij voor rij. Wijs elke appel aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 4. 14 appels (keuzes 14 / 15 / 16) | 16 | `te-veel` — telde er te veel (telde er een 2 keer) | 16 is dichtbij, maar dat zijn er te veel. | Tel opnieuw. Elke appel tel je maar 1 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 5. 12 peren (keuzes 11 / 12 / 13) | 11 | `te-weinig` — telde er te weinig (sloeg er een over) | 11 is dichtbij, maar je hebt ze nog niet allemaal geteld. | Begin linksboven en tel opnieuw. Wijs elke peer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 5. 12 peren (keuzes 11 / 12 / 13) | 13 | `te-veel` — telde er te veel (telde er een 2 keer) | 13 is dichtbij, maar dat zijn er te veel. | Begin linksboven en tel rustig. Wijs elke peer 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 6. 15 pruimen (keuzes 13 / 14 / 15) | 13 | `te-weinig` — telde er te weinig (sloeg er een over) | 13 is dichtbij, maar je hebt ze nog niet allemaal geteld. | Tel nog eens. Wijs elke pruim aan en tel rustig mee. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 6. 15 pruimen (keuzes 13 / 14 / 15) | 14 | `te-weinig` — telde er te weinig (sloeg er een over) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | 14 is dichtbij. | Begin linksboven en tel opnieuw. Wijs elke pruim aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 7. 16 appels (keuzes 15 / 16 / 17) | 15 | `alleen-volle-rijen` — telde alleen de volle rijen van 5, niet de rij die niet vol is | Je telde alleen de volle rijen. Dat zijn er 15. | Kijk ook naar de laatste rij en tel opnieuw. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 7. 16 appels (keuzes 15 / 16 / 17) | 17 | `te-veel` — telde er te veel (telde er een 2 keer) | 17 is dichtbij, maar dat zijn er te veel. | Tel opnieuw. Elke appel tel je maar 1 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 8. 13 peren (keuzes 13 / 14 / 15) | 14 | `te-veel` — telde er te veel (telde er een 2 keer) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | 14 is dichtbij. | Tel nog eens rustig. Wijs elke peer aan en zeg het getal. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 8. 13 peren (keuzes 13 / 14 / 15) | 15 | `te-veel` — telde er te veel (telde er een 2 keer) | 15 is dichtbij, maar dat zijn er te veel. | Begin linksboven en tel rustig. Wijs elke peer 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 9. 17 pruimen (keuzes 15 / 16 / 17) | 15 | `alleen-volle-rijen` — telde alleen de volle rijen van 5, niet de rij die niet vol is | Je telde alleen de volle rijen. Dat zijn er 15. | Kijk ook naar de laatste rij en tel opnieuw. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 9. 17 pruimen (keuzes 15 / 16 / 17) | 16 | `te-weinig` — telde er te weinig (sloeg er een over) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | 16 is dichtbij. | Begin linksboven en tel opnieuw. Wijs elke pruim aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 10. 14 peren (keuzes 13 / 14 / 15) | 13 | `te-weinig` — telde er te weinig (sloeg er een over) | 13 is dichtbij, maar je hebt ze nog niet allemaal geteld. | Tel nog eens, rij voor rij. Sla er geen peer over. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 10. 14 peren (keuzes 13 / 14 / 15) | 15 | `te-veel` — telde er te veel (telde er een 2 keer) | 15 is dichtbij, maar dat zijn er te veel. | Tel opnieuw. Elke peer tel je maar 1 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 11. 13 appels (keuzes 12 / 13 / 14) | 12 | `te-weinig` — telde er te weinig (sloeg er een over) | 12 is dichtbij, maar je hebt ze nog niet allemaal geteld. | Begin linksboven en tel opnieuw. Wijs elke appel aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 11. 13 appels (keuzes 12 / 13 / 14) | 14 | `te-veel` — telde er te veel (telde er een 2 keer) | 14 is dichtbij, maar dat zijn er te veel. | Begin linksboven en tel rustig. Wijs elke appel 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 12. 16 pruimen (keuzes 16 / 17 / 18) | 17 | `te-veel` — telde er te veel (telde er een 2 keer) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | 17 is dichtbij. | Begin linksboven en tel opnieuw. Wijs elke pruim aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 12. 16 pruimen (keuzes 16 / 17 / 18) | 18 | `te-veel` — telde er te veel (telde er een 2 keer) | 18 is dichtbij, maar dat zijn er te veel. | Tel nog eens, rij voor rij. Wijs elke pruim 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 13. 15 peren (keuzes 14 / 15 / 16) | 14 | `te-weinig` — telde er te weinig (sloeg er een over) | 14 is dichtbij, maar je hebt ze nog niet allemaal geteld. | Tel nog eens, rij voor rij. Sla er geen peer over. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 13. 15 peren (keuzes 14 / 15 / 16) | 16 | `te-veel` — telde er te veel (telde er een 2 keer) | 16 is dichtbij, maar dat zijn er te veel. | Tel opnieuw. Elke peer tel je maar 1 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 14. 17 appels (keuzes 16 / 17 / 18) | 16 | `te-weinig` — telde er te weinig (sloeg er een over) | 16 is dichtbij, maar je hebt ze nog niet allemaal geteld. | Begin linksboven en tel opnieuw. Wijs elke appel aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 14. 17 appels (keuzes 16 / 17 / 18) | 18 | `te-veel` — telde er te veel (telde er een 2 keer) | 18 is dichtbij, maar dat zijn er te veel. | Begin linksboven en tel rustig. Wijs elke appel 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 15. 11 pruimen (keuzes 9 / 10 / 11) | 9 | `te-weinig` — telde er te weinig (sloeg er een over) | 9 is dichtbij, maar je hebt ze nog niet allemaal geteld. | Tel nog eens. Wijs elke pruim aan en tel rustig mee. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 15. 11 pruimen (keuzes 9 / 10 / 11) | 10 | `alleen-volle-rijen` — telde alleen de volle rijen van 5, niet de rij die niet vol is | Je telde alleen de volle rijen. Dat zijn er 10. | Kijk ook naar de laatste rij en tel opnieuw. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |

## 3. Uitleg na de 2e fout (zonder het antwoord), en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd: "Kom, we tellen ze samen." en het samen tellen (nu pas het aantal in beeld).

| Vraag | 2e fout (denkfout) | Uitleg bij de 2e fout (eerste zin + uitleg) | Als de 1e fout (het andere foute antwoord) dezelfde denkfout was |
|---|---|---|---|
| 1. 12 appels | 10 (`alleen-volle-rijen`) | Je telde alleen de volle rijen. Dat zijn er 10. De rij die niet vol is, telt ook mee. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 1. 12 appels | 11 (`te-weinig`) | 11 is dichtbij. Je hebt 1 appel niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 2. 11 peren | 12 (`te-veel`) | 12 is dichtbij. Je telde 1 peer te veel. | Je telde er weer te veel. Geef elke peer 1 nummer. Dan tel je niets 2 keer. |
| 2. 11 peren | 13 (`te-veel`) | 13 is dichtbij, maar dat zijn er te veel. Je telde een paar peren te veel. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 3. 13 pruimen | 12 (`te-weinig`) | 12 is dichtbij, maar je hebt ze nog niet allemaal geteld. Je hebt 1 pruim niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 3. 13 pruimen | 14 (`te-veel`) | 14 is dichtbij, maar dat zijn er te veel. Je telde 1 pruim te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 4. 14 appels | 15 (`te-veel`) | 15 is dichtbij. Je telde 1 appel te veel. | Je telde er weer te veel. Geef elke appel 1 nummer. Dan tel je niets 2 keer. |
| 4. 14 appels | 16 (`te-veel`) | 16 is dichtbij, maar dat zijn er te veel. Je telde een paar appels te veel. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 5. 12 peren | 11 (`te-weinig`) | 11 is dichtbij, maar je hebt ze nog niet allemaal geteld. Je hebt 1 peer niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 5. 12 peren | 13 (`te-veel`) | 13 is dichtbij, maar dat zijn er te veel. Je telde 1 peer te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 6. 15 pruimen | 13 (`te-weinig`) | 13 is dichtbij, maar je hebt ze nog niet allemaal geteld. Je hebt een paar pruimen niet geteld. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 6. 15 pruimen | 14 (`te-weinig`) | 14 is dichtbij. Je hebt 1 pruim niet geteld. | Je telde er weer te weinig. Geef elke pruim 1 nummer. Dan sla je er geen over. |
| 7. 16 appels | 15 (`alleen-volle-rijen`) | Je telde alleen de volle rijen. Dat zijn er 15. De rij die niet vol is, telt ook mee. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 7. 16 appels | 17 (`te-veel`) | 17 is dichtbij, maar dat zijn er te veel. Je telde 1 appel te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 8. 13 peren | 14 (`te-veel`) | 14 is dichtbij. Je telde 1 peer te veel. | Je telde er weer te veel. Geef elke peer 1 nummer. Dan tel je niets 2 keer. |
| 8. 13 peren | 15 (`te-veel`) | 15 is dichtbij, maar dat zijn er te veel. Je telde een paar peren te veel. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 9. 17 pruimen | 15 (`alleen-volle-rijen`) | Je telde alleen de volle rijen. Dat zijn er 15. De rij die niet vol is, telt ook mee. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 9. 17 pruimen | 16 (`te-weinig`) | 16 is dichtbij. Je hebt 1 pruim niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 10. 14 peren | 13 (`te-weinig`) | 13 is dichtbij, maar je hebt ze nog niet allemaal geteld. Je hebt 1 peer niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 10. 14 peren | 15 (`te-veel`) | 15 is dichtbij, maar dat zijn er te veel. Je telde 1 peer te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 11. 13 appels | 12 (`te-weinig`) | 12 is dichtbij, maar je hebt ze nog niet allemaal geteld. Je hebt 1 appel niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 11. 13 appels | 14 (`te-veel`) | 14 is dichtbij, maar dat zijn er te veel. Je telde 1 appel te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 12. 16 pruimen | 17 (`te-veel`) | 17 is dichtbij. Je telde 1 pruim te veel. | Je telde er weer te veel. Geef elke pruim 1 nummer. Dan tel je niets 2 keer. |
| 12. 16 pruimen | 18 (`te-veel`) | 18 is dichtbij, maar dat zijn er te veel. Je telde een paar pruimen te veel. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 13. 15 peren | 14 (`te-weinig`) | 14 is dichtbij, maar je hebt ze nog niet allemaal geteld. Je hebt 1 peer niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 13. 15 peren | 16 (`te-veel`) | 16 is dichtbij, maar dat zijn er te veel. Je telde 1 peer te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 14. 17 appels | 16 (`te-weinig`) | 16 is dichtbij, maar je hebt ze nog niet allemaal geteld. Je hebt 1 appel niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 14. 17 appels | 18 (`te-veel`) | 18 is dichtbij, maar dat zijn er te veel. Je telde 1 appel te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 15. 11 pruimen | 9 (`te-weinig`) | 9 is dichtbij, maar je hebt ze nog niet allemaal geteld. Je hebt een paar pruimen niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 15. 11 pruimen | 10 (`alleen-volle-rijen`) | Je telde alleen de volle rijen. Dat zijn er 10. De rij die niet vol is, telt ook mee. | — (1e fout was een andere denkfout: dan de uitleg links) |

## 4. Goed

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en het aantal (§4 Tellen: "Ja, er zijn er 12." / "Ja, je telde ze allemaal: 12." / "Het zijn er 12." / "Je telde er 12." / "Ik heb ze nagekeken: het zijn er 12."), samen als 1 uiting. Begint de lofzin met "Ja", dan komt een telzin zonder "Ja". De robotzin "Ik heb ze nagekeken …" hooguit 1 keer per les. De nummers 1 t/m 12 staan tegelijk bij het fruit. Wacht op de pijl.
- **Eerste vraag in één keer goed:** lofzin, "Laten we ze samen natellen." (pijl), Bliepo telt hardop 1 t/m 12, "Zie je? Het zijn er 12. Je had het precies goed." (pijl).
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); de nummers staan erbij; pijl.
- **Heel snel:** Bliepo zegt niets over snel (BOUWREGELS 6.10).
- **Hetzelfde foute getal 2 keer:** de eerste zin wordt "Je koos weer 11." (niet 2 keer dezelfde zin).
- **Verklapcontrole:** het script stopt met een foutmelding als een hint zonder richting toch een richting geeft, of als er na eerste zin + hint maar 1 keuze logisch overblijft (open: vraag 15, keuze 10, KEUZES Ronde 20 vraag 2).
