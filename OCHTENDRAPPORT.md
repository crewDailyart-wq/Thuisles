# Rapport — 29 oktober 2026: Synthesis-gedrag nagebouwd

## ⚠️ LATER VERVANGEN en LEGAL REVIEW REQUIRED (eerst lezen)

**LEGAL REVIEW REQUIRED — vóór de lancering door een jurist laten bekijken:**
- **Het gedrag van de 10 lessen** is precies nagedaan van Synthesis: de stappen, de volgorde, de vraagsoorten, de hulp bij 1× en 2× fout, en wanneer woorden kleuren, ringen verschijnen of iets doorgestreept wordt. De tekst is Nederlands en zelf geschreven, en de tekeningen zijn eigen werk. Toch is de opbouw van Synthesis.
- **De momenten van de geluidjes** (wanneer, hoe lang, hoe zacht) zijn gemeten bij Synthesis en nagedaan. Zie `GELUIDEN-BRONNEN.md`.
- **De vormen van de voorwerpen** (vogeltjes op een draad, bloempotten, ballonnen, lampen, munten, de wijzerklok, de klok van Sam, de digitale klok, het vlaggetje, de tijdboog, de pijlen en de kaarttekeningen) volgen Synthesis in vorm en plek. Ze zijn wel zelf getekend. Zie `VOORWERPEN-BRONNEN.md`.
- **PRIVACY REVIEW REQUIRED:** de voornaam van het kind gaat naar ElevenLabs, voor het stukje waarin Bliepo de naam zegt.

**LATER VERVANGEN:**
- **Alle 29 geluidjes** in `public/geluiden/les/`. Ze zijn CC0, van OpenGameArt (Kenney en anderen), dus gratis en ook voor een betaalde site toegestaan. Toch wil je ze later vervangen door eigen of ingekochte geluiden. De bronnen staan in `GELUIDEN-BRONNEN.md`.
- **De getekende voorwerpen** hierboven, als de jurist dat adviseert.

## Wat er gedaan is

- **Alle 10 lessen nagebouwd** naar het gedrag van Synthesis, in de stijl van Bliepo. Daarna steeds onze schermfoto's naast die van Synthesis gelegd. Een onafhankelijke controleur zocht dan de verschillen, en die zijn hersteld:
  - **verhaallessen:** 3 rondes, daarna geen echte verschillen meer;
  - **kloklessen:** 6 rondes.
  - De vergelijkingsfoto's staan in `VERGELIJKING/` (niet op GitHub).
- **Voorbeelden, Synthesis links en Bliepo rechts:** `VERGELIJKING/VOORBEELDEN/1-5.jpg` en `VERGELIJKING/VOORBEELDEN-KLOK/1-5.jpg`, met uitleg in `UITLEG.md`.
- **Kinderen die nog niet lezen:**
  - Bliepo leest alles voor: het verhaal, de vraag en zijn reacties.
  - De eerste keer dat een knop in een les verschijnt, noemt Bliepo hem en licht de knop op. Dat geldt voor Ja/Nee en andere keuzes, de getallen ("Tik op het goede getal."), het vraagteken, het vinkje, de pijl en het handje. Synthesis doet dat niet; wij wel, omdat groep 3 nog niet leest.
  - Tikt het kind op een keuze met een woord, dan leest Bliepo die voor.
  - In de andere 50 lessen gebeurde dat al met de aanwijzingen van Bliepo.
- **Geluidjes:**
  - Op dezelfde momenten als bij Synthesis, kort en zacht.
  - Een sfeergeluidje bij de voorwerpen: vogeltjes, bloemen, ballonnen, lampen en munten.
  - Een plopje bij elke knop in de hele kinderkant.
  - Als Bliepo praat, gaan de geluidjes zachter.
  - Uitzetten kan op twee plekken: het kind met het muzieknootje naast Pauze, de ouder met "Geluidjes in de lessen" bij het profiel van het kind.
- **Ook in 5 andere lessen iets verschoven** (tellen tot 120, getallenlijn, optellen tot 100). De laatste controle vond daar dat de vraag van Bliepo over de Pauzeknop viel, of dat de microfoon op de telefoon onder uit beeld viel. Hersteld door:
  - de vraag van Bliepo pas onder de Pauzebalk te laten beginnen;
  - bij 3 of meer keuzes Bliepo iets kleiner te maken;
  - op een staand scherm de Pauzebalk boven het speelvlak te zetten, en bij veel keuzes Bliepo met de microfoon naast zijn wolk.
  Er is niets weggehaald.
