# WIJZIGINGEN-ZINNEN-REKENMIX1 — oud naast nieuw

18 november 2026. Opdracht van Sara: Bliepo klinkt als een warme juf, niet als een robot. Zelfde aanpak als de proefles Tellen (WIJZIGINGEN-ZINNEN-TELLEN.md) en de lessen Splitsen, Plussommen, Minsommen, Meer-minder, Huisnummers, Meten, Getallenlijn, Geld, Klok, Vormen en Dagen, nu voor de gouden les Rekenmix 1 (`squla-rekenmix-mix1-1-gouden`). Rekenmix 1 heeft geen extra les. Alle 15 vragen zijn telvragen; ze volgen de gouden les Tellen.

**Rekenmix 2, 3 en 4 zijn niet veranderd.** Ze lezen een paar zinnen uit het zinnenbestand van Rekenmix 1 (`ZIN`, `TELREACTIE`, `plekken`). Die staan er nog precies zoals ze waren. De nieuwe zinnen staan in een nieuw deel van hetzelfde bestand (`RM`, `TELREACTIE_RM`, de fout-varianten en `foutReactie`), en alleen Rekenmix 1 gebruikt ze. De gedeelde bestanden (de vaste rijtjes, `nooit-dubbel.ts`, de zinnen van Tellen) zijn niet aangeraakt. De oude les (`squla-rekenmix.tsx`) ook niet.

**Niets is weggegooid.** De oude zinnen staan nog letterlijk in de code en hieronder naast de nieuwe. Wat Bliepo niet meer zegt, staat ook in WEGGEHAALD.md.

**Niet veranderd:** de 15 vragen, de dingen, de aantallen, de 3 keuzes, de volgorde, de manier van liggen, en de betekenis van elke zin. De vraag "Hoeveel ballen zie je?" en "Tel ze en tik op het goede getal." zijn precies gelijk gebleven (3.11, 15.36). De vaste rijtjes van alle gouden lessen (lof, "nu is het goed", eindzinnen, groet, overgang) zijn niet aangeraakt.

**Alle varianten op een rij:** FOUTTABEL-squla-rekenmix-mix1-1-gouden.md, §6.

## Hoe "nooit 2 keer hetzelfde" werkt

Net als bij Tellen: voor elke situatie die terugkomt is er een rijtje zinnen. De les kiest er willekeurig 1, maar nooit dezelfde als de vorige keer, ook niet over vragen heen. "Je koos 7." en "Je koos 9." tellen als dezelfde zin, en ook "Tik op elke bal." en "Tik op elk potlood.". De kiezer is de gedeelde kiezer `nooit-dubbel.ts` (niet veranderd). De les en het fouttabel-script gebruiken dezelfde functie (`foutReactie` in het zinnenbestand), zodat het script precies keurt wat het kind hoort.

## Deel A — verbeterde zinnen

