# WIJZIGINGEN-ZINNEN-VORMEN — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten en Getallenlijn, nu voor de gouden les Vormen (`squla-vormen-patronen-1-gouden`, "Patronen"). Deze les heeft geen extra les. Andere lessen zijn niet veranderd. De oude les (`squla-vormen.tsx`) is niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit e33fa58 en eerder). Geen andere les gebruikt dit zinnenbestand (alleen de les zelf en het fouttabel-script); een apart bewaarbestand was dus niet nodig.

**Niet veranderd:** de 15 vragen, de kralen, de dingen, de vormen, de keuzes, de puzzel, de volgorde en de goede antwoorden. De vraagzinnen zijn die van de oude les ("Welke kraal komt na de rode kraal?", "Welke kraal komt nu?", "Welke kraal hoort op de lege plek?", "Wat hoort bij de pijl?", "Welke vorm komt nu?"); alleen de 2e vraag van dezelfde soort direct erna krijgt "En … nu …" (zie Deel A). De lofzinnen, de eindzinnen, de groet en het rijtje "goed na een fout" komen uit het vaste rijtje van alle gouden lessen; die zijn niet aangeraakt.

**Alle varianten op een rij:** FOUTTABEL-squla-vormen-patronen-1-gouden.md (§4).

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos rood." en "Je koos blauw." tellen als dezelfde zin (de kleuren, de dingen en de vormen zijn wisselwoorden). Als het kan begint de volgende zin ook anders. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd).