- **Bliepo wijst geen knop meer aan die al weg is.** Antwoordde een kind heel snel, dan zei hij nog "Tik dan op het vraagteken." zonder vraagteken (in 7 oudere lessen).
- **Snellere eindcontrole:** de controle vóór het opslaan onthoudt welke lessen al goed getest zijn. Zijn die niet veranderd, dan worden ze overgeslagen. Alles toch testen: `ALLES=1 npm run bewaak`.
- **Stem:** alle 1498 vaste zinnen zijn ingesproken door Ruth (ElevenLabs). In deze lessen is er geen browserstem.

## Controles (allemaal 0 fouten)

| Controle | Uitslag |
|---|---|
| Taal (LanguageTool, Hunspell, eigen regels) | 0 meldingen, 2176 zinnen |
| Rekenen | 288 vragen nagerekend, 0 fouten |
| Werking: alle 10 lessen helemaal uitspelen | 10 van 10, geen scherm zonder knop |
| Overlap (laptop, tablet, telefoon) | niets overlapt |
| Schermen (niets verdwenen, regel 1) | alles staat er nog |
| Vloeiend (regel 7) | alle 50 Phaser-schermen vloeiend; openen alleen op de echte site meetbaar |
| Stem en geluiden aanwezig | alle zinnen en alle 29 geluidjes aanwezig |

## Online

- **Staat online** sinds 29 oktober 2026, 22:20: https://thuisles-production.up.railway.app (versie a0b4de4).
- Online gecontroleerd: de 10 lessen en de andere pagina's openen, alle 50 Phaser-schermen lopen vloeiend (laptop én trage telefoon, openen onder 0,6 s), de stem van Ruth en de geluidjes komen binnen, en de 10 lessen zijn online doorgespeeld zonder fouten. 7 zijn helemaal uitgespeeld. Bij 3 lange lessen (kleine verhaaltjes, verstopte getallen, minuten later) was de proeftijd van 7 minuten op, maar ze liepen goed door. Op de laptop zijn alle 10 helemaal uitgespeeld.
- **Zelf nog doen:** zet in Railway bij *Variables* de nieuwe `ELEVEN_API_KEY`. Pas dan zegt Bliepo online de naam van het kind; de vaste zinnen werken al.
- **Terugdraaien** (als er toch iets mis is): vraag Claude "zet versie c5cdd55 terug online". Dat is de versie van vóór deze klus.

## Eerlijk: wat nog niet gelijk is aan Synthesis

**Verhaallessen**
- Het handje in de toets staat bovenaan bij het verhaal, niet boven de tekst van Bliepo.
- Na een toets laat Synthesis kaarten van gehaalde lessen en trofeeën zien. Wij doen dat niet; Bliepo stelt alleen de volgende les voor.
- In de verhalen staat "jij", niet de naam van het kind.
- De getallen in de toetsen zijn bij ons vast. Bij Synthesis veranderen ze bij elke start.
- Na "Afronden" komen er nog extra vragen, zodat elke les minstens 15 vragen heeft.
- Bloemen staan meteen in bloei, en om getallen en sommen staan geen vakjes. Dat heb jij zo besloten.
- De vogeltjes klinken pas als Bliepo even stil is. Bij Synthesis klinken ze net vóór de stem.

**Kloklessen**
- Synthesis onthoudt of een kind een les al eens perfect deed, en slaat dan de uitleg over. Wij niet; bij "Ja" krijgt het kind een korte proef.
- Door het Nederlands:
  - "half 8" in plaats van "half past 7";
  - de keuze "2 uur" in plaats van "13 uur";
  - een extra uitlegzin bij halve uren.
- "5 en 10 minuten later" is bij ons één les.
- Extra oefenvragen, zodat er minstens 15 vragen zijn.
- Bij veel fouten stopt de les niet vroeger.
- Wat het lesscherm regelt en dus overal hetzelfde is:
  - de knoppen komen pas als Bliepo uitgesproken is;
  - er is een knop "nog eens horen";
  - Ja en Nee zijn brede knoppen.
- Bliepo noemt de urenwijzer "oranje"; op het scherm is hij koraal.
- Nog niet met de hand getest: heel snel op een getal en meteen op het vinkje tikken.

