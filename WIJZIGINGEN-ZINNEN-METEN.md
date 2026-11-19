# WIJZIGINGEN-ZINNEN-METEN — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen en Minsommen, nu voor de gouden les Meten (`squla-meten-oppervlakte-1-gouden`, "Hoe groot is het?"). Meten heeft geen extra les. Andere lessen zijn niet veranderd. De oude les (`squla-meten.tsx`) is niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit 733478d). Geen andere les gebruikt het zinnenbestand van Meten (nagekeken: alleen `squla-meten-gouden.tsx` en het fouttabel-script lezen `squla-meten-gouden-zinnen.ts`).

**Niet veranderd:** de 12 vragen en de 3 die terugkomen, de getallen, de plaatjes, de keuzes, de antwoorden, de volgorde en de betekenis van elke zin. Wat op de kaartjes staat ("Het schilderij met de zon is het kleinst.", "Ze zijn even groot.") is precies gelijk gebleven. De vaste rijtjes van alle gouden lessen (lof, "nu is het goed", eindzinnen, groet, de zin als de denkfout niet duidelijk is) zijn niet aangeraakt.

**Alle varianten op een rij:** FOUTTABEL-squla-meten-oppervlakte-1-gouden.md, §4.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je typte weer 9." en "Je typte weer 11." tellen als dezelfde zin, net als "De kleinste tafel hoort vooraan." en "Het smalste muurtje hoort vooraan.". Als het kan begint de volgende zin ook anders, en herhaalt de hint geen stuk en geen getal uit de zin ervoor. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd).

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les kijk je hoe groot iets is. Je telt hoeveel tegels of hokjes het bedekt. | Vandaag kijken we hoe groot iets is. We tellen hoeveel tegels of hokjes het bedekt. / We gaan samen kijken hoe groot iets is. We tellen de tegels of de hokjes. | warmer, zoals een juf begint |
| Welke 2 zinnen kloppen? (vraag 2) | Welke 2 kaartjes kloppen? | op een kaartje staat een plaatje met 1 woord, geen zin; overal "kaartjes" |
| Wat klopt er? Kies er 2. Tik op 2 kaartjes. | Wat klopt er? Kies er 2. Tik op de kaartjes. | het getal 2 stond 2 keer achter elkaar |
| Nog een tafel vol blaadjes. Hoe groot is deze tafel? (vraag 11) | Nog een tafel vol blaadjes. Hoe groot is deze tafel? Typ het getal. | nu zegt de vraag ook wat het kind doet (BOUWREGELS 15.37) |
| 10. Samen geteld: de tafel is 10 blaadjes groot. | En 10! Zo groot is de tafel. / Alles geteld! De tafel is 10 blaadjes groot. / We hebben alle blaadjes geteld. De tafel is 10 blaadjes groot. | het getal klonk 2 keer achter elkaar |
| 8. Blauw heeft 8 hokjes. | En 8! Zoveel hokjes heeft blauw. / En de laatste is 8. Zoveel hokjes heeft blauw. | het getal klonk 2 keer achter elkaar |
| 8. Geel heeft ook 8 hokjes. Dus ze zijn even groot, en blauw is 8 hokjes groot. | En 8! Net zoveel als blauw. Ze zijn dus even groot. / Alles geteld! Geel heeft ook 8 hokjes. Ze zijn even groot. / Geel heeft er ook 8. Blauw en geel zijn dus even groot. | het getal klonk 3 keer; te lange zin |
| 4. Mat 1 heeft 4 stukken. | En 4! Zoveel stukken heeft mat 1. / En de laatste is 4. Zoveel stukken heeft mat 1. | het getal klonk 2 keer achter elkaar |
| 4. Mat 2 heeft ook 4 stukken. De matten zijn even groot. | En 4! Net zoveel als de andere mat. De matten zijn even groot. / Alles geteld! Mat 2 heeft ook 4 stukken. De matten zijn even groot. / Deze mat heeft er ook 4. De matten zijn dus even groot. | het getal klonk 2 keer achter elkaar |
| Kom, we draaien kaartje 2 terug. Tik jij op kaartje 2? | Kom, we draaien het kaartje terug. Tik jij op kaartje 2? | "kaartje 2" kwam 2 keer achter elkaar |
| Tik dit blaadje. / Tik dit hokje. / Tik dit stuk. (hulphandje) | Tik op dit blaadje. / Tik dit blaadje maar aan. (zo ook hokje en stuk) | grammatica |
| Je koos weer dezelfde zin. | Je koos weer hetzelfde antwoord. / Je tikte weer op hetzelfde antwoord. / Weer hetzelfde antwoord, zie ik. | op de knop staat een antwoord; "zin" was onduidelijk |
| Maar 1 van die 2 zinnen kan kloppen. | Maar 1 van die 2 kaartjes kan kloppen. | overal "kaartjes" |
| Het kleinste schilderij bedekt de minste tegels. Kijk goed naar de tegels. (hint na "1 van je 2 kaartjes klopt") | Tel de tegels achter elk schilderij. Veel tegels is groot, weinig tegels is klein. / Kijk goed naar de tegels achter de schilderijen. Tel ze maar. | de hint zei eigenlijk welk kaartje niet klopte (15.17); nu zegt hij alleen hoe je het ziet |
| Een andere vorm kan toch even groot zijn. Het aantal hokjes telt. | Een andere vorm kan toch even groot zijn. Het gaat om hoeveel hokjes het zijn. | "aantal" is een moeilijk woord |
| De vorm is anders, maar het aantal hokjes zegt hoe groot hij is. | De vorm is anders, maar de hokjes zeggen hoe groot hij is. | idem |
| Een mat is niet groter omdat hij hoger is. Het aantal stukken telt. (ook: langer) | Een mat is niet groter omdat hij hoger is. Het gaat om de stukken. | idem |
| Hoger is niet altijd groter. Het aantal stukken telt. (ook: Langer) | Hoger is niet altijd groter. Het gaat om hoeveel stukken het zijn. | idem |
| Je zag de lege plekken weer niet. | Je legde ze weer zo neer. / Weer dezelfde volgorde, zie ik. | klonk als een verwijt |
| Dat is dichtbij. (alleen deze 3 kale zinnen) | blijft, en erbij: Je typte 9. Je zit er dichtbij. / Bijna! 9 is het net niet. / 9? Dat is heel dichtbij. | te kaal; nu zegt Bliepo ook wat het kind typte |
| Er komt nog 1 vraag van net terug. / Er komen nog 3 vragen van net terug. | We doen nog 1 vraag van net. / Nog 1 vraag van net. Die oefenen we nog even. (zo ook met 3) | warmer ("we") |
| Deze vragen oefen je een andere keer nog eens. | Deze vragen oefenen we een andere keer nog eens. / Dit oefenen we een andere keer nog eens. Dat komt goed. | warmer ("we") |
| 2e keer mis, een ander antwoord: Bliepo kon 2 keer dezelfde eerste zin zeggen | de les kiest nu altijd een andere eerste zin dan de 1e keer | nooit 2 keer hetzelfde |
| Bij hetzelfde getal 2 keer zonder duidelijke denkfout (bijvoorbeeld 2 keer 50): een zin uit het vaste rijtje | Je typte weer 50. | Bliepo zegt wat hij ziet |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Kom, we tellen samen. (bij elke 2e keer mis bij een tafel) | blijft, en erbij: Weet je wat? We tellen ze samen. / Geeft niks. We tellen ze samen. / Ik help je even. We tellen ze samen. / Laten we ze samen tellen. | de zin kwam letterlijk steeds terug; "geeft niks" zegt Synthesis hier ook |
| Kom, we kijken samen naar de tegels. / Kom, we tellen de hokjes samen. / Kom, we tellen de stukken samen. / Kom, we leggen ze samen. | blijven, en erbij steeds: Weet je wat? We … / Geeft niks. We … / Ik help je even. We … | variatie (4 of 5) |
| Welke 2 kaartjes kloppen? (na de hint) | blijft, en erbij: Welke 2 kaartjes kloppen, denk je? / Kies nog een keer 2 kaartjes. | variatie; nooit dezelfde zin als de vraag zelf |
| Leg ze nu van klein naar groot. | blijft, en erbij: Probeer het nog eens. Leg ze van klein naar groot. / Zet ze nog een keer op volgorde: van klein naar groot. | variatie (3) |
| Zijn de 2 kaartjes even groot, of niet? | blijft, en erbij: Wat denk je nu? Zijn de kaartjes even groot, of niet? | variatie |
| Zijn de matten even groot, of is er 1 groter? | blijft, en erbij: Wat denk je nu? Zijn de matten even groot, of is er 1 groter? | variatie |
| Hoeveel blaadjes liggen er op de tafel? | blijft, en erbij: Hoeveel blaadjes tel je nu? Typ het getal. / Tel de blaadjes nog een keer. Hoeveel zijn het? | variatie (3) |
| Tik elk blaadje 1 keer aan. | blijft, en erbij: Tik op elk blaadje. Ik tel mee. / Tik de blaadjes aan, stuk voor stuk. Ik tel mee. | variatie (3) |
| De zon bedekt 9 tegels. | blijft, en erbij: Achter de zon zitten 9 tegels. / De zon is 9 tegels groot. | Bliepo zei 3 keer achter elkaar dezelfde zin (1 per schilderij) |
| De zon bedekt de minste tegels. Het huis de meeste. | blijft, en erbij: De minste tegels zitten achter de zon. De meeste achter het huis. | variatie |
| Tik jij de 2 kaartjes aan die kloppen? | blijft, en erbij: Nu jij! Tik op de 2 kaartjes die kloppen. | variatie |
| Tel jij de gele hokjes? Tik elk hokje aan. | blijft, en erbij: Nu jij! Tik op elk geel hokje. Ik tel mee. | variatie |
| Tel jij de stukken van mat 2? Tik elk stuk aan. | blijft, en erbij: Nu jij! Tik op elk stuk van mat 2. Ik tel mee. | variatie |
| Tik jij op kaartje 2? | blijft, en erbij: Nu jij! Tik op kaartje 2. | variatie |
| Vooraan de tafel met 2 borden. Dan de tafel met 4 borden. Dan de tafel met 6 borden. | Vooraan (komt) …, en dan steeds een andere: Dan … / Daarna … / En dan komt … | Bliepo zei 2 keer achter elkaar "Dan …" |
| Sleep jij de tafel met plek over naar het laatste vak? | blijft, en erbij: Nu jij! Sleep de tafel met plek over naar het laatste vak. | variatie |
| Nu liggen ze van klein naar groot. | blijft, en erbij: Zo liggen ze goed: van klein naar groot. / Mooi, ze liggen nu van klein naar groot. | variatie (3) |
| De zon is het kleinst, en het huis is het grootst. | blijft, en erbij: Deze 2 kaartjes kloppen: de zon is het kleinst en het huis het grootst. | variatie |
| Nu liggen ze allebei rechtop. Ze zijn even groot. | blijft, en erbij: Nu liggen ze allebei rechtop. Je ziet het: ze zijn even groot. | variatie |
| Kijk, de tafel is 10 blaadjes groot. (Bliepo deed het zelf; en de 5 andere) | blijven, en erbij steeds 1: Kijk, ik tel de rest. … / Kijk, ik tik ze aan. … / Kijk, ik draai het terug. … / Kijk, ik leg de laatste erbij. … | variatie; Bliepo zegt wat hij doet |
| Je bent goed bezig. / Jij kunt dit. (hulphandje) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (dezelfde 5 als bij Tellen) |
| Sleep een plaatje naar dit vak. / Tik dit kaartje aan. / Tik hier. / Sleep het hierheen. (hulphandje) | blijven, en erbij: Sleep maar een plaatje naar dit vak. / Tik maar op dit kaartje. / Tik maar hier. / Sleep het plaatje maar hierheen. | variatie |
| Je zit er weer vlak naast. | blijft, en erbij: Weer bijna! / Ook dit getal is het net niet. | variatie (3) |
| Je legde ze weer zo neer. / Je koos weer dezelfde 2 kaartjes. / Je typte weer 9. | blijven, en erbij: Ze liggen weer net zo als eerst. / Weer dezelfde volgorde, zie ik. / Je tikte weer op dezelfde 2 kaartjes. / Weer dezelfde 2 kaartjes, zie ik. / Je kwam weer op 9. / Weer 9, zie ik. | variatie (3) |
| Nog 3 vragen om te oefenen. | blijft, en erbij: We oefenen nog 3 vragen. | variatie |
| Je weet nu hoe je kunt zien hoe groot iets is. | blijft, en erbij: Je hebt goed gewerkt vandaag! Je kunt nu tellen hoe groot iets is. / Mooi gewerkt! Je ziet nu hoe groot iets is als je telt. | variatie; vrolijker |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie (zoals de andere lessen) |
| Je koos 2 keer 'het kleinst'. | blijft, en erbij: Op allebei je kaartjes staat 'kleinst'. / Je tikte 2 kaartjes aan met 'kleinst'. | variatie (3) |
| 1 van je 2 kaartjes klopt. | blijft, en erbij: 1 kaartje klopt al. Het andere nog niet. / Bijna! 1 van de 2 klopt al. | variatie (3); Bliepo zegt nooit welke |
| Je koos 'even groot' én 'niet even groot'. | blijft, en erbij: Op je kaartjes staat 'even groot' én 'niet even groot'. / Je tikte op 'even groot' én op 'niet even groot'. | variatie (3) |
| Je legde ze van groot naar klein. | blijft, en erbij: Ze liggen nu van groot naar klein. / Je begon met de grootste tafel. | variatie (3) |
| Op 2 tafels staan 6 borden. | blijft, en erbij: Er zijn 2 tafels met 6 borden. / 2 tafels hebben allebei 6 borden. | variatie (3) |
| Vooraan ligt nog niet de kleinste tafel. | blijft, en erbij: De kleinste tafel ligt nog niet vooraan. / Je begon niet met de kleinste tafel. | variatie (3) |
| Na de tafel met 2 borden legde je de tafel met 6 borden. | blijft, en erbij: Achter de tafel met 2 borden ligt de tafel met 6 borden. / Na de tafel met 2 borden komt nu de tafel met 6 borden. | variatie (3) |
| Kaartje 2 ligt op zijn kant. Daardoor lijkt het anders. | blijft, en erbij: Kaartje 2 is gedraaid. Dan lijkt het anders. / Het lijkt anders, want kaartje 2 ligt op zijn kant. | variatie (3) |
| Mat 1 is hoger. Dan lijkt hij groter. (ook: mat 2, langer) | blijft, en erbij: Mat 1 lijkt groter, want hij is hoger. / Je koos mat 1. Die is hoger, dus hij lijkt groter. | variatie (3) |
| 5 is de bovenste rij. | blijft, en erbij: Je typte 5. Dat is de bovenste rij. / 5? Zoveel blaadjes liggen er in de bovenste rij. | variatie (3) |
| Dan heb je een rij overgeslagen. | blijft, en erbij: Je typte 8. Dan mis je nog een hele rij. / 8? Dan heb je een rij overgeslagen. | variatie (3); de 2e is van Synthesis |
| Je deed 5 en 2 bij elkaar. | blijft, en erbij: Je telde 5 en 2 bij elkaar op. | variatie |
| Alle hints (1 of 2 per soort, vast per vraag) | blijven, en per soort 1 of 2 erbij, zoals: Dat kan niet allebei. Tel de tegels achter elk schilderij. / Hoeveel hokjes heeft blauw? En hoeveel heeft geel? / Welke tafel is het kleinst? Die komt vooraan. / Wordt een kaartje groter als je het draait? / Hoeveel stukken heeft elke mat? Tel ze maar. / Probeer het nog eens. Tel rustig, stuk voor stuk. De les kiest nu steeds een andere. | de hint was per vraag altijd dezelfde (3 per soort) |
| Alle uitleg bij de 2e keer (1 of 2 per soort) | blijft, en per soort 1 of 2 erbij, zoals: Hoe minder tegels een schilderij bedekt, hoe kleiner het is. / Iets is even groot, of niet even groot. Allebei kan niet. / Draaien verandert niet hoe groot een kaartje is. / We slaan geen rij over. | variatie (2 of 3) |
| Alle "weer"-zinnen (1 per soort) | blijven, en erbij steeds: Weer …, zie ik. (en een 2e uitleg) | variatie (2) |
| Reactie na lof: 5 zinnen per soort vraag | blijven, en erbij 2: Precies, … / Dat klopt, … (bijvoorbeeld: Precies, het zijn 10 blaadjes. / Dat klopt, de matten zijn even groot.) | variatie (7); "Precies" zoals bij Plussommen |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een antwoord dat niet goed is | 3 per soort (6 bij "dichtbij", 2 bij "rij en rijen bij elkaar") |
| Hint | 3 per soort |
| Uitleg bij de 2e keer | 2 of 3 per soort |
| "Weer …" (2 keer dezelfde denkfout) | 2, met 2 soorten uitleg |
| Hetzelfde antwoord 2 keer ("Je koos weer …") | 3 per soort vraag |
| Weer vlak naast het antwoord | 3 |
| De vraag opnieuw na de hint | 2 of 3 per soort vraag |
| "Kom, we … samen." | 4 of 5 per soort vraag |
| Samen: wat het kind doet ("Tik elk blaadje 1 keer aan.") | 2 of 3 |
| Hulphandje: aanmoediging en wat te doen | 5 en 2 |
| Klaar met samen voordoen | 2 of 3 per soort vraag |
| Bliepo doet de stap zelf (vangnet) | 2 per soort vraag |
| Zin na lof | 7 per soort vraag |
| Begin, vragen die terugkomen, slot | 2, 2 en 3 |
| "Tik op de kaart." | 3 |
| Lof, korte bevestiging, eindzin, zin als de denkfout niet duidelijk is | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) |

