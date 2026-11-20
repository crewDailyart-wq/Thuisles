# WIJZIGINGEN-ZINNEN-KLOK — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers en Meten, nu voor de gouden les Klok (`squla-klok-hoelaat-1-gouden`, "Hoe laat is het?"). De Klok heeft geen extra les. De oude les (`squla-klok.tsx`) is niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit 8985be0 en eerder).

**Let op, het zinnenbestand van de Klok is ook van de andere lessen.** In `squla-klok-gouden-zinnen.ts` staan bovenaan de vaste rijtjes die ALLE gouden lessen gebruiken (lof, "nu is het goed", eindzinnen, groet, aanmoediging, overgang, de zin als de denkfout niet duidelijk is). Nagekeken: 19 andere zinnenbestanden lezen die rijtjes. **Daar is geen letter aan veranderd.** Alleen het deel van de Klok zelf (het verloop, de fouttabel, de uitleg, samen voordoen) is nagelopen. Dat deel gebruikt alleen de klokles en het fouttabel-script.

**Niet veranderd:** de 13 klokken en hun volgorde, de tijden, de keuzes, de antwoorden, de verhaalzinnen ("De bezorgbus staat klaar bij de bakkerij."), de weetjes, de vragen van de uitleg, de startvraag met Ja en Nee (Ja = proef van 2 klokken, Nee = samen leren), de gloed om de wijzer en de oranje ring.

