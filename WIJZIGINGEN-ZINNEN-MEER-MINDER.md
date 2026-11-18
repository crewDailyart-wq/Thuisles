# WIJZIGINGEN-ZINNEN-MEER-MINDER — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, net als in de proefles Tellen. Dit bestand gaat alleen over de gouden les Meer-minder (`squla-meer-minder-evenveel2-1-gouden`, "De meeste"). Andere lessen zijn niet veranderd.

**Niets is weggegooid.** Elke oude zin staat hieronder naast de nieuwe. De zinnen van deze les worden door geen andere les gebruikt (nagekeken: alleen `squla-meer-minder-gouden.tsx` en het fouttabel-script lezen `squla-meer-minder-gouden-zinnen.ts`). De oude versie staat in Git en kan altijd terug.

**Niet veranderd:** de 15 vragen, de getallen, de keuzes, de antwoorden, de volgorde en de betekenis van elke zin. De vragen "Tel de kralen. Hoeveel kralen zijn het?", "Hoeveel kralen liggen er?", "Waar liggen de meeste koekjes? Tik op die kaart." en "Op welke kaart liggen de meeste koekjes?" zijn precies gelijk gebleven. De koekjes blijven kaarten in het beeld waar je op tikt (BOUWREGELS 15.32: voorwerpen in beeld blijven in beeld); de getallen bij de kralen staan rechts onder Bliepo's zin, zoals het al was. De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet) zijn niet aangeraakt.

**Alle varianten op een rij:** FOUTTABEL-squla-meer-minder-evenveel2-1-gouden.md, §4.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er 1 met de gedeelde kiezer (`src/components/les/lessen/nooit-dubbel.ts`), maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos 12." en "Je koos 14." tellen als dezelfde zin. Als het kan begint de volgende zin ook anders. In 1 reactie staat geen woord 2 keer (niet "… nog meer. … 1 kraal meer.").

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| In deze les tel je eerst kralen. Daarna zoek je waar de meeste koekjes liggen. | Vandaag tellen we eerst kralen. Daarna zoeken we waar de meeste koekjes liggen. / We gaan eerst samen kralen tellen. Daarna zoeken we waar de meeste koekjes liggen. | warmer, zoals een juf begint |
| Het zijn 12 kralen. 12 is evenveel. | En 12! Zoveel kralen zijn het. / En de laatste is 12. Zoveel kralen zijn het. / We hebben 12 kralen geteld. Dat getal is evenveel. | het getal stond 2 keer achter elkaar |
| Je koos 10. Dat is dichtbij. (alleen "Je koos …" ervoor) | blijft, en erbij: Bijna! 10 is het net niet. / 10? Dat is heel dichtbij. (nu 5) | variatie; niet steeds "Je koos …" |
| Je koos 11, maar er liggen meer kralen. (alleen deze) | blijft, en erbij: Je koos 11. Er liggen er nog meer. / Bijna! 11 is nog iets te weinig. / 11? Ik zie er nog meer. / 11 kralen? Je hebt ze nog niet allemaal geteld. | Bliepo zei bij elke te-weinig precies dezelfde zin |
| Je koos 13, maar zoveel kralen liggen er niet. (alleen deze) | blijft, en erbij: Je koos 13. Dat zijn er iets te veel. / Bijna! 13 is iets te veel. / 13? Dat zijn er iets te veel. / 13 kralen? Ik denk dat je er te veel hebt geteld. | zelfde reden |
| Tel nog een keer. Raak elke kraal aan en sla er geen over. | Tel nog een keer. Wijs elke kraal aan en sla er geen over. | op het scherm kun je een kraal niet "aanraken" bij het tellen; een juf zegt "wijs aan" |
| Tel nog een keer. Raak elke kraal maar 1 keer aan. | Tel nog een keer. Wijs elke kraal maar 1 keer aan. | zelfde reden |
| In een volle rij liggen 5 kralen. Tel zo verder. | In een volle rij liggen 5 kralen. Tel rij voor rij. | "tel zo verder" was vaag |
| We tellen ze 1 voor 1. (vangnet, komt in deze les niet voor) | We tellen ze rustig, stuk voor stuk. | het getal 1 stond 2 keer achter elkaar (zoals bij Tellen) |
| Je tikte op de kaart met de minste koekjes. Op die kaart liggen er juist het minst. (2e keer mis) | Op die kaart liggen er juist het minst. / Je tikte op de kaart met de minste koekjes. We zoeken de meeste. / Daar liggen de minste koekjes. We zoeken waar de meeste liggen. | Bliepo zei 2 keer bijna hetzelfde achter elkaar |
| Daar liggen veel koekjes, maar niet de meeste. Er is een kaart met nog meer koekjes. (2e keer mis) | Er is een kaart met nog meer koekjes. / Daar liggen veel koekjes. Op een andere kaart liggen er nog meer. / Dat zijn veel koekjes. Een andere kaart heeft er nog meer. | korter; niet 2 keer "koekjes" en "meer/meeste" in 1 reactie |
| Ik leg de koekjes in rijen van 10. Kijk wat er onder de rij van 10 nog ligt. | Ik leg de koekjes in rijen van 10. Kijk wat er onder de bovenste rij nog ligt. | het getal 10 stond 2 keer achter elkaar; de rij van 10 is de bovenste rij |
| Ik leg de koekjes in rijen van 10. Wat ligt er op elke kaart onder de rij van 10? | Ik leg de koekjes in rijen van 10. Wat ligt er op elke kaart onder de bovenste rij? (en erbij: Zo zie je beter waar de meeste liggen.) | zelfde reden; de les kiest nu steeds een andere |
| 2e keer mis bij de kralen: de eerste zin en de uitleg konden hetzelfde woord 2 keer zeggen | de les kiest nu een uitleg zonder een woord uit de eerste zin | geen "… nog meer. … 1 kraal meer." |