Harde eisen zitten niet als wens in de kiezer, maar worden vooraf uit het rijtje gehaald: elk stuk past in het tekstvak (hooguit 125 tekens), en de hint noemt niet nog eens de kraal, het ding of de vorm die de eerste zin net noemde (zoals bij de andere lessen "geen getal 2 keer achter elkaar").

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les maak je patronen af. Een patroon komt steeds terug. | Vandaag maken we patronen af. Kijk: blauw, geel, blauw, geel. Dat komt steeds terug. / We gaan samen patronen afmaken. In een patroon komt steeds hetzelfde stukje terug. | warmer ("we"); en het stukje dat terugkomt staat echt in beeld (de blauw-gele ketting); "een patroon komt steeds terug" klopte niet helemaal: het stukje komt terug |
| Je koos de rode kraal. Aan het eind ligt al een rode kraal. | Je koos rood. Die kleur ligt al aan het eind. / Rood? Die kleur ligt al aan het eind van de ketting. / Je koos dezelfde kleur als de laatste kraal. | de kleur klonk 2 keer achter elkaar (15.29) |
| Je koos de oranje kraal. Aan het eind liggen al 2 oranje kralen. | Je koos oranje. Die kleur ligt al 2 keer aan het eind. / Oranje? Daarvan liggen er al 2 aan het eind. / Je koos dezelfde kleur als de laatste kralen. | idem |
| Je koos de blauwe kraal. Na rood komt nooit blauw. | Je koos blauw. Die kleur komt nooit na rood. / Blauw? Na rood komt in dit patroon iets anders. / Na rood komt in dit patroon nooit blauw. | idem; "Blauw?" is hoe een juf het zegt |
| Je koos de blauwe kraal. Links van de lege plek ligt al een blauwe kraal. | Je koos blauw. Die kleur ligt al links van de lege plek. / Blauw? Links van de lege plek ligt al dezelfde kleur. / Je koos dezelfde kleur als links van de lege plek. | idem (zo ook rechts, en bij de dingen: "Je koos het blok. Dat ligt al rechts van de pijl.") |
| Je koos de paarse cirkel. In dit patroon komt de cirkel na 2 oranje driehoeken. | Je koos de cirkel. Die komt pas na 2 oranje driehoeken. / De cirkel? Daarvoor komen eerst 2 oranje driehoeken. / In dit patroon komt de cirkel pas na 2 oranje driehoeken. | de cirkel klonk 2 keer; "pas na" zegt beter wat er mis is |
| Je koos de blauwe kraal. In dit patroon komt blauw na 2 rode kralen. | Je koos blauw. Die kleur komt pas na 2 rode kralen. / Blauw? Daarvoor komen eerst 2 rode kralen. / In dit patroon komt blauw pas na 2 rode kralen. | idem |
| Je sleepte eerst een groene kraal. De ketting eindigt al met een groene kraal. | Je sleepte eerst een groene kraal. Die kleur ligt al aan het eind. / Eerst groen? Die kleur ligt al aan het eind van de ketting. / Je begon met dezelfde kleur als de laatste kraal. | de kleur klonk 2 keer |
| Je sleepte eerst een gele kraal. Na rood komt nooit geel. | Je sleepte eerst een gele kraal. Die komt nooit na rood. / Eerst geel? Na rood komt in dit patroon iets anders. / Je begon met geel. Die kleur komt nooit na rood. | idem |
| De eerste kraal klopt. Daarna sleepte je een gele kraal. Na blauw komt nooit geel. | De eerste kraal klopt. Daarna sleepte je geel. Die kleur komt nooit na blauw. / De eerste kraal is goed. Maar geel komt nooit na blauw. / Goed begonnen! Maar na blauw komt in dit patroon iets anders. | idem, en korter |
| Zoek eerder in de ketting een rode kraal. Kijk wat daarna komt. (en dan wachten, bij "Welke kraal komt na …?") | Zoek eerder in de ketting een rode kraal. Kijk wat daarna komt. Tik dan op de kraal die past. (en varianten: "Kies dan de kraal die past.") | na deze hint stond er geen vraag of opdracht: de les wachtte op een tik (15.37, F16) |
| Kijk links van de lege plek. Zoek die kraal eerder. | Kijk links van de lege plek. Zoek die kraal eerder en kijk wat daarna komt. Tik dan op de kraal die past. | "zoek eerder" zei niet waarom; en nu staat er altijd wat het kind doet (F16) |
| (na een andere hint) Welke kraal hoort op de lege plek? (steeds dezelfde zin) | Welke kraal hoort op de lege plek? / Welke kraal past op de lege plek, denk je? / Tik op de kraal die op de lege plek hoort. (zo ook bij de pijl, de vormen en "nu") | de vraag in andere woorden, zoals Getallenlijn |
| Je koos weer iets dat niet na rood komt. Na rood komt in dit patroon steeds dezelfde kleur. | Je koos weer iets dat niet na rood komt. / Ook dat komt niet na rood. + Daarna komt in dit patroon steeds dezelfde kleur. / In een patroon komt steeds hetzelfde stukje terug. | rood klonk 2 keer achter elkaar |
| Je sleepte weer een kraal die niet na rood komt. Na rood komt in dit patroon steeds dezelfde kleur. | Je sleepte weer een kraal die niet na rood komt. / Ook die kraal komt niet na rood. + Daarna komt in dit patroon steeds dezelfde kleur. / In een patroon komt steeds hetzelfde stukje terug. | idem |
| Ketting, na de hint: alleen de hint ("Zoek in de ketting het stukje dat steeds terugkomt.") | de hint + Sleep de kralen dan opnieuw. / Sleep ze daarna nog een keer. / Leg ze dan opnieuw. Sleep maar! | de les wachtte op slepen, maar de zin zei niet wat het kind doet (F16) |
| Kijk naar de kleuren op het stukje. Zoek die kleuren in het patroon. (puzzel) | Kijk naar de kleuren op het stukje. Sleep het naar de plek waar die kleuren passen. | idem (F16) |
| Kijk naar de randjes van het stukje. Welke kleuren raken elkaar? (puzzel) | Kijk naar de randjes van het stukje. Sleep het naar een andere plek. / Elk stukje heeft een eigen plek. Sleep het naar een andere plek. | de vraag zei niet wat het kind doet (F16) |
| Maak de puzzel. (na het vangnet en na samen voordoen) | Maak de puzzel af. Sleep de stukjes naar het bord. / Sleep de stukjes naar het bord. | zei niet wat en waar (15.36, 15.37) |
| Tik jij op de rode kraal? (samen voordoen, net na "Hier komt dus een rode kraal.") | Tik jij erop? / Wil jij erop tikken? / Nu jij! Tik op de keuze in het rondje. | de kraal was net genoemd; het rondje laat zien welke |
| Kom, we maken de ketting samen. + Kom, we kijken samen. (vangnet bij de ketting) | Kom, we maken de ketting samen. (en dan meteen het stukje dat terugkomt) | 2 keer "samen" achter elkaar (15.29) |
| Kijk: rood, groen, blauw. Dat komt steeds terug. | blijft, en erbij: Dit stukje komt steeds terug: rood, groen, blauw. / Zie je het stukje? Rood, groen, blauw. Dat komt steeds weer terug. | variatie (3) |
| Vraag 5 na vraag 4: Welke kraal komt nu? (2 keer precies dezelfde vraag) | En welke kraal komt er nu? | niet 2 keer precies dezelfde zin; zo ook vraag 7 ("En welke kraal hoort nu op de lege plek?") en vraag 12 ("En wat hoort nu bij de pijl?") |
| Kijk naar de ketting. (vraag 1 t/m 5: 5 keer achter elkaar) | Kijk naar de ketting. / Kijk goed naar deze ketting. / Hier is een nieuwe ketting. (en bij de lege plek: "Er is een lege plek in de ketting." / "In deze ketting is een plek leeg." / "Kijk, er ontbreekt een kraal in de ketting."; bij de pijl: "Er is iets weg." / "Kijk, er is iets weg uit de rij." / "In deze rij ontbreekt iets.") | nooit 2 keer achter elkaar dezelfde zin |
| In de ketting komt de driehoek … (paar-uitleg alleen met namen: "De driehoek en de cirkel komen steeds 2 keer achter elkaar.") | blijft, en erbij: Hier komen de driehoek en de cirkel steeds 2 keer achter elkaar. / In deze rij komen sommige vormen 2 keer achter elkaar. / Sommige vormen komen steeds 2 keer achter elkaar. | na "Je koos de cirkel. Die komt pas na 2 oranje driehoeken." noemde de uitleg de vormen nog eens |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Kom, we kijken samen. / We zoeken het samen. / Kom, samen lukt het. | blijven, en erbij: Ik help je even. We kijken samen. / Geeft niks. We zoeken het samen. | variatie (5); "Ik help je even" is van Synthesis |
| Op de lege plek hoort dus een oranje kraal. (en "Hier komt dus …", "Bij de pijl hoort dus …") | blijft, en erbij: Dus op de lege plek hoort een oranje kraal. / Daarom hoort er een oranje kraal op de lege plek. | variatie (3) |
| Ja, de rode kraal past in het patroon. (samen klaar) | blijft, en erbij: Ja, zo klopt het patroon weer. / Precies, nu is het patroon weer heel. | variatie (3) |
| Kijk, de rode kraal past in het patroon. (vangnet) | blijft, en erbij: Kijk, zo klopt het patroon weer. | variatie (2) |
| Na groen komen paars en geel. | blijft, en erbij: Ik leg paars en geel erbij. Die komen na groen. / Kijk, na groen komt eerst paars en dan geel. | variatie (3) |
| Sleep jij de laatste kraal? | blijft, en erbij: Nu jij! Sleep de laatste kraal naar de lege plek. / Sleep jij de laatste kraal erbij? | variatie (3) |
| Ja, de ketting is af. / Kijk, zo is de ketting af. | blijven, en erbij: Ja, nu klopt de ketting. / Precies, zo is de ketting af. / Ik leg de laatste kraal erbij. Nu is de ketting af. | variatie |
| Maak de ketting langer. Kijk goed naar het patroon. | blijft, en erbij: We maken de ketting langer. Kijk eerst goed naar het patroon. / Deze ketting is nog niet af. Kijk goed naar de kralen. | variatie (3); vraag 8, 9 en 10 komen direct na elkaar |
| Sleep de kralen naar de lege plekken. | blijft, en erbij: Sleep de losse kralen naar de lege plekken. / Sleep elke kraal naar een lege plek. Let op de volgorde. | idem |
| Sleep een kraal naar een lege plek. / Sleep een stukje naar het bord. / Tik op de keuze in het rondje. / Sleep de kraal naar de lege plek. (hulphandje) | blijven, en bij elk 2 erbij (bijvoorbeeld: Sleep maar een kraal naar een lege plek. / Hier is een lege plek. Sleep er een kraal heen.) | variatie (3) |
| Je bent goed bezig. / Jij kunt dit. (hulphandje) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (5), zoals de andere lessen |
| Nu een puzzel. Kijk goed naar het patroon. | blijft, en erbij: Tot slot een puzzel. Kijk eerst goed naar het plaatje. | variatie |
| Maak de puzzel. Sleep elk stukje naar zijn plek. | blijft, en erbij: Sleep elk stukje naar zijn plek op het bord. | variatie |
| Dat stukje past daar niet. / Daar hoort dat stukje niet. | blijven, en erbij: Op die plek past het stukje niet. | variatie (3) |
| Een stukje klikt alleen vast op zijn eigen plek. | blijft, en erbij: Elk stukje hoort op een vaste plek in het plaatje. | variatie |
| Kijk, hier hoort dit stukje. / Dit stukje hoort in het rondje. (was 2 keer in de code) | in 1 rijtje, en erbij: Kijk, dit stukje past in het rondje. | nu niet meer 2 keer achter elkaar dezelfde zin bij samen voordoen en daarna |
| Kijk, dit stukje leg ik voor je. / Kijk, ik maak de puzzel af. | blijven, en erbij: Ik help je even. Dit stukje leg ik erin. / Kom, ik leg de andere stukjes erbij. | variatie |
| Ja, dat stukje zit vast. / Kijk, daar hoort het. | blijven, en erbij: Ja, dat past precies. / Precies, dat stukje zit op zijn plek. / Kijk, ik leg het op zijn plek. | variatie |
| Kom, we maken de ketting samen. | blijft, en erbij: Ik help je even. We maken de ketting samen. / Geeft niks. We maken de ketting samen. | variatie (3) |
| Zoek het stukje dat steeds terugkomt. (hint) | blijft, en erbij: Begin vooraan in de ketting. Zoek waar hetzelfde stukje weer begint. / Een patroon is een stukje dat steeds terugkomt. Zoek dat stukje in de ketting. | variatie (3) |
| Kijk hoe vaak elke kleur achter elkaar komt. | blijft, en erbij: Tel hoe vaak elke kleur achter elkaar komt. | variatie |
| Een patroon gaat steeds in dezelfde volgorde. / In een patroon komt steeds hetzelfde stukje terug. (uitleg) | blijven, en erbij: In een patroon blijft de volgorde steeds hetzelfde. | variatie (3) |
| Het patroon loopt ook door op de lege plek. / Ook op de lege plek gaat het patroon gewoon verder. | blijven, en erbij: De lege plek hoort ook bij het patroon. | variatie (3) |
| In deze ketting komt elke kleur 2 keer achter elkaar. | blijft, en erbij: Hier komt elke kleur steeds 2 keer achter elkaar. | variatie |
| Je koos weer hetzelfde als aan het eind. / … als ernaast. | blijven, en erbij: Weer dezelfde kleur als aan het eind, zie ik. / Weer hetzelfde als ernaast, zie ik. | variatie |
| Na rood komt in dit patroon steeds iets anders. | blijft, en erbij: Daarna komt in dit patroon nooit weer rood. (bij de lege plek: Ernaast komt in dit patroon steeds een andere kleur.) | variatie |
| Aan het eind ligt nog maar 1 driehoek. | blijft, en erbij: Aan het eind ligt de oranje driehoek nog alleen. | variatie |
| Je koos weer de rode kraal. / Je sleepte weer eerst een gele kraal. | blijven, en erbij: Weer rood, zie ik. / Je tikte weer op de rode kraal. / Weer eerst geel, zie ik. / Weer geel na blauw, zie ik. | variatie |
| Reactie na lof: 5 zinnen per soort | blijven, en per soort 2 erbij: "Precies, zo loopt het patroon door." / "Dat klopt: de rode kraal hoort hier." (ketting: "Precies, zo gaat de ketting verder." / "Dat klopt: elke kraal ligt op zijn plek."; puzzel: "Precies, het plaatje is heel." / "Dat klopt: alles zit op zijn plek.") | variatie (7); "Precies" is van Synthesis |
| Nu kun je een patroon afmaken. | blijft, en erbij: Jij kunt nu zelf een patroon afmaken. / Nu weet je welk stukje steeds terugkomt. | variatie (3) |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie (3), zoals de andere lessen |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een keuze die niet goed is | 3 per soort |
| Hint | 3 tot 7 per soort (alleen de hints die echt kloppen bij die vraag) |
| Na de hint: de vraag in andere woorden / kort wat het kind doet | 3 / 2 |
| Ketting: na de hint wat het kind doet | 3 |
| Uitleg bij de 2e keer | 2 tot 4 |
| "Weer …" (2 keer dezelfde denkfout) | 2, met 2 soorten uitleg erachter |
| "Je koos weer …" | 3 (ketting: 2) |
| Wat je ziet vóór de vraag | 2 of 3 |
| Samen voordoen: begin, het stukje, de goede keuze, de kleine stap, klaar | 2 tot 5 elk |
| Hulphandje: aanmoediging / wat te doen | 5 / 3 |
| Zin na lof | 7 |
| Begin, slot, kaart | 2, 3, 3 |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) |

