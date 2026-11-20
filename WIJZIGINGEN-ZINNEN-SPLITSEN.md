# WIJZIGINGEN-ZINNEN-SPLITSEN — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Bij Tellen vond Sara dat goed gelukt; dit is **precies dezelfde aanpak voor Splitsen**: de gouden les (`squla-splits-splitsen1-1-gouden`) en de extra les (`squla-splits-splitsen1-1-gouden-extra`). Andere lessen zijn niet veranderd.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe, en met de reden in WEGGEHAALD.md. Geen andere les gebruikt deze 2 zinnenbestanden (nagekeken met een zoekopdracht; de Rekenmix-lessen hebben hun eigen splits-zinnen), dus er is geen apart bewaarbestand nodig. De oude versie staat in Git (de commit vóór deze). Terugzetten kan dus altijd.

**Niet veranderd:** de getallen, de antwoorden, de keuzes, de volgorde van de vragen en wat het kind moet doen. De vraag "Hoeveel pionnen zijn er samen?" en de opdracht "Er zijn 5 pionnen. Sleep 2 pionnen naar het paarse vak. De andere pionnen sleep je naar het oranje vak." zijn precies gelijk gebleven.

**Alle nieuwe varianten op een rij:** FOUTTABEL-squla-splits-splitsen1-1-gouden.md (§5) en FOUTTABEL-squla-splits-splitsen1-1-gouden-extra.md (§4).

## Hoe "nooit 2 keer hetzelfde" werkt

Voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer. Dat geldt ook over vragen heen. "Je legde er 6." en "Je legde er 8." tellen als dezelfde zin, net als "Pak een pion …" en "Pak een bal …". Als het kan begint de volgende zin ook anders. De kiezer is dezelfde als bij Tellen (`src/components/les/lessen/nooit-dubbel.ts`); dat bestand is niet veranderd.

