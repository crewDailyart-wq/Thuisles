# WIJZIGINGEN-ZINNEN-TELLEN — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Dit is de **proefles**: alleen de gouden les Tellen (`squla-tellen-fruit-1-gouden`) en de extra les Tellen (`squla-tellen-fruit-1-gouden-extra`). Andere lessen zijn niet veranderd.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe. De oude zinnen van de gouden les staan ook nog letterlijk in de code (`src/components/les/lessen/squla-tellen-zinnen-v1.ts`), omdat de Rekenmix-lessen ze nog gebruiken. Terugzetten kan dus altijd.

**Niet veranderd:** de getallen, de antwoorden, de keuzes, de volgorde van de vragen en de betekenis van elke zin. De vraag "Hoeveel appels zie je?" en "Tel ze en tik op het goede getal." zijn precies gelijk gebleven.

**Alle nieuwe varianten op een rij:** FOUTTABEL-squla-tellen-fruit-1-gouden.md (§5) en FOUTTABEL-squla-tellen-fruit-1-gouden-extra.md (§4).

## Hoe "nooit 2 keer hetzelfde" werkt

Voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer. Dat geldt ook over vragen heen. "Je koos 12." en "Je koos 14." tellen als dezelfde zin. Als het kan begint de volgende zin ook anders ("Je koos …" en daarna "Bijna! …"). De kiezer staat in `src/components/les/lessen/nooit-dubbel.ts` en kan later door andere lessen gebruikt worden.

## Deel A — gouden les Tellen: verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les tel je fruit. | Vandaag gaan we fruit tellen. / We gaan samen fruit tellen. | warmer, zoals een juf begint |
| Laten we ze samen natellen. | Ik tel ze hardop voor je. Tel maar mee! / Kom, ik tel ze hardop. Tel maar mee! | "natellen" is een moeilijk woord; nu zegt Bliepo wat hij doet |
| …. Samen telden we … …. | En 12! Zoveel appels zijn het. / En 12! Nu hebben we ze samen allemaal geteld. / En de laatste is 12. Zoveel appels zijn het. | het getal stond 2 keer achter elkaar |
| Je telde fruit tot wel 17. | Je hebt fruit geteld tot wel 17! / Wat heb jij veel fruit geteld: tot wel 17! | natuurlijker en vrolijker |
| Ja, je telde ze allemaal: …. | Ja, je hebt ze allemaal geteld: 12. | natuurlijker Nederlands |
| Je telde er …. | Je hebt er 12 geteld. | natuurlijker Nederlands |
| Tel nog eens. Wijs elke … aan en tel rustig mee. | Tel ze nog eens rustig. Wijs elke appel aan. | "tel mee" klopte niet: het kind telt zelf |
| Tel nog eens, rij voor rij. Sla er geen … over. | Tel nog eens, rij voor rij. Sla geen appel over. | grammatica: "er" hoort er niet |
| Begin linksboven en tel opnieuw. Wijs elke … aan. | Begin bovenaan en tel opnieuw. Wijs elke appel aan. | "linksboven" is lastig voor groep 3 |
| Tel opnieuw. Elke … tel je maar 1 keer. | Tel nog eens, rij voor rij. Elke appel tel je maar 1 keer. (en 3 andere varianten) | vriendelijker en met meer hulp |
| Tel nog eens, rij voor rij. Wijs elke … 1 keer aan. | Tel ze opnieuw. Wijs elke appel maar 1 keer aan. (en 3 andere varianten) | duidelijker: "maar 1 keer" |
| Begin linksboven en tel rustig. Wijs elke … 1 keer aan. | Begin bovenaan en tel rustig. Elke appel telt 1 keer mee. | "linksboven" is lastig voor groep 3 |
| Tel nog eens rustig. Wijs elke … aan en zeg het getal. | Tel ze nog eens rustig. Wijs elke appel aan en zeg het getal. | natuurlijker ("tel ze") |
| … is dichtbij. | Je koos 12. Je zit er dichtbij. / 12? Dat is heel dichtbij. / Bijna! 12 is het net niet. (5 varianten) | te kaal; nu zegt Bliepo eerst wat het kind koos |
| … is dichtbij, maar je hebt ze nog niet allemaal geteld. | Je zit er dichtbij met 12. Je hebt ze nog niet allemaal geteld. (5 varianten) | te lange zin; nu 2 korte zinnen |
| … is te weinig. Je hebt ze nog niet allemaal geteld. | Bijna! 12 is nog iets te weinig. / Je koos 12. Er liggen er nog meer. (5 varianten) | "12 is te weinig" klonk streng |
| … is dichtbij, maar dat zijn er te veel. | Je zit er dichtbij, maar 14 is te veel. (5 varianten) | natuurlijker |
| Je koos …. Dat zijn er te veel. | Je koos 14. Dat zijn er iets te veel. | zachter: "iets te veel" |
| … is te veel. | Bijna! 14 is iets te veel. / 14? Dat zijn er iets te veel. (5 varianten) | klonk streng en als een robot |
| Je telde alleen de volle rijen. Dat zijn er …. | Je hebt alleen de volle rijen geteld. Dat zijn er 10. (3 varianten) | natuurlijker Nederlands |
| Je telde weer alleen de volle rijen. | Je hebt weer alleen de volle rijen geteld. (3 varianten) | natuurlijker Nederlands |
| We tellen ze 1 voor 1. | We tellen ze rustig, stuk voor stuk. | het getal 1 stond 2 keer achter elkaar |
| We tellen ze samen. | Weet je wat? We tellen ze samen. / Geeft niks. We tellen ze samen. / Ik help je even. We tellen ze samen. | te kaal; nu warmer |
| Kom, samen tellen we ze. | Kom, we tellen ze samen. (4 varianten) | omgekeerde zin, klonk raar |