**Algemeen**
- De eerste tik na het openen speelt een eenvoudig toontje, nog niet het echte plopje, want het geluid wordt dan nog geladen.
- Vraag aan jou: mag bij het profiel in het uitklapvak onder "…kindcode en Praten met Bliepo" ook "en Geluidjes in de lessen" komen te staan?

---

# Eerder: ochtendrapport — nacht van 28 oktober 2026

## De 10 nagebouwde lessen openen

Eerst `npm run dev` starten op de laptop. Daarna opent elke link de les als Testkind:

- Instaptoets verhaaltjessommen: http://localhost:3000/voorbeeld/les/verhaal-instaptoets?naam=Testkind
- Kleine verhaaltjes: http://localhost:3000/voorbeeld/les/verhaal-kleine-verhalen?naam=Testkind
- Grotere verhaaltjes: http://localhost:3000/voorbeeld/les/verhaal-grote-verhalen?naam=Testkind
- Verstopte getallen: http://localhost:3000/voorbeeld/les/verhaal-verstopte-getallen?naam=Testkind
- Eindtoets verhaaltjessommen: http://localhost:3000/voorbeeld/les/verhaal-eindtoets?naam=Testkind
- De urenwijzer: http://localhost:3000/voorbeeld/les/klok-urenwijzer?naam=Testkind
- Hele uren zetten: http://localhost:3000/voorbeeld/les/klok-hele-uren-zetten?naam=Testkind
- Halve uren: http://localhost:3000/voorbeeld/les/klok-halve-uren?naam=Testkind
- Kwart over: http://localhost:3000/voorbeeld/les/klok-kwart-over?naam=Testkind
- 5 en 10 minuten later: http://localhost:3000/voorbeeld/les/klok-minuten-later?naam=Testkind

## In het kort

- **6 rondes gedaan** (het maximum).
  - Elke ronde: taal, rekenen, de les uitspelen, schermfoto's op laptop, telefoon en tablet, en keuren door onafhankelijke helpers.
- **Taal:**
  - LanguageTool, Hunspell en de eigen regels geven nu **0 meldingen**.
  - Een onafhankelijke "juf van groep 3" vond in ronde 1 **95 punten** en in ronde 2 nog **17**. Die zijn verbeterd, behalve wat bij andere lessen hoort.
  - Verder zijn zo'n 220 zinnen verbeterd in de controles op moeilijke woorden en strenge taal.
- **Rekenen:** **280 vragen** zelf nagerekend, met goed, 1× fout, 2× fout en "weet ik niet".
  - Gevonden: 1 fout, hersteld.
  - Nu: **0 fouten**.
- **Werking:** alle 10 lessen spelen **helemaal uit** op laptop, telefoon en tablet. Dat is 30 van de 30 keer, met nergens een scherm zonder knop.
- **Schermen:** ruim **5400 schermfoto's** gemaakt, en zo'n 3500 daarvan zijn door onafhankelijke keurders bekeken.
  - Het aantal echte punten per ronde zakte van ongeveer 118 naar een klein aantal kleine punten.
  - Er zijn **ongeveer 35 echte fouten** hersteld. De belangrijkste:
    - de les bleef hangen als het kind op de kaart tikte terwijl Bliepo nog praatte (dit gold voor alle lessen);
    - Bliepo's tekst was leeg naast de keuzes;
    - de tekst viel over de naambalk;
    - Bliepo werd op telefoon en tablet uit beeld geduwd.
- **Vloeiend (regel 7):** alle 10 lessen halen 60 beelden per seconde op de laptop en op een nagebootste trage telefoon.
- **Niet online gezet.** In de laatste ronde vonden de keurders nog een paar kleine punten. Een volledige ronde met 0 punten is er dus niet gekomen, en jouw regel was: alleen online als alles groen is. Alles staat lokaal en is **niet gecommit**.

## Vragen per les (minimaal 15)

Per les zijn alle routes samen nagerekend (goed, fout, "weet ik niet"). Elk kind krijgt minstens 15 vragen.

| Les | Nagerekende vragen |
|---|---|
| Instaptoets verhaaltjessommen | 33 |
| Kleine verhaaltjes | 18 |
| Grotere verhaaltjes | 29 |
| Verstopte getallen | 29 |
| Eindtoets verhaaltjessommen | 33 |
| De urenwijzer | 27 |
| Hele uren zetten | 15 |
| Halve uren | 31 |
| Kwart over | 23 |
| 5 en 10 minuten later | 37 |

