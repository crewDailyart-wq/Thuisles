# WIJZIGINGEN-ZINNEN-DAGEN — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten, Getallenlijn en Geld, nu voor de gouden les Dagen (`squla-dagen-van-de-week-gouden`, "Dagen van de week"). Dagen heeft geen extra les. Andere lessen zijn niet veranderd. De oude les (`squla-dagen.tsx`) en de weektrein zijn niet aangeraakt. De gouden les Tijd (`squla-tijd-gouden`) heeft een eigen zinnenbestand en is niet veranderd.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit 679552a). Geen andere les gebruikt het zinnenbestand van Dagen (nagekeken: alleen `squla-dagen-gouden.tsx` en het fouttabel-script lezen `squla-dagen-gouden-zinnen.ts`).

**Niet veranderd:** de 17 vragen, de dagen, de dagkaarten, de antwoorden, de volgorde en de betekenis van elke zin. De vragen zelf ("Tik op de wagon van donderdag.", "Welke dag komt na dinsdag?", "Vandaag is het woensdag. Welke dag was het gisteren?", "Sleep de goede dag naar de lege plek.", "Het weekend heeft 2 dagen. Tik op een dag van het weekend.") zijn precies gelijk gebleven: ze zijn kort en helder (15.36). De vaste rijtjes van alle gouden lessen (lof, "nu is het goed", eindzinnen, groet, overgang) zijn niet aangeraakt. **De hint van de logica-controle "… Zeg de dagen op tot donderdag. Tik dan op die wagon." is gebleven** (nu 1 van 4 hints).

**Alle varianten op een rij:** FOUTTABEL-squla-dagen-van-de-week-gouden.md, §4 en §5.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen en Geld: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos maandag." en "Je koos vrijdag." tellen als dezelfde zin. Als het kan begint de volgende zin ook anders. Nieuw bij Dagen: **een dagnaam telt net als een getal**: de hint herhaalt geen dag uit de zin ervoor, de vraag na de hint herhaalt geen dag uit de hint, en geen stuk noemt dezelfde dag 2 keer. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd).

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| Na dinsdag is de dag erachter. Welke dag komt na dinsdag? | Na is de dag die erachter komt. Welke dag komt na dinsdag? (en 3 andere hints) | dinsdag klonk 2 keer in 1 stuk |
| Zeg de dagen op, vanaf dinsdag. Welke dag zeg je daarna? | Zeg de dagen op, vanaf het begin van de week. Welke dag komt na dinsdag? | de hint eindigde met een vraag; nu komt de gewone vraag terug (3.11, 15.37) |
| Vóór vrijdag is de dag ervoor. Welke dag komt vóór vrijdag? | Vóór is de dag die ervoor komt. Welke dag komt vóór vrijdag? (en 3 andere) | vrijdag klonk 2 keer |
| Zeg de dagen op tot vrijdag. Welke dag zeg je net daarvoor? | De dag ervoor hoort op de lege plek. Welke dag komt vóór vrijdag? (bijvoorbeeld) | de hint eindigde met een andere vraag dan de vraag van de les |
| Vóór maandag was de vorige week. Hoe eindigt een week? | Ervoor was de vorige week. Welke dag komt vóór maandag? | 2 vragen achter elkaar; maandag 2 keer |
| Na zondag begint een nieuwe week. Welke dag komt dan? | Na het weekend begint een nieuwe week. Welke dag komt na zondag? | zondag niet 2 keer; de gewone vraag terug |
| Het weekend heeft 2 dagen. Zaterdag is er 1 van. Tik op de andere. | Zaterdag is 1 van de 2 dagen van het weekend. Tik op de andere dag van het weekend. | met de vraag erachter 4 zinnen: te veel voor het tekstvak |
| Lees de bordjes vanaf maandag, vooraan. Waar staat donderdag? | Lees de bordjes vanaf maandag, vooraan. Waar is de wagon van donderdag? Tik erop. | zegt nu ook wat het kind doet (15.37) |
| We lopen langs de wagons, vanaf maandag. (daarna: "Maandag.") | We lopen samen langs de wagons. / We lezen samen de bordjes, van voor naar achter. / Kom, we gaan de trein langs. Ik begin vooraan. | maandag klonk 2 keer achter elkaar |
| Tik jij op de wagon van donderdag? (net na "Donderdag.") | Tik jij op de wagon in het rondje? / Nu jij! Tik op de wagon in het rondje. | Bliepo zei de dag net al; nu zegt hij waar het kind tikt (zoals Geld) |
| Tik jij op de kaart van woensdag? | Tik jij op de kaart in het rondje? / Nu jij! Tik op de kaart in het rondje. | idem |
| Tik jij op dinsdag? (gisteren/morgen, weekend) | Tik jij op de wagon in het rondje? / Nu jij! Tik op de wagon in het rondje. | idem |
| Sleep jij woensdag naar de lege plek? (net na "Daartussen hoort woensdag.") | Sleep jij de kaart in het rondje naar de lege plek? / Nu jij! Sleep de kaart in het rondje naar de lege plek. | idem |
| Hier is zondag in de weektrein. → Zondag is de laatste wagon. Daarna begint de week weer met maandag. | Dit is de laatste wagon. Daarna begint de week weer met maandag. / Daarna begint een nieuwe week. Die begint met maandag. / Na de laatste dag komt weer maandag, vooraan. | zondag klonk 2 keer achter elkaar |
| Hier is maandag in de weektrein. → Maandag is de eerste wagon. De dag ervoor was zondag, … | Dit is de eerste wagon. De dag ervoor was zondag, de laatste van de vorige week. (en 2 varianten) | idem met maandag |
| De wagons staan op volgorde van de week. Maandag staat vooraan. (uitleg) | Maandag staat vooraan. Daarna komen de andere dagen, op volgorde. (en 2 andere) | de 1e zin is nu een hint; de uitleg zegt meer |
| Gisteren is de dag vóór vandaag. Welke dag was het gisteren? | blijft, met 3 versies van de vraag erachter ("Welke dag was het gisteren, denk je?", "Kies nog een keer. Welke dag was het gisteren?") | de vraag wisselt nu af |
| Elke dag hangt maar 1 keer in de trein. | blijft, en erbij: Wat al in de trein hangt, hoort niet op de lege plek. / Elke wagon heeft een andere dag. | variatie |

