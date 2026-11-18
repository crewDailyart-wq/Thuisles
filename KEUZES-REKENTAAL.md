# KEUZES-REKENTAAL — vragen en schatting voor Sara

18 november 2026. Hoort bij WIJZIGINGEN-ZINNEN-REKENTAAL.md (de zinnen van de gouden les Rekentaal, "Groot en klein, vol en leeg", zijn warmer gemaakt en in varianten gezet, zoals de proefles Tellen). Dit bestand is alleen van deze les; de coördinator zet het later in KEUZES-VOOR-SARA.md.

## 1. Schatting: stem (Ruth, ElevenLabs). Er is NIETS gemaakt.

Nu praat Bliepo in deze les met de stem van de browser. Dat kost niets. Wil je later alles met Ruth laten inspreken, dan is dit de schatting (1 teken is ongeveer 1 tegoed):

| Les | Wat Bliepo nu kan zeggen | Tekens |
|---|---|---|
| Gouden les Rekentaal (per zin geteld) | 599 verschillende zinnen (was 275), waarvan 330 nieuw | ongeveer 9.900 voor de nieuwe zinnen |
| Gouden les Rekentaal (zoals Bliepo het zegt: per stuk, bijvoorbeeld hint + vraag samen) | 685 stukken (was 268), waarvan 435 nieuw (de lof- en eindzinnen niet meegeteld) | ongeveer 20.600 voor de nieuwe stukken (alles samen ongeveer 28.900) |

- Een opname wordt per stuk gemaakt ("Kijk hoe breed elke pannenkoek is. Welke pannenkoek is groter, denk je?" is 1 opname). Daarom is de echte prijs dichter bij de **ongeveer 20.600** dan bij de 9.900.
- Dat is ver boven de 5.000 (harde regel 9). **Ik maak dus niets zonder jouw ja.**
- Goedkoper kan: eerst alleen de vaste zinnen (begin, samen, hulphandje, slot, kaart, ongeveer 40 stukken, ongeveer 1.500 tekens) en de rest met de browserstem.

## 2. Vragen (je hoeft alleen ja of nee te zeggen)

1. **Het begin.** "In deze les leer je rekenwoorden, zoals groot en klein, vol en leeg." is nu bijvoorbeeld: "Vandaag leren we rekenwoorden. Kijk: een grote en een kleine pannenkoek." (de 2 pannenkoeken staan in beeld). Goed zo?
2. **Na de hint komt de vraag in andere woorden.** Eerst: "Kijk hoe breed elke pannenkoek is. Welke pannenkoek is groter?" (precies dezelfde vraag als net). Nu: "… Welke pannenkoek is groter, denk je?" of "… Tik op de pannenkoek die groter is." Goed zo?
3. **De 2e keer op volgorde.** Vraag 16 begint nu met "En nu de bekers. Zet ze ook op volgorde, van klein naar groot. Tik eerst op de kleinste beker." in plaats van precies dezelfde 3 zinnen als bij de appels. Goed zo?
4. **"Je tikte op de kleine pannenkoek."** Een van de 3 eerste zinnen noemt het voorwerp met zijn maat, zonder uitleg erachter. Is dat genoeg, of wil je altijd een 2e zin erbij ("Hij is kleiner dan de andere.")?
5. **"Van groot naar klein? Dat is net andersom."** Mag Bliepo "net andersom" zeggen bij op volgorde? Het zegt niet welke appel waar moet, maar wel dat het precies omgekeerd moet.

## 3. Voorstel voor BOUWREGELS (niet zelf erin gezet)

- **Na de hint komt de vraag terug, maar nooit precies dezelfde zin als de 1e keer** (hoort bij 15.37 en 15.29): "Welke pannenkoek is groter, denk je?" of "Tik op de pannenkoek die groter is." Zo staat er altijd een vraag, zonder dat dezelfde zin 2 keer klinkt. Het script van Rekentaal controleert dit nu.
- **De herhaalcontrole (geen woord 2 keer in 1 reactie) is ook een harde eis bij het kiezen** van varianten, niet alleen een controle achteraf. Anders kiest de les soms een combinatie die het script nooit zag.
- **Een reactie-rijtje dat per vraag anders is, krijgt overal dezelfde volgorde en 1 sleutel**, zodat "niet 2 keer dezelfde zin achter elkaar" ook over vragen heen werkt (geleerd bij de keuring Rekenmix; nu ook toegepast in Rekentaal).
- **Bij samen voordoen zegt Bliepo niet nog eens wat de hint bij die vraag al zei** ("Ze beginnen bij dezelfde streep."), en de klaar-zin herhaalt niet de stap van net.

## 4. Gemeld, niet veranderd

- `npm run stemdubbel` meldt 2 korte opnames met het woord 2 keer: "1." en "11." Dat was al bekend (FOUTEN-VOORBEELDEN F8); deze les gebruikt ze niet.
- De denkfout `onduidelijk` kan in deze les niet voorkomen (alle keuzes zijn vast); de zinnen staan er als vangnet.