## Deel A — extra les Tellen: verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| Nu tel je fruit dat door elkaar ligt. | Vandaag tellen we fruit dat door elkaar ligt. | "Nu" paste niet aan het begin van een les |
| Tel goed en tik op het fruit. | Tel goed en kies het fruit. | een tik op het fruit zelf zet een stipje; het kind kiest met de knoppen |
| Dit is een ander rooster. Van welk fruit tel je er …? | Hier ligt ander fruit. Van welk fruit tel je er 7? | "rooster" is een moeilijk woord |
| Nu tel je … en … samen. Hoeveel zijn het er samen? | Nu tel je de peren en de pruimen. Hoeveel zijn het er samen? | "samen" stond er 2 keer |
| Tot nu toe telde je het fruit dat er lag. | Je hebt steeds fruit geteld dat er al lag. | natuurlijker |
| Nu gaan we andersom: ik zeg een getal en jij maakt zoveel stukken fruit. | Nu doen we het andersom. Ik zeg een getal en jij maakt het fruit. | te lange zin (15 woorden) |
| Maak … … in het rooster. | Maak 4 peren in de vakjes. | "rooster" is een moeilijk woord |
| Tik op een leeg vakje voor een stuk fruit. | Tik op een leeg vakje. Dan komt er een peer. | duidelijker: het is altijd een peer |
| Nog 1 laatste opdracht. Nu maak je een lijstje. | Dit is de laatste opdracht. Kijk, hier is een lijstje. | het kind maakt geen lijstje: het lijstje staat er al |
| Maak het lijstje in het rooster. Kies eerst een fruit en tik dan op de vakjes. | Maak al het fruit van het lijstje. Kies eerst een fruit en tik dan op de vakjes. | "rooster" weg; duidelijker wat je maakt |
| We tellen het samen. | Weet je wat? We tellen samen. / Geeft niks. We tellen samen. / Ik help je even. We tellen samen. | warmer |
| Kom, dan tellen we samen. | Kom, we tellen samen. (4 varianten) | bijna dezelfde zin als de andere |
| Tik op een stuk fruit zonder nummer. | Tik op een peer of pruim zonder nummer. / Zoek een peer of pruim zonder nummer en tik erop. | duidelijker: alleen peren en pruimen tellen mee |
| …. Samen telden we … stuks fruit: … en …. | En 7! Zoveel peren en pruimen zijn het samen. / En de laatste is 7. Zoveel zijn het er samen. | het getal stond 2 keer achter elkaar |
| Ik help je: jij tikt en ik tel mee. | Ik help je. Jij tikt en ik tel mee. | 2 korte zinnen |
| Kom, jij tikt en ik tel. | Kom, we doen het samen. Jij tikt, ik tel. | warmer |
| Ik help je. Jij tikt, ik tel mee. | Weet je wat? Jij tikt en ik tel hardop. / Geeft niks. Jij tikt en ik tel mee. | was bijna dezelfde zin als de eerste |
| Tik op een leeg vakje voor een …. Ik tel mee. | Tik op een leeg vakje voor een peer. / Tik steeds op een leeg vakje. Dan komt er een peer. | "Ik tel mee" stond ook al in de zin ervoor |
| En …. Samen maakten we … …. | En 4! Nu liggen alle peren er. / En 4. Samen hebben we alle peren gemaakt. | het getal stond 2 keer achter elkaar |
| Ik zet de rest klaar. Jij maakt de …. Ik tel mee. | Ik zet de rest klaar. Jij maakt de pruimen. / De rest leg ik vast neer. De pruimen zijn voor jou. | "Ik tel mee" stond ook al in de zin ervoor |
| Je telde en maakte fruit tot wel …. | Je hebt fruit geteld en gemaakt, tot wel 10! / Wat heb jij veel fruit geteld en gemaakt: tot wel 10! | natuurlijker en vrolijker |
| Het lijstje: … en …. | Op het lijstje staan 4 appels, 7 peren en 10 pruimen. | een hele zin in plaats van een opsomming |
| Dat is hem: … …. | Zo is het goed: 4 peren. | "Dat is hem" past niet bij 4 peren |
| Perfect, je vulde het hele rooster. | Perfect, alle vakjes zijn vol. | "rooster" is een moeilijk woord |
| Alles staat goed. Het hele rooster is vol. | Alles staat goed. Elk vakje heeft fruit. | "rooster" is een moeilijk woord |
| Precies zoals het lijstje. | Precies zoals op het lijstje. | grammatica |
| Tel nog eens, het ene fruit na het andere. Zet een stipje op wat je telde. | Tel elk fruit apart. Zet een stipje op wat je al geteld hebt. | korter en duidelijker |
| Kijk goed naar elk fruit. Je mag stipjes zetten. | We zoeken het fruit met 8. Tik op het fruit voor een stipje. | de hint zegt nu nog eens wat we zoeken en hoe je een stipje zet |
| Je telt het ene fruit na het andere. Zo mis je niets. | Eerst het ene fruit, dan het andere. Zo sla je niets over. | "mis je niets" is geen juf-Nederlands |
| Elk fruit apart tellen helpt. Dan raak je niets kwijt. | Elk fruit apart tellen helpt. Dan vergeet je er geen. | "kwijtraken" klopt niet bij tellen |
| Elk fruit tel je apart, een voor een. | Elk fruit tel je apart, stuk voor stuk. / We tellen elk fruit apart. Zo weten we het zeker. | "een voor een" botst met de cijferafspraak (3.20); "1 voor 1" zou het getal 2 keer zeggen |
| Je hebt er net een gemist. Je telt ze rustig, een voor een. | Je hebt er net 1 overgeslagen. We tellen ze rustig, stuk voor stuk. | "gemist" wordt "overgeslagen"; hoeveelheid met een cijfer |
| Je telt ze rustig, een voor een. | We tellen ze rustig, stuk voor stuk. | warmer ("we"); cijferafspraak |
| De peren en pruimen tel je samen, een voor een. | De peren en pruimen tel je samen, stuk voor stuk. | cijferafspraak (3.20) |
| Er staat nog geen peer in het rooster. | Er ligt nog geen peer in de vakjes. / Ik zie nog geen peer in de vakjes. | fruit ligt; "rooster" is een moeilijk woord |
| Elk vakje dat je aantikt, krijgt een stuk fruit. | Elk vakje dat je aantikt, krijgt een peer. / In elk vakje dat je aantikt, komt een peer. | duidelijker: het is altijd een peer |
| Er staat nog steeds geen peer in het rooster. | Er ligt nog steeds geen peer in de vakjes. / Ik zie nog steeds geen peer. | fruit ligt; "rooster" weg |
| Nog geen enkel fruit klopt. Kijk nog eens naar het lijstje. | Het fruit klopt nog niet met het lijstje. Kijk er nog eens naar. | klonk streng |
| Ik tel …. Het lijstje wil er …. | Ik tel 9 pruimen. Op het lijstje staan er 10. / Ik tel 9 pruimen. Het moeten er 10 zijn. | een lijstje "wil" niets |
| Ik tel nog geen …. Het lijstje wil er …. | Ik tel nog geen pruimen. Op het lijstje staan er 10. | een lijstje "wil" niets |

