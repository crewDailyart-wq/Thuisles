# FOUTTABEL — gouden les Rekenmix (squla-rekenmix-mix1-1-gouden, "Rekenmix 1")

Gemaakt op 11 november 2026, bijgewerkt op 18 november 2026 (Bliepo als warme juf: alle zinnen in varianten; oud naast nieuw in WIJZIGINGEN-ZINNEN-REKENMIX1.md), **uit de code** met `npx tsx scripts/fouttabel-rekenmix-gouden.ts`; pas zinnen aan in `src/components/les/lessen/squla-rekenmix-gouden-zinnen.ts` en draai het script opnieuw. De inhoud (15 vragen, dingen, aantallen, manier van liggen, 3 keuzes per vraag) is die van squla-rekenmix-mix1-1 en blijft gelijk (BOUWREGELS 15.22); het script vergelijkt dat met de oude les.

**Welke gouden les deze vragen volgen (BOUWREGELS 15.25):** alle 15 vragen zijn telvragen, dus ze volgen de **gouden les Tellen** (squla-tellen-fruit-1-gouden; draaiboek Tellen, Color Count). Zelfde verloop, zelfde zinnen (vraag, natellen, samen tellen, vangnet, lof met het aantal), zelfde soort reactie bij een fout (§3 A, §7): Bliepo noemt het gekozen getal en de richting (te weinig / te veel), of geen richting als die maar 1 keuze zou overlaten.

**Eigen invulling, niet van Synthesis (net als bij Tellen):** de hints, de uitleg en deze tabel. Anders dan bij Tellen: de dingen liggen hier soms **door elkaar**, soms **in rijen** en soms **2 aan 2**; de hint past bij wat het kind ziet ("rij voor rij" alleen bij rijen, "van links naar rechts" bij 2 aan 2, "van boven naar beneden" bij door elkaar). Sommige keuzes liggen 3 naast het goede getal (Squla): dan zegt Bliepo niet "dichtbij". En geen woord of getal 2 keer in 1 reactie (geleerd bij Rekentaal en Tijd).

In de les staan de getallen in de kleur van het ding (appel, bal, auto en bloem rood; potlood groen; knikker blauw; ster geel); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11), zoals de gouden les Tellen:**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de vraag en de knoppen even weg, de dingen blijven staan zonder nummers. Bliepo zegt de eerste zin (± 0,7 s na de zin gaat het vanzelf verder, 15.27); daarna komen de 3 knoppen terug met de hint en **de vraag erachter** ("Hoeveel ballen zie je?", "Hoeveel zijn het er dan?" of "Tik dan op het goede getal."; 15.37, F16). Eindigt de hint al met "tik op het getal", dan komt de vraag niet nog een keer.
- **Varianten (18 november 2026):** elke zin bestaat in varianten (§6). De les kiest willekeurig, maar nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer `nooit-dubbel.ts`). In §2 en §3 staat per fout antwoord 1 variant als voorbeeld; het script loopt ALLE varianten na.
- **2e fout:** de eerste zin en een korte uitleg bij de denkfout (geen opdracht, zonder het antwoord), "Kom, we tellen ze samen." (of een van de 4 andere versies). Dan tikt het kind elk ding aan (een opdracht: geen pijl); er komt een nummer bij en Bliepo zegt het getal. Het laatste getal is het aantal; de les gaat vanzelf door. Na ± 6 s stilte komt vanzelf het hulphandje; na 20 s zonder tik telt Bliepo de rest zelf ("Kijk, ik tel de rest. …").
- **Dezelfde denkfout 2 keer** (en Bliepo noemde de 1e keer de richting): "Je telde er weer …" (of een variant) en een andere uitleg (laatste kolom van §3). **Hetzelfde foute getal 2 keer:** "Je koos weer 9." (of "Je tikte weer op 9." / "Weer 9, zie ik.") in plaats van dezelfde eerste zin. **Een ander getal:** een eerste zin zonder het woord dat Bliepo bij deze vraag al zei (nooit 2 keer "dichtbij").
- **Niet duidelijk (`onduidelijk`):** komt in deze les niet voor (elk fout antwoord is kleiner of groter dan het goede).
- Elke fout wordt met de naam van de denkfout bewaard; elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