## Nieuwe controles (blijven bestaan)

- `npm run taal`: LanguageTool, Hunspell en de eigen regels. De gereedschappen staan in `~/.thuisles-taal`.
- `npm run reken`: rekent elke vraag na.
- `npm run speel`: speelt elke les uit.
  - Met `SCHERMFOTO=map` maakt het van elk scherm een foto.
  - Met `APPARAAT=telefoon` of `APPARAAT=tablet` speelt het op dat apparaat.
  - Het faalt bij een scherm zonder knop of bij een zin die naar een knop verwijst die er niet is.
  - Bij elke fout maakt het een foto.
- `npm run overlap`: kijkt of iets over elkaar ligt of buiten beeld valt, ook de tekst van Bliepo over een knop.
- `npm run speel` en `npm run overlap` draaien vóór elke commit mee, maar alleen voor de lessen die je veranderd hebt.
- De foto's staan in `SCHERMEN-CONTROLE/ronde2` t/m `ronde6` en de keuringen in `keuring-*.md`. De taalverslagen staan in `TAAL-CONTROLE/`. Niets hiervan komt in Git.

Alleen de 10 nagebouwde lessen:
- Verhaaltjessommen: Instaptoets, Kleine verhaaltjes, Grotere verhaaltjes, Verstopte getallen, Eindtoets. De bloementuin hoort hier ook bij.
- Klok: De urenwijzer, Hele uren zetten, Halve uren, Kwart over, 5 en 10 minuten later.

Vooraf zijn er reservekopieën gemaakt in `backups/voor-nachtronde-*` en `backups/voor-schermencontrole-*`. Er is niets verwijderd.

## Keuzes die ik zelf heb gemaakt (bij twijfel de veiligste)

- **LanguageTool en Hunspell:**
  - Op de laptop staan geen Java en geen Homebrew.
  - Java (Temurin 21) en LanguageTool 6.6 staan daarom in de map `~/.thuisles-taal`. Daarbij is niets aan het systeem veranderd.
  - Voor Hunspell gebruik ik `nspell`: dat leest dezelfde Hunspell-woordenboeken, met het Nederlandse woordenboek van OpenTaal.
- **Extra "Weet ik niet"-knoppen** op plekken waar Synthesis die knop niet heeft (klok, toetsen, omwisselen): laten staan. Weghalen mag niet zonder jouw toestemming.
- **Gemiste vragen komen terug** in de klokles. Dat doet Synthesis niet. Ik heb het laten staan, omdat het helpt om aan minstens 15 vragen te komen.
- **"Afronden of nog één?"** (Kleine en Grotere verhaaltjes): Synthesis laat het kind kiezen. Bij ons komt het extra verhaal altijd. Zo blijft de les op minstens 15 vragen. Dit is niet veranderd.
- **Hele uren zetten:** de vraag met de klok van 11 uur staat er altijd. Bij Synthesis komt die alleen na een fout. Hij blijft staan, voor de 15 vragen.
- **Bloemen** zijn altijd een hele bloem in een pot, ook waar Synthesis een kiemplantje laat zien. Dat is jouw regel: het plaatje past bij het woord.

## Wat er is gecontroleerd

### Ronde 1

**Taal**
- `npm run taal` (nieuw):
  - Haalt alle zinnen uit de 10 lessen, zo'n 2000 stuks.
  - Laat ze nakijken door LanguageTool (Nederlands) en Hunspell (nl, OpenTaal), plus eigen regels voor fouten die al eens voorkwamen, zoals "lampen zijn aan" en "1 lampjes".
  - Eerst: 189 meldingen, bijna allemaal ruis (tekenpaden, knoppen die met een kleine letter beginnen).
  - Echt waren er 3. Die zijn hersteld: "kwart over-tijden", "Hmm" en de lampzinnen.
  - Nu: **0 meldingen**.