**Alle varianten op een rij:** FOUTTABEL-squla-klok-gouden.md, §7.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos 6 uur. Ik lees een andere tijd." en "Je koos 9 uur. Ik lees een andere tijd." tellen als dezelfde zin, net als de zin met "links" en dezelfde zin met "rechts". Bij 1 vraag zegt Bliepo nooit 2 keer dezelfde zin: ook de hint van de 1e keer komt bij de 2e keer niet terug als uitleg. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd).

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les lees je op de klok hoe laat het is. Je kijkt naar de wijzers en kiest het hele uur. Weet jij al hoe dat moet? | Vandaag lezen we op de klok hoe laat het is. We kijken naar de wijzers. Kun jij al klokkijken? / We gaan samen klokkijken. De wijzers laten zien hoe laat het is. Kun jij de klok al lezen? / Vandaag leren we klokkijken. We kijken naar de wijzers en lezen het uur. Lukt jou dat al? | "Weet jij al hoe dat moet?" is vaag (BOUWREGELS 15.36); "het hele uur" is dan nog niet uitgelegd; warmer, zoals een juf begint. Ja en Nee werken precies als eerst |
| Hoe heet de grote wijzer? (de vraag opnieuw, na de hint) | Hoe heet deze paarse wijzer? / Hoe heet de wijzer die de minuten telt? | **de vraag verklapte het antwoord:** het antwoord is "de grote wijzer" (15.17) |
| Hoe heet de kleine wijzer? (de vraag opnieuw, na de hint) | Hoe heet deze korte oranje wijzer? / Hoe heet deze oranje wijzer, denk je? | idem: het antwoord is "de kleine wijzer" |
| Je zat er vlak naast. (bij elke klok waar het kind het getal ernaast koos) | Je koos 6 uur. Ik lees een andere tijd. / 6 uur? Ik zie een ander uur op de klok. / Je tikte op 6 uur. De kleine wijzer zegt iets anders. | "vlak naast" verklapt het antwoord als er maar 1 keuze vlak naast ligt (15.17). "Je zat er vlak naast." blijft waar 2 keuzes vlak naast liggen (klok 2 en klok 4) |
| De 1 staat hoog, vlak naast de top. | De 1 staat hoog, maar nog niet op het hoogste punt. / De 1 staat hoog. Maar er staat een getal nog hoger. | idem: "vlak naast de top" wees de 12 aan |
| Tik nu zelf op 3 uur. / Tik nu zelf op de 3. / Tik nu zelf op: een getallenlijn. (na samen voordoen) | Tik nu zelf op het antwoord. / Nu jij! Tik op het antwoord. / Tik jij het antwoord nu aan? | het antwoord klonk net ("Dus het is 3 uur." en dan "Tik nu zelf op 3 uur."); er staat dan nog maar 1 knop |
| Hier is de 2, in het oranje rondje. Tik maar op de 2. | Hier is de 2, in het oranje rondje. Tik er maar op. (ook: Tik jij erop? / Tik het maar aan.) | het getal klonk 2 keer achter elkaar |
| Kijk, de kleine wijzer wijst naar de 12, in het oranje rondje. De grote wijzer staat op de 12. Dus het is 12 uur. | Kijk, de 2 wijzers wijzen allebei naar de 12. Dat zie je in het oranje rondje. Dus het is 12 uur. | bij de klok op 12 uur klonk "12" 3 keer |
| Je had ze allemaal in 1 keer goed! Nog 1 als toetje. | Je had ze allemaal meteen goed! Hier is nog een toetje. | het getal 1 klonk 2 keer achter elkaar (en daarna nog in de vraag) |
| Na de 12 komt de 1. Over 1 uur is het 1 uur. | Na de 12 komt de 1, in het oranje rondje. Zo laat is het straks. | het getal 1 klonk 3 keer |
| Je ging 1 uur terug. | Je ging terug in de tijd. / Dat is eerder, niet later. | "1 uur" is ook het antwoord |
| Over 1 uur is het later. Ga vanaf de 12 verder, de kant op van de pijl. | We zoeken een tijd die later is. Ga verder, de kant op van de blauwe pijl. / Straks is het later dan nu. Kijk maar naar de blauwe pijl. | idem |
| Over 1 uur is het later dan nu. Begin bij de 12 en ga met de klok mee. | Straks is het later dan nu. Begin bij de 12 en ga met de klok mee. / De kleine wijzer blijft niet staan. Hij gaat verder, met de klok mee. | idem |
| Over 1 uur is het later: de kleine wijzer gaat 1 getal verder, met de klok mee. | Straks is het later. De kleine wijzer gaat dan een stukje verder, met de klok mee. | het getal 1 stond 2 keer in 1 zin |
| Over 1 uur is het 1 uur later dan nu. | Straks is het later dan nu. | idem |
| Over 1 uur staat de kleine wijzer 1 getal verder. | Straks staat de kleine wijzer bij het volgende getal. | idem |
| De 5 komt vóór de 6. Erna betekent: deze kant op. Ga vanaf de 6 verder, de kant op van de pijl. (en dan de vraag: Welk getal komt na de 6?) | De 5 komt vóór de 6. Erna betekent: deze kant op. Ga verder, de kant op van de blauwe pijl. | de 6 klonk 3 keer vlak achter elkaar |
| Je ging 2 getallen verder. Zet je vinger op de 6. Schuif met de klok mee naar het eerstvolgende getal. | Je ging 2 getallen verder. Erna is het getal dat er meteen achter staat. | "met de klok mee" is op dat moment nog niet uitgelegd; "eerstvolgende" is een moeilijk woord |
| Op een getallenlijn komt de 13 na de 12, dat snap ik. Op deze klok staat geen 13. Ga vanaf de 12 verder, de kant op van de pijl. | Op een getallenlijn komt de 13 na de 12, dat snap ik. Maar zo'n groot getal staat niet op de klok. Ga verder, de kant op van de blauwe pijl. | 13 en 12 klonken 2 keer achter elkaar |
| De 11 komt vóór de 12. We zoeken het getal erna. Ga vanaf de 12 verder, de kant op van de pijl. | De 11 komt vóór de 12. We zoeken het getal erna. Ga verder, de kant op van de blauwe pijl. | de 12 klonk 3 keer vlak achter elkaar |
| Op de klok begin je na de 12 weer opnieuw. | Op de klok begin je daarna weer opnieuw. / De klok heeft geen hogere getallen. Hij begint weer opnieuw. | de 12 klonk net |
| Je vond de 6, dat zag je goed. Welke wijzer wijst naar de 6? Die vertelt het uur. | Je vond het juiste getal, dat zag je goed. Welke wijzer wijst ernaar? Die vertelt het uur. | de 6 klonk 2 keer achter elkaar en is het getal van het antwoord |
| Dus het is nog geen 7 uur. | Dus zo laat is het nog niet. | de 7 klonk in de zin ervoor |
| Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden. (als hint bij "Is het nu 7 uur?") | Kijk ook naar de grote wijzer. Bij een heel uur wijst die recht omhoog. / Let ook op de grote wijzer. Die licht nu op. | dezelfde zin kwam bij die vraag daarna nog een keer (bij samen voordoen); nu klinkt hij 1 keer (15.29) |
| Kijk naar de kleine wijzer. Waar wijst zijn punt naar? (en dan: Hoe laat is het?) | Kijk naar de kleine wijzer. Zijn punt wijst naar het uur. | 2 vragen achter elkaar |
| Hier staat de kleine wijzer op hetzelfde getal als de grote. Welk getal is dat? | Hier staat de kleine wijzer op hetzelfde getal als de grote. / De kleine en de grote wijzer wijzen hier naar hetzelfde getal. | idem |
| Je zette de punt links, maar de 2 staat rechts. Draai de punt naar de 2, in het oranje rondje. | Je zette de punt links, maar de 2 staat rechts. Draai de punt naar het oranje rondje. | het getal klonk 2 keer achter elkaar |
| Kijk naar het oranje rondje: daar moet de punt heen. | Kijk naar het oranje rondje. Draai de punt daarheen. / Zoek het oranje rondje. Zet de punt erin. / Tik op het getal in het oranje rondje. | de zin zei niet wat het kind doet (15.37) |
| Kijk waar het handje wijst en tik daar. (en dan: Tik maar op de 2.) | Kijk waar het handje wijst. Daar moet de punt heen. / Het handje wijst de goede plek aan. | 2 keer "tik" achter elkaar |
| Kijk waar het oranje rondje is. | Kijk waar het oranje rondje is. Daar hoort de punt. | zei niet wat daar hoort |
| Weer het getal aan de andere kant, links en rechts zijn omgedraaid. | Weer het getal aan de andere kant. Links en rechts zijn omgedraaid. | 2 zinnen met een komma aan elkaar |
| Het hoogste getal staat bovenaan de rand, het laagste onderaan. (als "andere uitleg") | Het hoogste punt is helemaal boven. Het laagste punt is helemaal onder. | de "andere uitleg" was dezelfde zin als de uitleg |
| Tik op een van de getallen. | Tik op een getal op de lijn. | de opdracht zegt nu ook waar |
| Deze klokken oefen je een andere keer nog eens. | Deze klokken oefenen we een andere keer nog eens. / Dit oefenen we een andere keer nog eens. Dat komt goed. | warmer ("we") |
| 2e keer mis, een ander antwoord: Bliepo kon 2 keer dezelfde eerste zin zeggen | de les kiest nu altijd een andere eerste zin dan de 1e keer | nooit 2 keer hetzelfde |
| De vraag na de hint was vaak letterlijk dezelfde zin als de 1e keer ("Weet jij hoe dit heet?", "Hoe laat is het nu?") | Hoe heet dit, denk je? / Wat denk je nu? Hoe laat is het? | de vraag komt terug (15.37), maar nooit precies dezelfde zin |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Hoe laat is het? (na de hint, bij elke klok) | blijft, en erbij: Hoe laat is het, denk je? / Wat denk je nu? Hoe laat is het? / Kijk nog eens goed. Hoe laat is het? | de zin kwam na elke hint letterlijk terug (4) |
| Naar welk getal wijst de kleine wijzer? (na de hint) | blijft, en erbij: Naar welk getal wijst de kleine wijzer, denk je? / Wat denk je nu? Waar wijst de kleine wijzer naar? | variatie (3) |
| Je keek naar de grote wijzer. | blijft, en erbij: Je koos het getal bij de grote wijzer. / Dat is het getal van de grote wijzer. | variatie (3) |
| Bij een heel uur kijken we naar de kleine wijzer. | blijft, en erbij: We zoeken de kleine wijzer. Die licht nu op. / Zoek de kleine wijzer. Die vertelt het uur. | de hint was altijd dezelfde (3) |
| Je keek naar de andere kant van de klok. | blijft, en erbij: Dat getal staat aan de andere kant van de klok. / Je koos het getal aan de overkant. | variatie (3) |
| Kijk waar de punt van de kleine wijzer is. | blijft, en erbij: De wijzer begint in het midden. Kijk waar zijn punt is. / Volg de kleine wijzer van het midden naar de punt. | variatie (3) |
| Je koos het getal links, maar de wijzer wijst naar rechts. | blijft, en erbij: Dat getal staat links. De kleine wijzer wijst naar rechts. / Je keek links, maar de punt van de wijzer staat rechts. | variatie (3) |
| Kijk of de punt van de kleine wijzer links of rechts staat, en neem het getal precies daar. | blijft, en erbij: Kijk goed naar welke kant de punt wijst. Daar zoek je het getal. / Volg de kleine wijzer tot aan zijn punt. Aan die kant staat het getal. | variatie (3) |
| Volg de kleine wijzer tot het getal waar hij precies naar wijst. | blijft, en erbij: Kijk heel precies waar de punt van de kleine wijzer staat. / Volg de kleine wijzer vanaf het midden, helemaal tot zijn punt. | variatie (3) |
| Volg de kleine wijzer vanaf het midden tot aan de punt. (denkfout niet duidelijk) | blijft, en erbij: Zoek de punt van de kleine wijzer. Daar staat het getal. / De kleine wijzer licht op. Kijk waar zijn punt naartoe wijst. | variatie (3) |
| Bij de 12 hoort de grote wijzer. (zetten) | blijft, en erbij: De 12 is de plek van de grote wijzer. / Daar staat de grote wijzer al, bij de 12. | variatie (3) |
| Zet de kleine wijzer bij de 2. | blijft, en erbij: Draai de kleine wijzer naar de 2. / Tik op de 2, in het oranje rondje. | variatie (3) |
| De punt staat nu aan de andere kant. | blijft, en erbij: Je draaide naar de andere kant van de klok. / Nu wijst de punt naar de overkant. | variatie (3) |
| Draai de punt naar de 2. | blijft, en erbij: Draai de wijzer verder, tot bij de 2. / Zet de punt bij de 2, in het oranje rondje. | variatie (3) |
| Je zette de punt links, maar de 2 staat rechts. | blijft, en erbij: De punt staat nu links. De 2 staat rechts. / Je draaide naar links, maar de 2 staat rechts. | variatie (3) |
| Je zette hem vlak naast de 2. | blijft, en erbij: Bijna! De punt staat naast de 2. / De punt staat er vlak naast. | variatie (3); bij zetten is het doel bekend, dus "vlak naast" verklapt niets |
| Draai een klein stukje verder of terug, naar het oranje rondje. | blijft, en erbij: Draai de punt nog een klein stukje, naar het oranje rondje. / Schuif de punt nog een beetje op, naar het oranje rondje. | variatie (3) |
| Bij de 6 staat nu de kleine wijzer. / Bij de 3 staat de kleine wijzer. | blijven, en erbij: De 3? Daar wijst de kleine wijzer naar. / Je koos de plek van de kleine wijzer. | variatie (3) |
| Kijk, de kleine wijzer wijst naar de 3, in het oranje rondje. De grote wijzer staat op de 12. Dus het is 3 uur. | blijft, en erbij: De punt van de kleine wijzer staat bij de 3. De grote wijzer wijst recht omhoog. Dus het is 3 uur. / Kijk, in het oranje rondje staat de 3. Daar wijst de kleine wijzer naar. Het is dus 3 uur. | samen voordoen was bij elke klok dezelfde zin (3) |
| De punt van de kleine wijzer staat bij de 3, in het oranje rondje. | blijft, en erbij: Kijk, de kleine wijzer wijst naar de 3, in het oranje rondje. / In het oranje rondje staat de 3. Daar wijst de kleine wijzer naar. | variatie (3) |
| Hier is de 2, in het oranje rondje. | blijft, en erbij: Kijk, het handje wijst naar de 2. En als de 2 net genoemd is: Het handje wijst het getal aan. / Kijk, het staat in het oranje rondje. | variatie; het getal niet 2 keer achter elkaar |
| Tik op de 2, of sleep de kleine wijzer erheen. (hulphandje) | blijft, en erbij: Tik maar op de 2. Slepen met de wijzer mag ook. | variatie |
| Fijn! Dan kijken we eerst of het lukt. | blijft, en erbij: Mooi! Dan proberen we er eerst 2. / Wat goed! We beginnen met 2 klokken. | variatie (3) |
| Dit is nog lastig. We gaan het eerst samen bekijken. | blijft, en erbij: Dat geeft niks. We kijken er eerst samen naar. / Weet je wat? We leren het eerst samen, stap voor stap. | variatie (3); warmer |
| Mooi, dat kun je al! | blijft, en erbij: Kijk eens aan, je kunt het al! / Zie je wel, dat lukt jou al! | variatie (3) |
| Dat geeft niks. We gaan het samen bekijken. | blijft, en erbij: Geen probleem. We leren het samen, stap voor stap. / Dan doen we het samen. Ik help je. | variatie (3) |
| Nu mag jij de klokken lezen. / Nu nog meer klokken. | blijven, en erbij: Nu ga jij zelf klokkijken. / We gaan door met nog meer klokken. | variatie |
| Er komt nog 1 klok van net terug. / Er komen nog 3 klokken van net terug. | blijven, en erbij: We doen nog 1 klok van net. / Nog 1 klok van net. Die oefenen we nog even. (zo ook met 3) | variatie (3); warmer ("we") |
| Nog 1 klok om te oefenen. / Nog 3 klokken om te oefenen. | blijven, en erbij: We oefenen nog 1 klok. / We oefenen nog 3 klokken. | variatie |
| Nu kun je het uur lezen met de kleine wijzer. | blijft, en erbij: Je hebt goed gewerkt vandaag! Je kunt nu zien welk uur het is. / Mooi gewerkt! Jij kunt nu de hele uren lezen op de klok. | variatie (3); vrolijker |
| Ja, het is precies 3 uur. (en de 3 andere reacties na lof) | blijven, en erbij: Precies, het is 3 uur. / Dat klopt, de kleine wijzer wijst naar de 3. | variatie (6); "Precies" zoals bij Plussommen |
| Alle eerste zinnen en hints bij de vragen van de uitleg (1 per antwoord) | blijven, en per antwoord 1 erbij, zoals: Dat was het net nog, ja. / De lijn is nu gebogen tot een rondje. / Dat is het laagste punt. De 6 staat onderaan. / Volg de rand tot je niet hoger kunt. / De 5 staat ervoor, niet erna. / Je sprong over een getal heen. / Bij tellen komt daarna de 13, dat klopt. / Dat snap ik: een uur duurt lang. / De kleine wijzer is korter dan deze. | bij nog een keer spelen hoorde het kind steeds precies hetzelfde (2 of 3) |
| Alle uitleg bij de 2e keer (1 per soort denkfout) | blijft, en per soort 1 of 2 erbij, zoals: De kleine wijzer vertelt hoe laat het is. / De punt van de kleine wijzer wijst het uur aan. / Links en rechts zijn op de klok niet hetzelfde. / We letten nu alleen op de grote wijzer. / Erna betekent: verder, met de pijl mee. | variatie (2 of 3) |
| Alle "weer"-zinnen (1 per soort denkfout) | blijven, en erbij steeds: Weer …, zie ik. (en een 2e andere uitleg) | variatie (2 of 3) |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een antwoord dat niet goed is (klok lezen, zetten) | 3 per soort denkfout |
| Eerste zin bij de vragen van de uitleg | 2 of 3 per antwoord |
| Hint | 3 per soort bij klok lezen en zetten; 2 bij de vragen van de uitleg |
| Uitleg bij de 2e keer | 2 of 3 per soort |
| "Weer …" (2 keer dezelfde denkfout) en de andere uitleg | 2 of 3, en 2 |
| De vraag opnieuw na de hint | 4 bij een klok, 3 bij "naar welk getal", 2 bij de andere vragen |
| Samen voordoen bij een klok / bij een getal | 3 en 3 (2 bij de klok op 12 uur) |
| De kleine stap ("Tik nu zelf op het antwoord.") | 3 |
| Zetten, samen doen: waar het getal staat, en "tik er maar op" | 2 (+2 zonder getal) en 3 |
| Hulphandje bij zetten | 2 (na een aanmoediging uit het vaste rijtje) |
| Begin (met de vraag voor Ja of Nee) | 3 |
| De proef (begin, lukt, lukt nog niet), samen beginnen | 3 |
| Oefenblok begint, klokken komen terug, slot | 2, 3 en 3 |
| Reactie bij de klok na lof | 6 |
| Lof, korte bevestiging, eindzin, aanmoediging, zin als de denkfout niet duidelijk is | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling; niet veranderd) |

