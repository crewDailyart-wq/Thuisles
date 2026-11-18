# WIJZIGINGEN-ZINNEN-MINSOMMEN — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, net als in de proefles Tellen. Dit bestand gaat alleen over de gouden les Minsommen (`squla-min-machine-1-gouden`). Andere lessen zijn niet veranderd.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe. De zinnen van deze les worden door geen andere les gebruikt (nagekeken: alleen `squla-minsommen-gouden.tsx` en het fouttabel-script lezen `squla-minsommen-gouden-zinnen.ts`). De oude versie staat in Git (commit 32a9126) en kan altijd terug.

**Niet veranderd:** de 15 sommen, de getallen, de 3 keuzes per vraag, de antwoorden, de volgorde en de betekenis van elke zin. De vragen "10 blokjes gaan de machine in. De machine haalt er 3 af. Hoeveel blokjes komen eruit?" en "Hoeveel is 8 − 5?" zijn precies gelijk gebleven. De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) zijn niet aangeraakt: die zijn van alle gouden lessen samen.

**Alle varianten op een rij:** FOUTTABEL-squla-min-machine-1-gouden.md, §4.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er 1 met de gedeelde kiezer (`src/components/les/lessen/nooit-dubbel.ts`), maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos 7." en "Je koos 4." tellen als dezelfde zin. Als het kan begint de volgende zin ook anders.

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les maak je minsommen. Er gaat steeds iets af, en jij kiest hoeveel er overblijft. | Vandaag gaan we minsommen maken. Er gaat steeds iets af, en jij kiest hoeveel er overblijft. / We gaan samen minsommen maken. … | warmer, zoals een juf begint |
| Eerst leer je mijn stippenmachine kennen. Hij helpt je straks bij het aftrekken. | Kijk, dit is mijn stippenmachine. Hij helpt ons straks bij het aftrekken. / Eerst laat ik je mijn stippenmachine zien. Hij helpt ons straks bij het aftrekken. | "leer je kennen" is stijf; nu zegt Bliepo wat het kind ziet |
| Je deed er 1 stip bij. Bovenaan staat het totaal: zoveel stippen zijn er nu. | Je hebt er 1 stip bij gedaan. Bovenaan staat het totaal: zoveel stippen zijn er nu. | natuurlijker Nederlands |
| Wat doet het totaal elke keer als er een stip bij komt? | Wat gebeurt er met het totaal als er een stip bij komt? | een totaal "doet" niets; korter (zin van Synthesis, vertaald) |
| Wat gebeurt er dan met het totaal? (de vraag nog een keer) | Wordt het totaal dan groter of kleiner? | leek nu te veel op de eerste vraag; dit is duidelijker |
| Wat heet het als je steeds stippen erbij doet? | Hoe heet het als je er steeds stippen bij doet? | grammatica: het is "hoe heet", niet "wat heet" |
| Wat heet dat, als je zo stippen erbij doet? | Hoe noem je dat, als je er stippen bij doet? | grammatica |
| Kijk wat de plusknop met de stippen doet: komen ze erbij of gaan ze eraf? | Kijk wat de plusknop doet. Komen er stippen bij, of gaan ze eraf? | te lange zin (15 woorden); nu 2 korte |
| Doe er nog 2 stippen bij en kijk goed naar het totaal. | Tik nog 2 keer op de plusknop. Kijk goed naar het totaal. | de zin zegt nu waar het kind moet tikken (ook nodig voor de nieuwe controle F16) |
| Doe er nog 1 stip bij en kijk naar het totaal. / Doe er nog 1 stip bij. (samen voordoen in de uitleg) | Tik nog 1 keer op de plusknop en kijk naar het totaal. / Tik nog 1 keer op de plusknop. | zelfde reden |
| Nu gaan we juist aftrekken. Dan gaat er iets af. | Nu doen we het andersom. We gaan aftrekken: dan gaat er iets af. / Nu gaan we het andersom doen. Bij aftrekken gaat er iets af. | "juist" is hier een lastig woord voor groep 3 |
| Haal er 3 weg. Tik op 3 stippen. | Haal er 3 weg. Tik op de stippen. / Nu halen we er 3 weg. Tik maar op de stippen. / Er gaan er 3 af. Tik op de stippen. | het getal stond 2 keer achter elkaar |
| Haal er 1 weg. Tik op 1 stip. | Haal er 1 weg. Tik op een stip. (en 2 andere) | het getal stond 2 keer achter elkaar |
| Er blijven 6 stippen over. 10 − 4 = 6. | 10 − 4 = 6. Kijk maar: zoveel blijven er over. / We begonnen met 10 en haalden er 4 weg. Er blijven er 6 over. / Er blijven 6 stippen over. Zoveel is 10 − 4. | de uitkomst stond 2 keer achter elkaar (de hele som staat ook bovenaan in beeld) |
| Kijk: 10 stippen, net zoveel als de blokjes. (alleen deze) | blijft, en erbij: Kijk, hier zijn 10 stippen. Net zoveel als de blokjes. / We beginnen met 10 stippen. Net zoveel als de blokjes. | variatie, en 2 korte zinnen |
| Denk aan 10 blokjes en haal er in je hoofd 3 weg. | Denk aan 10 blokjes. Haal er in je hoofd 3 weg. | 2 korte zinnen |
| Steek 8 vingers op en doe er 5 weg. | Steek 8 vingers op. Doe er 5 weg. | 2 korte zinnen |
| Je koos 5. (als de richting het antwoord zou verklappen) | Je koos 5. Je zit er dichtbij. / Je koos 5. Dat scheelt niet veel. / Bijna! 5 is het net niet. / 5? Dat is heel dichtbij. / Je tikte op 5. Het scheelt maar een klein beetje. | te kaal; nu warmer, en nog steeds zonder iets te verklappen |
| 10 − 3 is minder dan 8. (alleen deze) | blijft, en erbij: Je koos 8. Dat is iets te veel. / Bijna! 8 is iets te veel. / 8? Er komen er minder uit. / Je tikte op 8. Zo veel blokjes komen er niet uit. | klonk als een robot; Bliepo zegt nu eerst wat het kind koos |
| 10 − 3 is meer dan 6. (alleen deze) | blijft, en erbij: Je koos 6. Dat is iets te weinig. / Bijna! 6 is nog iets te weinig. / 6? Er komen er meer uit. / Je tikte op 6. Er komen meer blokjes uit. | zelfde reden |
| Je koos 10: zoveel gaan erin. (2e keer) + De machine haalt er 1 af, dus er komen er minder uit. | Je koos 10: zoveel gaan erin. De machine haalt er 1 af, dus er komen er minder uit. (nu 1 stuk) / 10 blokjes gaan erin. Er gaat er nog 1 af. Dan komen er minder uit. | zelfde zin; alleen een variant erbij |
| Je koos 10: daar begint de som mee. Bij min gaat er iets af. Dan blijft er minder over dan 10. | Je koos 10: daar begint de som mee. Bij min gaat er iets af. Dan blijft er minder over. | het getal stond 2 keer in 1 reactie |
| Tel precies 3 terug. (na "Je koos weer te veel.") | blijft, en erbij: We tellen precies 3 terug. | variatie; warmer ("we") |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Kom, we doen het samen. (alleen deze, bij elke 2e keer mis) | blijft, en erbij: Weet je wat? We doen het samen. / Geeft niks. We doen het samen. / Ik help je even. We doen het samen. / Deze is best lastig. We doen het samen. | de zin kwam letterlijk bij elke 2e keer mis terug |
| Hoeveel blokjes komen er dan uit? (alleen deze) | blijft, en erbij: Hoeveel blokjes komen er dus uit? / Kijk nog eens. Hoeveel blokjes komen er nu uit? | variatie |
| Wat is 8 − 5? (alleen deze) | blijft, en erbij: Hoeveel is 8 − 5 dan? / Reken het nog eens uit. Wat is 8 − 5? | variatie |
| Nu staan de minsommen op het schoolbord. | blijft, en erbij: Kijk, nu staan de minsommen op het schoolbord. | variatie (komt 1 keer per les) |
| Kijk: 8 stippen. | blijft, en erbij: Kijk, hier zijn 8 stippen. / We beginnen met 8 stippen. | variatie |
| Tik op een stip om hem weg te halen. | blijft, en erbij: Tik op een stip. Dan gaat hij weg. / Tik maar op een stip om hem weg te halen. | variatie |
| Je bent goed bezig. / Jij kunt dit. (2) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (dezelfde 5 als bij Tellen) |
| Je koos weer 7. | blijft, en erbij: Je tikte weer op 7. / Weer 7, zie ik. | variatie |
| Je koos 3: dat getal gaat eraf. | blijft, en erbij: 3? Dat is het getal dat eraf gaat. / Je tikte op 3. Zoveel halen we eraf. | variatie |
| Je koos 10: zoveel blokjes gaan erin. Er gaat er nog 1 af. | blijft, en erbij: 10? Zoveel blokjes gaan erin. Er gaat er nog 1 af. / Je tikte op 10. Zoveel gaan erin. Er gaat er nog 1 af. | variatie |
| Begin bij 10 en tel 3 terug. / Tel 3 terug vanaf 10. / Denk aan 10 blokjes … (vast per vraag) | dezelfde, en erbij: Probeer het nog eens. Tel 3 terug vanaf 10. (bij een som: Probeer het nog eens. Je mag je vingers gebruiken.) De les kiest nu steeds een andere. | de hint was per vraag altijd dezelfde |
| Er komen minder blokjes uit dan 8. / Er komen er minder dan 8 uit. (2e keer mis) | blijven, en erbij: Je koos 8. Er komen minder blokjes uit. / 8? Dat is te veel. (zo ook bij "meer" en bij sommen) | variatie |
| 3 gaat eraf. De vraag is hoeveel er overblijft. | blijft, en erbij: 3 is het getal dat eraf gaat. We zoeken wat er overblijft. | variatie |
| Je koos weer te veel. / Je koos weer te weinig. | blijven, en erbij: Dat is weer iets te veel. / Weer iets te veel, zie ik. (en zo ook bij te weinig) | variatie |
| Je koos weer het getal dat eraf gaat. / … waar je mee begint. | blijven, en erbij: Dat is weer het getal dat eraf gaat. / Dat is weer het getal waar we mee beginnen. | variatie |
| Ja, 10 min 3 is 7. / Ja, er gaan er 3 af. Er komen er 7 uit. / 10 − 3 = 7. / Er komen 7 blokjes uit. / Ik heb het nagekeken: 10 min 3 is 7. | blijven, en erbij: Precies, 10 − 3 = 7. / Dat klopt, er komen 7 blokjes uit. (bij een som: Dat klopt: 8 min 5 is 3.) | variatie (nu 7); de les zegt nooit 2 keer hetzelfde woord in lof en reactie ("Klopt helemaal! Dat klopt, …" komt niet voor) |
| Je weet nu hoeveel er overblijft bij een minsom. | blijft, en erbij: Je hebt goed gewerkt vandaag! Nu weet je hoe een minsom gaat. / Knap, hoor! Je hebt een heleboel minsommen gemaakt. | variatie |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie |
| Hetzelfde getal 2 keer gekozen, zonder richting: alleen de uitleg | Je koos weer 5. + Er blijft minder over. (of: Dat is te veel.) | Bliepo zegt nu eerst dat hij ziet dat het weer hetzelfde getal is |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een keuze die niet goed is | 5 per soort (te veel, te weinig, dichtbij), 3 bij het begingetal en bij het getal dat eraf gaat |
| Hint | 4 (machine) en 4 (som) |
| Uitleg bij de 2e keer | 4 bij te veel en te weinig, 2 bij de rest |
| "Weer …" (2 keer dezelfde denkfout) | 3 (te veel, te weinig), 2 bij de rest; elk met 2 soorten uitleg |
| "Je koos weer …" | 3 |
| "Kom, we doen het samen." | 5 |
| Samen voordoen: de stippen, de opdracht, klaar | 3 elk |
| Hulphandje: aanmoediging | 5 |
| Hulphandje: wat te doen | 3 (stip) en 3 (plusknop) |
| De vraag nog een keer na de hint | 3 (machine) en 3 (som) |
| Zin met de som na lof | 7 |
| Begin, uitleg van de machine (begin en einde), schoolbord | 2 elk |
| Slot en "Tik op de kaart." | 3 elk |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) |

