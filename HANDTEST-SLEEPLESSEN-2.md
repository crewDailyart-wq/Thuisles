# Handtest sleeplessen 2 (Testkind, echte Chrome, localhost:3000)

## Telling
- Echt gesleept met minstens 1 goede en 1 foute poging: 7 lessen: getallenlijn-dieren-2, meer-minder-evenveel3-1, meten-oppervlakte-2, tellen-telrij-1, piraat-2, piraat-3, geld-geld-1.
- WERKT: 7 van 7. PROBLEEM: 0 sleepfouten. Wel 3 kleine opmerkingen (zie onder: wachten op Bliepo, uitlegzinnen blijven hangen, ster-spatiëring).
- Geopend maar geen slepen bereikt/gevonden (tikken): getallenlijn-dieren-1, getallenlijn-rangschikken-1, meer-minder-evenveel1-1, evenveel3-2 (alleen begin), meten-hoeveelheden-1, tijd-kalender-1, vormen-patronen-1.
- Dev-server ("Compiling" in beeld), dus traagheid niet betrouwbaar.

## Resultaten

### squla-getallenlijn-dieren-2 — WERKT
Ja gekozen. Vraag 1 is slepen: 3 kaartjes (13, 14, 12) naar 3 vakken, van klein naar groot. Fout (13, 14, 12): na het derde kaartje gaan alle kaartjes terug, hint "Welk getal zeg je het eerst als je telt? Dat getal komt vooraan." Goed (12, 13, 14): kaartjes volgen de muis, vallen in het vak, groene gloed, "Dat is 'm, Testkind.", volgende vraag (10, 8, 9). Niets bleef kleven. Geen rood rondje gezien.

### squla-meer-minder-evenveel3-1 — WERKT
Ja gekozen. Eerst "Kijk, 3 potjes." (uitleg); slepen reageert pas als Bliepo klaar is met praten (eerder dragen deed niets; zo bedoeld, maar een kind kan dat als "kapot" zien). Potjes (26, 8, 24), van meer naar minder. Fout (8, 26, 24): potjes gaan terug, hint "Zoek eerst het grootste getal van de 3 en zet dat in het eerste vakje." Goed (26, 24, 8): potjes volgen de muis, passen in de vakken, "Mooi.", volgende vraag (aardbeien, kaart 15). Niets bleef kleven.

### squla-meten-oppervlakte-2 — WERKT
Ja gekozen. Vraag 1-4 typen (18, 6, 16, 21: werkt met toetsenbord en Return). Vraag 5 is slepen: twee tafels (14 en 7 blaadjes), losse getalkaartjes. Kaartje blijft in het vak liggen. Fout (12 links, 6 rechts): kaartjes gaan terug, hint "Tel alle gele blaadjes, en dan alle rode." Goed (14 links, 7 rechts): volgende vraag (muur met tegels) kwam. Niets bleef kleven. Geen rood rondje gezien.

### squla-tellen-telrij-1 — WERKT
Ja gekozen. Vraag 1 slepen: huisnummers (33, 34, ?), losse huizen 32/35/43. Fout (32 gesleept): huis gaat terug, "Je staat bij 34. Tel 1 verder." Goed (35): huis staat in de rij, "Goed gezien.". Niets bleef kleven.

### squla-piraat-2 — WERKT
Ja gekozen. Minsom met sterren: "Ik heb 6 sterren. Er valt er 1 uit. Sleep de sterren die er nog zijn naar het vak." Eerst 2 sterren gesleept en op het vinkje getikt: hint "Eerst 6, dan gaat er 1 weg." sterren blijven staan. Daarna 3 erbij (5): vinkje, schatletter "i" verscheen, volgende vraag (diamanten, 7 - 3). Sterren volgen de muis en liggen in het vak. Opmerking (klein): in het vak staat de laatste ster iets verder naar rechts dan de andere (ongelijke afstand). Het vinkje en de herhaalknop (cirkel eronder) liggen dicht bij elkaar: het vinkje schuift omhoog als de zin langer is (ik raakte daardoor 1x de herhaalknop in plaats van het vinkje; geen fout, wel een kans op misklikken).

