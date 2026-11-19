# WIJZIGINGEN-ZINNEN-GETALLENLIJN — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen en Minsommen, nu voor de gouden les Getallenlijn (`squla-getallenlijn-kat-1-gouden`, "Het raketje op de getallenlijn"). Deze les heeft geen extra les. Andere lessen zijn niet veranderd. De oude les (`squla-getallenlijn.tsx`) is niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit 53d287b en eerder). Geen andere les gebruikt dit zinnenbestand; een apart bewaarbestand zoals bij Tellen was dus niet nodig.

**Niet veranderd:** de 15 vragen, de getallen, de lijnen, de keuzes, de volgorde en de goede antwoorden. De vraagzinnen zijn gelijk gebleven ("Bij welk getal staat het raketje?", "Wat is meer: 13 of 14?", "Zet de getallen op volgorde. Van klein naar groot.", "Wat staat er bij 17? Tik erop.", "Welk getal ligt het dichtst bij 20?", "Bij welk getal staat het raketje ongeveer?"), op 1 na (zie Deel A). De lofzinnen, de eindzinnen en de groet komen uit het vaste rijtje van alle gouden lessen; die zijn niet aangeraakt.

**Alle nieuwe varianten op een rij:** FOUTTABEL-squla-getallenlijn-kat-1-gouden.md (§6 en §7).

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos 7." en "Je koos 4." tellen als dezelfde zin, net als "Je tikte weer op de ufo." en "Je tikte weer op het raketje.". Als het kan begint de volgende zin ook anders. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd).

