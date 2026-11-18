# KEUZES-KLOK — vragen en schatting voor Sara

18 november 2026. Hoort bij WIJZIGINGEN-ZINNEN-KLOK.md (de zinnen van de gouden les Klok, "Hoe laat is het?", zijn warmer gemaakt en in varianten gezet, zoals de proefles Tellen). Dit bestand is alleen van deze les; de coördinator zet het later in KEUZES-VOOR-SARA.md. De Klok heeft geen extra les.

Niets is online gezet. Er is geen stem gemaakt en geen tegoed gebruikt. De database is niet aangeraakt.

## 1. Schatting: stem (Ruth, ElevenLabs). Er is NIETS gemaakt.

Nu praat Bliepo in deze les met de stem van de browser. Dat kost niets. Wil je later alles met Ruth laten inspreken, dan is dit de schatting (1 teken is ongeveer 1 tegoed):

| Les | Verschillende zinnen nu | Daarvan nieuw | Tekens van de nieuwe zinnen |
|---|---|---|---|
| Gouden les Klok | ongeveer 680 (was 360) | ongeveer 380 | ongeveer 16.600 |

- Dat is ver boven de 5.000 (harde regel 9). **Ik maak dus niets zonder jouw ja.**
- Rekent ElevenLabs een half tegoed per teken (hangt af van het model), dan is het ongeveer 8.300. Dus tussen ± 8.300 en ± 16.600 tegoed.
- Veel zinnen bestaan 12 keer, 1 per uur ("Je koos 6 uur. Ik lees een andere tijd.", "Kijk, in het oranje rondje staat de 3."). Alleen de nieuwe zinnen zonder getal: ongeveer 210 zinnen, 9.400 tekens.
- Niet meegeteld: de vaste rijtjes van alle lessen (lof, eindzinnen; die zijn niet veranderd), en de aanmoediging plus de zin van het hulphandje aan elkaar.
- Het is een schatting, geen precieze telling.
- Goedkoper kan: eerst alleen de zinnen zonder getal laten inspreken en de rest met de browserstem.

## 2. Vragen (je hoeft alleen ja of nee te zeggen)

1. **De beginzin.** Was: "In deze les lees je op de klok hoe laat het is. Je kijkt naar de wijzers en kiest het hele uur. Weet jij al hoe dat moet?" Nu 1 van 3, bijvoorbeeld: "Vandaag lezen we op de klok hoe laat het is. We kijken naar de wijzers. Kun jij al klokkijken?" Ja en Nee werken precies als eerst. Goed zo?
2. **"Tik nu zelf op het antwoord."** Na samen voordoen zei Bliepo "Dus het is 3 uur." en dan "Tik nu zelf op 3 uur." (2 keer 3 uur). Nu noemt hij het antwoord niet nog een keer; er staat dan nog maar 1 knop. Goed zo?
3. **"Je zat er vlak naast."** Bij de meeste klokken weet het kind dan meteen het antwoord (er ligt maar 1 keuze vlak naast). Daar zegt Bliepo nu: "Je koos 6 uur. Ik lees een andere tijd." Bij 2 klokken liggen er 2 keuzes vlak naast; daar blijft "Je zat er vlak naast." Goed zo?
4. **"Hoe heet de grote wijzer?"** Dat was de vraag na de hint, maar het antwoord is "de grote wijzer". Nu: "Hoe heet deze paarse wijzer?" (zo ook bij de kleine wijzer: "Hoe heet deze korte oranje wijzer?"). Goed zo?
5. **De bonus.** Was: "Je had ze allemaal in 1 keer goed! Nog 1 als toetje." Nu: "Je had ze allemaal meteen goed! Hier is nog een toetje." Vind je "toetje" een goed woord?
6. **"Weet jij hoe dit heet?"** (de eerste vraag van de uitleg, bij de getallenlijn). Ik heb hem laten staan. Wil je liever "Hoe heet dit?" Dat is korter en past bij de volgende vraag ("Hoe heet dit nu?").
7. **Bij "Is het nu 7 uur?"** zegt Bliepo na goed een lofzin en dan nog 1 zin ("Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden."). De 2e zin van de uitleg ("De kleine wijzer is de 7 al voorbij, maar nog niet bij de 8.") komt daar nooit: de les zegt na goed hooguit 2 zinnen. Dat was al zo; ik heb het niet veranderd. Wil je die 2e zin er wel bij?