## De fouttabel is strenger gemaakt (zoals bij Tellen en Getallenlijn)

Het fouttabel-script (`scripts/fouttabel-vormen-gouden.ts`) loopt nu ALLE varianten na, niet alleen 1 vaste zin per rij (ruim 1.000 varianten, 659 beweringen, 515 combinaties van eerste zin + hint):

- **Elke zin van elke variant moet het script kennen** en moet waar zijn in het beeld van die vraag (wat er aan het eind ligt, wat er naast de lege plek ligt, wat er in het patroon na wat komt). Een zin die het script niet kent, telt als fout. Een hint die zegt "zoek eerder in de ketting" mag alleen als dat er eerder echt ligt.
- **Verklappen (15.17):** geen eerste zin en geen hint noemt het goede antwoord; er blijven altijd minstens 2 keuzes over.
- **Niets dubbel (15.29):** geen getal en geen kraal, ding of vorm 2 keer in 1 stuk; de hint noemt niet nog eens wat de eerste zin net noemde, en de uitleg ook niet; 2 varianten van 1 rijtje zijn nooit dezelfde zin; achter elke eerste zin passen minstens 2 hints en 2 uitleggen (anders hoort het kind toch 2 keer dezelfde).
- **Altijd een vraag of opdracht (15.37, F16):** na elke hint staat een vraag of "Tik …"/"Sleep …", en er passen er minstens 2 in het tekstvak. Elke opdrachtzin zegt wat het kind doet.
- **Geen opdracht bij de 2e keer**, nooit het woord "fout", nooit het woord "vinkje" (dan laat het lesscherm de hele zin weg).
- **Alles past in het tekstvak:** elk stuk hooguit 125 tekens (ook de begin-zin met de groet, en het hulphandje met de aanmoediging).
- **Nooit 2 keer hetzelfde:** de kiezer wordt 20.000 keer nagespeeld (bijna 30.000 reacties) met willekeurige vragen en keuzes, met dezelfde functie als de les gebruikt (`foutReactie`): 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een zin, kraal of getal 2 keer in 1 reactie, 0 keer bij de 2e keer een zin van de 1e keer, altijd een vraag of opdracht na de hint.
- **De vraagzinnen** zijn die van de oude les (of met "En … nu …"), en 2 vragen achter elkaar hebben nooit precies dezelfde vraagzin.