## Deel B — zinnen die bleven en varianten erbij kregen (gouden les; de extra les kreeg dezelfde)

| Was | Nu | Waarom |
|---|---|---|
| Zie je? Het zijn er 12. Je had het precies goed. (alleen deze) | blijft, en erbij: Zie je wel? Het zijn er 12. Jij had het goed geteld. | variatie |
| Tik op elke appel. Ik tel mee. (alleen deze) | blijft, en erbij: Tik elke appel aan. Ik zeg het getal. / Tik op alle appels. Ik tel hardop mee. | variatie |
| Tik op een appel zonder nummer. (alleen deze) | blijft, en erbij: Zoek een appel zonder nummer en tik erop. / Welke appel heeft nog geen nummer? Tik erop. | variatie |
| Kijk, ik tel de rest. Het zijn er 12. (alleen deze) | blijft, en erbij: Kijk, ik tel even verder. Het zijn er 12. | variatie |
| Tik op de kaart. (alleen deze) | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie |
| Je koos weer 11. (alleen deze) | blijft, en erbij: Je tikte weer op 11. / Weer 11, zie ik. | variatie |
| Je bent goed bezig. / Jij kunt dit. (2) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie |
| Kijk ook naar de laatste rij en tel opnieuw. (alleen deze) | blijft, en erbij: De laatste rij telt ook mee. Tel nog eens. / Tel ook de appels in de laatste rij. | variatie |
| De rij die niet vol is, telt ook mee. (alleen deze) | blijft, en erbij: De laatste rij is niet vol. Die hoort er ook bij. / Ook de appels in de laatste rij tellen mee. | variatie |
| Je hebt 1 appel niet geteld. (alleen deze) | blijft, en erbij: Er ligt nog 1 appel meer. / Je hebt 1 appel overgeslagen. | variatie; en geen stuk meer 2 keer in 1 reactie ("… niet allemaal geteld. … niet geteld.") |
| Je telde 1 appel te veel. (alleen deze) | blijft, en erbij: Je hebt 1 appel 2 keer geteld. / Er ligt 1 appel minder. | variatie; en niet meer 2 keer "te veel" in 1 reactie |
| Je telde er weer te weinig. / Je telde er weer te veel. (elk 1) | blijven, en erbij: Het zijn er weer iets te weinig. / Weer iets te weinig, zie ik. (en zo ook bij te veel) | variatie |
| Elke appel krijgt 1 nummer. Dan sla je er geen over. (alleen deze) | blijft, en erbij: We geven elke appel een nummer. Zo vergeten we er geen. | variatie |
| Ja, er zijn er 12. / Het zijn er 12. / Ik heb ze nagekeken: het zijn er 12. | blijven, en erbij: Er liggen 12 appels. / 12 appels, precies! | variatie (nu 7 zinnen met het aantal) |
| Vraag 15, keuze 10: "Je telde alleen de volle rijen. Dat zijn er 10." + "Kijk ook naar de laatste rij …" | Je koos 10. Je zit er dichtbij. (of een variant) + een hint zonder richting | de oude hint liet alleen 11 over en verklapte dus het antwoord (15.17) |

