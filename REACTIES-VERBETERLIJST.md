# Verbeterlijst reacties na een fout antwoord (controle 5 november 2026)

Gekeurd op BOUWREGELS 3.20, 3.23 en 5.11 en op SYNTHESIS-ANALYSE/REACTIES.md.
Bron: de uitvoer van de speelcontrole "alles fout" (41 lessen gelezen, uit alle 16 bestanden) plus de lescode.
Er is niets aangepast; dit is alleen een lijst.

Let op twee beperkingen van de uitvoer:
1. `schermen.txt` toont van een gesproken blok alleen de LAATSTE zin. De eerste zin (bijvoorbeeld "Je koos 6 uur...") staat er niet in. Waar dat uitmaakte, heb ik de volledige zin in de code nagekeken (bestand en regel erbij).
2. Bij veel lessen komt na de eerste fout geen zichtbare tweede fout in de uitvoer (slepen, of de speelcontrole raakte daarna goed). Daarom zijn de zinnen "na de tweede fout" vooral uit de code beoordeeld.

Ernst: HOOG = fout of duidelijk verkeerd. MIDDEN = zwakke hulp of sjabloon. LAAG = kan mooier.

---

## HOOG

### H1. squla-min-machine-1 t/m -4 (grammatica, cat. 4)
Bestand: `src/components/les/lessen/squla-minsommen.tsx` regel 591 (`gu(u)` + "blokjes").
- Letterlijk: "De machine haalt er 9 af. Dan komen er 1 blokjes uit: 10 − 9 = 1."
- Mis: "1 blokjes" is geen goed Nederlands (en 3.20 vraagt om cijfers, niet om een foute meervoudsvorm).
- Voorstel: "De machine haalt er 9 af. Dan komt er 1 blokje uit: 10 − 9 = 1." Laat het woord meebuigen als het antwoord 1 is, net als bij "Er gaat er 1 weg". Controleer ook andere plekken waar `gu(...)` voor een zelfstandig naamwoord staat.

### H2. squla-geld-geld-1, -2, squla-geld-zakgeld-1, -2 (reactie past niet bij de vraag, cat. 1 en 5)
Bestand: `squla-geld.tsx` regel 270 (de standaardreactie van `kiesGeld`).
- Letterlijk (laatste zin): "Dit groepje is 2 euro minder dan je zoekt." Ervoor staat: "Dit groepje is samen 3 euro, en je zoekt 5 euro."
- Mis: (a) dezelfde informatie staat twee keer, (b) er is geen hint: het kind hoort wat er mis is, maar niet wat het nu moet doen, (c) bij "Tik op 2 groepjes geld" (skateboard 20 euro, rommelmarkt 5 euro) gaat de zin over 1 groepje, terwijl het kind er 2 moet combineren. Dat is verwarrend.
- Voorstel bij 1 groepje te weinig: "Dit groepje is samen 3 euro. Je zoekt 5 euro, dus je hebt nog 2 euro nodig. Zoek een groepje met meer geld."
- Voorstel bij te veel: "Dit groepje is samen 7 euro. Dat is 2 euro te veel. Zoek een groepje met minder geld."
- Voorstel bij 2 groepjes: "Je koos 2 groepjes. Samen is dat 15 euro. Je zoekt 20 euro, dus je hebt nog 5 euro nodig."

### H3. squla-plus-bakkerij-1 t/m -3 (hint verklapt het antwoord, cat. 2)
Bestand: `squla-plussommen.tsx` regel 306 (`rekenTip`, som waarvan de getallen 1 verschillen).
- Letterlijk: "Denk aan 4 + 4 = 8. Het antwoord is 1 meer dan dat." (bij 4 + 5)
- Mis: dit is in feite het antwoord (8 en dan 1 meer = 9). Het kind hoeft niets te bedenken. Bovendien klopt "het antwoord" niet voor het kind dat 5 + 4 las als "4 + 4".
- Voorstel: "Je weet vast wel wat 4 + 4 is. Bij 4 + 5 komt er 1 bij, want 5 is 1 meer dan 4. Wat is het dan?" (Dit stelt een vraag; omdat het kind dan meteen antwoordt is dat volgens 3.23 toegestaan.) Kortere variant zonder vraag: "Begin bij 4 + 4. Het tweede getal is 1 groter, dus er komt 1 bij."

### H4. squla-min-kaal-1 t/m -3 en squla-min-ruimte-1 t/m -3 (hint verwijst naar iets dat er niet is, cat. 1 en 2)
Bestand: `squla-minsommen.tsx` regel 202 (`rekenTip` / `telZin`) en 398.
- Letterlijk: "Hoeveel is 8 − 3? Typ het getal." gevolgd door de hint "Tel de stippen die over zijn."
- Mis: bij de kale minsom staan er (nog) geen stippen in beeld; dan is "de stippen die over zijn" onzichtbaar. Dit moet in de speelcontrole met een schermfoto worden gecontroleerd (de uitvoer toont geen tekening). Als de stippen pas na de tweede fout komen, klopt de hint niet.
- Voorstel zonder beeld: "Begin bij 8 en tel 3 terug." Met de reactie voor dit antwoord: "Je koos 11. Bij min wordt het minder, dus het antwoord is kleiner dan 8. Begin bij 8 en tel 3 terug."