## 1. Denkfouten (zelfde namen als de gouden les Tellen)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| `te-weinig` | telde er te weinig (sloeg er een over) | draaiboek Tellen §7 |
| `te-veel` | telde er te veel (telde er een 2 keer) | draaiboek Tellen §7 |
| `onduidelijk` | niet duidelijk; geen reden verzonnen | BOUWREGELS 15.9 |

Niet gebruikt: `alleen-volle-rijen` van de gouden les Tellen (in deze les is geen fout antwoord gelijk aan alleen de volle rijen).

## 2. Per vraag: elk fout antwoord (30 rijen)

| Vraag (goed antwoord) | Fout antwoord | Denkfout | Bliepo's eerste zin | Hint | Wat op het scherm |
|---|---|---|---|---|---|
| 1. 7 appels, door elkaar (keuzes 8 / 6 / 7) | 6 | `te-weinig` — telde er te weinig (sloeg er een over) | Je koos 6. Je hebt ze nog niet allemaal geteld. | Tel ze nog eens rustig. Wijs elke appel aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 1. 7 appels, door elkaar (keuzes 8 / 6 / 7) | 8 | `te-veel` — telde er te veel (telde er een 2 keer) | 8? Dat zijn er iets te veel. | Tel ze opnieuw. Wijs elke appel maar 1 keer aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 2. 10 ballen, in rijen (4+4+2) (keuzes 10 / 11 / 9) | 9 | `te-weinig` — telde er te weinig (sloeg er een over) | Bijna! 9 is nog iets te weinig. | Begin bovenaan en tel opnieuw. Wijs elke bal aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 2. 10 ballen, in rijen (4+4+2) (keuzes 10 / 11 / 9) | 11 | `te-veel` — telde er te veel (telde er een 2 keer) | Bijna! 11 is iets te veel. | Begin bovenaan en tel rustig. Elke bal telt 1 keer mee. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 3. 6 potloden, 2 aan 2 (keuzes 5 / 6 / 7) | 5 | `te-weinig` — telde er te weinig (sloeg er een over) | 5? Ik zie er nog meer. | Probeer het nog eens. Tel elk potlood mee, ook de laatste. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 3. 6 potloden, 2 aan 2 (keuzes 5 / 6 / 7) | 7 | `te-veel` — telde er te veel (telde er een 2 keer) | Je zit er dichtbij, maar 7 is te veel. | Probeer het nog eens. Tel geen potlood 2 keer. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 4. 9 auto's, in rijen (3+3+3) (keuzes 9 / 8 / 10) | 8 | `te-weinig` — telde er te weinig (sloeg er een over) | Je zit er dichtbij met 8. Je hebt ze nog niet allemaal geteld. | Tel nog eens, rij voor rij. Sla geen auto over. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 4. 9 auto's, in rijen (3+3+3) (keuzes 9 / 8 / 10) | 10 | `te-veel` — telde er te veel (telde er een 2 keer) | Je tikte op 10. Zo veel liggen er niet. | Tel nog eens, rij voor rij. Elke auto tel je maar 1 keer. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 5. 12 bloemen, in rijen (5+5+2) (keuzes 11 / 12 / 13) | 11 | `te-weinig` — telde er te weinig (sloeg er een over) | 11 bloemen? Je hebt ze nog niet allemaal geteld. | Tel ze nog eens rustig. Wijs elke bloem aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 5. 12 bloemen, in rijen (5+5+2) (keuzes 11 / 12 / 13) | 13 | `te-veel` — telde er te veel (telde er een 2 keer) | 13 bloemen? Ik denk dat je er te veel hebt geteld. | Tel ze opnieuw. Wijs elke bloem maar 1 keer aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 6. 5 knikkers, door elkaar (keuzes 5 / 4 / 6) | 4 | `te-weinig` — telde er te weinig (sloeg er een over) | Je koos 4. Er liggen er nog meer. | Tel ze opnieuw, van boven naar beneden. Wijs elke knikker aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 6. 5 knikkers, door elkaar (keuzes 5 / 4 / 6) | 6 | `te-veel` — telde er te veel (telde er een 2 keer) | Je koos 6. Dat zijn er iets te veel. | Tel ze nog eens rustig. Elke knikker telt 1 keer mee. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 7. 10 ballen, 2 aan 2 (keuzes 10 / 11 / 7) | 7 | `te-weinig` — telde er te weinig (sloeg er een over) | 7 ballen? Je hebt ze nog niet allemaal geteld. | Probeer het nog eens. Tel elke bal mee, ook de laatste. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 7. 10 ballen, 2 aan 2 (keuzes 10 / 11 / 7) | 11 | `te-veel` — telde er te veel (telde er een 2 keer) | 11? Dat zijn er iets te veel. | Probeer het nog eens. Tel geen bal 2 keer. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 8. 11 appels, in rijen (4+4+3) (keuzes 12 / 11 / 10) | 10 | `te-weinig` — telde er te weinig (sloeg er een over) | Bijna! 10 is nog iets te weinig. | Tel nog eens, rij voor rij. Sla geen appel over. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 8. 11 appels, in rijen (4+4+3) (keuzes 12 / 11 / 10) | 12 | `te-veel` — telde er te veel (telde er een 2 keer) | Bijna! 12 is iets te veel. | Tel nog eens, rij voor rij. Elke appel tel je maar 1 keer. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 9. 8 auto's, door elkaar (keuzes 7 / 8 / 9) | 7 | `te-weinig` — telde er te weinig (sloeg er een over) | 7? Ik zie er nog meer. | Tel ze nog eens rustig. Wijs elke auto aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 9. 8 auto's, door elkaar (keuzes 7 / 8 / 9) | 9 | `te-veel` — telde er te veel (telde er een 2 keer) | Je zit er dichtbij, maar 9 is te veel. | Tel ze opnieuw. Wijs elke auto maar 1 keer aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 10. 8 potloden, in rijen (4+4) (keuzes 8 / 9 / 5) | 5 | `te-weinig` — telde er te weinig (sloeg er een over) | 5? Ik zie er nog meer. | Begin bovenaan en tel opnieuw. Wijs elk potlood aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 10. 8 potloden, in rijen (4+4) (keuzes 8 / 9 / 5) | 9 | `te-veel` — telde er te veel (telde er een 2 keer) | Je tikte op 9. Zo veel liggen er niet. | Begin bovenaan en tel rustig. Elk potlood telt 1 keer mee. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 11. 12 bloemen, 2 aan 2 (keuzes 12 / 11 / 13) | 11 | `te-weinig` — telde er te weinig (sloeg er een over) | 11 bloemen? Je hebt ze nog niet allemaal geteld. | Probeer het nog eens. Tel elke bloem mee, ook de laatste. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 11. 12 bloemen, 2 aan 2 (keuzes 12 / 11 / 13) | 13 | `te-veel` — telde er te veel (telde er een 2 keer) | 13 bloemen? Ik denk dat je er te veel hebt geteld. | Probeer het nog eens. Tel geen bloem 2 keer. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 12. 11 sterren, in rijen (3+3+3+2) (keuzes 11 / 10 / 12) | 10 | `te-weinig` — telde er te weinig (sloeg er een over) | Je koos 10. Er liggen er nog meer. | Tel nog eens, rij voor rij. Sla geen ster over. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 12. 11 sterren, in rijen (3+3+3+2) (keuzes 11 / 10 / 12) | 12 | `te-veel` — telde er te veel (telde er een 2 keer) | Je koos 12. Dat zijn er iets te veel. | Tel nog eens, rij voor rij. Elke ster tel je maar 1 keer. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 13. 9 appels, door elkaar (keuzes 9 / 8 / 10) | 8 | `te-weinig` — telde er te weinig (sloeg er een over) | Je koos 8. Je hebt ze nog niet allemaal geteld. | Tel ze nog eens rustig. Wijs elke appel aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 13. 9 appels, door elkaar (keuzes 9 / 8 / 10) | 10 | `te-veel` — telde er te veel (telde er een 2 keer) | 10? Dat zijn er iets te veel. | Tel ze opnieuw. Wijs elke appel maar 1 keer aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 14. 10 ballen, in rijen (5+5) (keuzes 10 / 9 / 7) | 7 | `te-weinig` — telde er te weinig (sloeg er een over) | 7? Ik zie er nog meer. | Begin bovenaan en tel opnieuw. Wijs elke bal aan. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 14. 10 ballen, in rijen (5+5) (keuzes 10 / 9 / 7) | 9 | `te-weinig` — telde er te weinig (sloeg er een over) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | Je tikte op 9. Het scheelt maar een klein beetje. | Probeer het nog eens. Tel de ballen en tik op het getal. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 15. 8 auto's, 2 aan 2 (keuzes 8 / 7 / 9) | 7 | `te-weinig` — telde er te weinig (sloeg er een over) | 7? Ik zie er nog meer. | Probeer het nog eens. Tel elke auto mee, ook de laatste. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 15. 8 auto's, 2 aan 2 (keuzes 8 / 7 / 9) | 9 | `te-veel` — telde er te veel (telde er een 2 keer) | Je zit er dichtbij, maar 9 is te veel. | Probeer het nog eens. Tel geen auto 2 keer. | vraag en knoppen even weg; de dingen blijven staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |

## 3. Uitleg na de 2e fout, en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd "Kom, we tellen ze samen." (of een andere versie) en het samen tellen (nu pas het aantal in beeld).

| Vraag | 2e fout (denkfout) | Eerste zin + uitleg bij de 2e fout | Als de 1e fout (het andere foute antwoord) dezelfde denkfout was |
|---|---|---|---|
| 1. 7 appels | 6 (`te-weinig`) | Bijna! 6 is nog iets te weinig. Je hebt 1 appel overgeslagen. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 1. 7 appels | 8 (`te-veel`) | Bijna! 8 is iets te veel. Er is 1 appel 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 2. 10 ballen | 9 (`te-weinig`) | 9? Ik zie er nog meer. Je hebt 1 bal niet geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 2. 10 ballen | 11 (`te-veel`) | Je zit er dichtbij, maar 11 is te veel. Je telde 1 bal te veel. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 3. 6 potloden | 5 (`te-weinig`) | Je zit er dichtbij met 5. Je hebt ze nog niet allemaal geteld. Er mist nog 1 potlood. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 3. 6 potloden | 7 (`te-veel`) | Je tikte op 7. Zo veel liggen er niet. Je hebt 1 potlood 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 4. 9 auto's | 8 (`te-weinig`) | 8 auto's? Je hebt ze nog niet allemaal geteld. Er ligt nog 1 auto meer. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 4. 9 auto's | 10 (`te-veel`) | 10 auto's? Ik denk dat je er te veel hebt geteld. Er is 1 auto 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 5. 12 bloemen | 11 (`te-weinig`) | Je koos 11. Er liggen er nog meer. Je hebt 1 bloem overgeslagen. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 5. 12 bloemen | 13 (`te-veel`) | Je koos 13. Dat zijn er iets te veel. Je telde 1 bloem te veel. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 6. 5 knikkers | 4 (`te-weinig`) | Je koos 4. Je hebt ze nog niet allemaal geteld. Je hebt 1 knikker niet geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 6. 5 knikkers | 6 (`te-veel`) | 6? Dat zijn er iets te veel. Je hebt 1 knikker 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 7. 10 ballen | 7 (`te-weinig`) | Je koos 7. Er liggen er nog meer. Er missen nog een paar ballen. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 7. 10 ballen | 11 (`te-veel`) | Bijna! 11 is iets te veel. Er is 1 bal 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 8. 11 appels | 10 (`te-weinig`) | 10? Ik zie er nog meer. Er ligt nog 1 appel meer. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 8. 11 appels | 12 (`te-veel`) | Je zit er dichtbij, maar 12 is te veel. Je telde 1 appel te veel. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 9. 8 auto's | 7 (`te-weinig`) | Je zit er dichtbij met 7. Je hebt ze nog niet allemaal geteld. Je hebt 1 auto overgeslagen. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 9. 8 auto's | 9 (`te-veel`) | Je tikte op 9. Zo veel liggen er niet. Je hebt 1 auto 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 10. 8 potloden | 5 (`te-weinig`) | 5 potloden? Je hebt ze nog niet allemaal geteld. Je hebt een paar potloden niet geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 10. 8 potloden | 9 (`te-veel`) | 9 potloden? Ik denk dat je er te veel hebt geteld. Er is 1 potlood 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 11. 12 bloemen | 11 (`te-weinig`) | Je koos 11. Er liggen er nog meer. Er mist nog 1 bloem. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 11. 12 bloemen | 13 (`te-veel`) | Je koos 13. Dat zijn er iets te veel. Je telde 1 bloem te veel. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 12. 11 sterren | 10 (`te-weinig`) | Je koos 10. Je hebt ze nog niet allemaal geteld. Er ligt nog 1 ster meer. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 12. 11 sterren | 12 (`te-veel`) | 12? Dat zijn er iets te veel. Je hebt 1 ster 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 13. 9 appels | 8 (`te-weinig`) | Bijna! 8 is nog iets te weinig. Je hebt 1 appel overgeslagen. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 13. 9 appels | 10 (`te-veel`) | Bijna! 10 is iets te veel. Er is 1 appel 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 14. 10 ballen | 7 (`te-weinig`) | 7 ballen? Je hebt ze nog niet allemaal geteld. Je hebt een paar ballen niet geteld. | — (1e keer zei Bliepo alleen dat het dichtbij was: dan de uitleg links) |
| 14. 10 ballen | 9 (`te-weinig`) | Je koos 9. Je zit er dichtbij. Je hebt 1 bal niet geteld. | Weer iets te weinig, zie ik. Elke bal krijgt 1 nummer. Dan sla je er geen over. |
| 15. 8 auto's | 7 (`te-weinig`) | Je zit er dichtbij met 7. Je hebt ze nog niet allemaal geteld. Er mist nog 1 auto. | — (1e keer was een andere denkfout: dan de uitleg links) |
| 15. 8 auto's | 9 (`te-veel`) | Je tikte op 9. Zo veel liggen er niet. Je hebt 1 auto 2 keer geteld. | — (1e keer was een andere denkfout: dan de uitleg links) |