Harde eisen zitten niet als wens in de kiezer, maar worden vooraf uit het rijtje gehaald: de hint moet met de eerste zin in het tekstvak passen (hooguit 125 tekens) en mag geen getal uit de eerste zin herhalen.

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les zoek je bij welk getal het raketje staat. Weet jij al hoe dat gaat? | We zoeken bij welk getal het raketje staat. Wil je laten zien wat je al kunt? / Vandaag zoeken we het getal bij het raketje. Wil je het eerst zelf proberen? | "Weet jij al hoe dat gaat?" is een vage vraag (BOUWREGELS 15.36 noemt hem als voorbeeld); de nieuwe vraag is die van Synthesis en past bij de knoppen Ja en Nee |
| Dit is nog lastig. We oefenen eerst samen. | Dit is nog een beetje lastig. Geeft niks! We oefenen eerst samen. / Dit kan lastig zijn. Dat geeft niks. We doen samen een stapje terug. / Dat is nog best moeilijk, hè? Kom, we oefenen eerst samen. | klonk kaal; de 2e is de zin van Synthesis |
| Laat het raketje springen tot de 3. Tik steeds op het getal ernaast. | Laat het raketje springen tot de 3. Tik steeds op het volgende getal. / We laten het raketje springen tot de 3. Tik steeds op het getal dat daarna komt. | "ernaast" zei niet naast wat |
| Dat is te ver voor 1 sprong. Het raketje springt steeds 1 streepje. | Dat is te ver voor 1 sprong. Tik op het getal vlak naast het raketje. / Zo ver springt het raketje niet in 1 keer. Tik op het volgende getal. | na deze zin wacht de les op een tik, maar er stond niet wat het kind moest doen (F16, BOUWREGELS 15.37); en het getal 1 stond 2 keer |
| Het raketje springt steeds 1 streepje. (2e keer overgeslagen) | Het raketje springt steeds 1 streepje. Tik op het volgende getal. / Elke sprong is 1 streepje. Tik op het getal vlak naast het raketje. | idem: nu met wat het kind doet (F16) |
| Je wilde het hele stuk in 1 keer. Het raketje springt steeds 1 streepje. | Je wilde het hele stuk in 1 keer doen. Het raketje maakt kleine sprongen. Tik op het volgende getal. / Jij wilt al naar het eind! Dat is te ver. Tik eerst op het getal vlak naast het raketje. | idem (F16); het getal 1 stond 2 keer; "Jij wilt al naar het eind!" is de gedachte van Synthesis ("je bent me een stap voor") |
| Het raketje sprong 3 keer vanaf de 0. Daarom staat het bij de 3. | Het raketje sprong 3 keer vanaf de 0. Daarom staat het nu bij dat getal. / Elke boog is 1 sprong. Het raketje sprong 3 keer vanaf de 0. / Het raketje maakte 3 sprongen vanaf de 0. Kijk maar naar de bogen. | het getal 3 stond 2 keer achter elkaar |
| (1. 2. 3.) Dat zijn 3 sprongen. | (1. 2. 3.) Zoveel sprongen maakte het raketje. / Zo vaak sprong het raketje. / Zoveel bogen zijn het. Elke boog is 1 sprong. | Bliepo telde net "3": het getal klonk 2 keer achter elkaar |
| (na samen tellen en de tik op de 3) Het raketje sprong 3 keer vanaf de 0. Daarom staat het bij de 3. | Ja, zo ver sprong het raketje. / Ja, daar staat het raketje nu. / Precies, tot daar sprong het raketje. (deed Bliepo de stap zelf: "Kijk, zo ver sprong het raketje.") | het aantal sprongen was net 2 keer gezegd; en na het vangnet zegt Bliepo geen "Ja" |
| Het raketje vliegt verder dan de 10. Welk getal komt na 10? | Het raketje vliegt verder dan de 10. Welk getal komt daarna? | het getal 10 stond 2 keer achter elkaar (de enige vraagzin die veranderd is) |
| Bij welk getal staat het raketje ongeveer? (2 keer achter elkaar, vraag 14 en 15) | vraag 15: Bij welk getal staat het raketje nu ongeveer? | niet 2 keer precies dezelfde zin; zo ook: "Zet ook deze getallen op volgorde." (vraag 7), "En wat staat er bij 14?" (vraag 11), "En welk getal ligt het dichtst bij 10?" (vraag 13) |
| Begin bij de 5 en tel 1 streepje verder. (hint) | Begin bij de 4. Tel de streepjes tot je bij het raketje bent. | "tel 1 streepje verder" is bijna het antwoord (15.17) |
| Zoek de 5 op de lijn. Welk getal komt daarna? (hint) | Zoek de 4 op de lijn. Tel vanaf daar de streepjes tot het raketje. | "daarna" is bijna het antwoord (15.17) |
| Kijk naar de 5. Tel vanaf daar de streepjes tot het raketje. (hint, terwijl 5 en 6 nog over waren) | Kijk naar de 4. Tel vanaf daar de streepjes tot het raketje. | de hint noemde een getal dat nog een keuze was: dan valt die keuze af en blijft er maar 1 over (15.17). Nu telt de hint vanaf een getal dat geen keuze is |
| 5 staat vlak vóór het raketje. / 5 is het streepje vóór het raketje. (1e keer) | Het raketje staat verder dan de 5. / Je koos 5. Het raketje staat verder. / 5? Het raketje is al verder. / Je tikte op 5. Daar is het raketje al voorbij. / Bijna! Het raketje staat net iets verder dan de 5. / 5? Dat is heel dichtbij. Het raketje staat iets verder. | "vlak vóór" verklapt het antwoord (15.17). Nu alleen de kant. "Bijna" en "dichtbij" alleen als er dan nog 2 keuzes dichtbij zijn |
| Bij de 5 is het raketje nog niet. | (zie hierboven) | onduidelijk: het kon ook betekenen dat het raketje nog vóór de 5 staat |
| 7 staat vlak na het raketje. / 7 is het streepje na het raketje. (1e keer) | 7 ligt verder dan het raketje. / Je koos 7. Zo ver is het raketje nog niet. / 7? Daar is het raketje nog niet. / Je tikte op 7. Dat is te ver. / Bijna! 7 is net iets te ver. / 7? Dat is heel dichtbij. Maar het is iets te ver. | "vlak na" verklapt het antwoord (15.17) |
| 17 staat vlak vóór het raketje. Het raketje staat 1 streepje verder dan de 17. (2e keer) | Het raketje staat bij het streepje na de 17. / 17 staat vlak vóór het raketje. Het raketje staat bij het volgende streepje. / Vlak na de 17 staat het raketje. | het getal stond 2 keer achter elkaar; bij het getal 1 klonk zelfs "1 streepje verder dan de 1" |
| Met 12 sla je een streepje over. (1e keer, na 10) | Zo ver als 12 is het raketje nog niet. / Je koos 12. Zo ver is het raketje nog niet. / 12? Daar is het raketje nog niet. / Je tikte op 12. Dat is te ver. | "sla je een streepje over" zegt bijna het antwoord (15.17); de zin komt nu pas bij de 2e keer |
| Het raketje is al voorbij de 10. Tel vanaf de 10 nog 1 streepje verder. (hint) | Het raketje is al voorbij de 10. Tel vanaf daar de streepjes. / Zoek de 10 op de lijn. Tel de streepjes tot het raketje. / Na de 10 gaat de lijn gewoon door. Tel verder vanaf dat getal. / Probeer het nog eens. Tel de streepjes vanaf het laatste getal dat je ziet. | het getal stond 2 keer achter elkaar; "nog 1 streepje" is bijna het antwoord |
| Je sloeg weer een streepje over. Elk streepje telt mee. | Je koos weer 12. Dan sla je een streepje over. | de 1e keer zegt Bliepo nu alleen "te ver"; "weer een streepje over" zou uit het niets komen |
| Na 5 zette je 7. | Na 5 legde je 7. / Je legde 7 na 5. / Na 5 komt bij jou 7. | bij slepen zegt Bliepo "legde" (BLIEPO-KARAKTER §2) |
| Na 5 zette je 8, het grootste getal. | Na 5 legde je 8, het grootste getal. / Je legde 8 vlak na 5. Dat is het grootste getal. / Na 5 komt bij jou meteen 8, het grootste getal. | idem |
| Na 5 zette je 7. Na 5 komt het getal dat 1 groter is. (2e keer) | Tussen 5 en 7 hoort nog een getal. / Je legde 7 na 5. Daar hoort nog een getal tussen. / Na 5 komt het getal dat 1 groter is. | het getal stond 2 keer achter elkaar |
| Je sloeg weer een getal over. Er komt steeds 1 bij. | Je sloeg een getal over. Er komt steeds 1 bij. (ook: "Er is een getal overgeslagen." / "Ik mis een getal in de rij.") | "weer" mag alleen als Bliepo het de 1e keer echt zei; de 1e keer zei hij alleen "Na 5 legde je 7." |
| Je zette ze weer van groot naar klein. Het kleinste getal komt vooraan. | Je legde ze weer van groot naar klein. Het kleinste getal komt eerst. (en 2 + 1 varianten) | "legde"; "vooraan" klopte niet (vooraan staat al een getal) |
| De ufo staat vóór de 17. Begin bij de 15 en tel streepje voor streepje verder tot de 17. (en dan de vraag: Tik op wat er bij 17 staat.) | De ufo staat vóór de 17. Zoek eerst de 15. Tel dan de streepjes verder. (hint ook: "Begin bij de 15. Tel streepje voor streepje verder." / "Kijk naar de 15. Tel vanaf daar de streepjes verder.") | het getal 17 klonk 3 keer achter elkaar |
| Van 8 naar de 20 zijn het 12 sprongen. Hoe minder sprongen naar de 20, hoe dichterbij. | Van 8 naar de 20 zijn het 12 sprongen. Tel bij elk getal de sprongen. Hoe minder sprongen, hoe dichterbij. (hint ook: "Hoe minder sprongen, hoe dichterbij. Tel ze bij elk getal." / "Welk getal heeft de minste sprongen nodig? Tel ze maar.") | het getal 20 stond 2 keer achter elkaar |
| 16 ligt vlak na de 15. Het raketje staat vlak bij de 10. (2e keer; eerst 2 losse zinnen uit 2 rijtjes) | Het raketje staat vlak bij de 10. / Het raketje staat vlak bij de 10. Daar ligt 16 niet. | de uitleg is nu 1 reactie met elk getal 1 keer |
| Je telde de getallen 0, 1, 2 en 3. Dat zijn er 4. Maar we tellen de sprongen. Elke boog is 1 sprong. | Je telde de getallen 0, 1, 2 en 3. Dat zijn er 4. Maar we tellen de sprongen, niet de getallen. (hint ook: "We zoeken hoeveel sprongen het zijn. Kijk naar de bogen.") | het getal 1 klonk 2 keer achter elkaar |
| Kom, we zetten de getallen op de lijn. Hier is de 20. (het rondje stond om de 18) | Kom, we zetten de getallen op de lijn. We springen van de 18 naar de 20. | Bliepo noemde een ander getal dan waar het rondje om stond |
| Van 18 naar de 20: maar 2 sprongen. De andere getallen liggen verder weg. | Dat zijn maar 2 sprongen. De andere getallen liggen verder weg. / Het zijn maar 2 sprongen. Dat is het dichtst bij. | de 2 getallen waren net gezegd |
| De 14 komt 1 verder. Dus 14 is meer. | De 14 komt 1 sprong verder. Dat getal is dus meer. / Daarna komt 14. Wat later komt, is meer. | het getal stond 2 keer achter elkaar; "1 verder" is geen hele zin |
| Na 5 komt 6. Na 6 komt 7. | Na 5 komt 6. En dan komt 7. (ook: "Eerst de 6: die komt na 5." en "Daarna komt 7.") | het getal 6 stond 2 keer achter elkaar |
| Hier staat het raketje: bij de 6. Tik jij op de 6? | Hier staat het raketje: bij de 6. Tik jij op dat getal? / Tik jij dat getal aan? | het getal stond 2 keer achter elkaar |
| Bij de 17 staat het raketje. Tik jij op het raketje? | Bij de 17 staat het raketje. Tik jij erop? / Wil jij erop tikken? | "het raketje" stond 2 keer achter elkaar |
| Ja, 18 ligt maar 2 van de 20 af. | Ja, 18 ligt maar 2 sprongen van de 20 af. | "2 van de 20 af" miste een woord |
| Kijk naar de getallen vlak naast het raketje. / Kijk recht onder het raketje. (bij de 2e keer) | De getallen naast het raketje hebben 2 cijfers. / Recht onder het raketje hoort het getal dat we zoeken. | een opdracht bij de 2e keer kan het kind niet meer doen: Bliepo doet het daarna samen voor |
| Je koos weer het streepje vóór het raketje. / Je koos weer het streepje na het raketje. | Je koos weer een getal vóór het raketje. / Je koos weer een getal dat te ver ligt. (en 2 varianten elk) | "weer" moet passen bij wat Bliepo de 1e keer zei ("verder", "te ver") |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Laat maar zien! | blijft, en erbij: Toe maar, laat maar zien! / Fijn! Laat maar zien wat je kunt. | variatie (3) |
| Dat gaat goed. We gaan verder. | Dat gaat goed! We gaan verder. / Je kunt het al goed. We gaan door. / Dat gaat al heel goed. Kom, we gaan verder. | variatie (3) |
| Fijn, ik help je op weg. | blijft, en erbij: Goed dat je het zegt. Ik help je. / Dan doen we het eerst samen. Ik help je. | variatie (3) |
| Dit is een getallenlijn. Bij elk streepje hoort een getal. | blijft, en erbij: Kijk, dit is een getallenlijn. Elk streepje heeft zijn eigen getal. | variatie |
| Het raketje begint bij de 0. | blijft, en erbij: Kijk, hier begint het raketje: bij de 0. | variatie |
| Tik op dit getal. (hulphandje) | blijft, en erbij: Tik maar op dit getal. / Hier springt het raketje heen. Tik erop. | variatie (3) |
| Kijk, zo springt het raketje: steeds 1 streepje verder. | blijft, en erbij: Kijk, ik laat het zien. Het raketje springt steeds 1 streepje verder. | variatie |
| Kom, we tellen de bogen samen. | blijft, en erbij: Weet je wat? We tellen de bogen samen. / Geeft niks. We tellen de bogen samen. / Ik help je even. We tellen de bogen samen. | variatie (4) |
| Tik jij op de 3? / Tik op de 3. | blijven, en erbij: Tik jij de 3 aan? / Tik maar op de 3. | variatie |
| Nu jij. Kijk goed naar de getallen naast het raketje. | Nu jij! Kijk goed naar de getallen naast het raketje. / Nu mag jij het proberen. De getallen naast het raketje helpen je. / Probeer jij het nu maar. Kijk goed naar de getallen naast het raketje. | variatie (3) |
| De vraag opnieuw (1 zin per soort): Welk getal hoort bij het raketje? enzovoort | blijven, en per soort 1 of 2 erbij: "Bij welk getal staat het raketje, denk je?", "Wat komt er na de 10?", "Wat is meer, denk je: 13 of 14?", "Zet de kaarten van klein naar groot.", "Wat staat er bij de 17? Tik erop.", … | variatie (2 of 3) |
| Sleep een kaart naar dit vak. (hulphandje) | blijft, en erbij: Sleep maar een kaart naar dit vak. / Hier mag een kaart liggen. Sleep hem erheen. | variatie (3) |
| Kom, we springen samen. / Kom, we leggen ze samen. / Kom, we zetten de getallen op de lijn. | blijven, en bij elk 3 erbij: Weet je wat? … / Geeft niks. … / Ik help je even. … | variatie (4); "Ik help je even" is van Synthesis |
| Ik begin bij de 5. | blijft, en erbij: We beginnen bij de 5. / Kijk, we starten bij de 5. | variatie (3) |
| Ik zet alle streepjes erbij. | blijft, en erbij: Kijk, ik zet alle streepjes erbij. | variatie |
| Hier staat de 13. | blijft, en erbij: Kijk, hier is de 13. | variatie |
| Hier staat het raketje: bij de 6. | blijft, en erbij: En hier staat het raketje: bij de 6. / Kijk, bij de 6 staat het raketje. | variatie (3) |
| Bij de 17 staat het raketje. | blijft, en erbij: Kijk, bij de 17 staat het raketje. / Hier is de 17. Daar staat het raketje. | variatie (3) |
| Sleep jij de 8 naar het laatste vak? / Sleep de 8 hierheen. | blijven, en erbij: Nu de 8 nog. Sleep jij hem naar het laatste vak? / Sleep de 8 maar hierheen. | variatie |
| Tik op de 6. / Tik op het raketje. (hulphandje) | blijven, en erbij: Tik maar op de 6. / Tik maar op het raketje. | variatie |
| Ja, dat is de 6. | blijft, en erbij: Ja, bij de 6 staat het raketje. / Precies, daar staat het raketje. (na 10: "Ja, na de 10 komt de 11.") | variatie (3) |
| Ja, nu staan ze op volgorde. | blijft, en erbij: Ja, zo gaan ze van klein naar groot. / Precies, nu liggen ze goed. | variatie (3) |
| Ja, het raketje staat bij de 17. / Ja, 14 is meer. / Ja, 18 ligt het dichtst bij. | blijven, en erbij: Precies, daar staat het raketje. / Precies, 14 is meer dan 13. / Precies, 18 ligt het dichtst bij de 20. | variatie |
| Kijk, hier is de 6. / Kijk, nu staan ze op volgorde. / Kijk, hier staat de ufo. (Bliepo deed de stap zelf) | blijven, en erbij: Ik wijs hem even aan. Hier is de 6. / Ik leg de laatste kaart neer. Nu staan ze op volgorde. / Ik wijs het even aan. Hier staat de ufo. | variatie |
| Je koos weer 7. / Je tikte weer op de ufo. / Je legde ze weer zo neer. | blijven, en erbij: Je tikte weer op 7. / Weer 7, zie ik. / Weer de ufo, zie ik. / Ze liggen weer net zo, zie ik. | variatie |
| Je weet nu waar het raketje staat op de getallenlijn. | blijft, en erbij: Goed gewerkt! Je kent de getallenlijn al goed. / Knap, hoor! Jij vindt het raketje op de getallenlijn. | variatie (3) |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie (3), zoals de andere lessen |
| Je bent goed bezig. / Jij kunt dit. (hulphandje) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (5) |
| Reactie na lof: 5 zinnen per soort vraag | blijven, en per soort 2 erbij: "Precies, het raketje staat bij de 6." / "Dat klopt: na de 5 komt de 6." enzovoort | variatie (7); "Precies" is van Synthesis |
| 4 staat niet op deze lijn. Deze lijn begint bij de 9. | blijft, en erbij: Je koos 4. Dat getal staat niet op deze lijn. / 4? Dat getal vind ik niet op deze lijn. / Je tikte op 4. Deze lijn begint pas bij de 9. | variatie (4) |
| Bij de 17 staat het raketje niet. / Het raketje staat niet bij de 17. (als de kant het antwoord zou verklappen) | blijven, en erbij: Je koos 17. Daar staat het raketje niet. / 17? Daar staat het raketje niet. / Je tikte op 17. Het raketje staat ergens anders. | variatie (5) |
| Kijk recht onder het raketje. Tel de streepjes vanaf een getal dat je ziet. (hint zonder kant) | blijft, en erbij: Zoek een getal dat je ziet. Tel vanaf daar de streepjes tot het raketje. / Probeer het nog eens. Tel de streepjes tot het raketje. | variatie (3) |
| 1 staat vooraan op de lijn, vlak na de 0. | blijft, en erbij: Je koos 1. Dat getal staat vooraan op de lijn. / 1? Dat staat helemaal vooraan op de lijn. | variatie (3) |
| 13 zeg je eerder als je telt. | blijft, en erbij: Je koos 13. Dat getal zeg je eerder als je telt. / 13? Dat komt eerder als je telt. | variatie (3) |
| Hints bij wat is meer (2) en op volgorde (2) | blijven, en erbij: Tel maar in je hoofd. Welk getal zeg je later? / Tel maar hardop verder. Welk getal komt dan? | variatie (3) |
| De ufo staat vóór de 17. | blijft, en erbij: Je tikte op de ufo. Die staat vóór de 17. / De ufo? Die staat nog vóór de 17. (na: "… staat al voorbij de 17.") | variatie (3) |
| Van 8 naar de 20 zijn het 12 sprongen. / 8 ligt 12 sprongen van de 20 af. | blijven, en erbij: Je koos 8. Dat ligt 12 sprongen van de 20 af. | variatie (3) |
| 16 ligt vlak na de 15. / 19 ligt vlak vóór de 20. / 13 ligt tussen de 10 en de 15. | blijven, en erbij: Je koos 16. Dat getal ligt vlak na de 15. / 16? Dat ligt vlak na de 15. | variatie (3) |
| Hints bij ongeveer (2) | blijven, en erbij: Het raketje staat vlak bij een getal op de lijn. Zoek dat getal. | variatie (3) |
| Er zijn meer bogen dan 2. | blijft, en erbij: Je koos 2. Ik zie meer bogen. / 2? Ik tel meer bogen. | variatie (3); "Ik tel er meer" is van Synthesis |
| Tel elke boog, van de 0 tot het raketje. | blijft, en erbij: Wijs de bogen stuk voor stuk aan en tel ze. / Begin bij de 0. Tel de bogen tot het raketje. | variatie (3) |
| Alle "weer"-zinnen (1 per soort) | blijven of zijn verbeterd (Deel A), en erbij: "Dat is weer …" en "Weer …, zie ik." | variatie (2 of 3) |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een keuze die niet goed is | 3 tot 6 per soort (6 met "bijna" en "dichtbij") |
| Hint | 3 tot 5 per soort (uitlegvraag "4": 2) |
| Uitleg bij de 2e keer | 2 of 3 |
| "Weer …" (2 keer dezelfde denkfout) | 2 of 3, met 2 soorten uitleg |
| "Je koos weer …" | 3 (ding en kaarten: 2), met 2 soorten uitleg erachter |
| De vraag opnieuw (na de hint) | 2 of 3 |
| "Kom, we springen samen." | 4 |
| Samen voordoen: begin, bij het doel, de kleine stap, klaar | 2 of 3 elk |
| Hulphandje: aanmoediging | 5 |
| Hulphandje: wat te doen | 2 of 3 |
| Zin met het antwoord na lof | 7 |
| Begin, slot | 2 en 3 |
| "Tik op de kaart." | 3 |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) |