## Deel B — zinnen die bleven en varianten erbij kregen

| Was | Nu | Waarom |
|---|---|---|
| Kom, we tellen samen. (alleen deze, bij elke 2e keer mis) | blijft, en erbij: Weet je wat? We tellen ze samen. / Geeft niks. We tellen ze samen. / Ik help je even. We tellen ze samen. / Laten we ze samen tellen en kijken. | de zin kwam letterlijk bij elke 2e keer mis terug |
| Hoeveel kralen tel je nu? (alleen deze) | blijft, en erbij: Hoeveel kralen zijn het, denk je? / Op hoeveel kralen kom je nu? | variatie |
| Waar liggen nu de meeste koekjes? (alleen deze) | blijft, en erbij: Welke kaart heeft nu de meeste koekjes? / Kijk nog eens goed. Welke kaart heeft de meeste koekjes? | variatie |
| Nu iets anders: 3 kaarten met koekjes. | blijft, en erbij: Nu doen we iets anders. Kijk, hier zijn 3 kaarten met koekjes. | variatie (komt 1 keer per les) |
| Ik leg de koekjes in rijen van 10. (alleen deze, bij elke 1e keer mis) | blijft, en erbij: Kijk, ik leg de koekjes in rijen van 10. / Geen zorgen. Ik leg de koekjes in rijen van 10. | de zin kwam bij elke 1e keer mis terug |
| Ik tel de volle rijen. / Ik tel de eerste rij. | blijven, en erbij: Ik begin met de volle rijen. / Eerst tel ik de volle rijen. / Ik begin met de eerste rij. | variatie |
| Tel jij verder? Tik op de kralen in de laatste rij. | blijft, en erbij: Nu jij! Tik op de kralen in de laatste rij. / Tik jij op de kralen in de laatste rij? Ik tel mee. | variatie |
| Tik jij op de laatste kraal? | blijft, en erbij: Nu jij! Tik op de laatste kraal. | variatie |
| Tik op de volgende kraal. | blijft, en erbij: Tik maar op de volgende kraal. / Welke kraal komt nu? Tik erop. | variatie |
| Je bent goed bezig. / Jij kunt dit. (2) | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. | variatie (dezelfde 5 als bij Tellen) |
| 13 is het meest. Tik op die kaart. | blijft, en erbij: 13 is het grootste getal. Tik op die kaart. / De meeste koekjes, dat zijn er 13. Tik op die kaart. | variatie |
| Tik op de kaart met het grootste getal. | blijft, en erbij: Zoek het grootste getal. Tik op die kaart. | variatie |
| Ja, daar liggen de meeste koekjes: 13. | blijft, en erbij: Ja, op deze kaart liggen de meeste koekjes. / Ja, 13 koekjes. Dat zijn de meeste. | variatie |
| Kijk, hier liggen de meeste koekjes: 13. | blijft, en erbij: Kijk, op deze kaart liggen de meeste koekjes. | variatie |
| Je koos weer 11. | blijft, en erbij: Je tikte weer op 11. / Weer 11, zie ik. | variatie |
| Je koos 15: zoveel liggen er in de volle rijen. | blijft, en erbij: Je hebt alleen de volle rijen geteld. Dat zijn er 15. / Je kwam op 15. Dat zijn alleen de volle rijen. | variatie |
| De rij die niet vol is, telt ook mee. Tel die erbij. | blijft, en erbij: Kijk ook naar de laatste rij en tel opnieuw. / Tel ook de kralen in de laatste rij. | variatie |
| 3 hints per soort, vast per vraag | dezelfde, en erbij: Probeer het nog eens. Tel elke kraal mee, ook de laatste. / Probeer het nog eens. Tel geen kraal 2 keer. / Probeer het nog eens. Tel de kralen en tik op het getal. De les kiest nu steeds een andere. | de hint was per vraag altijd dezelfde |
| Er is 1 kraal niet geteld. / Er zijn een paar kralen niet geteld. | blijven, en erbij: Je hebt 1 kraal overgeslagen. / Er ligt nog 1 kraal meer. (en zo ook bij "een paar") | variatie |
| Er is 1 kraal 2 keer geteld. / Er zijn een paar kralen 2 keer geteld. | blijven, en erbij: Je hebt 1 kraal 2 keer geteld. / Er ligt 1 kraal minder. (en zo ook bij "een paar") | variatie |
| Ook de kralen in de laatste rij tellen mee. | blijft, en erbij: De laatste rij is niet vol. Die hoort er ook bij. / De rij die niet vol is, telt ook mee. | variatie |
| Je telde er weer te weinig. / Je telde er weer te veel. / Je telde weer alleen de volle rijen. | blijven, en erbij: Het zijn er weer iets te weinig. / Weer iets te weinig, zie ik. (zo ook bij te veel) / Je hebt weer alleen de volle rijen geteld. / Dat zijn weer alleen de volle rijen. | variatie |
| Wijs elke kraal aan en zeg er 1 getal bij. / Zeg bij elke kraal 1 getal. Dan tel je er geen 2 keer. / Kijk ook naar de korte rij onderaan. | blijven, en erbij: We geven elke kraal een getal. Zo vergeten we er geen. / We geven elke kraal een getal. Zo tellen we er geen 2 keer. / De korte rij onderaan hoort er ook bij. | variatie; warmer ("we") |
| Je tikte op de kaart met de minste koekjes. | blijft, en erbij: Je koos de kaart met de minste koekjes. / Op die kaart liggen de minste koekjes. | variatie |
| Daar liggen veel koekjes, maar niet de meeste. | blijft, en erbij: Veel koekjes! Maar het zijn niet de meeste. / Dat zijn veel koekjes, maar niet de meeste. | variatie |
| Je koos weer de kaart met de minste. / We zoeken juist waar er het meest liggen. | blijven, en erbij: Dat is weer de kaart met de minste koekjes. / We zoeken de kaart met de meeste koekjes. | variatie |
| Je koos weer dezelfde kaart. / Als we tellen, zie je het verschil. | blijven, en erbij: Dat is weer dezelfde kaart. / We tellen de koekjes. Dan zie je het verschil. | variatie |
| Ja, het zijn 12 kralen. / Ja, 12 is evenveel. / Het zijn er 12. / 12 kralen, precies evenveel. / Ik heb ze nagekeken: 12 kralen. | blijven, en erbij: Er liggen 12 kralen. / Dat klopt, het zijn 12 kralen. | variatie (nu 7) |
| Ja, hier liggen de meeste. / Ja, 13 is meer dan 12 en 11. / Hier liggen er 13: de meeste. / 13 koekjes, dat is het meest. / Ik heb geteld en nagekeken: hier zijn er meer. | blijven, en erbij: Op deze kaart liggen de meeste koekjes. / Dat klopt, 13 koekjes is het meest. | variatie (nu 7); lof en reactie zeggen nooit 2 keer hetzelfde woord |
| Je kunt nu tellen hoeveel er zijn, en je ziet waar de meeste liggen. | blijft, en erbij: Je hebt goed gewerkt vandaag! Je hebt kralen geteld en de meeste koekjes gevonden. / Mooi gewerkt! Je ziet nu snel waar de meeste liggen. | variatie |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. | variatie |

