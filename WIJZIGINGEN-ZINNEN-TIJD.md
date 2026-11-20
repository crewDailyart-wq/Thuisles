# WIJZIGINGEN-ZINNEN-TIJD — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten, Getallenlijn, Geld en Klok, nu voor de gouden les Tijd (`squla-tijd-dagen-1-gouden`, "Dagen van de week"). Tijd heeft geen extra les. De oude les (`squla-tijd.tsx`) is niet aangeraakt. De gouden les Dagen (`squla-dagen-gouden`, ook met de weektrein) is een andere les en is hier niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit 55687f0 en eerder). Geen andere les gebruikt het zinnenbestand van Tijd (nagekeken: alleen `squla-tijd-gouden.tsx` en het fouttabel-script lezen `squla-tijd-gouden-zinnen.ts`). De vaste rijtjes van alle gouden lessen (lof, "nu is het goed", eindzinnen, groet, overgang, in `squla-klok-gouden-zinnen.ts`) zijn niet aangeraakt.

**Niet veranderd:** de 12 vragen en de 3 die terugkomen, de weektrein, de dagkaarten, de getallen, de goede antwoorden, de volgorde, en de vragen zelf ("Wat is de eerste dag van de week?", "In het weekend ga je niet naar school. Hoeveel dagen heeft het weekend?", "Welke dag komt meteen na maandag?", "Hoeveel dagen heeft een week?"). Die zijn kort en helder, en dezelfde soort vraag houdt dezelfde woorden (BOUWREGELS 3.11).