## Zinnen van Synthesis, in het Nederlands (besluit Sara, 17 november 2026)

Synthesis heeft geen les over vormen of patronen (KOPPELING.md §13). Alleen algemene zinnen zijn overgenomen, passend gemaakt voor groep 3:

| Synthesis zegt | Bij ons nu | Waar |
|---|---|---|
| ik help je met deze | Ik help je even. We kijken samen. / Ik help je even. We maken de ketting samen. / Ik help je even. Dit stukje leg ik erin. | 2e keer mis, vangnet |
| precies | Precies, zo loopt het patroon door. (en bij de ketting en de puzzel) | zin na lof, samen klaar |

## Niet gedaan, met reden

- **De vraagzinnen zelf afwisselen** ("Welke kraal komt nu?"): niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11) en de inhoud van de Squla-les blijft gelijk (15.22). Alleen de 2e vraag van dezelfde soort direct erna krijgt "En … nu …".
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) herschrijven:** niet gedaan. Die staan in BLIEPO-KARAKTER.md en worden door alle gouden lessen gebruikt (`squla-klok-gouden-zinnen.ts`, niet aangeraakt).
- **De paar-zin noemt de kleur van het goede antwoord** ("Blauw? Daarvoor komen eerst 2 rode kralen." bij vraag 4, waar rood goed is): niet veranderd. Zo deed de les het al (de keuring vond het goed); er blijven 2 keuzes over. Zie KEUZES-VORMEN.md.
- **Een aanmoediging met de naam van het kind bij een keuze die niet goed is:** niet gedaan (BOUWREGELS 3.17).
- **De oude les `squla-vormen.tsx` en de andere vormen-lessen:** niet aangeraakt (harde regel 8 en de afspraak: alleen deze les).

## Herstel 19 november 2026 (keuring 15.36: geen los "En" aan het begin)

De 2e vraag van dezelfde soort direct erna kreeg "En … nu …". Een zin die met "En" begint klinkt raar als Bliepo er niets voor zei. Nu een gewone vraag die op zichzelf klopt; de schoolterm blijft (kraal, lege plek, pijl, vorm). De fouttabel-controle (`scripts/fouttabel-vormen-gouden.ts`) kent de nieuwe zinnen.

| Oud | Nieuw |
|---|---|
| En welke kraal komt er nu? | Welke kraal is de volgende? |
| En welke kraal hoort nu op de lege plek? | Welke kraal past op de lege plek? |
| En wat hoort nu bij de pijl? | Wat komt er bij de pijl? |
| En welke vorm komt er nu? | Welke vorm is de volgende? |
