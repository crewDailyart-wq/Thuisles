# FOUTTABEL — gouden les Tellen (squla-tellen-fruit-1-gouden, "Fruit tellen")

Gemaakt op 9 november 2026, bijgewerkt op 10 november 2026 (omgezet naar de nieuwste gouden stijl, KEUZES-VOOR-SARA.md Ronde 29) en op 18 november 2026 (warmere zinnen in varianten, proefles; oud naast nieuw in WIJZIGINGEN-ZINNEN-TELLEN.md), **uit de code** met `npx tsx scripts/fouttabel-tellen-gouden.ts`; pas zinnen aan in `src/components/les/lessen/squla-tellen-gouden-zinnen.ts` en draai het script opnieuw. De inhoud (15 vragen, getallen, 3 keuzes per vraag) is die van squla-tellen-fruit-1 en blijft gelijk (BOUWREGELS 15.22).

**EIGEN INVULLING, NIET VAN SYNTHESIS.** Alle vragen gaan over 11 t/m 17; het draaiboek Tellen (Color Count) gaat tot 10. De vragen krijgen hetzelfde skelet als Color Count; de hints en deze fouttabel zijn eigen invulling (15.22 punt 5). Wel volgt de soort reactie het draaiboek (§3 A, §7): Bliepo noemt het gekozen getal en de richting (te weinig / te veel) en vraagt opnieuw te tellen.