## De fouttabel is strenger gemaakt (zoals bij Tellen)

Het script `scripts/fouttabel-klok-gouden.ts` loopt nu ALLE varianten na, voor elke vraag en elk antwoord dat niet goed is, en bij zetten voor elk getal op de klok (ruim 18.800 zinnen):

- **Verklappen (15.17):** geen eerste zin, geen hint en geen "vraag opnieuw" noemt het antwoord. Zo vond het script "Hoe heet de grote wijzer?" (het antwoord stond in de vraag).
- **Ook "vlak naast" en "bijna" verklappen niets:** die woorden komen alleen als er dan nog 2 keuzes vlak naast liggen. Bij de 13 klokken is dat alleen zo bij klok 2 (12 uur, keuze 11 uur) en klok 4 (4 uur, keuze 5 uur). Anders zegt Bliepo alleen wat het kind koos.
- **"Links" en "rechts"** alleen als het klopt, en alleen als er aan die kant nog 2 keuzes staan.
- **Geen opdracht bij de 2e keer** (keuzevragen), nooit het woord "fout", nooit het woord "vinkje".
- **Een getal staat nooit 2 keer in 1 zin en klinkt nooit in 2 zinnen vlak achter elkaar.** Ook niet van de hint naar de vraag die erna komt.
- **Altijd een vraag of opdracht in beeld (15.37, F16):** elke vraag, elke "vraag opnieuw", elke hint bij zetten (daar is de hint de opdracht), het hulphandje en de kleine stap zijn zo nagelopen.
- **Past in het tekstvak:** de lengte van de langste oude stukken is een harde eis in de lijst zelf, niet een wens aan de kiezer. Bij elke eerste zin passen minstens 2 hints, zodat Bliepo kan blijven wisselen.
- **Nooit 2 keer hetzelfde:** de kiezer is 20.000 lessen nagespeeld (485.731 reacties) met willekeurige antwoorden: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer dezelfde zin 2 keer bij 1 vraag, en "weer" alleen als het klopt.

