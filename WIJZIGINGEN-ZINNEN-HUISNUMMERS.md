# WIJZIGINGEN-ZINNEN-HUISNUMMERS — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Bij Tellen vond Sara dat goed gelukt; dit is **precies dezelfde aanpak voor Huisnummers**: de gouden les `squla-huisnummers-gouden` ("Huisnummers: wat komt erna?"). Er is geen extra les bij Huisnummers. Andere lessen zijn niet veranderd.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe, en met de reden in WEGGEHAALD.md. Geen andere les gebruikt dit zinnenbestand (nagekeken met een zoekopdracht), dus er is geen apart bewaarbestand nodig. De oude versie staat in Git (de commit vóór deze). Terugzetten kan dus altijd.

**Niet veranderd:** de 17 vragen, de getallen, de antwoorden, de keuzes, de volgorde en wat het kind moet doen. De vragen "Welk huisnummer komt na 7?", "Welk huisnummer komt voor 12?", "Welk huisnummer hoort bij het vraagteken?", "Sleep het goede huis naar de lege plek.", "Welk huisnummer komt dan?" en "Typ het nummer." zijn precies gelijk gebleven.

**Alle nieuwe varianten op een rij:** FOUTTABEL-squla-huisnummers-gouden.md (§2, §5 en §6).

## Hoe "nooit 2 keer hetzelfde" werkt

Voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer. Dat geldt ook over vragen heen. "Je koos 9." en "Je koos 27." tellen als dezelfde zin. Als het kan begint de volgende zin ook anders. De kiezer is dezelfde als bij Tellen en Splitsen (`src/components/les/lessen/nooit-dubbel.ts`); dat bestand is niet veranderd.