---

## MIDDEN

### M1. Alle klok-lessen met heel uur: squla-klok-hoelaat-1/2/3, klokkijken1/2/3 en digitaal (sjabloon, cat. 5)
Bestand: `squla-klok.tsx` regel 113 en 122. De zin "Kijk waar hij op deze klok naartoe wijst." komt 75 keer voor in de uitvoer.
- Letterlijk: "Bij 7 uur wijst de kleine wijzer naar de 7. Kijk waar hij op deze klok naartoe wijst."
- Mis: de eerste zin is goed en past bij de keuze, maar de tweede is in alle lessen en bij alle klokken identiek. "Hij" is alleen duidelijk als je de zin ervoor hebt gehoord. Het kind krijgt geen aanwijzing in welke richting te zoeken (vlak bij, aan de andere kant, tussen twee getallen).
- Voorstel (bij gekozen 11, juist 7): "Bij 11 uur wijst de kleine wijzer naar de 11. Op deze klok wijst hij niet naar boven, maar naar beneden rechts. Welk getal is dat?" Kort alternatief: "Op deze klok wijst de kleine wijzer naar een getal in de onderste helft. Zoek dat getal."

### M2. squla-klok-hoelaat-1/2/3: de uitleg na de tweede fout eindigt met een weetje (cat. 3)
Bestand: `squla-klok.tsx` regel 356, 450, 1014 t/m 1025 (`weetje` in `goedZin`).
- Letterlijk (laatste zin die het kind hoort): "De maan zie je als het donker wordt." / "Vroeg in de ochtend begint de dag." / "De zon schijnt overdag."
- Mis: na de tweede fout moet Bliepo uitleggen waarom het goede antwoord klopt. De laatste zin die blijft hangen is een weetje over de dag en gaat niet over de wijzers. Controleer in de code of het weetje bij de tweede fout ook gezegd wordt; zo ja, dan is de les vaag over waarom 6 uur klopt.
- Voorstel: bij de tweede fout het weetje weglaten en eindigen met: "De grote wijzer staat op de 12 en de kleine op de 6. Dus het is 6 uur." Het weetje mag alleen na een goed antwoord.

### M3. squla-rekenmix-mix2-1 t/m -4: tautologie en hint herhaalt de vraag (cat. 2 en 3)
Bestand: `squla-rekenmix.tsx` regel 957 t/m 967 (`woordUitleg`) en 1001.
- Letterlijk: "Het minste fruit: daar zit het allerminste op." / "Meer kaas: je ziet méér kaas dan bovenaan." / "Kijk waar minder kaas zit." (bij de vraag "Op welke boterham zit minder kaas?")
- Mis: de uitleg zegt hetzelfde als de vraag (het woord wordt met zichzelf uitgelegd, "allerminste" is geen kindertaal) en de hint herhaalt de vraag. Dit helpt niet.
- Voorstel: "Tel de stukjes kaas op de boterham bovenaan. Tel ze dan op de andere boterhammen. Zoek de boterham met minder stukjes." En bij de tweede fout met de getallen uit het plaatje: "Bovenaan liggen 5 stukjes. Hier liggen er 3. 3 is minder dan 5."
- Zelfde patroon bij het spiesje ("Op welk spiesje zit het minste fruit?").

### M4. squla-meten-*: hints die de vraag omschrijven (cat. 2)
Bestand: `squla-meten.tsx` regel 1063 t/m 1356, 495 t/m 581.
- Letterlijk: "Zoek het ding dat het meest weegt. Wat is het zwaarst?" / "Zoek de mand waar niets in zit. Welke mand is leeg?" / "Kijk welke pizza breder is." (bij "Welke pizza is groter?")
- Mis: de hint zegt in andere woorden hetzelfde als de vraag. De goede reactie ("Op dit stokje zit nog niets.") staat er wel, maar de hint erachter voegt niets toe.
- Voorstel: noem hoe je het kunt zien: "Een lege mand heeft niets erin. Kijk in elke mand." / "Zet je vinger op de rand van elke pizza. Welke rand komt het verst?" / "Het ding dat zwaarder is, zakt op de weegschaal naar beneden."
- Bijzonder: "Wat is het tegenovergestelde van leeg?" (regel 1151) en "Het tegenovergestelde van zwaar is ... Kort, zwaarder of licht?" Het woord "tegenovergestelde" is te moeilijk voor de groep. Voorstel: "Leeg is als er niets in zit. Hoe heet het als er juist heel veel in zit?"

