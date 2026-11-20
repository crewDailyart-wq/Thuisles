# WIJZIGINGEN-ZINNEN-GELD — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers en Meten, nu voor de gouden les Geld (`squla-geld-geldmachine-1-gouden`, "Munten en briefjes"). Geld heeft geen extra les. Andere lessen zijn niet veranderd. De oude les (`squla-geld.tsx`) is niet aangeraakt. De plaatjes van het geld zijn niet aangeraakt.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe (en in WEGGEHAALD.md). De oude versie staat ook nog in de geschiedenis (commit 9261785). Geen andere les gebruikt het zinnenbestand van Geld (nagekeken: alleen `squla-geld-gouden.tsx` en het fouttabel-script lezen `squla-geld-gouden-zinnen.ts`).

**Niet veranderd:** de 12 vragen en de 3 die terugkomen, het geld, de keuzes, de antwoorden, de volgorde en de betekenis van elke zin. De vragen zelf ("Hier ligt wat geld. Waar zie je een munt van 1 euro? Tik erop.", "Hoeveel euro is dit?", "Kijk goed. Wat is dit? Is het 1 euro, een knoop of 2 euro?", "Tik op alle munten van 1 euro.") zijn precies gelijk gebleven: ze zijn kort en helder. De vaste rijtjes van alle gouden lessen (lof, "nu is het goed", eindzinnen, groet, overgang) zijn niet aangeraakt.