## Deel A — gouden les Splitsen: verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| Hier zijn 7 pionnen. 3 gaan naar het paarse vak, de rest naar het oranje vak. | Kijk, 7 pionnen. Sleep er 3 naar het paarse vak, de rest naar het oranje vak. | 2 getallen stonden vlak na elkaar ("7 pionnen. 3 gaan") en de zin zei niet wat het kind moet doen; nu met "Sleep" |
| 6 pionnen deze keer. Sleep 4 pionnen naar het paarse vak en de rest naar het oranje vak. | Deze keer zijn er 6 pionnen. Sleep er 4 naar het paarse vak en de rest naar het oranje vak. | "6 pionnen deze keer." is geen hele zin; "pionnen" stond er 2 keer |
| Sleep in elk leeg vakje de ballen die nog missen. | Sleep in elk leeg vakje de ballen die nog ontbreken. | juf-Nederlands: "ontbreken" in plaats van "missen" (Sara) |
| Probeer het nog eens. Sleep in elk leeg vakje de ballen die nog missen. | Probeer het nog eens. Sleep in elk leeg vakje de ballen die nog ontbreken. | "ontbreken" in plaats van "missen" |
| De andere liggen onder de doek. Sleep die ballen naar het vak. | De andere liggen onder de doek. Sleep net zoveel ballen naar het vak. | de ballen onder de doek kun je niet slepen; het kind sleept er net zoveel uit het rijtje |
| Nu zie je er 9. Sleep de ballen onder de doek naar het vak. | Nu zie je er 9. De rest ligt onder de doek. Sleep net zoveel ballen naar het vak. | zelfde reden: de zin zegt nu wat het kind echt doet |
| Je ziet er 4. Hoeveel liggen er onder de doek? Sleep ze naar het vak. | Je ziet er 4. Hoeveel liggen er onder de doek? Sleep zoveel ballen naar het vak. | "ze" was onduidelijk (de ballen onder de doek kun je niet pakken) |
| Probeer het nog eens. Sleep de ballen die onder de doek liggen naar het vak. | Probeer het nog eens. Hoeveel liggen er onder de doek? Sleep zoveel ballen naar het vak. | zelfde reden; nu 2 korte zinnen |
| In deze les verdeel je pionnen en ballen over 2 vakken. | Vandaag verdelen we pionnen en ballen over 2 vakken. / We gaan pionnen en ballen verdelen over 2 vakken. | warmer, zoals een juf begint ("we") |
| Schuif de pionnen goed. In het paarse vak horen 2 pionnen. | In het paarse vak horen 2 pionnen. Schuif de pionnen maar naar het goede vak. | "Schuif ze goed" was vaag; nu eerst wat er hoort, dan wat je doet |
| Dat is nog lastig. We kijken eerst samen hoe splitsen werkt. | Dit is nog lastig. Geeft niks! We kijken eerst samen hoe splitsen gaat. | warmer; "hoe het gaat" is gewoner dan "hoe het werkt" |
| Geen probleem. We kijken eerst samen hoe splitsen werkt. | Dat geeft niet, we komen er wel. We kijken eerst samen hoe splitsen gaat. | warmer (de eerste zin is de tekst van Synthesis, in het Nederlands); "hoe het gaat" is gewoner dan "hoe het werkt" |
| Mooi, er ligt er 1. | Mooi, daar ligt 1 pion. | "er ligt er" klonk stroef |
| In het paarse vak hoort er maar 1. Tik op een pion in het paarse vak, dan gaat hij terug. | In het paarse vak hoort maar 1 pion. Tik op een pion in dat vak, dan gaat hij terug. | "het paarse vak" stond er 2 keer; korter |
| Je splitste 5 in 1 en 4. | Je hebt 5 gesplitst in 1 en 4. | natuurlijker Nederlands |
| Natuurlijk. (na het goede antwoord op "Hoeveel pionnen zijn er samen?") | Ja, dat klopt! | "Natuurlijk." klonk alsof de vraag te makkelijk was; nu gewone, warme lof |
| 1 en 4 is 1 manier om 5 te splitsen. Splits 5 nu zelf op een andere manier. | 5 kun je splitsen in 1 en 4. Dat kan ook anders! Zoek zelf een andere manier. | het getal 1 stond 2 keer vlak na elkaar en de 5 ook 2 keer; nu 3 korte zinnen |
| Klopt, maar zo had je hem al: 1 en 4. Probeer een andere manier. | Dat klopt, maar 1 en 4 hadden we al. Zoek een andere manier. | "zo had je hem al" is geen juf-Nederlands |
| Kijk, ik maak het af: 3 en 2. Dat is ook 5. | Kijk, ik maak het af: 3 en 2. Samen is dat ook 5. | de schoolterm "samen" erbij: duidelijker |
| Ja, je draaide de delen om: 4 en 1. Dat is ook 5. | Ja, je hebt de delen omgedraaid: 4 en 1. Samen is dat ook 5. | natuurlijker Nederlands; "samen" erbij |
| Samen splitsten we 9 in 6 en 3. | Samen hebben we 9 gesplitst in 6 en 3. / Samen is het gelukt: 9 is 6 en 3. / Kijk, 9 is 6 en 3. Dat hebben we samen gedaan. | natuurlijker Nederlands; nu 3 varianten |
| Samen: 10 is 7 en 3. | Samen hebben we het gevonden: 10 is 7 en 3. / Kijk, 10 is 7 en 3. Dat hebben we samen gedaan. | te kaal; nu een hele zin |
| In dit huisje: 6 is 4 en nog een deel. | In dit huisje staat 6 in het dak. In het vakje staat al 4. / Dit huisje heeft 6 in het dak en 4 in het vakje ernaast. / Nu dit huisje: 6 in het dak, en 4 staat er al. | "en nog een deel" was vaag; Bliepo zei deze zin 3 keer achter elkaar (3 huisjes), nu 3 varianten |
| Je splitste getallen tot 10. | Je hebt getallen gesplitst tot wel 10! / Wat heb jij goed gesplitst: getallen tot wel 10! / Knap, hoor! Je hebt getallen tot 10 gesplitst. | natuurlijker en vrolijker; 3 varianten |
| We doen het samen. | Weet je wat? We doen het samen. / Geeft niks. We doen het samen. / Ik help je even. We doen het samen. | te kaal; nu warmer (5 varianten met "Kom, we doen het samen." en "Kom, samen lukt het.") |
| Wijs de pionnen in het paarse vak 1 voor 1 aan. Het getal eronder zegt hoeveel erin horen. | Wijs de pionnen in het paarse vak stuk voor stuk aan. Het getal eronder zegt hoeveel erin horen. | het getal 1 stond 2 keer achter elkaar ("1 voor 1") |
| Weer liggen ze allemaal in het paarse vak. | Ze liggen weer allemaal in het paarse vak. / Weer alles in het paarse vak, zie ik. / Er ligt weer niets in het oranje vak. | omgekeerde zin; nu 3 varianten |
| Weer is het paarse vak leeg. | Het paarse vak is weer leeg. / Er ligt weer niets in het paarse vak. / Weer een leeg paars vak, zie ik. | omgekeerde zin; nu 3 varianten |
| In het paarse vak ligt 1 pion. Dat is er 1 te weinig. (alleen als er 1 pion ligt en er 2 horen) | In het paarse vak ligt 1 pion. Dat is te weinig. (3 varianten) | het getal 1 stond 2 keer achter elkaar |
| Weer liggen 5 pionnen in het paarse vak. / Weer te veel in het paarse vak. | Er liggen weer 5 pionnen in het paarse vak. / Weer 5 pionnen in het paarse vak, zie ik. / Je legde weer 5 pionnen in het paarse vak. ("Weer te veel in het paarse vak." blijft, met 2 varianten erbij) | omgekeerde zin ("Weer liggen …"); nu 3 varianten |
| 6 is dichtbij. | Je legde er 6. Je zit er dichtbij. / Je legde er 6. Dat scheelt niet veel. / Bijna! 6 is het net niet. / 6 ballen? Dat is heel dichtbij. / Je legde er 6. Het is bijna goed. | te kaal; nu zegt Bliepo eerst wat het kind legde (5 varianten) |
| In de doos passen er 10. Tel door vanaf 7 tot 10. | In de doos passen er 10. Tel door vanaf 7. | het getal 10 stond 2 keer achter elkaar |
| In de doos passen er 10. Onder de doek liggen de ballen die nog missen tot 10. | In de doos passen er 10. Onder de doek liggen de ballen die nog ontbreken. | het getal 10 stond 2 keer achter elkaar; "ontbreken" in plaats van "missen" |
| Een paar ballen zie je al. Sleep alleen de ballen die onder de doek liggen. | Een paar ballen zie je al. Wij zoeken alleen de ballen onder de doek. / Kijk naar de doos. Een paar ballen zie je al. Hoeveel liggen er onder de doek? | de ballen onder de doek kun je niet slepen; 2 varianten |
| In de doos passen er 10. 7 zie je al. Alleen de ballen onder de doek gaan naar het vak. | In de doos passen er 10. 7 zie je al. Het vak is alleen voor de ballen onder de doek. / De hele doos heeft 10 ballen. 7 zie je al. De rest ligt onder de doek. | duidelijker; 2 varianten |
| Weer de hele doos. | Dat is weer de hele doos. / Weer de hele doos, zie ik. / Je legde weer alle ballen in het vak. | te kaal; 3 varianten |
| 7 ballen zie je al. In het vak horen alleen de ballen die nog missen tot 10. | 7 ballen zie je al. In het vak horen alleen de ballen die nog ontbreken tot 10. / 7 ballen zie je al. Met de ballen onder de doek zijn het er samen 10. | "ontbreken" in plaats van "missen"; 2 varianten |
| Sleep de ballen die je niet ziet. Die liggen onder de doek. | Wij zoeken de ballen die je niet ziet. Die liggen onder de doek. / Kijk naar de doek. Daaronder liggen de ballen die we zoeken. | wat je niet ziet, kun je niet slepen; 2 varianten |
| Onder de doek liggen de ballen die nog missen tot 10. | Onder de doek liggen de ballen die nog ontbreken tot 10. / Met de ballen onder de doek zijn het er samen 10. | "ontbreken" in plaats van "missen"; 2 varianten |
| Weer te veel. | Het zijn er weer te veel. / Weer te veel, zie ik. / Je legde er weer te veel. | te kaal; 3 varianten |
| Je ziet er 7. Onder de doek liggen de ballen die nog missen tot 10. | Je ziet er 7. Onder de doek liggen de ballen die nog ontbreken tot 10. / Je ziet er 7. Met de ballen onder de doek zijn het er samen 10. | "ontbreken" in plaats van "missen"; 2 varianten |
| Doe het huisje voor huisje. Het getal ernaast en de ballen samen zijn het getal in het dak. | Doe het huisje voor huisje. Het getal ernaast en de ballen zijn samen het getal in het dak. | woordvolgorde ("zijn samen") |
| Bij het huisje met 6 is het lege vakje nog leeg. | In het huisje met 6 is het vakje nog leeg. / Het huisje met 6 heeft nog een leeg vakje. | "het lege vakje is nog leeg" zei 2 keer hetzelfde |
| Bij het huisje met 6 klopt het weer niet. Het getal ernaast en de ballen samen moeten 6 zijn. | Bij het huisje met 6 klopt het weer niet. Het getal ernaast en de ballen moeten samen het getal in het dak zijn. | het getal 6 stond 2 keer achter elkaar |
| Weer 1 van de delen. | Dat is weer 1 van de delen. / Je koos weer een deel. / Weer een deel, zie ik. | te kaal; 3 varianten |

