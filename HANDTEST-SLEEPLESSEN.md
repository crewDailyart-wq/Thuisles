# Handtest sleeplessen (Testkind, echte Chrome, localhost:3000)

## Telling
- Lessen geopend: 14. Daarvan echt gesleept (minstens 1 goede en 1 foute poging): 11 (splitsen1-1, splitsen2-1, splitsen2-2, delen-1, piraat-1, rekenmix mix1-4, mix2-4, mix3-1, mix4-2, huisnummers, dagen-van-de-week). Bij piraat-1, mix4-2 en dagen was de fout/goed-combinatie zoals hieronder beschreven.
- WERKT: 11 van 11 lessen waar ik sleepte. Geen enkel ding bleef kleven, niets viel buiten beeld.
- PROBLEEM: 0 sleepfouten. 1 opmerking over tekst/beeld (mix3-1: "klein" boven de grootste bal) en 1 opmerking over laden (opruimen-1, zie onder).
- Geen sleepvraag gevonden/gespeeld in: splitsen1-2 (tikken), rekenmix mix1-1 (tellen), vormen-opruimen-1 (eerste vraag is tikken).
- De test is gedaan op een dev-server ("Compiling" stond soms in beeld), dus traagheid is niet betrouwbaar gemeten.


## Resultaten per les

### squla-splits-splitsen1-1 — WERKT
Ja gekozen. Vraag 1 (5 pionnen, 2 naar paars, rest oranje): pionnen volgen de muis, vallen netjes in het vak en schikken zich. Met opzet fout gedaan (3 paars, 2 oranje): vinkje verschijnt pas als alle pionnen in een vak liggen; na vinkje de tekst "Het moesten er 2 zijn. Er is er 1 te veel." en de pionnen blijven staan. Ik sleepte 1 pion naar oranje (nu goed), vinkje tikken: vraag 2 (9 pionnen, 6 paars) kwam. Niets bleef kleven.
Let op (geen fout, wel opvallend): na de foute poging blijft de hulptekst staan en gaat het kind zelf verder met slepen; er is geen automatisch terugzetten.

### squla-splits-splitsen1-2 — WERKT (maar is tikken, geen slepen)
Ja gekozen. De vragen die ik zag ("Tik op het goede huisje"): tikken op een huisje werkt, volgende vraag komt. Fout antwoord niet kunnen testen: ik tikte per ongeluk meteen een goed huisje. Slepen niet gezien in deze les.

### squla-splits-splitsen2-1 — WERKT
Ja gekozen. Vraag 1 (14 = 10 + ?; tegels 4, 10, 14): eerst fout (10 naar het vak): tegel gaat terug, tekst "10 staat er al." en daarna "Er mist een ander getal." Daarna goed (4): tegel blijft liggen, huisje wordt groen, "Dat is 'm.", volgende vraag (17). Rood rondje niet gezien in vraag 1 (geen rondje in beeld).

### squla-splits-splitsen2-2 — WERKT
Ja gekozen. Vraag 1 (13 met 10 en 3; som onder het huisje slepen): foute som (10 = 7 + 3) gesleept: tegel gaat terug, tekst "Die som begint met 10." en daarna "Bovenaan het huisje staat 13." Goede som gesleept: tegel blijft in het vak, huisje groen, "Perfect.", volgende vraag (16) kwam. Niets bleef kleven.

### squla-splits-delen-1 — WERKT
Ja gekozen. 8 knikkers over 2 bakjes: knikkers volgen de muis en vallen in het bakje; de rest van de rij schuift netjes op. Fout gedaan (3 paars, 5 oranje): vinkje verschijnt, na tikken tekst "Verplaats er een paar, tot elk bakje evenveel heeft." Een knikker van oranje naar paars gesleept: nu 4/4, vinkje, volgende vraag (12 knikkers, 3 bakjes) kwam. Let op (klein): de bovenste knikkers in een bakje zweven iets boven de rand van het bakje (gestapeld); het ziet er acceptabel uit.

### squla-piraat-1 — WERKT
Ja gekozen. "Sleep 14 goudstukken naar het vak": munten volgen de muis, liggen in het vak en worden zelf in rijen van 5 gelegd. Vinkje verscheen al bij 2 munten; fout (2 munten) getikt: hulptekst "Tel in rijen van 5: 5, 10, en dan verder." en niets verdwijnt. Daarna 14 gesleept, vinkje: schatletter verscheen ("Samen zeggen de letters waar de schat ligt."). Niets bleef kleven.

### squla-rekenmix-mix1-1 — GEEN SLEPEN
Alleen tellen en antwoord kiezen (tikken). Niet getest op slepen.

### squla-rekenmix-mix1-4 — WERKT
Ja gekozen. 3 koekjesgroepjes op volgorde zetten (meer naar minder) naar 3 plekken. Fout gedaan (3 / 8 / 5): bij de laatste plek automatisch gekeurd: "Geen enkel kaartje ligt al op de goede plek.", daarna springen de groepjes terug en "Begin met de meeste." Goed (8 / 5 / 3): groene gloed en "Precies, Testkind.", daarna volgende vraag (knikkers). Niets bleef kleven.