Nieuw bij deze les: **een getal klinkt nooit 2 keer vlak achter elkaar.** Noemt de eerste zin een getal ("9 ligt 1 huis te ver."), dan kiest de les een hint zonder dat getal. En de vraag die na de hint terugkomt, herhaalt geen getal uit de hint.

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze straat mist steeds 1 huisnummer. Jij zoekt welk nummer daar hoort. | Vandaag zoeken we huisnummers. In elke straat ontbreekt er 1. / We gaan samen huisnummers zoeken. In elke straat ontbreekt 1 nummer. | warmer, zoals een juf begint ("we"); "ontbreekt" in plaats van "mist" |
| En nu de huisnummers tot 50. | We gaan nog een stukje verder. Nu komen de huisnummers tot 50. | geen hele zin; de eerste zin is van Synthesis, in het Nederlands |
| Er mist 1 huis in de straat. | Er ontbreekt 1 huis in de straat. | juf-Nederlands: "ontbreekt" in plaats van "mist" |
| Nu lopen we terug. (3 keer in de les precies zo) | Nu lopen we terug. / We lopen terug door de straat. / Kom, we lopen terug langs de huizen. | Bliepo zei deze zin 3 keer precies hetzelfde |
| (na de hint) Welk nummer komt er na 7? | Probeer het nog eens. Welk nummer hoort bij het vraagteken? (4 beginzinnen, 3 vragen) | warmer ("Probeer het nog eens." is van Synthesis); het getal 7 stond net al in de hint |
| (na de hint, typen) Welk nummer komt er na 19? Typ het nummer. | Toe maar, probeer het nog eens. Typ het nummer dat na 19 komt. / … Typ het nummer bij het vraagteken. | 1 zin in plaats van 2; "nummer" stond er 2 keer |
| Begin bij 7. Welk nummer zeg je daarna? (hint) | Begin bij 7 en tel 1 verder. | de hint eindigde met een vraag en meteen daarna kwam de vraag nog een keer |
| Zeg de nummers hardop tot 7. Welk nummer zeg je dan? (hint) | Zeg de nummers hardop, van links naar rechts. Tel dan gewoon verder. | zelfde reden; nu ook zonder getal |
| Er komt steeds 1 bij. Begin bij 9. Welk nummer zeg je daarna? (hint) | Er komt steeds 1 bij. Kijk naar huis 9 en tel verder. | zelfde reden |
| Tel terug vanaf 27. Welk nummer zeg je dan? (hint) | Zeg de nummers hardop, van rechts naar links. Zo tel je terug. | zelfde reden |
| Kijk naar het huis links van het vraagteken. Begin bij 7 en tel 1 verder. (hint) | Kijk naar het huis links van het vraagteken. Tel vanaf dat huis verder. | zonder getal, voor als de eerste zin het getal al noemde |
| Er gaat steeds 1 af. Begin bij 27 en tel 1 terug. (hint) | Er gaat steeds 1 af. Kijk naar huis 27 en tel terug. | het getal 1 stond 2 keer achter elkaar |
| Je typte 2. De huisnummers hier hebben 2 cijfers. | Je typte 1 cijfer. De huisnummers hier hebben er 2. / Ik zie maar 1 cijfer. Op de bordjes staan er steeds 2. / 2? Dat is nog maar het begin van het nummer. | het getal 2 stond 2 keer achter elkaar |
| De 2 cijfers staan andersom. | De cijfers staan andersom. / Je hebt de goede cijfers, maar ze staan omgedraaid. | vaak 2 keer een 2 achter elkaar ("… beginnen met een 2. De 2 cijfers …") |
| Je draaide de cijfers weer om. | Je hebt de cijfers weer omgedraaid. / De cijfers staan weer andersom. / Weer andersom, zie ik. | natuurlijker Nederlands |
| Je sloeg weer een huis over. | Je hebt weer een huis overgeslagen. / Weer een huis te ver, zie ik. / Dat is weer net te ver. | natuurlijker Nederlands |
| Je telde weer verder in plaats van terug. | Je hebt weer verder geteld in plaats van terug. / Weer de andere kant op, zie ik. / Dat is weer verder tellen. | natuurlijker Nederlands |
| Je typte weer een nummer van vóór de straat. | Je typte weer een nummer dat voor de straat komt. / Weer de andere kant op, zie ik. / Dat is weer terug tellen. | "van vóór de straat" is geen juf-Nederlands |
| Je koos weer een nummer van het begin. | Je koos weer een nummer dat aan het begin hoort. / Dat nummer hoort weer aan het begin van de straat. / Weer een nummer van het begin, zie ik. | onduidelijke zin |
| Kijk alleen naar de huizen naast het gat. | Kijk alleen naar de huizen naast het vraagteken. / De buren van het vraagteken helpen je. | het kind ziet geen "gat" maar een vraagteken (of een lege plek) |
| Tel elk huis mee: steeds 1 verder. | We tellen elk huis mee: steeds 1 verder. / We gaan maar 1 huis verder, niet meer. | het was een opdracht, maar Bliepo gaat daarna zelf tellen; nu "we" |
| Tel maar 1 stap verder. | We tellen maar 1 stap verder. / We gaan maar 1 huis verder. | zelfde reden |
| We tellen samen langs de huizen. Kom, we tellen samen. Ik tel langs de huizen. | (een zin uit het vaste rijtje) Kom, we tellen samen. Ik tel langs de huizen. | Bliepo zei 3 keer bijna hetzelfde achter elkaar |
| Kom, we tellen samen. (alleen deze) | Kom, we tellen samen. / Weet je wat? We tellen samen. / Geeft niks. We tellen samen. / Ik help je even. We tellen samen. / Laten we samen tellen en kijken. | te kaal en steeds hetzelfde; nu warmer (dezelfde 5 als bij Tellen) |
| En dan 8. Na 7 komt 8. | En dan 8! Dat is het nummer dat we zoeken. / En dan komt 8. Dat nummer hoort op het bordje. / En daarna 8. Dat nummer komt erna. | het getal 8 stond 2 keer achter elkaar, en 7 had Bliepo net geteld |
| En dan 16. 16 hoort tussen 15 en 17. | En dan 16! Dat is het nummer dat we zoeken. / … / En daarna 16. Dat nummer komt ertussen. | zelfde reden |
| En dan 10. Hier hoort huis 10. | En dan 10! Dat huis zoeken we. / En dan komt 10. Dat huis ontbreekt nog. / En daarna 10. Dat huis hoort op de lege plek. | zelfde reden |
| Tik jij op het huis met 8? | Tik jij op het huis met het nieuwe nummer? / Nu jij. Tik op het huis met het nieuwe nummer. / Zie je het nieuwe nummer? Tik op dat huis. | Bliepo zei het nummer net al |
| Hier moet een huis staan. (bij het hulphandje) | Hier moet een huis staan. Welk huis past hier? / Sleep het goede huis naar deze plek. / Kijk, deze plek is leeg. Sleep het goede huis erheen. | de zin zei niet wat het kind moet doen, terwijl de les op het kind wacht |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| 9 staat al in de straat. / Huis 9 is er al. / Kijk, 9 staat er al. (per vraag 1 vaste) | blijven, en erbij: Je koos 9. Dat nummer zie je al in de straat. / 9? Dat huis staat er al. De les kiest nu zelf, steeds een andere. | variatie (nu 5) |
| Met 9 sla je een huis over. / 9 ligt 1 huis te ver. / Bij 9 ga je een huis te ver. (per vraag 1 vaste) | blijven, en erbij: Je koos 9. Je ging een beetje te ver. / 9? Dat is net 1 huis te ver. | variatie (nu 5); de eerste is van Synthesis |
| Je sleepte huis 42. De nummers hier beginnen met een 2. (alleen deze) | blijft, en erbij: Huis 42? In deze straat begint elk nummer met een 2. / Je sleepte huis 42. Kijk naar de buren: die beginnen met een 2. | variatie |
| Je koos 43. Kijk goed welk cijfer vooraan hoort. (alleen deze) | blijft, en erbij: 43? Kijk nog eens welk cijfer vooraan staat. / Je koos 43. Let goed op het eerste cijfer. | variatie |
| Na 39 komt een groter nummer dan 30. (alleen deze) | blijft, en erbij: 30? Na 39 komt een groter nummer. / Je koos 30. Dat nummer is te klein. | variatie |
| 38 begint met een 3. De huizen ernaast beginnen met een 2. (alleen deze) | blijft, en erbij: Je koos 38. Kijk naar de buren: die beginnen met een 2. / 38? De huizen ernaast beginnen met een 2. | variatie |
| 30 komt na 29. We lopen terug. (alleen deze) | blijft, en erbij: Je koos 30. Dat nummer komt pas na 29. / 30? Zo tel je verder, maar wij tellen terug. | variatie |
| 24 ligt te ver van 19 af. (alleen deze) | blijft, en erbij: Je typte 24. Zo ver hoeven we niet te tellen. / 24? Dat is te ver geteld. | variatie |
| 19 komt na 18, aan het eind van de straat. (alleen deze) | blijft, en erbij: Je koos 19. Dat nummer komt pas na 18. / 19? Dat hoort helemaal aan het eind van de straat. | variatie |
| Huis 37 past niet op deze plek. / Huis 37 hoort hier niet. (2) | blijven, en erbij: Je sleepte huis 37. Dat huis past hier niet. / Kijk, huis 37 past hier niet. | variatie (nu 4) |
| Je koos 44. Dat nummer hoort hier niet. / 44 past hier niet. (2; komt nu alleen bij slepen voor) | blijven, en erbij: 44? Dat nummer past niet bij het vraagteken. | variatie (nu 3) |
| De uitleg bij de 2e keer (per denkfout 1 zin) | elke zin blijft, en er is er steeds 1 of 2 bij. Bijvoorbeeld: "Elk nummer staat maar 1 keer in de straat." + "In een straat heeft elk huis een eigen nummer." | variatie (nu 2 of 3) |
| "Weer …" bij 2 keer dezelfde denkfout (1 zin + 1 uitleg) | 3 zinnen + 2 soorten uitleg per denkfout | variatie |
| Je koos weer 9. / Je typte weer 9. / Je sleepte weer huis 9. (elk 1) | blijven, en erbij: Je tikte weer op 9. / Weer 9, zie ik. / Daar is 9 weer. | variatie (nu 3) |
| Ik tel langs de huizen. (alleen deze) | blijft, en erbij: Ik wijs elk huis aan en zeg het nummer. / Ik tel hardop langs de huizen. Tel maar mee! | variatie |
| Ik tel terug, van rechts naar links. (alleen deze) | blijft, en erbij: Ik loop terug en zeg elk nummer. / Ik tel hardop terug. Tel maar mee! | variatie |
| Sleep jij huis 10 naar de lege plek? (alleen deze) | blijft, en erbij: Nu jij. Sleep huis 10 naar de lege plek. | variatie |
| Tik op het huis met 8. / Sleep huis 10 hierheen. (bij het hulphandje, elk 1) | blijven, en erbij: Tik op het huis met het nieuwe nummer. / Pak huis 10 en sleep het naar de lege plek. | variatie |
| Ja, dat is huis 8. (alleen deze) | blijft, en erbij: Precies, daar staat huis 8. / Samen is het gelukt: dat is huis 8. | variatie |
| Ja, huis 10 staat op zijn plek. (alleen deze) | blijft, en erbij: Precies, daar hoort huis 10. / Samen is het gelukt: huis 10 staat erbij. | variatie |
| Kijk, hier staat huis 8. / Kijk, huis 10 staat nu op zijn plek. (elk 1) | blijven, en erbij: Kijk, dit is huis 8. / Kijk, ik zet huis 10 op de lege plek. | variatie |
| Je bent goed bezig. / Jij kunt dit. (2) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (nu 5) |
| De zin met het nummer na lof (6 zinnen) | alle 6 blijven, en erbij: Precies, nummer 8. / Dat klopt, het is nummer 8. / Op het bordje hoort 8. | variatie (nu 9); "precies" en "dat klopt" zijn van Synthesis |
| Je weet nu welk huisnummer erna, ervoor en ertussen komt. (alleen deze) | blijft, en erbij: Knap, hoor! Je weet welk huisnummer erna, ervoor en ertussen komt. / Wat heb jij goed geteld: verder en terug, tot wel 50! | variatie; vrolijker |
| Tik op de kaart. (alleen deze) | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een antwoord dat niet goed is | 3 per denkfout; 5 bij "staat er al" en bij "1 huis te ver" |
| Hint | 5 (2 zonder getal) |
| Uitleg bij de 2e keer | 2 of 3 (4 bij "maar 1 cijfer getypt") |
| "Weer …" (2 keer dezelfde denkfout) | 3, met 2 soorten uitleg |
| Hetzelfde antwoord 2 keer ("Je koos weer …") | 3 |
| Begin van een nieuwe poging ("Probeer het nog eens.") | 4 |
| De vraag bij een nieuwe poging | 3 per soort vraag (2 bij slepen) |
| "Kom, we tellen samen." | 5 |
| Bliepo telt ("Ik tel langs de huizen.") | 3 |
| Bij het vraagteken ("En dan 8! …") | 3 |
| De kleine stap van het kind | 3 (2 bij slepen) |
| Klaar met samen tellen | 3 |
| Bliepo doet de stap zelf (vangnet) | 2 |
| Hulphandje: aanmoediging | 5 |
| Hulphandje: wat te doen | 3 (slepen), 2 (samen tellen) |
| "Nu lopen we terug." | 3 |
| Zin met het nummer na lof | 9 |
| Begin en slot | 2 en 3 |
| "Tik op de kaart." | 3 |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) |