**Alle varianten op een rij:** FOUTTABEL-squla-geld-geldmachine-1-gouden.md, §4 en §5.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos de munt van 2 euro." en "Je koos het briefje van 10 euro." tellen als dezelfde zin. Als het kan begint de volgende zin ook anders, en herhaalt de hint geen stuk en geen getal uit de zin ervoor. De kiezer is de gedeelde kiezer `src/components/les/lessen/nooit-dubbel.ts` (niet veranderd).

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| Je koos de munt van 2 euro. Daar staat een 2 op. | Je koos de munt van 2 euro. Kijk maar, dat getal staat erop. / Je tikte op de munt van 2 euro. Dat is ook een munt, maar een andere. / Dit is de munt van 2 euro. We zoeken een ander getal. | het getal klonk 2 keer achter elkaar |
| Je koos het briefje van 10 euro. Daar staat 10 op. | Je koos het briefje van 10 euro. Kijk maar, dat getal staat erop. / Je tikte op het briefje van 10 euro. Dat is ook een briefje, maar een ander. / Dit is het briefje van 10 euro. We zoeken een ander getal. | idem |
| Je koos 2 euro. De munt van 2 euro is goud in het midden. | Je koos 2 euro. Die munt is goud in het midden. / 2 euro? Die munt is goud in het midden. / Je tikte op 2 euro. Op dit geld staat een ander getal. | het getal klonk 2 keer achter elkaar |
| Je koos 1 euro. De munt van 1 euro is zilver in het midden. | Je koos 1 euro. Die munt is zilver in het midden. (en 2 varianten) | idem |
| Je koos 10 euro. Het briefje van 10 euro is rood. (ook 50 euro: oranje) | Je koos 10 euro. Dat briefje is rood. / 10 euro? Dat briefje is rood. / Je tikte op 10 euro. Op dit geld staat een ander getal. | idem |
| Je koos 50 cent. Op de munt van 50 cent staat een 50. | Je koos 50 cent. Die munt is helemaal goud. / 50 cent? Die munt is helemaal goud. / Je tikte op 50 cent. Op dit geld staat een ander getal. | het getal klonk 3 keer; nu zegt Bliepo hoe die munt eruitziet |
| Je koos 100 euro. Op een briefje van 100 euro staan 3 cijfers. (ook 50 euro: 2 cijfers) | Je koos 100 euro. Dat getal heeft 3 cijfers. / 100 euro? Dat schrijf je met 3 cijfers. / Je tikte op 100 euro. In dat getal staan 3 cijfers. | het getal klonk 2 keer achter elkaar |
| Je keek weer alleen naar het eerste cijfer. | Je koos weer het getal met 2 cijfers. / Weer het getal met 2 cijfers, zie ik. | "weer" kwam uit het niets: de 1e keer zei Bliepo "2 cijfers", niet "het eerste cijfer" |
| De munt van 1 euro is zilver in het midden, die van 2 euro is goud. | De munt van 1 euro is zilver in het midden. Die van 2 euro is goud. | te lange zin (16 woorden); nu 2 korte |
| Alleen een munt met een 1 is 1 euro. | Op de munten die we zoeken staat een 1. / We zoeken alleen de munten met een 1 erop. | het getal klonk 2 keer achter elkaar |
| Hier is de munt van 1 euro. Hij is rond, met een 1 erop. | Hier is de munt van 1 euro. Hij is rond, en het getal staat erop. / Kijk, deze munt is rond. Er staat een 1 op. / Hier ligt de munt van 1 euro. Kijk maar naar het getal. | het getal klonk 2 keer achter elkaar |
| Hier is het briefje van 10 euro. Het is een rechthoek, met 10 erop. | Hier is het briefje van 10 euro. Het is van papier, en het getal staat erop. / Kijk, dit briefje is een rechthoek. Er staat 10 op. / Hier ligt het briefje van 10 euro. Kijk maar naar het getal. | idem |
| Tik jij op de munt van 1 euro? (samen, bij "Waar zie je …?") | Tik jij op het geld in het rondje? / Nu jij! Tik op de munt in het rondje. | het bedrag was net gezegd; nu zegt de zin ook waar (BOUWREGELS 15.37) |
| Er staat een 1 op. Het is de munt van 1 euro. | Er staat een 1 op. Zoveel euro is hij waard. / Kijk naar het getal: 1. Zoveel euro is dit. / Het getal op deze munt is 1. Zoveel euro is het. | het getal klonk 2 keer achter elkaar |
| Er staat 10 op. Het is het briefje van 10 euro. | Er staat 10 op. Zoveel euro is het waard. (en 2 varianten) | idem |
| Tik jij op de munt van 1 euro? (samen, bij "Wat is dit?") | Tik jij op de munt? / Nu jij! Tik op de munt. (bij een briefje: "het briefje") | het bedrag was net gezegd |
| We zoeken het samen. | Weet je wat? We zoeken het samen. / Geeft niks. We zoeken het samen. / Ik help je even. We kijken samen. | warmer; "geeft niks" zegt Synthesis hier ook |
| We zoeken het samen. (bij "Wat is dit?") | Weet je wat? We kijken samen naar het geld. / Geeft niks. We kijken samen. / Ik help je even. We lezen het getal samen. | bij "Wat is dit?" ligt er maar 1 ding: er valt niets te zoeken |
| Wat is het? (na de hint bij vraag 4) | Hoeveel euro is dit? / Hoeveel euro is dit, denk je? / Kies nog een keer. Hoeveel euro is dit? | vraag 4 vraagt "Hoeveel euro is dit?"; dezelfde vraag houdt dezelfde woorden |
| Een briefje is van papier, met 4 hoeken. | dezelfde zin; het getal 4 is nu wit | elk getal heeft bewust een kleur of wit (BOUWREGELS 14.20) |
| Er komt nog 1 vraag van net terug. / Nu komen er nog 3 vragen van net terug. | blijven, en erbij: We doen nog 1 vraag van net. / Nog 1 vraag van net. Die oefenen we nog even. (zo ook met 3) | warmer ("we") |
| 2e keer, een ander antwoord: de eerste zin begon altijd met "Nu koos je …" | de les kiest altijd een andere eerste zin dan de 1e keer; "Nu koos je …" is 1 van de versies | nooit 2 keer hetzelfde |
| De hint hing vast aan het nummer van de vraag (bij vraag 1 altijd dezelfde) | de les kiest steeds een andere hint | idem |
| Na "Al 3 goed achter elkaar!" kon "Ja, je vond ze alle 3." komen | de les kiest dan een zin zonder dat getal | het getal klonk 2 keer achter elkaar |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| In deze les ontdek je hoeveel munten en briefjes waard zijn. Je kijkt naar het getal op het geld. (door Sara goedgekeurd) | blijft, en erbij: Vandaag kijken we naar munten en briefjes. Het getal op het geld zegt hoeveel het waard is. / We gaan samen geld bekijken: munten en briefjes. Op het geld staat een getal. | warmer begin, zoals de andere lessen |
| Waar zie je een munt van 1 euro? (na de hint) | blijft, en erbij: Waar ligt de munt van 1 euro? Tik erop. / Zoek nog eens de munt van 1 euro. Tik erop. | variatie (3) |
| Wat is het? (na de hint) | blijft, en erbij: Wat is het, denk je? / Kies nog een keer. Wat is het? | variatie (3) |
| Oei, het geld zweeft! Er zweven 3 munten van 1 euro. | blijft, en erbij: Oei, kijk nou! Het geld zweeft. Er zijn 3 munten van 1 euro bij. | variatie |
| Tik op alle munten van 1 euro. | blijft, en erbij: Zoek ze allemaal. Tik op elke munt van 1 euro. | variatie |
| Tik op een munt van 1 euro. (hulphandje) | blijft, en erbij: Tik maar op een munt van 1 euro. | variatie |
| Je bent goed bezig. / Jij kunt dit. (hulphandje) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (dezelfde 5 als bij Tellen) |
| Kom, we kijken samen. / Kom, samen lukt het. | blijven (zie ook deel A) | 5 versies in plaats van 3 |
| Tik op het geld in het rondje. / Tik op de munt. / Tik op de munt in het rondje. (hulphandje) | blijven, en erbij steeds: Tik maar op … | variatie |
| Ja, dat is de munt van 1 euro. | blijft, en erbij: Goed zo! Dat is de munt van 1 euro. / Precies, daar ligt de munt van 1 euro. | variatie (3) |
| Kijk, hier is de munt van 1 euro. (Bliepo deed het zelf) | blijft, en erbij: Kijk, ik tik hem aan. Dit is de munt van 1 euro. | variatie; Bliepo zegt wat hij doet |
| Dit geld is rond. Het is een munt. | blijft, en erbij: Kijk naar de vorm. Dit geld is rond, dus het is een munt. / Dit is een munt. Dat zie je, want hij is rond. | variatie (3) |
| Dit geld is een rechthoek van papier. Het is een briefje. | blijft, en erbij: Kijk naar de vorm. Dit geld heeft 4 hoeken. Het is een briefje. / Dit is een briefje. Het is plat en van papier. | variatie (3) |
| Ja, dit is 10 euro. | blijft, en erbij: Goed zo! Dit is 10 euro. / Precies! Het is 10 euro. | variatie (3) |
| Kijk, dit is 10 euro. (Bliepo deed het zelf) | blijft, en erbij: Kijk, ik tik erop. Dit is 10 euro. | variatie |
| Hier is een munt van 1 euro. | blijft, en erbij: Kijk, dit is een munt van 1 euro. / Deze munt is 1 euro. | variatie (3) |
| En hier nog een. | blijft, en erbij: En deze ook. / En kijk, hier ligt er ook een. | variatie (3) |
| Er is er nog 1. Tik jij erop? | blijft, en erbij: Nu jij! Tik op de laatste munt, in het rondje. / Nog 1 munt. Tik jij op de munt in het rondje? | variatie (3) |
| Ja, nu heb je alle 3 munten van 1 euro. | blijft, en erbij: Goed zo! Dat zijn alle 3 munten van 1 euro. / Precies, nu zijn ze er alle 3. | variatie (3) |
| Kijk, dit is de laatste munt van 1 euro. | blijft, en erbij: Kijk, ik tik hem aan. Dit is de laatste munt van 1 euro. | variatie |
| Je koos weer de munt van 2 euro. (hetzelfde antwoord 2 keer) | blijft, en erbij: Je tikte weer op de munt van 2 euro. / Weer de munt van 2 euro, zie ik. | variatie (3) |
| Nog 1 vraag om te oefenen. / We oefenen er nog 3 van net. | blijven, en erbij: We oefenen nog 1 vraag. / Nog 3 vragen om te oefenen. | variatie |
| Die oefenen we een andere keer nog eens. | blijft, en erbij: Dit oefenen we een andere keer nog eens. Dat komt goed. | variatie; geruststellend |
| Nu ken je de munten en de briefjes. | blijft, en erbij: Je hebt goed gewerkt vandaag! Je kent nu de munten en de briefjes. / Mooi gewerkt! Je weet nu hoe je ziet hoeveel geld het is. | variatie; vrolijker |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie (zoals de andere lessen) |
| Je koos een briefje van 5 euro. Dat is geen munt. | blijft, en erbij: Je tikte op een briefje van 5 euro. Maar we zoeken een munt. / Dit is een briefje van 5 euro. Een munt ziet er anders uit. | variatie (3) |
| Je koos het briefje van 50 euro. Op dat briefje staan 2 cijfers. | blijft, en erbij: Je tikte op het briefje van 50 euro. Dat getal heeft 2 cijfers. / Dit is het briefje van 50 euro. Dat getal schrijf je met 2 cijfers. | variatie (3) |
| Je koos 1 euro. Dat is een munt. | blijft, en erbij: 1 euro? Dat is een munt. Die is rond. / Je tikte op 1 euro. Maar dat is een munt. | variatie (3) |
| Je koos een knoop. Een knoop heeft gaatjes. | blijft, en erbij: Je tikte op de knoop. Maar een knoop heeft gaatjes. / Een knoop? Daar zitten gaatjes in. Hier niet. | variatie (3) |
| Je tikte op een knoop. Met een knoop kun je niet betalen. | blijft, en erbij: Dat is een knoop. Daar kun je niet mee betalen. / Je tikte op de knoop. Die heeft gaatjes, een munt niet. | variatie (3) |
| Je tikte op de munt van 2 euro. | blijft, en erbij: Kijk, dat is de munt van 2 euro. / Dat is de munt van 2 euro. Die zoeken we niet. | variatie (3) |
| Alle hints (2 of 3 per soort) | blijven, en per soort 1 erbij, zoals: Een munt is rond. Een briefje niet. / Een briefje is van papier. Een munt niet. / Op elke munt staat een getal. Lees ze maar. / Een getal kan meer cijfers hebben. Lees ze allemaal. / Dit geld is niet rond. Het is een briefje. Lees het getal erop. / Welke kleur heeft dit briefje? Lees ook het getal. / Dit is een munt. Er staat een getal op. Lees het maar. | variatie (3 of 4); geen hint eindigt met een vraag, want de vraag komt er meteen achter |
| Tik alleen op munten met een 1 erop. / Zoek de munten met een 1. Die zijn zilver in het midden. (hint bij de zwevende munten) | blijven, en erbij: Lees het getal op elke munt. Tik op de munten met een 1. / Zoek de munten met een 1 erop. Tik ze aan. | variatie (4); elke versie zegt wat het kind doet |
| Alle uitleg bij de 2e keer (1 of 2 per soort) | blijft, en per soort 1 of 2 erbij: Geld dat rond is, is een munt. / Geld van papier is een briefje. / Op geld staat altijd een getal. Zo weet je hoeveel het is. / Met een 0 erachter is het een ander getal. / Een knoop zit aan je jas. Het is geen geld. / Met een knoop kun je niets kopen. | variatie (3) |
| Je koos weer een briefje. / Je koos weer een munt met een ander getal. / Je tikte weer op de knoop. / Je tikte weer op een andere munt. | blijven, en erbij steeds: Weer …, zie ik. (en soms: Dit is ook weer een briefje.) | variatie (2 of 3) |
| Briefjes zijn rechthoeken, munten niet. / Munten zijn rond, briefjes niet. / Dit geld is een rechthoek, geen rondje. / Elk briefje heeft een eigen kleur en een eigen getal. / Ook de 0 hoort bij het getal. / Een knoop is geen geld. (uitleg bij "weer") | blijven, en erbij: Een briefje is niet rond. / Een munt is niet van papier. / Dit geld is van papier. Het is geen munt. / Niet elk briefje is evenveel waard. / Niet elke munt is evenveel waard. / Een 0 erachter maakt een ander getal. / Met een knoop kun je niets kopen. | variatie (2) |
| Reactie na lof: 5 zinnen per soort | blijven, en erbij 2: Precies, … / Dat klopt, … (bijvoorbeeld: Precies, dit is 10 euro. / Dat klopt, het is de munt van 1 euro.) | variatie (7); "Precies" zoals bij Plussommen en Meten |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een antwoord dat niet goed is | 3 per soort (bij een ander antwoord de 2e keer 4, met "Nu koos je …") |
| Hint | 3 of 4 per soort |
| De vraag opnieuw na de hint | 3 per soort vraag |
| Uitleg bij de 2e keer | 3 per soort |
| "Weer …" (2 keer dezelfde denkfout) | 2 of 3, met 2 soorten uitleg |
| Hetzelfde antwoord 2 keer ("Je koos weer …") | 3 |
| "Kom, we kijken samen." | 5 per soort vraag |
| Samen: wat Bliepo laat zien | 3 |
| Samen: nu het kind ("Tik jij op …?") | 2 of 3 |
| Hulphandje: aanmoediging en wat te doen | 5 en 2 |
| Klaar met samen voordoen | 3 |
| Bliepo doet de stap zelf (vangnet) | 2 |
| Zin na lof | 7 per soort |
| Begin, vragen die terugkomen, slot | 3, 2 of 3, en 3 |
| "Tik op de kaart." | 3 |
| Lof, korte bevestiging, eindzin, overgang | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) |