## Deel A — extra les Splitsen: verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les werk je met een splitsmachine. | Vandaag werken we met een splitsmachine. / We gaan samen werken met een splitsmachine. | warmer, zoals een juf begint |
| Tik nu op de min bij dat deel. | Tik nu 1 keer op de min bij dat deel. | duidelijker: er hoeft maar 1 stip af (van 4 naar 3) |
| Je maakte van 4 een 3. | Je hebt van 4 een 3 gemaakt. | natuurlijker Nederlands |
| Kijk, bovenaan staat ook 3. Daar staat het totaal. | Kijk, bovenaan staat hetzelfde getal. Daar staat het totaal. | het getal 3 stond 2 keer achter elkaar |
| Wat staat er nu in het totaal? | Hoeveel stippen staan er nu in het totaal? | duidelijker: het kind telt stippen en kiest een getal |
| Je maakte 3 + 2 = 5. | Je hebt de som 3 + 2 = 5 gemaakt. | natuurlijker Nederlands |
| Ja, 3 + 2 = 5. Dus de som is 3 + 2 = 5. | Ja, 3 + 2 = 5. Dat is de som die je hebt gemaakt. | de som stond 2 keer achter elkaar |
| De cijfers naast elkaar worden 32. Maar je telt ze op: 3 + 2 = 5. | Je zette de cijfers naast elkaar: 32. Maar we tellen ze op: 3 + 2 = 5. | Bliepo zegt nu eerst wat het kind deed; warmer ("we") |
| 4 is dichtbij. Met 3 en dan nog 2 kom je op 5. | Je koos 4. Dat is dichtbij. 3 en dan nog 2 erbij is 5. | korter en met de schoolterm "erbij" |
| 3 en 2 is 1 manier om 5 te splitsen. | 5 kun je splitsen in 3 en 2. | "2 is 1 manier": 2 getallen vlak na elkaar |
| Kun jij het ook op een andere manier? Verander de stippen onder, zodat ze samen weer 5 zijn. | Kun jij het ook op een andere manier? Verander de stippen onder. Het totaal blijft hetzelfde. | te lange zin; de 5 stond er net al |
| Je draaide de delen om. Dat mag. | Je hebt de delen omgedraaid. Dat mag ook! | natuurlijker en vrolijker |
| Tel de stippen in de cirkel bovenaan, een voor een. | Tel de stippen in de cirkel bovenaan, stuk voor stuk. | cijferafspraak (3.20); "1 voor 1" zou het getal 2 keer zeggen |
| De stippen in de cirkel bovenaan tel je een voor een. | De stippen in de cirkel bovenaan tel je stuk voor stuk. | cijferafspraak (3.20) |
| Je splitste 7 in 3 en 4. | Je hebt 7 gesplitst in 3 en 4. / 3 en 4 zijn samen 7. / Dat klopt: 7 is 3 en 4. | natuurlijker Nederlands; Bliepo zei deze zin 2 keer achter elkaar, nu 3 varianten |
| Je draaide de delen om. Het zijn dezelfde getallen. Zoek een andere manier. | Je hebt de delen omgedraaid. Het zijn dezelfde getallen. Zoek een andere manier. / Dit zijn dezelfde getallen, alleen omgedraaid. Zoek een andere manier. | natuurlijker Nederlands; 2 varianten |
| Goede keuze. Splits 8 in 2 delen. (en meteen daarna nog eens: Splits 8 in 2 delen.) | Goede keuze! (daarna 1 keer: Splits 8 in 2 delen.) | Bliepo zei de opdracht 2 keer achter elkaar |
| Je splitste getallen op veel manieren. | Je hebt getallen op veel manieren gesplitst! / Wat heb jij veel manieren gevonden om te splitsen! / Knap, hoor! Je kunt getallen op veel manieren splitsen. | natuurlijker en vrolijker; 3 varianten |
| Dat werkt: 3 + 4 = 7. | Dat klopt: 3 + 4 = 7. | "Dat werkt" is letterlijk vertaald Engels |
| Je splitste 7 in 3 en 4. | Je hebt 7 gesplitst in 3 en 4. | natuurlijker Nederlands |
| Je koos 3. Dat is een van de delen. | Je koos 3. Dat is 1 van de delen. / 3? Dat is een deel, niet het totaal. / O, 3 is een deel. Ik zoek het totaal. / Je tikte op 3. Zoveel stippen heeft 1 deel. | cijferafspraak ("1 van de delen"); 4 varianten |
| Je koos weer een van de delen. | Je koos weer 1 van de delen. / Dat is weer een deel. / Weer een deel, zie ik. | cijferafspraak; 3 varianten |
| Die som heeft een 4. Zo'n deel staat niet in de machine. | In die som staat een 4. Dat deel staat niet in de machine. / Die som begint met 4. Zo'n deel staat niet in de machine. / Je koos de som met 4. Dat getal staat niet in de machine. | "een som heeft een 4" is geen juf-Nederlands; 3 varianten |
| Een van je delen is leeg. | 1 van je delen is nog leeg. | cijferafspraak (3.20) |
| Maak allebei de delen vol. Samen moeten het 7 stippen zijn. | Geef elk deel stippen. Samen moeten het 7 stippen zijn. | "vol maken" klopt niet: een deel hoeft niet vol |
| Weer heeft een cirkel onder geen stippen. | Er is weer een cirkel zonder stippen. | omgekeerde zin |
| Probeer een ander deel. | Geef een deel meer of minder stippen. (en erbij: Er moeten nog stippen bij. Tik op een plus. / Er moeten stippen af. Tik op een min. / We zoeken 7. Tik op een plus of een min.) | vage zin: zegt niet wat het kind kan doen |
| Het klopt weer niet. | Samen is het weer te weinig. (of: te veel) | klonk streng en zei niet wat er mis was |
| Dit klopt ook niet. | Het zijn er weer te weinig. (of: te veel) | klonk streng en zei niet wat er mis was |
| Weer past het niet. | Weer te weinig, zie ik. (of: te veel) | omgekeerde zin; zei niet wat er mis was |
| Het totaal is alles samen. Kijk naar de cirkel bovenaan. (de hint na de 1e keer) | Het totaal is alles samen. Hoeveel stippen staan er in de cirkel bovenaan? / Het totaal staat bovenaan. Hoeveel stippen tel je in de cirkel daar? | na de hint stond er geen vraag meer in beeld terwijl de les op het kind wachtte (regel 15.37); nu eindigt de hint met de vraag |
| Kijk naar de 2 delen onder in de machine. (de hint na de 1e keer) | Kijk naar de 2 delen onder in de machine. Welke som past daarbij? / Welke 2 delen staan er onder in de machine? Kies de som met die delen. | zelfde reden (15.37) |
| Het totaal staat achter het =. Kijk naar de 2 delen onder. (de hint na de 1e keer) | Het totaal staat achter het =. Welke som begint met de 2 delen? / Het totaal komt aan het eind van de som. Welke som heeft de 2 delen vooraan? | zelfde reden (15.37) |