## Zinnen van Synthesis (Hour Hand Hunt), in het Nederlands (besluit Sara, 17 november 2026)

Het draaiboek klokkijken (SYNTHESIS-ANALYSE/DRAAIBOEKEN.md §1) beschrijft bij fouten vooral WAT Synthesis doet ("een korte zin die past bij wat het kind koos"), met weinig letterlijke zinnen. Wat er letterlijk stond, zat al in de les:

| Synthesis (vertaald uit het draaiboek) | Bij ons | Waar |
|---|---|---|
| bij goed: korte lof, soms met het antwoord erin | Precies, het is 3 uur. / Dat klopt, de kleine wijzer wijst naar de 3. (erbij) | reactie bij de klok na lof |
| bij de strikvraag: lof plus tóch de uitleg in 2 zinnen | Bij een heel uur wijst de grote wijzer recht omhoog. Deze wijst naar beneden. (stond er al) | "Is het nu 7 uur?" |
| "je was snel" / "Snel geantwoord" | Dat ging snel! / Wat was jij snel! (vast rijtje; stond er al) | heel snel antwoord |

Niet overgenomen: "probeer deze" met een extra klok na een fout (bij ons komen de gemiste klokken aan het eind terug; dat is de inhoud van Squla).

## Niet gedaan, met reden

