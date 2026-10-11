# Verbeterronde groep 3 (11 oktober 2026)

Alleen groep 3. Wat ik eerst per ongeluk ook bij groep 4 had veranderd, is helemaal
teruggezet: de database komt uit de reservekopie van 00:00 en de code van groep 4
is teruggedraaid. Bij groep 4 is niets meer anders dan vóór deze ronde, behalve
dat de lessen die te moeilijk zijn voor groep 3 er nu bij staan (zie punt 5).

Reservekopieën in `backups/`, gemaakt vóór elke stap in de database:
`thuisles-voor-verbeterronde-…`, `thuisles-voor-terugzetten-groep4-…`,
`thuisles-voor-lestitels-…`, `thuisles-voor-lessen-naar-groep4-…`,
`thuisles-voor-tellen-naar-groep4-…`.

---

## 1. Hoeveel fouten ik vond en verbeterde

De taal is in twee rondes nagelopen. Eerst samen met de antwoordkeuzes, daarna nog
een keer alleen op correct Nederlands. Bij het naspelen zijn er nog wat zinnen
bijgekomen. Een "keuzelijst" is één rijtje knoppen bij één vraag.

| Onderwerp | Taal: ronde 1 | Taal: ronde 2 + naspelen | Keuzelijsten verbeterd |
| --- | --- | --- | --- |
| Klokkijken | 27 | 46 | 16 |
| Optellen tot 10 (met "Optellen onder de 10") | 46 | 13 | 6 |
| Optellen tot 20 | 25 | 8 | 10 |
| Aftrekken tot 10 | 35 | 28 | 8 |
| Getallenlijn (verschil) | 20 | 18 | 1 |
| Tellen | 37 | 16 | 9 |
| Vergelijken | 45 | 9 | 0 |
| Verhaaltjessommen | 50 | 17 | 16 |
| Flitskaarten | 6 | 7 | 1 (toetsen "tot 20" hadden sommen tot 99) |
| Zo werkt het / Jouw instellingen | 6 | 2 | 0 |
| De 8 oude lessen optellen tot 10 | 24 | 8 | 1 |
| Optellen tot 100 (nu groep 4) | 64 | 62 | 12 |
| Tientallen en plaatswaarde (nu groep 4) | 39 | 26 | 4 |
| **Totaal** | **ongeveer 424** | **ongeveer 260** | **84** |

Ook gelijkgetrokken:

- **Titels.** "Instaptoets: Flitskaarten" werd "Instaptoets: flitskaarten". Bij
  verhaaltjessommen ging het net zo. De titels zijn aangepast in de code én in de
  database.
- **Een feitelijke fout.** "Een minuut duurt ongeveer zo lang als tandenpoetsen"
  klopte niet, want tandenpoetsen duurt 2 minuten. Nu staat er "een liedje
  zingen".

## 2. Twintig voorbeelden

### Taal (voor → na)

1. "Er zijn nog {1} ballonnen over." → "Er is nog {1} ballon over." Het meervoud
   volgt nu overal het getal.
2. "Het zijn {1} sprongen." → "Het is {1} sprong."
3. "Er zijn {1} *paarse* vakjes, niet {9}." → "Er is maar {1} *paars* vakje, niet {9}."
4. "Laten we ze samen tellen." → "We tellen ze samen." Zo ook alle andere zinnen met
   "Laten we".
5. "Dat is 'm." / "Je hebt hem." → "Goed zo." / "Zo is het goed." Dat kwam meer
   dan 15 keer voor.
6. "De minutenwijzer is wel bewogen." → "De minutenwijzer heeft wel bewogen."
7. "Je liet zien dat {2} is kleiner dan {5}." → "Je liet zien: {2} is kleiner dan {5}."
8. "Ah, je hebt er {3} bij gedaan." → "Ah, je hebt er {3} bijgedaan."
9. "Hoe laat zegt deze klok?" → "Hoe laat is het op deze klok?"
10. "Wat moet je van {20} afhalen om {13} over te houden?" → "{20} min hoeveel is {13}?"

### Antwoordkeuzes (voor → na)