## De fouttabel is strenger gemaakt (zoals bij Tellen)

Het script `scripts/fouttabel-meten-gouden.ts` loopt nu ALLE varianten na, voor elk antwoord dat een kind kan geven (bij typen elk getal van 0 tot 99, bij op volgorde elke volgorde, bij kies er 2 elk paar):

- **Verklappen (15.17):** geen enkele variant noemt het antwoord. Na elke eerste zin met hint blijven er bij kiezen minstens 2 keuzes over. Bij "1 van je 2 kaartjes klopt" wijst ook de hint geen kaartje aan (1 oude hint deed dat wel; die is vervangen). Bij op volgorde zegt geen hint wat er "tussen" hoort.
- **Ook "dichtbij" en "bijna" verklappen niets:** die woorden komen alleen als het getal er 1 naast zit, altijd zonder richting. Er blijven dan 2 getallen over.
- **Waarheid:** 2.105 zinnen nagelopen. "De bovenste rij" alleen als het getal echt de bovenste rij is, "je begon met de grootste tafel" alleen als ze van groot naar klein liggen, "mat 1 is hoger" alleen als het kind mat 1 koos, enzovoort.
- **Geen opdracht bij de 2e keer**, nooit het woord "fout", **geen getal 2 keer in 1 zin**.
- **Altijd een vraag of opdracht in beeld (15.37, F16):** na de hint stelt Bliepo de vraag opnieuw. Elke variant daarvan heeft een vraagteken of zegt wat het kind doet. Ook elke vraag, elke stap bij samen voordoen en elke zin van het hulphandje is zo nagelopen. Het woord "vinkje" komt nergens voor.
- **Past in het tekstvak:** de eis voor de lengte (123 tekens bij de 1e keer, 130 bij de 2e keer; zo lang waren de langste oude reacties) gaat vooraf uit de lijst, niet als wens aan de kiezer. Bij elke eerste zin passen minstens 2 hints, zodat Bliepo kan blijven wisselen.
- **Nooit 2 keer hetzelfde:** de kiezer is 20.000 keer nagespeeld (30.574 reacties) met willekeurige antwoorden: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer dezelfde zin 2 keer in 1 reactie, 0 keer dezelfde eerste zin bij de 1e en de 2e keer van 1 vraag, en "weer" alleen als het klopt.