## De opdrachtzinnen zelf (regel 15.36)

Extra nagelopen: helder, kort, juf-Nederlands, en de zin zegt wat het kind echt doet.

- **De 5 vragen van de les** bleven precies gelijk: ze zijn kort en duidelijk, en dezelfde soort vraag heet overal hetzelfde (3.11).
- **De vraag na een hint** was de oude vraag met "er" erin ("Welk nummer komt er na 7?"). Nu begint Bliepo warm ("Probeer het nog eens.") en vraagt hij het echt anders: "Welk nummer hoort bij het vraagteken?"
- **Typen na een hint:** 1 zin in plaats van 2: "Typ het nummer dat na 19 komt."
- **De kleine stap bij samen tellen:** "Tik jij op het huis met het nieuwe nummer?" (zonder het nummer nog een keer).
- **Het hulphandje bij slepen** zegt nu ook wat je doet: "Sleep het goede huis naar deze plek."
- **"Missen" is overal "ontbreken" geworden.**
- Het fouttabel-script keurt nu ook de opdrachtzinnen: hooguit 14 woorden per zin, geen "missen", nooit "fout", en elke opdrachtzin is een vraag of zegt wat het kind doet.

## Geen disco of feest

Nagekeken: komt nergens voor in deze les.

## Fouttabel: strenger gemaakt (zoals bij Tellen en Splitsen)