## Deel B — dezelfde betekenis, nu in varianten

| Oud (1 zin) | Nieuw (versies) |
|---|---|
| In deze les leer je de dagen van de week. Ze rijden mee in de weektrein. | blijft, en erbij: Vandaag oefenen we de dagen van de week. Ze rijden in de weektrein. / Kijk, de weektrein! Elke wagon is een dag van de week. |
| Je koos de wagon van woensdag. Je zit er vlak naast. | blijft, en erbij: Woensdag? Die wagon staat er vlak naast. / Je tikte op woensdag. Je bent er heel dichtbij. |
| Je koos de wagon van maandag. (stil) | blijft, en erbij: Je tikte op maandag. / Dit is de wagon van maandag. |
| Je koos maandag. Die dag komt vóór dinsdag. | blijft, en erbij: Maandag? Die dag hangt vóór dinsdag. / Je tikte op maandag. Die dag komt ervóór, niet erna. |
| Je koos vrijdag. Die dag komt niet direct na dinsdag. | blijft, en erbij: Vrijdag? Die hangt niet direct achter dinsdag. / Je tikte op vrijdag. Die dag ligt verder weg. |
| Je sleepte vrijdag. Die dag hangt al ergens anders in de trein. | blijft, en erbij: Vrijdag? Die rijdt al mee in de trein. / Je sleepte vrijdag. Die dag heeft al een wagon. |
| Je koos woensdag. Dat is vandaag. | blijft, en erbij: Woensdag? Dat is vandaag, bij de pijl. / Je tikte op de dag van vandaag. |
| Je koos donderdag. Dat is morgen. | blijft, en erbij: Donderdag? Dat is morgen, de dag erna. / Je tikte op donderdag. Die dag moet nog komen. |
| Je koos maandag. Dat is een schooldag. | blijft, en erbij: Maandag? Dan ga je naar school. / Je tikte op maandag. Die dag hoort niet bij het weekend. |
| Je koos weer … (2 keer hetzelfde) | blijft, en erbij: Weer maandag, zie ik. / Je tikte weer op maandag. (bij slepen: Dat is weer maandag.) |
| "weer"-zinnen (Je koos weer vandaag. / Je sleepte weer een dag die …) | blijven, elk met een 2e versie ("Weer vandaag, zie ik.", "Weer een dag die al meerijdt, zie ik.") |
| Hints: 2 per soort | 3 of 4 per soort (alle in FOUTTABEL §4) |
| Uitleg bij de 2e keer: 1 per soort | 3 per soort |
| Kom, we kijken samen. (3 versies) | 5 versies, ook "Geeft niks. We kijken samen." (zoals Synthesis) en "Weet je wat? We zoeken het samen." |
| Samen voordoen: 1 zin per stap | 2 of 3 versies per stap ("Erachter hangt woensdag." / "Direct erachter rijdt woensdag." / "De wagon erachter is woensdag.") |
| Klaar met samen voordoen: "Ja, …" | erbij "Goed zo! …" en "Precies, …" |
| Het hulphandje: 1 zin, aanmoediging uit 2 | 2 zinnen ("Tik maar op …"), aanmoediging uit 5 (zoals Tellen en Geld) |
| Er mist een dag in de trein. | blijft, en erbij: Oei, er mist een dag in de trein! / Kijk, er is een lege plek in de trein. |
| Nu ken je de dagen van de week. / Tik op de kaart. | blijven, met 2 versies erbij |
| Zin na lof: 5 per soort | 7 per soort ("Precies, …" en "Dat klopt, …"); een getal uit de lofzin ("Al 3 goed achter elkaar!") komt niet terug in de zin erna |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een antwoord dat niet goed is | 3 per soort (bij een ander antwoord de 2e keer 4, met "Nu koos je …") |
| Hint | 3 of 4 per soort |
| De vraag opnieuw na de hint | 3 per soort vraag |
| Uitleg bij de 2e keer | 3 per soort |
| "Weer …" (2 keer dezelfde denkfout) | 2, met 2 of 3 soorten uitleg |
| Hetzelfde antwoord 2 keer ("Je koos weer …") | 3 |
| "Kom, we kijken samen." | 5 |
| Samen: wat Bliepo laat zien | 2 of 3 per stap |
| Samen: nu het kind | 2 |
| Hulphandje: aanmoediging en wat te doen | 5 en 2 |
| Klaar met samen voordoen | 3 |
| Bliepo doet de stap zelf (vangnet) | 2 |
| Zin na lof | 7 per soort |
| Begin, "er mist een dag", slot, kaart | 3 |