## De fouttabel is strenger gemaakt (zoals bij Tellen)

Het script `scripts/fouttabel-geld-gouden.ts` loopt nu ALLE varianten na, voor elk antwoord dat een kind kan geven (25 antwoorden die niet goed zijn, in 12 vragen):

- **Verklappen (15.17):** geen enkele eerste zin of hint noemt het goede geld of het getal erop. Het getal dat het kind zoekt is wit. Na elke eerste zin met hint blijven er minstens 2 keuzes over (ook als de hint zegt "we zoeken een munt": dan liggen er nog 2 munten). Het rondje staat nooit om het antwoord.
- **Waarheid:** 623 zinnen nagelopen tegen het beeld van de vraag en wat het kind koos. "Die munt is goud in het midden" alleen bij 2 euro, "dat briefje is rood" alleen bij 10 euro, "2 cijfers" alleen als dat getal 2 cijfers heeft, "elke munt" alleen als er 2 munten liggen, enzovoort. Een zin die het script niet kent, telt als niet goed.
- **Geen opdracht bij de 2e keer**, nooit het woord "fout", **geen getal 2 keer in 1 stuk**, geen zin langer dan 14 woorden, hooguit 3 zinnen per stuk, elk getal heeft een kleur of wit.
- **Altijd een vraag of opdracht in beeld (15.37, F16):** na de hint komt de vraag terug. Elke versie daarvan heeft een vraagteken of zegt wat het kind doet ("Tik …", "Zoek …", "Kies …"). Ook elke vraag, elke stap bij samen voordoen en elke zin van het hulphandje is zo nagelopen. Het woord "vinkje" komt nergens voor. Geen hint eindigt zelf met een vraag (dan zouden er 2 vragen achter elkaar staan).
- **Past in het tekstvak:** elk stuk is hooguit 123 tekens (de grens van Meten; de langste oude stukken waren korter). Die eis gaat vooraf uit de lijst, niet als wens aan de kiezer. Bij elke hint passen minstens 2 versies van de vraag erachter. De nieuwe beginzinnen zijn niet langer dan de zin die Sara goedkeurde.
- **"Weer" alleen als het klopt:** elke "weer"-zin heeft het woord "weer", en komt alleen bij hetzelfde antwoord of dezelfde denkfout.
- **Nooit 2 keer hetzelfde:** de kiezer is 20.000 keer nagespeeld (28.730 reacties) met willekeurige antwoorden: 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een getal of een stuk zin herhaald, 0 keer dezelfde eerste zin bij de 1e en de 2e keer van 1 vraag, 0 keer te lang, altijd een vraag of opdracht.