- **De vragen zelf afwisselen** ("Hoe laat is het?", "Zet de kleine wijzer op de 2."): niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11). Alleen de vraag NA de hint wisselt.
- **De verhaalzinnen en weetjes** ("De bezorgbus staat klaar bij de bakkerij.", "De zon schijnt overdag."): niet veranderd; dat is de inhoud van Squla.
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet, aanmoediging) herschrijven:** niet gedaan. Die zijn van alle gouden lessen samen.
- **"Weet jij hoe dit heet?"** (de eerste vraag van de uitleg): gebleven. Het is een echte vraag met 2 antwoorden. Vraag aan Sara in KEUZES-KLOK.md.
- **Richting noemen** ("je zit er 1 naast", "1 verder"): niet gedaan, dan weet het kind het antwoord (15.17).
- **Zeggen wat het kind koos als de denkfout niet duidelijk is** ("Je koos 9 uur."): niet gedaan. Daar zegt Bliepo een zin uit het vaste rijtje van alle lessen; dat rijtje is niet van de Klok alleen.
- **De startvraag met Ja en Nee, de gloed om de wijzer en de oranje ring:** niet aangeraakt.
- **De oude les `squla-klok.tsx`:** niet aangeraakt.

## Herstel 19 november 2026 (keuring F16, 15.37: het begin)