## Aantal varianten per situatie

| Situatie | Kralen | Koekjes |
|---|---|---|
| Eerste zin na een keuze die niet goed is | 5 per soort (te weinig, te veel, dichtbij), 3 bij volle rijen | 3 per soort |
| Hint | 4 per soort, 3 bij volle rijen | 3 × 3 (de 2 delen wisselen los) |
| Uitleg bij de 2e keer | 3 per soort | 3 per soort |
| "Weer …" (2 keer dezelfde denkfout) | 3, met 2 soorten uitleg | 2, met 2 soorten uitleg |
| "Je koos weer …" | 3 | — |
| "Kom, we tellen samen." | 5 | 5 |
| Samen tellen: Bliepo begint, het kind is aan de beurt, klaar | 2 of 3 elk | 3, 3 en 2 |
| Hulphandje: aanmoediging | 5 | 5 |
| Hulphandje: wat te doen | 3 | 2 |
| De vraag nog een keer na de hint | 3 | 3 |
| Zin met het aantal na lof | 7 | 7 |
| Begin, naar de koekjes | 2 elk | |
| Slot en "Tik op de kaart." | 3 elk | |
| Lof, korte bevestiging, eindzin | het vaste rijtje uit BLIEPO-KARAKTER.md (wisselt al zonder herhaling) | |