## Aantal varianten per situatie

| Situatie | Gouden les | Extra les |
|---|---|---|
| Eerste zin na een keuze die niet goed is ("Je koos …") | 5 per soort (dichtbij, te weinig, te veel), 3 bij volle rijen | 4 bij fruit kiezen, 3 bij de rest, 2 bij het lijstje |
| Hint | 4 per soort, 3 bij volle rijen | 3 bij fruit kiezen, 2 bij de rest |
| Uitleg bij de 2e keer | 3 per soort | 2 of 3 |
| "Weer …" (2 keer dezelfde denkfout) | 3, met 2 soorten uitleg | 2 |
| "Je koos weer …" | 3 | — |
| "Kom, we tellen ze samen." | 4 | 4 (en 4 bij samen maken) |
| Opdracht bij samen tellen ("Tik op elke appel …") | 3 | 3 (2 bij peren en pruimen) |
| Hulphandje: aanmoediging ("Je bent goed bezig.") | 5 | 5 |
| Hulphandje: wat te doen ("Tik op een appel zonder nummer.") | 3 | 3 (2 bij vakjes) |
| Klaar met samen tellen | 3 | 3 (2 bij samen maken) |
| Bliepo telt de rest zelf | 2 | 2 |
| Zin met het aantal na lof | 7 | 5 (was al 5) |
| Begin, natellen, slot | 2 elk | 2 bij het slot |
| "Tik op de kaart." | 3 | 3 |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) | hetzelfde |

## Niet gedaan, met reden