## Deel B — gouden les: zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Kom, we doen het samen. / Kom, samen lukt het. (2) | blijven, en erbij: Weet je wat? We doen het samen. / Geeft niks. We doen het samen. / Ik help je even. We doen het samen. | variatie (nu 5) |
| Je bent goed bezig. / Jij kunt dit. / Geen haast, hoor. (3) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. | variatie (nu 5) |
| Pak een pion en sleep hem naar een vak. (alleen deze) | blijft, en erbij: Sleep een pion naar een vak. / Kies een pion en sleep hem naar een vak. | variatie |
| Pak een bal en sleep hem naar het vak. (alleen deze) | blijft, en erbij: Sleep een bal naar het vak. | variatie |
| Probeer het nog eens. / Nog 1 keer. / Kom, nog 1 keer. (3) | blijven, en erbij: Toe maar, nog 1 keer. | variatie (nu 4) |
| Ik leg er 6 in het paarse vak. (alleen deze) | blijft, en erbij: Eerst leg ik 6 pionnen in het paarse vak. | variatie |
| Sleep jij de andere pionnen naar het oranje vak. (alleen deze) | blijft, en erbij: De andere pionnen zijn voor jou. Sleep ze naar het oranje vak. | variatie |
| Sleep jij de laatste bal naar de zak. (alleen deze) | blijft, en erbij: De laatste bal is voor jou. Sleep hem naar de zak. | variatie |
| Kijk, ik leg de rest erbij. 9 is 6 en 3. (alleen deze) | blijft, en erbij: Kijk, de rest leg ik in het oranje vak. 9 is 6 en 3. | variatie |
| Ik leg ze bijna allemaal in het vak. Sleep jij de laatste erbij. (alleen deze) | blijft, en erbij: Ik leg ze alvast in het vak. De laatste bal is voor jou. Sleep hem erbij. Bij het hulphandje zegt Bliepo nu kort: Sleep de laatste bal naar het vak. | variatie; bij het handje kwam de hele lange zin nog een keer |
| Kijk, ik leg de laatste erbij. 10 is 7 en 3. (alleen deze) | blijft, en erbij: Kijk, de laatste bal leg ik in het vak. 10 is 7 en 3. | variatie |
| Sleep jij de laatste bal erbij. (alleen deze; ook bij het hulphandje) | blijft, en erbij: De laatste bal is voor jou. Sleep hem erbij. Bij het hulphandje: Sleep de laatste bal naar het lege vakje. | variatie; bij het handje niet 2 keer dezelfde zin |
| Samen hebben we elk huisje vol gemaakt. (alleen deze) | blijft, en erbij: Kijk, elk huisje is nu vol. Dat hebben we samen gedaan. | variatie |
| Kijk, ik leg de laatste bal erbij. Nu is elk huisje vol. (alleen deze) | blijft, en erbij: Kijk, de laatste bal leg ik erbij. Nu zijn alle huisjes vol. | variatie |
| Tik op de kaart. (alleen deze) | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie |
| Ja, 7 kun je splitsen in 4 en 3. / Ja, alle 7 zijn verdeeld. / 7 kun je splitsen in 4 en 3. / 4 en 3 maken samen 7. / Nagekeken: 4 en 3 maken samen 7. (5) | blijven, en erbij: Precies, 7 is 4 en 3. / Dat klopt: 4 en 3 is samen 7. / Je hebt 7 gesplitst in 4 en 3. | variatie (nu 8) |
| Ja, alle 3 huisjes kloppen. / In elk huisje klopt het. / Nagekeken: alle huisjes kloppen. (3) | blijven, en erbij: Alle 3 huisjes zijn goed gevuld. | variatie (nu 4) |
| Alle 7 pionnen liggen in het paarse vak. (alleen deze) | blijft, en erbij: Je legde alle 7 pionnen in het paarse vak. / Nu liggen alle 7 pionnen in het paarse vak. | variatie |
| Er komen 2 delen. Kijk naar het getal onder het paarse vak. De andere pionnen gaan naar het oranje vak. (alleen deze) | blijft, en erbij: We maken 2 delen. Het getal onder het paarse vak zegt hoeveel daar horen. De rest gaat naar het oranje vak. / Splitsen doe je in 2 delen. Kijk naar het getal onder het paarse vak. De rest gaat naar het oranje vak. | variatie |
| Splitsen is in 2 delen verdelen. In allebei de vakken komen pionnen. (alleen deze) | blijft, en erbij: Bij splitsen maak je 2 delen. Elk vak krijgt pionnen. | variatie |
| Begin bij het paarse vak. Kijk naar het getal eronder. (alleen deze) | blijft, en erbij: Het paarse vak krijgt ook pionnen. Kijk naar het getal eronder. / Kijk naar het getal onder het paarse vak. Zoveel pionnen horen daar. | variatie |
| In het paarse vak liggen 4 pionnen. (bij omgedraaid; alleen deze) | blijft, en erbij: Je legde 4 pionnen in het paarse vak. / Ik tel 4 pionnen in het paarse vak. | variatie |
| Kijk naar het getal onder het paarse vak. Zoveel pionnen horen erin. / Tel de pionnen in het paarse vak nog eens. Kijk dan naar het getal eronder. (per vraag 1 vaste) | blijven, en erbij: Onder het paarse vak staat een getal. Zoveel pionnen horen in dat vak. De les kiest nu zelf, steeds een andere. | variatie (nu 4) |
| Het getal onder het paarse vak zegt hoeveel pionnen erin horen: 3. (alleen deze) | blijft, en erbij: Onder het paarse vak staat 3. Zoveel pionnen horen erin. / In het paarse vak horen 3 pionnen. Dat zegt het getal eronder. | variatie |
| Weer te veel in het paarse vak. (alleen deze) | blijft, en erbij: Het zijn er weer te veel in het paarse vak. / Weer te veel, zie ik. | variatie |
| Er horen er precies 3 in. Dat is het getal eronder. (alleen deze) | blijft, en erbij: Onder het paarse vak staat 3. Precies zoveel horen erin. | variatie |
| Je legde er 10. Zoveel passen er in de hele doos. (alleen deze) | blijft, en erbij: 10 ballen? Zoveel passen er in de hele doos. / Je legde er 10. Dat is de hele doos vol. | variatie |
| Je legde er 7. Zoveel ballen zie je al in de doos. (alleen deze) | blijft, en erbij: 7 ballen? Zoveel zie je er al in de doos. / Je legde er 7. Dat zijn de ballen die je al ziet. | variatie |
| De ballen die je ziet, liggen al in de doos. Het vak is voor de ballen onder de doek. (alleen deze) | blijft, en erbij: Wat je ziet, ligt al in de doos. In het vak komen net zoveel ballen als onder de doek. | variatie |
| Weer net zoveel als je ziet. (alleen deze) | blijft, en erbij: Dat zijn weer de ballen die je al ziet. / Je legde er weer net zoveel als je ziet. | variatie |
| Tel de ballen die je ziet. Tel dan door tot 10. / Een volle doos heeft 2 rijen van 5. Hoeveel ballen zie je niet? (per vraag 1 vaste) | blijven, en erbij: Tel eerst de ballen die je ziet. Hoeveel komen er nog bij tot 10? | variatie |
| Een volle doos heeft 10 ballen. Onder de doek liggen de ballen die je niet ziet. (per vraag 1 vaste) | blijft, en erbij: De ballen die je ziet en de ballen onder de doek zijn samen 10. | variatie |
| Bij het huisje met 6: 4 en 3 is samen 7. We zoeken 6. (alleen deze) | blijft, en erbij: Even rekenen bij dit huisje: 4 en 3 is samen 7. We zoeken 6. / In dit huisje is 4 en 3 samen 7. In het dak staat 6. Het huisje krijgt nu ook bij de 2e keer een rondje. | variatie |
| De 3 hints bij de huisjes (per les 1 vaste, omdat er maar 1 vraag met huisjes is) | alle 3 blijven; de les kiest nu zelf | variatie |
| In elk huisje zijn het getal ernaast en de ballen samen het getal in het dak. (alleen deze) | blijft, en erbij: Het getal in het vakje en de ballen ernaast zijn samen het getal in het dak. | variatie |
| Bij het huisje met 6 klopt het weer niet. (alleen deze) | blijft, en erbij: Het huisje met 6 klopt weer niet. "Weer" zegt Bliepo nu alleen als het hetzelfde huisje is als de 1e keer. | variatie; "weer" klopte niet bij een ander huisje |
| 4 is het deel in het oranje vak. (alleen deze) | blijft, en erbij: Je koos 4. Dat is het deel in het oranje vak. / 4? Dat zijn alleen de pionnen in het oranje vak. | variatie |
| Ik bedoel alle pionnen samen. Tel de pionnen in allebei de vakken. (alleen deze) | blijft, en erbij: Tel alle pionnen: die in het paarse vak en die in het oranje vak. | variatie |
| Het totaal is alles samen: de pionnen in allebei de vakken. (alleen deze) | blijft, en erbij: Het totaal zijn alle pionnen: die in het paarse en die in het oranje vak. | variatie |
| Het totaal zijn de pionnen in allebei de vakken samen. (alleen deze) | blijft, en erbij: Bij het totaal horen de pionnen van allebei de vakken. | variatie |