## 4. Goed (zoals de gouden les Tellen)

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje en het aantal ("Ja, er zijn er 7." / "Ja, je hebt ze allemaal geteld: 7." / "Het zijn er 7." / "Je hebt er 7 geteld." / "Inderdaad, je telde tot 7." / "7 appels, precies!" / "Precies, 7 appels." / "Dat klopt, er zijn 7 appels."), samen als 1 uiting; de nummers 1 t/m n staan tegelijk bij de dingen (bij 2 aan 2 per paar: boven, onder, zodat onder 2, 4, 6 … staat). Vanzelf door.
- **Eerste vraag in één keer goed:** lofzin, "Ik tel ze hardop voor je. Tel maar mee!" (of een variant), Bliepo telt hardop (± 1,15 s per nummer). Het laatste getal zegt hij in de slotzin, zodat het maar 1 keer klinkt: "En 7! Je had het precies goed.". Een tik op de pijl zet alle nummers er meteen bij: dan "Zie je? Het zijn er 7. Je had het precies goed."
- **Goed na een fout:** alleen een korte bevestiging; de nummers staan erbij.
- **Heel snel:** Bliepo zegt niets (BOUWREGELS 6.10, Tellen).

## 5. Controles van het script

Inhoud gelijk aan squla-rekenmix-mix1-1; 30 foute antwoorden met een vaste denkfout; verklapcontrole over 697 combinaties van eerste zin en hint (er blijven altijd minstens 2 keuzes over, het goede er altijd bij; zonder richting ook geen richtingwoord); waarheidscontrole (772 beweringen, alle varianten: "dichtbij", "bijna" en "iets" alleen bij hooguit 2 verschil, "rij voor rij" alleen bij rijen enzovoort); geen opdracht bij de 2e keer; 948 paren van 1e en 2e keer (nooit 2 keer "dichtbij" of dezelfde eerste zin bij 1 vraag); de kiezer 31879 reacties nagespeeld met de functies van de les (nooit 2 keer dezelfde zin achter elkaar, geen getal 2 keer in 1 stuk, geen stuk 2 keer in 1 reactie, na de hint altijd een vraag of opdracht, 99395 stukken passen in het tekstvak); 1122 zinnen zonder woord van de niet-lijst, zonder "fout" of "vinkje", zonder kaal cijfer en hooguit 14 woorden.

