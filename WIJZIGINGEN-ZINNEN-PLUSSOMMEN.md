# WIJZIGINGEN-ZINNEN-PLUSSOMMEN — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md), nu voor de gouden les Plussommen (`squla-plus-bakkerij-1-gouden`) en de extra les met tegels (`squla-plus-bakkerij-1-gouden-extra`). Andere lessen zijn niet veranderd. De oude les (`squla-plussommen.tsx`) is niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit 32a9126). Geen andere les gebruikt deze 2 zinnenbestanden; een apart bewaarbestand zoals bij Tellen was dus niet nodig.

**Niet veranderd:** de getallen, de antwoorden, de keuzes, de volgorde van de vragen en de betekenis van elke zin. De verhaaltjes ("Hier ligt 1 taartje.", "Daar liggen er 4.", "Hoeveel taartjes zijn het samen?", "Welke som hoort erbij?", "Welk kaartje hoort bij 5 + 3?", "Tik op het goede kaartje.", "Welk antwoord hoort bij welke som?") zijn precies gelijk gebleven: ze zijn kort en helder.

**Alle nieuwe varianten op een rij:** FOUTTABEL-squla-plus-bakkerij-1-gouden.md (§4) en FOUTTABEL-squla-plus-bakkerij-1-gouden-extra.md (§4).

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos 4." en "Je koos 6." tellen als dezelfde zin, net als "Tik op elk taartje daar." en "Tik op elke cupcake daar.". Als het kan begint de volgende zin ook anders. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd). Nieuw in deze les: de hint of uitleg herhaalt als het kan ook geen getal uit de zin ervoor.