## Zinnen van Synthesis (Area: Cover It Up), in het Nederlands (besluit Sara, 17 november 2026)

Alleen de tekst, passend gemaakt voor groep 3. Geen audio, beeld of code.

| Synthesis zegt (vertaald uit het draaiboek Meten) | Bij ons nu | Waar |
|---|---|---|
| dat is de bovenste rij; er liggen meer rijen onder | 5 is de bovenste rij. Er liggen nog meer rijen onder. Tel ze allemaal mee. (stond er al) | typen: eerste zin en hint |
| dan mis je een hele rij | Je typte 8. Dan mis je nog een hele rij. | typen: eerste zin |
| tik elke tegel maar 1 keer | Tik elk blaadje 1 keer aan als je telt. (stond er al) | typen: hint |
| geeft niks (en dan samen tellen) | Geeft niks. We tellen ze samen. | 2e keer mis |
| we tellen samen; tik elke tegel 1 keer | Kom, we tellen samen. Tik elk blaadje 1 keer aan. (stond er al) | samen tellen |

Niet overgenomen: "1 te veel" (dan is het antwoord verklapt, 15.17), "hij wordt goud" (bij ons krijgt een blaadje een nummer in zijn eigen kleur) en "laten we je gok testen" (de gok zit niet in de Squla-les, 15.21).