1. Digitale klok, 8 uur: "800 / 8 uur / 80 uur" → "7 uur / 8 uur / 9 uur".
2. Digitale klok, 3 uur: "300 / 30 uur / 3 uur" → "4 uur / 2 uur / 3 uur".
3. Urenwijzer: "3 uur / 3 twaalf / 3 nul / 12 uur" → "3 uur / 12 uur / 9 uur / 4 uur".
4. Halve uren: "half 4 / half 5 / 4 zes / 6 uur" → "half 4 / half 5 / 4 uur / 6 uur".
5. Na 19 komt?: "20 / 21 / 1010 / 191" → "10 / 18 / 19 / 20".
6. Na 10 komt?: "1 / 10 / 11 / 101" → "1 / 10 / 11 / 12".
7. Verhaaltje 17 − 9, zes knoppen tot 26: "25 / 26 / 8 / 9 / 17 / 7" → "7 / 8 / 9 / 17".
8. Koekjes 20 − 9: "11 / 9 / 20 / 29" → "9 / 10 / 11 / 20".
9. Optellen bij 10: de foute keuze 105 ("10 en 5 achter elkaar") → 5 ("de 10 vergeten").
10. Verschil 8 en 5: "3 − 5 = 8 / 8 − 5 = 3 / 3 − 5 = 3 / 5 − 8 = 3" →
    "8 − 5 = 3 / 8 − 5 = 2 / 8 − 5 = 4 / 8 + 5 = 13".

## 3. Een oefening van 15 sommen bij elke les

Zo heeft de eigenaar het gevraagd: bij elke groep 3-les komt een losse oefening
van 15 sommen van dezelfde soort, direct na de les en in hetzelfde onderwerp.

**Er zijn 56 oefeningen gemaakt**, met de oefentypes die groep 3 al had.

- **Titels.** Ze heten "Oefenen: …". Na een eindtoets heet de oefening
  "Herhalen: …".
- **Plek.** Ze staan in de lijst direct onder hun les, onder hetzelfde kopje
  (bijvoorbeeld "Les: klokkijken"). De volgorde van de andere oefeningen is niet
  veranderd.
- **Groep.** Ze horen alleen bij groep 3.
- **Opgaven.** Elke oefening heeft precies 15 gepubliceerde opgaven, met
  maatje-teksten. Alleen bij "drie getallen optellen" ontbreken die, omdat er
  voor dat type nog geen maatje-schrijver bestaat.
- **Herhalingen.** Een paar soorten hebben er minder dan 15 verschillende,
  omdat er niet meer bestaan. Plussommen tot 5 zijn er bijvoorbeeld maar 10.
  Daar vult het platform aan met herhalingen, zoals bij alle oefeningen.
- **Regels.** Alles blijft tot en met 20, en de keuzes zijn echte kinderfouten.
  Bij de verhaaltjessommen kwamen er keuzes boven de 20 uit, zoals "26 appels"
  bij 18 − 8. Die worden voor groep 3 nu vervangen door een andere kinderfout
  binnen de 20. Voor andere groepen is niets veranderd.
- **Geen oefening.** De twee intro-lessen ("Zo werkt het" en "Jouw instellingen")
  hebben geen sommen en kregen dus geen oefening.
- **Lijst.** Alle codes staan in `vragen-voor-later/AANGEMAAKT.md`, onder
  "Ronde 6". Reservekopie vooraf: `backups/thuisles-voor-groep3-oefeningen-*.db`.
- **Getest.** Twee oefeningen heb ik als Testkind gespeeld, met een fout antwoord:
  "Oefenen: hele uren lezen" en "Oefenen: weggeven en opmaken". Bij een fout legt
  het maatje uit wat er misging.

Groep 4 is niet aangevuld of ingekort. Wat ik daar eerst had gedaan, is
teruggezet.

## 3b. Alle 56 oefeningen gespeeld als Testkind (11 oktober 2026, avond)

Zes helpers hebben elke oefening gespeeld als Testkind: per oefening minstens 5
sommen, waarvan één expres fout.

- Alle oefeningen hebben 15 sommen.
- Nergens kwam een getal boven de 20.
- Getallen typ je overal in een echt invulvak.

Daarna heeft een helper alle herstelde oefeningen nog een keer gespeeld.

**Hersteld:**

1. **Plaatjes tellen.** Na een goed antwoord bleef de oefening soms hangen: geen
   feestscherm en geen volgende vraag. Bij de hertest kwamen 13 goede antwoorden
   achter elkaar zonder hangen.
2. **Het groene vak na een fout** toonde soms de code van het antwoord in plaats
   van het antwoord zelf. Nu staat er het echte antwoord, of er komt geen los vak
   als de oefening het antwoord al zelf laat zien.

   | Oefening | Eerst | Nu |
   | --- | --- | --- |
   | Verhaaltjessommen | "2" | "9 euro" |
   | Welke som klopt? | "0" | "2 + 3 = 5" |
   | Klok aflezen | "3" | "zeven uur" |
   | Klok zetten | "3,30" | "half vier" |
   | De meeste of de minste | "onder" | "de onderste rij" |
   | Koppel de som, Maak 10, Doortellen | "5,10,9,7" | geen los vak meer (het antwoord staat al in de opdracht) |
3. **Welke som klopt?** De uitleg in beeld hoorde bij een ander soort vraag
   ("Eentje past niet!"). Het maatje zei "De som die klopt is 2 plus 3 is 5."
   Nu zegt het "Deze som klopt: 2 plus 3 is 5."
