# FOUTTABEL — gouden les Rekentaal (squla-rekentaal-gouden, "Groot en klein, vol en leeg")

Gemaakt **uit de code** met `npx tsx scripts/fouttabel-rekentaal-gouden.ts` (eerste versie 11 november 2026; varianten sinds 18 november 2026); pas zinnen aan in `src/components/les/lessen/squla-rekentaal-gouden-zinnen.ts` en draai het script opnieuw. De inhoud (16 vragen, de voorwerpen, hun maten, de keuzes en de goede antwoorden) is die van squla-rekentaal en blijft gelijk (BOUWREGELS 15.22). Oud naast nieuw: WIJZIGINGEN-ZINNEN-REKENTAAL.md.

**EIGEN INVULLING, NIET VAN SYNTHESIS (BOUWREGELS 15.22 punt 5, 15.25).** Synthesis heeft geen tutorles over groot en klein, vol en leeg, zwaar en licht of lang en kort (KOPPELING.md §12: alleen het spel Less or More). Het skelet is dat van de andere gouden lessen (laag 1). Alles in deze tabel (de denkfouten, de eerste zinnen, de hints, de uitleg en het samen voordoen) is eigen invulling; alleen de algemene zinnen "Ik help je even" en "Precies" komen van Synthesis. De denkfouten zijn alleen wat zeker te zien is aan het antwoord: het andere uiterste gekozen (groot en klein, vol en leeg, zwaar en licht, lang en kort verwisseld), het middelste gekozen, het volle of lege glas bij half vol, het grootste ding op de weegschaal, en bij op volgorde: andersom, niet bij de kleinste begonnen, of de grootste in het midden. Bliepo zegt alleen wat waar is over wat het kind koos; hij verzint geen reden.

Getallen: Bliepo's zinnen in deze les hebben geen getallen.

**Zo werkt het bij een fout — 2 POGINGEN (BOUWREGELS 15.9 en 15.11):**
- **1e fout:** Bliepo's scherm 1,5 seconde rood (geen fout-geluidje, geen rood op de keuze). Bliepo zegt wat het kind koos (1 keer), met een rood rondje om dat voorwerp zolang hij het noemt. Daarna de hint en meteen de vraag in andere woorden ("Welke pannenkoek is groter, denk je?", "Tik op de pannenkoek die groter is."; nooit precies dezelfde vraagzin als de 1e keer), en tegelijk mag het kind opnieuw kiezen. Bij op volgorde gaan alle voorwerpen terug naar boven en komt na de hint de opdracht ("Zet ze nu van klein naar groot."). Zo staat er altijd een vraag of opdracht in beeld (15.37, F16). Alles gaat vanzelf door (15.27).
- **Vragen met 2 voorwerpen** (vraag 1 t/m 8 en 13): na de 1e fout blijft er altijd maar 1 voorwerp over. Dat komt door de inhoud van Squla (2 keuzes); de eerste zin en de hint zeggen alleen iets over wat het kind koos en hoe je kijkt.
- **Verklappen (15.17):** de eerste zin, de hint en de vraag opnieuw noemen het goede voorwerp niet, er staat geen "tussen … en …" in, het rondje staat nooit om het antwoord, en bij 3 voorwerpen blijven er na de eerste zin altijd 2 over.
- **Herhaling:** in 1 reactie bij een fout komt geen woord 2 keer voor (behalve kleine woordjes en de woorden van de vraag zelf), en niet 2 keer dezelfde naam achter elkaar. De les kiest alleen combinaties die dat halen; het script keurt ze allemaal.
- **2e fout:** wat het kind koos, een korte uitleg (geen opdracht), "Kom, we kijken samen." (5 versies) en dan samen voordoen (§3): Bliepo wijst de voorwerpen 1 voor 1 aan met het rondje, dan staat het rondje om het goede voorwerp en het kind tikt het (de kleine stap; na ± 6 s stilte het hulphandje; vangnet: 20 s niets of 3 keer iets anders, dan doet Bliepo het zelf: "Kijk, …", geen "Ja"). Bij op volgorde zet Bliepo de kleinste en de middelste op hun plek en tikt het kind de grootste. "Ze beginnen bij dezelfde streep." zegt Bliepo bij samen voordoen niet als de hint het al zei. Daarna gaat de les door.
- **Hetzelfde foute antwoord 2 keer:** "Je koos weer …" / "Weer deze pannenkoek, zie ik." / "Je tikte weer op …" (bij op volgorde "Je zette ze weer in dezelfde volgorde.") en dan de uitleg (anders dan de hint van de 1e keer).
- **Dezelfde denkfout 2 keer met een ander antwoord:** kan alleen bij op volgorde (`niet-bij-kleinste`): dan zegt Bliepo de "weer"-zin.
- **Een ander fout antwoord bij de 2e fout:** de eerste zin begint met "Nu koos je …" of "Nu tikte je op …" (keuring Tellen en Splitsen).
- **Niet duidelijk (`onduidelijk`):** komt in deze les niet voor (alle keuzes zijn vast); als vangnet een zin uit BLIEPO-KARAKTER.md §10 en een algemene hint.
- **Nooit 2 keer hetzelfde:** elke zin heeft varianten (§4); de les kiest met de gedeelde kiezer (`nooit-dubbel.ts`) steeds een andere dan de vorige keer, ook over vragen heen.
- Elke fout wordt met de naam van de denkfout bewaard, elke vraag met zijn uitkomst: goed in één keer, goed na een fout of samen gedaan.

---

## 1. Denkfouten: de vaste namen (voor de voortgang)

| Naam in de voortgang | Wat het kind waarschijnlijk deed | Bron |
|---|---|---|
| `groot-klein-verwisseld` | koos het andere uiterste: het kleine bij groot(er/st), het grote bij klein(er/st) | eigen invulling, niet van Synthesis |
| `vol-leeg-verwisseld` | koos het lege glas bij vol, of het volle bij leeg | eigen invulling, niet van Synthesis |
| `zwaar-licht-verwisseld` | koos op de weegschaal de andere kant (de kant die omhoog gaat bij zwaarder, die zakt bij lichter) | eigen invulling, niet van Synthesis |
| `lang-kort-verwisseld` | koos het andere uiterste: het korte bij lang(er/st), het lange bij kort(er/st) | eigen invulling, niet van Synthesis |
| `middelste-gekozen` | koos het voorwerp dat qua maat in het midden zit, niet het grootste of kleinste, langste of kortste | eigen invulling, niet van Synthesis |
| `helemaal-vol` | koos het volle glas bij half vol | eigen invulling, niet van Synthesis |
| `leeg-in-plaats-van-half` | koos het lege glas bij half vol | eigen invulling, niet van Synthesis |
| `grootste-gekozen` | koos op de weegschaal het grootste voorwerp (de lege mand), terwijl die kant omhoog gaat | eigen invulling, niet van Synthesis |
| `groot-naar-klein` | zette ze precies andersom: van groot naar klein | eigen invulling, niet van Synthesis |
| `niet-bij-kleinste` | begon niet met de kleinste | eigen invulling, niet van Synthesis |
| `grootste-in-het-midden` | begon goed met de kleinste, maar zette daarna de grootste | eigen invulling, niet van Synthesis |
| `onduidelijk` | niet duidelijk: geen reden verzonnen | BLIEPO-KARAKTER.md §10 |

## 2. De fouttabel: per vraag elk fout antwoord (29 rijen; 1 vaste variant per cel, alle varianten in §4)