- **Zinnen van Synthesis vertaald overnemen:** eerst niet gedaan (oude regel), daarna wel: Sara besloot op 17 november 2026 dat de tekst in het Nederlands overgenomen mag worden. Zie het stuk hieronder.
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) herschrijven:** niet gedaan. Die staan in BLIEPO-KARAKTER.md en worden door alle 15 gouden lessen gebruikt; dit is een proef met alleen Tellen. Ze wisselen al zonder herhaling.
- **Richting noemen bij elke keuze ("te veel", "te weinig"):** niet waar er dan nog maar 1 keuze overblijft. Dan zou de hint het antwoord verklappen (15.17). Daar zegt Bliepo alleen dat het dichtbij is.
- **"1 voor 1" (cijferafspraak) in plaats van "een voor een":** niet gedaan, want dan staat het getal 1 twee keer achter elkaar. Het is "stuk voor stuk" geworden.
- **De vraag "Hoeveel appels zie je?" afwisselen:** niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11).
- **"Zie je? Het zijn er 12." weghalen omdat Bliepo net tot 12 telde:** niet gedaan. Het laatste getal is het aantal; dat hoort het kind hier juist te horen. **Later op 18 november toch aangepast** (logica-controle, zoals Rekenmix 1): het getal klinkt nog steeds, maar 1 keer; zie "Herstel 18 november" onderaan.
- **Een aanmoediging met de naam van het kind bij een keuze die niet goed is:** niet gedaan (BOUWREGELS 3.17: geen naam bij een fout).

## Twee regels van Sara voor de volgende lessen (18 november 2026)

1. **Let extra op de zinnen van de opdracht zelf** (de vraag en de opdracht, niet alleen reacties en hints): helder, kort, juf-Nederlands, geen vage zinnen. Bij Tellen nagelopen: "Hoeveel appels zie je?" en "Tel ze en tik op het goede getal." bleven; in de extra les zijn 8 opdrachtzinnen verbeterd (zie de tabel hierboven: "Tel goed en kies het fruit.", "Maak 4 peren in de vakjes.", "Dit is de laatste opdracht. Kijk, hier is een lijstje." enzovoort).
2. **Geen disco, feest, dansen of muziek als thema in teksten.** Bij Tellen nagekeken: komt nergens voor.

## Zinnen van Synthesis (Color Count), in het Nederlands (besluit Sara, 17 november 2026)

Alleen de tekst, passend gemaakt voor groep 3. Geen audio, beeld of code. Ze zijn als variant toegevoegd; alleen bij nummer 8 is een zin vervangen.

| Synthesis zegt (vertaald uit INSPIRATIE.md) | Bij ons nu | Waar | Wat er stond |
|---|---|---|---|
| "6 rode vierkanten?" + hij denkt dat je er te veel hebt geteld | 14 pruimen? Ik denk dat je er te veel hebt geteld. | gouden: eerste zin, te veel | erbij (nu 6 varianten) |
| "6 paarse vierkanten?" + er zijn er nog die we niet hebben geteld | 12 pruimen? Je hebt ze nog niet allemaal geteld. | gouden: eerste zin, te weinig | erbij (nu 6 varianten) |
| Probeer het nog eens; tel de rode vierkanten en tik op het getal | Probeer het nog eens. Tel de appels en tik op het getal. | gouden: hint zonder richting | erbij (nu 5) |
| Laten we tellen | Laten we ze samen tellen. Ik tel hardop. | gouden: Bliepo telt na bij de 1e vraag | erbij (nu 3) |
| "Daar heb je het"; je zat er precies goed op | Kijk, daar heb je het: 12. Je zat precies goed. | gouden: na het natellen | erbij (nu 3) |
| Laten we ze tellen en kijken | Laten we ze samen tellen en kijken. | gouden en extra: 2e keer mis, samen tellen | erbij (nu 5) |
| "Precies"; 7 paarse vierkanten | Precies, 12 appels. | gouden: zin met het aantal na lof | erbij (nu 9) |
| Probeer deze eens; van welke kleur tel je er 8? | Probeer deze eens. Van welk fruit tel je er 7? | extra: 2e vraag | VERVANGEN: "Hier ligt ander fruit. Van welk fruit tel je er 7?" (daarvoor: "Dit is een ander rooster. …") |
| "Dat klopt"; er zijn 8 paarse vierkanten | Dat klopt, er zijn 12 appels. | gouden: zin met het aantal na lof | erbij |
| "9 rode vierkanten?"; laten we ze tellen | 8 appels? Ik tel er 9. | extra: eerste zin bij fruit kiezen | erbij (nu 5) |
| Dat zijn er een paar te veel | Je maakte 6 peren. Dat zijn er een paar te veel. | extra: te veel gemaakt (alleen bij 2 of meer te veel) | erbij |
| "Perfect"; je hebt het hele rooster gevuld | Perfect, je hebt alle vakjes gevuld. | extra: het lijstje goed | erbij (nu 6) |
| Echt indrukwekkend; je hebt helemaal tot 10 geteld | Knap, hoor! Je hebt helemaal tot 17 geteld. | gouden en extra: slotzin | erbij (nu 3) |