### M5. squla-getallenlijn-rangschikken-1/2/3: hint zonder het gekozen antwoord (cat. 1 en 5)
Bestand: `squla-getallenlijn.tsx` (reeksvragen), 24 keer "Tel 2 verder." en 62 keer "Zoek eerst het kleinste getal en zet dat vooraan."
- Letterlijk: "Welk getal hoort bij het vraagteken?" -> "Tel 2 verder."
- Mis: niet duidelijk vanaf welk getal. De zin is voor elk fout antwoord gelijk (7, 9 of 8). Bij "Zet de getallen op volgorde" is de standaardhint ook vast. De code (`ordenVraag`, regel 296 t/m 303) maakt het goed als het begin klopt ("Tot en met 3 staat het goed"), maar bij een volledig verkeerde volgorde komt altijd dezelfde tip.
- Voorstel: "Je koos 9. De rij gaat steeds 2 omhoog: 4, 6, 8. Wat komt na 6?" (met de echte getallen). Bij volgorde: "Je zette 13 vooraan. Er is een kleiner getal. Wijs het kleinste getal aan."

### M6. squla-huisnummers, getallenlijn-kat-1, getallenlijn-dieren-1/2/3: hint is bijna het antwoord (cat. 2)
Bestand: `squla-huisnummers.tsx` regel 235; `squla-getallenlijn.tsx` (kat en dieren).
- Letterlijk: "Welk huisnummer komt na 7?" -> "Het laatste huis is 7. Tel 1 verder." / "Het streepje voor het raketje is 5. Tel 1 verder." / "Kijk naar het getal links van de bal: 12."
- Mis: bij "na 7" en "tel 1 verder" is 8 meteen te zien. Dit is meer een tweede vraag dan een hint. Het mag, maar stel dan eerst het gekozen antwoord centraal: wat koos het kind en waarom klopt dat niet?
- Voorstel: "Je koos 6. Dat huis staat vóór 7. Zoek het huis dat na 7 komt." (bij kat: "Je koos 4. Dat is een streepje vóór het raketje. Kijk naar het streepje direct voor het raketje: 5. Waar staat het raketje dan?")

### M7. squla-dagen-van-de-week (tautologie, cat. 3)
Bestand: `squla-dagen.tsx` regel 181 en 212.
- Letterlijk: "Direct achter dinsdag staat de volgende dag." / "Direct vóór woensdag staat de vorige dag."
- Mis: dit zegt alleen wat "na" en "voor" betekent en verwijst niet naar het plaatje. De eerste zin ("Woensdag staat niet direct achter dinsdag" etc.) is goed, de tweede is een cirkelredenering.
- Voorstel: "Zet je vinger op de wagon van dinsdag. Welke wagon hangt direct achter die van dinsdag?" Voor de tweede fout: "Direct achter dinsdag hangt de wagon van woensdag. Dus na dinsdag komt woensdag."
- Let op: bij "sleep de goede dag naar de lege plek" (regel 246) is de reactie bewust leeg (geen zin, zoals Synthesis). Dat is in orde.

### M8. squla-splits-splitsen1-1/2 (grammatica en logica, cat. 4)
Bestand: `squla-splitsen.tsx` (pionnen/shirts, tekst "past niet in het paarse vak").
- Letterlijk: "Zoveel past niet in het paarse vak van dit huisje: het zijn er te weinig." en "Zoveel shirts passen niet in het paarse vak: het zijn er te veel."
- Mis: "Zoveel past niet ... het zijn er te weinig" klinkt tegenstrijdig (te weinig past wel). Ook onduidelijk: "past niet" voor "klopt niet".
- Voorstel: "Je legde 6 pionnen in het paarse vak. Het moesten er 2 zijn. Dat zijn er 4 te veel." / "... Dat zijn er 1 te weinig." Gebruik de echte getallen (komt de code met de aantallen? de vraagzin noemt ze al).

### M9. Sjablonen in de uitleg na de tweede fout (cat. 5)
- minsommen: "Ik zet 8 stippen neer." / "Er gaan er 3 weg." / "8 − 3 = 5." (110x, 75x, 47x, 46x in de uitvoer). Helder, maar bij elke minsom identiek en niet gekoppeld aan de gemaakte fout. Voorstel: één zin extra die het kind zijn vergissing laat zien, bijvoorbeeld: "Je typte 11. Dat is meer dan 8, maar er gaat iets af. 8 − 3 = 5."
- tellen-fruit en tellen-resultatief: "Ik help je met de appels. Een volle rij telt 5, dus we springen per rij." (in elke opgave, alleen het woord wisselt). Goed als uitleg, maar herhaalt zich voor alle opgaven; zie 5.11 punt 7 (niet in veel lessen bijna gelijk).
- meer-minder en rekenmix: "Tel de rest van de appels/sterren/ballen rij voor rij." (20x) en "Tel maar mee." / "We tellen samen, rij voor rij." (rekenmix). Voorstel: gebruik wat het kind koos: "Je koos 15. Tel de rest van de appels rij voor rij: 5, 10, dan nog 1. Hoeveel is dat?"