| Vraag | Fout antwoord | Denkfout (bewaard als) | Eerste zin van Bliepo | Hint en de vraag opnieuw | Op het scherm |
|---|---|---|---|---|---|
| 1. Welke pannenkoek is groter? Tik erop. (keuzes de kleine pannenkoek / de grote pannenkoek) | de kleine pannenkoek | `groot-klein-verwisseld` — koos het andere uiterste: het kleine bij groot(er/st), het grote bij klein(er/st) | Deze pannenkoek? Die is kleiner dan de andere. | Kijk goed naar allebei de pannenkoeken. Tik op de pannenkoek die groter is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 2. Welke beker is kleiner? (keuzes de grote beker / de kleine beker) | de grote beker | `groot-klein-verwisseld` — koos het andere uiterste: het kleine bij groot(er/st), het grote bij klein(er/st) | Je tikte op de grote beker. | Kijk welke beker minder hoog komt. Kies de beker die kleiner is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 3. Welk glas is vol? (keuzes het lege glas / het volle glas) | het lege glas | `vol-leeg-verwisseld` — koos het lege glas bij vol, of het volle bij leeg | Je koos dit glas. Het is leeg. | Kijk hoe hoog het sap komt. Welk glas is vol, denk je? | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 4. Welk glas is leeg? (keuzes het volle glas / het lege glas) | het volle glas | `vol-leeg-verwisseld` — koos het lege glas bij vol, of het volle bij leeg | Dit glas? Daar zit sap in. | Zoek waar niets in zit. Tik op het glas dat leeg is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 5. Kijk naar de weegschaal. Wat is zwaarder? (keuzes de appel / de meloen) | de appel | `zwaar-licht-verwisseld` — koos op de weegschaal de andere kant (de kant die omhoog gaat bij zwaarder, die zakt bij lichter) | Je tikte op de appel. Die kant staat hoog. | Zoek de schaal die het laagst is. Kies wat zwaarder is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 6. Kijk naar de weegschaal. Wat is lichter? (keuzes de zak meel / de aardbei) | de zak meel | `zwaar-licht-verwisseld` — koos op de weegschaal de andere kant (de kant die omhoog gaat bij zwaarder, die zakt bij lichter) | Je koos de zak meel. Die hangt lager. | Iets lichts gaat omhoog op de weegschaal. Wat is lichter, denk je? | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 7. Kijk naar de slierten spaghetti. Welke sliert is langer? (keuzes de korte sliert / de lange sliert) | de korte sliert | `lang-kort-verwisseld` — koos het andere uiterste: het korte bij lang(er/st), het lange bij kort(er/st) | Deze sliert? Die houdt eerder op. | Kijk waar elke sliert ophoudt. Tik op de sliert die langer is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 8. Welke sliert is korter? (keuzes de lange sliert / de korte sliert) | de lange sliert | `lang-kort-verwisseld` — koos het andere uiterste: het korte bij lang(er/st), het lange bij kort(er/st) | Je tikte op de lange sliert. | Volg elke sliert met je ogen tot het eind. Kies de sliert die korter is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 9. Welke mand is het grootst? (keuzes de middelste mand / de grootste mand / de kleinste mand) | de middelste mand | `middelste-gekozen` — koos het voorwerp dat qua maat in het midden zit, niet het grootste of kleinste, langste of kortste | Je koos deze mand. Die is niet de grootste. | Kijk hoe hoog en hoe breed ze zijn. Welke mand is het grootst, denk je? | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 9. Welke mand is het grootst? (keuzes de middelste mand / de grootste mand / de kleinste mand) | de kleinste mand | `groot-klein-verwisseld` — koos het andere uiterste: het kleine bij groot(er/st), het grote bij klein(er/st) | Je koos deze mand. Dat is de kleinste. | Kijk hoe hoog en hoe breed ze zijn. Welke mand is het grootst, denk je? | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 10. Welk glas is half vol? (keuzes het volle glas / het lege glas / het halfvolle glas) | het volle glas | `helemaal-vol` — koos het volle glas bij half vol | Dit glas? Dat zit tot bovenaan vol. | Zoek sap tot de helft. Tik op het glas dat half vol is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 10. Welk glas is half vol? (keuzes het volle glas / het lege glas / het halfvolle glas) | het lege glas | `leeg-in-plaats-van-half` — koos het lege glas bij half vol | Dit glas? Dat is helemaal leeg. | Zoek sap tot de helft. Tik op het glas dat half vol is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 11. Welke appel is het kleinst? (keuzes de grootste appel / de kleinste appel / de middelste appel) | de grootste appel | `groot-klein-verwisseld` — koos het andere uiterste: het kleine bij groot(er/st), het grote bij klein(er/st) | Je tikte op de grootste appel. | Kijk welke appel het minst hoog komt. Kies de appel die het kleinst is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 11. Welke appel is het kleinst? (keuzes de grootste appel / de kleinste appel / de middelste appel) | de middelste appel | `middelste-gekozen` — koos het voorwerp dat qua maat in het midden zit, niet het grootste of kleinste, langste of kortste | Je tikte op de middelste appel. | Kijk welke appel het minst hoog komt. Kies de appel die het kleinst is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 12. Welk broodje is het langst? (keuzes het kortste broodje / het langste broodje / het middelste broodje) | het kortste broodje | `lang-kort-verwisseld` — koos het andere uiterste: het korte bij lang(er/st), het lange bij kort(er/st) | Je koos dit broodje. Dat is het kortste. | Kijk waar ze allemaal stoppen. Welk broodje is het langst, denk je? | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 12. Welk broodje is het langst? (keuzes het kortste broodje / het langste broodje / het middelste broodje) | het middelste broodje | `middelste-gekozen` — koos het voorwerp dat qua maat in het midden zit, niet het grootste of kleinste, langste of kortste | Je koos dit broodje. Dat is niet het langste. | Kijk waar ze allemaal stoppen. Welk broodje is het langst, denk je? | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 13. Kijk naar de weegschaal. Wat is zwaarder? (keuzes de lege mand / de meloen) | de lege mand | `grootste-gekozen` — koos op de weegschaal het grootste voorwerp (de lege mand), terwijl die kant omhoog gaat | De lege mand? Die is groot, maar gaat omhoog. | Kijk welke kant van de weegschaal zakt. Tik op wat zwaarder is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 14. Welk broodje is het kortst? (keuzes het middelste broodje / het langste broodje / het kortste broodje) | het middelste broodje | `middelste-gekozen` — koos het voorwerp dat qua maat in het midden zit, niet het grootste of kleinste, langste of kortste | Je tikte op het middelste broodje. | Kijk welk broodje als eerste ophoudt. Kies het broodje dat het kortst is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 14. Welk broodje is het kortst? (keuzes het middelste broodje / het langste broodje / het kortste broodje) | het langste broodje | `lang-kort-verwisseld` — koos het andere uiterste: het korte bij lang(er/st), het lange bij kort(er/st) | Je tikte op het langste broodje. | Kijk welk broodje als eerste ophoudt. Kies het broodje dat het kortst is. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); het vinkje gaat weg; een rood rondje om wat het kind koos zolang Bliepo het noemt (nooit om het antwoord); dan de hint met de vraag in andere woorden en het kind mag opnieuw kiezen (alle voorwerpen blijven staan, geen pijl) |
| 15. Zet de appels op volgorde. Van klein naar groot. Tik eerst op de kleinste. | middelste appel → grootste appel → kleinste appel | `niet-bij-kleinste` — begon niet met de kleinste | Je begon met deze appel. Er ligt nog een kleinere. | Zoek eerst de kleinste. Zet de appels van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 15. Zet de appels op volgorde. Van klein naar groot. Tik eerst op de kleinste. | middelste appel → kleinste appel → grootste appel | `niet-bij-kleinste` — begon niet met de kleinste | Je begon met deze appel. Er ligt nog een kleinere. | Zoek eerst de kleinste. Zet de appels van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 15. Zet de appels op volgorde. Van klein naar groot. Tik eerst op de kleinste. | grootste appel → middelste appel → kleinste appel | `groot-naar-klein` — zette ze precies andersom: van groot naar klein | Je zette ze van groot naar klein. | Begin met de kleinste en pak dan steeds een grotere. Zet de appels van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 15. Zet de appels op volgorde. Van klein naar groot. Tik eerst op de kleinste. | grootste appel → kleinste appel → middelste appel | `niet-bij-kleinste` — begon niet met de kleinste | Je begon met deze appel. Er ligt nog een kleinere. | Zoek eerst de kleinste. Zet de appels van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 15. Zet de appels op volgorde. Van klein naar groot. Tik eerst op de kleinste. | kleinste appel → grootste appel → middelste appel | `grootste-in-het-midden` — begon goed met de kleinste, maar zette daarna de grootste | Je zette de grootste in het midden. | Tik steeds op de kleinste die nog over is. Zet de appels van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 16. Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste. | grootste beker → kleinste beker → middelste beker | `niet-bij-kleinste` — begon niet met de kleinste | Deze beker eerst? Er staat nog een kleinere. | Kijk welke het kleinst is. Zet ze nu van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 16. Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste. | grootste beker → middelste beker → kleinste beker | `groot-naar-klein` — zette ze precies andersom: van groot naar klein | Van groot naar klein? Dat is net andersom. | De kleinste komt eerst, de grootste als laatste. Zet ze nu van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 16. Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste. | kleinste beker → grootste beker → middelste beker | `grootste-in-het-midden` — begon goed met de kleinste, maar zette daarna de grootste | De grootste staat nu in het midden. | Tik steeds op de kleinste die nog over is. Zet de bekers van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 16. Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste. | middelste beker → grootste beker → kleinste beker | `niet-bij-kleinste` — begon niet met de kleinste | Deze beker eerst? Er staat nog een kleinere. | Kijk welke het kleinst is. Zet ze nu van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |
| 16. Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste. | middelste beker → kleinste beker → grootste beker | `niet-bij-kleinste` — begon niet met de kleinste | Deze beker eerst? Er staat nog een kleinere. | Kijk welke het kleinst is. Zet ze nu van klein naar groot. | Bliepo's scherm 1,5 s rood (geen fout-geluidje); een rood rondje om het voorwerp dat als eerste op een verkeerde plek staat; dan gaan alle voorwerpen terug naar boven, de hint met de opdracht is de nieuwe opdracht en het kind zet ze opnieuw (geen pijl) |

## 3. De 2e fout: uitleg en samen voordoen