**Alle varianten op een rij:** FOUTTABEL-squla-tijd-dagen-1-gouden.md, §2 tot en met §6.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos zondag." en "Je koos dinsdag." tellen als dezelfde zin. Een getal of een dagnaam klinkt nooit 2 keer vlak achter elkaar. Bij een ander antwoord de 2e keer begint de eerste zin ook anders dan de 1e keer. Komt een vraag aan het eind terug, dan krijgt het kind een andere hint dan de eerste keer. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd).

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| Je koos zondag en maandag. Op maandag ga je naar school. | Je koos zondag en maandag. Daar zit een schooldag bij. / Zondag en maandag? Op een van die dagen is er school. / Je tikte op zondag en maandag. Niet allebei die dagen zijn vrij. | de dag klonk 2 keer achter elkaar |
| Tik jij op de kaart van dinsdag? (samen voordoen) | Tik jij op de kaart in het rondje? / Nu jij! Tik op de kaart in het rondje. | de dag klonk net ("Erachter hangt dinsdag."); nu zegt de zin ook waar (15.37) |
| Tik jij op de 2? (samen voordoen, getal) | Tik jij op het getal? / Nu jij! Tik op het getal. / Tik jij het getal nu aan? | het getal klonk net ("Dat zijn 2 dagen zonder school."); er staat dan nog maar 1 knop |
| Dat zijn 7 wagons: 7 dagen. | Elke wagon is een dag. Samen zijn het 7 wagons. / Dat zijn 7 wagons. Elke wagon is een dag. / We kwamen langs 7 wagons. Bij elke wagon hoort een dag. | het getal stond 2 keer in 1 zin |
| We lopen langs de wagons, vanaf maandag. (en dan: Maandag.) | We lopen samen langs de wagons. / We lezen samen de bordjes, van voor naar achter. / Kom, we gaan de trein langs. Ik begin vooraan. | maandag klonk 2 keer achter elkaar |
| Hier is zondag in de weektrein. Zondag is de laatste wagon. Daarna begint de week weer met maandag. | Hier is zondag in de weektrein. Daarna begint de week weer vooraan, met maandag. (en 2 varianten) | zondag klonk 2 keer achter elkaar; het rondje staat dan om maandag, dus de zin praat over maandag |
| Na het weekend begint een nieuwe week. Wat is de eerste dag van de week? (hint) | Na het weekend begint een nieuwe week. Wat is de eerste dag van de week, denk je? (of een andere versie van de vraag) | de vraag na de hint is nooit precies dezelfde zin als de 1e keer |
| Na de laatste dag begint een nieuwe week. Wat is de laatste dag van de week? | Na de laatste dag begint een nieuwe week. Kies nog een keer. Wat is de laatste dag van de week? (of een andere versie) | idem |
| Het weekend zijn de vrije dagen. Hoeveel dagen heeft het weekend? / Denk aan de dagen waarop je vrij bent. Hoeveel dagen heeft het weekend? | Het weekend zijn de vrije dagen. Hoeveel vrije dagen heeft het weekend? (of een andere versie); erbij: Denk aan de dagen na vrijdag. | idem |
| Het weekend komt aan het eind van de week. Op welke dagen is het weekend? | Het weekend komt aan het eind van de week. Welke kaart heeft alleen vrije dagen? (of een andere versie) | idem |
| Denk aan alle dagen, van maandag tot en met zondag. Hoeveel dagen heeft een week? | Denk aan alle dagen, van maandag tot en met zondag. Hoeveel dagen zijn het samen? (of een andere versie) | idem |
| Na de laatste dag begint de week opnieuw. Welke dag komt meteen na zondag? | Na de laatste dag begint de week opnieuw. Welke dag hoort meteen achter zondag? (of een andere versie) | idem |
| Zeg de dagen van de week op, vanaf maandag. Welke dag zeg je na donderdag? | Zeg de dagen op, vanaf het begin van de week. Welke dag komt meteen na donderdag, denk je? (of een andere versie) | de dag van de vraag klonk vlak na de eerste zin nog een keer ("Je koos woensdag. Die komt vóór donderdag.") |
| Begin bij maandag en zeg de dagen op. Welke dag zeg je daarna? (alleen bij "meteen na maandag") | Zeg de dagen op, vanaf maandag. Welke dag zeg je daarna? (dezelfde vorm als bij de andere dagen) | 1 vorm voor elke dag |
| 2e keer mis, een ander antwoord: de eerste zin begon altijd met "Nu koos je …" | de les kiest nu altijd een andere eerste zin, met een ander begin dan de 1e keer; "Nu koos je …" is 1 van de versies | nooit 2 keer hetzelfde |
| De hint hing vast aan het nummer van de vraag (bij vraag 1 altijd dezelfde, bij de terugkomende vraag de andere) | de les kiest steeds een andere hint; bij een vraag die terugkomt nooit dezelfde hint als de eerste keer | idem |
| Na "Al 3 goed achter elkaar!" kon een reactie met hetzelfde getal komen | de les kiest dan een reactie zonder dat getal | het getal klonk 2 keer achter elkaar |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| In deze les leer je hoe een week in elkaar zit. Elke dag is een wagon van de weektrein. | blijft, en erbij: Vandaag leren we hoe de week loopt. Elke dag is een wagon van de weektrein. / Kijk, de weektrein! Elke wagon is een dag. Samen zijn ze een week. | warmer begin ("we"), zoals de andere lessen; geen versie is langer |
| Zeg de dagen van de week op. Welke dag zeg je als eerste? (en: als laatste?) | blijft (de eigen vraag aan het eind is genoeg; er komt niets meer achter), en erbij: Denk aan de dag waarop de schoolweek begint. / Denk aan het eind van de week. | variatie (3) |
| Zeg de dagen op, vanaf donderdag. Welke dag zeg je daarna? | blijft, en erbij: Het gaat om de dag die erachter komt. / Zeg de dagen op, vanaf het begin van de week. / De dag erna hoort op de lege plek. | variatie (4); de hints zonder dagnaam passen ook als de eerste zin de dag al noemde |
| Na zondag begint een nieuwe week. Welke dag komt dan? | blijft, en erbij: Na de laatste dag begint de week opnieuw. / Zeg de dagen op tot het eind. Dan begint de week weer. | variatie (3) |
| In het weekend ben je vrij. Welke kaart heeft 2 vrije dagen? | blijft, en erbij: Het weekend komt aan het eind van de week. / Het weekend zijn de dagen zonder school. | variatie (3) |
| Zeg de dagen op van maandag tot en met zondag. Hoeveel dagen zijn het? | blijft, en erbij: Elke dag van de week heeft een eigen wagon. | variatie (3) |
| De vraag na de hint | 3 versies per vraag, zoals: Wat is de eerste dag van de week, denk je? / Kies nog een keer. Wat is de eerste dag van de week? / Welke dag komt als eerste in de week? | de vraag komt terug (15.37), maar nooit precies dezelfde zin |
| Je koos zondag. Dat is de laatste dag van de week. | blijft, en erbij: Zondag? Die dag komt helemaal aan het eind. / Je tikte op zondag. Die hangt achteraan, niet vooraan. | variatie (3) |
| Je koos woensdag. Dat is niet de eerste dag. | blijft, en erbij: Woensdag? Daarvóór komen nog andere dagen. / Je tikte op woensdag. Die dag komt later in de week. | variatie (3) |
| Je koos zaterdag. Die hoort bij het weekend, maar is niet de laatste dag. | blijft, en erbij: Zaterdag? Die is weekend, maar niet de laatste dag. / Je tikte op zaterdag. Dat is een weekenddag, maar niet de laatste. | variatie (3); nooit "daarna komt nog een dag" (dan is het antwoord gezegd) |
| Je koos dinsdag. Dat is niet de laatste dag. | blijft, en erbij: Dinsdag? Daarna komen nog meer dagen. / Je tikte op dinsdag. Die dag hangt niet achteraan. | variatie (3) |
| Je koos 5. Op zoveel dagen ga je naar school. | blijft, en erbij: Je tikte op 5. Zoveel schooldagen zijn er. / Met 5 tel je de schooldagen. | variatie (3); geen zin begint met een cijfer |
| Je koos 1. Het weekend is langer dan dat. | blijft, en erbij: Je tikte op 1. Het weekend duurt langer. / Met 1 dag ben je er nog niet. | variatie (3) |
| Je koos donderdag en vrijdag. Dat zijn schooldagen. | blijft, en erbij: Donderdag en vrijdag? Op die dagen ga je naar school. / Je tikte op donderdag en vrijdag. Dan is er nog school. | variatie (3) |
| Je koos woensdag. Die komt vóór donderdag. | blijft, en erbij: Woensdag? Die dag hangt vóór donderdag. / Je tikte op woensdag. Die dag komt ervóór, niet erna. | variatie (3) |
| Je koos zaterdag. Die komt niet meteen na donderdag. | blijft, en erbij: Zaterdag? Die hangt niet direct achter donderdag. / Je tikte op zaterdag. Die dag ligt verder weg. | variatie (3) |
| Je koos 6. Dat zijn te weinig dagen. / Je koos 8. Dat zijn te veel dagen. | blijven, en erbij: Je tikte op 6. Een week heeft meer dagen. / Met 6 ben je er nog niet. / Je tikte op 8. Zoveel dagen heeft een week niet. / Met 8 tel je te ver door. | variatie (3); nooit "je mist nog 1 dag" (dan is het antwoord gezegd) |
| Alle uitleg bij de 2e keer (1 per soort) | blijft, en per soort 2 erbij, zoals: De week begint niet met het weekend. / Vóór de eerste dag hangt alleen de locomotief. / De laatste dag is de allerlaatste wagon van de trein. / Het weekend is korter dan de schoolweek. / Zaterdag is vrij, en de dag erna ook. / Erna betekent: later, niet eerder. / Je slaat geen dag over. Het is de dag direct erachter. / Vergeet het weekend niet. Dat hoort ook bij de week. / Je telt van maandag tot en met zondag, niet verder. | variatie (3); de uitleg herhaalt geen dag en geen getal uit de zin ervoor |
| Je koos weer zondag. (hetzelfde antwoord 2 keer) | blijft, en erbij: Weer zondag, zie ik. / Je tikte weer op zondag. | variatie (3) |
| Kom, we kijken samen. / We zoeken het samen. / Kom, samen lukt het. | blijven, en erbij: Geeft niks. We kijken samen. / Weet je wat? We zoeken het samen. | 5 versies; "geeft niks" zegt Synthesis hier ook |
| Vooraan, vlak achter de locomotief, hangt maandag. Daar begint de week. (en zo voor zondag) | blijft, en erbij: Kijk, de eerste wagon achter de locomotief is maandag. / Maandag rijdt vooraan. Daar begint de week mee. | variatie (3) |
| Van maandag tot en met vrijdag ga je naar school. | blijft, en erbij: Kijk, dit zijn de schooldagen: van maandag tot en met vrijdag. / Op deze dagen is er school, van maandag tot en met vrijdag. | variatie (3) |
| Op zaterdag en zondag is er geen school. Dat is het weekend. | blijft, en erbij: Zaterdag en zondag zijn vrij. Samen heten ze het weekend. / Achteraan rijden zaterdag en zondag. Dat is het weekend. | variatie (3) |
| Daarna komen zaterdag en zondag. Dat zijn 2 dagen zonder school. | blijft, en erbij: Dan zaterdag en zondag: 2 vrije dagen. / Zaterdag en zondag zijn vrij. Dat zijn 2 dagen. | variatie (3) |
| Hier is donderdag in de weektrein. / Erachter hangt vrijdag. | blijven, en erbij: Kijk, hier rijdt donderdag. / Dit is de wagon van donderdag. / Direct erachter rijdt vrijdag. / De wagon erachter is vrijdag. | variatie (3) |
| Ja, meteen na donderdag komt vrijdag. (en de andere zinnen na samen doen) | blijven, en erbij steeds: Goed zo! … / Precies, … | variatie (3) |
| Kijk, meteen na donderdag komt vrijdag. (Bliepo deed het zelf) | blijft, en erbij: Kijk, ik tik hem aan. Na donderdag komt vrijdag. | variatie; Bliepo zegt wat hij doet |
| Ja, het weekend heeft 2 dagen. / Ja, een week heeft 7 dagen. | blijven, en erbij: Goed zo! … / Precies, zaterdag en zondag: 2 dagen. / Precies, de week heeft 7 dagen. | variatie (3) |
| Tik op de kaart in het rondje. (hulphandje) | blijft, en erbij: Tik maar op de kaart in het rondje. | variatie |
| Je bent goed bezig. / Jij kunt dit. (hulphandje) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | dezelfde 5 als bij Tellen |
| Er komt nog 1 vraag van net terug. / Nu komen er nog 3 vragen van net terug. | blijven, en erbij: We doen nog 1 vraag van net. / Nog 1 vraag van net. Die oefenen we nog even. (zo ook met 3) | warmer ("we") |
| Nog 1 vraag om te oefenen. / We oefenen er nog 3 van net. | blijven, en erbij: We oefenen nog 1 vraag. / Nog 3 vragen om te oefenen. | variatie |
| Die oefenen we een andere keer nog eens. | blijft, en erbij: Dit oefenen we een andere keer nog eens. Dat komt goed. | geruststellend |
| Nu weet je hoe een week in elkaar zit. | blijft, en erbij: Je hebt goed gewerkt vandaag! Je kent nu de dagen van de week. / Mooi gewerkt! Je weet nu hoe de week loopt. | vrolijker |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | zoals de andere lessen |
| Reactie na lof: 5 zinnen per soort | blijven, en erbij 2: Precies, … / Dat klopt, … (bijvoorbeeld: Precies, maandag is de eerste dag. / Dat klopt, met zondag eindigt de week.) | variatie (7); "Precies" zoals bij Plussommen, Meten en Geld |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een antwoord dat niet goed is | 3 per antwoord (bij een ander antwoord de 2e keer 4, met "Nu koos je …") |
| Hint | 3 per soort vraag (4 bij "meteen na") |
| De vraag opnieuw na de hint | 3 per soort vraag |
| Uitleg bij de 2e keer | 3 per soort denkfout |
| Hetzelfde antwoord 2 keer ("Je koos weer …") | 3 |
| "Kom, we kijken samen." | 5 |
| Samen: wat Bliepo laat zien | 3 per stap |
| Samen: nu het kind ("Tik jij op …?") | 2 bij een kaart, 3 bij een getal |
| Samen: klaar / Bliepo deed het zelf | 3 / 2 |
| Hulphandje: aanmoediging en wat te doen | 5 en 2 |
| Zin na lof | 7 per soort vraag |
| Begin, vragen die terugkomen, slot, "Tik op de kaart." | 3, 2 of 3, 3, 3 |
| Lof, korte bevestiging, eindzin, overgang | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling; niet veranderd) |