Het fouttabel-script keurt nu **alle varianten** (919 zinnen), niet alleen 1 voorbeeld per antwoord:
- geen variant van de eerste zin of de hint noemt het antwoord, noemt 2 buren tegelijk of zegt hoe ver het kind ernaast zit (15.17);
- elke bewering is waar, voor elk getal dat een kind kan typen (0 tot 99): "te klein" alleen als het te klein is, "staat er al" alleen als het er staat, "Je typte" alleen bij typen;
- geen getal 2 keer in 1 zin; bij elke eerste zin passen minstens 2 hints en 2 uitleggen zonder herhaald getal;
- geen hint eindigt met een vraag; de zinnen bij de 2e keer zijn uitleg, geen opdracht;
- nooit het woord "fout"; hooguit 14 woorden per zin en 2 zinnen per stuk;
- genoeg varianten per situatie;
- de kiezer is 20.000 keer nagespeeld: 0 keer 2 keer achter elkaar dezelfde zin, 0 keer een getal 2 keer vlak achter elkaar, en de 2e keer nooit dezelfde eerste zin als de 1e keer.

## 2 kleine reparaties die erbij kwamen

- **"Weer te groot" klopte niet altijd.** Typte een kind eerst 10 en dan 30 (het antwoord is 20), dan zei Bliepo "Je typte weer een te groot nummer." Nu zegt hij "weer" alleen als het de 1e keer ook te groot was.
- **Het rode rondje** om het buurhuis komt nu alleen als de hint dat huis noemt (regel 7.8). Bij de hint "Zeg de nummers hardop, van links naar rechts." staat er geen rondje.