### squla-piraat-3 — WERKT
Ja gekozen. Vraag 1: 7 - 4, 7 sterren. Fout: 4 sterren in het vak, vinkje: hint "7 - 4. Sleep de sterren die er nog zijn naar het vak." Een ster uit het vak terug naar boven gesleept: werkt (3 over). Vinkje: goed, letter "n", volgende vraag 7 + 6 met getalkaartjes 12/13/14 slepen naar het vak. Fout (12): kaartje gaat terug, "Dan de rest erbij." Goed (13): schatletter "a", volgende vraag (14 - 6, goudstukken). Niets bleef kleven.

### squla-geld-geld-1 — WERKT
Ja gekozen. Verbinden: van het bolletje bij het geld naar het bolletje bij het bedrag slepen; lijn volgt de muis (geel), blijft staan. Vraag 1 (2 munten = 3 euro, 2 munten = 2 euro) goed gedaan: gaat meteen door. Vraag 2 (biljet 5 + munt = 7, biljet 5 + 2 munten = 9): fout (verwisseld): lijnen verdwijnen, hint "Tel het geld van allebei en vergelijk." Goed: lijnen worden groen/lichtgroen met gloed, "Mooi, Testkind.", volgende vraag (6 en 5 euro). Niets bleef kleven. Geen rood rondje gezien.

## Opmerkingen over tikken-vragen (geen slepen) onderweg
- squla-vormen-patronen-1: vraag "Welke kraal komt na de roze kraal?" is tikken (slepen van de kraal naar de lege plek deed niets). Na een fout antwoord (groen getikt) tekent Bliepo een rood rondje om de roze kraal. Ziet er netjes uit: handgetekend rondje precies om de roze kraal naast de lege plek, hint "Zoek de roze kraal eerder in de ketting en kijk welke kraal daarna kwam."
- squla-tijd-kalender-1: na Ja bleef het ruim 20 seconden hangen op "Het is een nieuwe dag. Waar zie je wat er vandaag gaat gebeuren?"; pas na tikken op de kalender en daarna op de plaatjes ging het door (of dat de bedoeling is: niet duidelijk voor een kind). Vragen daarna waren tikken (kring/gym).
- squla-getallenlijn-rangschikken-1: eerste klik op Ja bij "Compiling" deed niets en daarna bleef het scherm zonder knoppen staan (niet meer te redden zonder verversen). Zelfde als in het eerdere verslag (te vroeg tikken).
- squla-getallenlijn-dieren-1, rangschikken-1, meten-hoeveelheden-1, meer-minder-evenveel1-1: eerste vragen zijn tikken; slepen op de kaartjes deed niets (zo bedoeld).

## NIET GEZIEN
- Sleepvragen die pas later in de les komen (veel tikvragen ervoor) niet bereikt: getallenlijn-rangschikken-1/2/3 (orden pas vraag 13/14/4), kat-1/2 (orden vanaf vraag 6), dieren-3 (vraag 2), meer-minder-evenveel1-2 (kaarten slepen vanaf vraag 6) en 3-2, meten-pizza-1/2/3 en hoeveelheden-1/2 (orden), klok-klokkijken3-3 (slepen vanaf vraag 7), tijd-kalender/tijden/dagen (sleep-kaart naar leeg vak), vormen-kleuren/patronen/orienteren (kralen en puzzelstukjes slepen), tellen-fruit/resultatief/telrij-2, geld-geld-2/geldmachine/zakgeld.
- squla-rekenmix mix1-2/1-3, mix2-1/2-3, mix3-2..4, mix4-1/3/4: niet getest.
- squla-min-* en squla-plus-* (minsommen/plussommen) en squla-rekentaal: in de code geen sleepfunctie gevonden (alleen tikken/typen), dus niet op slepen getest.
- Rood rondje: alleen gezien bij vormen-patronen-1 (zie boven, netjes). Bij de gesleepte vragen niet gezien.
- Tablet/aanraking, vloeiendheid, spraak/audio niet beoordeeld.