Geen nieuwe woorden. De groet ("Hoi Testkind! Fijn dat je er bent.") en de startvraag waren 2 alinea's: soms stond de groet 3 seconden alleen wit in beeld, met Ja en Nee al tikbaar en de vraag nog gedimd. Nu zijn groet en startvraag 1 alinea: ze komen samen in beeld en Bliepo zegt ze in 1 keer.

## 19 november 2026: "nagekeken" is weg (en ALLE-VRAGEN DEEL A)

Opdracht van Sara: het woord "nagekeken" (en "nakijken") komt niet meer voor in wat Bliepo zegt of laat zien. Elke zin is vervangen door een andere zin die zegt dat het klopt ("Zie je, …", "Inderdaad, …"), op dezelfde plek in het rijtje (de robotplek blijft de robotplek, hooguit 1 keer per les; de grens "hooguit 2 keer per les" geldt nu voor deze zinnen: `WAS_NAKIJKEN` in squla-klok-gouden-zinnen.ts). Het gekozen antwoord staat er hooguit 1 keer in. Reden ook in WEGGEHAALD.md.

| Les | Soort | Oud | Nieuw |
|---|---|---|---|
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Nagekeken: helemaal goed! / Ik heb het nagekeken. Het klopt! | Inderdaad, zo moet het! / Zie je, jij snapt het! |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Even nakijken… ja, goed! | Even kijken… ja, goed! |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | De eerste is nagekeken: goed! | Inderdaad, jij begint sterk! |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Nagekeken: nu is het goed. | Inderdaad, nu is hij raak. |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Nagekeken: de kleine wijzer wijst naar de {${uur}:oranje}. Klopt! | Inderdaad, de klok zegt {${uur}:oranje} uur. |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Alles nagekeken. De les is klaar! | Alles is af. De les is klaar! |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Ik heb nagekeken en ik weet een hulpje. | Ik weet een hulpje voor jou. |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Ik sta klaar om na te kijken. / Als je kiest, kijk ik het meteen na. | Ik sta klaar voor jouw antwoord. / Als je kiest, zie ik meteen of het klopt. |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Die is nagekeken. Nu de volgende. | Die zit erop. Daar komt er nog een. |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Klaar met nakijken. Daar komt er weer een. | Die is af. Ik heb er nog een. |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | nagekeken weg | Nagekeken en bewaard. Door naar de volgende! | Dat was hem. Door naar de volgende! |
| squla-klok-hoelaat-1-gouden en de gedeelde rijtjes van ALLE gouden lessen | DEEL A | Weet jij hoe dit heet? | Hoe heet dit? |