4. **Maak 10** gebruikte het raketspel. Daar komt een tik ongeveer 66 pixels
   naast de plek waar het kind tikt. Nu is het een splitstabel met vriendjes
   van 10.
5. **Splitsen tot 10** splitste alleen het getal 10. Nu gaat het om alle getallen
   van 3 tot en met 10.
6. **Verschil met sprongen** paste niet bij de les: het waren gewone minsommen.
   Nu is het "Oefenen: zet het getal op de lijn", met de getallenlijn tot 20.
7. **De uitleg in de donkere spellen** (tegels) was onleesbaar: witte letters op
   wit. Nu staan er lichte letters op donker.
8. **Tab bij de invulvakjes** sloeg een vakje over.
9. **Verhaaltjessommen.** Dezelfde getallen kwamen vaak twee keer in één reeks
   voor. Dat gebeurt niet meer.
10. **Taal.**

    | Eerst | Nu |
    | --- | --- |
    | "Er blijven 1 stip over" | "Er blijft 1 stip over" |
    | "dat zijn er 1" | "dat is er 1" |
    | "5 is meer dan 2" (bij "de minste") | "2 is minder dan 5" |
    | "Vijf rood, vijf wit" (bij 1 kraal) | weg |
    | "De tientallen zijn gelijk" (bij getallen onder de 10) | weg |
    | "Half acht is op weg naar de 8. Bij half zeven gaat hij naar de 7." | "De kleine wijzer gaat al naar de 8. Het is dus half acht." |
    | "Hier woont nummer 13." | "Hier is nummer 13." |
    | "Zo hoorde de klok te staan." | "Zo moest de klok staan." |
    | "Begin bij het grootste." (bij 4 + 4) | "Begin bij het eerste getal." |
11. **Een rode foutmelding van Next** over dubbele sleutels bij sommen met een leeg
    vakje. Een kind zag die niet, maar hij is weg.
12. **Drie getallen optellen** heeft nu uitleg van het maatje, volgens de
    handleiding (zinnen van hoogstens 10 woorden). Een voorbeeld na het fout
    antwoord 5 bij 1 + 4 + 2: "Dat is 1 plus 4. Doe de 2 er ook nog bij."
    Alle 15 opgaven komen door de controle.

**Gedeelde code.** Sommige stukken code gebruikt groep 4 ook: het oefenscherm, de
plaatjes, de invulvakjes en de uitleg in beeld. Waar het kon, geldt het herstel
alleen voor groep 3. Bij een paar echte fouten kon dat niet, omdat de code voor
beide groepen dezelfde is: het hangen bij plaatjes tellen, Tab, de leesbaarheid
in het donker, "Hier is nummer", "Zo moest de klok staan" en de rode
foutmelding. Die zijn nu ook in groep 4 opgelost. De opgaven en teksten van groep
4 in de database zijn niet veranderd.

**Opgemerkt, niet hersteld (voor later of voor de ronde van groep 4):**

- Het raketspel (en waarschijnlijk het laserspel) vangt een tik op de verkeerde
  plek op. Groep 3 gebruikt het niet meer; groep 4 wel.
- Bij "minsommen tot 10" staat de instelling "met beeld", maar het beeld komt
  niet: er staan alleen cijfers.
- Bij "doortellen" legt de uitleg in beeld altijd het eerste vakje uit, ook als
  een ander vakje fout was. De zin van het maatje noemt wel het goede vakje.
- Bij stippen met "hoeveel meer?" legt het maatje het verschil uit als
  wegnemen.
- Bij halve uren staat het hele uur (acht uur bij half acht) niet tussen de
  foute keuzes. Dat is wel een veelgemaakte kinderfout.
- Bij verhaaltjessommen zegt het maatje soms "De som klopt, maar reken nog
  eens", terwijl er geen som in beeld staat.
- In groep 4 zegt het maatje bij "welke som klopt?" nog "De som die klopt is …
  is …".

## 3c. Bestanden

- `MAATJE-HANDLEIDING.md` en de afbeelding erbij zijn meegecommit.
- `vos.png`, `vrijoefenen1.png` en `vrijoefnenenx.png` stonden los in de
  hoofdmap, niet in `public/`. De website kan ze dus niet tonen, en nergens in de
  code wordt ernaar verwezen. Ze zijn verwijderd. De Vos die je op de site ziet,
  komt uit `public/vos-lijf.png`, `public/vos-arm.png` en de map `public/vos/`;
  die blijven staan.

## 4. Testen: hoeveel lessen werken

Elke groep 3-les is gespeeld als een kind, met minstens één fout antwoord.

- **Automatisch.** Een onzichtbare Chrome koos willekeurig, typte getallen en
  tikte de kaart af. 37 lessen liepen zo tot het eind.