In de les staan de getallen in de kleur van het fruit (appel rood, peer groen, pruim paars); hier zonder kleur.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje), de vraag en de knoppen even weg, het fruit blijft staan zonder nummers. Bliepo zegt de eerste zin (de pijl staat erbij als snelkoppeling; ± 0,7 s na de zin gaat het vanzelf verder, 15.27); daarna komen de 3 knoppen terug met de hint (een vraag: geen pijl).
- **Richting en verklappen (15.17):** zou "te weinig" of "te veel" bij deze 3 keuzes maar 1 keuze overlaten, dan noemt Bliepo de richting niet (alleen "dichtbij", "bijna" of "scheelt niet veel", in 5 varianten) en wijst hij naar de manier van tellen. Zo verklapt de hint het antwoord niet. Komt bij dezelfde vraag een 2e fout getal zonder richting, dan een andere versie.
- **2e fout:** een korte uitleg bij de denkfout (§3, zonder het antwoord, uitleg en geen opdracht), "Kom, we tellen ze samen." (4 varianten; vanzelf door). Dan tikt het kind elk stuk fruit aan (een opdracht: geen pijl); er komt een nummer bij en Bliepo zegt het getal. Het laatste getal is het aantal ("En 12! Zoveel appels zijn het."; het getal 1 keer), de les gaat vanzelf door. Na ± 6 s stilte komt vanzelf het hulphandje; na 20 s zonder tik telt Bliepo de rest zelf ("Kijk, ik tel de rest. Het zijn er 12.").
- **Twee keer dezelfde denkfout** bij dezelfde vraag: Bliepo zegt "weer" en legt het anders uit (§3, laatste kolom). Alleen als hij de 1e keer al zei wat er mis was; na alleen "… is dichtbij." komt de gewone uitleg.
- **Varianten (18 november 2026):** elke zin bij een fout bestaat in varianten (§5). De les kiest willekeurig, maar nooit 2 keer achter elkaar dezelfde zin, ook niet over vragen heen (gedeelde kiezer `nooit-dubbel.ts`). In §2 en §3 staat per fout antwoord 1 vaste variant als voorbeeld; het script loopt ALLE varianten na (verklappen, waarheid, geen opdracht bij de 2e fout, geen getal 2 keer, nooit het woord "fout").
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
| 1. 12 appels (keuzes 10 / 11 / 12) | 10 | `alleen-volle-rijen` — telde alleen de volle rijen van 5, niet de rij die niet vol is | Je koos 10. Zoveel liggen er in de volle rijen. | De laatste rij telt ook mee. Tel nog eens. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 1. 12 appels (keuzes 10 / 11 / 12) | 11 | `te-weinig` — telde er te weinig (sloeg er een over) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | Je koos 11. Dat scheelt niet veel. | Tel nog eens, rij voor rij. Wijs elke appel aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 2. 11 peren (keuzes 11 / 12 / 13) | 12 | `te-veel` — telde er te veel (telde er een 2 keer) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | Bijna! 12 is het net niet. | Tel ze nog eens rustig. Wijs elke peer aan en zeg het getal. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 2. 11 peren (keuzes 11 / 12 / 13) | 13 | `te-veel` — telde er te veel (telde er een 2 keer) | Bijna! 13 is iets te veel. | Begin bovenaan en tel rustig. Elke peer telt 1 keer mee. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 3. 13 pruimen (keuzes 12 / 13 / 14) | 12 | `te-weinig` — telde er te weinig (sloeg er een over) | 12? Ik zie er nog meer. | Probeer het nog eens. Tel elke pruim mee, ook de laatste. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 3. 13 pruimen (keuzes 12 / 13 / 14) | 14 | `te-veel` — telde er te veel (telde er een 2 keer) | Je zit er dichtbij, maar 14 is te veel. | Probeer het nog eens. Tel geen pruim 2 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 4. 14 appels (keuzes 14 / 15 / 16) | 15 | `te-veel` — telde er te veel (telde er een 2 keer) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | Je tikte op 15. Het scheelt maar een klein beetje. | Probeer het nog eens. Tel de appels en tik op het getal. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 4. 14 appels (keuzes 14 / 15 / 16) | 16 | `te-veel` — telde er te veel (telde er een 2 keer) | Je tikte op 16. Zo veel liggen er niet. | Tel nog eens, rij voor rij. Elke appel tel je maar 1 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 5. 12 peren (keuzes 11 / 12 / 13) | 11 | `te-weinig` — telde er te weinig (sloeg er een over) | 11 peren? Je hebt ze nog niet allemaal geteld. | Tel nog eens, rij voor rij. Sla geen peer over. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 5. 12 peren (keuzes 11 / 12 / 13) | 13 | `te-veel` — telde er te veel (telde er een 2 keer) | 13 peren? Ik denk dat je er te veel hebt geteld. | Tel ze opnieuw. Wijs elke peer maar 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 6. 15 pruimen (keuzes 13 / 14 / 15) | 13 | `te-weinig` — telde er te weinig (sloeg er een over) | Je koos 13. Er liggen er nog meer. | Begin bovenaan en tel opnieuw. Wijs elke pruim aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 6. 15 pruimen (keuzes 13 / 14 / 15) | 14 | `te-weinig` — telde er te weinig (sloeg er een over) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | Je koos 14. Dat scheelt niet veel. | Tel nog eens, rij voor rij. Wijs elke pruim aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 7. 16 appels (keuzes 15 / 16 / 17) | 15 | `alleen-volle-rijen` — telde alleen de volle rijen van 5, niet de rij die niet vol is | Je koos 15. Zoveel liggen er in de volle rijen. | De laatste rij telt ook mee. Tel nog eens. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 7. 16 appels (keuzes 15 / 16 / 17) | 17 | `te-veel` — telde er te veel (telde er een 2 keer) | 17? Dat zijn er iets te veel. | Probeer het nog eens. Tel geen appel 2 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 8. 13 peren (keuzes 13 / 14 / 15) | 14 | `te-veel` — telde er te veel (telde er een 2 keer) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | 14? Dat is heel dichtbij. | Probeer het nog eens. Tel hardop en wijs elke peer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 8. 13 peren (keuzes 13 / 14 / 15) | 15 | `te-veel` — telde er te veel (telde er een 2 keer) | Bijna! 15 is iets te veel. | Tel nog eens, rij voor rij. Elke peer tel je maar 1 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 9. 17 pruimen (keuzes 15 / 16 / 17) | 15 | `alleen-volle-rijen` — telde alleen de volle rijen van 5, niet de rij die niet vol is | Je hebt alleen de volle rijen geteld. Dat zijn er 15. | Kijk ook naar de laatste rij en tel opnieuw. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 9. 17 pruimen (keuzes 15 / 16 / 17) | 16 | `te-weinig` — telde er te weinig (sloeg er een over) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | Je tikte op 16. Het scheelt maar een klein beetje. | Probeer het nog eens. Tel de pruimen en tik op het getal. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 10. 14 peren (keuzes 13 / 14 / 15) | 13 | `te-weinig` — telde er te weinig (sloeg er een over) | Je zit er dichtbij met 13. Je hebt ze nog niet allemaal geteld. | Begin bovenaan en tel opnieuw. Wijs elke peer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 10. 14 peren (keuzes 13 / 14 / 15) | 15 | `te-veel` — telde er te veel (telde er een 2 keer) | Je tikte op 15. Zo veel liggen er niet. | Begin bovenaan en tel rustig. Elke peer telt 1 keer mee. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 11. 13 appels (keuzes 12 / 13 / 14) | 12 | `te-weinig` — telde er te weinig (sloeg er een over) | 12 appels? Je hebt ze nog niet allemaal geteld. | Probeer het nog eens. Tel elke appel mee, ook de laatste. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 11. 13 appels (keuzes 12 / 13 / 14) | 14 | `te-veel` — telde er te veel (telde er een 2 keer) | 14 appels? Ik denk dat je er te veel hebt geteld. | Probeer het nog eens. Tel geen appel 2 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 12. 16 pruimen (keuzes 16 / 17 / 18) | 17 | `te-veel` — telde er te veel (telde er een 2 keer) *(richting niet genoemd: dan bleef er maar 1 keuze over)* | Bijna! 17 is het net niet. | Tel ze nog eens rustig. Wijs elke pruim aan en zeg het getal. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 12. 16 pruimen (keuzes 16 / 17 / 18) | 18 | `te-veel` — telde er te veel (telde er een 2 keer) | Je koos 18. Dat zijn er iets te veel. | Tel nog eens, rij voor rij. Elke pruim tel je maar 1 keer. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 13. 15 peren (keuzes 14 / 15 / 16) | 14 | `te-weinig` — telde er te weinig (sloeg er een over) | Je koos 14. Je hebt ze nog niet allemaal geteld. | Tel nog eens, rij voor rij. Sla geen peer over. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 13. 15 peren (keuzes 14 / 15 / 16) | 16 | `te-veel` — telde er te veel (telde er een 2 keer) | 16? Dat zijn er iets te veel. | Tel ze opnieuw. Wijs elke peer maar 1 keer aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 14. 17 appels (keuzes 16 / 17 / 18) | 16 | `te-weinig` — telde er te weinig (sloeg er een over) | Bijna! 16 is nog iets te weinig. | Begin bovenaan en tel opnieuw. Wijs elke appel aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 14. 17 appels (keuzes 16 / 17 / 18) | 18 | `te-veel` — telde er te veel (telde er een 2 keer) | Bijna! 18 is iets te veel. | Begin bovenaan en tel rustig. Elke appel telt 1 keer mee. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 15. 11 pruimen (keuzes 9 / 10 / 11) | 9 | `te-weinig` — telde er te weinig (sloeg er een over) | 9? Ik zie er nog meer. | Probeer het nog eens. Tel elke pruim mee, ook de laatste. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |
| 15. 11 pruimen (keuzes 9 / 10 / 11) | 10 | `alleen-volle-rijen` — telde alleen de volle rijen van 5, niet de rij die niet vol is *(richting niet genoemd: dan bleef er maar 1 keuze over)* | Je koos 10. Je zit er dichtbij. | Begin bovenaan en tel opnieuw. Wijs elke pruim aan. | vraag en knoppen even weg; het fruit blijft staan, zonder nummers; Bliepo's scherm 1,5 s rood; met de hint komen de 3 knoppen meteen terug (geen pijl) |