## De fouttabel is strenger gemaakt (zoals bij Tellen)

Het fouttabel-script (`scripts/fouttabel-getallenlijn-gouden.ts`) loopt nu ALLE varianten na, niet alleen 1 vaste zin per rij (1.168 varianten, 479 combinaties van eerste zin + hint):

- **Elk stukje van elke zin moet het script kennen.** Het knipt een zin in stukjes ("Je koos 7" + "Zo ver is het raketje nog niet") en kijkt bij elk stukje of het waar is in het beeld (801 beweringen). Een stukje dat het script niet kent, telt als fout.
- **Verklappen (15.17):** uit de stukjes rekent het script per eerste zin + hint uit welke keuzes nog over zijn. Er blijven er altijd 2 over en het goede antwoord valt niet af. Nieuw: ook een hint die een keuze noemt ("Kijk naar de 5." terwijl 5 nog een keuze is) telt mee. Daardoor telt de hint bij 4 vragen (1, 2, 3 en 9) nu vanaf een ander getal.
- **Nieuw: "vlak vóór", "vlak na" en "1 streepje" mogen niet bij de 1e keer.** Die zeggen het antwoord. Ze komen pas in de uitleg bij de 2e keer.
- **Nieuw: ook "bijna" en "dichtbij" mogen niets verklappen:** alleen als het er 1 naast zit en er dan nog 2 keuzes dichtbij zijn. Bij vraag 2 (keuzes 2, 1 en 4) en vraag 8 zegt Bliepo het daarom niet.
- **Geen getal 2 keer:** niet in 1 zin, niet in de eerste zin en de hint, en niet in 2 zinnen achter elkaar bij het samen voordoen of tussen de hint en de vraag die terugkomt.
- **Geen opdracht bij de 2e keer**, nooit het woord "fout", nooit het woord "vinkje" (dan laat het lesscherm de hele zin weg).
- **Altijd een vraag of opdracht (15.37, F16):** elke zin waarna de les op het kind wacht heeft een vraagteken of zegt wat het kind doet ("Tik …", "Sleep …", "Zet …"). Na de hint komt de vraag in andere woorden terug.
- **Alles past in het tekstvak:** elke reactie is hooguit 125 tekens (de langste van de eerste versie was 129).
- **Nooit 2 keer hetzelfde:** de kiezer wordt 20.000 keer nagespeeld met willekeurige vragen en keuzes, met dezelfde functie als de les gebruikt: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een zin of getal 2 keer in 1 reactie.
- **Het rondje alleen als Bliepo het getal noemt** (BOUWREGELS 7.8): zegt de hint geen getal, dan komt er ook geen rondje.

