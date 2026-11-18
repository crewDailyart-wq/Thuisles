# KEUZES-METEN — vragen en schatting voor Sara

18 november 2026. Hoort bij WIJZIGINGEN-ZINNEN-METEN.md (de zinnen van de gouden les Meten, "Hoe groot is het?", zijn warmer gemaakt en in varianten gezet, zoals de proefles Tellen). Dit bestand is alleen van deze les; de coördinator zet het later in KEUZES-VOOR-SARA.md. Meten heeft geen extra les.

Niets is online gezet. Er is geen stem gemaakt en geen tegoed gebruikt. De database is niet aangeraakt.

## 1. Schatting: stem (Ruth, ElevenLabs). Er is NIETS gemaakt.

Nu praat Bliepo in deze les met de stem van de browser. Dat kost niets. Wil je later alles met Ruth laten inspreken, dan is dit de schatting (1 teken is ongeveer 1 tegoed):

| Les | Verschillende zinnen nu | Daarvan nieuw | Tekens van de nieuwe zinnen |
|---|---|---|---|
| Gouden les Meten | ongeveer 630 (was 275) | ongeveer 390 | ongeveer 16.500 |

- Dat is ver boven de 5.000 (harde regel 9). **Ik maak dus niets zonder jouw ja.**
- Rekent ElevenLabs een half tegoed per teken (hangt af van het model), dan is het ongeveer 8.300. Dus tussen ± 8.300 en ± 16.500 tegoed.
- Bij typen mag het kind elk getal typen. Ik heb alleen de getallen geteld die vaak voorkomen. Met alle getallen tot 30 erbij ("Je kwam weer op 23.") is het ongeveer 430 zinnen en 17.200 tekens.
- Het hulphandje zegt een aanmoediging en een opdracht in 1 keer ("Jij kunt dit. Tik op dit blaadje."). Die tellen hier als 1 zin per combinatie (70 stuks).
- Niet meegeteld: de lofzin en de zin erna aan elkaar (heel veel combinaties; dat was al zo).
- Het is een schatting, geen precieze telling.
- Goedkoper kan: eerst alleen de zinnen zonder getal laten inspreken en de rest met de browserstem. Hoeveel dat kost reken ik uit als je dat wilt.

## 2. Vragen (je hoeft alleen ja of nee te zeggen)

1. **"Kaartjes" in plaats van "zinnen" (vraag 2).** De vraag was "Welke 2 zinnen kloppen?". Op een kaartje staat een plaatje met 1 woord ("kleinst"), geen zin. Nu: "Welke 2 kaartjes kloppen?" Goed zo?
2. **"Typ het getal." erbij (vraag 11).** De vraag was alleen "Nog een tafel vol blaadjes. Hoe groot is deze tafel?". Nu staat er ook bij wat het kind doet. Goed zo?
3. **Het laatste getal bij samen tellen.** Eerst zei Bliepo "10." en dan "Samen geteld: de tafel is 10 blaadjes groot." (2 keer 10). Nu zegt hij het laatste getal in de zin erna: "En 10! Zo groot is de tafel." Goed zo?
4. **Het woord "bedekt"** ("Ze bedekken de hele tafel.", "De zon bedekt 9 tegels."). Ik heb het laten staan: de hele les gaat erover. Vind je het een goed woord voor groep 3? (Andere mogelijkheid: "Achter de zon zitten 9 tegels." Die zin is er nu als variant bij.)
5. **Het woord "aantal"** is weg ("Het aantal hokjes telt." is nu "Het gaat om hoeveel hokjes het zijn."). Goed zo?
6. **De opdracht bij samen tellen.** Bliepo telt hardop mee ("1.", "2."). De opdracht "Tik elk blaadje 1 keer aan." verdwijnt dan uit beeld. Dat was al zo, ook bij Tellen, Minsommen en Meer-minder. Wil je dat de opdracht blijft staan terwijl Bliepo telt? Advies: ja, maar dan voor alle lessen tegelijk op dezelfde manier (dat is geen zin, maar een plek op het scherm).

## 3. Voorstel voor BOUWREGELS (niet zelf erin gezet)

- **Na "1 van je 2 kaartjes klopt" wijst ook de hint geen kaartje aan** (hoort bij 15.17). In Meten zei 1 hint "Het kleinste schilderij bedekt de minste tegels." Daarmee wist het kind welk kaartje niet klopte. Het fouttabel-script van Meten controleert dit nu.
- **Bij samen tellen zegt Bliepo het laatste getal in de zin erna** ("En 10! Zo groot is de tafel."), niet eerst los en dan nog een keer (hoort bij "een getal niet 2 keer achter elkaar"). Zo is het nu ook bij Plussommen.
- **Bij elke eerste zin passen minstens 2 hints in het tekstvak.** Past er maar 1, dan kan de kiezer niet wisselen en hoort het kind toch 2 keer dezelfde hint. Het script van Meten controleert dit nu.
- **Een woord voor hetzelfde ding blijft in de hele les gelijk** ("kaartjes", niet de ene keer "zinnen" en de andere keer "kaartjes"). Hoort bij 3.12.

## 4. Gemeld, niet veranderd

- `npm run stemdubbel` meldt 2 korte opnames met het woord 2 keer: "1." en "11." Dat was al bekend (FOUTEN-VOORBEELDEN F8); de gouden lessen knippen het tweede woord weg. Een nieuwe opname maken kost tegoed en kan pas met jouw ja.
- In de code staat een soort denkfout die nooit kan voorkomen ("na een tafel een kleinere tafel", `kleiner-erna`): als de eerste plaatjes goed liggen, is elk plaatje dat nog over is groter. De zinnen staan er nog en zijn nagelopen; ik heb niets weggehaald (harde regel 3).
- De vraag met de 4 tafels: 2 tafels hebben 6 borden, maar op 1 tafel is nog plek over. Die tafel telt als de grootste. Dat is de inhoud van Squla en is niet veranderd.