## Past het in het tekstvak?

Met varianten kan een reactie langer worden dan vroeger. De les kiest daarom alleen varianten waarmee de hele reactie niet langer is dan de langste reactie van de eerste versie (die paste). Het fouttabel-script rekent na dat er altijd zo'n variant is.

## De fouttabel is strenger geworden

Het script `scripts/fouttabel-minsommen-gouden.ts` loopt nu ELKE variant na, niet alleen de vaste zin:
- geen "fout" in welke zin dan ook;
- geen eerste zin, hint of uitleg noemt het antwoord;
- waar de richting ("te veel", "minder") maar 1 keuze zou overlaten, heeft geen enkele variant een richtingwoord;
- een hint heeft nooit een richtingwoord;
- "te veel" zegt nooit per ongeluk "meer", en omgekeerd;
- een getal staat nooit vaker in 1 reactie dan nodig (niet 2 keer hetzelfde getal achter elkaar);
- elke zin bij het samen voordoen noemt de som en de uitkomst, de uitkomst 1 keer;
- elk rijtje heeft minstens 2 varianten en geen 2 dezelfde.

## Zinnen van Synthesis (Dot Destruction), in het Nederlands (besluit Sara, 17 november 2026)

Alleen de tekst, passend gemaakt voor groep 3. Geen audio, beeld of code.