- Een **onafhankelijke "juf van groep 3"** las alle zinnen zonder de code te kennen. Zij vond **95 punten**:
  - 34 onnatuurlijk Nederlands, 24 niet overal hetzelfde gezegd, 12 te moeilijk, 9 inhoudelijk, 6 leestekens, 2 spelling, 2 Engels, 1 tijdnaam, en 5 keer ruis.
  - **Ongeveer 56 hersteld.** 17 waren geen echte fout (met reden). 22 horen bij lessen die niet zijn nagebouwd; die zijn niet aangeraakt.
  - Voorbeelden van herstel:
    - "Getallen zijn cijfers" is nu "Getallen schrijven we met cijfers".
    - "Een klok telt niet tot 60" is nu "Er is geen 7:60".
    - De urenwijzer "laat het uur zien" (eerst stonden er 4 verschillende werkwoorden).
    - Overal "Hoe laat is het?".
    - De knop heet overal "Weet ik niet".
    - "Wordt de tuin groter?" is nu "Zijn er dan meer of minder bloemen?". De knoppen zijn nu Meer en Minder.
    - "het bad is over 15 minuten" is nu "…over 15 minuten vol".
    - "tussendoortje" is nu "pizza".
    - "13 uur" als foute keuze is nu "2 uur".
- Eerder vannacht:
  - een strenge taalcontrole (42 zinnen);
  - een controle op moeilijke woorden voor 6-jarigen (176 plekken);
  - "Er branden 18 lampen";
  - ballonnen die knappen als je erop tikt: "Tik op de ballonnen die wegvliegen";
  - de afsluitzin van Aftrekken is nu "Goed gedaan! Tot de volgende keer."

**Rekenen**
- `npm run reken` (nieuw):
  - Speelt de 10 lessen in de computer door, met goed, 1× fout, 2× fout en "weet ik niet" bij elke vraag.
  - Rekent elk antwoord zelf uit, los van de les.
  - Controleert de keuzes: het goede antwoord staat er precies één keer tussen, en de foute keuzes zijn echt fout.
  - Controleert de getallen in de hulpzinnen, en wat er na 2× fout gebeurt.
- Uitkomst: 275 vragen. **1 fout gevonden en hersteld.** Bij Halve uren stond de klok soms op de verkeerde tijd na een gemiste proefvraag. Nu: **0 fouten**.

**Synthesis**
- Een helper heeft elke les stap voor stap vergeleken met de analyse in `SYNTHESIS-ANALYSE/`. Het verslag staat in `VERGELIJKING-ronde1.md`.
- **6 dingen hersteld**:
  - de pijl vóór de pauze bij 2× fout;
  - de vraag "wat moeten we bij 5 doen om 9 te krijgen?";
  - "Weet ik niet" na het weghalen;
  - 5 munten en 15 lege rondjes bij de controle;
  - de pijl bij "kleur een kwart in";
  - de bonusvraag van deel 2 bij Minuten later.

**Schermen**
- Nieuwe bloemen: altijd een hele bloem.
- Getallen in de tekst staan in hetzelfde lettertype als de rest van de zin. Eerst stond er een letter met schreef.
- Bij het omwisselen verdwijnt de oude vraag, zodat het scherm één stap laat zien.
- Na een tik op de pijl verdwijnt de aanwijzing "Tik dan op de pijl". Die bleef eerst bij de volgende stap staan, terwijl er geen pijl meer was. Dit is gevonden met het speelscript en geldt voor alle lessen.

### Ronde 2: schermen en werking

**Eerste keuring van de schermen**
- Twee onafhankelijke keurders bekeken 273 schermfoto's van de verhaaltjessommen en vonden 118 punten.
- Een deel daarvan kwam door het testen zelf. Het script speelde drie lessen tegelijk in één browser, en dan liet de grafische kaart Bliepo en de vogeltjes soms niet goed zien. In één les tegelijk was alles goed.
- Daarom krijgt elk testprogramma nu een eigen browser, en is alles opnieuw gefotografeerd.

**Echte fouten die zijn hersteld**
- **De les bleef hangen als het kind op de kaart tikte terwijl Bliepo nog praatte.** Dan telde de les niet als af. Dit geldt voor alle lessen en is nu hersteld.
- **Bliepo's tekst was soms leeg naast de keuzes**, bijvoorbeeld bij Erbij/Eraf en bij de sommen. Dat gebeurde als Bliepo een knop aanwees zonder iets te zeggen. Nu blijft zijn vraag staan.
- **"Tik dan op de pijl" bleef staan** terwijl de pijl al weg was. Die zin verdwijnt nu na de tik.
- **Lange vragen van Bliepo vielen over de naam- en pauzebalk** rechtsboven. De kolom van Bliepo begint nu onder die balk.
- **"1 vogeltjes"** is nu "1 vogeltje", en zo ook bij bloemen, lampen, munten en de rest.
- **Het vraagteken in het antwoordvakje** was wit op crème en bijna onzichtbaar. Het is nu donkerblauw.
- **"Een paar" in lichtblauw** was slecht leesbaar op de blauwe achtergrond. Dat is nu warmgeel.
- **De cijfertegels en knoppen** stonden in een ander, kleiner lettertype. Ze hebben nu hetzelfde lettertype als de zin van Bliepo, en de cijfers zijn groter.
- De overlapcontrole kijkt nu ook of de tekst van Bliepo over een knop valt.