## Deel A — gouden les Plussommen: verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les tel je lekkers uit de bakkerij bij elkaar op. Dat heet een plussom. | Vandaag tellen we lekkers uit de bakkerij bij elkaar op. Dat heet een plussom. / We gaan samen lekkers uit de bakkerij optellen. Dat heet een plussom. | warmer, zoals een juf begint |
| Verbind weer elke som met zijn antwoord. | Zoek weer bij elke som het goede antwoord. / Welk antwoord hoort bij elke som? Tik ze weer aan. | "verbind" is een moeilijk woord; nu zegt Bliepo wat het kind doet |
| Kom, samen tellen we het. | Weet je wat? We tellen samen. / Geeft niks. We tellen samen. / Ik help je even. We tellen samen. / Laten we samen tellen en kijken. | omgekeerde zin, klonk raar |
| We tellen het samen. | (zie hierboven; "Kom, we tellen samen." blijft) | bijna dezelfde zin als de andere |
| We kijken het samen na. | Weet je wat? We kijken er samen naar. / Geeft niks. We kijken samen. / Ik help je even. We kijken samen. | warmer; "nakijken" mag hooguit 2 keer per les |
| 5. Samen zijn het 5 taartjes: 1 + 4 = 5. | En 5! Zoveel taartjes zijn het samen. / Alles geteld! 1 + 4 = 5. / We hebben ze allemaal geteld. 1 + 4 = 5. | het getal stond 3 keer achter elkaar |
| 8. Dus 5 + 3 = 8. | En 8! Zoveel stippen zijn het samen. / Alles geteld! 5 + 3 = 8. / We hebben alle stippen geteld. 5 + 3 = 8. | het getal stond 2 keer achter elkaar |
| Kijk, ik tel de rest. Samen zijn het 5 taartjes: 1 + 4 = 5. | Kijk, ik tel de rest. 1 + 4 = 5. / Kijk, ik tel even verder. Samen zijn het 5 taartjes. | het getal stond 2 keer achter elkaar |
| Op dit kaartje staat 8. | Kijk, dit kaartje hoort erbij. / Dat getal staat op dit kaartje. | het getal was net gezegd ("5 + 3 = 8") |
| Kom, we rekenen 3 + 4 samen uit. | Kom, we rekenen die som samen uit. / Weet je wat? We rekenen die som samen uit. / Ik help je even. We rekenen die som samen uit. | de som was net gezegd ("Je verbond 3 + 4 met 9.") |
| Je maakte plussommen tot 10. | Je hebt plussommen gemaakt tot 10! / Wat heb jij goed opgeteld: tot wel 10! / Knap, hoor! Je kunt al goed optellen tot 10. | natuurlijker en vrolijker |
| Tel alle taartjes nog eens, 1 voor 1. | Tel alle taartjes nog eens, stuk voor stuk. | "1 voor 1" zegt het getal 2 keer (zoals bij Tellen) |
| Wijs ze 1 voor 1 aan en tel ze samen. | Wijs ze stuk voor stuk aan en tel ze samen. | idem |
| Tel nog eens verder vanaf 4, rustig 1 voor 1. | Tel nog eens verder vanaf 4, rustig, stuk voor stuk. | idem |
| Tel nog eens verder vanaf 4. Sla er geen taartje over. | Tel nog eens verder vanaf 4. Sla geen taartje over. | grammatica: "er" hoort er niet |
| Je koos 7. (als de richting iets zou verklappen) | Je koos 9. Je zit er dichtbij. / Je koos 9. Dat scheelt niet veel. / Bijna! 9 is het net niet. / 9? Dat is heel dichtbij. / Je tikte op 9. Het scheelt maar een klein beetje. | te kaal; nu warmer (alleen als "dichtbij" niets verklapt) |
| 7 is het niet. | Je koos 7. Ik kom op een ander getal. / 7? Ik tel een ander getal. / Je tikte op 7. We tellen nog een keer. | klonk streng (als ook "dichtbij" iets zou verklappen) |
| Je koos 7. Dat is het nog niet. | (zie de 2 regels hierboven) | "Dat is het nog niet" is een vast woordje dat Bliepo niet zegt (BLIEPO-KARAKTER §9) |
| 6 is te veel. (uitleg 2e keer) | Je telde er 1 te veel. / Het is er 1 minder. / 6 is net iets te veel. (bij meer verschil: "een paar") | klonk streng en als een robot |
| 4 is te weinig. (uitleg 2e keer) | Je telde er 1 te weinig. / Het is er 1 meer. / 4 is net iets te weinig. (bij meer verschil: "een paar") | idem |
| Hier komen er koekjes bij. Erbij is plus. (hint) | Hier komen er koekjes bij. Erbij is plus. Welke som hoort erbij? / Er gaan geen koekjes weg. Er komen er juist bij. Kies de som die erbij hoort. / Er komen koekjes bij. Zoek een som met een plus. | na de 1e keer staat alleen de hint in beeld; nu zegt de hint ook wat het kind moet doen (BOUWREGELS 15.37) |
| Kijk naar de koekjes hier én daar. (hint) | Kijk naar de koekjes hier én daar. Welke som hoort erbij? / Hoeveel koekjes zijn er hier? En hoeveel daar? / Tel eerst de koekjes hier. Tel dan de koekjes daar. | idem: "Kijk …" alleen zegt niet wat het kind moet doen |
| In 3 + 3 staat 2 keer de 3. | In deze som staat 2 keer hetzelfde getal. / Je koos een som met 2 keer de 3. / Deze som heeft 2 keer de 3. | het getal stond 3 keer in 1 zin |
| Je verbond 3 + 4 met 9. 3 + 4 is minder dan 9. | Je verbond 3 + 4 met 9. Dat is te veel voor die som. / Bij 3 + 4 koos je 9. Dat is te veel. / 3 + 4 en 9 horen niet bij elkaar. Die som is minder. | de som en het getal stonden 2 keer achter elkaar |
| Je verbond 3 + 4 met 6. 3 + 4 is meer dan 6. | Je verbond 3 + 4 met 6. Dat is te weinig voor die som. (en 2 varianten) | idem |
| Je verbond 2 + 7 met 7. Maar 7 staat al in die som. | Je verbond 2 + 7 met 7. Maar dat getal staat al in die som. (en 2 varianten) | het getal stond 3 keer |
| 3 + 4 hoort bij een kleiner getal. | Die som hoort bij een kleiner getal. / Het antwoord van die som is minder. | de som was net gezegd |
| 3 + 4 hoort bij een groter getal. | Die som hoort bij een groter getal. / Het antwoord van die som is meer. | idem |
| 2 + 7 is meer dan 7: er komt nog iets bij. | Bij plus komt er nog iets bij. Het wordt meer. / Die som hoort bij een groter getal. | 2 korte zinnen; de som niet nog een keer |