## Past het in het tekstvak?

Met varianten kan een reactie langer worden dan vroeger. De les kiest daarom alleen varianten waarmee de hele reactie niet langer is dan de langste reactie van de eerste versie (die paste). Het fouttabel-script rekent na dat er altijd zo'n variant is.

## De fouttabel is strenger geworden

Het script `scripts/fouttabel-meer-minder-gouden.ts` loopt nu ELKE variant na, niet alleen de vaste zin:
- geen "fout" in welke zin dan ook;
- geen enkele zin bij een keuze die niet goed is noemt het antwoord;
- waar de richting ("meer", "te veel") maar 1 keuze zou overlaten, heeft geen enkele eerste zin of hint een richtingwoord (de lijst met richtingwoorden is langer geworden: ook "overgeslagen", "2 keer", "niet geteld", "laatste", "volle rijen", "zo veel");
- "te weinig" zegt nooit per ongeluk "te veel", en omgekeerd;
- het gekozen getal staat nooit 2 keer in 1 zin, en "10" staat maar 1 keer in de hint bij de koekjes;
- bij de koekjes wijst geen zin 1 kaart aan (links, rechts, midden) en noemt geen zin een aantal;
- elke zin bij het samen tellen noemt het goede aantal precies 1 keer;
- bij 1 vraag zegt Bliepo nooit 2 keer "dichtbij" of "bijna";
- elk rijtje heeft minstens 2 varianten en geen 2 dezelfde.

## Zinnen van Synthesis (More or Less en Color Count), in het Nederlands (besluit Sara, 17 november 2026)