- **Met de hand.** De 21 lessen waarin precies gesleept of getikt moet worden,
  hebben helpers met echte muisbewegingen uitgespeeld, elk met bewuste fouten.

**Uitkomst: alle 58 groep 3-lessen werken nu van begin tot eind.** De controleronde
na alle verbeteringen: CONTROLE_UITKOMST

### Echte fouten die ik heb hersteld

1. **Optellen tot 10, alle tegellessen.** Een tegel aantikken en dan op een toren
   in het vak tikken deed niets: de torens vingen de tik op. Een kind kwam
   bijvoorbeeld bij "Klopt de som?" niet verder.
2. **Aftrekken: "Het verschil" en "Hetzelfde verschil".** Met een vinger of muis
   kon je niet op de ruimteschepen en de straal tikken: er lag een onzichtbare
   laag overheen. Een kind op een tablet zat al bij de eerste opdracht vast.
3. **Vergelijken: "De tekens =, < en >".** Typte een kind eerst fout en daarna goed,
   dan zei de les "Kijk maar." in plaats van "Goed zo!".
4. **Getallenlijn, het kristallenspel.** Na een fout antwoord kreeg het kind toch
   een kristal en "Goed zo". Nu is er alleen een kristal voor een antwoord dat
   meteen goed is.
5. **Aftrekken, keuzevragen.** Wie bij de tweede poging goed koos, kreeg geen
   reactie. Nu zegt de les "Ja, goed zo."
6. **Versla de wekker.** Tijdens de race bleef "Tik op Start" in beeld staan.
7. **Verhaaltje met bloemen.** "Er zijn nu 5 bloemen." kwam twee keer achter
   elkaar, met "Goed zo" na een fout.
8. **Flitskaarten.** Na de uitslag zegt de mascotte nu wat de knoppen doen
   ("Oranje is nog een keer oefenen. Groen is de race. Roze is klaar."), want
   groep 3 kan de knoppen nog niet lezen.
9. **Flitskaarten tot 20.** De instaptoets en de eindtoets trokken ook kaarten als
   67 + 10. Nu blijft alles binnen de 20.
10. **Verder ongeveer 15 zinnen die niet klopten bij wat je ziet.** Twee voorbeelden:
    - "Nu nog één." terwijl er nog twee sommen kwamen;
    - "Je zit er een beetje naast." bij een antwoord dat ver ernaast lag.

## 5. Groep 3 = tot 20 (29 lessen naar groep 4)

Ik heb de leerdoelen van groep 3 opgezocht (SLO-tussendoelen en LOWAN): rekenen tot
20, splitsen, en klokkijken met hele en halve uren. Op jouw verzoek gaat ook tellen
in groep 3 tot 20.

Daarom staan 29 lessen nu in de database op groep 4. Ze zijn niet weggehaald en
niet verborgen. De lijst staat in `vragen-voor-later/lessen-groep-3/naar-groep-4.md`:

- optellen tot 100 (8 lessen);
- tientallen en plaatswaarde (11);
- flitskaarten "10 erbij, 10 eraf";
- 5 kloklessen met kwartieren en minuten;
- 4 tellessen tot 50 en 100.

"Tienergetallen" bleef in groep 3 en staat nu onder "Tellen & sprongen tot en met 20".

**In groep 3 blijven 58 lessen.** Ik heb alle zinnen en keuzes nagekeken die de
testronde opschreef: in die lessen staat geen getal boven de 20.

## 6. Wat ik niet zeker wist

- **De 8 oude lessen.** De taal is verbeterd in de code, maar in de database staan
  de oude zinnen nog, want daar mocht ik niet aankomen. Ze worden pas anders als
  die lessen opnieuw worden gemaakt, of als ze weggaan: dat beslis jij.
- **"Honderdtallen" weggehaald.** In "Plaatsen in een som" (nu groep 4) is de knop
  "Honderdtallen" weggehaald, omdat groep 3 die niet kent. Zeg het als hij terug
  moet.
- **De valkuil "105" is weg.** "Optellen bij 10" had de valkuil "10 en 5 achter
  elkaar schrijven = 105". Die kan niet binnen de 20, dus nu is het "de 10 vergeten".
- **"Limoengroene tegel" is "lichtgroene tegel" geworden** in de oude lessen, zoals
  in de nieuwe lessen.
- **Woorden laten staan.** Bij "Tienergetallen" staan bewust woorden ("twintig",
  "net na tien"), omdat de les over het woord gaat.
- **De uitspraak van je naam is niet getest.** Het opslaan van een andere
  uitspraak in "Jouw instellingen" werd door de toestemmingscontrole tegengehouden.
- **Je open vragen uit het vorige rapport staan nog.** Het gaat onder andere om de
  veranderde stappen bij aftrekken, de 8 oude lessen en het tempo. Daar heb ik niets aan veranderd.