## Deel A — extra les Plussommen (tegels): verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les werk je met tegels. | Vandaag rekenen we met tegels. / We gaan samen rekenen met tegels. | warmer, zoals een juf begint |
| Op elke tegel zie je vakjes. Zo weet je welk getal het is. | Elke tegel heeft vakjes. Tel de vakjes, dan weet je welk getal het is. | "Zo weet je" was vaag; nu zegt Bliepo wat je doet |
| Kies een tegel en zet hem in het rooster. | Kies maar een tegel, welke je wilt. Zet hem op het veld. | "rooster" is een moeilijk woord; de eerste zin is die van Synthesis |
| Tik op een tegel. Tik dan in het rooster. | Tik op een tegel. Tik dan op het veld. / Tik eerst op een tegel. Tik daarna op het veld. | "rooster" weg |
| Zet er nog een in. | Zet er nog 1 op het veld. | hoeveelheid met een cijfer (3.20); duidelijker waar |
| Nog een tegel, een andere. | Nu een andere tegel. Kies maar. | geen hele zin |
| Weet je welk getal dit is? | Welk getal heb je gekozen? | vage vraag (het antwoord is "ja"); nu de zin van Synthesis |
| Welk getal heb je hier gekozen? | Welk getal hoort bij deze tegel? | "hier" was onduidelijk |
| Ik tel 5 vakjes. Het is een 5. | Het zijn 5 vakjes. Dat is het getal van deze tegel. / Ik tel 5 vakjes. Zo weet je welk getal het is. | het getal stond 2 keer achter elkaar |
| Zet nu 2 tegels in het rooster. | Zet nu 2 tegels op het veld. | "rooster" weg |
| Wat is het totaal? | Hoeveel is dat samen? | "totaal" is een moeilijk woord; "samen" is de schoolterm van deze les |
| Zet een nieuwe tegel in het rooster. | Zet een nieuwe tegel op het veld. | "rooster" weg |
| {naam}, je krijgt het door. | {naam}, je snapt het al goed. | "het doorkrijgen" is geen juf-Nederlands |
| Nu maken we het moeilijker. | Nu maken we het een beetje moeilijker. | zachter |
| Kijk, zo'n tegel past erbij. Zet hem in het rooster. (en de 2 andere) | Kijk, zo'n tegel past erbij. Zet hem op het veld. (en de 2 andere) | "rooster" weg |
| Ja, 3 en 7 maken samen 10. Weet je hoe je dat als som schrijft? | Van deze 2 tegels kun je een som maken. Welke som hoort erbij? | de som was net gezegd (2 keer achter elkaar), "Ja" kwam soms 2 keer, en de vraag was vaag |
| Je schreef 3 + 7 = 10. | De som is 3 + 7 = 10. / Zo schrijf je het: 3 + 7 = 10. | het kind koos de som, het schreef niet |
| Weet je wat er gebeurt als ik de tegels omdraai? | Wat gebeurt er als ik de tegels omdraai? | korter (was 11 woorden); zin van Synthesis |
| 3 + 7 = 10 en 7 + 3 = 10. Je kunt in allebei de volgordes optellen. | 3 + 7 = 10 en 7 + 3 = 10. Je mag de getallen omdraaien. / … Omdraaien mag: het blijft evenveel. | "volgordes" is een moeilijk woord |
| Het zijn dezelfde tegels. Het is nog steeds 10. De volgorde maakt niet uit. | Het zijn dezelfde tegels. Het is nog steeds 10. Omdraaien maakt niet uit. / Het zijn dezelfde vakjes. Samen blijft het 10. Je mag de getallen omdraaien. | "volgorde" is een moeilijk woord |
| Je maakte sommen tot wel 10. | Je hebt sommen gemaakt tot wel 10! / Wat heb jij goed opgeteld met de tegels: tot wel 10! / Knap, hoor! Je kunt al optellen tot 10. | natuurlijker en vrolijker |
| Dat werkt: 3 + 4 = 7. | Dat klopt: 3 + 4 = 7. | "dat werkt" is Engels-Nederlands |
| Je maakte 7 met de 3 en de 4. | Je hebt 7 gemaakt met de 3 en de 4. | natuurlijker |
| Tel de vakjes van de tegel. Wijs ze een voor een aan. | Tel de vakjes van de tegel. Wijs ze stuk voor stuk aan. | cijferafspraak (3.20); "1 voor 1" zou het getal 2 keer zeggen |
| 4 is dichtbij. | Je koos 4. Je zit er dichtbij. / Bijna! 4 is het net niet. (5 varianten) | te kaal; nu zegt Bliepo eerst wat het kind koos |
| 4 is net iets te weinig. | Je koos 4. De tegel heeft meer vakjes. / Bijna! 4 is nog iets te weinig. / 4? Ik tel er meer. / Je tikte op 4. Ik zie nog meer vakjes. | klonk als een robot; "Ik tel er meer" is de zin van Synthesis |
| 6 is net iets te veel. | Je koos 6. Zo veel vakjes heeft de tegel niet. / Bijna! 6 is iets te veel. / 6? Ik tel er minder. / Je tikte op 6. Dat zijn er iets te veel. | idem |
| Je hebt een vakje overgeslagen. We tellen ze allemaal. | Je hebt 1 vakje overgeslagen. We tellen ze allemaal. (bij meer verschil: "een paar vakjes") | hoeveelheid met een cijfer; en het klopte niet als het er 2 scheelde |
| Je telde een vakje niet mee. We tellen ze samen. | Je hebt 1 vakje niet meegeteld. We tellen ze samen. | idem |
| Een vakje bleef over. We tellen ze allemaal. | De tegel heeft 1 vakje meer. We tellen ze samen. | "bleef over" klopt niet bij tellen |
| Je telde een vakje 2 keer. We tellen ze een voor een. | Je hebt 1 vakje 2 keer geteld. We tellen ze stuk voor stuk. | cijferafspraak |
| Een vakje telde je dubbel. We tellen ze samen. | De tegel heeft 1 vakje minder. We tellen ze samen. | "dubbel" is een moeilijk woord (BLIEPO-KARAKTER §2); omgekeerde zin |
| Een vakje kreeg 2 keer een getal. We tellen ze een voor een. | Je telde 1 vakje te veel. We tellen ze samen. | onduidelijk; cijferafspraak |
| Je telde weer een vakje te weinig. / te veel. | Je telde er weer te weinig. / Het zijn er weer iets te weinig. / Weer iets te weinig, zie ik. (zo ook bij te veel) | cijferafspraak; variatie |
| We tellen ze een voor een. | We tellen ze rustig, stuk voor stuk. / Elk vakje telt mee. We tellen ze samen. | cijferafspraak |
| Tel alle vakjes van de 2 en de 3 bij elkaar. | Tel de vakjes van allebei de tegels. / Begin bij de 2 en tel de vakjes van de 3 erbij. | "alle" gaf een richting (te weinig) terwijl de hint ook bij "te veel" komt |
| Kijk naar allebei de tegels en tel alle vakjes. | Probeer het nog eens. Tel de vakjes en tik op het getal. | idem; zin van Synthesis |
| 4 is te weinig. (2 tegels samen) | Je koos 4. Samen zijn het er meer. / Bijna! 4 is nog iets te weinig. / 2 en 3 samen is iets meer dan 4. / 4? Ik tel meer vakjes. | klonk streng; de 3e is de zin van Synthesis |
| 6 is te veel. (2 tegels samen) | Je koos 6. Samen zijn het er minder. / Bijna! 6 is iets te veel. / 2 en 3 samen is iets minder dan 6. / 6? Ik tel minder vakjes. | idem |
| Weer klopt het niet: 6 en 2 is 8. | Dat is weer te veel: 6 en 2 is samen 8. / Weer te veel, zie ik. 6 en 2 is samen 8. / Het is weer te veel. Met de 2 wordt het 8. | omgekeerde zin, klonk streng |
| Je telt de tegels bij elkaar op. Wat staat er achter het =? | Je telt de tegels bij elkaar op. Hoeveel is dat samen? / Achter het is-teken staat hoeveel het samen is. | "het =" kun je niet goed uitspreken |
| Het totaal is wat de 2 tegels samen zijn. | Achter het is-teken staat hoeveel de tegels samen zijn. / Naast elkaar is een ander getal. We tellen de tegels juist bij elkaar op. | "totaal" is een moeilijk woord |
| We doen de tegels bij elkaar. Dan hoort er een plus. (hint) | We doen de tegels bij elkaar. Kies de som met een plus. / De tegels komen bij elkaar. Zoek een som met een plus. / Bij een min gaat er iets weg. Hier komt er iets bij. Welke som hoort erbij? | na de 1e keer staat alleen de hint in beeld; nu zegt de hint ook wat het kind moet doen (BOUWREGELS 15.37) |
| Kijk goed naar het teken. | Je koos een som met een min. / In deze som staat een min. / Je tikte op de som met een min. | was een opdracht, geen reactie op wat het kind koos |
| Kijk goed naar de tegels. Tel de vakjes nog eens, een voor een. | Tel de vakjes nog eens, stuk voor stuk. / Probeer het nog eens. Tel de vakjes van de tegels. / Kijk goed naar de tegels en tel de vakjes rustig. | cijferafspraak; variatie |
| Je koos 9. (omdraaien) | 9? Dat is net te weinig. / Je koos 9. Dat is iets te weinig. / Bijna! 9 is net te weinig. (bij 11: "te veel") | te kaal; de richting verklapt hier niets (er blijven 2 keuzes over); zin van Synthesis |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Kom, we tellen samen. (en 2 zinnen die weg zijn) | blijft, en erbij: Weet je wat? We tellen samen. / Geeft niks. We tellen samen. / Ik help je even. We tellen samen. / Laten we samen tellen en kijken. | variatie (5); de laatste is van Synthesis |
| Kom, we kijken samen. | blijft, en erbij: 3 varianten (zie Deel A) | variatie (4) |
| Hier liggen 4 cupcakes. | blijft, en erbij: Kijk, hier liggen 4 cupcakes. | variatie |
| We tellen verder vanaf 4. Tik op elke cupcake daar. | blijft, en erbij: Na 4 tellen we verder. Tik elke cupcake daar aan. / We beginnen bij 4. Tik op elke cupcake daar. Ik tel mee. | variatie (3) |
| Tik op een taartje zonder getal. | blijft, en erbij: Zoek een taartje zonder getal en tik erop. / Welk taartje heeft nog geen getal? Tik erop. | variatie (3) |
| Kijk: 5 oranje stippen en 3 blauwe stippen. | blijft, en erbij: Hier zie je 5 oranje stippen en 3 blauwe stippen. | variatie |
| We tellen verder vanaf 5. Tik op elke blauwe stip. | blijft, en erbij: 2 varianten | variatie (3) |
| Tik op een blauwe stip zonder getal. | blijft, en erbij: 2 varianten | variatie (3) |
| Kijk, ik tel de rest. 5 + 3 = 8. | blijft, en erbij: Kijk, ik tel even verder. Samen zijn het 8 stippen. | variatie |
| Tik op een som. Tik dan op het antwoord dat erbij hoort. | blijft, en erbij: Kies eerst een som. Tik daarna op het antwoord dat erbij hoort. | variatie |
| Reken 3 + 4 uit en tik op het antwoord. | blijft, en erbij: Hoeveel is 3 + 4? Tik op dat antwoord. | variatie |
| Zo horen ze bij elkaar: 3 + 4 = 7, … | blijft, en erbij: Kijk, zo hoort het: 3 + 4 = 7, … | variatie |
| Eerst liggen er 3 koekjes. | blijft, en erbij: Er liggen eerst 3 koekjes. | variatie |
| Er komen 7 koekjes bij. Erbij is plus. | blijft, en erbij: Dan komen er 7 koekjes bij. Erbij is plus. | variatie |
| Tik op de som die erbij hoort. | blijft, en erbij: Tik maar op de som die erbij hoort. | variatie |
| Zo is het: 3 + 7 = 10. | blijft, en erbij: Kijk, zo hoort het: 3 + 7 = 10. | variatie |
| Je koos weer 4. | blijft, en erbij: Je tikte weer op 4. / Weer 4, zie ik. (bij het verbinden nieuw: Je verbond 3 + 4 weer met 9. / Weer 3 + 4 bij 9, zie ik.) | variatie; bij het verbinden zei Bliepo eerst 2 keer dezelfde zin |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie (3) |
| Je bent goed bezig. / Jij kunt dit. | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (5) |
| Je koos 4. Dat zijn alleen de taartjes daar. | blijft, en erbij: 4? Dat zijn alleen de taartjes daar. / Je tikte op 4. Zoveel liggen er alleen daar. | variatie (3) |
| 5 staat al in de som. Er komt nog iets bij. | blijft, en erbij: Je koos 5. Dat getal staat al in de som. / Je tikte op 5. Maar er komt nog iets bij. | variatie (3) |
| 3 krijg je als je 2 van 5 afhaalt. | blijft, en erbij: Je koos 3. Dan heb je er 2 afgehaald. / 3? Dan gaan er 2 weg. | variatie (3) |
| 1 en 4 samen is minder dan 6. | blijft, en erbij: Je koos 6. Dat zijn er te veel. / 6? Dat is meer dan 1 en 4 samen. / Bijna! 6 is iets te veel. | variatie (4) |
| 1 en 4 samen is meer dan 4. (bij te weinig) | blijft, en erbij: 3 varianten (zo ook) | variatie (4) |
| Bij 7 − 3 gaan er koekjes weg. | blijft, en erbij: Je koos een minsom. Dan gaan er koekjes weg. / 7 − 3? Dan haal je er koekjes af. | variatie (3) |
| Alle hints (3 per soort) | blijven (met "stuk voor stuk"), en per soort 1 of 2 erbij: "Probeer het nog eens. Tel verder vanaf 4." enzovoort | variatie (3 tot 5); een hint zonder getal erbij, zodat het getal niet 2 keer achter elkaar klinkt |
| Alle "weer"-zinnen (1 per soort) | blijven, en erbij: "Dat is weer …" en "Weer …, zie ik." | variatie (3) |
| Reactie na lof: 5 zinnen | blijven, en erbij: Precies, 1 + 4 = 5. / Dat klopt, 1 en 4 is samen 5. | variatie (7); "Precies" is van Synthesis |
| Verbinden goed: 3 zinnen | blijven, en erbij: Bij elke som staat het goede antwoord. | variatie (4) |
| Extra les: Het is een 5. | blijft, en erbij: Dit is de 5. / Klopt, het is een 5. | variatie (3) |
| Extra les: 2 en 3 is samen 5. | blijft, en erbij: Kijk: 2 en 3 is samen 5. | variatie |
| Extra les: 3 + 7 = 10. (samen voordoen) | blijft, en erbij: Kijk: 3 + 7 = 10. / Zo past het: 3 + 7 = 10. | variatie (3) |
| Extra les: Kijk, ik zet hem erbij. 3 + 7 = 10. | blijft, en erbij: Kijk, ik leg de tegel erbij. 3 + 7 = 10. | variatie |
| Extra les: Kijk, zo schrijf je het: 3 + 7 = 10. | blijft, en erbij: Kijk, dit is de som: 3 + 7 = 10. | variatie |
| Extra les: Tik op de kaart. (vast) | 3 varianten, zoals de gouden les | variatie |
| Extra les: reactie na lof, 5 zinnen | blijven (2 verbeterd), en erbij: Precies, 3 + 4 = 7. | variatie (6) |