**Hulpjes voor de tests, voor het kind verandert er niets**
- Het speelscript kan nu de klok zetten en wijzers slepen. De klok heeft daarvoor een testhaakje `klokZet` gekregen, net als de andere lessen.
- Het script kan nu ook doortellen op het rooster en op plaatjes tikken.

### Ronde 3: schermen opnieuw gekeurd, taal opnieuw gelezen

**Schermen**
- Keurders bekeken 510 laptopfoto's (ronde 2) en 380 (ronde 3).
- Het aantal punten zakte van 118 naar ongeveer 90 en daarna naar ongeveer 55. Daarvan was een groot deel geen echte fout:
  - dingen die Synthesis ook zo doet, zoals doorgestreepte getallen, lege vakjes en een klok van Sam die bewust fout staat;
  - "geen uitleg te zien", terwijl die uitleg net daarvoor werd voorgelezen.

**Echte fouten die zijn hersteld**
- Met 3 of 4 keuzes schoof de vraag van Bliepo omhoog, over de naam- en pauzebalk.
  - Keuzes met woorden of sommen staan nu twee naast elkaar.
  - De kolom van Bliepo komt nooit meer boven de balk uit.
- De cijfertegels 1–9 stonden soms rechts, twee naast elkaar. Nu staan ze altijd links in het rooster van drie, zoals Synthesis.
- De knoppen hebben nu hetzelfde lettertype als Bliepo's zin, ook even dik.
- Het knopje "nog eens horen" lag op Bliepo's antennes. Er is nu ruimte tussen.
- Na het tikken op vogeltjes of ballonnen bleven de nummertjes op de lege plekken staan, ook bij "hoeveel zijn er nog?". Ze gaan nu weg.
- Bij de lampen in de toetsen leken de lege plekken op lampen die uit waren, waardoor het aantal niet leek te kloppen. Lege plekken zijn nu stippelrondjes, zoals de omtrekken bij Synthesis. Lampen die uitgaan worden grijs.
- Bij Grotere verhaaltjes zei Bliepo "Er branden nog 8 lampen" terwijl er 20 brandden. Nu gaan de lampen ook echt uit. Bij ballonnen die wegvliegen gebeurt dit niet, zodat ze niet knappen.
- Als Bliepo een knop aanwees, verdween zijn vraag. Nu komt de vraag terug.
- Sam (bij de klok) stond over het microfoonknopje. Hij is iets naar links geschoven.
- Halve uren:
  - "Naar welk getal is hij op weg?" had tijden als antwoord. Nu volgt "Hoe laat is het dan?".
  - "zijn punt" is nu "de punt van de urenwijzer".
  - "De minutenwijzer weet precies waar" is nu "De minutenwijzer laat zien hoe ver we zijn".
- Dezelfde vraag stond op 5 manieren in de verhaaltjessommen. Nu staat er overal "Kun je deze zelf oplossen?".

**Taal, ronde 2**
- De juf las alle zinnen opnieuw en vond 17 punten:
  - 5 hersteld, bijvoorbeeld "Ik lees jouw verhaal voor" en "Een kwart is één van de vier gelijke stukken";
  - 6 waren al goed of kwamen van het uitlezen;
  - 6 horen bij lessen die niet zijn nagebouwd.

### Ronde 4 en 5

**Laptop**
- Het aantal punten van de keurders zakte verder: van ongeveer 55 naar ongeveer 45, en daarna naar 11 kleine punten of twijfels.