| Oud | Nieuw | Waarom |
|---|---|---|
| (na de hint stond alleen de hint) "Tel nog eens, rij voor rij. Sla er geen bal over." | Tel nog eens, rij voor rij. Sla geen bal over. **Hoeveel ballen zie je?** (of "Hoeveel zijn het er dan?" of "Tik dan op het goede getal.") | na de hint stond er geen vraag in beeld (15.37, F16); "er" hoort er niet |
| Begin linksboven en tel opnieuw. Wijs elke … aan. | Begin bovenaan en tel opnieuw. Wijs elke bal aan. | "linksboven" is lastig voor groep 3 (zoals bij Tellen) |
| Begin linksboven en tel rustig. Wijs elke … 1 keer aan. | Begin bovenaan en tel rustig. Elke bal telt 1 keer mee. | idem |
| Laten we ze samen natellen. | Ik tel ze hardop voor je. Tel maar mee! / Kom, ik tel ze hardop. Tel maar mee! / Laten we ze samen tellen. Ik tel hardop. | "natellen" is een moeilijk woord; nu zegt Bliepo wat hij doet |
| (Bliepo telt "… 6. 7.") Zie je? Het zijn er 7. Je had het precies goed. | (Bliepo telt "… 5. 6.") En 7! Je had het precies goed. / En de laatste is 7. Jij had het goed geteld. / En 7! Zie je? Je zat precies goed. | het laatste getal klonk 2 keer achter elkaar ("7. Zie je? Het zijn er 7.") |
| 10. Samen telden we 10 ballen. | En 10! Zoveel ballen zijn het. / En 10! Nu hebben we ze samen allemaal geteld. / En de laatste is 10. Zoveel ballen zijn het. | het getal staat er 1 keer; 3 versies |
| Je telde allerlei dingen, tot wel 12. | Je hebt allerlei dingen geteld, tot wel 12! / Wat heb jij veel dingen geteld: tot wel 12! / Knap, hoor! Je hebt helemaal tot 12 geteld. | natuurlijker en vrolijker |
| … is te weinig. | Je koos 9. Er liggen er nog meer. / 9? Ik zie er nog meer. (en 4 andere) | klonk streng |
| … is te veel. | Je koos 11. Dat zijn er iets te veel. / Bijna! 11 is iets te veel. (en 4 andere) | klonk streng |
| … is dichtbij. | Je koos 9. Je zit er dichtbij. / Bijna! 9 is het net niet. / 9? Dat is heel dichtbij. (5 versies) | te kaal; nu zegt Bliepo eerst wat het kind koos |
| … is dichtbij, maar je hebt ze nog niet allemaal geteld. | Je zit er dichtbij met 9. Je hebt ze nog niet allemaal geteld. | te lange zin; nu 2 korte zinnen |
| … is dichtbij, maar dat is te veel. | Je zit er dichtbij, maar 11 is te veel. | natuurlijker |
| Kom, samen tellen we ze. / We tellen ze samen. | Kom, we tellen ze samen. / Weet je wat? We tellen ze samen. / Geeft niks. We tellen ze samen. / Ik help je even. We tellen ze samen. / Laten we ze samen tellen en kijken. | omgekeerde zin klonk raar; "We tellen ze samen." was te kaal |
| (2 keer hetzelfde getal) Je koos weer 9. | blijft, en erbij: Je tikte weer op 9. / Weer 9, zie ik. | variatie |

## Deel B — dezelfde betekenis, nu in varianten

| Oud (1 zin) | Nieuw (versies) |
|---|---|
| In deze les tel je allerlei dingen. | blijft, en erbij: Vandaag gaan we allerlei dingen tellen. / We gaan samen van alles tellen. |
| Tik op elke bal. Ik tel mee. (elk potlood) | blijft, en erbij: Tik elke bal aan. Ik zeg het getal. / Tik op alle ballen. Ik tel hardop mee. |
| Tik op een bal zonder nummer. | blijft, en erbij: Zoek een bal zonder nummer en tik erop. / Welke bal heeft nog geen nummer? Tik erop. |
| Je bent goed bezig. / Jij kunt dit. | blijven, en erbij: Het gaat goed zo. / Probeer het maar. / Toe maar, je doet het goed. |
| Kijk, ik tel de rest. Het zijn er 10. | blijft, en erbij: Kijk, ik tel even verder. Het zijn er 10. |
| Tik op de kaart. | blijft, en erbij: Tik maar op de kaart. / Kijk, een kaart voor jou! Tik erop. |
| Ja, er zijn er 7. / Het zijn er 7. / Ik heb ze nagekeken: het zijn er 7. | blijven, en erbij: "7 appels, precies!", "Precies, 7 appels." en "Dat klopt, er zijn 7 appels." (die laatste 2 zijn van Synthesis); nu 8 zinnen |
| Ja, je telde ze allemaal: 7. / Je telde er 7. | Ja, je hebt ze allemaal geteld: 7. / Je hebt er 7 geteld. (natuurlijker Nederlands, zoals bij Tellen) |
| Er mist nog 1 bal. / Er missen nog een paar ballen. | blijven, en erbij: Er ligt nog 1 bal meer. / Je hebt 1 bal overgeslagen. / Je hebt 1 bal niet geteld. (en zo bij een paar) |
| Er is 1 bal 2 keer geteld. / Er zijn een paar ballen 2 keer geteld. | blijven, en erbij: Je hebt 1 bal 2 keer geteld. / Je telde 1 bal te veel. (en zo bij een paar) |
| Je telde er weer te weinig. / Je telde er weer te veel. | blijven, en erbij: Het zijn er weer iets te weinig. / Weer iets te weinig, zie ik. / Je hebt er weer te weinig geteld. (en zo bij te veel) |
| Elke bal krijgt 1 nummer. Dan sla je er geen over. (en: Dan tel je niets 2 keer.) | blijven, en erbij: We geven elke bal een nummer. Zo vergeten we er geen. / … Zo tellen we er geen 2 keer. |
| Hints: 3 per soort en manier van liggen | 4 per soort (5 zonder richting), passend bij rijen, door elkaar of 2 aan 2 |