## 6. Alle varianten (18 november 2026)

De les kiest uit elk rijtje steeds een andere zin dan de vorige keer. "Je koos 7." en "Je koos 9." tellen als dezelfde zin.

### Bij een fout: ballen in rijen (voorbeeld met het getal 9)

| Situatie | Varianten |
|---|---|
| Eerste zin, zonder richting | Je koos 9. Je zit er dichtbij. / Je koos 9. Dat scheelt niet veel. / Bijna! 9 is het net niet. / 9? Dat is heel dichtbij. / Je tikte op 9. Het scheelt maar een klein beetje. |
| Eerste zin, te weinig | Je koos 9. Er liggen er nog meer. / Je koos 9. Je hebt ze nog niet allemaal geteld. / Bijna! 9 is nog iets te weinig. / 9? Ik zie er nog meer. / Je zit er dichtbij met 9. Je hebt ze nog niet allemaal geteld. / 9 ballen? Je hebt ze nog niet allemaal geteld. |
| Eerste zin, te veel | Je koos 9. Dat zijn er iets te veel. / 9? Dat zijn er iets te veel. / Bijna! 9 is iets te veel. / Je zit er dichtbij, maar 9 is te veel. / Je tikte op 9. Zo veel liggen er niet. / 9 ballen? Ik denk dat je er te veel hebt geteld. |
| Hint, zonder richting | Begin bovenaan en tel opnieuw. Wijs elke bal aan. / Tel nog eens, rij voor rij. Wijs elke bal aan. / Tel ze nog eens rustig. Wijs elke bal aan en zeg het getal. / Probeer het nog eens. Tel hardop en wijs elke bal aan. / Probeer het nog eens. Tel de ballen en tik op het getal. |
| Hint, te weinig | Tel nog eens, rij voor rij. Sla geen bal over. / Tel ze nog eens rustig. Wijs elke bal aan. / Begin bovenaan en tel opnieuw. Wijs elke bal aan. / Probeer het nog eens. Tel elke bal mee, ook de laatste. |
| Hint, te veel | Tel nog eens, rij voor rij. Elke bal tel je maar 1 keer. / Tel ze opnieuw. Wijs elke bal maar 1 keer aan. / Begin bovenaan en tel rustig. Elke bal telt 1 keer mee. / Probeer het nog eens. Tel geen bal 2 keer. |
| Uitleg 2e keer, 1 te weinig | Er ligt nog 1 bal meer. / Je hebt 1 bal overgeslagen. / Je hebt 1 bal niet geteld. / Er mist nog 1 bal. |
| Uitleg 2e keer, een paar te weinig | Er liggen nog een paar ballen meer. / Je hebt een paar ballen overgeslagen. / Je hebt een paar ballen niet geteld. / Er missen nog een paar ballen. |
| Uitleg 2e keer, 1 te veel | Je hebt 1 bal 2 keer geteld. / Er is 1 bal 2 keer geteld. / Je telde 1 bal te veel. |
| Uitleg 2e keer, een paar te veel | Je hebt een paar ballen 2 keer geteld. / Er zijn een paar ballen 2 keer geteld. / Je telde een paar ballen te veel. |
| Weer te weinig | Je telde er weer te weinig. / Het zijn er weer iets te weinig. / Weer iets te weinig, zie ik. / Je hebt er weer te weinig geteld. |
| Weer te weinig, uitleg | Elke bal krijgt 1 nummer. Dan sla je er geen over. / We geven elke bal een nummer. Zo vergeten we er geen. |
| Weer te veel | Je telde er weer te veel. / Het zijn er weer iets te veel. / Weer iets te veel, zie ik. / Je hebt er weer te veel geteld. |
| Weer te veel, uitleg | Elke bal krijgt 1 nummer. Dan tel je niets 2 keer. / We geven elke bal een nummer. Zo tellen we er geen 2 keer. |