## 3. Uitleg na de 2e fout (zonder het antwoord), en als dezelfde denkfout nog eens komt

Na deze uitleg volgt altijd: "Kom, we tellen ze samen." (of een variant) en het samen tellen (nu pas het aantal in beeld).

| Vraag | 2e fout (denkfout) | Uitleg bij de 2e fout (eerste zin + uitleg) | Als de 1e fout (het andere foute antwoord) dezelfde denkfout was |
|---|---|---|---|
| 1. 12 appels | 10 (`alleen-volle-rijen`) | Je koos 10. Zoveel liggen er in de volle rijen. De laatste rij is niet vol. Die hoort er ook bij. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 1. 12 appels | 11 (`te-weinig`) | Je koos 11. Dat scheelt niet veel. Je hebt 1 appel overgeslagen. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 2. 11 peren | 12 (`te-veel`) | Bijna! 12 is het net niet. Je telde 1 peer te veel. | Weer iets te veel, zie ik. Elke peer krijgt 1 nummer. Dan tel je niets 2 keer. |
| 2. 11 peren | 13 (`te-veel`) | Bijna! 13 is iets te veel. Je telde een paar peren te veel. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 3. 13 pruimen | 12 (`te-weinig`) | 12? Ik zie er nog meer. Er ligt nog 1 pruim meer. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 3. 13 pruimen | 14 (`te-veel`) | Je zit er dichtbij, maar 14 is te veel. Je hebt 1 pruim 2 keer geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 4. 14 appels | 15 (`te-veel`) | Je tikte op 15. Het scheelt maar een klein beetje. Er ligt 1 appel minder. | Het zijn er weer iets te veel. Elke appel krijgt 1 nummer. Dan tel je niets 2 keer. |
| 4. 14 appels | 16 (`te-veel`) | Je tikte op 16. Zo veel liggen er niet. Er liggen een paar appels minder. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 5. 12 peren | 11 (`te-weinig`) | 11 peren? Je hebt ze nog niet allemaal geteld. Je hebt 1 peer niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 5. 12 peren | 13 (`te-veel`) | 13 peren? Ik denk dat je er te veel hebt geteld. Je telde 1 peer te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 6. 15 pruimen | 13 (`te-weinig`) | Je koos 13. Er liggen er nog meer. Er liggen nog een paar pruimen meer. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 6. 15 pruimen | 14 (`te-weinig`) | Je koos 14. Dat scheelt niet veel. Er ligt nog 1 pruim meer. | Je telde er weer te weinig. Elke pruim krijgt 1 nummer. Dan sla je er geen over. |
| 7. 16 appels | 15 (`alleen-volle-rijen`) | Je koos 15. Zoveel liggen er in de volle rijen. De laatste rij is niet vol. Die hoort er ook bij. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 7. 16 appels | 17 (`te-veel`) | 17? Dat zijn er iets te veel. Er ligt 1 appel minder. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 8. 13 peren | 14 (`te-veel`) | 14? Dat is heel dichtbij. Je telde 1 peer te veel. | Weer iets te veel, zie ik. Elke peer krijgt 1 nummer. Dan tel je niets 2 keer. |
| 8. 13 peren | 15 (`te-veel`) | Bijna! 15 is iets te veel. Je telde een paar peren te veel. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 9. 17 pruimen | 15 (`alleen-volle-rijen`) | Je hebt alleen de volle rijen geteld. Dat zijn er 15. De rij die niet vol is, telt ook mee. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 9. 17 pruimen | 16 (`te-weinig`) | Je tikte op 16. Het scheelt maar een klein beetje. Er ligt nog 1 pruim meer. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 10. 14 peren | 13 (`te-weinig`) | Je zit er dichtbij met 13. Je hebt ze nog niet allemaal geteld. Je hebt 1 peer overgeslagen. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 10. 14 peren | 15 (`te-veel`) | Je tikte op 15. Zo veel liggen er niet. Er ligt 1 peer minder. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 11. 13 appels | 12 (`te-weinig`) | 12 appels? Je hebt ze nog niet allemaal geteld. Je hebt 1 appel niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 11. 13 appels | 14 (`te-veel`) | 14 appels? Ik denk dat je er te veel hebt geteld. Je telde 1 appel te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 12. 16 pruimen | 17 (`te-veel`) | Bijna! 17 is het net niet. Je hebt 1 pruim 2 keer geteld. | Je telde er weer te veel. Elke pruim krijgt 1 nummer. Dan tel je niets 2 keer. |
| 12. 16 pruimen | 18 (`te-veel`) | Je koos 18. Dat zijn er iets te veel. Je hebt een paar pruimen 2 keer geteld. | — (1e keer zei Bliepo alleen "… is dichtbij": dan de uitleg links, geen "weer") |
| 13. 15 peren | 14 (`te-weinig`) | Je koos 14. Je hebt ze nog niet allemaal geteld. Je hebt 1 peer overgeslagen. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 13. 15 peren | 16 (`te-veel`) | 16? Dat zijn er iets te veel. Er ligt 1 peer minder. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 14. 17 appels | 16 (`te-weinig`) | Bijna! 16 is nog iets te weinig. Je hebt 1 appel niet geteld. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 14. 17 appels | 18 (`te-veel`) | Bijna! 18 is iets te veel. Je telde 1 appel te veel. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 15. 11 pruimen | 9 (`te-weinig`) | 9? Ik zie er nog meer. Er liggen nog een paar pruimen meer. | — (1e fout was een andere denkfout: dan de uitleg links) |
| 15. 11 pruimen | 10 (`alleen-volle-rijen`) | Je koos 10. Je zit er dichtbij. De rij die niet vol is, telt ook mee. | — (1e fout was een andere denkfout: dan de uitleg links) |