## Deel B — extra les: zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Je bent goed bezig. / Jij kunt dit. (2) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (nu 5) |
| Het totaal is alles samen. Dat zijn de stippen in de cirkel bovenaan. (alleen deze) | blijft, en erbij: In de cirkel bovenaan staan alle stippen samen. Dat is het totaal. | variatie |
| De delen zijn 3 en 2. Die schrijf je als 3 + 2. (alleen deze) | blijft, en erbij: Onder in de machine staan 3 en 2. Die tel je op in de som. | variatie |
| In die som staat het totaal als deel. Een som gebruikt de 2 delen. (alleen deze) | blijft, en erbij: In die som telt het totaal mee als deel. We tellen alleen de 2 delen op. / Die som telt het totaal erbij op. In een som tel je de 2 delen op. | variatie |
| Je koos weer een som met getallen die er niet staan. (alleen deze) | blijft, en erbij: Weer een som met een getal dat er niet staat. / Die getallen staan weer niet in de machine. | variatie |
| Het totaal zit weer in de som als deel. (alleen deze) | blijft, en erbij: Weer telt het totaal mee als deel. / Je koos weer de som met het totaal erin. | variatie |
| Je koos 8. Dat is net iets te veel. (alleen deze) | blijft, en erbij: 8? Dat is net iets te veel. / Bijna! 8 is iets te veel. | variatie |
| Je telde weer te veel. (alleen deze) | blijft, en erbij: Het zijn er weer iets te veel. / Weer iets te veel, zie ik. | variatie |
| De hint en de uitleg bij "welk getal is het?" (elk 1) | blijven, en erbij: Tel de stippen bovenaan nog eens rustig. Wijs elke stip aan. / Elke stip in de cirkel bovenaan telt 1 keer mee. | variatie |
| Je liet een deel leeg. / Een cirkel onder heeft nog geen stippen. (per opdracht 1 vaste) | blijven; de les kiest nu zelf, steeds een andere | variatie |
| Verander een deel. Samen moet het 7 zijn. / Maak een deel groter of kleiner. (per opdracht 1 vaste) | blijven; de les kiest nu zelf, steeds een andere | variatie |
| Ik zet het linkerdeel op 3. Zoek jij het andere deel. (3 versies, per opdracht 1 vaste) | alle 3 blijven; de les kiest nu zelf | variatie |
| Dat is het: 7 is 3 en 4. (alleen deze) | blijft, en erbij: Gevonden: 7 is 3 en 4. / Samen is het gelukt: 7 is 3 en 4. | variatie |
| Kijk, ik zoek het andere deel. 7 is 3 en 4. (alleen deze) | blijft, en erbij: Kijk, ik maak het andere deel. 7 is 3 en 4. | variatie |
| Zo heb je 7 al gesplitst, in 3 en 4. Zoek een andere manier. (alleen deze) | blijft, en erbij: 3 en 4 hadden we al. Zoek een andere manier om 7 te splitsen. | variatie |
| Tik op de kaart. (alleen deze) | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie |
| De zin met de som na lof (5 zinnen; de les onthield de vorige alleen binnen 1 opdracht) | de gedeelde kiezer onthoudt de vorige zin nu over alle opdrachten heen | nooit 2 keer achter elkaar dezelfde zin |