### Bij een fout: hints bij appels door elkaar en potloden 2 aan 2

| Situatie | Varianten |
|---|---|
| Hint, zonder richting (door elkaar) | Tel ze opnieuw, van boven naar beneden. Wijs elke appel aan. / Tel ze nog eens rustig. Wijs elke appel aan. / Wijs elke appel aan en zeg het getal. / Probeer het nog eens. Tel hardop en wijs elke appel aan. / Probeer het nog eens. Tel de appels en tik op het getal. |
| Hint, te weinig (door elkaar) | Tel nog eens. Sla geen appel over. / Tel ze nog eens rustig. Wijs elke appel aan. / Tel ze opnieuw, van boven naar beneden. Wijs elke appel aan. / Probeer het nog eens. Tel elke appel mee, ook de laatste. |
| Hint, te veel (door elkaar) | Tel nog eens, van boven naar beneden. Elke appel tel je maar 1 keer. / Tel ze opnieuw. Wijs elke appel maar 1 keer aan. / Tel ze nog eens rustig. Elke appel telt 1 keer mee. / Probeer het nog eens. Tel geen appel 2 keer. |
| Hint, zonder richting (2 aan 2) | Begin links en tel opnieuw. Wijs elk potlood aan. / Tel nog eens, van links naar rechts. Wijs elk potlood aan. / Tel ze nog eens rustig. Wijs elk potlood aan en zeg het getal. / Probeer het nog eens. Tel hardop en wijs elk potlood aan. / Probeer het nog eens. Tel de potloden en tik op het getal. |
| Hint, te weinig (2 aan 2) | Tel nog eens, van links naar rechts. Sla geen potlood over. / Tel ze nog eens rustig. Wijs elk potlood aan. / Begin links en tel opnieuw. Wijs elk potlood aan. / Probeer het nog eens. Tel elk potlood mee, ook de laatste. |
| Hint, te veel (2 aan 2) | Tel nog eens, van links naar rechts. Elk potlood tel je maar 1 keer. / Tel ze opnieuw. Wijs elk potlood maar 1 keer aan. / Begin links en tel rustig. Elk potlood telt 1 keer mee. / Probeer het nog eens. Tel geen potlood 2 keer. |