## Niet gedaan, met reden

- **De vragen zelf afwisselen** ("Hoe groot is de tafel?", "Zet de tafels op volgorde."): niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11) en bij Meten blijft de inhoud precies die van Squla (15.21).
- **Het woord "bedekt"** ("Ze bedekken de hele tafel.", "De zon bedekt 9 tegels."): gebleven. Het is het woord waar de hele les om draait. Vraag aan Sara in KEUZES-METEN.md.
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) herschrijven:** niet gedaan. Die zijn van alle gouden lessen samen.
- **Richting noemen bij typen** ("1 te veel"): niet gedaan, dan weet het kind het antwoord (15.17).
- **Een hint "daar hoort nog een muurtje tussen":** niet gedaan. Bij 3 muurtjes is dat het antwoord.
- **De opdracht laten staan terwijl Bliepo bij samen tellen de getallen zegt:** niet gedaan. Dat is geen zin maar een plek op het scherm, en het moet voor alle lessen tegelijk op dezelfde manier (zie KEUZES-METEN.md).
- **Een aanmoediging met de naam van het kind bij een antwoord dat niet goed is:** niet gedaan (BOUWREGELS 3.17).
- **De oude les `squla-meten.tsx`:** niet aangeraakt.

## 19 november 2026: "nagekeken" is weg