| Synthesis zegt (vertaald uit INSPIRATIE.md) | Bij ons nu | Waar |
|---|---|---|
| wat gebeurt er elke keer als je een stip toevoegt? | Wat gebeurt er met het totaal als er een stip bij komt? | de 1e vraag van de uitleg (vervangt "Wat doet het totaal …") |
| we begonnen met 10; we haalden er 1 weg | We begonnen met 10 en haalden er 4 weg. Er blijven er 6 over. | samen voordoen: klaar (variant) |
| het is een beetje lastig; ik laat het je zien | Deze is best lastig. We doen het samen. | 2e keer mis (variant) |
| "precies" | Precies, 10 − 3 = 7. | zin met de som na lof (variant) |
| "dat klopt" | Dat klopt, er komen 7 blokjes uit. / Dat klopt: 8 min 5 is 3. | zin met de som na lof (variant) |
| goed gewerkt vandaag | Je hebt goed gewerkt vandaag! Nu weet je hoe een minsom gaat. | slotzin (variant) |

## Niet gedaan, met reden (afgewezen)

- **"Dat is niet wat ik zie" (Synthesis, bij een keuze die niet goed is):** niet overgenomen. Het klinkt bij ons als "fout" in andere woorden; Bliepo zegt liever wat het kind koos.
- **"Dat is 'm" / "Je hebt het" / "Goed werk" als lof:** niet gedaan. Lof komt uit het vaste rijtje van alle gouden lessen (BLIEPO-KARAKTER.md); dat rijtje is niet van deze les alleen.
- **"Het is alsof je de stippen met je gedachten hebt weggehaald" (Synthesis):** niet overgenomen; te moeilijk voor groep 3 en bij onze vragen staan geen stippen in beeld.
- **De stippenvernietiger, de zapper, "vernietigen":** niet overgenomen. Bij ons is het een stippenmachine en "weghalen" (dat was al zo).
- **De vraag "Hoeveel blokjes komen eruit?" en "Hoeveel is 8 − 5?" afwisselen:** niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11).
- **"Minsom" overal vervangen door "aftreksom" (of andersom):** niet gedaan. De les heet Minsommen; "aftrekken" blijft alleen in de uitleg van de machine, waar het kind kiest tussen Optellen, Aftrekken en Delen.
- **"Bijna!" alleen bij 1 ernaast:** niet apart gemaakt. Alle keuzes liggen 1 of 2 naast het goede antwoord, net als bij Tellen.
- **De richting noemen bij elke keuze:** niet waar er dan nog maar 1 keuze overblijft (BOUWREGELS 15.17). Daar zegt Bliepo alleen dat het dichtbij is.
- **De zinnen van de 2 uitlegvragen bij een keuze die niet goed is ("Je koos dat het kleiner wordt.", "Je koos aftrekken. Dat doen we straks.") in varianten:** niet gedaan. Ze komen hooguit 1 keer per les voor en zijn al duidelijk.
- **Een aanmoediging met de naam van het kind bij een keuze die niet goed is:** niet gedaan (BOUWREGELS 3.17).