## De fouttabel is strenger gemaakt (zoals bij Tellen en Geld)

Het script `scripts/fouttabel-dagen-gouden.ts` loopt nu ALLE varianten na, voor elk antwoord dat een kind kan geven (65 antwoorden die niet goed zijn, in 17 vragen plus de 2e weekendvraag na zondag):

- **Verklappen (15.17):** geen eerste zin, hint of vraag erachter noemt de goede dag (bij "Tik op de wagon van …" noemt de vraag de dag zelf). Er blijven altijd minstens 2 keuzes over. Het rondje staat nooit om het antwoord.
- **Waarheid:** 1.404 losse zinnen nagelopen tegen de trein van de vraag en wat het kind koos ("vlak naast" alleen als het klopt, "Dat is morgen" alleen bij de dag na vandaag, "ligt verder weg" alleen als er minstens 1 dag tussen zit, enzovoort). Een zin die het script niet kent, telt als niet goed.
- **Geen opdracht bij de 2e keer**, nooit het woord "fout", **geen getal en geen dagnaam 2 keer in 1 stuk**, geen zin langer dan 14 woorden, hooguit 3 zinnen per stuk, elk getal heeft een kleur of wit.
- **Altijd een vraag of opdracht in beeld (15.37, F16):** na de hint komt de vraag terug (of de hint eindigt zelf met een opdracht). Geen hint eindigt met een vraag. Ook elke vraag, elke "nu jij"-zin en elke zin van het hulphandje is zo nagelopen. Het woord "vinkje" komt nergens voor.
- **Past in het tekstvak:** elk stuk is hooguit 110 tekens en 3 zinnen. Die eis gaat vooraf uit de lijst, niet als wens aan de kiezer. Bij elke hint passen minstens 2 versies van de vraag erachter.
- **"Weer" alleen als het klopt.**
- **Nooit 2 keer hetzelfde:** de kiezer is 20.000 keer nagespeeld (28.546 reacties) met willekeurige antwoorden: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een getal, dagnaam of stuk herhaald, 0 keer dezelfde eerste zin bij de 1e en de 2e keer, 0 keer te lang, altijd een vraag of opdracht.