## Zinnen van Synthesis (Count the Jumps), in het Nederlands (besluit Sara, 17 november 2026)

Alleen de tekst, passend gemaakt voor groep 3. Geen audio, beeld of code.

| Synthesis zegt (vertaald uit het draaiboek Getallenlijn) | Bij ons nu | Waar |
|---|---|---|
| wil je laten zien wat je nog weet? | Wil je laten zien wat je al kunt? | het begin |
| dit kan lastig zijn, we doen een stap terug | Dit kan lastig zijn. Dat geeft niks. We doen samen een stapje terug. | na 2 keer mis in de proef |
| je bent me een stap voor; je deed het hele verschil in één sprong | Jij wilt al naar het eind! Dat is te ver. / Je wilde het hele stuk in 1 keer doen. | uitleg: springen |
| dat was geen sprong van 1 | Dat is te ver voor 1 sprong. (stond er al) | uitleg: springen |
| dat zijn 2 getallen, maar hoeveel sprongen? | Je telde de getallen 0, 1, 2 en 3. Dat zijn er 4. Maar we tellen de sprongen, niet de getallen. | uitlegvraag |
| precies | Precies, het raketje staat bij de 6. | zin na lof |
| ik help je met deze | Ik help je even. We springen samen over de lijn. | 2e keer mis |