## Aantal varianten per situatie

| Situatie | Gouden les | Extra les |
|---|---|---|
| Eerste zin na een keuze die niet goed is | 3 of 4 per soort; 5 bij "dichtbij" | 3 of 4 per soort; 5 bij "dichtbij" |
| Hint | 3 tot 5 per soort | 3 of 4 |
| Uitleg bij de 2e keer | 2 of 3 | 2 of 3 |
| "Weer …" (2 keer dezelfde denkfout) | 3, met 2 soorten uitleg | 3, met 2 soorten uitleg |
| "Je koos weer …" | 3 (verbinden: 2) | 3 |
| "Kom, we tellen samen." | 5 (welke som: 4; verbinden: 3) | — (hier doet Bliepo meteen voor) |
| Opdracht bij samen tellen | 3 | 3 (de tegel die erbij past) |
| Hulphandje: aanmoediging | 5 | 5 |
| Hulphandje: wat te doen | 3 (verbinden: 2) | 2 |
| Klaar met samen tellen | 3 | 2 of 3 |
| Bliepo doet de rest zelf (vangnet) | 2 | 2 |
| Zin met de som na lof | 7 (verbinden: 4) | 6 |
| Begin, slot | 2 en 3 | 2 en 3 |
| "Tik op de kaart." | 3 | 3 |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) | hetzelfde |