## Zinnen van Synthesis

Synthesis heeft geen les over geld (KOPPELING.md §8). Er is dus geen les-eigen zin van Synthesis overgenomen. Alleen de algemene tutorzin "geeft niks" (bij de 2e keer, zoals in Tellen en Meten) komt van Synthesis: "Geeft niks. We zoeken het samen."

## Niet gedaan, met reden

- **De vragen zelf afwisselen** ("Waar zie je …?", "Wat is dit?"): niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11) en de inhoud blijft die van Squla (15.22).
- **"Is het 5 euro, 50 euro of 50 cent?"**: het getal 50 staat er 2 keer, maar dat zijn de 3 keuzes van de oude les. Niet veranderd.
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet, overgang) herschrijven:** niet gedaan. Die zijn van alle gouden lessen samen.
- **"En hier nog een."** (Bliepo wijst de 2e munt aan): gebleven. Vraag aan Sara in KEUZES-GELD.md.
- **Het woord "rechthoek":** gebleven, met een versie zonder dat woord erbij ("van papier, met 4 hoeken"). Vraag aan Sara in KEUZES-GELD.md.
- **Een aanmoediging met de naam van het kind bij een antwoord dat niet goed is:** niet gedaan (BOUWREGELS 3.17).
- **De oude les `squla-geld.tsx` en de plaatjes van het geld:** niet aangeraakt.