Niet overgenomen: "hm, niet helemaal" en "een interessant antwoord" (vaste openingen die Bliepo niet zegt, BLIEPO-KARAKTER §9), "ik zet je klaar voor nog een kans" (geen juf-Nederlands), "wil je pauze?" (de les stopt nooit) en de lofwoorden "heel gaaf" (lof komt uit het vaste rijtje van alle lessen).

## Niet gedaan, met reden

- **De vragen zelf afwisselen** ("Bij welk getal staat het raketje?"): niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11) en de inhoud van de Squla-les blijft gelijk (15.22). Alleen de 2e vraag van dezelfde soort krijgt "nu", "ook deze" of "En …" ervoor.
- **Het verhaaltje bij "wat is meer"** ("Gisteren vond het er 13. Vandaag vond het er 14. Wat is meer: 13 of 14?"): niet veranderd. De getallen staan er 2 keer in, maar de vraag gaat juist over die 2 getallen en de knoppen zijn 13 en 14.
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) herschrijven:** niet gedaan. Die staan in BLIEPO-KARAKTER.md en worden door alle gouden lessen gebruikt.
- **"Bijna" bij elke keuze die er 1 naast zit:** niet waar er dan nog maar 1 keuze dichtbij is (15.17).
- **De kant noemen bij vraag 9** (keuzes 17, 18 en 8; het kind kiest 17): niet gedaan, want "verder" laat alleen de 18 over. Bliepo zegt daar "Bij de 17 staat het raketje niet." (dat was al zo).
- **Een aanmoediging met de naam van het kind bij een keuze die niet goed is:** niet gedaan (BOUWREGELS 3.17).
- **De startvraag weghalen:** niet gedaan. Het draaiboek Getallenlijn heeft een startvraag; die blijft (alleen de zin is veranderd).
- **De oude les `squla-getallenlijn.tsx` en de andere getallenlijn-lessen:** niet aangeraakt (harde regel 8 en de afspraak: alleen deze les).

## Herstel 19 november 2026 (keuring F16, 15.37: het begin)

Geen nieuwe woorden. De groet ("Hoi Testkind! Fijn dat je er bent.") en de startvraag waren 2 alinea's: soms stond de groet 3 seconden alleen wit in beeld, met Ja en Nee al tikbaar en de vraag nog gedimd. Nu zijn groet en startvraag 1 alinea: ze komen samen in beeld en Bliepo zegt ze in 1 keer.

Ook (19 november 2026, dezelfde regel als bij Vormen: geen los "En" aan het begin van een vraag, 15.36):

| Oud | Nieuw |
|---|---|
| En wat staat er bij 14? | Wat staat er nu bij 14? |
| En welk getal ligt het dichtst bij 10? | Welk getal ligt nu het dichtst bij 10? |