## 19 november 2026: "Tik op de kaart." aan het eind (Ronde 51 punt 10, BOUWREGELS 15.50)

| Oud | Nieuw | Waarom |
|---|---|---|
| (eindzin uit het rijtje, zonder opdracht) | eindzin + "Tik op de kaart." / "Tik maar op de kaart." / "Kijk, een kaart voor jou! Tik erop." (`VAR.kaartTik`, dezelfde 3 als de andere gouden lessen); een afscheid ("Tot snel!") pas na de tik | terwijl de les op de tik wacht, moet de opdracht het laatste in beeld zijn (15.37); de eindzinnen zelf staan in WIJZIGINGEN-ZINNEN-RIJTJES.md |

~~De klok had geen eigen Synthesis-zinnen meer: wat er in "Zinnen van Synthesis" hierboven staat, stond er al of is gewoon Nederlands ("Precies", "Dat klopt", "Dat ging snel!").~~

**[ONJUIST, gecorrigeerd 20 november 2026 (keuring KEURING-KLOK-20NOV.md, fout 2):** de zin hierboven klopte niet. Die vergelijking keek alleen naar het Nederlandse draaiboek, niet naar de Engelse opname van Synthesis (`SYNTHESIS-ANALYSE/T1-de-urenwijzer.md`, `T2-hele-uren-zetten.md`). Daarin stonden nog 9 zinnen die vrijwel woordelijk vertaald waren. Die zijn nu eigen zinnen op dezelfde plek, met dezelfde functie (15.41); zie de tabel hieronder.**]**