## Aantal varianten per situatie

| Situatie | Gouden les | Extra les |
|---|---|---|
| Eerste zin na een poging die niet goed is | 3 of 4 per soort; 5 bij "dichtbij" (doos); 2 bij een leeg vakje (3 huisjes) | 3 per soort, 4 bij "dat is een deel" |
| Hint | 2 tot 4 | 2 of 3; 5 bij "de delen samen" |
| Uitleg bij de 2e keer | 2 of 3 | 2 of 3 |
| "Weer …" (2 keer dezelfde denkfout) | 3 (2 bij de 3 huisjes), met 2 soorten uitleg | 3 |
| Hetzelfde antwoord 2 keer ("Er liggen weer …", "Je legde er weer …", "Je koos weer …") | 3 | zelfde rijtje als "weer" |
| "Kom, we doen het samen." | 5 | — (de extra les heeft deze zin niet) |
| Samen voordoen: wat Bliepo doet en wat het kind doet | 2 elk (3 bij de 3 huisjes) | 3 ("Ik zet het linkerdeel op 3 …") |
| Klaar met samen voordoen | 3 (huisje), 2 (doos en 3 huisjes) | 3 |
| Bliepo doet het laatste zelf (vangnet) | 2 | 2 |
| Hulphandje: aanmoediging | 5 | 5 |
| Hulphandje: wat te doen | 3 (huisje), 2 (doos) | 3 (plus), 3 (plus of min) |
| Opnieuw proberen ("Probeer het nog eens.") | 4 | — |
| Zin met de 2 delen na lof | 8 (4 bij de 3 huisjes) | 5 (en 3 bij "zoek 2 delen") |
| "Al gevonden" en "omgedraaid" | — | 2 elk |
| Begin en slot | 2 en 3 | 2 en 3 |
| "Tik op de kaart." | 3 | 3 |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) | hetzelfde |

## De opdrachtzinnen zelf (regel 15.36)

Extra nagelopen: helder, kort, juf-Nederlands, en de zin zegt wat het kind echt doet.

- **Doos met de doek (vraag 11 t/m 15):** er stond "Sleep die ballen naar het vak." en "Sleep de ballen onder de doek naar het vak." Maar de ballen onder de doek kun je niet pakken: het kind sleept ballen uit het rijtje onderaan. Nu: "De andere liggen onder de doek. Sleep net zoveel ballen naar het vak."
- **3 huisjes (vraag 10):** "de ballen die nog missen" werd "de ballen die nog ontbreken".
- **Korte opdrachten (vraag 3 t/m 9):** "Hier zijn 7 pionnen. 3 gaan …" en "6 pionnen deze keer." werden gewone zinnen.
- **Extra les:** "Wat staat er nu in het totaal?" werd "Hoeveel stippen staan er nu in het totaal?"; "Tik nu op de min" werd "Tik nu 1 keer op de min"; na het kiezen van 8 of 10 zei Bliepo de opdracht 2 keer achter elkaar, nu 1 keer.
- Het fouttabel-script keurt nu ook de opdrachtzinnen: hooguit 14 woorden per zin, geen "missen", nooit "fout".

## Geen disco of feest

Nagekeken in beide lessen: komt nergens voor.

## Fouttabel: strenger gemaakt (zoals bij Tellen)

De 2 fouttabel-scripts keuren nu **alle varianten**, niet alleen 1 voorbeeld per antwoord:
- geen variant noemt het antwoord of verklapt het (15.17); bij "omgedraaid" en bij "1 ernaast" (doos) geen richting;
- elke bewering is waar ("te veel" alleen als het te veel is, enkelvoud en meervoud kloppen, het getal in de zin is wat het kind legde);
- geen getal 2 keer in 1 zin, nooit het woord "fout", geen opdracht in de zinnen bij de 2e keer;
- bij 1 vraag komt "dichtbij", "bijna" of "scheelt" hooguit 1 keer;
- genoeg varianten per situatie;
- de kiezer is 20.000 keer nagespeeld: 0 keer 2 keer achter elkaar dezelfde zin.

## Niet gedaan, met reden

- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) herschrijven:** niet gedaan. Die staan in BLIEPO-KARAKTER.md en worden door alle gouden lessen gebruikt. Ze wisselen al zonder herhaling.
- **"Er zijn 5 pionnen. Sleep 2 pionnen naar het paarse vak. …" afwisselen:** niet gedaan. De eerste opdrachten zijn de volledige opdracht van Squla; daarna wisselt de korte versie al (3 versies).
- **Bij "omgedraaid" zeggen dat de delen omgedraaid zijn:** niet gedaan. Dan weet het kind meteen het andere deel (15.17).
- **Bij de doos "1 te veel" of "1 te weinig" zeggen:** niet gedaan. Dat verklapt het antwoord. Bliepo zegt dan alleen dat het dichtbij is.
- **"1 voor 1" (cijferafspraak) in plaats van "een voor een":** niet gedaan, want dan staat het getal 1 twee keer achter elkaar. Het is "stuk voor stuk" geworden (zoals bij Tellen).
- **"De andere ballen gaan in de zak, in het oranje vak." korter maken:** niet gedaan. De zak staat in het oranje vak; de zin is op 10 november zo afgesproken (KEUZES Ronde 29).
- **Een naam bij een poging die niet goed is:** niet gedaan (BOUWREGELS 3.17).
- **Synthesis: "4 en 3 is samen geen 8; ik geef je nog een kans":** niet overgenomen als eerste zin. Bliepo zegt erbij of het te veel of te weinig is; dat helpt het kind meer, en "weer te weinig" klopt alleen als hij dat de 1e keer ook zei.
- **Synthesis: "laten we er dieper in duiken", "samenstellen" en "ontleden":** niet overgenomen (te moeilijk voor groep 3; stond al zo in het draaiboek).

## Zinnen van Synthesis (Part Part Whole), in het Nederlands (besluit Sara, 17 november 2026)

Alleen de tekst, passend gemaakt voor groep 3. Geen audio, beeld of code.

| Synthesis zegt (vertaald uit het draaiboek Splitsen) | Bij ons nu | Waar | Wat er stond |
|---|---|---|---|
| dat geeft niet, we komen er wel | Dat geeft niet, we komen er wel. We kijken eerst samen hoe splitsen gaat. | gouden: na "Nee" op de startvraag | VERVANGEN: "Geen probleem. We kijken eerst samen hoe splitsen werkt." |
| ah, je zette de cijfers naast elkaar; we moeten ze optellen | Je zette de cijfers naast elkaar: 32. Maar we tellen ze op: 3 + 2 = 5. | extra: tussenvraag "wat is 3 + 2?" | VERVANGEN: "De cijfers naast elkaar worden 32. Maar je telt ze op: 3 + 2 = 5." |
| 4? dat is dichtbij | Je koos 4. Dat is dichtbij. 3 en dan nog 2 erbij is 5. | extra: tussenvraag | VERVANGEN: "4 is dichtbij. Met 3 en dan nog 2 kom je op 5." |
| o, dat is één van de delen; ik zoek het totaal | O, 3 is een deel. Ik zoek het totaal. | extra: "hoeveel stippen staan er in het totaal?" | erbij (nu 4 varianten) |
| 8? dat is net iets te veel | 8? Dat is net iets te veel. | extra: "welk getal is het?" | erbij (nu 3 varianten) |
| perfect; je splitste 8 in 5 en 3 | Je hebt 7 gesplitst in 4 en 3. | gouden en extra: zin na lof | gouden: erbij; extra: was "Je splitste 7 in 4 en 3." |
| klopt, maar zo heb je hem al gesplitst | Dat klopt, maar 1 en 4 hadden we al. Zoek een andere manier. | gouden: uitleg "splits 5 anders" | VERVANGEN: "Klopt, maar zo had je hem al: 1 en 4. Probeer een andere manier." |
| 4 en 3 is samen 7; we zoeken 6 | Even rekenen bij dit huisje: 4 en 3 is samen 7. We zoeken 6. | gouden: 3 huisjes | erbij (nu 3 varianten) |

## Herstel 18 november 2026 (logica-controle: F16)

| Oud | Nieuw | Waarom |
|---|---|---|
| (extra, stap 12) Maak met de plus en de min 2 delen die samen 7 zijn. Tik dan op het vinkje. | Maak met de plus en de min 2 delen die samen 7 zijn. | een zin met "vinkje" laat het lesscherm helemaal weg, dus Bliepo zei deze opdracht nooit (15.37 punt 2); het vinkje legt het lesscherm zelf 1 keer uit |


## Herstel 19 november 2026 (keuring 15.36: Splitsen extra, kindertaal groep 3)

Getal, antwoord en betekenis zijn niet veranderd. De fouttabel (`npx tsx scripts/fouttabel-splitsen-extra-gouden.ts`) keurt alle varianten opnieuw: goed.

| Oud | Nieuw | Waarom |
|---|---|---|
| (extra, stap 10) Kun jij het ook op een andere manier? Verander de stippen onder. Het totaal blijft hetzelfde. | Kun jij het ook op een andere manier? Tik op de plus en de min bij de 2 delen onderaan. Het totaal blijft hetzelfde. | "Verander de stippen onder." was geen goede zin; nu zegt Bliepo wat het kind doet en waar (15.36, 15.37) |
| (extra, stap 9) Je hebt 2 delen en 1 totaal. | De 2 delen samen maken het totaal. | "1 totaal" is moeilijk voor groep 3 |
| (extra, stap 7) Tik op de plus bij het linkerdeel, tot er 4 stippen staan. | Tik op de plus bij het deel links, tot er 4 stippen in staan. | "linkerdeel" is moeilijk voor groep 3 |
| (extra, stap 7) Het rechterdeel is nog leeg. Zet er 2 stippen in met de plus. | Het andere deel, rechts, is nog leeg. Zet er met de plus 2 stippen in. | "rechterdeel" is moeilijk voor groep 3 |
| (extra, begin) Boven staat het totaal. Onder staan de 2 delen. | Bovenaan komt het totaal: alle stippen samen. Onderaan staan de 2 delen. | "totaal" uitgelegd met "samen"; "bovenaan/onderaan" in plaats van "boven/onder" |
| (extra, samen voordoen) Ik zet het linkerdeel op 3. Zoek jij het andere deel. / Het linkerdeel zet ik op 3. Jij zoekt het andere deel. / Kijk, links staat 3. Zoek jij het andere deel? | Ik zet 3 stippen in het deel links. Zoek jij het andere deel? / In het deel links zet ik 3 stippen. Maak jij het andere deel? / Kijk, links staan nu 3 stippen. Zoek jij het andere deel? | zonder "linkerdeel"; elke variant eindigt met een vraag; bij 1: "1 stip" |
| (extra, hint som) Kijk naar de 2 delen onder in de machine. Welke som past daarbij? / Welke 2 delen staan er onder in de machine? Kies de som met die delen. | Kijk naar de 2 delen onderaan. Welke som past daarbij? / Welke 2 delen staan er onderaan? Kies de som met die delen. | "onder in de machine" was onduidelijk |
| (extra, uitleg som) Onder in de machine staan 3 en 2. Die tel je op in de som. | Onderaan staan 3 en 2. Die tel je op in de som. | idem |
| (extra, een deel leeg) Een cirkel onder heeft nog geen stippen. | Een cirkel onderaan heeft nog geen stippen. | idem |