## 4. Goed

- **Goed in één keer:** scherm 1 s groen, een lofzin uit het rijtje (BLIEPO-KARAKTER.md §3) en het aantal ("Ja, er zijn er 12." / "Ja, je hebt ze allemaal geteld: 12." / "Het zijn er 12." / "Je hebt er 12 geteld." / "Ik heb ze nagekeken: het zijn er 12." / "Er liggen 12 appels." / "12 appels, precies!" / "Precies, 12 appels." / "Dat klopt, er zijn 12 appels."), samen als 1 uiting. Begint de lofzin met "Ja", dan komt een telzin zonder "Ja". De robotzin "Ik heb ze nagekeken …" hooguit 1 keer per les. Niet 2 keer achter elkaar dezelfde telzin.
- **Eerste vraag in één keer goed:** lofzin, "Ik tel ze hardop voor je. Tel maar mee!", Bliepo telt hardop 1 t/m 11 (± 1,15 s per nummer); het laatste getal zegt hij in de slotzin, zodat het maar 1 keer klinkt: "En 12! Je had het precies goed." Een tik op de pijl zet alle nummers er meteen bij: dan "Zie je? Het zijn er 12. Je had het precies goed." Alles vanzelf door.
- **Goed na een fout:** alleen een korte bevestiging (BLIEPO-KARAKTER.md §3.4); de nummers staan erbij; vanzelf door.
- **Heel snel:** Bliepo zegt niets over snel (BOUWREGELS 6.10).
- **Hetzelfde foute getal 2 keer:** de eerste zin wordt "Je koos weer 11." of een variant (niet 2 keer dezelfde zin).
- **Verklapcontrole:** het script stopt met een foutmelding als een hint zonder richting toch een richting geeft, of als er na eerste zin + hint maar 1 keuze logisch overblijft. Vraag 15, keuze 10 (was open, KEUZES Ronde 20 vraag 2): Bliepo noemt de volle rijen daar niet meer bij de 1e fout, want dan bleef alleen 11 over.

