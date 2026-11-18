# KEUZES-TIJD — vragen en schatting voor Sara

18 november 2026. Hoort bij WIJZIGINGEN-ZINNEN-TIJD.md (de zinnen van de gouden les Tijd, "Dagen van de week", zijn warmer gemaakt en in varianten gezet, zoals de proefles Tellen). Dit bestand is alleen van deze les; de coördinator zet het later in KEUZES-VOOR-SARA.md. Tijd heeft geen extra les.

Niets is online gezet. Er is geen stem gemaakt en geen tegoed gebruikt. De database is niet aangeraakt.

## 1. Schatting: stem (Ruth, ElevenLabs). Er is NIETS gemaakt.

Nu praat Bliepo in deze les met de stem van de browser. Dat kost niets. Wil je later alles met Ruth laten inspreken, dan is dit de schatting (1 teken is ongeveer 1 tegoed):

| Les | Verschillende stukken nu | Daarvan nieuw | Tekens van de nieuwe stukken |
|---|---|---|---|
| Gouden les Tijd | ongeveer 630 (was 250) | ongeveer 400 | ongeveer 22.000 |

- Dat is ver boven de 5.000 (harde regel 9). **Ik maak dus niets zonder jouw ja.**
- Rekent ElevenLabs een half tegoed per teken (hangt af van het model), dan is het ongeveer 11.000. Dus tussen ± 11.000 en ± 22.000 tegoed.
- Een groot deel komt doordat de hint en de vraag erachter samen 1 stuk zijn (elke hint met elke passende vraag). Worden hint en vraag los ingesproken, dan is het minder.
- Veel nieuwe stukken bestaan per dag of per getal ("Je tikte op dinsdag. …"). De nieuwe stukken zonder dag of getal: ongeveer 110 stukken, 6.100 tekens.
- Niet meegeteld: de vaste rijtjes van alle lessen (lof, eindzinnen; niet veranderd).
- Het is een schatting, geen precieze telling.
- Goedkoper kan: eerst alleen de stukken zonder dag of getal laten inspreken en de rest met de browserstem.

## 2. Vragen (je hoeft alleen ja of nee te zeggen)

1. **De beginzin.** "In deze les leer je hoe een week in elkaar zit." vind ik wat vaag. Ik heb hem laten staan en er 2 versies bij gezet, bijvoorbeeld: "Vandaag leren we hoe de week loopt. Elke dag is een wagon van de weektrein." Mag de oude zin eruit?
2. **"Tik jij op het getal?"** Na samen voordoen zei Bliepo "Dat zijn 2 dagen zonder school." en dan "Tik jij op de 2?" (2 keer het getal). Nu noemt hij het getal niet nog een keer; er staat dan nog maar 1 knop. Goed zo?
3. **"Je koos zondag en maandag. Daar zit een schooldag bij."** Was: "… Op maandag ga je naar school." (2 keer maandag). Goed zo?
4. **Oude hints met een eigen vraag.** Een paar oude hints eindigen met een eigen vraag ("Zeg de dagen van de week op. Welke dag zeg je als eerste?"). Die heb ik laten staan; daar komt de vraag van de les niet nog eens achter (geen 2 vragen achter elkaar). Bij de andere hints komt de vraag in andere woorden terug ("Wat is de eerste dag van de week, denk je?"). Goed zo?
5. **"Welke kaart heeft alleen vrije dagen?"** Dit is 1 van de versies van de vraag na de hint bij "Op welke dagen is het weekend?". Vind je dat duidelijk genoeg voor groep 3?

## 3. Voorstel voor BOUWREGELS (niet zelf erin gezet)

- **Een dagnaam telt net als een getal:** hij klinkt nooit 2 keer vlak achter elkaar (in 1 zin, of in 2 zinnen achter elkaar). Bij Tijd stond "Je koos zondag en maandag. Op maandag ga je naar school." en "Hier is zondag in de weektrein. Zondag is de laatste wagon." (Bij Dagen gebruikt het script dezelfde controle.)
- **Een hint met een eigen vraag aan het eind krijgt de vraag van de les niet nog eens erachter** (nooit 2 vragen achter elkaar); een hint zonder vraag krijgt die wel (15.37). Zo kunnen oude hints met een goede eigen vraag blijven.
- **Bij een ander antwoord de 2e keer begint de eerste zin ook anders dan de 1e keer** (niet "Zondag? …" en daarna "Zaterdag? …").
- **Komt een vraag aan het eind van de les terug, dan krijgt het kind een andere hint dan de eerste keer** (dat stond al in deze les; nu met de gedeelde kiezer).
- **Een zin bij het samen voordoen praat over wat in het rondje staat** (bij "meteen na zondag" staat het rondje om maandag, dus niet "Dit is de laatste wagon.").

## 4. Gemeld, niet veranderd

- `npm run stemdubbel` meldt 2 korte opnames met het woord 2 keer: "1." en "11." Dat was al bekend (FOUTEN-VOORBEELDEN F8); de gouden lessen knippen het tweede woord weg. Een nieuwe opname maken kost tegoed en kan pas met jouw ja.
- In het zinnenbestand staat nog "Hier is de hele weektrein." (`samenTrein`). Die zin wordt sinds 11 november nergens meer gezegd. Ik heb hem laten staan (harde regel 3).
- De gouden les Dagen (`squla-dagen-gouden`) heeft dezelfde weektrein en veel dezelfde soort zinnen. Die is door een andere helper gedaan; ik heb hem niet aangeraakt. Sommige zinnen zijn in beide lessen gelijk (bijvoorbeeld "Kom, we gaan de trein langs. Ik begin vooraan."); dat is bewust, het zijn dezelfde situaties.
- **2 stemmen door elkaar.** Voor een deel van de oude zinnen bestaat misschien al een opname van Ruth; alle nieuwe zinnen zegt Bliepo met de stem van de browser. Dat blijft zo tot de nieuwe zinnen zijn ingesproken (zie §1).