## 19 november 2026: "nagekeken" is weg

Opdracht van Sara: het woord "nagekeken" (en "nakijken") komt niet meer voor in wat Bliepo zegt of laat zien. Elke zin is vervangen door een andere zin die zegt dat het klopt ("Zie je, …", "Inderdaad, …"), op dezelfde plek in het rijtje (de robotplek blijft de robotplek, hooguit 1 keer per les; de grens "hooguit 2 keer per les" geldt nu voor deze zinnen: `WAS_NAKIJKEN` in squla-klok-gouden-zinnen.ts). Het gekozen antwoord staat er hooguit 1 keer in. Reden ook in WEGGEHAALD.md.

| Les | Soort | Oud | Nieuw |
|---|---|---|---|
| squla-geld-geldmachine-1-gouden | nagekeken weg | Nagekeken: alle ${n} zijn ${kn(v.zoek)} euro. | Inderdaad, elke munt die je vond is ${kn(v.zoek)} euro. |
| squla-geld-geldmachine-1-gouden | nagekeken weg | ${kn(d)} ${e}, op een rechthoek van papier. / Nagekeken: het is precies ${kn(d)} ${e}. | ${kn(d)} ${e}, op een rechthoek van papier. / Zie je, ${kn(d)} ${e} is een briefje, geen munt. |
| squla-geld-geldmachine-1-gouden | nagekeken weg | ${kn(d)} ${e}, en hij is rond. / Nagekeken: het is precies ${kn(d)} ${e}. | ${kn(d)} ${e}, en hij is rond. / Zie je, ${kn(d)} ${e} is een munt, geen briefje. |


## 20 november 2026: niets zweeft (keuring KEURING-GELD-20NOV.md, BOUWREGELS 15.36, 15.48)

In de gouden les liggen de munten stil in 6 vakjes. Zelfde plek, zelfde functie.

| Plek (`squla-geld-gouden-zinnen.ts`) | Oud | Nieuw |
|---|---|---|
| `bellenIntro` versie 1 | Oei, het geld zweeft! Er zweven 3 munten van 1 euro. | Kijk, hier ligt geld. Er zijn 3 munten van 1 euro bij. |
| `bellenIntro` versie 2 | Oei, kijk nou! Het geld zweeft. Er zijn 3 munten van 1 euro bij. | Kijk eens, wat veel geld! Daartussen liggen 3 munten van 1 euro. |