## 5. Alle varianten (18 november 2026)

De les kiest uit elk rijtje steeds een andere zin dan de vorige keer. Voorbeeld met appels en het getal 11.

### Bij een fout

| Situatie | Varianten |
|---|---|
| Eerste zin, zonder richting | Je koos 11. Je zit er dichtbij. / Je koos 11. Dat scheelt niet veel. / Bijna! 11 is het net niet. / 11? Dat is heel dichtbij. / Je tikte op 11. Het scheelt maar een klein beetje. |
| Eerste zin, te weinig | Je koos 11. Er liggen er nog meer. / Je koos 11. Je hebt ze nog niet allemaal geteld. / Bijna! 11 is nog iets te weinig. / 11? Ik zie er nog meer. / Je zit er dichtbij met 11. Je hebt ze nog niet allemaal geteld. / 11 appels? Je hebt ze nog niet allemaal geteld. |
| Eerste zin, te veel | Je koos 11. Dat zijn er iets te veel. / 11? Dat zijn er iets te veel. / Bijna! 11 is iets te veel. / Je zit er dichtbij, maar 11 is te veel. / Je tikte op 11. Zo veel liggen er niet. / 11 appels? Ik denk dat je er te veel hebt geteld. |
| Eerste zin, alleen de volle rijen | Je hebt alleen de volle rijen geteld. Dat zijn er 11. / Je koos 11. Zoveel liggen er in de volle rijen. / Je kwam op 11. Dat zijn alleen de volle rijen. |
| Hint, zonder richting | Begin bovenaan en tel opnieuw. Wijs elke appel aan. / Tel nog eens, rij voor rij. Wijs elke appel aan. / Tel ze nog eens rustig. Wijs elke appel aan en zeg het getal. / Probeer het nog eens. Tel hardop en wijs elke appel aan. / Probeer het nog eens. Tel de appels en tik op het getal. |
| Hint, te weinig | Tel ze nog eens rustig. Wijs elke appel aan. / Tel nog eens, rij voor rij. Sla geen appel over. / Begin bovenaan en tel opnieuw. Wijs elke appel aan. / Probeer het nog eens. Tel elke appel mee, ook de laatste. |
| Hint, te veel | Tel nog eens, rij voor rij. Elke appel tel je maar 1 keer. / Tel ze opnieuw. Wijs elke appel maar 1 keer aan. / Begin bovenaan en tel rustig. Elke appel telt 1 keer mee. / Probeer het nog eens. Tel geen appel 2 keer. |
| Hint, alleen de volle rijen | Kijk ook naar de laatste rij en tel opnieuw. / De laatste rij telt ook mee. Tel nog eens. / Tel ook de appels in de laatste rij. |
| Uitleg 2e keer, 1 te weinig | Er ligt nog 1 appel meer. / Je hebt 1 appel overgeslagen. / Je hebt 1 appel niet geteld. |
| Uitleg 2e keer, een paar te weinig | Er liggen nog een paar appels meer. / Je hebt een paar appels overgeslagen. / Je hebt een paar appels niet geteld. |
| Uitleg 2e keer, 1 te veel | Je hebt 1 appel 2 keer geteld. / Er ligt 1 appel minder. / Je telde 1 appel te veel. |
| Uitleg 2e keer, een paar te veel | Je hebt een paar appels 2 keer geteld. / Er liggen een paar appels minder. / Je telde een paar appels te veel. |
| Uitleg 2e keer, alleen de volle rijen | De rij die niet vol is, telt ook mee. / De laatste rij is niet vol. Die hoort er ook bij. / Ook de appels in de laatste rij tellen mee. |
| Weer te weinig | Je telde er weer te weinig. / Het zijn er weer iets te weinig. / Weer iets te weinig, zie ik. |
| Weer te weinig, uitleg | Elke appel krijgt 1 nummer. Dan sla je er geen over. / We geven elke appel een nummer. Zo vergeten we er geen. |
| Weer te veel | Je telde er weer te veel. / Het zijn er weer iets te veel. / Weer iets te veel, zie ik. |
| Weer te veel, uitleg | Elke appel krijgt 1 nummer. Dan tel je niets 2 keer. / We geven elke appel een nummer. Zo tellen we er geen 2 keer. |
| Weer alleen de volle rijen | Je hebt weer alleen de volle rijen geteld. / Dat zijn weer alleen de volle rijen. / Je keek weer alleen naar de volle rijen. |
| Weer alleen de volle rijen, uitleg | Ook de appels in de laatste rij horen erbij. / De laatste rij is korter, maar hoort er ook bij. |