## 20 november 2026: vertaalde Synthesis-zinnen vervangen door eigen zinnen (15.41, keuring KEURING-KLOK-20NOV.md fout 2)

Zelfde plek, zelfde functie; de vraag van het skelet blijft (bij stap 18 blijft "Is het nu 7 uur?" staan, alleen de zin ervoor is nieuw).

| Plek (`squla-klok-gouden-zinnen.ts`) | Synthesis (Engels) | Oud | Nieuw |
|---|---|---|---|
| `metDeKlokMee` | Going this direction around a clock is called clockwise. | Deze kant op heet: met de klok mee. | Zo draaien de wijzers rond. Dat heet: met de klok mee. |
| `samenBeginnen` (versie 1) | No problem. Let's go through it together. | Dat geeft niks. We gaan het samen bekijken. | Prima! Dan gaan we het samen leren. |
| `zetHand` (versie 1) | Tap the 5, or drag the orange hour hand there. | Tik op de {n}, of sleep de kleine wijzer erheen. | Sleep de kleine wijzer naar de {n}. Tikken mag ook. |
| stap 7 (hoogste punt), vraag | Take a look at the highest point of the clock. What number do you see? | Kijk naar het hoogste punt van de klok. Welk getal staat daar? | Kijk eens naar de bovenkant van de klok. Welk getal zie je daar? |
| stap 8 (laagste punt), vraag | Follow the clock all the way around. Which number sits at the very bottom? | Volg de klok helemaal rond. Welk getal staat onderaan? | Ga nu met je ogen naar de onderkant van de klok. Welk getal staat daar beneden? |
| stap 9 (na de 6), vraag | Now look at the 6. Which number comes right after it? | Kijk naar de 6. Welk getal komt erna? | Zoek de 6 op de klok. Welk getal is het volgende? |
| stap 10 (na de 12), vraag | Here's a tricky one. Which number comes right after the 12? | Nu een lastige. Welk getal komt na de 12? | Nu wordt het moeilijker. Wat komt er na de 12? |
| stap 12 (korte wijzer), vraag | And this orange short hand. What do we call it? | En deze korte oranje wijzer? Hoe heet die? | En nu de korte oranje wijzer. Wat is de naam van deze wijzer? |
| stap 18 (half 8), vraag | Here's a tricky one. Is this 7 o'clock? | Let op, deze is lastig. Is het nu 7 uur? | Kijk heel goed naar deze klok. Is het nu 7 uur? |

## 20 november 2026: na samen voordoen altijd een zin (15.39 punt 2, 15.49; keuring KEURING-KLOK-20NOV.md fout 1)

| Plek (`squla-klok-gouden.tsx`) | Oud | Nieuw |
|---|---|---|
| keuzevraag, na de kleine stap (samen voordoen) | groen scherm + geluid, 700 ms wachten, geen zin | groen scherm + geluid, dan direct een zin uit het rijtje BEVESTIG (bijvoorbeeld "Ja, nu is het goed."), dan door |
| "Zet de kleine wijzer op de …", na de kleine stap | groen scherm + geluid, 1100 ms wachten, geen zin | groen scherm + geluid, dan direct een zin uit BEVESTIG (zonder "Gevonden!": geen keuzeknop), dan door |

## 20 nov 2026: streepjes weg (besluit Sara)
Oud → nieuw: "vóór"→"voor", "ervóór"→"ervoor", "ná"→"na", "én"→"en" (overal in de zinnen van deze les).