## De fouttabel is strenger gemaakt (zoals bij Tellen, Geld en Klok)

Het script `scripts/fouttabel-tijd-gouden.ts` loopt nu ALLE varianten na (877 varianten, 896 losse beweringen), voor elk antwoord dat een kind kan geven (24 antwoorden die niet goed zijn, in 12 vragen, en nog eens bij de vragen die terugkomen):

- **Verklappen (15.17):** geen eerste zin, geen hint en geen "vraag opnieuw" noemt het antwoord (bij een kaart met 2 dagen: de dag die alleen op de goede kaart staat). Na de eerste zin blijven er minstens 2 keuzes over. Nergens "tussen … en …", "vlak naast", "bijna" of "dichtbij". Het rondje staat nooit om het antwoord. Alle getallen zijn wit.
- **Waarheid:** elke losse zin is nagelopen tegen de vraag en wat het kind koos. "Daar zit een schooldag bij" alleen bij een kaart met een schooldag én een weekenddag, "Die dag ligt verder weg" alleen als die dag niet vlak ervoor of erna komt, enzovoort. Een zin die het script niet kent, telt als niet goed.
- **Altijd een vraag of opdracht in beeld (15.37, F16):** na de hint komt de vraag terug (nooit precies dezelfde zin als de 1e keer). Een oude hint die zelf al met een eigen vraag eindigt ("Welke dag zeg je als eerste?"), krijgt niets erachter: nooit 2 vragen achter elkaar. Elke vraag, "nu jij", het hulphandje en "Tik op de kaart" zijn nagelopen. Het woord "vinkje" komt nergens voor.
- **Geen getal 2 keer in 1 stuk, en geen getal of dagnaam in 2 zinnen vlak achter elkaar.** Ook niet van de eerste zin naar de hint, van de hint naar de vraag erachter, of bij het samen voordoen ("Hier is zondag …" en dan niet "Zondag is …").
- **Bij 1 vraag geen zin 2 keer (15.29):** hint, uitleg en samen voordoen hebben verschillende zinnen; geen opdracht in de uitleg bij de 2e keer; geen zin begint met een cijfer.
- **Past in het tekstvak (harde eis):** elk stuk hooguit 110 tekens; bij elke hint passen minstens 2 versies van de vraag erachter; bij elke eerste zin passen minstens 2 hints en 2 uitleggen zonder herhaling. Die eisen gaan vooraf uit de lijst, niet als wens aan de kiezer. De nieuwe beginzinnen zijn niet langer dan de oude.
- **Nooit 2 keer hetzelfde:** de kiezer is nagespeeld in 1.400 hele lessen (21.000 vragen, ruim 27.000 reacties) met willekeurige antwoorden: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een getal, dag of stuk herhaald, 0 keer dezelfde eerste zin (of hetzelfde begin) bij de 1e en de 2e keer, 0 keer dezelfde zin 2 keer bij 1 vraag, "weer" alleen als het klopt, en bij een vraag die terugkomt altijd een andere hint.