---

## LAAG

### L1. squla-klok-digitaal-1: reactie op "welke klok/wijzers" zonder verband (cat. 1)
- Letterlijk: "In de zandloper zit zand." (na de vraag "Waar zie je ook zo'n klok?")
- Mis: de zin zegt alleen wat een zandloper is, niet waarom het geen klok met wijzers is.
- Voorstel: "Een zandloper laat zien hoe lang iets duurt. Maar hij heeft geen wijzers. Zoek het rondje met 2 wijzers."

### L2. squla-plus-dansen-1 en -4: onnauwkeurige zin (cat. 4)
- Letterlijk: "Dat past niet in de rij van 10: er blijven stippen over." / "Zoveel passen er niet in de rij van 10."
- Mis: bij te veel stippen blijven er geen stippen "over" (ze passen er niet in). De twee zinnen betekenen hetzelfde maar klinken anders.
- Voorstel: "Dat zijn 11 stippen. De rij van 10 is vol, dus er is 1 stip te veel." / "Dat zijn er 8 samen. De rij van 10 is nog niet vol: er missen 2 stippen."

### L3. squla-geld-geldmachine-1/2: uitleg met de hele vraag erachter (cat. 6)
Bestand: `squla-geld.tsx` regel 577 t/m 585.
- Letterlijk in de uitvoer: "Kijk, dit zijn munten. Kijk, nog meer geld. Waar zie je een munt van 2 euro?" / "Hij is goud in het midden, met een zilveren rand. Kijk, nog meer geld. Waar zie je een munt van 2 euro?"
- Mis: bij elke stap in de uitleg lijkt de aanloop en de vraag opnieuw gesproken. Als dat echt zo is, krijgt het kind dezelfde aanloop meerdere keren, vlak voor het antwoord (3.23). Moet met een schermfoto bevestigd worden: misschien is het alleen de vraag die in beeld blijft staan.
- Voorstel: vraag en aanloop alleen vóór de eerste poging en na de uitleg 1 keer: "Zoek de munt met een 2 erop."

### L4. squla-tijd.tsx: gedeelde hint voor veel vragen (cat. 1 en 5)
Bestand: `squla-tijd.tsx` regel 820 en 855 (`reactie: () => hint(o.tip)`), plus 1086 en 1342 "Kijk goed welk getal erin staat." en 1322/1414 "Let op het rode woord."
- Van de 70 vragen hebben er 23 een eigen reactie; de rest geeft bij elk fout antwoord dezelfde tip. Controleer per vraag of de lijst `*_MIS` (bijv. `KAL1_MIS`) alle drie verkeerde keuzes dekt; de gedekte vragen zijn goed ("Op een klok zie je hoe laat het is, niet wat er gebeurt.").
- Voorstel: breid `reactie` uit met "Je koos X. ..." voor elke vraag zonder eigen mis-lijst.

### L5. squla-meer-minder: zinnen zonder inhoud (cat. 1)
Bestand: `squla-meer-minder.tsx` regel 284 en 290: "Let op, nu vraag ik iets anders." / "Kijk goed." Dit is geen reactie op een fout maar een overgang; zorg dat ze nooit direct na een foute poging klinken en dat ze iets zeggen over het plaatje ("Kijk, 3 kaarten...").

---

## Goed gedaan (voor de vergelijking)
Deze reacties voldoen aan 5.11 en kunnen als voorbeeld dienen: minsommen "Je koos 8: zoveel stippen waren er eerst. Er gaan er nog 3 weg, dus er blijven er minder over." (squla-minsommen.tsx regel 217), tellen "Je koos 10. Dat zijn precies de volle rijen. Kijk ook naar de rij die niet vol is.", piraat "In het vak liggen 7 goudstukken. Er moesten 10 in het vak, dat zijn er te weinig.", pizza "Deze pizza is nog te klein. Welke pizza is groter?", hoeveelheden "Op dit stokje zit nog niets.", rekentaal "De kant van de zak meel zakt naar beneden." en kalender in tijd ("Op een klok zie je hoe laat het is, niet wat er gebeurt.").

## Wat ik niet kon controleren
- Het beeld bij de hints (schermfoto's niet bekeken, alleen tekst).
- De tweede fout bij slepen/tikken: de uitvoer toont daar vaak geen tweede foutronde.
- Of de zinnen hardop hetzelfde klinken (STEMZINNEN.md niet vergeleken).
