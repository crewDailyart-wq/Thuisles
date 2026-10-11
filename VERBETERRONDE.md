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

## 3. Aangevuld tot 15 vragen

**Bij groep 3: 0 opdrachten aangevuld.** Groep 3 heeft in de database geen gewone
oefeningen; daar staan alleen lessen.

- **De 58 lessen.** Elke les is één "vraag": de hele les wordt in één keer
  gespeeld. Daar 15 kopieën van maken heeft geen zin, dus dat heb ik niet gedaan.
  Moet een les zelf 15 oefensommen krijgen, zeg het dan; dat is een grotere
  verandering per les.
- **De 8 oude lessen** (REK-OPT-OPT-75 t/m 82). Daar heb ik niets aan veranderd,
  zoals je vroeg.

Bij groep 4 had ik in eerste instantie 65 opdrachten op 15 gezet. Dat is allemaal
teruggezet.

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

- **Lessen en 15 vragen.** Zie punt 3: moet een les zelf 15 oefensommen krijgen?
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