## De fouttabel is strenger gemaakt (zoals bij Tellen)

De 2 fouttabel-scripts lopen nu ALLE varianten na, niet alleen 1 vaste zin per rij:

- **Verklappen (15.17):** na elke eerste zin met elke hint blijven er minstens 2 keuzes over en valt het goede antwoord niet af (gouden: 618 combinaties, extra: 512). Noemt Bliepo de richting niet, dan geeft geen enkele variant er een.
- **Nieuw: ook het woord "dichtbij" mag niets verklappen.** Bij vraag 9 (4 + 4, keuzes 4, 8, 7 en 0) en vraag 16 (5 + 5, keuzes 5, 10, 9 en 0) ligt er na een keuze van 7 of 9 maar 1 getal dichtbij. Daar zegt Bliepo dus niet "dichtbij" of "bijna", maar "Je koos 7. Ik kom op een ander getal.".
- **Waarheid:** "1 te veel" alleen als het er 1 scheelt, "een paar" alleen bij meer; "alleen de taartjes hier" alleen bij het 1e groepje; enzovoort (gouden: 784 beweringen).
- **Geen opdracht bij de 2e keer**, nooit het woord "fout", **geen getal 2 keer in 1 zin** (alleen een getal dat in de som zelf 2 keer staat, zoals 4 + 4, mag).
- **Nooit 2 keer hetzelfde:** de kiezer wordt 20.000 keer nagespeeld met willekeurige vragen en keuzes: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer dezelfde zin 2 keer in 1 reactie.
- **Altijd een vraag of opdracht in beeld (BOUWREGELS 15.37, F16):** na de 1e keer staat alleen de hint in beeld. Elke hint heeft daarom een vraagteken of een opdracht die zegt wat het kind doet ("Tel …", "Begin …", "Kies …", "Welke som hoort erbij?"). "Kijk …" en "Probeer het nog eens." alleen tellen niet. De scripts controleren dit nu voor elke variant; 4 hints in de gouden les en 4 in de extra les zijn daarop aangepast.
- **De uitleg en "Kom, we tellen samen." zijn nu 2 stukken** (zoals bij Tellen). Samen pasten ze net niet in het tekstvak (6 punten te lang).
- **"Weer" alleen als het klopt:** bij hetzelfde antwoord 2 keer na alleen "dichtbij" zegt Bliepo "Je koos weer 4." en niet "weer te veel" (in de extra les kon dat eerst wel gebeuren).