Alleen de tekst, passend gemaakt voor groep 3. Geen audio, beeld of code.

| Synthesis zegt (vertaald uit INSPIRATIE.md) | Bij ons nu | Waar |
|---|---|---|
| geen zorgen, ik spring even bij om te helpen (en legt de blokken op een rij) | Geen zorgen. Ik leg de koekjes in rijen van 10. | 1e keer mis bij de koekjes (variant) |
| ik heb de blokken anders gelegd, zodat ze makkelijker te vergelijken zijn | Zo zie je beter waar de meeste liggen. | hint bij de koekjes, 2e deel (variant) |
| tik op elk blokje; ik houd het getal bij | Tik jij op de kralen in de laatste rij? Ik tel mee. | samen tellen (variant) |
| "dat klopt"; de oranje groep is hier de grootste | Dat klopt, 13 koekjes is het meest. / Dat klopt, het zijn 12 kralen. | zin met het aantal na lof (variant) |
| "6 rode vierkanten?" + hij denkt dat je er te veel hebt geteld | 13 kralen? Ik denk dat je er te veel hebt geteld. | kralen: eerste zin, te veel (variant) |
| er zijn er nog die we niet hebben geteld | 11 kralen? Je hebt ze nog niet allemaal geteld. | kralen: eerste zin, te weinig (variant) |
| probeer het nog eens; tel ze en tik op het getal | Probeer het nog eens. Tel de kralen en tik op het getal. | kralen: hint zonder richting (variant) |
| laten we ze tellen en kijken | Laten we ze samen tellen en kijken. | 2e keer mis (variant) |
| mooi werk; je krijgt groepen vergelijken door | Mooi gewerkt! Je ziet nu snel waar de meeste liggen. | slotzin (variant) |

## Niet gedaan, met reden (afgewezen)

- **"9 meer blokken? Niet helemaal." (Synthesis):** niet overgenomen. "Niet helemaal" klinkt bij ons als "fout" in andere woorden; Bliepo zegt wat het kind koos en wat hij ziet.
- **"Dat is niet wat ik erin zie; laten we hier even mee stoppen, we komen er later op terug" (Synthesis, 2e keer mis):** niet overgenomen. Bij ons stopt een vraag nooit: Bliepo doet het samen voor (BOUWREGELS 15.11).
- **"Je vindt dit best makkelijk, de volgende wordt moeilijker" (Synthesis):** niet overgenomen; de les maakt de vragen niet moeilijker als het goed gaat (de inhoud is die van de Squla-les).
- **"Dat is 'm" / "Netjes gedaan" / "Perfect" als lof:** niet gedaan. Lof komt uit het vaste rijtje van alle gouden lessen.
- **De vraag "Waar liggen de meeste koekjes?" en "Hoeveel kralen zijn het?" verder afwisselen:** niet gedaan. Dezelfde soort vraag heet overal hetzelfde (BOUWREGELS 3.11); de 2 vormen die er al waren, blijven.
- **"Evenveel" vervangen door "hetzelfde" of "gelijk":** niet gedaan. "Evenveel" is de schoolterm van deze les.
- **Bij de koekjes de aantallen noemen in de eerste zin of de hint ("op die kaart liggen er 12"):** niet gedaan. Dan kan het kind de getallen vergelijken zonder te kijken; de getallen komen pas bij het samen tellen (BOUWREGELS 15.17, 15.20).
- **De richting noemen bij elke keuze:** niet waar er dan nog maar 1 keuze overblijft. Daar zegt Bliepo alleen dat het dichtbij is.
- **"Hier liggen er 11. / Op deze kaart 13. / En hier 12." (samen tellen, 3 kaarten achter elkaar) in varianten:** niet gedaan. Het zijn al 3 verschillende zinnen in 1 rijtje van 3 kaarten.
- **De antwoorden bij de koekjes naar rechts onder Bliepo verplaatsen:** niet gedaan. De kaarten zijn voorwerpen in het beeld; die blijven in het beeld (BOUWREGELS 15.32, "niet te letterlijk").