| Vraag | Fout antwoord | Uitleg bij de 2e fout | Samen voordoen |
|---|---|---|---|
| 1 | de kleine pannenkoek (`groot-klein-verwisseld`) | Deze pannenkoek? Die is kleiner dan de andere. Een grotere pannenkoek is breder. + "We zoeken het samen." (5 versies) | rondje om de kleine pannenkoek: "Kijk naar deze pannenkoek. Die is klein." rondje om de grote pannenkoek: "En deze is groot. Hij is veel breder." — rondje om de grote pannenkoek: "Tik jij erop?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies! Hij is breder dan de andere." (vangnet: "Kijk, hij is breder dan de andere.") |
| 2 | de grote beker (`groot-klein-verwisseld`) | Je tikte op de grote beker. Kleiner betekent: lager en smaller. + "Kom, samen lukt het." (5 versies) | rondje om de grote beker: "Deze beker is groot." rondje om de kleine beker: "En deze is klein." — rondje om de kleine beker: "Nu jij! Tik in het rode rondje." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Zo is het: deze beker is kleiner." (vangnet: "Kijk, deze beker is kleiner.") |
| 3 | het lege glas (`vol-leeg-verwisseld`) | Je koos dit glas. Het is leeg. In een vol glas komt het sap tot bovenaan. + "Ik help je even. We kijken samen." (5 versies) | rondje om het lege glas: "Kijk, dit glas is leeg." rondje om het volle glas: "En hier komt het sap tot de rand." — rondje om het volle glas: "Tik jij op het volle glas?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, dit glas is vol." (vangnet: "Kijk, het sap komt tot de rand.") |
| 4 | het volle glas (`vol-leeg-verwisseld`) | Dit glas? Daar zit sap in. Leeg betekent: er zit niets in. + "Geeft niks. We zoeken het samen." (5 versies) | rondje om het volle glas: "In dit glas zit sap." rondje om het lege glas: "En hier zit niets in." — rondje om het lege glas: "Tik jij erop?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies! Er zit niets in." (vangnet: "Kijk, dit glas is leeg.") |
| 5 | de appel (`zwaar-licht-verwisseld`) | Je tikte op de appel. Die kant staat hoog. Hoe zwaarder iets is, hoe lager het hangt. + "Kom, we kijken samen." (5 versies) | rondje om de meloen: "Kijk, de meloen hangt laag." rondje om de appel: "De appel gaat omhoog." — rondje om de meloen: "Nu jij! Tik in het rode rondje." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Zo is het: de meloen is zwaarder." (vangnet: "Kijk, die kant zakt naar beneden.") |
| 6 | de zak meel (`zwaar-licht-verwisseld`) | Je koos de zak meel. Die hangt lager. Wat lichter is, gaat omhoog. + "We zoeken het samen." (5 versies) | rondje om de zak meel: "Deze kant zakt naar beneden." rondje om de aardbei: "De andere kant gaat omhoog." — rondje om de aardbei: "Tik jij op de aardbei?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, de aardbei is lichter." (vangnet: "Kijk, de aardbei is lichter.") |
| 7 | de korte sliert (`lang-kort-verwisseld`) | Deze sliert? Die houdt eerder op. Een langere sliert gaat verder door. + "Kom, samen lukt het." (5 versies) | "Kijk, de slierten beginnen op dezelfde plek." rondje om de korte sliert: "Deze sliert houdt eerder op." rondje om de lange sliert: "En deze gaat nog verder." — rondje om de lange sliert: "Tik jij erop?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies! Hij loopt verder door." (vangnet: "Kijk, hij loopt verder door.") |
| 8 | de lange sliert (`lang-kort-verwisseld`) | Je tikte op de lange sliert. Korter betekent: hij stopt eerder. + "Ik help je even. We kijken samen." (5 versies) | "De slierten beginnen bij dezelfde streep." rondje om de lange sliert: "Deze sliert loopt verder door." rondje om de korte sliert: "En deze stopt eerder." — rondje om de korte sliert: "Nu jij! Tik in het rode rondje." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Zo is het: deze sliert is korter." (vangnet: "Kijk, deze sliert is korter.") |
| 9 | de middelste mand (`middelste-gekozen`) | Je koos deze mand. Die is niet de grootste. Er staat een mand die nog groter is. + "Geeft niks. We zoeken het samen." (5 versies) | rondje om de kleinste mand: "Kijk, deze mand is klein." rondje om de middelste mand: "Die is al groter." rondje om de grootste mand: "En deze is nog groter: het grootst." — rondje om de grootste mand: "Tik jij op de grootste mand?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, deze mand is het grootst." (vangnet: "Kijk, hij is hoger en breder dan alle andere.") |
| 9 | de kleinste mand (`groot-klein-verwisseld`) | Je koos deze mand. Dat is de kleinste. Het grootst is groter dan alle andere manden. + "Geeft niks. We zoeken het samen." (5 versies) | rondje om de kleinste mand: "Kijk, deze mand is klein." rondje om de middelste mand: "Die is al groter." rondje om de grootste mand: "En deze is nog groter: het grootst." — rondje om de grootste mand: "Tik jij op de grootste mand?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, deze mand is het grootst." (vangnet: "Kijk, hij is hoger en breder dan alle andere.") |
| 10 | het volle glas (`helemaal-vol`) | Dit glas? Dat zit tot bovenaan vol. Half vol is niet tot de rand, maar tot de helft. + "Kom, we kijken samen." (5 versies) | rondje om het volle glas: "Dit glas is vol." rondje om het lege glas: "Dat is leeg." rondje om het halfvolle glas: "En hier komt het sap tot de helft." — rondje om het halfvolle glas: "Tik jij erop?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies! Het sap komt tot de helft." (vangnet: "Kijk, dit glas is half vol.") |
| 10 | het lege glas (`leeg-in-plaats-van-half`) | Dit glas? Dat is helemaal leeg. Bij half vol komt het sap tot de helft. + "Kom, we kijken samen." (5 versies) | rondje om het volle glas: "Dit glas is vol." rondje om het lege glas: "Dat is leeg." rondje om het halfvolle glas: "En hier komt het sap tot de helft." — rondje om het halfvolle glas: "Tik jij erop?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies! Het sap komt tot de helft." (vangnet: "Kijk, dit glas is half vol.") |
| 11 | de grootste appel (`groot-klein-verwisseld`) | Je tikte op de grootste appel. Het kleinst is kleiner dan alle andere appels. + "We zoeken het samen." (5 versies) | rondje om de grootste appel: "Kijk, deze appel is groot." rondje om de middelste appel: "Die is al kleiner." rondje om de kleinste appel: "En deze is nog kleiner: het kleinst." — rondje om de kleinste appel: "Nu jij! Tik in het rode rondje." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Zo is het: deze appel is het kleinst." (vangnet: "Kijk, hij is kleiner dan alle andere.") |
| 11 | de middelste appel (`middelste-gekozen`) | Je tikte op de middelste appel. Er ligt een appel die nog kleiner is. + "We zoeken het samen." (5 versies) | rondje om de grootste appel: "Kijk, deze appel is groot." rondje om de middelste appel: "Die is al kleiner." rondje om de kleinste appel: "En deze is nog kleiner: het kleinst." — rondje om de kleinste appel: "Nu jij! Tik in het rode rondje." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Zo is het: deze appel is het kleinst." (vangnet: "Kijk, hij is kleiner dan alle andere.") |
| 12 | het kortste broodje (`lang-kort-verwisseld`) | Je koos dit broodje. Dat is het kortste. Het langst betekent: langer dan alle andere. + "Kom, samen lukt het." (5 versies) | "De broodjes beginnen bij dezelfde streep." rondje om het kortste broodje: "Dit broodje is kort." rondje om het middelste broodje: "Dat is langer." rondje om het langste broodje: "En dit gaat het verst door." — rondje om het langste broodje: "Tik jij op het langste broodje?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, dit broodje is het langst." (vangnet: "Kijk, dit broodje is het langst.") |
| 12 | het middelste broodje (`middelste-gekozen`) | Je koos dit broodje. Dat is niet het langste. Een ander broodje loopt nog verder door. + "Kom, samen lukt het." (5 versies) | "De broodjes beginnen bij dezelfde streep." rondje om het kortste broodje: "Dit broodje is kort." rondje om het middelste broodje: "Dat is langer." rondje om het langste broodje: "En dit gaat het verst door." — rondje om het langste broodje: "Tik jij op het langste broodje?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, dit broodje is het langst." (vangnet: "Kijk, dit broodje is het langst.") |
| 13 | de lege mand (`grootste-gekozen`) | De lege mand? Die is groot, maar gaat omhoog. Wat zwaarder is, zakt naar beneden. + "Ik help je even. We kijken samen." (5 versies) | rondje om de lege mand: "Kijk, de mand is groot. Toch gaat hij omhoog." rondje om de meloen: "De meloen zakt naar beneden." — rondje om de meloen: "Tik jij erop?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies! Zijn kant zakt naar beneden." (vangnet: "Kijk, zijn kant zakt naar beneden.") |
| 14 | het middelste broodje (`middelste-gekozen`) | Je tikte op het middelste broodje. Een ander broodje stopt nog eerder. + "Geeft niks. We zoeken het samen." (5 versies) | "De broodjes beginnen bij dezelfde streep." rondje om het langste broodje: "Dit broodje is lang." rondje om het middelste broodje: "Dat is korter." rondje om het kortste broodje: "En dit stopt het eerst." — rondje om het kortste broodje: "Nu jij! Tik in het rode rondje." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Zo is het: dit broodje is het kortst." (vangnet: "Kijk, dit broodje is het kortst.") |
| 14 | het langste broodje (`lang-kort-verwisseld`) | Je tikte op het langste broodje. Het kortst betekent: korter dan alle andere. + "Geeft niks. We zoeken het samen." (5 versies) | "De broodjes beginnen bij dezelfde streep." rondje om het langste broodje: "Dit broodje is lang." rondje om het middelste broodje: "Dat is korter." rondje om het kortste broodje: "En dit stopt het eerst." — rondje om het kortste broodje: "Nu jij! Tik in het rode rondje." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Zo is het: dit broodje is het kortst." (vangnet: "Kijk, dit broodje is het kortst.") |
| 15 | middelste appel → grootste appel → kleinste appel (`niet-bij-kleinste`) | Je begon met deze appel. Er ligt nog een kleinere. Van klein naar groot begint altijd met de kleinste. (zelfde denkfout 2 keer: "Ook nu stond de kleinste niet vooraan. Je begint links, met de kleinste.") + "Kom, we kijken samen." (5 versies) | rondje om de kleinste appel: "Kijk, deze appel is het kleinst. Die zet ik vooraan." rondje om de middelste appel: "Daarna komt deze appel." — Bliepo zet die op hun plek; rondje om de grootste appel: "Tik jij op de grootste appel?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, nu staan ze van klein naar groot." (vangnet: "Kijk, zo staan ze goed: van klein naar groot.") |
| 15 | middelste appel → kleinste appel → grootste appel (`niet-bij-kleinste`) | Je begon met deze appel. Er ligt nog een kleinere. Van klein naar groot begint altijd met de kleinste. (zelfde denkfout 2 keer: "Ook nu stond de kleinste niet vooraan. Je begint links, met de kleinste.") + "Kom, we kijken samen." (5 versies) | rondje om de kleinste appel: "Kijk, deze appel is het kleinst. Die zet ik vooraan." rondje om de middelste appel: "Daarna komt deze appel." — Bliepo zet die op hun plek; rondje om de grootste appel: "Tik jij op de grootste appel?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, nu staan ze van klein naar groot." (vangnet: "Kijk, zo staan ze goed: van klein naar groot.") |
| 15 | grootste appel → middelste appel → kleinste appel (`groot-naar-klein`) | Je zette ze van groot naar klein. Van klein naar groot: de kleinste staat vooraan. + "Kom, we kijken samen." (5 versies) | rondje om de kleinste appel: "Kijk, deze appel is het kleinst. Die zet ik vooraan." rondje om de middelste appel: "Daarna komt deze appel." — Bliepo zet die op hun plek; rondje om de grootste appel: "Tik jij op de grootste appel?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, nu staan ze van klein naar groot." (vangnet: "Kijk, zo staan ze goed: van klein naar groot.") |
| 15 | grootste appel → kleinste appel → middelste appel (`niet-bij-kleinste`) | Je begon met deze appel. Er ligt nog een kleinere. Van klein naar groot begint altijd met de kleinste. (zelfde denkfout 2 keer: "Ook nu stond de kleinste niet vooraan. Je begint links, met de kleinste.") + "Kom, we kijken samen." (5 versies) | rondje om de kleinste appel: "Kijk, deze appel is het kleinst. Die zet ik vooraan." rondje om de middelste appel: "Daarna komt deze appel." — Bliepo zet die op hun plek; rondje om de grootste appel: "Tik jij op de grootste appel?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, nu staan ze van klein naar groot." (vangnet: "Kijk, zo staan ze goed: van klein naar groot.") |
| 15 | kleinste appel → grootste appel → middelste appel (`grootste-in-het-midden`) | Je zette de grootste in het midden. De middelste hoort direct na de kleinste. + "Kom, we kijken samen." (5 versies) | rondje om de kleinste appel: "Kijk, deze appel is het kleinst. Die zet ik vooraan." rondje om de middelste appel: "Daarna komt deze appel." — Bliepo zet die op hun plek; rondje om de grootste appel: "Tik jij op de grootste appel?" (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Ja, nu staan ze van klein naar groot." (vangnet: "Kijk, zo staan ze goed: van klein naar groot.") |
| 16 | grootste beker → kleinste beker → middelste beker (`niet-bij-kleinste`) | Deze beker eerst? Er staat nog een kleinere. De kleinste hoort vooraan. (zelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan. Van klein naar groot: je begint links.") + "We zoeken het samen." (5 versies) | rondje om de kleinste beker: "Deze beker is het kleinst. Die komt vooraan." rondje om de middelste beker: "Dan komt deze beker." — Bliepo zet die op hun plek; rondje om de grootste beker: "Nu jij! Tik op de grootste beker." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies, eerst de kleinste en als laatste de grootste." (vangnet: "Kijk, nu staan ze van klein naar groot.") |
| 16 | grootste beker → middelste beker → kleinste beker (`groot-naar-klein`) | Van groot naar klein? Dat is net andersom. Van klein naar groot betekent: eerst de kleinste, dan steeds een grotere. + "We zoeken het samen." (5 versies) | rondje om de kleinste beker: "Deze beker is het kleinst. Die komt vooraan." rondje om de middelste beker: "Dan komt deze beker." — Bliepo zet die op hun plek; rondje om de grootste beker: "Nu jij! Tik op de grootste beker." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies, eerst de kleinste en als laatste de grootste." (vangnet: "Kijk, nu staan ze van klein naar groot.") |
| 16 | kleinste beker → grootste beker → middelste beker (`grootste-in-het-midden`) | De grootste staat nu in het midden. Na de kleinste komt eerst de middelste. + "We zoeken het samen." (5 versies) | rondje om de kleinste beker: "Deze beker is het kleinst. Die komt vooraan." rondje om de middelste beker: "Dan komt deze beker." — Bliepo zet die op hun plek; rondje om de grootste beker: "Nu jij! Tik op de grootste beker." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies, eerst de kleinste en als laatste de grootste." (vangnet: "Kijk, nu staan ze van klein naar groot.") |
| 16 | middelste beker → grootste beker → kleinste beker (`niet-bij-kleinste`) | Deze beker eerst? Er staat nog een kleinere. De kleinste hoort vooraan. (zelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan. Van klein naar groot: je begint links.") + "We zoeken het samen." (5 versies) | rondje om de kleinste beker: "Deze beker is het kleinst. Die komt vooraan." rondje om de middelste beker: "Dan komt deze beker." — Bliepo zet die op hun plek; rondje om de grootste beker: "Nu jij! Tik op de grootste beker." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies, eerst de kleinste en als laatste de grootste." (vangnet: "Kijk, nu staan ze van klein naar groot.") |
| 16 | middelste beker → kleinste beker → grootste beker (`niet-bij-kleinste`) | Deze beker eerst? Er staat nog een kleinere. De kleinste hoort vooraan. (zelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan. Van klein naar groot: je begint links.") + "We zoeken het samen." (5 versies) | rondje om de kleinste beker: "Deze beker is het kleinst. Die komt vooraan." rondje om de middelste beker: "Dan komt deze beker." — Bliepo zet die op hun plek; rondje om de grootste beker: "Nu jij! Tik op de grootste beker." (het kind tikt; handje na ± 6 s; vangnet 20 s of 3 keer mis) — "Precies, eerst de kleinste en als laatste de grootste." (vangnet: "Kijk, nu staan ze van klein naar groot.") |

## 4. Alle varianten

De les kiest uit elk rijtje steeds 1 zin met de gedeelde kiezer: nooit dezelfde zin 2 keer achter elkaar, ook niet over vragen heen. Het script loopt ELKE variant na: waar in het beeld, niets verklapt, geen woord 2 keer in 1 reactie, geen opdracht bij de 2e keer, na elke hint een vraag of opdracht, alles past in het tekstvak (hooguit 110 tekens per stuk).

**Vaste zinnen van de les**
- begin: "Vandaag leren we rekenwoorden. Kijk: een grote en een kleine pannenkoek." / "We gaan samen rekenwoorden leren, zoals groot en klein, vol en leeg." / "Vandaag leren we woorden als groot en klein, vol en leeg."
- naar de picknick: "De keuken is klaar. Nu gaan we picknicken in het park." / "Klaar in de keuken! Kom, we gaan picknicken in het park." / "Dat was de keuken. Nu gaan we naar het park. Daar picknicken we."
- samen: "Kom, we kijken samen." / "We zoeken het samen." / "Kom, samen lukt het." / "Ik help je even. We kijken samen." / "Geeft niks. We zoeken het samen."
- vangnet op volgorde: "Ik help je met deze." / "Kom, we zetten ze samen op volgorde." / "Geeft niks. We doen het samen."
- hulphandje bij de kleine stap: "Tik in het rode rondje." / "Tik maar in het rode rondje." / "Hier is het. Tik in het rode rondje."
- slot: "Nu ken je veel rekenwoorden." / "Jij kent nu veel rekenwoorden." / "Nu weet jij wat al die rekenwoorden betekenen."
- kaart: "Tik op de kaart." / "Tik maar op de kaart." / "Kijk, een kaart voor jou! Tik erop."
- aanmoediging (hulphandje): "Je bent goed bezig." / "Jij kunt dit." / "Het gaat goed zo." / "Probeer het maar." / "Toe maar, je doet het goed."

### 1. Welke pannenkoek is groter? Tik erop. (keuzes de kleine pannenkoek / de grote pannenkoek)

- De vraag: "Welke pannenkoek is groter? Tik erop."
- De vraag opnieuw na de hint: "Welke pannenkoek is groter, denk je?" / "Tik op de pannenkoek die groter is." / "Kies de pannenkoek die groter is."
- Samen: "Deze pannenkoek is klein." / "Kijk naar deze pannenkoek. Die is klein." — "En deze is groot." / "En deze is groot. Hij is veel breder." — "Tik jij op de grote pannenkoek?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, deze pannenkoek is groter." / "Precies! Hij is breder dan de andere." / "Zo is het: deze pannenkoek is groter." (vangnet: "Kijk, deze pannenkoek is groter." / "Kijk, hij is breder dan de andere.")
- Reactie na de lof: "Ja, deze pannenkoek is groter." / "Ja, hij is breder dan de andere." / "Hij is breder dan de andere." / "Deze pannenkoek is groter." / "Zie je, groter: dat is deze pannenkoek." / "Precies, deze pannenkoek is groter." / "Dat klopt: hij is breder dan de andere."


**de kleine pannenkoek** (`groot-klein-verwisseld`)
- eerste zin: "Je koos deze pannenkoek. Hij is kleiner dan de andere." / "Deze pannenkoek? Die is kleiner dan de andere." / "Je tikte op de kleine pannenkoek."
- hint: "Kijk van rand tot rand hoe breed ze zijn." / "Kijk hoe breed elke pannenkoek is." / "Kijk goed naar allebei de pannenkoeken."
- uitleg (2e keer): "Groter betekent hier: hij is breder." / "Een grotere pannenkoek is breder."
- hetzelfde antwoord 2 keer: "Je koos weer deze pannenkoek." / "Weer deze pannenkoek, zie ik." / "Je tikte weer op deze pannenkoek."

### 2. Welke beker is kleiner? (keuzes de grote beker / de kleine beker)

- De vraag: "Welke beker is kleiner?"
- De vraag opnieuw na de hint: "Welke beker is kleiner, denk je?" / "Tik op de beker die kleiner is." / "Kies de beker die kleiner is."
- Samen: "Deze beker is groot." / "Kijk naar deze beker. Die is groot." — "En deze is klein." / "En deze is lager en smaller." — "Tik jij op de kleine beker?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, deze beker is kleiner." / "Precies! Hij is lager en smaller dan de andere." / "Zo is het: deze beker is kleiner." (vangnet: "Kijk, deze beker is kleiner." / "Kijk, hij is lager en smaller dan de andere.")
- Reactie na de lof: "Ja, deze beker is kleiner." / "Ja, hij is lager en smaller dan de andere." / "Hij is lager en smaller dan de andere." / "Deze beker is kleiner." / "Zie je, kleiner: dat is deze beker." / "Precies, deze beker is kleiner." / "Dat klopt: hij is lager en smaller dan de andere."


**de grote beker** (`groot-klein-verwisseld`)
- eerste zin: "Je koos deze beker. Hij is hoger en breder dan de andere." / "Deze beker? Die is groter dan de andere." / "Je tikte op de grote beker."
- hint: "Kijk hoe hoog en hoe breed ze zijn." / "Kijk goed naar allebei de bekers." / "Kijk welke beker minder hoog komt."
- uitleg (2e keer): "Kleiner betekent: lager en smaller." / "Een kleine beker is niet zo hoog en niet zo breed."
- hetzelfde antwoord 2 keer: "Je koos weer deze beker." / "Weer deze beker, zie ik." / "Je tikte weer op deze beker."

### 3. Welk glas is vol? (keuzes het lege glas / het volle glas)

- De vraag: "Welk glas is vol?"
- De vraag opnieuw na de hint: "Welk glas is vol, denk je?" / "Tik op het glas dat vol is." / "Kies het glas dat vol is."
- Samen: "In dit glas zit niets." / "Kijk, dit glas is leeg." — "En dit zit tot de rand vol." / "En hier komt het sap tot de rand." — "Tik jij op het volle glas?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, dit glas is vol." / "Precies! Het sap komt tot de rand." / "Zo is het: dit glas is vol." (vangnet: "Kijk, dit glas is vol." / "Kijk, het sap komt tot de rand.")
- Reactie na de lof: "Ja, dit glas is vol." / "Ja, het sap komt tot de rand." / "Het sap komt tot de rand." / "Dit glas is vol." / "Zie je, vol: dat is dit glas." / "Precies, dit glas is vol." / "Dat klopt: het sap komt tot de rand."


**het lege glas** (`vol-leeg-verwisseld`)
- eerste zin: "Je koos dit glas. Het is leeg." / "Dit glas? Daar zit niets in." / "Je tikte op het lege glas."
- hint: "Kijk hoe hoog het sap komt." / "Zoek sap tot aan de rand." / "Kijk goed in allebei de glazen."
- uitleg (2e keer): "Vol betekent: het sap komt tot de rand." / "In een vol glas komt het sap tot bovenaan."
- hetzelfde antwoord 2 keer: "Je koos weer dit glas." / "Weer dit glas, zie ik." / "Je tikte weer op dit glas."

### 4. Welk glas is leeg? (keuzes het volle glas / het lege glas)

- De vraag: "Welk glas is leeg?"
- De vraag opnieuw na de hint: "Welk glas is leeg, denk je?" / "Tik op het glas dat leeg is." / "Kies het glas dat leeg is."
- Samen: "In dit glas zit sap." / "Kijk, dit glas is vol." — "En hier zit niets in." / "En dit glas is helemaal leeg." — "Tik jij op het lege glas?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, dit glas is leeg." / "Precies! Er zit niets in." / "Zo is het: dit glas is leeg." (vangnet: "Kijk, dit glas is leeg." / "Kijk, er zit niets in.")
- Reactie na de lof: "Ja, dit glas is leeg." / "Ja, er zit niets in." / "Er zit niets in." / "Dit glas is leeg." / "Zie je, leeg: dat is dit glas." / "Precies, dit glas is leeg." / "Dat klopt: er zit niets in."


**het volle glas** (`vol-leeg-verwisseld`)
- eerste zin: "Je koos dit glas. Het is vol." / "Dit glas? Daar zit sap in." / "Je tikte op het volle glas."
- hint: "Kijk waar geen sap in zit." / "Zoek waar niets in zit." / "Kijk goed in allebei de glazen."
- uitleg (2e keer): "Leeg betekent: er zit niets in." / "In een leeg glas zit helemaal niets."
- hetzelfde antwoord 2 keer: "Je koos weer dit glas." / "Weer dit glas, zie ik." / "Je tikte weer op dit glas."

### 5. Kijk naar de weegschaal. Wat is zwaarder? (keuzes de appel / de meloen)

- De vraag: "Kijk naar de weegschaal. Wat is zwaarder?" / "Kijk goed naar de weegschaal. Wat is zwaarder?" / "Hier staat een weegschaal. Wat is zwaarder?"
- De vraag opnieuw na de hint: "Wat is zwaarder, denk je?" / "Tik op wat zwaarder is." / "Kies wat zwaarder is."
- Samen: "Deze kant zakt naar beneden." / "Kijk, de meloen hangt laag." — "De andere kant gaat omhoog." / "De appel gaat omhoog." — "Tik jij op de meloen?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, de meloen is zwaarder." / "Precies! Die kant zakt naar beneden." / "Zo is het: de meloen is zwaarder." (vangnet: "Kijk, de meloen is zwaarder." / "Kijk, die kant zakt naar beneden.")
- Reactie na de lof: "Ja, de meloen is zwaarder." / "Ja, die kant zakt naar beneden." / "Die kant zakt naar beneden." / "De meloen is zwaarder." / "Zie je, zwaarder: dat is de meloen." / "Precies, de meloen is zwaarder." / "Dat klopt: die kant zakt naar beneden."


**de appel** (`zwaar-licht-verwisseld`)
- eerste zin: "Je koos de appel. Die hangt hoger." / "De appel? Die gaat omhoog." / "Je tikte op de appel. Die kant staat hoog."
- hint: "Iets zwaars trekt de weegschaal omlaag." / "Kijk welke kant van de weegschaal zakt." / "Kijk welke schaal lager hangt." / "Zoek de schaal die het laagst is."
- uitleg (2e keer): "Wat zwaarder is, zakt naar beneden." / "De zware kant van de weegschaal zakt naar beneden." / "Hoe zwaarder iets is, hoe lager het hangt."
- hetzelfde antwoord 2 keer: "Je koos weer de appel." / "Weer de appel, zie ik." / "Je tikte weer op de appel."

### 6. Kijk naar de weegschaal. Wat is lichter? (keuzes de zak meel / de aardbei)

- De vraag: "Kijk naar de weegschaal. Wat is lichter?" / "Kijk goed naar de weegschaal. Wat is lichter?" / "Hier staat een weegschaal. Wat is lichter?"
- De vraag opnieuw na de hint: "Wat is lichter, denk je?" / "Tik op wat lichter is." / "Kies wat lichter is."
- Samen: "Deze kant zakt naar beneden." / "Kijk, de zak meel hangt laag." — "De andere kant gaat omhoog." / "De aardbei gaat omhoog." — "Tik jij op de aardbei?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, de aardbei is lichter." / "Precies! Die kant gaat omhoog." / "Zo is het: de aardbei is lichter." (vangnet: "Kijk, de aardbei is lichter." / "Kijk, die kant gaat omhoog.")
- Reactie na de lof: "Ja, de aardbei is lichter." / "Ja, die kant gaat omhoog." / "Die kant gaat omhoog." / "De aardbei is lichter." / "Zie je, lichter: dat is de aardbei." / "Precies, de aardbei is lichter." / "Dat klopt: die kant gaat omhoog."


**de zak meel** (`zwaar-licht-verwisseld`)
- eerste zin: "Je koos de zak meel. Die hangt lager." / "De zak meel? Die gaat omlaag." / "Je tikte op de zak meel. Die kant staat laag."
- hint: "Iets lichts gaat omhoog op de weegschaal." / "Kijk welke kant van de weegschaal omhoog gaat." / "Kijk welke schaal hoger hangt." / "Zoek de schaal die het hoogst is."
- uitleg (2e keer): "Wat lichter is, gaat omhoog." / "De lichte kant van de weegschaal gaat omhoog." / "Hoe lichter iets is, hoe hoger het hangt." / "Iets lichts blijft boven hangen."
- hetzelfde antwoord 2 keer: "Je koos weer de zak meel." / "Weer de zak meel, zie ik." / "Je tikte weer op de zak meel."

### 7. Kijk naar de slierten spaghetti. Welke sliert is langer? (keuzes de korte sliert / de lange sliert)

- De vraag: "Kijk naar de slierten spaghetti. Welke sliert is langer?" / "Hier liggen slierten spaghetti. Welke sliert is langer?"
- De vraag opnieuw na de hint: "Welke sliert is langer, denk je?" / "Tik op de sliert die langer is." / "Kies de sliert die langer is."
- Samen: "De slierten beginnen bij dezelfde streep." / "Kijk, de slierten beginnen op dezelfde plek." — "Deze sliert stopt eerder." / "Deze sliert houdt eerder op." — "En deze loopt verder door." / "En deze gaat nog verder." — "Tik jij op de lange sliert?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, deze sliert is langer." / "Precies! Hij loopt verder door." / "Zo is het: deze sliert is langer." (vangnet: "Kijk, deze sliert is langer." / "Kijk, hij loopt verder door.")
- Reactie na de lof: "Ja, deze sliert is langer." / "Ja, hij loopt verder door." / "Hij loopt verder door." / "Deze sliert is langer." / "Zie je, langer: dat is deze sliert." / "Precies, deze sliert is langer." / "Dat klopt: hij loopt verder door."


**de korte sliert** (`lang-kort-verwisseld`)
- eerste zin: "Je koos deze sliert. Die stopt eerder." / "Deze sliert? Die houdt eerder op." / "Je tikte op de korte sliert."
- hint: "Ze beginnen bij dezelfde streep." / "Kijk waar elke sliert ophoudt." / "Volg elke sliert met je ogen tot het eind."
- uitleg (2e keer): "Langer betekent: hij loopt verder door." / "Een langere sliert gaat verder door."
- hetzelfde antwoord 2 keer: "Je koos weer deze sliert." / "Weer deze sliert, zie ik." / "Je tikte weer op deze sliert."

### 8. Welke sliert is korter? (keuzes de lange sliert / de korte sliert)

- De vraag: "Welke sliert is korter?"
- De vraag opnieuw na de hint: "Welke sliert is korter, denk je?" / "Tik op de sliert die korter is." / "Kies de sliert die korter is."
- Samen: "De slierten beginnen bij dezelfde streep." / "Kijk, de slierten beginnen op dezelfde plek." — "Deze sliert loopt verder door." / "Deze sliert gaat ver door." — "En deze stopt eerder." / "En deze houdt eerder op." — "Tik jij op de korte sliert?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, deze sliert is korter." / "Precies! Hij stopt eerder." / "Zo is het: deze sliert is korter." (vangnet: "Kijk, deze sliert is korter." / "Kijk, hij stopt eerder.")
- Reactie na de lof: "Ja, deze sliert is korter." / "Ja, hij stopt eerder." / "Hij stopt eerder." / "Deze sliert is korter." / "Zie je, korter: dat is deze sliert." / "Precies, deze sliert is korter." / "Dat klopt: hij stopt eerder."


**de lange sliert** (`lang-kort-verwisseld`)
- eerste zin: "Je koos deze sliert. Die loopt verder door." / "Deze sliert? Die is langer dan de andere." / "Je tikte op de lange sliert."
- hint: "Kijk welke sliert als eerste ophoudt." / "Ze beginnen bij dezelfde streep." / "Volg elke sliert met je ogen tot het eind."
- uitleg (2e keer): "Korter betekent: hij stopt eerder." / "Een kortere sliert houdt eerder op."
- hetzelfde antwoord 2 keer: "Je koos weer deze sliert." / "Weer deze sliert, zie ik." / "Je tikte weer op deze sliert."

### 9. Welke mand is het grootst? (keuzes de middelste mand / de grootste mand / de kleinste mand)

- De vraag: "Welke mand is het grootst?"
- De vraag opnieuw na de hint: "Welke mand is het grootst, denk je?" / "Tik op de mand die het grootst is." / "Kies de mand die het grootst is."
- Samen: "Deze mand is klein." / "Kijk, deze mand is klein." — "Die is groter." / "Die is al groter." — "En deze is het grootst." / "En deze is nog groter: het grootst." — "Tik jij op de grootste mand?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, deze mand is het grootst." / "Precies! Hij is hoger en breder dan alle andere." / "Zo is het: deze mand is het grootst." (vangnet: "Kijk, deze mand is het grootst." / "Kijk, hij is hoger en breder dan alle andere.")
- Reactie na de lof: "Ja, deze mand is het grootst." / "Ja, hij is hoger en breder dan alle andere." / "Hij is hoger en breder dan alle andere." / "Deze mand is het grootst." / "Zie je, het grootst: dat is deze mand." / "Precies, deze mand is het grootst." / "Dat klopt: hij is hoger en breder dan alle andere."


**de middelste mand** (`middelste-gekozen`)
- eerste zin: "Je koos deze mand. Die is niet de grootste." / "Deze mand? Die is niet het grootst." / "Je tikte op de middelste mand."
- hint: "Kijk hoe hoog en hoe breed ze zijn." / "Kijk goed naar alle manden." / "Kijk welke mand het hoogst komt."
- uitleg (2e keer): "Een andere mand is nog groter." / "Er staat een mand die nog groter is."
- hetzelfde antwoord 2 keer: "Je koos weer deze mand." / "Weer deze mand, zie ik." / "Je tikte weer op deze mand."

**de kleinste mand** (`groot-klein-verwisseld`)
- eerste zin: "Je koos deze mand. Dat is de kleinste." / "Deze mand? Die is het kleinst van allemaal." / "Je tikte op de kleinste mand."
- hint: "Kijk hoe hoog en hoe breed ze zijn." / "Kijk goed naar alle manden." / "Kijk welke mand het hoogst komt."
- uitleg (2e keer): "Het grootst betekent: groter dan alle andere." / "Het grootst is groter dan alle andere manden."
- hetzelfde antwoord 2 keer: "Je koos weer deze mand." / "Weer deze mand, zie ik." / "Je tikte weer op deze mand."

### 10. Welk glas is half vol? (keuzes het volle glas / het lege glas / het halfvolle glas)

- De vraag: "Welk glas is half vol?"
- De vraag opnieuw na de hint: "Welk glas is half vol, denk je?" / "Tik op het glas dat half vol is." / "Kies het glas dat half vol is."
- Samen: "Dit glas is vol." / "Kijk, dit glas is helemaal vol." — "Dat is leeg." / "Daar zit niets in." — "En hier komt het sap tot de helft." / "En in dit glas komt het sap tot het midden." — "Tik jij op het halfvolle glas?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, dit glas is half vol." / "Precies! Het sap komt tot de helft." / "Zo is het: dit glas is half vol." (vangnet: "Kijk, dit glas is half vol." / "Kijk, het sap komt tot de helft.")
- Reactie na de lof: "Ja, dit glas is half vol." / "Ja, het sap komt tot de helft." / "Het sap komt tot de helft." / "Dit glas is half vol." / "Zie je, half vol: dat is dit glas." / "Precies, dit glas is half vol." / "Dat klopt: het sap komt tot de helft."


**het volle glas** (`helemaal-vol`)
- eerste zin: "Je koos dit glas. Dat is helemaal vol." / "Dit glas? Dat zit tot bovenaan vol." / "Je tikte op het volle glas."
- hint: "Kijk tot waar het sap komt." / "Zoek sap tot de helft." / "Kijk goed in alle glazen."
- uitleg (2e keer): "Half vol is niet tot de rand, maar tot de helft." / "Bij half vol komt het sap tot het midden."
- hetzelfde antwoord 2 keer: "Je koos weer dit glas." / "Weer dit glas, zie ik." / "Je tikte weer op dit glas."

**het lege glas** (`leeg-in-plaats-van-half`)
- eerste zin: "Je koos dit glas. Daar zit niets in." / "Dit glas? Dat is helemaal leeg." / "Je tikte op het lege glas."
- hint: "Kijk tot waar het sap komt." / "Zoek sap tot de helft." / "Kijk goed in alle glazen."
- uitleg (2e keer): "Bij half vol komt het sap tot de helft." / "In een glas dat half vol is, komt het sap tot het midden."
- hetzelfde antwoord 2 keer: "Je koos weer dit glas." / "Weer dit glas, zie ik." / "Je tikte weer op dit glas."

### 11. Welke appel is het kleinst? (keuzes de grootste appel / de kleinste appel / de middelste appel)

- De vraag: "Welke appel is het kleinst?"
- De vraag opnieuw na de hint: "Welke appel is het kleinst, denk je?" / "Tik op de appel die het kleinst is." / "Kies de appel die het kleinst is."
- Samen: "Deze appel is groot." / "Kijk, deze appel is groot." — "Die is kleiner." / "Die is al kleiner." — "En deze is het kleinst." / "En deze is nog kleiner: het kleinst." — "Tik jij op de kleinste appel?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, deze appel is het kleinst." / "Precies! Hij is kleiner dan alle andere." / "Zo is het: deze appel is het kleinst." (vangnet: "Kijk, deze appel is het kleinst." / "Kijk, hij is kleiner dan alle andere.")
- Reactie na de lof: "Ja, deze appel is het kleinst." / "Ja, hij is kleiner dan alle andere." / "Hij is kleiner dan alle andere." / "Deze appel is het kleinst." / "Zie je, het kleinst: dat is deze appel." / "Precies, deze appel is het kleinst." / "Dat klopt: hij is kleiner dan alle andere."


**de grootste appel** (`groot-klein-verwisseld`)
- eerste zin: "Je koos deze appel. Dat is de grootste." / "Deze appel? Die is het grootst van allemaal." / "Je tikte op de grootste appel."
- hint: "Kijk hoe hoog en hoe breed ze zijn." / "Kijk goed naar alle appels." / "Kijk welke appel het minst hoog komt."
- uitleg (2e keer): "Het kleinst betekent: kleiner dan alle andere." / "Het kleinst is kleiner dan alle andere appels."
- hetzelfde antwoord 2 keer: "Je koos weer deze appel." / "Weer deze appel, zie ik." / "Je tikte weer op deze appel."

**de middelste appel** (`middelste-gekozen`)
- eerste zin: "Je koos deze appel. Die is niet de kleinste." / "Deze appel? Die is niet het kleinst." / "Je tikte op de middelste appel."
- hint: "Kijk hoe hoog en hoe breed ze zijn." / "Kijk goed naar alle appels." / "Kijk welke appel het minst hoog komt."
- uitleg (2e keer): "Een andere appel is nog kleiner." / "Er ligt een appel die nog kleiner is."
- hetzelfde antwoord 2 keer: "Je koos weer deze appel." / "Weer deze appel, zie ik." / "Je tikte weer op deze appel."

### 12. Welk broodje is het langst? (keuzes het kortste broodje / het langste broodje / het middelste broodje)

- De vraag: "Welk broodje is het langst?"
- De vraag opnieuw na de hint: "Welk broodje is het langst, denk je?" / "Tik op het broodje dat het langst is." / "Kies het broodje dat het langst is."
- Samen: "De broodjes beginnen bij dezelfde streep." / "Kijk, de broodjes beginnen op dezelfde plek." — "Dit broodje is kort." / "Kijk, dit broodje is kort." — "Dat is langer." / "Dat is al langer." — "En dit gaat het verst door." / "En dit is nog langer: het langst." — "Tik jij op het langste broodje?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, dit broodje is het langst." / "Precies! Het loopt het verst door." / "Zo is het: dit broodje is het langst." (vangnet: "Kijk, dit broodje is het langst." / "Kijk, het loopt het verst door.")
- Reactie na de lof: "Ja, dit broodje is het langst." / "Ja, het loopt het verst door." / "Het loopt het verst door." / "Dit broodje is het langst." / "Zie je, het langst: dat is dit broodje." / "Precies, dit broodje is het langst." / "Dat klopt: het loopt het verst door."


**het kortste broodje** (`lang-kort-verwisseld`)
- eerste zin: "Je koos dit broodje. Dat is het kortste." / "Dit broodje? Dat stopt het eerst." / "Je tikte op het kortste broodje."
- hint: "Kijk waar ze allemaal stoppen." / "Ze beginnen bij dezelfde streep." / "Volg elk broodje met je ogen tot het eind."
- uitleg (2e keer): "Het langst betekent: langer dan alle andere." / "Het langst is langer dan alle andere broodjes."
- hetzelfde antwoord 2 keer: "Je koos weer dit broodje." / "Weer dit broodje, zie ik." / "Je tikte weer op dit broodje."

**het middelste broodje** (`middelste-gekozen`)
- eerste zin: "Je koos dit broodje. Dat is niet het langste." / "Dit broodje? Dat is niet het langst." / "Je tikte op het middelste broodje."
- hint: "Kijk waar ze allemaal stoppen." / "Ze beginnen bij dezelfde streep." / "Volg elk broodje met je ogen tot het eind."
- uitleg (2e keer): "Een ander broodje loopt nog verder door." / "Er ligt een broodje dat nog verder doorloopt."
- hetzelfde antwoord 2 keer: "Je koos weer dit broodje." / "Weer dit broodje, zie ik." / "Je tikte weer op dit broodje."

### 13. Kijk naar de weegschaal. Wat is zwaarder? (keuzes de lege mand / de meloen)

- De vraag: "Kijk naar de weegschaal. Wat is zwaarder?" / "Kijk goed naar de weegschaal. Wat is zwaarder?" / "Hier staat een weegschaal. Wat is zwaarder?"
- De vraag opnieuw na de hint: "Wat is zwaarder, denk je?" / "Tik op wat zwaarder is." / "Kies wat zwaarder is."
- Samen: "De mand is groot, maar hij gaat omhoog." / "Kijk, de mand is groot. Toch gaat hij omhoog." — "Aan de andere kant zakt de meloen omlaag." / "De meloen zakt naar beneden." — "Tik jij op de meloen?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, de meloen is zwaarder." / "Precies! Zijn kant zakt naar beneden." / "Zo is het: de meloen is zwaarder." (vangnet: "Kijk, de meloen is zwaarder." / "Kijk, zijn kant zakt naar beneden.")
- Reactie na de lof: "Ja, de meloen is zwaarder." / "Ja, zijn kant zakt naar beneden." / "Zijn kant zakt naar beneden." / "De meloen is zwaarder." / "Zie je, zwaarder: dat is de meloen." / "Precies, de meloen is zwaarder." / "Dat klopt: zijn kant zakt naar beneden."


**de lege mand** (`grootste-gekozen`)
- eerste zin: "Je koos de lege mand. Die is groot, maar hangt hoger." / "De lege mand? Die is groot, maar gaat omhoog." / "Je tikte op de lege mand. Die kant staat hoog."
- hint: "Iets groots is niet altijd zwaar." / "Kijk welke kant van de weegschaal zakt." / "Kijk welke schaal lager hangt." / "Zoek de schaal die het laagst is."
- uitleg (2e keer): "De zware kant van de weegschaal zakt naar beneden." / "Wat zwaarder is, zakt naar beneden." / "Hoe zwaarder iets is, hoe lager het hangt."
- hetzelfde antwoord 2 keer: "Je koos weer de lege mand." / "Weer de lege mand, zie ik." / "Je tikte weer op de lege mand."

### 14. Welk broodje is het kortst? (keuzes het middelste broodje / het langste broodje / het kortste broodje)

- De vraag: "Welk broodje is het kortst?"
- De vraag opnieuw na de hint: "Welk broodje is het kortst, denk je?" / "Tik op het broodje dat het kortst is." / "Kies het broodje dat het kortst is."
- Samen: "De broodjes beginnen bij dezelfde streep." / "Kijk, de broodjes beginnen op dezelfde plek." — "Dit broodje is lang." / "Kijk, dit broodje is lang." — "Dat is korter." / "Dat is al korter." — "En dit stopt het eerst." / "En dit is nog korter: het kortst." — "Tik jij op het kortste broodje?" / "Tik jij erop?" / "Nu jij! Tik in het rode rondje." — "Ja, dit broodje is het kortst." / "Precies! Het stopt het eerst." / "Zo is het: dit broodje is het kortst." (vangnet: "Kijk, dit broodje is het kortst." / "Kijk, het stopt het eerst.")
- Reactie na de lof: "Ja, dit broodje is het kortst." / "Ja, het stopt het eerst." / "Het stopt het eerst." / "Dit broodje is het kortst." / "Zie je, het kortst: dat is dit broodje." / "Precies, dit broodje is het kortst." / "Dat klopt: het stopt het eerst."


**het middelste broodje** (`middelste-gekozen`)
- eerste zin: "Je koos dit broodje. Dat is niet het kortste." / "Dit broodje? Dat is niet het kortst." / "Je tikte op het middelste broodje."
- hint: "Ze beginnen bij dezelfde streep." / "Kijk waar ze allemaal stoppen." / "Kijk welk broodje als eerste ophoudt."
- uitleg (2e keer): "Een ander broodje stopt nog eerder." / "Er ligt een broodje dat nog eerder stopt."
- hetzelfde antwoord 2 keer: "Je koos weer dit broodje." / "Weer dit broodje, zie ik." / "Je tikte weer op dit broodje."

**het langste broodje** (`lang-kort-verwisseld`)
- eerste zin: "Je koos dit broodje. Dat is het langste." / "Dit broodje? Dat loopt het verst door." / "Je tikte op het langste broodje."
- hint: "Ze beginnen bij dezelfde streep." / "Kijk waar ze allemaal stoppen." / "Kijk welk broodje als eerste ophoudt."
- uitleg (2e keer): "Het kortst betekent: korter dan alle andere." / "Het kortst is korter dan alle andere broodjes."
- hetzelfde antwoord 2 keer: "Je koos weer dit broodje." / "Weer dit broodje, zie ik." / "Je tikte weer op dit broodje."

### 15. Zet de appels op volgorde. Van klein naar groot. Tik eerst op de kleinste.

- De vraag: "Zet de appels op volgorde. Van klein naar groot. Tik eerst op de kleinste."
- De vraag opnieuw na de hint: "Zet de appels van klein naar groot." / "Zet ze nu van klein naar groot." / "Tik ze aan van klein naar groot."
- Samen: "Deze appel is het kleinst. Die komt vooraan." / "Kijk, deze appel is het kleinst. Die zet ik vooraan." — "Dan komt deze appel." / "Daarna komt deze appel." — "Tik jij op de grootste appel?" / "Nu jij! Tik op de grootste appel." / "Tik jij in het rode rondje?" — "Ja, nu staan ze van klein naar groot." / "Precies, eerst de kleinste en als laatste de grootste." / "Zo is het: klein, groter, het grootst." (vangnet: "Kijk, nu staan ze van klein naar groot." / "Kijk, zo staan ze goed: van klein naar groot.")
- Reactie na de lof: "Ja, van klein naar groot." / "Ja, eerst de kleinste en als laatste de grootste." / "Klein, groter, het grootst." / "Nu staan de appels van klein naar groot." / "Zie je, de kleinste staat vooraan." / "Precies, zo staan ze goed." / "Dat klopt: de grootste staat achteraan."
- Hulphandje: "Tik op een appel. Die komt dan hier." / "Tik maar op een appel. Die komt dan hier." / "Hier is een lege plek. Tik op een appel."


**middelste appel → grootste appel → kleinste appel** (`niet-bij-kleinste`)
- eerste zin: "Je begon met deze appel. Er ligt nog een kleinere." / "Deze appel eerst? Er ligt nog een kleinere." / "Je zette eerst deze appel. Maar er ligt nog een kleinere."
- hint: "Kijk welke het kleinst is." / "Zoek eerst de kleinste." / "Kijk goed welke appel het kleinst is."
- uitleg (2e keer): "De kleinste hoort vooraan." / "Van klein naar groot begint altijd met de kleinste."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."
- dezelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan." / "Ook nu stond de kleinste niet vooraan." + "Van klein naar groot: je begint links." / "Je begint links, met de kleinste."

**middelste appel → kleinste appel → grootste appel** (`niet-bij-kleinste`)
- eerste zin: "Je begon met deze appel. Er ligt nog een kleinere." / "Deze appel eerst? Er ligt nog een kleinere." / "Je zette eerst deze appel. Maar er ligt nog een kleinere."
- hint: "Kijk welke het kleinst is." / "Zoek eerst de kleinste." / "Kijk goed welke appel het kleinst is."
- uitleg (2e keer): "De kleinste hoort vooraan." / "Van klein naar groot begint altijd met de kleinste."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."
- dezelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan." / "Ook nu stond de kleinste niet vooraan." + "Van klein naar groot: je begint links." / "Je begint links, met de kleinste."

**grootste appel → middelste appel → kleinste appel** (`groot-naar-klein`)
- eerste zin: "Je zette ze van groot naar klein." / "Van groot naar klein? Dat is net andersom." / "De grootste staat nu vooraan."
- hint: "Begin met de kleinste en pak dan steeds een grotere." / "De kleinste komt eerst, de grootste als laatste." / "Begin bij de kleinste. Pak daarna steeds een grotere."
- uitleg (2e keer): "Van klein naar groot: de kleinste staat vooraan." / "Van klein naar groot betekent: eerst de kleinste, dan steeds een grotere." / "De kleinste hoort helemaal aan het begin."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."

**grootste appel → kleinste appel → middelste appel** (`niet-bij-kleinste`)
- eerste zin: "Je begon met deze appel. Er ligt nog een kleinere." / "Deze appel eerst? Er ligt nog een kleinere." / "Je zette eerst deze appel. Maar er ligt nog een kleinere."
- hint: "Kijk welke het kleinst is." / "Zoek eerst de kleinste." / "Kijk goed welke appel het kleinst is."
- uitleg (2e keer): "De kleinste hoort vooraan." / "Van klein naar groot begint altijd met de kleinste."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."
- dezelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan." / "Ook nu stond de kleinste niet vooraan." + "Van klein naar groot: je begint links." / "Je begint links, met de kleinste."

**kleinste appel → grootste appel → middelste appel** (`grootste-in-het-midden`)
- eerste zin: "Je zette de grootste in het midden." / "De grootste staat nu in het midden." / "In het midden staat nu de grootste."
- hint: "Tik steeds op de kleinste die nog over is." / "Pak steeds de kleinste die nog over is." / "Kijk na elke tik welke nu het kleinst is."
- uitleg (2e keer): "Na de kleinste komt eerst de middelste." / "De middelste hoort direct na de kleinste."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."

### 16. Zet de bekers op volgorde. Van klein naar groot. Tik eerst op de kleinste.

- De vraag: "En nu de bekers. Zet ze ook op volgorde, van klein naar groot. Tik eerst op de kleinste beker."
- De vraag opnieuw na de hint: "Zet de bekers van klein naar groot." / "Zet ze nu van klein naar groot." / "Tik ze aan van klein naar groot."
- Samen: "Deze beker is het kleinst. Die komt vooraan." / "Kijk, deze beker is het kleinst. Die zet ik vooraan." — "Dan komt deze beker." / "Daarna komt deze beker." — "Tik jij op de grootste beker?" / "Nu jij! Tik op de grootste beker." / "Tik jij in het rode rondje?" — "Ja, nu staan ze van klein naar groot." / "Precies, eerst de kleinste en als laatste de grootste." / "Zo is het: klein, groter, het grootst." (vangnet: "Kijk, nu staan ze van klein naar groot." / "Kijk, zo staan ze goed: van klein naar groot.")
- Reactie na de lof: "Ja, van klein naar groot." / "Ja, eerst de kleinste en als laatste de grootste." / "Klein, groter, het grootst." / "Nu staan de bekers van klein naar groot." / "Zie je, de kleinste staat vooraan." / "Precies, zo staan ze goed." / "Dat klopt: de grootste staat achteraan."
- Hulphandje: "Tik op een beker. Die komt dan hier." / "Tik maar op een beker. Die komt dan hier." / "Hier is een lege plek. Tik op een beker."


**grootste beker → kleinste beker → middelste beker** (`niet-bij-kleinste`)
- eerste zin: "Je begon met deze beker. Er staat nog een kleinere." / "Deze beker eerst? Er staat nog een kleinere." / "Je zette eerst deze beker. Maar er staat nog een kleinere."
- hint: "Kijk welke het kleinst is." / "Zoek eerst de kleinste." / "Kijk goed welke beker het kleinst is."
- uitleg (2e keer): "De kleinste hoort vooraan." / "Van klein naar groot begint altijd met de kleinste."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."
- dezelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan." / "Ook nu stond de kleinste niet vooraan." + "Van klein naar groot: je begint links." / "Je begint links, met de kleinste."

**grootste beker → middelste beker → kleinste beker** (`groot-naar-klein`)
- eerste zin: "Je zette ze van groot naar klein." / "Van groot naar klein? Dat is net andersom." / "De grootste staat nu vooraan."
- hint: "Begin met de kleinste en pak dan steeds een grotere." / "De kleinste komt eerst, de grootste als laatste." / "Begin bij de kleinste. Pak daarna steeds een grotere."
- uitleg (2e keer): "Van klein naar groot: de kleinste staat vooraan." / "Van klein naar groot betekent: eerst de kleinste, dan steeds een grotere." / "De kleinste hoort helemaal aan het begin."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."

**kleinste beker → grootste beker → middelste beker** (`grootste-in-het-midden`)
- eerste zin: "Je zette de grootste in het midden." / "De grootste staat nu in het midden." / "In het midden staat nu de grootste."
- hint: "Tik steeds op de kleinste die nog over is." / "Pak steeds de kleinste die nog over is." / "Kijk na elke tik welke nu het kleinst is."
- uitleg (2e keer): "Na de kleinste komt eerst de middelste." / "De middelste hoort direct na de kleinste."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."

**middelste beker → grootste beker → kleinste beker** (`niet-bij-kleinste`)
- eerste zin: "Je begon met deze beker. Er staat nog een kleinere." / "Deze beker eerst? Er staat nog een kleinere." / "Je zette eerst deze beker. Maar er staat nog een kleinere."
- hint: "Kijk welke het kleinst is." / "Zoek eerst de kleinste." / "Kijk goed welke beker het kleinst is."
- uitleg (2e keer): "De kleinste hoort vooraan." / "Van klein naar groot begint altijd met de kleinste."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."
- dezelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan." / "Ook nu stond de kleinste niet vooraan." + "Van klein naar groot: je begint links." / "Je begint links, met de kleinste."

**middelste beker → kleinste beker → grootste beker** (`niet-bij-kleinste`)
- eerste zin: "Je begon met deze beker. Er staat nog een kleinere." / "Deze beker eerst? Er staat nog een kleinere." / "Je zette eerst deze beker. Maar er staat nog een kleinere."
- hint: "Kijk welke het kleinst is." / "Zoek eerst de kleinste." / "Kijk goed welke beker het kleinst is."
- uitleg (2e keer): "De kleinste hoort vooraan." / "Van klein naar groot begint altijd met de kleinste."
- hetzelfde antwoord 2 keer: "Je zette ze weer in dezelfde volgorde." / "Weer dezelfde volgorde, zie ik."
- dezelfde denkfout 2 keer: "Weer stond de kleinste niet vooraan." / "Ook nu stond de kleinste niet vooraan." + "Van klein naar groot: je begint links." / "Je begint links, met de kleinste."