## Zinnen van Synthesis

Synthesis heeft geen les over dagen, de week of de kalender (KOPPELING.md §10). Er is dus geen les-eigen zin van Synthesis overgenomen. Alleen de algemene tutorzin "geeft niks" (bij de 2e keer, zoals in Tellen, Meten en Geld) komt van Synthesis: "Geeft niks. We kijken samen."

## Niet gedaan, met reden

- **De vragen zelf afwisselen:** niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11) en de inhoud blijft die van Squla (15.22). Alleen de vraag NA de hint wisselt.
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet, overgang) herschrijven:** niet gedaan. Die zijn van alle gouden lessen samen.
- **"Weer" bij dezelfde denkfout met een ander antwoord:** kan in deze les niet voorkomen (elke denkfout hoort bij 1 antwoord per vraag); alleen hetzelfde antwoord 2 keer geeft "Je koos weer …".
- **"In deze les leer je hoe een week in elkaar zit."** (de oude beginzin): gebleven, met 2 warmere versies erbij. Vraag aan Sara in KEUZES-TIJD.md.
- **"Hier is de hele weektrein."** (`samenTrein`): wordt al sinds 11 november niet meer gezegd; laten staan (harde regel 3).
- **De oude les `squla-tijd.tsx`, de weektrein en de gouden les Dagen:** niet aangeraakt.

