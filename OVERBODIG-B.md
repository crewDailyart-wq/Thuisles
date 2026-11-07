# Overbodige plaatjes, groep B (BOUWREGELS 1.22)

Alleen gelezen, niets aangepast. Gekeken naar: squla-piraat, squla-splitsen (+ hulp), squla-tellen, squla-meer-minder, squla-getallenlijn, squla-huisnummers (met hun vlakken).
Bestanden staan in `src/components/les/lessen/`. Adviesnummers: (1) verhaal naspelen in Phaser met tweens, (2) kleine zachte sfeer-achtergrond, (3) weghalen.

Bekeken: 40 lessen (piraat 3, splitsen 5, tellen 15, meer-minder 7, getallenlijn 9, huisnummers 1; de 3 proeflessen "proef-fruit" in tellen niet meegeteld).
Overbodig: 6 lessen. Geen overbodige plaatjes gevonden in: alle lessen van tellen, meer-minder, huisnummers, splitsen 1-1, 1-2 en delen (alles daar wordt geteld, gesleept, aangetikt of is het ding waar het om gaat).

---

## 1. squla-piraat-1 (Schattenjacht: plussommen)

| Plaatje | Waar | Waarom overbodig | Verklapt antwoord? | Advies |
|---|---|---|---|---|
| Schatkaart (maat 320) | `begin` regel 588; getoond bij het beginscherm (`start`, regel 561) en na "Kun je dit al?" (`naBegin`, regel 565) | De kaart staat er alleen bij de zin "Kijk, een schatkaart!". Daarna gaat het over goudstukken en de kaart komt nooit meer terug (de letters zijn gewone tekst onderin). Dit is het voorbeeld van Sara. | Nee | (1) Schatkist die opengaat. Zie ontwerp onder "Piraat: schatkist". |
| Losse decoratie planeet / raketje / maan / komeet boven de kale plussom | `kaalPlus(...)` regels 630-636 (vragen 9 t/m 15), plaatje op regel 369 | Bij "Hoeveel is 3 + 4? Sleep het goede getal" doet het plaatje niets. Het is alleen versiering. | Nee | (3) Weghalen. De som en de tegels hebben de ruimte nodig. Wil Sara toch iets: (2) 1 klein, zacht plaatje achter de som. |
| Rode rots, daarna rots + kistje (slotbeeld) | `slot` regel 639 en 641 | Komt na de laatste vraag. Het laat alleen zien waar de letters naartoe wijzen. Het plaatje doet niets in een opdracht. Grensgeval: het is de beloning aan het eind. | Nee (na de les) | (1) Het kistje gaat open en de nieuwe kaart komt eruit (zelfde beweging als de schatkist). |

## 2. squla-piraat-2 (Schattenjacht: minsommen)

| Plaatje | Waar | Waarom overbodig | Verklapt? | Advies |
|---|---|---|---|---|
| Schatkaart (maat 320) | `begin` regel 655 (start regel 561, naBegin regel 565) | Zelfde als level 1: kort in beeld, daarna alleen nog sterren, diamanten enz. | Nee | (1) Schatkist die opengaat; de 6 sterren van de eerste vraag springen eruit (zie ontwerp). |
| Komeet bij het raadsel "Waarom gaat een robot nooit zwemmen?" | `raadselTekst(..., "komeet", ...)` regel 685, plaatje op regel 492 (vraag 7) | Een komeet heeft niets met roest of zwemmen te maken. Het kind kiest uit twee tekstantwoorden. | Nee | (3) Weghalen. |
| Maansteen + sleutel (slotbeeld) | `slot` regel 698 | Zelfde als level 1: het verhaal-slot. Grensgeval. | Nee (na de les) | (1) De sleutel draait/past in een kistje dat opengaat, of (3) weghalen. |

## 3. squla-piraat-3 (Schattenjacht: plus en min)

| Plaatje | Waar | Waarom overbodig | Verklapt? | Advies |
|---|---|---|---|---|
| Schatkaart + sleutel | `begin` regel 712 (start regel 561, naBegin regel 565) | Kort getoond bij "We hebben een sleutel gevonden. Waar past hij op?" en daarna nooit meer gebruikt in een vraag. | Nee | (1) Zie ontwerp: de sleutel past op de schatkist. |
| Planeet naast de uitleg van 8 + 5 | `uitleg`, regel 728 (`ding` "planeet", maat 200) | Bij de uitleg "Kijk goed naar het teken" wordt niets met de planeet gedaan. | Nee | (3) Weghalen. |
| Decoratie planeet / raketje / komeet / maan boven de kale plussom | `kaalPlus(...)` regels 740, 742, 755, 757, 759, 761, 763 (vragen 2, 4, 8, 10, 12, 14, 16) | Zelfde als level 1. | Nee | (3) Weghalen (of (2)). |
| Maan bij het raadsel "Welke vrucht hoort in de ruimte? De maan-darijn of de banaan?" | `raadselTekst(..., "maan", ...)` regel 750 (vraag 5) | Doet niets in de vraag en verklapt het antwoord. Het goede antwoord is "De maan-darijn", en het plaatje is een maan. | JA, verklapt het antwoord | (3) Weghalen. Dit is de belangrijkste om te fixen. |
| Oude raket + schatkist (slotbeeld) | `slot` regel 766 | De kist staat dicht; de zin zegt "De kist zit vol glimmende sterren" maar je ziet het niet. Dit is precies de plek voor de schatkist-animatie. | Nee (na de les) | (1) Schatkist (zie ontwerp). |

### Piraat: schatkist (wens van Sara, uitwerking voor 1)

