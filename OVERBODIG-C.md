# Overbodige plaatjes, groep C (BOUWREGELS 1.22)

Bekeken (alleen lezen): squla-plussommen (16 lessen), squla-minsommen (16), squla-rekenmix (16), squla-rekentaal (1), squla-vormen (7) = 56 lessen, met hun vlakken.
Oplossingen: (1) verhaal naspelen in Phaser met tweens, (2) kleine zachte sfeer-achtergrond, (3) weghalen.

## Overbodig

### 1. squla-plus-kaal-1, -2, -3 (Kale sommen)
- Plaatje: groot plusteken met 8 zwevende cijfers (3, 7, 1, 9, 5, 2, 8, 4) op halve zichtbaarheid.
- Waar: `squla-plussommen.tsx` regel 1380 (begin) en 1382 (alle 15 vragen); getekend in `vlakken/squla-plussommen-vlak.tsx` regel 469-478.
- Waarom: het is expres een "sierplaatje" (zie regel 17 van het vlak). Het kind tikt of telt er niets mee en de som staat al bovenaan.
- Verklapt het antwoord? Nee. De cijfers zijn voor elke vraag hetzelfde. Ze kunnen wel toevallig gelijk zijn aan de uitkomst (3 + 4 = 7). Dat is geen bedoelde verklapper, wel verwarrend.
- Advies: (2). Maak het plusteken kleiner en zachter, weg uit het midden, en haal de zwevende cijfers weg. Alternatief (3).

### 2. squla-plus-bakkerij-3 (alleen de typvragen)
- Plaatje: een losse taart ("etalage").
- Waar: `squla-plussommen.tsx` regel 1182 `typSom(9, 9)` en regel 1187 `typSom(8, 6)`; standaardbeeld in regel 693; getekend in het vlak regel 423-424.
- Waarom: bij de typvraag "Reken uit" staat 1 taart die niets doet. Het zijn ook geen taartjes in de som.
- Verklapt het antwoord? Nee.
- Advies: (3) weghalen. Wil Sara toch iets, dan (1): 9 taartjes plus 9 taartjes in beeld, maar alleen als de zin over taartjes gaat.

### 3. squla-plus-dansen-1, -2, -3, -4 (disco)
- Plaatje: 2 luidsprekers (plus de discobal en draaitafel).
- Waar: `squla-plussommen.tsx` regel 1212 e.v. (4 lessen); getekend in het vlak regel 425-430.
- Waarom: de luidsprekers staan alleen als decor. De draaitafel draagt de kaartjes en de discobal en spots reageren op een goed antwoord. Die doen dus wel iets en blijven.
- Verklapt het antwoord? Nee.
- Advies: (2). Maak de luidsprekers een kleine, zachte achtergrond. Of (3) alleen de luidsprekers weg. Discobal, spots en draaitafel laten staan.

### 4. squla-min-ruimte-1 (vraag 4) en squla-min-ruimte-2 (2 typvragen)
- Plaatje: een losse komeet, satelliet en raket rechtsonder naast een kale som.
- Waar: `squla-minsommen.tsx` regel 1002 (`kaal` met `deco: "komeet"`), regel 1034 (`typen`, satelliet) en regel 1040 (`typen`, raketje); getekend in het vlak regel 605-612.
- Waarom: bij een kale som of typvraag staat 1 klein ding in de hoek. Het hoort niet bij de som en doet niets.
- Verklapt het antwoord? Nee.
- Advies: (3) weghalen. Kleine zachte achtergrond (2) mag ook.

### 5. squla-vormen-kleuren-1, -2, -3 (alleen het beginscherm)
- Plaatje: een rij gekleurde vormen (6 vierkantjes, 5 platte vormen, 5 ruimtevormen).
- Waar: `squla-vormen.tsx` regel 1708, 1739 en 1754 (`begin`).
- Waarom: het beginscherm zegt "een blauwe cirkel valt in stukjes", maar toont 5 losse vormen. Het kind doet er niets mee en de puzzel zelf is een ander plaatje.
- Verklapt het antwoord? Nee. Bij kleuren-2 en -3 komt de eerste vorm van de rij wel overeen met het eerste puzzelplaatje.
- Advies: (1). Toon het hele plaatje van de eerste puzzel. Tijdens het welkom valt het in stukjes (tween, stukjes schuiven los). Dat is ook wat de uitleg zegt ("Eerst zie je het hele plaatje, dan valt het in stukjes"). Vloeiend houden, regel 10.

## Randgeval (liever eerst Sara vragen)

### squla-min-machine-4 (geld)
- Plaatje: het ding dat gekocht wordt (ijsje, bal, vlieger, boek) naast de prijs in munten.
- Waar: `squla-minsommen.tsx` regel 1257 e.v.; getekend in het vlak regel 914-917.
- Waarom: het ding staat stil bij de prijs. Het geld en de portemonnee doen wel mee (aftrekken).
- Verklapt het antwoord? Nee.
- Advies: (1). Tijdens de vraag liggen de munten bij de portemonnee. Pas na het antwoord gaan de munten van de prijs naar het ding (stuiterend, muntjes vliegen weg).

## Verklapt het antwoord (bijvangst, geen overbodig plaatje)

### squla-min-bus1-1/2/3 en squla-min-bus2-1/2/3 (Bussommen)
- `squla-minsommen.tsx` regel 555-563: zodra het kind mag antwoorden, worden de pakjes die bezorgd zijn grijs (`grijs: v.b`). Het kind ziet dan al hoeveel er overblijven.
- Dat is tegen "geen plaatje of animatie laat het antwoord zien voordat het kind antwoordt".
- Advies: (1). Tijdens de vraag liggen alle pakjes in de bus. Pas na het goede antwoord rijdt of springt het bezorgde deel eruit (tween). Na de tweede fout als uitleg.

## Gecontroleerd en in orde (plaatje doet iets)

- Plussommen bakkerij, disco, bus: de dingen zijn de hoeveelheden die je telt of waar je mee rekent, of ze worden aangetikt.
- Minsommen: ruimte, bus, machine, bakjes, verbinden, bubbels, luisteren (luidspreker toont dat de som gezegd wordt) en schoolbord (de som staat erop).
- Rekenmix: alle 16 lessen. Elk plaatje is het ding dat geteld, vergeleken, geordend, aangetikt of versleept wordt.
- Rekentaal: alle voorwerpen worden aangetikt. De tafel of het kleed is een vlakke ondergrond, dus al zachte sfeer.
- Vormen: patronen, opruimen en oriënteren gebruiken elk plaatje in de vraag.