Liggen er 3 of meer tussen het gekozen en het goede getal (vraag 7, 10 en 14), dan vallen de versies met "dichtbij", "bijna", "scheelt", "iets" en "een klein beetje" weg.

### Het verloop

| Situatie | Varianten |
|---|---|
| Begin van de les (na "Hoi …! Fijn dat je er bent.") | In deze les tel je allerlei dingen. / Vandaag gaan we allerlei dingen tellen. / We gaan samen van alles tellen. |
| De vraag (blijft gelijk) | Hoeveel ballen zie je? (de eerste keer met: Tel ze en tik op het goede getal.) |
| De vraag terug na de hint | Hoeveel ballen zie je? / Hoeveel zijn het er dan? / Tik dan op het goede getal. |
| Eerste vraag goed: Bliepo telt na | Ik tel ze hardop voor je. Tel maar mee! / Kom, ik tel ze hardop. Tel maar mee! / Laten we ze samen tellen. Ik tel hardop. |
| Na het natellen | En 7! Je had het precies goed. / En de laatste is 7. Jij had het goed geteld. / En 7! Zie je? Je zat precies goed. |
| Na het natellen, als het kind op de pijl tikte | Zie je? Het zijn er 7. Je had het precies goed. / Zie je wel? Het zijn er 7. Jij had het goed geteld. / Kijk, daar heb je het: 7. Je zat precies goed. |
| 2e keer: we gaan samen tellen | Kom, we tellen ze samen. / Weet je wat? We tellen ze samen. / Geeft niks. We tellen ze samen. / Ik help je even. We tellen ze samen. / Laten we ze samen tellen en kijken. |
| Samen tellen: de opdracht | Tik op elke bal. Ik tel mee. / Tik elke bal aan. Ik zeg het getal. / Tik op alle ballen. Ik tel hardop mee. (bij potloden: Tik op elk potlood. Ik tel mee.) |
| Samen tellen: het hulphandje (aanmoediging) | Je bent goed bezig. / Jij kunt dit. / Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. |
| Samen tellen: het hulphandje (wat te doen) | Tik op een bal zonder nummer. / Zoek een bal zonder nummer en tik erop. / Welke bal heeft nog geen nummer? Tik erop. |
| Samen tellen: klaar | En 10! Zoveel ballen zijn het. / En 10! Nu hebben we ze samen allemaal geteld. / En de laatste is 10. Zoveel ballen zijn het. |
| Samen tellen: 20 s niets, Bliepo telt de rest | Kijk, ik tel de rest. Het zijn er 10. / Kijk, ik tel even verder. Het zijn er 10. |
| Hetzelfde getal 2 keer | Je koos weer 9. / Je tikte weer op 9. / Weer 9, zie ik. |
| Slotzin | Je hebt allerlei dingen geteld, tot wel 12! / Wat heb jij veel dingen geteld: tot wel 12! / Knap, hoor! Je hebt helemaal tot 12 geteld. |
| De kaart | Tik op de kaart. / Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. |