**Hersteld in deze rondes**
- De getallen in Bliepo's zin hadden de kleuren van de getallentegels. Geel en paars waren slecht leesbaar op blauw. Nu hebben ze dezelfde kleur als de zin.
- Bliepo is in de kolom iets kleiner (in dezelfde verhouding), zodat zijn vraag, de keuzes en hijzelf altijd samen passen.
- Getalkeuzes staan drie op een rij.
- Het verhaal breekt netjes af, zonder een los "nog?" op een regel.
- Bij een nieuw verhaal dat het kind zelf maakt, gaat het oude verhaal eerst weg.
- "Dat zien we later" is nu "Deze vraag komt straks nog een keer terug". Het antwoord wordt daarvoor al gezegd.
- "Voordat we hem oplossen: welke som past…" is nu "Eerst nog iets. Welke som past bij het verhaal?".
- Het digitale klokje staat iets lager, zodat het de gele boog bij Minuten later niet bedekt.

**Telefoon en tablet (staand)**
- Bij veel keuzes werden Bliepo en de microfoon onder uit beeld geduwd.
- Nu staat Bliepo met de microfoon naast zijn wolk, alleen in de 10 nagebouwde lessen. De nette knoppen gelden nu ook staand.
- Sam staat iets lager en niet meer over de naambalk.

**Vloeiend (regel 7)**
- Alle 10 lessen halen 60 beelden per seconde op de laptop en op de nagebootste trage telefoon.
- Eén meting gaf eenmalig één beeld van 53 ms. Opnieuw gemeten: 38 ms, en dat is goed.
- De opentijd is alleen in de ontwikkelversie gemeten. Die is trager dan de echte site, dus dit zijn waarschuwingen en geen fouten.

### Ronde 6 (laatste)

- Alle 10 lessen spelen uit op telefoon, tablet en laptop.
- Staand staat de microfoon nu in de kolom van Bliepo, boven hem. Hij lag eerst over de wolk en de cijfertegels.
- De keurder van de telefoon vond nog ongeveer 54 kleine meldingen. Een deel daarvan komt door het moment van de foto: de klok draaide nog, of de tekst was een seconde oud.
- Echte punten die nog open staan, staan hieronder.

## Nog niet opgelost

- **Op de telefoon staat het verhaal bovenaan erg klein**, ongeveer 12 pixels. Ook de vogeltjes en ballonnen zijn klein om op te tikken. Dat komt door de bestaande telefoonindeling: het hele lesvlak wordt kleiner gemaakt. Daarvoor is een eigen telefoonindeling nodig. Dat is een grotere verandering die ik niet zonder jou wil doen.
- **Op de tablet staand staat de klok rechts van het midden.** Links is veel lege ruimte. Ook dit komt door de bestaande staande indeling.
- **Bij "welke som past" bij Verstopte getallen** zijn "? + 5 = 9" en "5 + ? = 9" allebei keuzes. Rekenkundig zijn ze allebei goed, maar alleen de eerste volgt het verhaal. Synthesis doet het zo. Wil je dat een van de twee iets echt fouts wordt?
- **Twee soorten lege plekken** bij de lampen staan alleen in de toetsen. In de les Grotere verhaaltjes zijn er geen lege plekken, dus daar speelt het niet.
- **"Een paar"** gebruik ik als vaste woorden voor een aantal dat je nog niet weet, net als "some" bij Synthesis. Een juf vond het raar bij 11 of 17. Ik heb het laten staan.
- **Buiten de nagebouwde lessen** (niet aangeraakt, volgens jouw opdracht):
  - de digitale klok ("urenkant", "minutenkant", minuten in "paars" terwijl ze blauwgroen zijn);
  - Tellen in vijven ("55 …." met een punt te veel);
  - Hoe lang samen ("12 en 6 minuten is samen" moet "zijn" zijn, en "4 min 9");
  - de oude verhaaltjessommen.
- **Kleine punten uit de laatste keuring**:
  - Bij Minuten later is het vlaggetje bij de klok niet uitgelegd, en de getalletjes op de gele boog zijn klein.
  - Bij "Heeft Sam gelijk?" staat niet op het scherm wat Sam zei. Bliepo zegt het wel.
  - Bij Verstopte getallen staan sommige vragen op de lichte glansband van de achtergrond. Wit op licht is daar minder goed te lezen.
  - "Kun je die er nu bij doen?": het woord "die" is op het scherm niet duidelijk.
  - De ontwikkelmelding "Compiling…" linksonder komt alleen in de ontwikkelversie voor, niet op de echte site.
- **Bewust niet weggehaald**, omdat weghalen jouw beslissing is:
  - de extra "Weet ik niet"-knoppen waar Synthesis die niet heeft;
  - de vragen die in de klokles terugkomen;
  - de vraag met de klok van 11 uur bij Hele uren zetten.
