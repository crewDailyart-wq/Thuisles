# KEUZES-GELD — vragen en schatting voor Sara

18 november 2026. Hoort bij WIJZIGINGEN-ZINNEN-GELD.md (de zinnen van de gouden les Geld, "Munten en briefjes", zijn warmer gemaakt en in varianten gezet, zoals de proefles Tellen). Dit bestand is alleen van deze les; de coördinator zet het later in KEUZES-VOOR-SARA.md. Geld heeft geen extra les.

Niets is online gezet. Er is geen stem gemaakt en geen tegoed gebruikt. De database is niet aangeraakt. De plaatjes van het geld zijn niet aangeraakt.

## 1. Schatting: stem (Ruth, ElevenLabs). Er is NIETS gemaakt.

Nu praat Bliepo in deze les met de stem van de browser. Dat kost niets. Wil je later alles met Ruth laten inspreken, dan is dit de schatting (1 teken is ongeveer 1 tegoed):

| Les | Verschillende zinnen nu | Daarvan nieuw | Tekens van de nieuwe zinnen |
|---|---|---|---|
| Gouden les Geld | ongeveer 660 (was 230) | ongeveer 480 | ongeveer 27.500 |

- Dat is ver boven de 5.000 (harde regel 9). **Ik maak dus niets zonder jouw ja.**
- Rekent ElevenLabs een half tegoed per teken (hangt af van het model), dan is het ongeveer 13.800. Dus tussen ± 13.800 en ± 27.500 tegoed.
- **Waarom zoveel:** na de hint zegt Bliepo de hint en de vraag in 1 keer ("Een munt is rond en van metaal. Waar zie je een munt van 1 euro?"). Elke hint met elke versie van de vraag telt dan als een aparte zin: 175 stuks, ongeveer 14.000 tekens.
- **Goedkoper kan (advies):** de hint en de vraag los laten inspreken. Dan zijn het ongeveer 340 nieuwe zinnen en ongeveer 15.000 tekens (± 7.500 tot ± 15.000 tegoed). Het kind hoort geen verschil. Dat is een kleine aanpassing in de les; die doe ik pas als jij ja zegt.
- Het hulphandje zegt een aanmoediging en een opdracht in 1 keer ("Jij kunt dit. Tik op de munt."). Die tellen hier als 1 zin per combinatie (40 nieuw).
- De eindzin en "Tik op de kaart." gaan ook in 1 keer (20 nieuw).
- Niet meegeteld: de lofzin en de zin erna zijn 2 losse zinnen; de lofzinnen zelf zijn van alle lessen samen.
- Het is een schatting, geen precieze telling.

## 2. Vragen (je hoeft alleen ja of nee te zeggen)

1. **De beginzin.** Jouw goedgekeurde zin is gebleven ("In deze les ontdek je hoeveel munten en briefjes waard zijn. Je kijkt naar het getal op het geld."). Er zijn 2 warmere versies bij gekomen ("Vandaag kijken we naar munten en briefjes. …"). De les kiest er steeds 1. Goed zo?
2. **Samen voordoen: "Tik jij op het geld in het rondje?"** Eerst zei Bliepo "Hier is de munt van 1 euro. …" en dan "Tik jij op de munt van 1 euro?" (2 keer hetzelfde bedrag). Nu zegt hij waar het kind tikt. Goed zo?
3. **"Die munt is helemaal goud."** (als het kind 50 cent kiest). Eerst: "Op de munt van 50 cent staat een 50." (3 keer 50). Goed zo?
4. **"Je keek weer alleen naar het eerste cijfer." is weg.** De 1e keer zei Bliepo "Op dat briefje staan 2 cijfers.", niet iets over het eerste cijfer. Nu: "Je koos weer het getal met 2 cijfers." Goed zo?
5. **Het woord "rechthoek"** ("Een briefje is een rechthoek."). Ik heb het laten staan; het stond er al en is goedgekeurd. Vind je het een goed woord voor groep 3? (Er is ook een versie zonder: "Een briefje is van papier, met 4 hoeken.")
6. **"En hier nog een."** (Bliepo wijst de 2e munt aan). Het is een hoeveelheid, dus volgens de cijferafspraak zou het "En hier nog 1." zijn. Maar vlak erna zegt Bliepo "Er is er nog 1." Ik heb het laten staan. Wil je toch het cijfer?
7. **De hint en de vraag los laten inspreken** (zie de schatting hierboven). Mag ik dat aanpassen als de stem gemaakt wordt?

## 3. Voorstel voor BOUWREGELS (niet zelf erin gezet)

- **Bij samen voordoen noemt de "nu jij"-zin het antwoord niet nog een keer**, maar zegt hij waar het kind tikt ("in het rondje"). Bliepo heeft het antwoord dan net gezegd. Hoort bij "een getal niet 2 keer achter elkaar" en bij 15.37.
- **Een "weer"-zin gebruikt de woorden van de 1e keer.** Zei Bliepo eerst "2 cijfers", dan niet daarna "je keek weer naar het eerste cijfer". Het fouttabel-script van Geld controleert nu dat elke "weer"-zin het woord "weer" heeft en alleen komt als het klopt.
- **Ook de lofzin en de zin erna herhalen geen getal** ("Al 3 goed achter elkaar! Ja, je vond ze alle 3."). In Geld kiest de les nu een zin zonder dat getal. Waarschijnlijk speelt dit ook in andere gouden lessen; niet nagekeken.
- **Een hint en de vraag erachter worden 2 losse opnames**, geen 1 lange. Dat scheelt veel tegoed (in Geld ongeveer de helft).
- **De hint herhaalt geen stuk van de eerste zin.** ("Maar we zoeken een munt." en dan "We zoeken een munt. Een munt is rond."). Het script van Geld controleert dat er bij elke eerste zin minstens 2 hints passen.

## 4. Gemeld, niet veranderd

- `npm run stemdubbel` meldt 2 korte opnames met het woord 2 keer: "1." en "11." Dat was al bekend (FOUTEN-VOORBEELDEN F8); de gouden lessen knippen het tweede woord weg. Een nieuwe opname maken kost tegoed en kan pas met jouw ja.
- De vraag "Is het 5 euro, 50 euro of 50 cent?" noemt 2 keer 50. Dat zijn de 3 keuzes van de oude les. Niet veranderd.
- De zinnen voor "niet duidelijk" (als Bliepo niet weet wat het kind dacht) komen in deze les nooit voor: alle keuzes zijn vast. Ze staan er nog als vangnet; niets weggehaald (harde regel 3).
- In de oude fouttabel stond 1 getal zonder kleur ("met 4 hoeken"). Het is nu wit. Het script keurt nu elke variant daarop.