## Zinnen van Synthesis (Adding below 10), in het Nederlands (besluit Sara, 17 november 2026)

Alleen de tekst, passend gemaakt voor groep 3. Geen audio, beeld of code.

| Synthesis zegt (vertaald uit INSPIRATIE.md en het draaiboek) | Bij ons nu | Waar |
|---|---|---|
| 2 en 4 samen is iets meer dan 4; tel het totaal nog eens | 1 en 4 samen is meer dan 4. (stond er al) + Probeer het nog eens. Tel verder vanaf 1. | gouden: eerste zin en hint |
| 3 en 5 samen is iets meer dan 7 | 2 en 3 samen is iets meer dan 4. | extra: 2 tegels samen |
| precies; 2 + 3 = 5 | Precies, 1 + 4 = 5. | gouden en extra: zin na lof |
| ik help je met deze | Ik help je even. We tellen samen. | gouden: 2e keer mis |
| kies maar een tegel, welke je wilt | Kies maar een tegel, welke je wilt. Zet hem op het veld. | extra: begin |
| welk getal heb je gekozen? | Welk getal heb je gekozen? | extra: de vraag |
| hmm, ik tel er een paar meer | 4? Ik tel er meer. / 6? Ik tel er minder. | extra: welk getal |
| ik tel 4 vierkantjes; dus het is het getal 4 | Het zijn 5 vakjes. Dat is het getal van deze tegel. | extra: Bliepo telde de vakjes |
| je hebt de 3 en de 7 naast elkaar gezet | Je hebt de 3 en de 7 naast elkaar gezet. | extra: de som |
| wat gebeurt er als we de tegels omwisselen? | Wat gebeurt er als ik de tegels omdraai? | extra: omdraaien |
| 11? dat is net te hoog; tel ze nog eens | 11? Dat is net te veel. + Tel de vakjes nog eens, stuk voor stuk. | extra: omdraaien |
| het antwoord is nog steeds 5; je kunt getallen in elke volgorde optellen | Het is nog steeds 10. Omdraaien maakt niet uit. / Je mag de getallen omdraaien. | extra: omdraaien |