## 3. Voorstel voor BOUWREGELS (niet zelf erin gezet)

- **De vraag na de hint noemt het antwoord niet** (hoort bij 15.17). In de Klok stond "Hoe heet de grote wijzer?" terwijl dat het antwoord was. Het fouttabel-script van de Klok controleert dit nu voor elke vraag.
- **"Vlak naast", "bijna" en "dichtbij" bij keuzes: alleen als er dan nog 2 keuzes vlak naast liggen** (hoort bij 15.17; bij Plussommen en Meten geldt dit al voor getallen).
- **De kleine stap na samen voordoen noemt het antwoord niet nog een keer** ("Tik nu zelf op het antwoord."), want het klonk net (hoort bij "een getal niet 2 keer achter elkaar" en 15.29).
- **Bij 1 vraag komt geen zin 2 keer**, ook niet eerst als hint en later als uitleg of bij samen voordoen (hoort bij 15.29).
- **De vraag na de hint is nooit precies dezelfde zin als de 1e keer**, maar wel dezelfde vraag ("Hoe laat is het, denk je?").
- **Een hint eindigt niet met een vraag als de vraag van de les er meteen achteraan komt** (2 vragen achter elkaar). Bij Huisnummers is dit ook zo gedaan.

## 4. Gemeld, niet veranderd

- `npm run stemdubbel` meldt 2 korte opnames met het woord 2 keer: "1." en "11." Dat was al bekend (FOUTEN-VOORBEELDEN F8); de gouden lessen knippen het tweede woord weg. Een nieuwe opname maken kost tegoed en kan pas met jouw ja.
- In het zinnenbestand staat nog "Klaar met kijken? Tik dan op de blauwe pijl." (`pijlUitleg`). Die zin wordt sinds 10 november nergens meer gezegd. Ik heb hem laten staan (harde regel 3).
- De vaste rijtjes van alle gouden lessen staan in het zinnenbestand van de Klok. Daardoor moet iedereen die de Klok aanpast extra opletten. Voorstel voor later: de rijtjes naar een eigen bestand (bijvoorbeeld `bliepo-rijtjes.ts`) verhuizen. Dat raakt alle lessen, dus niet nu gedaan.
- Bij "zet de kleine wijzer op de …" zegt Bliepo na de 2e keer mis 4 korte zinnen in 1 keer (eerste zin, uitleg, "Hier is de 2 …", "Tik er maar op."). Dat was al zo. De nieuwe zinnen zijn niet langer dan de oude.
- **Zetten met een fout is alleen door het script gekeurd.** De automatische speeltests zetten de wijzer altijd goed; een verkeerd gezette wijzer spelen ze niet na (dat was al zo). De zinnen bij zetten zijn wel allemaal nagelopen door het fouttabel-script (lengte, getallen, opdracht). Wil je dit zien, zet dan in de uitleg de kleine wijzer 2 keer verkeerd.
- **1 keer "Heel knap!" dubbel gemeten.** In 1 van de 3 speelrondes met alles goed meldde de controle dat de lofzin "Heel knap!" binnen 3 seconden 2 keer startte (F8). In de 2 andere rondes en in alle andere tests: 0 keer. De lofzinnen en de stem zijn niet door mij veranderd, en er draaiden op dat moment tests van andere lessen tegelijk. Ik heb het niet kunnen herhalen; graag nog een keer meten als de computer rustig is.
- **2 stemmen door elkaar.** Voor een deel van de oude zinnen bestaat al een opname van Ruth (12 tot 17 per ronde); alle nieuwe zinnen zegt Bliepo met de stem van de browser. Dat blijft zo tot de nieuwe zinnen zijn ingesproken (zie §1).