Niet overgenomen: "tik op de kaart om je trofee te halen" (bij ons is er geen trofee), "kies je lievelingskleur" (de Squla-les heeft die stap niet) en de lofwoorden "oké, uitstekend" (lof komt uit het vaste rijtje van alle lessen).

## Herstel 18 november 2026 (logica-controle: F16 en "niets dubbel")

| Oud | Nieuw | Waarom |
|---|---|---|
| (gouden, Bliepo telt "… 11. 12.") Zie je? Het zijn er 12. Je had het precies goed. | (Bliepo telt "… 10. 11.") En 12! Je had het precies goed. / En de laatste is 12. Jij had het goed geteld. / En 12! Zie je? Je zat precies goed. | het laatste getal klonk 2 keer achter elkaar (15.29); zoals Rekenmix 1. Tikt het kind op de pijl, dan blijven de oude zinnen ("Zie je? Het zijn er 12. …") |
| (extra, lijstje, hint 1e fout) Op het lijstje staan 4 appels, 7 peren en 10 pruimen. | Op het lijstje staan 4 appels, 7 peren en 10 pruimen. Zet in elk vakje het goede fruit. / … Kies een fruit en tik op de vakjes. | er stond geen opdracht bij terwijl de les op het kind wachtte (F16, 15.37) |
| (extra, lijstje, samen maken) Ik zet de rest klaar. Jij maakt de appels. / De rest leg ik vast neer. De appels zijn voor jou. | Ik zet de rest klaar. Jij maakt de appels: tik op de lege vakjes. / De rest leg ik vast neer. De appels zijn voor jou: tik op de lege vakjes. | het kind wist niet wat het moest doen (F16, 15.37) |

## 19 november 2026: "nagekeken" is weg

Opdracht van Sara: het woord "nagekeken" (en "nakijken") komt niet meer voor in wat Bliepo zegt of laat zien. Elke zin is vervangen door een andere zin die zegt dat het klopt ("Zie je, …", "Inderdaad, …"), op dezelfde plek in het rijtje (de robotplek blijft de robotplek, hooguit 1 keer per les; de grens "hooguit 2 keer per les" geldt nu voor deze zinnen: `WAS_NAKIJKEN` in squla-klok-gouden-zinnen.ts). Het gekozen antwoord staat er hooguit 1 keer in. Reden ook in WEGGEHAALD.md.

| Les | Soort | Oud | Nieuw |
|---|---|---|---|
| squla-tellen-fruit-1-gouden | nagekeken weg | Ik heb ze nagekeken: het zijn er ${gk(n, f)}. | Inderdaad, je telde tot ${gk(n, f)}. |
| squla-tellen-fruit-1-gouden (TELREACTIE, zelfde zin) | nagekeken weg | Ik heb ze nagekeken: het zijn er ${gk(n, f)}. | Inderdaad, je telde tot ${gk(n, f)}. |
| squla-tellen-fruit-1-gouden-extra | nagekeken weg | Ik heb ze nagekeken: ${gk(n, f)} ${f.naam}. | Inderdaad, je telde tot ${gk(n, f)}. |
| squla-tellen-fruit-1-gouden-extra | nagekeken weg | Ik heb ze nagekeken: samen ${gw(n)}. | Inderdaad, alles bij elkaar ${gw(n)}. |
| squla-tellen-fruit-1-gouden-extra | nagekeken weg | Je maakte ${gk(n, f)} ${f.naam}. / Ik heb ze nagekeken: ${gk(n, f)} ${f.naam}. | Je maakte ${gk(n, f)} ${f.naam}. / Inderdaad, er liggen nu ${gk(n, f)} ${f.naam}. |
| squla-tellen-fruit-1-gouden-extra | nagekeken weg | Ik heb alles nagekeken: het klopt. | Inderdaad, alles past bij het lijstje. |