Gouden les Splitsen: de groet en de startvraag staan nu in 1 alinea (zelfde woorden, zie 15.37/F16 bij Getallenlijn en Klok); het dak van het huisje is hoger en het hoopje bij 6 tot 10 dingen iets kleiner, zodat de bovenste pionnen en ballen niet meer door de dakrand steken.

## 19 november 2026: "nagekeken" is weg

Opdracht van Sara: het woord "nagekeken" (en "nakijken") komt niet meer voor in wat Bliepo zegt of laat zien. Elke zin is vervangen door een andere zin die zegt dat het klopt ("Zie je, …", "Inderdaad, …"), op dezelfde plek in het rijtje (de robotplek blijft de robotplek, hooguit 1 keer per les; de grens "hooguit 2 keer per les" geldt nu voor deze zinnen: `WAS_NAKIJKEN` in squla-klok-gouden-zinnen.ts). Het gekozen antwoord staat er hooguit 1 keer in. Reden ook in WEGGEHAALD.md.

| Les | Soort | Oud | Nieuw |
|---|---|---|---|
| squla-splits-splitsen1-1-gouden | nagekeken weg | Nagekeken: ${g(a, KA)} en ${g(b, KB)} maken samen ${g(tot)}. | Zie je, ${g(tot)} is ${g(a, KA)} en nog ${g(b, KB)}. |
| squla-splits-splitsen1-1-gouden | nagekeken weg | Nagekeken: alle huisjes kloppen. | Zie je, alle huisjes zijn vol. |
| squla-splits-splitsen1-1-gouden-extra | nagekeken weg | Ik heb het nagekeken: ${som(a, b, t)}. | Inderdaad, zo kun je {${t}} splitsen. |

## 19 november 2026: "32" duidelijk als 1 getal apart (verzoek Sara; KEUZES-VOOR-SARA.md Ronde 52)

| Les | Waar | Oud | Nieuw | Waarom |
|---|---|---|---|---|
| squla-splits-splitsen1-1-gouden-extra | tussenvraag, keuze 32 | Je zette de cijfers naast elkaar: {32}. Maar we tellen ze op: {3} + {2} = {5}. | Je zette de cijfers naast elkaar. Dan lees je {32:wit}. Maar we tellen ze op: {3} + {2} = {5}. | 32 staat in een eigen zin en is wit (verwijst nergens naar, 2.1); de 3 en de 2 houden de kleur van hun deel. Zo leest een kind de losse 3 en 2 niet als 32. De keuzes 5, 4 en 32 bleven. |


## 19 november 2026: eigen zinnen in plaats van de vertaalde Synthesis-zinnen (besluit Sara, BOUWREGELS 15.41)

Sara besliste: in onze gouden lessen geen zinnen van Synthesis, ook niet vertaald. Elke nieuwe zin staat op dezelfde plek in de rij, doet hetzelfde en is ongeveer even lang. Getallen, antwoorden, keuzes en robotplekken zijn niet veranderd. Fouttabel-script opnieuw gedraaid. Oude zinnen: WEGGEHAALD.md. Bleef staan: "Je hebt 7 gesplitst in 4 en 3." (gewoon de som in woorden, geen herkenbare kopie).

| Les | Waar | Oud (vertaald uit Synthesis) | Nieuw (eigen zin) |
|---|---|---|---|
| gouden | na "Nee" op de startvraag | Dat geeft niet, we komen er wel. We kijken eerst samen hoe splitsen gaat. | Geeft niks, dat leer je nu. We kijken eerst samen hoe splitsen gaat. |
| gouden | uitleg "splits 5 anders" | Dat klopt, maar 1 en 4 hadden we al. Zoek een andere manier. | Die klopt, maar 1 en 4 vond je al. Zoek een andere manier. |
| gouden | 3 huisjes, eerste zin (variant 2) | Even rekenen bij dit huisje: 4 en 3 is samen 7. We zoeken 6. | Tel dit huisje na: 4 en 3 maakt 7, niet 6. |
| extra | tussenvraag, 32 | Je zette de cijfers naast elkaar. Dan lees je 32. Maar we tellen ze op: 3 + 2 = 5. | Je plakte de cijfers aan elkaar. Dan lees je 32. Maar we tellen ze op: 3 + 2 = 5. (32 blijft apart en wit, Ronde 52) |
| extra | tussenvraag, 4 | Je koos 4. Dat is dichtbij. 3 en dan nog 2 erbij is 5. | Je koos 4. Dat scheelt maar weinig. 3 en dan nog 2 erbij is 5. |
| extra | hoeveel in het totaal? (variant 3) | O, 3 is een deel. Ik zoek het totaal. | Met 3 heb je maar 1 deel. Het totaal is alles samen. |
| extra | nieuw totaal van 7 (variant 2) | 8? Dat is net iets te veel. | 8 stippen is net iets te veel. |

## 20 november 2026: herstel keuring Splitsen extra (kleur van de getallen)

Geen woorden veranderd. In Bliepo's tekst waren de getallen wit, terwijl ze bij gekleurde stippen horen (2.1, KEUZES Ronde 52). Nu staat er `{3:tegel}` in plaats van `{3}`: het getal krijgt de kleur van zijn stippen (3 geel, 2 oranje, 5 groen, ...). Getallen die nergens bij horen (een foute keuze, "32", "1 keer") blijven wit.