### Het verloop

| Situatie | Varianten |
|---|---|
| Begin van de les | Vandaag gaan we fruit tellen. / We gaan samen fruit tellen. (daarna: Kijk, de appels liggen in rijen van 5.) |
| Eerste vraag goed: Bliepo telt na | Ik tel ze hardop voor je. Tel maar mee! / Kom, ik tel ze hardop. Tel maar mee! / Laten we ze samen tellen. Ik tel hardop. |
| Na het natellen | En 12! Je had het precies goed. / En de laatste is 12. Jij had het goed geteld. / En 12! Zie je? Je zat precies goed. |
| Na het natellen, als het kind op de pijl tikte | Zie je? Het zijn er 12. Je had het precies goed. / Zie je wel? Het zijn er 12. Jij had het goed geteld. / Kijk, daar heb je het: 12. Je zat precies goed. |
| 2e fout: we gaan samen tellen | Kom, we tellen ze samen. / Weet je wat? We tellen ze samen. / Geeft niks. We tellen ze samen. / Ik help je even. We tellen ze samen. / Laten we ze samen tellen en kijken. |
| Samen tellen: de opdracht | Tik op elke appel. Ik tel mee. / Tik elke appel aan. Ik zeg het getal. / Tik op alle appels. Ik tel hardop mee. |
| Samen tellen: het hulphandje (aanmoediging) | Je bent goed bezig. / Jij kunt dit. / Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. |
| Samen tellen: het hulphandje (wat te doen) | Tik op een appel zonder nummer. / Zoek een appel zonder nummer en tik erop. / Welke appel heeft nog geen nummer? Tik erop. |
| Samen tellen: klaar | En 12! Zoveel appels zijn het. / En 12! Nu hebben we ze samen allemaal geteld. / En de laatste is 12. Zoveel appels zijn het. |
| Samen tellen: 20 s niets, Bliepo telt de rest | Kijk, ik tel de rest. Het zijn er 12. / Kijk, ik tel even verder. Het zijn er 12. |
| Hetzelfde getal 2 keer | Je koos weer 11. / Je tikte weer op 11. / Weer 11, zie ik. |
| Slotzin | Je hebt fruit geteld tot wel 17! / Wat heb jij veel fruit geteld: tot wel 17! / Knap, hoor! Je hebt helemaal tot 17 geteld. |
| De kaart | Tik op de kaart. / Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. |