Niet overgenomen: "ah, ik snap wat je denkt" (een vaste opening die Bliepo niet zegt, BLIEPO-KARAKTER §9), "geen zorgen, laten we dit samen uitzoeken" (de zijroute bestaat bij ons niet; wel "Geeft niks. We tellen samen."), "je hebt mooie optelkunsten laten zien" ("optelkunsten" is geen woord voor groep 3; wel "Knap, hoor! Je kunt al goed optellen tot 10.") en de lofwoorden "nice, yep, alright" (lof komt uit het vaste rijtje van alle lessen).

## Niet gedaan, met reden

- **De verhaaltjes en de vragen zelf afwisselen** ("Hoeveel taartjes zijn het samen?"): niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11) en de inhoud van de Squla-les blijft gelijk (15.22).
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) herschrijven:** niet gedaan. Die staan in BLIEPO-KARAKTER.md en worden door alle gouden lessen gebruikt. Ze wisselen al zonder herhaling.
- **"Hmm" of "Ah, ik snap wat je dacht" als begin van een reactie** (zo doet Synthesis het): niet gedaan, dat zijn vaste openingen die Bliepo niet zegt (BLIEPO-KARAKTER §9).
- **Richting noemen bij elke keuze:** niet waar er dan nog maar 1 keuze overblijft (15.17).
- **Een hint die naar een kleinere of grotere tegel wijst** ("Probeer een kleinere tegel."): niet gedaan. Bij "maak samen 7 met de 6" blijft er dan maar 1 tegel over.
- **"Het zijn dezelfde tegels." als hint bij het omdraaien:** niet gedaan. Het kind maakte net 10 met die tegels; dan zegt de hint bijna het antwoord. De zin komt pas in de uitleg.
- **"1 voor 1" (cijferafspraak):** niet gedaan, want dan staat het getal 1 twee keer achter elkaar. Het is "stuk voor stuk" geworden, zoals bij Tellen.
- **De som weglaten na samen tellen** ("En 5! Zoveel taartjes zijn het samen." zonder "1 + 4 = 5"): alleen in 1 van de 3 varianten. De som staat dan nog wel bovenaan in beeld; in de 2 andere varianten zegt Bliepo de som (met het antwoord 1 keer).
- **Een aanmoediging met de naam van het kind bij een keuze die niet goed is:** niet gedaan (BOUWREGELS 3.17).
- **De oude les `squla-plussommen.tsx` en de les Optellen onder de 10 (die ook "rooster" zegt):** niet aangeraakt (harde regel 8 en de afspraak: alleen deze 2 lessen).