## Niet gedaan, met reden

- **De 5 vragen van de les afwisselen:** niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11).
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) herschrijven:** niet gedaan. Die staan in BLIEPO-KARAKTER.md en worden door alle gouden lessen gebruikt. Ze wisselen al zonder herhaling.
- **Zeggen dat de cijfers andersom staan bij de 1e keer (42 voor 24):** niet gedaan. Dan weet het kind meteen het antwoord (15.17). Bliepo zegt het pas bij de uitleg van de 2e keer.
- **Het nummer weglaten bij "Sleep jij huis 10 naar de lege plek?":** niet gedaan. Het kind kiest daar uit 3 huizen en moet weten welk huis. Het nummer staat wel maar 1 keer in de zin.
- **"Kijk, op 1 bordje staat een vraagteken." en "Nu komen er grotere huisnummers." veranderen:** niet gedaan. Dat zijn gewone, duidelijke zinnen.
- **Een naam bij een antwoord dat niet goed is:** niet gedaan (BOUWREGELS 3.17).
- **Synthesis: "39? heel dichtbij, maar je zit er 1 onder":** niet overgenomen. Dan weet het kind het antwoord (15.17).
- **Synthesis: "je zit er 10 onder" als eerste zin:** niet overgenomen, om dezelfde reden. Bij de uitleg van de 2e keer zegt Bliepo wel "Je zit er 10 naast."
- **Synthesis: het voorbeeld met kleinere getallen en "wil je een moeilijkere?":** niet overgenomen. De Squla-les heeft die stappen niet (stond al zo in het draaiboek).

## Zinnen van Synthesis (Counting On), in het Nederlands (besluit Sara, 17 november 2026)

Alleen de tekst, passend gemaakt voor groep 3. Geen audio, beeld of code.

| Synthesis zegt (vertaald uit het draaiboek Huisnummers) | Bij ons nu | Waar | Wat er stond |
|---|---|---|---|
| probeer het nog eens / nog een keer; tik op 34 | Probeer het nog eens. Welk nummer hoort bij het vraagteken? | de vraag na een hint | VERVANGEN: "Welk nummer komt er na 7?" (zonder begin) |
| je kwam op 41; je ging een beetje te ver | Je koos 9. Je ging een beetje te ver. | eerste zin bij 1 huis te ver | erbij (nu 5 varianten) |
| 39? heel dichtbij … (alleen het herhalen van het getal) | 9? Dat is net 1 huis te ver. / 30? Na 39 komt een groter nummer. | eerste zin, bij elke denkfout 1 variant met "9?" | erbij |
| oké, ik help je | Ik help je even. We tellen samen. | 2e keer, vóór het samen tellen | erbij (nu 5) |
| oké, we gaan een stukje verder | We gaan nog een stukje verder. Nu komen de huisnummers tot 50. | begin van het laatste blok | VERVANGEN: "En nu de huisnummers tot 50." |
| precies, je komt op 42 / zeker, 45 | Precies, nummer 8. / Dat klopt, het is nummer 8. | zin met het nummer na lof | erbij (nu 9) |
| goed geteld (+ naam) | Wat heb jij goed geteld: verder en terug, tot wel 50! | slotzin | erbij (nu 3) |