## Aantal varianten per situatie

| Situatie | Aantal |
|---|---|
| Eerste zin na een antwoord dat niet goed is | 5 zonder richting, 6 bij te weinig of te veel (4 als het 3 of meer scheelt: dan geen "dichtbij", "bijna", "iets") |
| Hint | 4 per soort, 5 zonder richting, per manier van liggen |
| De vraag terug na de hint | 3 |
| Uitleg bij de 2e keer | 3 of 4 |
| "Weer …" (2 keer dezelfde denkfout) | 4 (2 als het 3 of meer scheelt), met 2 soorten uitleg |
| "Je koos weer …" | 3 |
| "Kom, we tellen ze samen." | 5 |
| Samen tellen: opdracht, hulphandje, klaar | 3, 5 × 3, 3 |
| Bliepo telt de rest zelf (vangnet) | 2 |
| Zin met het aantal na lof | 8 |
| Begin, natellen, na het natellen, slot, kaart | 3 elk |

## De fouttabel is strenger gemaakt (zoals bij Tellen en Dagen)

`npx tsx scripts/fouttabel-rekenmix-gouden.ts` loopt nu ALLE varianten na, voor elk antwoord dat niet goed is (30 antwoorden in 15 vragen):

- **Verklappen (15.17):** 697 combinaties van eerste zin en hint. Er blijven altijd minstens 2 keuzes over, met het goede erbij. Zonder richting ook geen richtingwoord. Geen variant noemt het goede getal.
- **Waarheid:** 772 beweringen ("dichtbij", "bijna", "iets" en "een klein beetje" alleen bij hooguit 2 verschil; "rij voor rij" en "bovenaan" alleen bij rijen; "van links naar rechts" alleen bij 2 aan 2; "van boven naar beneden" alleen bij door elkaar; "1 bal" alleen bij precies 1 verschil; "een paar" alleen bij 2 of meer).
- **Geen opdracht bij de 2e keer**, nooit het woord "fout" of "vinkje", geen getal 2 keer in 1 zin, geen zin langer dan 14 woorden, elk getal heeft een kleur of wit.
- **Altijd een vraag of opdracht na de hint (15.37, F16):** na elke hint passen minstens 2 versies van de vraag in het tekstvak.
- **Past in het tekstvak:** elk stuk hooguit 110 tekens en 3 zinnen. Die eis gaat vooraf uit de lijst.
- **Nooit 2 keer hetzelfde:** de les-functies zijn met de kiezer 20.000 keer nagespeeld (± 32.000 reacties, ± 100.000 stukken): 0 keer dezelfde zin 2 keer achter elkaar, 0 keer een getal uit de eerste zin in de hint, 0 keer een stuk 2 keer in 1 reactie, 0 keer 2 keer "dichtbij" bij 1 vraag, 0 keer te lang.

## Zinnen van Synthesis (Color Count), in het Nederlands

Dezelfde als bij Tellen (besluit Sara 17 november 2026): "11 ballen? Ik denk dat je er te veel hebt geteld.", "9 ballen? Je hebt ze nog niet allemaal geteld.", "Probeer het nog eens. Tel de ballen en tik op het getal.", "Laten we ze samen tellen. Ik tel hardop.", "Kijk, daar heb je het: 7. Je zat precies goed.", "Laten we ze samen tellen en kijken.", "Precies, 7 appels.", "Dat klopt, er zijn 7 appels.", "Knap, hoor! Je hebt helemaal tot 12 geteld.", en "Geeft niks. We tellen ze samen.".

## Niet gedaan, met reden

- **De vraag "Hoeveel … zie je?" afwisselen:** niet gedaan. Dezelfde soort vraag heet overal hetzelfde (3.11). Alleen de vraag die na een hint terugkomt heeft 3 versies.
- **De zinnen van Rekenmix 2, 3 en 4:** niet aangeraakt (niet deze les). Ze gebruiken nog de oude `ZIN` en `TELREACTIE` uit dit bestand.
- **De vaste rijtjes (lof, "nu is het goed", eindzinnen, groet, overgang):** niet herschreven. Die zijn van alle gouden lessen samen.
- **"1." en "11." met de stem van Ruth:** `npm run stemdubbel` meldt dat die 2 opnames het woord 2 keer bevatten (al bekend, F8). Deze les telt hardop en gebruikt "1.". De gouden lessen knippen dat al af; een nieuwe opname kost tegoed en kan pas met Sara's ja.
