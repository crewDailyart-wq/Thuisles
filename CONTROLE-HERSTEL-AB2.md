# Controle herstel A en B, ronde 2 — 7 november 2026

Onafhankelijke controleur. Ik heb alles zelf gespeeld als Testkind op `/voorbeeld/les/<id>?naam=Testkind`.
Steeds 1 headless Chrome tegelijk. Laptop is 1440x900, telefoon is 390x844 (foto's op dubbele scherpte).
Ik heb niets aan de code of de database veranderd.

De foto's staan in map F: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/ab2/`
- `lap/<les>/` = laptop, `tel/<les>/` = telefoon. `sNN-a-voor` = vóór het antwoord, `-b-…-1` en `-c-…-2` = 1,4 s en 3,2 s erna.
- `snel/` = foto's om de 0,22 s na het antwoord. Zo zie je de overgangen.

## Groep A

| Punt | Oordeel | Wat ik zag |
|---|---|---|
| squla-klok-hoelaat-1: bus tegen de klok | **GOEDGEKEURD** | De bus rijdt weg en stopt vóór de klok, met ruimte ertussen (`F/lap/squla-klok-hoelaat-1/s04-b-goed-1.jpg`, `s04-c-goed-2.jpg`, `s09-c-goed-2.jpg`). Bij de volgende vraag is de bus weg (`s05-a-voor.jpg`). Bij de zon en bij de bus is de klok even groot (`s03-a-voor.jpg` en `s04-a-voor.jpg`). Op de telefoon staat de bus boven de klok, zonder overlap (`F/tel/…/s04-c-goed-2.jpg`). |
| squla-klok-hoelaat-2: taart | **GOEDGEKEURD** | Op de laptop landt de taart bovenop de oven, helemaal in beeld en ver van de rand (`F/lap/squla-klok-hoelaat-2/s07-b-goed-1.jpg`). Op de telefoon landt hij naast de oven, ook helemaal in beeld (`F/snel/taart-tel-na-04.jpg`, `na-09.jpg`). |
| squla-klok-klokkijken3-4: vak "nu" en overgang | **GOEDGEKEURD** | Het vak "nu" staat bij elke vraag op precies dezelfde plek, bovenaan boven de middelste antwoordklok, met het plaatje links ervan (`F/lap/squla-klok-klokkijken3-4/s07-a-voor.jpg`, `s08-a`, `s11-c`, `s12-c`). De overgang heb ik per 0,22 s bekeken. Eerst vervaagt de oude klok, daarna komt de nieuwe klok in hetzelfde vak. Er staan geen 2 klokken over elkaar en het vak verspringt niet (`F/snel/kk34-lap-na-09.jpg` tot en met `na-12.jpg`). Taart en gieter staan klein en zacht op de achtergrond, dus de zinnen kloppen weer (`s08-a-voor.jpg`, `s12-c-goed-2.jpg`). |
| squla-tijd-kalender-1: gym-vraag | **GOEDGEKEURD** | Er staan 3 keuzes in 1 rij, even hoog, en de plek wisselt. Dat geldt voor de laptop (`F/lap/squla-tijd-kalender-1/s04-a-voor.jpg`) en de telefoon (`F/tel/…/s04-a-voor.jpg`). Er staat niets meer groot bovenaan. Opmerking voor de telefoon: zie punt N1. |
| Klokvlak op telefoon: vraagklok en "nu" | **GOEDGEKEURD** | De vraagklok is groot, ongeveer 270 px (`F/tel/squla-klok-hoelaat-1/s04-a-voor.jpg`, `F/tel/squla-klok-hoelaat-2/s07-a-voor.jpg`). Het vak "nu" is groot (`F/tel/squla-klok-klokkijken3-4/s07-a-voor.jpg`). Bij koppelen staan de klokken onder elkaar en groter (`F/tel/squla-klok-klokkijken1-1/s08-a-voor.jpg`). Memory is groot (`F/tel/squla-klok-digitaal-2/s08-a-voor.jpg`). Twee klokken naast elkaar zijn ook groot (`F/tel/squla-klok-klokkijken1-1/s01-a-voor.jpg`). |
| Klokvlak op telefoon: 3 keuzeklokken naast elkaar | **AFGEKEURD (klein)** | Ze zijn groter dan eerst: ongeveer 97 px tegen 75 px. Toch zijn de cijfers maar ongeveer 7 px. Bij "Kies de goede klok" is onder de rij nog bijna een derde van het speelvlak leeg (`F/tel/squla-klok-digitaal-2/s01-a-voor.jpg`, `F/tel/squla-klok-hoelaat-2/s08-a-voor.jpg`). Op echte grootte bekeken (`F/crop1x.jpg`) zie je de wijzers goed, maar de cijfers zijn piepklein. Dat botst met regel 1.24 ("zonder inzoomen"). Voorstel: zet ze staand als 2 + 1, of onder elkaar, zodat elke klok ongeveer 150 px wordt. Bij klokkijken3-4 is minder ruimte, want daar staat "nu" erboven. |
| Weektrein op telefoon | **GOEDGEKEURD** | De volle trein staat in 2 rijen, zonder overlap, en de dagnamen zijn ongeveer 13 px (`F/tel/squla-dagen-van-de-week/s02-a-voor.jpg`, `s09-a-voor.jpg`). Een korte trein staat in 1 rij en is groter (`s05-a-voor.jpg`, `F/tel/squla-tijd-dagen-2/s02-a-voor.jpg`). Het rondje om zaterdag en zondag staat in de onderste rij (`F/tel/squla-tijd-dagen-1/s03-b-goed-1.jpg`). Dagen-3 is goed leesbaar (`F/tel/squla-tijd-dagen-3/s02-a-voor.jpg`). Kleine punten: zie N2 en N3. |
| Laptop: niets slechter | **GOEDGEKEURD** | Kloklessen: hoelaat-1 en -2, klokkijken3-4, klokkijken1-1 (`F/lap/squla-klok-klokkijken1-1/s08-a-voor.jpg`) en digitaal-1 (`s04-a`, `s06-a`). Weektrein: dagen-van-de-week `s09-a` en tijd-dagen-1 `s04-a`. Alles ziet eruit zoals voor ronde 2. |
| Regressie: staandGroei raakt geen andere lessen | **GOEDGEKEURD** | In de code staat het vlak alleen hoger als `staandGroei` aanstaat, en dat staat alleen bij het klokvlak. Voor alle andere vlakken blijft de oude hoogte. Op de telefoon gecontroleerd: geld-2 (`F/tel/squla-geld-geld-2/s01-a-voor.jpg`). Uit groep C: plus-bakkerij-1 (`F/tel/squla-plus-bakkerij-1/s02-a-voor.jpg`) en rekenmix-mix1-1 (`F/tel/squla-rekenmix-mix1-1/s02-a-voor.jpg`). Uit groep B: meer-minder-evenveel3-2 (`s03-a`) en getallenlijn-kat-1 (`s02-a`). In al deze lessen heeft het speelvlak de oude maat en is niets verschoven. Op de laptop is geld-2 ook in orde. |

## Groep B

| Punt | Oordeel | Wat ik zag |
|---|---|---|
| squla-vormen-opruimen-1: rij van 3 in het vak | **GOEDGEKEURD** | De rij van 3 blokken, ballen of potloden past in het vak. Op de laptop blijft er ongeveer 18 px over (`F/lap/squla-vormen-opruimen-1/s05-a-voor.jpg`, `s13-a`, `s21-a`). Op de telefoon past het krap, met ongeveer 6 px (`F/tel/…/s05-a`, `s13-a`, `s21-a`). |
| squla-meer-minder-evenveel1-2 (telefoon): bloemen | **GOEDGEKEURD** | Bij de volgordekaarten staan de bloemen in kolommen van 5 en zijn ze ongeveer 15 px, dus goed te tellen (`F/tel/squla-meer-minder-evenveel1-2/s08-a-voor.jpg`). Bij de meer-of-minder-vragen ook (`s05-a`). Op de laptop is niets veranderd (`F/lap/…/s08-a-voor.jpg`). |
| squla-meten-oppervlakte-1 | **GOEDGEKEURD** | De rij van 4 tafels begint nu op ongeveer 80 px van de rand (`F/lap/squla-meten-oppervlakte-1/s05-a-voor.jpg`). Op de kaart staat "Blauw is 8 hokjes groot." helemaal, zonder afgekapte tekst (`s13-a-voor.jpg`). |
| squla-getallenlijn-kat-2: 10 onder de lijn | **GOEDGEKEURD** | Onder de lijn staan 10, 15 en 20 bij de ufo en bij de satelliet (`F/lap/squla-getallenlijn-kat-2/s04-a-voor.jpg`, `s05-a-voor.jpg`). |
| Strandbal herkenbaar | **GOEDGEKEURD** | Je ziet duidelijk een strandbal, niet meer iets wat op een verbodsbord lijkt. Bij tellen-resultatief3-3 (`F/lap/squla-tellen-resultatief3-3/s05-a-voor.jpg`, `s13-a`), vormen-orienteren-1 (`F/lap/squla-vormen-orienteren-1/s01-a`, `s04-a`) en getallenlijn-dieren-1 (`F/lap/squla-getallenlijn-dieren-1/s01-a-voor.jpg`). Ook bij opruimen en rekenmix. |

## Nieuwe opmerkingen (niet uit ronde 2, wel gezien)

- **N1 — Kalender-1 op de telefoon is klein (regel 1.24).** Bij de gym-vraag zijn de 3 keuzes klein. De getallen op de maandkalender zijn ongeveer 5 px en de hoepels op de weekkalender heel klein. Daaronder is de helft van het speelvlak leeg (`F/tel/squla-tijd-kalender-1/s04-a-voor.jpg`). Het kalendervlak groeit op een staand scherm niet mee, het klokvlak wel. Bij koppelen is het wel goed (`s09-a-voor.jpg`).
- **N2 — Eerste antwoordknop links half buiten beeld op de telefoon.** Bij de rij grote witte knoppen mist de linkerrand van de eerste knop. Dat zag ik bij tijd-dagen-1 (knop 5, `F/tel/squla-tijd-dagen-1/s03-a-voor.jpg`), plus-bakkerij-1 (7 en 8, `F/tel/squla-plus-bakkerij-1/s02-a-voor.jpg`), rekenmix-mix1-1 (10, `F/tel/squla-rekenmix-mix1-1/s02-a-voor.jpg`) en getallenlijn-kat-1 (4, `F/tel/squla-getallenlijn-kat-1/s02-a-voor.jpg`). Dit komt niet door ronde 2: het werd eerder al als "oud gedrag" gemeld bij dagen-1. Maar het staat in meerdere groepen en de helper zag het niet.
- **N3 — Het rode rondje bij de weekendvraag valt rechts tegen de rand.** Op de laptop wordt het afgekapt bij "zondag" (`F/lap/squla-tijd-dagen-1/s03-b-goed-1.jpg`). Op de telefoon raakt het de rand (`F/tel/squla-tijd-dagen-1/s03-b-goed-1.jpg`). Klein punt.
- **N4 — Weekendvraag op de telefoon.** De 3 kaarten met 2 dagen staan zonder vak. Daardoor lijkt de bovenste rij één rij van 4 wagons (`F/tel/squla-tijd-dagen-1/s04-a-voor.jpg`). Een klein beetje meer ruimte tussen de paren, of een zacht vak per paar, maakt het duidelijker.
- Bij gym (kalender-1) staat nog de oude rood-witte `bal.png` in de hoepel. Dat is groep A en Sara beslist daarover; het staat al in KEUZES-VOOR-SARA.

## Samenvatting

- 13 punten gecontroleerd. 12 zijn goedgekeurd en 1 is afgekeurd met een klein punt.
- **Afgekeurd (klein):** op de telefoon zijn 3 keuzeklokken naast elkaar nog te klein, met cijfers van ongeveer 7 px. Onder de rij is nog ruimte, dus zet ze staand als 2 + 1 of onder elkaar. De vraagklok, "nu", koppelen en memory zijn wel goed.
- Bus, taart, het vak "nu" en de overgang, de gym-vraag, de weektrein op de telefoon, opruimen, de bloemen, oppervlakte, de 10 onder de lijn en de strandbal zijn allemaal goed.
- Er is geen regressie: de laptop is onveranderd, en de staandGroei-wijziging raakt alleen het klokvlak.
- Nieuw gezien: kalender-1 is klein op de telefoon (N1), en in meerdere lessen valt de eerste antwoordknop op de telefoon half buiten beeld (N2).