## 19 november 2026: "nagekeken" is weg

Opdracht van Sara: het woord "nagekeken" (en "nakijken") komt niet meer voor in wat Bliepo zegt of laat zien. Elke zin is vervangen door een andere zin die zegt dat het klopt ("Zie je, …", "Inderdaad, …"), op dezelfde plek in het rijtje (de robotplek blijft de robotplek, hooguit 1 keer per les; de grens "hooguit 2 keer per les" geldt nu voor deze zinnen: `WAS_NAKIJKEN` in squla-klok-gouden-zinnen.ts). Het gekozen antwoord staat er hooguit 1 keer in. Reden ook in WEGGEHAALD.md.

| Les | Soort | Oud | Nieuw |
|---|---|---|---|
| squla-tijd-dagen-1-gouden | nagekeken weg | Nagekeken: de week begint echt met maandag. | Zie je, maandag is dag ${g(1)} van de week. |
| squla-tijd-dagen-1-gouden | nagekeken weg | Nagekeken: zondag is echt de laatste dag. | Zie je, zondag is dag ${g(7)} van de week. |
| squla-tijd-dagen-1-gouden | nagekeken weg | Nagekeken: zaterdag en zondag, ${g(2)} dagen. | Zie je, op zaterdag en zondag ben je ${g(2)} dagen vrij. |
| squla-tijd-dagen-1-gouden | nagekeken weg | Nagekeken: dit is echt het weekend. | Zie je, je vond de ${g(2)} dagen zonder school. |
| squla-tijd-dagen-1-gouden | nagekeken weg | Nagekeken: na zondag komt echt maandag. | Zie je, de trein begint weer bij maandag. |
| squla-tijd-dagen-1-gouden | nagekeken weg | Nagekeken: na ${naam(d)} komt echt ${naam(na(d))}. | Zie je, ${naam(na(d))} is de volgende dag. |
| squla-tijd-dagen-1-gouden | nagekeken weg | Nagekeken: de week heeft echt ${g(7)} dagen. | Zie je, de week telt ${g(7)} dagen. |

## 20 november 2026: herstel keuring (zin klonk los na de lof, 15.36)

| Les | Waar | Oud | Nieuw |
|---|---|---|---|
| gouden | goed bij "welke dagen zijn het weekend?" (variant 4) | Dan is er geen school. | In het weekend is er geen school. |