### squla-rekenmix-mix2-4 — WERKT
Ja gekozen. "Verbind elk groepje met het goede getal": van het bolletje links naar het bolletje rechts slepen trekt een lijn die de muis volgt. Fout (alles verkeerd): "Geen enkele lijn klopt nog." en de lijnen verdwijnen met hint "Kijk naar het getal bij elk groepje." Goed: lijnen worden groen, gloed, "Perfect.", volgende vraag. Niets bleef kleven.

### squla-rekenmix-mix3-1 — WERKT, met 1 opmerking
Ja gekozen (eerste klik op Ja deed niets omdat de pagina nog laadde; tweede klik werkte). Ballen op volgorde slepen: ze volgen de muis en vallen op de plek. Fout (klein-groot-middel): "1 kaartje ligt al op de goede plek." en alles gaat terug met hint "Let eerst op de allerkleinste." Goed: gloed, "Ja, dat is het, Testkind." en volgende vraag (kaarsen: dik, dikker, dikst).
OPMERKING (tekst/beeld, geen sleepfout): bij goed antwoord staan de woorden "klein / kleiner / kleinst" boven de bal van groot naar klein, dus boven de GROOTSTE bal staat "klein". Past niet bij het beeld (vraag zegt "van groot naar klein"). Geen schermfoto opgeslagen.

### squla-rekenmix-mix4-2 — WERKT
Ja gekozen. Getalkaartjes (10 staat al, 11-14 slepen) naar 5 plekken. Kaartjes volgen de muis en vallen op de plek. Fout (10, 14, 12, 11, 13): "1 kaartje ligt al op de goede plek." en alles gaat terug met hint "Na 10 komt het getal dat 1 meer is." Goed niet doorgespeeld in deze les.

### squla-huisnummers — WERKT
Ja gekozen. Vraag 1-4 zijn kiezen/typen (gedaan met goede antwoorden, werkt; typen met toetsenbord en Return werkt). Vraag 5 is slepen ("Sleep het goede huis naar de lege plek", lege plek tussen 9 en 11, losse huizen 7/10/13): eerst fout (13 gesleept): huis gaat terug, tekst "Het huis met 13 ligt te ver van 9 af." en daarna hint "Kijk naar het huis links van de lege plek. Tel vanaf dat nummer 1 verder." Daarna goed (10): huis staat in de rij, "Goed gezien.", volgende vraag. Niets bleef kleven.

### squla-dagen-van-de-week — WERKT
Ja gekozen. Vraag 1-7 zijn tikken (wagon of kaartje tikken; allemaal goed gedaan, werkt). Vraag 8 is slepen ("Sleep de goede dag naar de lege plek", woensdag mist): fout (maandag gesleept): kaartje schuift terug, geen zin (zo hoort het volgens de code, "zonder zin"). Goed (woensdag): wagon staat in de trein, "Prima.", volgende vraag (zaterdag mist) kwam. Niets bleef kleven. Vraag 9-10 niet gespeeld.

### squla-splits-splitsen1-2 en squla-rekenmix-mix1-1 — zie hierboven (tikken, geen slepen gezien)

### squla-vormen-opruimen-1 — NIET OP SLEPEN GETEST
Eerste vraag is tikken ("Op welk plaatje zie je alleen broeken? Tik op dat plaatje."), geen slepen gezien. OPMERKING (laden): de eerste keer klikte ik op de plek van de Ja-knop terwijl Bliepo nog praatte en de knoppen er nog niet waren. Daarna bleven de Ja/Nee-knoppen ook na 25 seconden weg en reageerde tikken op het beeld niet; pas na opnieuw laden van de pagina en wachten kwamen Ja/Nee wel. Een kind dat te vroeg tikt kan dus vast komen te zitten. Niet verder uitgezocht, geen schermfoto.

## NIET GEZIEN
- Alle andere Squla-lessen met slepen, niet geopend: squla-getallenlijn-* (kaart naar vak), squla-meer-minder-* (sleep naar vakjes), squla-meten-* (getal/plaatje naar leeg vak, getal onder tafel), squla-tijd-kalender/tijden/dagen, squla-tellen-* (huis/kaartje naar lege plek), squla-vormen-kleuren/patronen/orienteren (kralen en stukjes slepen), squla-klok-* (wijzers slepen), squla-geld-*, de overige rekenmix-lessen (mix2-1..3, mix3-2..4, mix4-1/3/4, mix1-2/3), squla-min-*, squla-plus-*, squla-piraat-2/3, squla-rekentaal, squla-splits (andere vragen binnen de lessen: zak, lege-plek-getal, sterren verdelen).
- Binnen de geteste lessen: alleen de eerste 1-3 slepen-vragen per les gespeeld, niet alle ~15 vragen.
- squla-splits-splitsen2-1: het rode rondje (die vraag) is niet gezien; alleen vraag 1 (14 = 10 + ?) en begin van vraag 2 (17).
- Op de tablet/aanraking niet getest (alleen muis, left_click_drag).
- Vloeiendheid (beeldjes per seconde) niet gemeten.
- Spraak/audio niet beoordeeld.
