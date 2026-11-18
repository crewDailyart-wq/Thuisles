# KEUZES-REKENMIX34 — vragen en schatting voor Sara

18 november 2026. Hoort bij WIJZIGINGEN-ZINNEN-REKENMIX34.md (de zinnen van de gouden lessen Rekenmix 3 heel moeilijk en Rekenmix 4 zijn warmer gemaakt en in varianten gezet, zoals de proefles Tellen). Dit bestand is alleen van deze 2 lessen; de coördinator zet het later in KEUZES-VOOR-SARA.md.

## 1. Schatting: stem (Ruth, ElevenLabs). Er is NIETS gemaakt.

Nu praat Bliepo in deze lessen met de stem van de browser. Dat kost niets. Wil je later alles met Ruth laten inspreken, dan is dit de schatting (1 teken is ongeveer 1 tegoed):

| Les | Wat Bliepo kan zeggen (per zin geteld) | Nieuwe zinnen | Tekens voor de nieuwe zinnen |
|---|---|---|---|
| Rekenmix 4 | 744 verschillende zinnen (was 231) | 575 | ongeveer 21.900 |
| Rekenmix 3 | 587 verschillende zinnen (was 213) | 439 | ongeveer 15.600 |
| Samen | | 1.014 | **ongeveer 37.500** |

- Een opname wordt per stuk gemaakt (bijvoorbeeld hint + vraag samen is 1 opname). Dan komt er nog wat bij: ruwweg **50.000 tot 60.000 tekens** voor beide lessen samen.
- Dat is ver boven de 5.000 (harde regel 9). **Ik maak dus niets zonder jouw ja.**
- Goedkoper kan: eerst alleen de vaste zinnen (begin, samen tellen, hulphandje, slot, kaart, ongeveer 60 stukken, ongeveer 2.500 tekens) en de rest met de browserstem.

## 2. Vragen (je hoeft alleen ja of nee te zeggen)

1. **De eerste vraag in een druk plaatje (Rekenmix 4).** Eerst: "Hoeveel raketjes zie je? Tel alleen die en tik op het goede getal." Nu: "Hoeveel raketjes zie je? De sterren en de planeten tellen niet mee. Tik op het goede getal." (de keuring stelde "Tel alleen de raketjes" voor). Goed zo?
2. **2 rijen samen (Rekenmix 4).** Eerst: "Tel beide rijen samen en tik op het goede getal." Nu: "Tel de bovenste en de onderste rij. Tik dan op het goede getal." Goed zo?
3. **Einde van samen tellen (Rekenmix 3).** Eerst: "4. In de doos zaten er 4." Nu: "En 6! Er zaten 4 ballen in de doos." (6 is het laatste getal dat geteld wordt, 4 is wat er in de doos zat). Goed zo?
4. **"linksboven"** staat nog in 2 oude hints van Rekenmix 4 ("Begin linksboven en tel opnieuw."). Bij Tellen en Rekenmix 1 is dat "bovenaan" geworden (lastig woord voor groep 3). Mag dat hier ook? (Dan verdwijnt het woord "linksboven" uit deze les.)
5. **"Dan krijgt 1 bal 2 nummers."** is een nieuwe uitleg bij te veel geteld (Bliepo geeft bij samen tellen elk ding een nummer). Begrijpelijk genoeg voor groep 3?
6. **Na de hint in Rekenmix 3** komt "Hoeveel zitten er in de doos?" (zoals na de logica-controle) of een andere versie: "Hoeveel zitten er dan in de doos?" / "Hoeveel ballen zijn er verstopt, denk je?". Mogen de andere versies erbij?

## 3. Voorstel voor BOUWREGELS (niet zelf erin gezet)

- **Zegt Bliepo bij hardop tellen het laatste getal, dan niet nog eens los ervoor** ("8. Samen telden we 8." of "4. In de doos zaten er 4."): het laatste getal komt alleen in de slotzin ("En 8! …"). Geldt voor natellen en samen tellen in alle gouden lessen. Hier gevonden in Rekenmix 3 en 4 (en eerder in Tellen en Rekenmix 1).
- **Elke harde eis bij het kiezen geldt ook voor de keuze ervóór:** kies alleen een eerste zin waarachter nog een passende hint én een vraag passen (anders valt de les terug op een combinatie die het script nooit goedkeurde). Zo gebouwd in `hintsNa4`/`hintsNa3`.
- **Getallen in een vaste lofzin tellen mee voor "geen getal 2 keer"** ("Al 3 goed achter elkaar! In de doos zaten er 3."): het rijtje met de zin na de lof heeft daarom altijd ook zinnen zonder getal.

## 4. Gemeld, niet veranderd

- `npm run stemdubbel` meldt 2 korte opnames met het woord 2 keer: "1." en "11." Dat was al bekend (FOUTEN-VOORBEELDEN F8). Rekenmix 4 telt tot 12, dus "11." kan hier klinken bij samen tellen (vraag 3 en 8).
- De denkfout `onduidelijk` kan in deze lessen niet voorkomen (alle keuzes zijn vast); de zinnen staan er als vangnet.
- Rekenmix 4, vraag 1 en 11 (druk plaatje, zonder richting): de oude hint "Tel nog eens rustig, alleen de raketjes." zegt een beetje dat het kind te veel telde. Het script laat hem door (er blijven 2 keuzes over); niet veranderd.