Opdracht van Sara: het woord "nagekeken" (en "nakijken") komt niet meer voor in wat Bliepo zegt of laat zien. Elke zin is vervangen door een andere zin die zegt dat het klopt ("Zie je, …", "Inderdaad, …"), op dezelfde plek in het rijtje (de robotplek blijft de robotplek, hooguit 1 keer per les; de grens "hooguit 2 keer per les" geldt nu voor deze zinnen: `WAS_NAKIJKEN` in squla-klok-gouden-zinnen.ts). Het gekozen antwoord staat er hooguit 1 keer in. Reden ook in WEGGEHAALD.md.

| Les | Soort | Oud | Nieuw |
|---|---|---|---|
| squla-meten-oppervlakte-1-gouden | nagekeken weg | Nagekeken: ${kl.naam} het kleinst, ${gr.naam} het grootst. | Zie je, ${gr.naam} is groter dan ${kl.naam}. |
| squla-meten-oppervlakte-1-gouden | nagekeken weg | Nagekeken: allebei ${g(8,  / )} hokjes. Klopt! | Zie je, de ene vorm is niet groter dan de andere. |
| squla-meten-oppervlakte-1-gouden | nagekeken weg | Nagekeken: van klein naar groot! | Zie je, elke tafel is groter dan de vorige. |
| squla-meten-oppervlakte-1-gouden | nagekeken weg | Nagekeken: van smal naar breed! | Zie je, het breedste muurtje ligt achteraan. |
| squla-meten-oppervlakte-1-gouden | nagekeken weg | Nagekeken: even groot! | Zie je, het kaartje is niet groter of kleiner geworden. |
| squla-meten-oppervlakte-1-gouden | nagekeken weg | Nagekeken: allebei ${n} stukken. | Zie je, geen mat is groter dan de andere. |
| squla-meten-oppervlakte-1-gouden | nagekeken weg | Nagekeken: ${n} blaadjes. Klopt! | Zie je, je hebt geen blaadje overgeslagen. |


## 19 november 2026: eigen zinnen in plaats van de vertaalde Synthesis-zinnen (besluit Sara, BOUWREGELS 15.41)

Sara besliste: in onze gouden lessen geen zinnen van Synthesis, ook niet vertaald. Elke nieuwe zin staat op dezelfde plek in de rij, doet hetzelfde en is ongeveer even lang. Getallen, antwoorden, keuzes en robotplekken zijn niet veranderd. Fouttabel-script opnieuw gedraaid. Oude zinnen: WEGGEHAALD.md. Bleef staan: "Geeft niks. We tellen ze samen." (gewoon Nederlands).

| Les | Waar | Oud (vertaald uit Synthesis) | Nieuw (eigen zin) |
|---|---|---|---|
| gouden | typen: eerste zin, een rij te weinig (variant 2) | Je typte 8. Dan mis je nog een hele rij. | Je typte 8. Er hoort nog een hele rij bij. |