## Zinnen van Synthesis

Synthesis heeft geen les over dagen of de week (KOPPELING.md §9). Er is dus geen les-eigen zin van Synthesis overgenomen. Alleen de algemene tutorzin "geeft niks" (bij de 2e keer, zoals in Tellen, Meten en Geld) komt van Synthesis: "Geeft niks. We kijken samen."

## Niet gedaan, met reden

- **De vragen zelf afwisselen:** niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11) en de inhoud blijft die van Squla (15.22). Alleen de vraag die na een hint terugkomt heeft 3 versies (zoals bij Geld).
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet, overgang) herschrijven:** niet gedaan. Die zijn van alle gouden lessen samen.
- **De uitleg "Een week eindigt met zondag. …" en "Het weekend is zaterdag en zondag." bij de 2e keer:** gebleven (ze noemen het antwoord, maar meteen daarna doet Bliepo het samen voor). Er zijn versies zonder het antwoord bij gekomen. Vraag aan Sara in KEUZES-DAGEN.md.
- **De oude les `squla-dagen.tsx` en de weektrein:** niet aangeraakt.

## 19 november 2026: "nagekeken" is weg

Opdracht van Sara: het woord "nagekeken" (en "nakijken") komt niet meer voor in wat Bliepo zegt of laat zien. Elke zin is vervangen door een andere zin die zegt dat het klopt ("Zie je, …", "Inderdaad, …"), op dezelfde plek in het rijtje (de robotplek blijft de robotplek, hooguit 1 keer per les; de grens "hooguit 2 keer per les" geldt nu voor deze zinnen: `WAS_NAKIJKEN` in squla-klok-gouden-zinnen.ts). Het gekozen antwoord staat er hooguit 1 keer in. Reden ook in WEGGEHAALD.md.

| Les | Soort | Oud | Nieuw |
|---|---|---|---|
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: dit is echt ${naam(d)}. | Zie je, je vond ${naam(d)}. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: na zondag komt echt maandag. | Zie je, de trein begint weer bij maandag. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: na ${naam(d)} komt echt ${naam(na(d))}. | Zie je, ${naam(na(d))} is de volgende dag. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: vóór maandag komt echt zondag. | Zie je, zondag is de dag ervoor. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: vóór ${naam(d)} komt echt ${naam(voor(d))}. | Zie je, ${naam(voor(d))} is de dag ervoor. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: de trein heeft weer ${g(7)} wagons. | Zie je, er hangen weer ${g(7)} wagons aan de trein. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: gisteren was echt ${naam(a)}. | Zie je, ${naam(a)} was ${g(1)} dag geleden. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: morgen is echt ${naam(a)}. | Zie je, ${naam(a)} komt over ${g(1)} dag. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: ${naam(dag)} is weekend. | Zie je, op ${naam(dag)} ben je vrij. |
| squla-dagen-van-de-week-gouden | nagekeken weg | Nagekeken: allebei de dagen van het weekend. | Zie je, je vond allebei de vrije dagen. |