- Begin van elke piraat-les (vervangt de schatkaart): een gesloten schatkist, geen mensen. Tijdens "Kijk, een schatkist!" wiebelt hij 1 keer (tween op hoek en schaal) en het deksel klapt open (deksel draait om het scharnier, met een klein stofwolkje en een zachte plop).
- Daarna springen de schatten uit de kist, elk op een boogje (tween op x en y met "Back" of "Bounce" gevoel), draaien even en landen op hun plek. Handig: dit zijn meteen de voorwerpen van de eerste vraag (level 1: 14 goudstukken, level 2: 6 sterren, level 3: 7 sterren). Zo is de beginsituatie van de vraag het resultaat van de animatie en er wordt niets herhaald.
- Het antwoord wordt niet verklapt: het kind ziet alleen het begin (hoeveel erin zitten), nooit de uitkomst van de som.
- Slot level 3: de sleutel draait, de kist gaat open, glimmende sterren springen eruit en blijven liggen. Slot level 1 en 2: een klein kistje gaat open (nieuwe kaart komt eruit / sleutel valt eruit).
- Nodig: schatkist met los deksel (2 lagen) en een paar schatten (goudstuk, diamant, parel, ster zijn er al). `schatkist` en `kistje` bestaan al als voorwerp; het deksel moet apart worden getekend. Phaser-tweens, geen video. Vloeiend houden (regel 10): alle schatten vooraf bakken, geen filters per beeld.

## 4. squla-getallenlijn-kat-1 (Het raketje op de getallenlijn)

| Plaatje | Waar | Waarom overbodig | Verklapt? | Advies |
|---|---|---|---|---|
| Grote planeet + raketje (soort "planeet" zonder getal) | `watIsMeer`, regel 521 (`toon: () => toon(l, { soort: "planeet" })`); gebruikt in KAT_1 vraag 5, regel 1132 | De vraag is "Wat is meer: 13 of 14?" met een verhaaltje over sterren. De planeet en het raketje doen niets in de som en er staan geen sterren in beeld. | Nee | (2) Klein, zacht plaatje achter de keuzeknoppen. Of (1): het raketje vliegt tijdens de vraag naar de planeet (alleen de beginsituatie); na het antwoord laat de getallenlijn zien dat het later getal meer is. |
| Raketje, ufo en satelliet onder de bordjes | `dichtstBij`, regel 601 (`bordjes` met `wezens`), vlak `bouwBordjes` regels 417-430; KAT_1 vragen 11 en 12 (regels 1143-1144) | De vraag gaat over welk getal het dichtst bij 20 ligt. De figuurtjes naast de bordjes hebben geen taak. | Nee | (3) Weghalen. |

## 5. squla-getallenlijn-kat-2 (Het raketje op de getallenlijn, moeilijker)

| Plaatje | Waar | Waarom overbodig | Verklapt? | Advies |
|---|---|---|---|---|
| Planeet met getal + raketje erboven | `komtVoor`, regel 681; KAT_2 vragen 1, 7 en 9 (regels 1174, 1183, 1185), vlak `bouwPlaneet` regels 432-441 | De planeet draagt wel het getal (15, 19, 11), dus die doet iets. Het raketje erboven niet: de vraag is "Welk getal komt voor 15?". Grensgeval. | Nee | (1) Raketje vliegt tijdens de vraag naar de planeet en landt (beginsituatie, kleine stuiter en stofwolkje). Of (2) raketje kleiner. Planeet blijft, want die toont het getal. |
| Raketje, ufo en satelliet onder de bordjes | `dichtstBij`, regel 601; KAT_2 vragen 10 en 11 (regels 1187-1188) | Zelfde als bij kat-1. | Nee | (3) Weghalen. |

## 6. squla-splits-splitsen2-2 (Splitsen tot 20, moeilijker)

| Plaatje | Waar | Waarom overbodig | Verklapt? | Advies |
|---|---|---|---|---|
| Briefje van 10 + losse munten boven het huisje | `huisSom(..., geld = true)`, regel 260; vragen 1 en 2 (regels 1366-1367, "13 = 10 + 3" en "16 = 10 + 6") | De vraag is "Welke som past bij het huisje?". De som kies je uit de getallen in het huisje; het geld wordt niet gebruikt en herhaalt alleen het huisje. | Gedeeltelijk: het aantal losse munten is hetzelfde getal als in het huisje, dus het zegt niets extra's, maar het toont de splitsing ook zonder te rekenen | (3) Weghalen. |

---

## Grensgevallen die ik NIET overbodig vind (voor de controleur)

- squla-splits-splitsen2-1 (huisGetal met geld, regels 146 en 1292): het geld is hier bedoeld als steuntje (het welkom noemt het) en wordt in de uitleg aangewezen. Wel een punt voor Sara: bij "10 + ?" is het aantal losse munten precies het antwoord, dus de munten tellen verklapt het getal dat mist. Dat is het idee van een steuntje, maar het is wel zo bedoeld in vragen 1-4.
- squla-splits-splitsen1-2 vragen 9-11 (`s1PaalVraag` met basketballen, regel 873): de ballen links en rechts tonen a en de rest; het kind telt ze om het ontbrekende getal te vinden. Doet iets (steun) en verklapt het getal (telbaar). Zelfde afweging als hierboven.
- squla-huisnummers: maan, sterren en lantaarnpalen staan al als zachte achtergrond (is al optie 2).
- De splitsmachine bovenaan bij splitsen1-2 doet iets: de ballen komen eruit en vallen in het huisje.
- Letters/woord onderin de piraat-lessen zijn het spelmechaniek, geen plaatje.
