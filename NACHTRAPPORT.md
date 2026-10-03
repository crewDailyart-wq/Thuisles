# Nachtrapport — 2 oktober 2026

## Deel 1 — Werkplan

Staat erin:

- **Geld wisselen**: nieuw groepje bij Rekenen met geld, na Aanbiedingen. Vier titels.
- **Geldnotatie**: nieuw onderdeel tussen Munten en briefjes en Betalen. Drie groepjes, zes titels, met de regels over de punt en de komma. Betalen en Rekenen met geld schuiven daardoor een nummer op: onderwerp 3 en 4.
- **De algemene regel**: elke oefening minimaal 15 opgaven per ronde, zonder dubbele. Die staat bovenaan het werkplan.
- **Bij Geld**: "alle onderdelen staan nu in het werkplan; Geld wisselen en Geldnotatie moeten nog gebouwd worden". De kop heeft daarom geen "KLAAR" meer. Bij de drie gebouwde onderwerpen staat "KLAAR".

Niets daarvan is gebouwd.

## Deel 2 — Database

- **Back-up vooraf** in `backups/`:
  - een volledige kopie van de database;
  - een export van domeinen, onderwerpen, leerdoelen, sjablonen en vragen.

  `backups/` staat in `.gitignore`, omdat de volledige kopie ook de gegevens van je kind bevat.
- **Toegevoegd**, alles bij groep 4:

  | Wat | Aantal |
  |---|---|
  | Onderwerpen | 9 (6 bij Tijd, 3 bij Geld) |
  | Leerdoelen | 125 |
  | Sjablonen | 125 (één per leerdoel) |
  | Gepubliceerde opgaven | 1875 (15 per sjabloon, allemaal verschillend) |

- **Instellingen**: per titel precies die uit `scripts/opgaven.mjs`.
- **Verwijderd of gewijzigd**: niets. Nagekeken door alle bestaande rijen te vergelijken met de back-up; ook bij het kind en de voortgang is niets veranderd.
- **Dubbelcontrole**: het script slaat over wat al bestaat. Tweede keer draaien op een kopie: alles overgeslagen.
- **Vragen per oefensessie**: bij elk nieuw leerdoel op 15 gezet. De algemene standaard is 10, en dan zou een kind maar 10 opgaven per ronde krijgen.
- **Prijzen**: bij "In de winkel" en "Kun je het betalen?" staan de dingen nu in de admin-instelling met een prijsbereik per ding. Voorbeelden:
  - In de winkel: een ijsje 1-4, een bal 5-20, een knuffel 8-25, skeelers 30-70, een fiets 60-99.
  - Kun je het betalen?: ijsjes 1-4, pannenkoeken 4-9, kaartjes voor de dierentuin 6-15.

  Alles onder de 100 euro. Je betaalt met een van de twee kleinste briefjes die genoeg zijn.

### Keuzes die ik zelf heb gemaakt

- **Groepjes.** In de database bestaan geen groepjes, alleen onderwerpen met leerdoelen. Ik heb per onderwerp uit het werkplan één onderwerp aangemaakt (bijvoorbeeld "De wijzerklok") en het groepje in de naam in beheer gezet, bijvoorbeeld "Aflezen · Hele uren aflezen". Het kind ziet gewoon de titel.
- **Geld wisselen en Geldnotatie.** Bij Geld staan de onderwerpen op volgorde 1, 3 en 4. Plek 2 blijft vrij voor Geldnotatie.
- **Het aanmaakscript** heb ik niet in de repo gezet. Een script dat content aanmaakt, hoort daar volgens regel 2 niet.

## Deel 3 — Testen als kind

Ingelogd was al het kindprofiel van groep 4. Een wachtwoord heb ik niet ingevuld en ik heb geen apart testkind aangemaakt. Ik heb in elk van de negen onderwerpen een oefening geopend, maar **niets beantwoord**, zodat de voortgang van je kind niet verandert.

- Tijd en Geld staan op de juiste plek, met alle onderwerpen en titels.
- Elke ronde telt 15 opgaven: 15 bolletjes in de balk. In de database heeft elk sjabloon 15 verschillende gepubliceerde opgaven.
- De prijzen in de winkelzinnen zijn logisch: een ijsje van € 2,90 betaald met € 5,-, een fiets betaald met € 100,-.

### Opgelost

- Bij "Uren en minuten" stond de vraag twee keer in beeld. Nu één keer.
- De klok gaf een foutmelding bij het laden: server en browser rekenden de streepjes in de laatste decimaal anders uit. Nu afgerond.

### Niet opgelost (bestaande onderdelen, dus aan jou)

- **Volgorde op het kinderscherm.** Het kinderscherm zet de leerdoelen per soort oefening bij elkaar, van makkelijk naar moeilijk, niet in de volgorde van het werkplan. Dat is bewust zo gebouwd (zie `haalOefenStart` in `src/lib/data/queries.ts`). In de database staat wel de volgorde van het werkplan.
- **Luidspreker over de vraag.** Bij een lange vraag valt het luidspreker-icoon rechtsboven een beetje over de tekst, bijvoorbeeld "Vandaag is het 2 maart. Welke datum is het 3 dagen geleden?".
- **Foutmeldingen bij het laden.** In de ontwikkelversie kwamen er twee meldingen dat de server iets anders tekende dan de browser:
  - in de kinderlayout (`Kindschil`);
  - bij de volgorde van de vragen in een oefening.

  Dit zit in het bestaande oefenscherm en geldt voor alle domeinen. Het kind merkt er niets van; React tekent het scherm dan opnieuw.
- **Lege omschrijving bij Geld.** Het domein Geld heeft geen omschrijving. Op het domeinscherm begint de uitleg daardoor met een losse punt: ". Kies links een onderwerp".

## Samenvatting

Ik heb 125 leerdoelen en 125 sjablonen aangemaakt (met 9 onderwerpen en 1875 opgaven), allemaal bij groep 4. Alles is zichtbaar voor kinderen bij Tijd en Geld, met 15 verschillende opgaven per ronde. Test zelf het echte invullen en nakijken op een tablet (bedragen typen, wijzers zetten, slepen, munten leggen), want ik heb als kind niets beantwoord.

---

# Nachtrapport — 2 oktober 2026, ochtend

## Deel 1 — Verspringende opdrachten

**Nagebootst:** in de oefening "Rekenen met nullen" (Tafels) stond elke seconde een andere som in beeld.

**Oorzaak:** twee dingen samen.

1. De oefenpagina koos bij elke keer opbouwen met `Math.random()` een nieuwe greep vragen. Werd de pagina opnieuw opgebouwd, dan kreeg het kind een andere serie.
2. De ontwikkelserver zat sinds 12 minuten na het starten in een interne foutlus van Turbopack: "[Server HMR] Subscription error, resubscribing", elke seconde opnieuw, 2622 keer. Na elke herhaling stuurt Next een "ververs de pagina" naar de browser (te zien aan de header `next-hmr-refresh`).

De lus zat alleen in de ontwikkelserver. In de productiebuild (`npm run build` en `next start`) ververste de pagina niet vanzelf. Maar daar had elke andere verversing hetzelfde effect gehad: een serveractie, of terugkomen in een tabblad.

**Opgelost:** de pagina kiest de vragen nu met een vast zaad: het kind, de oefening en hoeveel antwoorden het kind al heeft gegeven.
- Zolang er niets beantwoord is, is de ronde bij elke keer opbouwen precies dezelfde, ook na herladen.
- Na het eerste antwoord neemt de bewaarde halve sessie het over, zoals al zo was.
- Is de ronde af, dan volgt er vanzelf een nieuwe greep.

Het aantal antwoorden wordt alleen gelezen; aan de voortgang en de antwoorden is niets veranderd. Voor en na: 163 antwoorden, 53 regels voortgang.

Daarnaast heb ik de ontwikkelserver herstart, zodat de foutlus weg is. Hij draait weer op de achtergrond zoals eerst; de uitvoer staat in `~/Library/Logs/thuisles-dev.log`.

**Getest als kind**, zonder iets in te vullen:

| Domein | Waar | Zelfde eerste opgave |
|---|---|---|
| Getallen | productiebuild | 40 seconden |
| Tafels | productiebuild | 37 seconden |
| Tijd | productiebuild | 37 seconden |
| Geld | productiebuild | 33 seconden, ook na herladen |
| Tafels | ontwikkelversie na de herstart | 33 seconden, geen verversingen meer |

Draaien van de tablet of focus verliezen bouwt het scherm niet opnieuw op vanaf de server. En als dat toch gebeurt, geeft het vaste zaad nu dezelfde ronde.

## Deel 2 — Database-back-up

- HARDE REGEL 4 in CLAUDE.md is aangepast: `data/*.db` gaat nooit in Git; de database wordt bewaard via het back-upscript.
- `scripts/backup-db.mjs` en `npm run backup`: een veilige kopie met de backupfunctie van SQLite naar `~/Library/Mobile Documents/com~apple~CloudDocs/Thuisles-backups/` (iCloud Drive). De datum en tijd staan in de naam; de laatste 14 kopieën blijven bewaard.
- Eén keer gedraaid: `thuisles-2026-10-02-0707.db` staat in de iCloud-map. Hij is te openen en bevat alle 285 leerdoelen.
- Elke dag om 22:00 draait het vanzelf via de LaunchAgent `nl.thuisles.backup`. Die staat in `~/Library/LaunchAgents/nl.thuisles.backup.plist`, een kopie in `scripts/`, en het logboek in `~/Library/Logs/thuisles-backup.log`.

**Let op: toestemming van macOS nodig.** Ik heb de dagelijkse taak één keer met de hand gestart. Hij bleef hangen voordat het script begon. Waarschijnlijk vraagt macOS of `node` vanaf de achtergrond in de map Bureaublad mag lezen, want daar staat het project. Die toestemming kan alleen jij geven:

- Staat er een melding als "node wil toegang tot bestanden in je map Bureaublad"? Klik dan op **Sta toe**. De hangende taak maakt dan meteen de back-up af.
- Staat er geen melding? Geef dan via **Systeeminstellingen → Privacy en beveiliging → Bestanden en mappen** (of **Volledige schijftoegang**) toegang aan `/usr/local/bin/node`.
- Lukt dat niet: `npm run backup` in de terminal werkt altijd.

**Dagelijkse back-up uitzetten:**

```
launchctl bootout gui/$(id -u)/nl.thuisles.backup
rm ~/Library/LaunchAgents/nl.thuisles.backup.plist
```

Weer aanzetten: zet het bestand uit `scripts/` terug in `~/Library/LaunchAgents/` en draai `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/nl.thuisles.backup.plist`.

### De oude kopieën in data/ (niet opgeruimd)

Deze 32 kopieën staan nog op de laptop. Ze staan niet meer in Git, maar alle 32 bevatten het kindprofiel. Opruimen beslis jij.

- `data/thuisles-backup-voor-leegmaken-20260910-010947.db`
- `data/thuisles-kopie-voor-plaatjes-20260930-0244.db`
- `data/thuisles-voor-aanvullenzin-20260929-220004.db`
- `data/thuisles-voor-ankerherstel-20260921-035241.db`
- `data/thuisles-voor-beeldtaal-20261001-0533.db`
- `data/thuisles-voor-domeinverhuizing-20261002-022246.db`
- `data/thuisles-voor-driehoek-20260929-235323.db`
- `data/thuisles-voor-eraf-nietvisueel-20261001-0503.db`
- `data/thuisles-voor-erafsommen-20261001-0246.db`
- `data/thuisles-voor-getallenlijn-20260921-032844.db`
- `data/thuisles-voor-moeilijkheid-20260923-034617.db`
- `data/thuisles-voor-opschalen-20260930-011812.db`
- `data/thuisles-voor-optellen-20260930-020519.db`
- `data/thuisles-voor-rekenrekonderwerp-20261001-0638.db`
- `data/thuisles-voor-schema123-20260929-233339.db`
- `data/thuisles-voor-schemarechts-20260929-231432.db`
- `data/thuisles-voor-splitsbloem-20260930-002553.db`
- `data/thuisles-voor-splitsen-20260929-205634.db`
- `data/thuisles-voor-splitstabel-20260929-213740.db`
- `data/thuisles-voor-splitstabelzin-20260929-214327.db`
- `data/thuisles-voor-splitsvragen-20260929-210524.db`
- `data/thuisles-voor-splitszinnen-20260929-231027.db`
- `data/thuisles-voor-stapstenenzin-20260919-191727.db`
- `data/thuisles-voor-straatzin-20260920-024211.db`
- `data/thuisles-voor-terugdraaien-20261001-0512.db`
- `data/thuisles-voor-titels-20260930-010835.db`
- `data/thuisles-voor-treinzin-20260919-193542.db`
- `data/thuisles-voor-tussenplaatjes-20260923-020456.db`
- `data/thuisles-voor-verdelen2-20260929-234512.db`
- `data/thuisles-voor-verdelenzin-20260930-000912.db`
- `data/thuisles-voor-vraagzinnen-20260919-183743.db`
- `data/thuisles-voor-wegstrepenzin-20261001-0546.db`

## In drie zinnen

De opdrachten sprongen omdat de oefenpagina bij elke keer opbouwen met toeval een nieuwe serie koos, en de ontwikkelserver door een interne fout de pagina elke seconde opnieuw opbouwde; nu kiest de pagina met een vast zaad en staat de opgave in Getallen, Tafels, Tijd en Geld stil, ook in de productiebuild en na herladen. De back-ups staan in iCloud Drive in de map Thuisles-backups (`~/Library/Mobile Documents/com~apple~CloudDocs/Thuisles-backups/`), de laatste 14 blijven bewaard, en `npm run backup` maakt er altijd met de hand een. De dagelijkse back-up van 22:00 zet je uit met `launchctl bootout gui/$(id -u)/nl.thuisles.backup` en daarna `rm ~/Library/LaunchAgents/nl.thuisles.backup.plist`; let op dat macOS die taak eerst toegang tot je map Bureaublad moet geven (zie hierboven).

---

# Wijzerklok: geen ochtend of avond op de klok — 2 oktober 2026

**Fout:** bij "Van wijzerklok naar digitale tijd" stonden 06:00 én 18:00 als keuzes. Er kwamen zelfs ongeldige tijden voor, zoals 27:00. Het zinnetje met het dagdeel kwam niet in beeld, omdat de standaardvraag er geen plek voor had.

**Aangepast in de code:**
- Een wijzerklok zonder dagdeel gebruikt alleen 01:00 tot en met 12:59, nooit 00:xx. 24-uurstijden komen alleen voor als het dagdeel erbij staat; dat staat nu altijd onder de klok ("Het is 's avonds.").
- Foute keuzes zijn nooit de goede tijd plus of min twaalf uur, en altijd geldige tijden.
- "Van digitale tijd naar wijzerklok" toont de digitale tijd in 12-uursnotatie.
- Bij "Schrijf de tijd digitaal" zonder dagdeel telt de tijd met twaalf uur verschil ook goed.
- Een getal met een nul ervoor ("06") telt overal bij Tijd als hetzelfde getal.
- `npm run opgaven` controleert deze regels voortaan bij elke commit.

**In de database** (back-up eerst in `backups/`): van drie oefeningen stonden de oude opgaven verkeerd.
- "Van wijzerklok naar digitale tijd: hele uren"
- "Van wijzerklok naar digitale tijd: halve uren"
- "Van digitale tijd naar wijzerklok"

Hun 45 oude opgaven staan nu op concept: ze zijn niet weg, maar een kind krijgt ze niet meer. Er staan 45 nieuwe, gepubliceerde opgaven voor in de plaats. Aan antwoorden, voortgang en sessies is niets veranderd.

Er was één halve sessie met één gegeven antwoord die naar die oude opgaven verwees. Die rijen zijn niet aangeraakt; bij die oefening begint je kind de volgende keer een nieuwe ronde.

**Gecontroleerd:**
- Alle 630 gepubliceerde opgaven in de 41 wijzerklok-oefeningen voldoen aan de regels, met minstens 15 per oefening.
- Als kind bekeken, zonder iets in te vullen: "Van wijzerklok naar digitale tijd", "Van digitale tijd naar wijzerklok" en "Schrijf de tijd digitaal".

---

# Wijzers zetten — 2 oktober 2026

Geldt voor elke oefening waarin het kind zelf de wijzers zet ("Zet de wijzers goed", "Zet de klok: …", "Hoe laat is het straks?", "Hoe laat was het eerder?").

**Slepen:**
- De klok sleept niet meer mee als plaatje en de cijfers worden niet meer geselecteerd: `user-select: none`, `-webkit-touch-callout: none`, `draggable="false"` en `touch-action: none`.
- Bij het vastpakken roept de klok `preventDefault()` aan en vangt hij de pointer, zodat de wijzer de vinger ook buiten de klok blijft volgen.
- Alleen de aangepakte wijzer draait, om het middelpunt.
- Gaat de grote wijzer over de 12, dan schuift de kleine mee. De kleine wijzer springt per uur.
- De grote wijzer klikt vast op 5 minuten, of per minuut bij oefeningen op de minuut.

**Voor het kind:**
- Aan beide wijzers zit een ronde knop met een grijpgebied van ruim 44 bij 44 pixels. De grote wijzer is oranje en langer.
- Onder de vraag staat "Sleep de wijzers naar de goede tijd."
- De knopjes uur –, uur +, minuten – en minuten + doen hetzelfde als slepen.
- De beginstand is een heel uur, nooit 12:00 en nooit het antwoord.
- Controleer blijft grijs tot er iets bewogen is.

**Nakijken:** zoals al zo was, telt alleen de stand. Half zeven is goed bij 06:30 én 18:30.

**Getest**, zonder iets in te vullen of na te kijken:
- Met de muis in "Zet de klok: hele uren": grote wijzer van 06:55 over de 12 naar 07:05, met de kleine wijzer mee.
- Met touch-events in "Zet de wijzers goed": een hele cirkel van 03:00 naar 04:05.
- In "Hoe laat is het straks?": beginstand en knopjes.
- Overal: geen selectie, één klok, de wijzerplaat staat stil, en Controleer gaat pas aan na bewegen.

Het tabletformaat kon ik niet echt instellen: het browservenster liet zich niet smaller maken. Probeer het daarom zelf even op de tablet.

---

# Wijzers zetten: een gewone klok — 2 oktober 2026

Op verzoek van de eigenaar zijn verwijderd:
- de knopjes uur –, uur +, minuten – en minuten +;
- de ronde bolletjes aan de wijzers;
- de oranje kleur.

De zetbare klok ziet er nu uit als een gewone klok:
- donkere wijzers, de grote wijzer tot bij de streepjes, de kleine korter en dikker;
- één klein rondje in het midden;
- de grote wijzer stopt bij elk streepje (elke minuut), en de kleine schuift mee zoals op een echte klok;
- een onzichtbaar, ruim grijpgebied langs elke wijzer, met de cursor "grab" en "grabbing".

Ongewijzigd: slepen zonder selectie en zonder meeslepende klok, de beginstand, de zin "Sleep de wijzers naar de goede tijd.", Controleer pas na bewegen, en de kleine NU-klok.

De klokken waarop het kind de tijd afleest houden hun kortere grote wijzer, die vóór de cijfers stopt. Die zijn niet aangepast. Wil je ze ook met de grote wijzer tot de streepjes, zeg het dan.

Getest met de muis, zonder iets na te kijken:
- In "Zet de klok: halve uren": 10:00 → 10:30 met de kleine wijzer ertussen, daarna 10:33 (per minuut), en de kleine wijzer los naar 1 uur.
- In "Zet de wijzers goed": 05:00 → 05:15.
- In "Hoe laat is het straks?": 07:00 → 07:30.

Overal geen selectie, één klok, geen knopjes, en Controleer pas actief na bewegen.

---

# Plop bij de wijzers, en alle klokken gelijk — 2 oktober 2026

**Plop:** hetzelfde geluid als bij de vos op de getallenlijn (`plop()` uit `src/lib/geluid.ts`).
- Het klinkt elke keer dat de grote wijzer een streepje verder springt, en elke keer dat de kleine wijzer een uur verder springt.
- Bij snel slepen klinkt hoogstens één plop per 40 ms.
- Staat het geluid uit, dan geen plop (`opgavegeluidStaatAan()`).

Getest door de tonen te tellen:

| Hoe gesleept | Resultaat |
|---|---|
| Langzaam, 10 streepjes | 10 plops |
| 7 standen | 7 plops |
| Heel snel, twee rondjes in 229 ms | 6 plops, minstens 40 ms uit elkaar |
| Eén sprong van 15 minuten in één beweging | 1 plop |

**Klokken:** alle klokken bij Tijd zien er nu hetzelfde uit, bij aflezen, zelf zetten en de kleine NU-klok. De grote wijzer loopt tot de streepjes, met dezelfde dikte en kleur en één klein rondje in het midden. Alleen het uiterlijk is veranderd, niet de opgaven. Bekeken in het voorbeeld in de admin: "Wijzerklok aflezen", "Wijzerklok met een vlek" en "Klokken koppelen" (kleine klokken). Alles is goed leesbaar.

**Let op, twee antwoorden tijdens de test.** Tijdens de eerste geluidstest in de kindomgeving ("Zet de klok: halve uren") zijn er twee antwoorden opgeslagen: om 10:17:55 en 10:18:25 (UTC), allebei direct goed, met 63 en 26 seconden bedenktijd. Ik heb niet op Controleer geklikt en die bedenktijden passen bij een kind dat zelf oefent. Maar het browservenster veranderde tijdens de test van formaat, dus ik kan niet uitsluiten dat het in mijn tabblad gebeurde. Ik heb ze laten staan. Waren ze niet van je kind, dan kun je ze in de admin weghalen. Daarna heb ik alleen nog in het voorbeeld in de admin getest.

---

# Klokoefeningen in de volgorde van school — 2 oktober 2026

Back-up vooraf met `npm run backup` (iCloud) en in `backups/`. Er is niets verwijderd. Aan de voortgang, de antwoorden en de sessies van je kind is niets veranderd: voor en na zijn het 183 antwoorden, 63 regels voortgang en 68 sessies.

**De leerlijn** staat nu als vaste regel in de code (`klokniveau` in `src/lib/moeilijkheid.ts`) en bovenaan Tijd in WERKPLAN.md. De bolletjes volgen er vanzelf uit:

| Bolletjes | Niveau |
|-----------|--------|
| ● | Hele uren; digitaal alleen 01:00 tot en met 12:00 |
| ●● | Halve uren (en hele uren); digitaal tot en met 12:59 |
| ●●● | Kwartier over en kwartier voor |
| ●●●● | Per vijf minuten; dagdelen; 24-uurstijden met het dagdeel erbij |
| ●●●●● | Op de minuut; 24-uurstijden zonder hulp |

**Wat er in de opgaven is veranderd:**
- De digitale klok gebruikt standaard alleen 01:00 tot en met 12:59. Er is een nieuwe instelling "Ook tijden van 13:00 en later" voor het hoogste niveau.
- Tijd vooruit en tijd terug blijven binnen hun niveau:
  - halve uren alleen op :00 en :30;
  - "andere minuten" op kwart over of kwart voor;
  - 24-uurstijden alleen bij "over het hele uur heen".
- Ook de foute keuzes blijven binnen het niveau, bijvoorbeeld geen "kwart over" bij hele uren.
- "Hoe lang duurt het? Hele uren" begint op het hele uur.
- De klokken bij "Welke klok hoort erbij?" staan in 12-uursnotatie.

**Database:**
- 33 leerdoelen staan op een nieuwe plek.
- 5 sjablonen kregen nieuwe instellingen.
- 50 sjablonen kregen 15 nieuwe, gepubliceerde opgaven. De 750 oude opgaven staan op concept: ze zijn niet weg, alleen het kind krijgt ze niet meer.
- Alle 885 gepubliceerde klokopgaven zijn nagekeken op hun niveau, ook de foute keuzes in woorden: 0 fouten.
- `npm run opgaven` bewaakt dit voortaan bij elke commit.

**Kinderscherm:** bij Tijd volgt de lijst nu precies de volgorde uit de database (en WERKPLAN.md), niet meer per soort oefening. De andere domeinen sorteren nog per soort, zoals ze deden; zeg het als die ook de volgorde van de database moeten volgen.

**Getest als kind**, zonder iets in te vullen:
- In alle vier klokonderwerpen komt de volgorde op het kinderscherm precies overeen met de database.
- De eerste en de laatste oefening van elk onderwerp leveren 15 opgaven.

Maanden en dagen en Kalender zijn niet aangeraakt.

## Alle klokoefeningen in de nieuwe volgorde

| # | Onderwerp · groepje | Titel | Bolletjes | Was | Wat er veranderd is |
|---|---|---|---|---|---|
| 1 | Wijzerklok en digitale klok | Hoe laat is het straks? | ●○○○○ | ●●○○○ | bolletjes 2 → 1; plek 3 → 1; foute klokken binnen het niveau; klokken in 12-uursnotatie; nieuwe opgaven |
| 2 | Wijzerklok en digitale klok | Uren en minuten | ●●○○○ | ●○○○○ | bolletjes 1 → 2; plek 1 → 2 |
| 3 | Wijzerklok en digitale klok | Zet de wijzers goed | ●●○○○ | ●●○○○ | plek 4 → 3 |
| 4 | Wijzerklok en digitale klok | Klokken koppelen | ●●○○○ | ●●●●○ | bolletjes 4 → 2; plek 7 → 4 |
| 5 | Wijzerklok en digitale klok | Van digitale tijd naar wijzerklok | ●●○○○ | ●●●●○ | bolletjes 4 → 2; plek 8 → 5; foute klokken binnen het niveau; klokken in 12-uursnotatie; nieuwe opgaven |
| 6 | Wijzerklok en digitale klok | Dagdelen | ●●●●○ | ●○○○○ | bolletjes 1 → 4; plek 2 → 6 |
| 7 | Wijzerklok en digitale klok | Van wijzerklok naar digitale tijd: hele uren | ●●●●○ | ●●●○○ | bolletjes 3 → 4 (24-uurstijden met dagdeel); plek 5 → 7; nieuwe opgaven |
| 8 | Wijzerklok en digitale klok | Van wijzerklok naar digitale tijd: halve uren | ●●●●○ | ●●●○○ | bolletjes 3 → 4 (24-uurstijden met dagdeel); plek 6 → 8; nieuwe opgaven |
| 9 | Wijzerklok en digitale klok | Schrijf de tijd digitaal | ●●●●○ | ●●●●● | bolletjes 5 → 4 |
| 10 | De wijzerklok · Aflezen | De grote en de kleine wijzer | ●○○○○ | ●○○○○ | alleen nog hele uren; nieuwe opgaven |
| 11 | De wijzerklok · Aflezen | Hele uren aflezen | ●○○○○ | ●○○○○ | foute keuzes binnen het niveau (bij hele uren geen "kwart over" meer); nieuwe opgaven |
| 12 | De wijzerklok · Aflezen | Halve uren aflezen | ●●○○○ | ●●○○○ | foute keuzes binnen het niveau (bij hele uren geen "kwart over" meer); nieuwe opgaven |
| 13 | De wijzerklok · Aflezen | Hele en halve uren door elkaar | ●●○○○ | ●●○○○ | foute keuzes binnen het niveau (bij hele uren geen "kwart over" meer); nieuwe opgaven |
| 14 | De wijzerklok · Aflezen | Klopt de klok? | ●●○○○ | ●●○○○ | — |
| 15 | De wijzerklok · Aflezen | Welke klok hoort erbij? Hele en halve uren | ●●○○○ | ●●○○○ | plek 7 → 6; foute klokken binnen het niveau; klokken in 12-uursnotatie; nieuwe opgaven |
| 16 | De wijzerklok · Aflezen | Kwartieren aflezen | ●●●○○ | ●●●○○ | plek 6 → 7; foute keuzes binnen het niveau (bij hele uren geen "kwart over" meer); nieuwe opgaven |
| 17 | De wijzerklok · Aflezen | Welke klok hoort erbij? Kwartieren | ●●●○○ | ●●●○○ | foute klokken binnen het niveau; klokken in 12-uursnotatie; nieuwe opgaven |
| 18 | De wijzerklok · Aflezen | Vijf voor en tien over aflezen | ●●●●○ | ●●●●● | bolletjes 5 → 4; foute keuzes binnen het niveau (bij hele uren geen "kwart over" meer); nieuwe opgaven |
| 19 | De wijzerklok · Aflezen | Welke klok hoort erbij? Vijf voor en tien over | ●●●●○ | ●●●●● | bolletjes 5 → 4; foute klokken binnen het niveau; klokken in 12-uursnotatie; nieuwe opgaven |
| 20 | De wijzerklok · Klok zetten | Zet de klok: hele uren | ●○○○○ | ●○○○○ | — |
| 21 | De wijzerklok · Klok zetten | Zet de klok: halve uren | ●●○○○ | ●●○○○ | — |
| 22 | De wijzerklok · Klok zetten | Hoe laat is het straks? | ●●○○○ | ●●○○○ | plek 14 → 13 |
| 23 | De wijzerklok · Klok zetten | Hoe laat was het eerder? | ●●○○○ | ●●●○○ | bolletjes 3 → 2; plek 15 → 14 |
| 24 | De wijzerklok · Klok zetten | Klokken op volgorde | ●●○○○ | ●●●●○ | bolletjes 4 → 2; plek 17 → 15 |
| 25 | De wijzerklok · Klok zetten | Zet de klok: kwartieren | ●●●○○ | ●●●○○ | plek 13 → 16 |
| 26 | De wijzerklok · Klok zetten | Hoe laat is het straks? Vijf voor en tien over | ●●●●○ | ●●●●● | bolletjes 5 → 4; plek 16 → 17 |
| 27 | De wijzerklok · Hoe lang duurt het? | Hoe lang duurt het? Hele uren | ●○○○○ | ●○○○○ | bij hele uren begint de opgave op het hele uur; nieuwe opgaven |
| 28 | De wijzerklok · Hoe lang duurt het? | Hoe lang geleden? Hele uren | ●○○○○ | ●○○○○ | plek 22 → 19; bij hele uren begint de opgave op het hele uur; nieuwe opgaven |
| 29 | De wijzerklok · Hoe lang duurt het? | Hoe lang duurt het? Halve uren | ●●○○○ | ●●○○○ | plek 19 → 20; bij hele uren begint de opgave op het hele uur; nieuwe opgaven |
| 30 | De wijzerklok · Hoe lang duurt het? | Hoe lang geleden? Halve uren | ●●○○○ | ●●○○○ | plek 23 → 21; bij hele uren begint de opgave op het hele uur; nieuwe opgaven |
| 31 | De wijzerklok · Hoe lang duurt het? | Hoe lang duurt het? Kwartieren | ●●●○○ | ●●●●○ | bolletjes 4 → 3; plek 21 → 22; bij hele uren begint de opgave op het hele uur; nieuwe opgaven |
| 32 | De wijzerklok · Hoe lang duurt het? | Hoe lang geleden? Kwartieren | ●●●○○ | ●●●●○ | bolletjes 4 → 3; plek 24 → 23; bij hele uren begint de opgave op het hele uur; nieuwe opgaven |
| 33 | De wijzerklok · Hoe lang duurt het? | Hoe lang duurt het? Over 12 uur heen | ●●●●○ | ●●●○○ | bolletjes 3 → 4; plek 20 → 24; bij hele uren begint de opgave op het hele uur; nieuwe opgaven |
| 34 | De wijzerklok · Hoe lang duurt het? | Hoe lang? Alles door elkaar | ●●●●○ | ●●●●● | bolletjes 5 → 4; bij hele uren begint de opgave op het hele uur; nieuwe opgaven |
| 35 | Digitale klok · Aflezen | Uren en minuten (met uitleg) | ●○○○○ | ●●○○○ | bolletjes 2 → 1; alleen nog hele uren, 01:00 tot en met 12:00; digitale tijden alleen 01:00–12:59; nieuwe opgaven |
| 36 | Digitale klok · Aflezen | Hele uren aflezen | ●○○○○ | ●●○○○ | bolletjes 2 → 1; plek 3 → 2; digitale tijden alleen 01:00–12:59 (was 00:00–23:59); foute keuzes binnen het niveau; nieuwe opgaven |
| 37 | Digitale klok · Aflezen | Hele en halve uren aflezen | ●●○○○ | ●●●○○ | bolletjes 3 → 2; plek 4 → 3; digitale tijden alleen 01:00–12:59 (was 00:00–23:59); foute keuzes binnen het niveau; nieuwe opgaven |
| 38 | Digitale klok · Aflezen | Hele uren, halve uren en kwartieren aflezen | ●●●○○ | ●●●○○ | plek 5 → 4; digitale tijden alleen 01:00–12:59 (was 00:00–23:59); foute keuzes binnen het niveau; nieuwe opgaven |
| 39 | Digitale klok · Aflezen | Hele uren in de dag | ●●●●○ | ●●○○○ | bolletjes 2 → 4; plek 2 → 5 |
| 40 | Digitale klok · Aflezen | Vijf en tien over en voor | ●●●●○ | ●●●●○ | digitale tijden alleen 01:00–12:59 (was 00:00–23:59); foute keuzes binnen het niveau; nieuwe opgaven |
| 41 | Digitale klok · Aflezen | Op de minuut | ●●●●● | ●●●●● | ook 24-uurstijden (zonder dagdeel); digitale tijden alleen 01:00–12:59 (was 00:00–23:59); foute keuzes binnen het niveau; nieuwe opgaven |
| 42 | Digitale klok · Later | Tijd vooruit: hele uren | ●○○○○ | ●○○○○ | tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 43 | Digitale klok · Later | Tijd vooruit: halve uren | ●●○○○ | ●●●○○ | bolletjes 3 → 2; plek 10 → 9; tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 44 | Digitale klok · Later | Tijd vooruit: hele uren, andere minuten | ●●●○○ | ●●○○○ | bolletjes 2 → 3; plek 9 → 10; tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 45 | Digitale klok · Later | Tijd vooruit: kwartieren | ●●●○○ | ●●●●● | bolletjes 5 → 3; plek 12 → 11; tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 46 | Digitale klok · Later | Tijd vooruit: over het hele uur heen | ●●●●● | ●●●●○ | bolletjes 4 → 5; plek 11 → 12; met 24-uurstijden; tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 47 | Digitale klok · Eerder | Tijd terug: hele uren | ●○○○○ | ●○○○○ | tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 48 | Digitale klok · Eerder | Tijd terug: halve uren | ●●○○○ | ●●●○○ | bolletjes 3 → 2; plek 15 → 14; tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 49 | Digitale klok · Eerder | Tijd terug: hele uren, andere minuten | ●●●○○ | ●●○○○ | bolletjes 2 → 3; plek 14 → 15; tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 50 | Digitale klok · Eerder | Tijd terug: kwartieren | ●●●○○ | ●●●●● | bolletjes 5 → 3; plek 17 → 16; tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 51 | Digitale klok · Eerder | Tijd terug: over het hele uur heen | ●●●●● | ●●●●○ | bolletjes 4 → 5; plek 16 → 17; met 24-uurstijden; tijden binnen 01:00–12:59 behalve bij 24-uurstijden; halve uren op :00/:30, andere minuten op kwart over/voor; nieuwe opgaven |
| 52 | Wijzerklok met vlekken | Hele uren: cijfers onder een vlek (met uitleg) | ●○○○○ | ●○○○○ | foute keuzes binnen het niveau; nieuwe opgaven |
| 53 | Wijzerklok met vlekken | Hele uren: wijzer onder een vlek | ●○○○○ | ●●○○○ | bolletjes 2 → 1; foute keuzes binnen het niveau; nieuwe opgaven |
| 54 | Wijzerklok met vlekken | Halve uren: cijfers onder een vlek | ●●○○○ | ●●○○○ | foute keuzes binnen het niveau; nieuwe opgaven |
| 55 | Wijzerklok met vlekken | Halve uren: wijzer onder een vlek | ●●○○○ | ●●●○○ | bolletjes 3 → 2; foute keuzes binnen het niveau; nieuwe opgaven |
| 56 | Wijzerklok met vlekken | Kwart over en kwart voor: cijfers onder een vlek | ●●●○○ | ●●●○○ | foute keuzes binnen het niveau; nieuwe opgaven |
| 57 | Wijzerklok met vlekken | Kwart over en kwart voor: wijzer onder een vlek | ●●●○○ | ●●●●○ | bolletjes 4 → 3; foute keuzes binnen het niveau; nieuwe opgaven |
| 58 | Wijzerklok met vlekken | Gemengd: cijfers onder een vlek | ●●●○○ | ●●●●○ | bolletjes 4 → 3; foute keuzes binnen het niveau; nieuwe opgaven |
| 59 | Wijzerklok met vlekken | Gemengd: grote vlek | ●●●○○ | ●●●●● | bolletjes 5 → 3; foute keuzes binnen het niveau; nieuwe opgaven |

---

# Kopjes, unieke titels en één oefening verborgen — 2 oktober 2026

Back-up vooraf met `npm run backup` en in `backups/`. Er is niets verwijderd. Aan antwoorden, voortgang, sessies, sjablonen en opgaven is niets veranderd.

- **Kopjes:** op het kinderscherm staan de groepjes nu als kopje boven de oefeningen. Dat geldt bij Tijd en Geld; andere domeinen hebben geen groepjes. Per kopje loopt de lijst op van makkelijk naar moeilijk. Nagekeken in alle onderwerpen van Tijd en Geld: nergens een terugsprong.
- **Verborgen:** "De grote en de kleine wijzer" staat op groep 3, dus niet zichtbaar voor groep 4. Een apart vinkje "verborgen" bestaat niet, daarom deze oplossing. Het leerdoel staat niet meer in WERKPLAN.md, maar bestaat nog wel.
- **Wijzerklok en digitale klok:**
  - "Hoe laat is het straks? Kies de klok" staat achteraan. Hij houdt ●○○○○, want zijn opgaven zijn hele uren. Zodat de lijst niet zonder kopje terugspringt, staat hij onder het kopje "Rekenen met de klok".
  - "Van wijzerklok naar digitale tijd: hele uren" heeft wel 24-uurstijden (10 van de 15 opgaven, met dagdeel). Hij blijft ●●●●○ en heet nu "… hele uren in de dag".
- **Unieke titels** (oude webadressen sturen door):

  | Was | Wordt |
  |---|---|
  | Uren en minuten | Hoeveel minuten in een uur? |
  | Hoe laat is het straks? (onderwerp 1) | Hoe laat is het straks? Kies de klok |
  | Hoe laat is het straks? (Klok zetten) | Hoe laat is het straks? Zet de klok |
  | Hele uren aflezen (wijzerklok) | Hele uren aflezen op de wijzerklok |
  | Hele uren aflezen (digitale klok) | Hele uren aflezen op de digitale klok |
  | Uren en minuten (met uitleg) | Uren en minuten op de digitale klok (met uitleg) |

  Daarnaast is "Van wijzerklok naar digitale tijd: hele uren" hernoemd, zie hierboven.
- **Niet aangepast, maar misschien wil je het:** "Van wijzerklok naar digitale tijd: halve uren" heeft ook 24-uurstijden met dagdeel. Die titel kan ook "… halve uren in de dag" worden.

---

# Wachtrij — 3 oktober 2026

Vooraf `npm run backup` en een kopie in `backups/`. Er is niets uit de database verwijderd en aan antwoorden of voortgang van kinderen is niets veranderd. Getest is alleen met het profiel Testkind. Oude opgaven die vervangen zijn, staan op concept (niet weg).

## Vragen voor Sara

(Bij twijfel is steeds de veiligste keuze gemaakt; hier staat wat je nog moet beslissen.)

- **00 — nieuwe mix per ronde.** Bijna elke oefening heeft precies 15 gepubliceerde opgaven en 15 vragen per ronde. Elke nieuwe ronde geeft dus dezelfde 15 opgaven in een andere volgorde, geen nieuwe opgaven. Wil je dat elke ronde echt andere opgaven heeft, dan moet er per oefening een grotere voorraad gepubliceerd worden (bijvoorbeeld 45). Dat heb ik niet gedaan: dat is veel nieuwe content in alle domeinen, en latere wachtrij-bestanden vragen juist om 15 per oefening. Zal ik dat doen?
- **01 — toetsenbord bij Geldnotatie.** Bij "Bedrag opschrijven tot 10 euro" en "Van woorden naar cijfers tot 10 euro" moet het kind zelf een komma typen. Daarom krijgt dat veld het toetsenbord met cijfers én een komma (`decimal`), niet het kale cijfertoetsenbord uit HARDE REGEL 5; daar kan geen komma op. Bij hele euro's is het wel het gewone cijfertoetsenbord. Graag even op een iPad proberen of de komma verschijnt.
- **02 — dubbele titels in oudere domeinen.** Bij Getallen, Splitsen, Optellen en Aftrekken (van vóór de SEO-basis, dus buiten deze opdracht) hebben 19 openbare pagina's voor groep 4 dezelfde titel en hetzelfde webadres als een andere pagina. Een voorbeeld: "Plaatjes tellen" staat vier keer bij Getallen, onder verschillende onderwerpen. Alleen de eerste is dan via dat adres bereikbaar. Bij Optellen heten een onderwerp en een oefening allebei "Optellen tot en met 20", net als "Aftrekken tot en met 15" bij Aftrekken. Ik heb niets veranderd. Wil je dat ze een eigen SEO-titel en eigen adres krijgen, bijvoorbeeld met de naam van het onderwerp erbij?
- **02 — sitemap met korte adressen.** In de sitemap staan de adressen zonder domeinnaam (`/groep-4/geld`), terwijl zoekmachines het volledige adres verwachten (`https://…/groep-4/geld`). Dat gaat pas tellen als de site online staat, maar dan is de domeinnaam nodig. Welke wordt het?
- **06 — halve uren "tot 12:00".** Bij de halve uren noemde je 01:30 tot en met 12:30 voor de eerste stap en 13:30 tot en met 23:30 voor de tweede. 12:30 is al middag, en dat past niet bij een titel "tot 12:00" met 's nachts of 's ochtends. Daarom heb ik gekozen voor 01:30 tot en met 11:30 en 12:30 tot en met 23:30. Moet 12:30 toch bij de eerste?
- **07 — "0,3,2,1" na een fout antwoord.** Bij Klokken op volgorde, en bij andere sleepoefeningen, staat na een fout antwoord in het groene vakje het antwoord zoals de computer het opslaat: "0,3,2,1". Voor een kind zegt dat niets. Onder de vakjes staat al wel welke klok erin hoorde. Hetzelfde gebeurt bij keuze-oefeningen in Tijd, bijvoorbeeld "0" bij Hoe lang duurt het? (de goede knop is daar wel groen gekleurd). Dat groene vakje bestond al; ik heb het niet veranderd. Zal ik het bij sleep- en keuze-oefeningen weglaten, of er de tijden en woorden in zetten?
- **16 — munten iets groter.** Je vroeg om formaat en indeling gelijk te houden. Op de oude maat waren de waardes op de echte munten (vooral 10, 20 en 50 cent en de 1 euro) te klein om te lezen. Daarom zijn alleen de munten een kwart groter dan de getekende munten; ze blijven veel kleiner dan een echte munt. Briefjes zijn even hoog als eerst. De indeling van de oefeningen is niet veranderd. Is dat goed zo?
- **17 — plek van het domein.** Verhaaltjessommen staat achteraan in de lijst met domeinen, na Tabellen & grafieken. Daarvoor hoefde ik niets aan de andere domeinen te veranderen. Wil je het liever direct na Geld? Dat kan in beheer, of ik zet het voor je om.

## 00 — Losse verbeteringen

1. Het kopje "Klokken koppelen" staat boven de eerste 8 oefeningen van Wijzerklok en digitale klok. De hernoeming naar "… halve uren in de dag" heb ik overgeslagen, omdat bestand 06 die vervangt.
2. Kindprofiel **Testkind** (groep 4, avatar Berg) aangemaakt onder je eigen ouderaccount. In CLAUDE.md staat nu dat testen als kind alleen met Testkind mag.
3. Nagekeken: herladen binnen een ronde geeft dezelfde opgaven; een nieuwe ronde geeft een nieuwe greep en volgorde. Dezelfde som komt nooit direct na elkaar; dat werd nog niet goed bewaakt na het naar voren halen van "zelf doen"-sommen, en dat is opgelost. Zie de vraag hierboven.
4. Dagdelen: de tijden 00:00, 06:00, 12:00 en 18:00 komen niet meer voor. Er zijn 15 nieuwe opgaven gemaakt; de oude staan op concept.
5. De vraag houdt aan beide kanten ruimte vrij voor de luidspreker. Nagemeten op 360 px en 820 px breed: de knop raakt de tekst niet meer.
6. Geld heeft de omschrijving "Munten en briefjes herkennen, bedragen schrijven, betalen en rekenen met geld."
7. De domeinen zelf stonden al op de volgorde uit de database, de oefeningen daarbinnen alleen bij Tijd. Nu volgen de oefeningen bij álle domeinen de volgorde uit de database. Vooraf is de volgorde die kinderen zagen in de database gezet (65 van de 285 leerdoelen kregen een ander volgnummer). Voor een kind verschuift er dus niets. Wat je in beheer omhoog of omlaag zet, staat vanaf nu ook zo bij het kind. Een nieuw leerdoel komt achteraan zijn onderwerp te staan.

## 01 — Geld wisselen en Geldnotatie

- **Geldnotatie** is een nieuw onderwerp tussen Munten en briefjes en Betalen, met drie kopjes: Het prijskaartje (2), Geld tellen en opschrijven (2) en Bedragen in woorden (2). Titels en bolletjes zoals in WERKPLAN.md.
- **Geld wisselen** staat als kopje achteraan bij Rekenen met geld (4 oefeningen). Het kind tikt op een van drie kaartjes, zonder letters. Eén kaartje is precies evenveel waard; de andere twee zitten er net boven en net onder. Bij het briefje van € 100 zitten ze er allebei onder, zodat alles tot 100 euro blijft.
- Typen gaat in één gewoon invoerveld. Een punt geeft de hint "Gebruik een komma"; Controleer blijft dan uit, dus het telt niet als fout. 7,5 en 7,50 zijn allebei goed, net als 26, 26,- en 26,00.
- In de database staan 10 nieuwe leerdoelen bij groep 4, elk met een sjabloon, "vragen per oefensessie" 15 en 15 verschillende gepubliceerde opgaven.
- Getest met Testkind: "Bedrag opschrijven tot 10 euro" (eerst 8.80 → hint, daarna 8,8 → goed; 4,51 → fout met het goede antwoord erbij), "Wisselen in briefjes en munten" (goed kaartje → goed) en "Van woorden naar cijfers tot 100 euro" (10 → goed).

## 02 — SEO controleren

Nagelopen met een script langs alle 583 openbare pagina's uit de sitemap, en een paar pagina's echt opgehaald.

- **Delen, Tafels, Tijd en Geld** (ook de nieuwe Geldnotatie en Geld wisselen): elke pagina heeft een eigen Nederlandse titel en omschrijving, staat in de sitemap, en heeft geen dubbele titel. Die komen automatisch uit de naam, net als bij de SEO-basis. Een voorbeeld: "Een briefje wisselen oefenen – groep 4 | Thuisles".
- Pagina's achter de inlog (oefenen, ouder, admin, kies, start enzovoort) staan niet in de sitemap. Ze staan wel dicht in `robots.txt` en hebben `noindex`.
- **Aangevuld: 0 pagina's.** Er ontbrak niets bij de domeinen uit deze opdracht. Wat ik in oudere domeinen tegenkwam, staat bij "Vragen voor Sara".

## 03 — Oefeningen verbergen

- In het beheer staat op elk leerdoelscherm, bij Gegevens, de regel "Zichtbaar voor kinderen" met een vinkje **Verborgen**. Je hoeft daarvoor niet op Bewerken te klikken; het vinkje werkt meteen. In de lijst met leerdoelen staat "Verborgen voor kinderen" onder een verborgen leerdoel. Het vinkje staat ook in het schermcontract, zodat het niet ongemerkt kan verdwijnen.
- Een verborgen leerdoel staat nergens bij een kind: niet in de lijsten, niet in de tellers ("0 van 8 beheerst"), niet in vrij oefenen of bij de methode, en ook niet op de openbare pagina's. Via een oud webadres krijgt een kind "Nog geen oefeningen beschikbaar". In de database blijft alles staan.
- "Hoeveel minuten in een uur?" en "De grote en de kleine wijzer" staan op verborgen. "De grote en de kleine wijzer" staat weer op groep 4. Beide zijn uit WERKPLAN.md gehaald; het kopje "Klokken koppelen" staat nu boven de overige oefeningen bovenaan dat onderwerp.
- In `scripts/opgaven.mjs` staan ze nog wel: daar wordt nog steeds nagekeken dat hun opgaven kloppen, voor het geval je ze weer zichtbaar maakt.
- Getest met Testkind: beide zijn weg uit Tijd, en de teller bij Wijzerklok en digitale klok staat op 8.

## 04 — Klokken koppelen en vraagteksten

1. De vraag is nu "Sleep elke tijd naar de goede klok.", ook in de 15 bestaande opgaven (alleen de tekst). De vakjes staan namelijk náást de klokken, niet eronder. De andere sleepoefeningen ("Sleep de uitkomst naar de som.", "Sleep de keersom naar de deelsom.", "Sleep het geld van weinig naar veel waard.", "Sleep de klokken van vroeg naar laat.") kloppen met waar de vakjes staan; daar is niets aan veranderd.
2. Een lange vraag loopt altijd over meerdere regels. Een heel lang woord wordt zo nodig afgebroken in plaats van van het scherm te vallen. Afgeknipte teksten (`truncate` en dergelijke) komen in de oefenschermen nergens voor.
3. De klokken bij Klokken koppelen zijn groter: 128 px op een smal scherm en 144 px vanaf tabletbreedte (was 96 px). De cijfers op elke wijzerklok staan nu boven de wijzers, met een smalle witte rand eromheen. Daardoor valt de 12 nooit meer weg achter de grote wijzer, op alle klokken in de app. Nagemeten op 360 en 768 px breed: niets valt buiten het scherm.

## 05 — Dagdelen

1. De vraag is nu "Welk deel van de dag is het?", in de generator én in de 30 opgaven in de database (15 gepubliceerd en 15 op concept; alleen de vraagtekst). Er wordt bij deze oefening geen vraag voorgelezen: de stem leest alleen de uitleg na een fout antwoord voor, en daar stond de oude zin niet in.
2. De vier knoppen staan altijd in dezelfde volgorde, twee bij twee, ook op een smal scherm: boven ochtend en middag, onder avond en nacht. Dat geldt ook voor de opgaven die al in de database stonden, want het scherm zet ze zelf op volgorde. Aan de antwoorden verandert niets. Getest met Testkind: 01:00 → "nacht" → goed.

## 06 — Tijd in de dag in stapjes

Bij Wijzerklok en digitale klok staan nu drie nieuwe kopjes, elk met drie stapjes. De bestaande leerdoelen zijn de "hele dag"-versie geworden, zodat hun voortgang bewaard blijft. De andere zes zijn nieuw, met elk 15 opgaven en "vragen per oefensessie" 15.

| Kopje | Titel | Bolletjes | |
|---|---|---|---|
| Hele uren in de dag | Van wijzerklok naar digitale tijd: hele uren tot 12:00 | ●●●○○ | nieuw |
| | … hele uren na 12:00 | ●●●●○ | nieuw |
| | … hele uren, hele dag | ●●●●○ | was "… hele uren in de dag" |
| Halve uren in de dag | Van wijzerklok naar digitale tijd: halve uren tot 12:00 | ●●●○○ | nieuw |
| | … halve uren na 12:00 | ●●●●○ | nieuw |
| | … halve uren, hele dag | ●●●●○ | was "… halve uren" |
| Tijd digitaal schrijven | Schrijf de tijd digitaal: tot 12:00 | ●●●○○ | nieuw |
| | … na 12:00 | ●●●●○ | nieuw |
| | … hele dag | ●●●●○ | was "Schrijf de tijd digitaal" |

- Nooit 00:00 en nooit precies 06:00, 12:00 of 18:00. Daarvoor is er een nieuwe instelling "Welke tijden van de dag" (tot 12:00, na 12:00, de hele dag). De drie bestaande leerdoelen kregen daarom 15 nieuwe opgaven; de oude staan op concept.
- Oude webadressen sturen door naar de nieuwe (nagekeken: 308 naar het nieuwe adres).
- Getest met Testkind: de vier kopjes staan in deze volgorde op het kinderscherm, en "Schrijf de tijd digitaal: na 12:00" (13:00, 's middags) → 13 : 00 → goed.

## 07 — Klokken op volgorde

1. De vraag is "Het is ochtend. Zet de klokken op volgorde van vroeg naar laat." Er komen alleen tijden van 06:00 tot en met 11:30 voor, dus nooit over de 12 heen en altijd één goed antwoord. Er zijn 15 nieuwe opgaven; de oude staan op concept. (Bij de eerste poging kwam de nieuwe regel per ongeluk bij "Klokken koppelen" terecht. Dat heb ik teruggezet voordat er iets gecommit was, en de 15 opgaven die toen gemaakt waren, staan op concept.)
2. De vier vakjes staan naast elkaar in één rij, met "1e" tot en met "4e" erboven, en zijn kleiner dan eerst (112 px). Op een smal scherm staan ze twee bij twee. De klokken om te slepen liggen eronder, vier op een rij als het past. Alles past op één scherm zonder scrollen.
3. Andere oefeningen met "eerder" of "later" op een wijzerklok ("Hoe laat was het eerder?", "Hoe laat is het straks?") rekenen vanaf een tijd die al op de klok staat. Daar is altijd maar één antwoord mogelijk, dus daar hoefde niets te veranderen.
- Getest met Testkind: tikken legt een klok in het eerste lege vakje; een verkeerde volgorde wordt fout gerekend, met per vakje welke klok erin hoorde.

## 08 — Hoe lang duurt het? en Hoe lang geleden?

1. De klok laat altijd "nu" zien, de zin noemt alleen de andere tijd. Bijvoorbeeld: "Je gaat om half twee naar het zwembad. Kijk op de klok hoe laat je klaar bent. Hoe lang duurde het?" en "Om half twee ging je naar de speeltuin. Kijk hoe laat het nu is. Hoe lang geleden is dat?"
2. Bij de zes oefeningen van ● tot en met ●●● kiest het kind uit vier knoppen in schooltaal, altijd van kort naar lang (zie WERKPLAN.md). De duur is daar ook altijd een van die vier.
3. "Over 12 uur heen" en "Alles door elkaar": typen in de vakjes uur en minuten, die bij de start allebei leeg zijn. De regel over lege vakjes is verder aangepast in bestand 12.
4. Alle 8 oefeningen hebben 15 nieuwe opgaven; de oude staan op concept. Oude opgaven die een kind nog in een half afgemaakte ronde heeft, kloppen nog steeds.
- Getest met Testkind: "Hoe lang duurt het? Halve uren" (3 uur → klok half vier): "een uur" → fout, met "een half uur" groen erbij.

## 09 — Digitale uitleg verbergen

"Uren en minuten op de digitale klok (met uitleg)" staat op verborgen, met het vinkje uit bestand 03. Hij is niet verwijderd en aan antwoorden of voortgang is niets veranderd. Hij is uit WERKPLAN.md gehaald, en "Hele uren aflezen op de digitale klok" is nu de eerste oefening onder Aflezen. In de database stond hij al op plek 2, direct na de verborgen oefening, dus de volgorde hoefde niet te veranderen.

## 10 — Logische situaties bij dagdelen

- Bij Digitale klok → "Hele uren in de dag" hoort bij elke situatie nu een vak van uren waarop hij logisch is, volgens jouw richtlijn: opstaan 7–8 uur, onweer of een enge droom 's nachts 1–5 uur, buiten spelen 15–16 uur, in bad 19 uur, enzovoort. Nooit 00:00, 06:00, 12:00 of 18:00. De namen wisselen af: Sam, Noor, Daan, Aya, Milan, Lina, Finn, Yara, Bilal, Mila, Ravi en Zoë.
- De oefenvorm en de antwoordlogica zijn hetzelfde gebleven: korte situatie, digitale klok, vier keuzes in kloktaal. De foute keuzes zijn hetzelfde uur in een ander dagdeel en het uur ervoor of erna.
- In het beheer staan de situaties in hetzelfde tekstveld, nu met de uren erachter: "{naam} staat op om 7-8". Je eigen lijst stond er zonder uren; die zou niet meer werken en is vervangen door de nieuwe lijst. Wat er stond: "Sam staat op om, Sam gaat naar school om, Sam eet om, Sam gaat voetballen om, Sam gaat naar bed om".
- Er zijn 15 nieuwe opgaven; de oude staan op concept. Andere oefeningen met een situatie, een digitale tijd en kloktaal zijn er niet.
- Getest met Testkind: "Yara gaat in bad om…" bij 19:00, met de keuzes zes uur 's avonds, zeven uur 's ochtends, zeven uur 's avonds en acht uur 's avonds.

Tien voorbeeldvragen uit de gepubliceerde opgaven:

| Vraag | Tijd | Goed antwoord |
|---|---|---|
| Sam heeft gym om… | 11:00 | elf uur 's ochtends |
| Noor heeft gym om… | 09:00 | negen uur 's ochtends |
| Daan gaat naar voetbal om… | 17:00 | vijf uur 's middags |
| Aya wordt wakker van een enge droom om… | 01:00 | één uur 's nachts |
| Milan wordt wakker van het onweer om… | 05:00 | vijf uur 's nachts |
| Lina gaat buiten spelen om… | 15:00 | drie uur 's middags |
| Finn wordt wakker van het onweer om… | 04:00 | vier uur 's nachts |
| Yara gaat in bad om… | 19:00 | zeven uur 's avonds |
| Bilal speelt na het eten op het schoolplein om… | 13:00 | één uur 's middags |
| Mila staat op om… | 07:00 | zeven uur 's ochtends |

## 11 — Tijd vooruit en Tijd terug

1. De vraag zegt altijd welke kant op. Bij Later: "Het is 03:30. Hoeveel later is het om 05:45?" Bij Eerder: "Het is 08:00. Hoeveel eerder was het om 05:00?" Aangepast in de generator en in alle 300 opgaven in de database (alleen de vraagtekst). "Hoeveel tijd zit ertussen?" komt nergens anders voor.
2. Boven de klokken staat NU en LATER, of EERDER en NU.
3. Bij Later staat NU links met een pijl naar rechts. Bij Eerder staat de eerdere klok links met een pijl naar links (op een smal scherm onder elkaar, met een pijl omhoog). Het woord "TERUG" onder de pijl is weg, en "VOORUIT" ook: de labels erboven zeggen het nu. Dat laatste vroeg je niet letterlijk, maar met maar één woord bij één van de twee zou het ongelijk worden. Wil je VOORUIT terug, zeg het dan.
4. De stem leest hier geen vraag voor, dus daar hoefde niets aan te veranderen. De antwoorden zijn hetzelfde gebleven.
- Getest met Testkind in beide groepjes: Later (03:30 → 05:45) en Eerder (08:00 ← 05:00, 3 uur → goed).

## 12 — Lege vakjes tellen niet als 0

- Bij alle Tijd-oefeningen met de vakjes "uur" en "minuten" (Tijd vooruit, Tijd terug, Hoe lang duurt het?, Hoe lang geleden?) moet het kind beide vakjes invullen. Bij hele uren typt het een 0 bij de minuten. Dit vervangt de regel uit bestand 08 dat een leeg vakje als 0 telt.
- Controleer gaat pas aan als beide vakjes gevuld zijn.
- Onder de vakjes staat nu: "Vul beide vakjes in. Geen minuten? Typ dan een 0." Bij Tijd vooruit en terug in plaats van de oude zin, bij Hoe lang duurt het? (typen) is hij erbij gekomen.
- De regel staat bijgewerkt in WERKPLAN.md. Aan antwoorden en voortgang is niets veranderd.
- Getest met Testkind bij "Tijd vooruit: hele uren" (03:00 → 06:00): alleen 3 bij de uren → Controleer blijft grijs; 0 bij de minuten erbij → Controleer gaat aan; minuten weer leeg → weer grijs.

## 13 — Vlekken repareren

Bij alle 8 oefeningen van Wijzerklok met vlekken ligt de vlek nu op de plek waar hij iets verbergt wat je nodig hebt. Het antwoord blijft wel altijd af te leiden. De vlek is een echte oranje inktvlek in de kleur van Thuisles: onregelmatig, met een paar spetters, helemaal ondoorzichtig, en per opgave een beetje anders van vorm en draaiing.

- **Cijfers onder een vlek:** de vlek bedekt precies het cijfer waar de kleine wijzer naar wijst. Bij halve uren en kwartieren bedekt hij om en om het cijfer van de grote wijzer (6, 3 of 9) en dat van de kleine wijzer. De wijzers liggen óver de vlek en blijven helemaal zichtbaar.
- **Wijzer onder een vlek:** de vlek bedekt alleen het puntje van één wijzer, om en om de kleine en de grote. Het midden en het begin van de wijzer blijven zichtbaar, en de cijfers liggen óver de vlek.
- **Grote vlek:** een brede vlek over het cijfer van de kleine wijzer en de twee cijfers ernaast. Het midden blijft vrij, en de wijzers blijven zichtbaar.
- Elke oefening heeft 15 nieuwe opgaven; de oude staan op concept. Oude opgaven tekent het scherm nog op de oude manier, voor het geval een kind er nog een in een half afgemaakte ronde heeft.
- Getest met Testkind: alle 8 oefeningen geopend, met de nieuwe oranje vlek. Daarnaast heb ik per oefening de eerste 3 opgaven naast elkaar getekend met dezelfde klokcomponent, om de plek te controleren. Bij de eerste versie was de vlek over een wijzer te groot en stak de grote vlek buiten de klok; beide zijn kleiner gemaakt.

Eén voorbeeld per oefening (de eerste gepubliceerde opgave):

| Oefening | Tijd | Wat de vlek bedekt |
|---|---|---|
| Hele uren: cijfers onder een vlek (met uitleg) | 06:00 | de 6 (kleine wijzer) |
| Hele uren: wijzer onder een vlek | 12:00 | het puntje van de kleine wijzer, bij de 12 |
| Halve uren: cijfers onder een vlek | 12:30 | de 6 (grote wijzer) |
| Halve uren: wijzer onder een vlek | 03:30 | het puntje van de kleine wijzer, tussen 3 en 4 |
| Kwart over en kwart voor: cijfers onder een vlek | 10:15 | de 3 (grote wijzer) |
| Kwart over en kwart voor: wijzer onder een vlek | 11:45 | het puntje van de kleine wijzer, vlak voor de 12 |
| Gemengd: cijfers onder een vlek | 04:00 | de 4 (kleine wijzer) |
| Gemengd: grote vlek | 03:45 | de 3, 4 en 5 (kleine wijzer bij de 4) |

## 14 — Taalcontrole Tijd

Alle vraagzinnen van de klokoefeningen en de kalender nagelopen: de zinnen in de code én de gepubliceerde opgaven. In de database zijn 139 opgaven aangepast, alleen de tekst. Antwoorden en voortgang zijn niet veranderd.

| Soort zin | Was | Wordt |
|---|---|---|
| Verleden tijd bij gisteren/geleden | Vandaag is het 11 april. Welke datum is het gisteren? | Vandaag is het 11 april. Welke datum **was** het gisteren? (ook eergisteren, een week geleden, 3 dagen geleden) |
| Dag voor of na een datum | Op welke dag valt 4 dagen na 10 maart? | Welke dag is het 4 dagen na 10 maart? |
| Hoeveelste dag | Maandag is de hoeveelste dag van de week? | De hoeveelste dag van de week is maandag? |
| Hoeveelste maand | Februari is de hoeveelste maand van het jaar? | De hoeveelste maand van het jaar is februari? |
| De zoveelste dag | De derde dag van de week is…? | Wat is de derde dag van de week? (net als bij de maanden) |
| Eén dag of maand verder | Welke dag komt 1 dag na maandag? | Welke dag komt na maandag? (net als "Welke maand komt na oktober?") |
| Meer dagen of maanden verder | Welke maand komt 2 maanden na april? | Welke maand is het 2 maanden na april? |
| Anderhalf uur | Zet de klok 1 en een half uur later. | Zet de klok anderhalf uur later. |
| Hoofdletter | de helft van 10 minuten = ▢ | De helft van 10 minuten = ▢ |
| Uitleg bij Dagdelen (wordt voorgelezen) | "16 uur valt dus in het juiste deel." / "Dus het is vier uur." | "Om 16:00 is het middag." |
| Uitleg bij Hele uren in de dag | "Dus het is zeven uur." | "Dus 19:00 is zeven uur 's avonds." |

- Niet veranderd, omdat het al klopte: "Op welke dag valt 9 mei?", de klokvragen ("Hoe laat is het?", "Het is half vier. Zet de klok 2 uur later."), de nachtjes-vragen en "Hoe lang geleden is dat?". "Je gaat om drie uur naar het zwembad. … Hoe lang duurde het?" is jouw eigen zin uit bestand 08; die heb ik laten staan.
- In CLAUDE.md staat nu: elke nieuwe vraagzin moet grammaticaal kloppen en natuurlijk klinken voor kinderen, en bij twijfel kies je de eenvoudigste zin.
- **Twee maanden:** bij "Over de maandgrens" staan de twee kalenders nu altijd naast elkaar, op een smal scherm kleiner, met de vier antwoordknoppen twee bij twee. Op een tablet en een laptop past alles op één scherm. Op een kleine telefoon (360 bij 740) moet je nog een klein stukje scrollen tot de knop Controleer, omdat de vraag daar over vier regels loopt.

## 15 — Markering op de kalender

1. Een gegeven datum ("vandaag", en bij de nachtjes ook de dag van het feest of de schoolreis) heeft geen lichtgeel vakje meer, maar een duidelijk oranje rondje om de datum. De datum blijft goed leesbaar.
2. Tikt het kind een datum aan, dan verschijnt een gevuld oranje rondje met witte cijfers. Tikken op een andere datum verplaatst het rondje. Het gevulde rondje is het donkerdere Thuisles-oranje (huisstijl-diep): daarop is witte tekst goed te lezen, net als op de knop Controleer.
- Dit geldt voor alle kalenders in de app; die komen alleen bij Tijd voor. Na het nakijken blijven goed (groen) en fout (roze) zoals ze waren.
- Getest met Testkind: bij "Zoek de datum" verscheen bij tikken op 13 mei het gevulde rondje, en dat verplaatste naar 10 mei. "Hoe lang nog?" toont 19 en 27 februari met een oranje rand, en "Over de maandgrens" op laptop- en tabletbreedte (768 px) 30 augustus met een oranje rand.

## 16 — Echt geld

- **Downloaden is gelukt.** De briefjes van €5, €10, €20, €50 en €100 komen uit het officiële zipbestand van de ECB-pagina "Images and reproduction rules": de huidige Europa-serie, voorkant, 72 dpi, met "SPECIMEN" erop. De munten (1, 2, 5, 10, 20 en 50 cent, €1 en €2) zijn de gemeenschappelijke zijde met de kaart van Europa, van de ECB-pagina over de munten. Geen nationale zijde.
- Alles staat in `public/geld/`, met `BRON.md` erbij: per afbeelding de herkomst en het oorspronkelijke bestand. De bestanden zijn niet bewerkt en niet vergroot; alleen de naam is veranderd.
- In alle Geld-oefeningen staan nu deze afbeeldingen in plaats van de tekeningen, op dezelfde plek in de oefening. Munten worden rond afgesneden, zodat het witte vlak om de foto niet als vierkant te zien is. Nooit op ware grootte: een briefje is op het scherm ongeveer 2 centimeter breed. Alleen de briefjes van €200 en €500 (komen in de oefeningen niet voor) zijn nog een tekening.
- De regel staat in WERKPLAN.md en in CLAUDE.md: "Geld: officiële afbeeldingen (ECB-specimen 72 dpi voor briefjes, gemeenschappelijke zijde voor munten), nooit nationale zijde, nooit ware grootte."
- Getest met Testkind: alle 57 Geld-oefeningen geopend. Ze laden allemaal, en de 34 met munten of briefjes tonen de nieuwe afbeeldingen (de andere 23 zijn tekst, zoals verhaaltjes en bonnetjes). Bij "Zelf precies betalen" het briefje van €5 neergelegd → goed.

## 17 — Verhaaltjessommen

- **Gebouwd:** een nieuw domein "Verhaaltjessommen" voor groep 4, met 7 onderwerpen in de gevraagde volgorde en 130 oefeningen: 3 × 30 met de kopjes Tot en met 20, 50 en 100, en 4 × 10 zonder kopjes. Elke oefening heeft precies 15 vaste, gepubliceerde verhaaltjes en "vragen per oefensessie" 15; samen 1950 verhaaltjes. Titels, situaties en bolletjes staan in WERKPLAN.md. Aan de domeinen Tafels en Delen is niets veranderd.
- **Hoe de verhaaltjes ontstaan:** uit zinsjablonen die ik met de hand heb geschreven, met per situatie een grens die logisch is (een klas heeft hooguit 32 kinderen, een eierdoos 4, 6 of 10 eieren, een ketting minstens 5 kralen) en altijd minstens 2 van iets. Zo kloppen enkelvoud, meervoud en werkwoord altijd. Elk verhaaltje wordt automatisch nagekeken: elke zin hoogstens 12 woorden en met een hoofdletter, de vraag als laatste zin met Hoeveel, Hoe of Op welke, het antwoord binnen het kopje en nooit negatief, vier verschillende knoppen. Daarna heb ik alle soorten zinnen zelf nagelezen.
- **Tweede controle:** bij het achter elkaar nalezen heb ik nog **155 verhaaltjes verbeterd**, in 11 soorten verbeteringen:
  - "Hoeveel snoepjes heeft Jesse samen?" werd "… in totaal?" (samen bij één persoon);
  - een zonnebloem groeit hooguit 15 cm per week (was tot 59);
  - een kind leest hooguit 30 bladzijden per dag;
  - een fiets van 9 euro werd een bal (bij kleine bedragen een bal en een knuffel);
  - een kaars brandt hooguit 10 cm per avond;
  - "Ze verdeelt ze eerlijk" werd "Ze verdeelt de koekjes/stickers eerlijk";
  - "samen" stond twee keer in één verhaaltje;
  - een ketting heeft minstens 5 kralen;
  - een klas heeft minstens 10 stoelen;
  - een puzzel heeft minstens 12 stukjes;
  - een boekenkast van een groep heeft minstens 5 boeken.

  Voor de oefeningen waar dat al in de database stond, zijn nieuwe opgaven gemaakt; de oude staan op concept.
- **Antwoorden:** bij kiezen vier knoppen met de eenheid erbij, van klein naar groot. Ze bevatten het goede antwoord, een getal uit het verhaal, 1 ernaast, boven de 20 ook 10 ernaast, en waar plek is de verkeerde bewerking. Bij typen een gewoon cijferveld met de eenheid erachter. Bij een fout getypt antwoord dat de verkeerde som is ("erbij in plaats van eraf"), krijgt het kind uitleg daarover.
- **Webadressen en SEO:** elke oefening heeft een eigen adres in gewone woorden en een eigen SEO-titel en -omschrijving. Het domein en de onderwerpen hebben een titel die per groepspagina het goede groepnummer invult. Er zijn geen nieuwe dubbele titels, en alle openbare pagina's staan in de sitemap; de oefenpagina's achter de inlog niet. Daarvoor zijn twee kleine uitbreidingen gemaakt: een eigen webadres per leerdoel (een nieuwe kolom, leeg = zoals altijd uit de titel), en `{groep}` in een eigen SEO-tekst, waar dan het nummer van de groep komt.
- **Getest met Testkind:** in alle 7 onderwerpen twee oefeningen geopend, met het goede verhaal en de goede knoppen of het invoerveld. "Erbij krijgen (kiezen)" heb ik goed beantwoord en "Verschil (typen)" fout (31 in plaats van 19): fout gerekend, met het goede antwoord en de uitleg erbij.

Drie voorbeelden van SEO-titel en omschrijving:

| Pagina | Titel | Omschrijving |
|---|---|---|
| /groep-4/verhaaltjessommen | Verhaaltjessommen en redactiesommen – groep 4 \| Thuisles | Oefen redactiesommen (verhaaltjessommen) voor groep 4: optellen, aftrekken, tafels en delen in korte verhaaltjes. Direct nakijken. |
| /groep-4/verhaaltjessommen/optellen-tot-en-met-20-erbij-krijgen-kiezen | Verhaaltjessommen optellen tot en met 20: erbij krijgen (kiezen) – groep 4 \| Thuisles | Oefen redactiesommen (verhaaltjessommen) optellen tot en met 20 voor groep 4: erbij krijgen, kiezen uit vier antwoorden. Korte verhaaltjes, direct nakijken. |
| /groep-4/verhaaltjessommen/tafels-en-delen-keer-of-delen-typen | Verhaaltjessommen tafels en delen met de tafels van 1 tot en met 10: keer of delen (typen) – groep 4 \| Thuisles | Oefen redactiesommen (verhaaltjessommen) tafels en delen met de tafels van 1 tot en met 10 voor groep 4: keer of delen, zelf het antwoord typen. Korte verhaaltjes, direct nakijken. |

Vijf voorbeeldverhaaltjes per onderwerp, met het goede antwoord (uit de gepubliceerde opgaven):

**Optellen**

- Lina heeft 10 punten bij een spelletje. In de laatste ronde krijgt Lina er 3 bij. Hoeveel punten heeft Lina nu? → **13 punten**
- In de schaal liggen 5 appels en 4 peren. Hoeveel stuks fruit liggen er in de schaal? → **9 stuks fruit**
- Elif bouwt een toren van 14 centimeter. Daarna maakt Elif hem 9 centimeter hoger. Hoe hoog is de toren nu? → **23 centimeter**
- Lina, Fatima en Kofi plukken appels. Lina plukt er 9, Fatima 3 en Kofi 9. Hoeveel appels plukken ze samen? → **21 appels**
- Bij de supermarkt staan 87 rode auto's. Er staan ook 9 blauwe en 2 witte auto's. Hoeveel auto's staan er bij de supermarkt? → **98 auto's**

**Aftrekken**

- In de koektrommel zitten 5 koekjes. De kinderen eten er 3 op. Hoeveel koekjes zitten er nog in de trommel? → **2 koekjes**
- Sem springt 13 keer touw. Thijs springt 4 keer touw. Hoeveel keer springt Sem meer dan Thijs? → **9 keer**
- Een touw is 44 meter lang. Thijs knipt er 35 meter af. Hoe lang is het touw nu? → **9 meter**
- Sem heeft 38 euro. Sem koopt een spel van 29 euro. Daarna koopt Sem een boek van 6 euro. Hoeveel euro heeft Sem nog? → **3 euro**
- Een touw is 98 meter lang. Julia knipt er 40 meter af. Hoe lang is het touw nu? → **58 meter**

**Optellen en aftrekken**

- In de schoolbus zitten 19 kinderen. Bij de halte stappen er 17 uit. Hoeveel kinderen zitten er nu in de bus? → **2 kinderen**
- Aya wil een spel van 14 euro kopen. Aya heeft 8 euro. Hoeveel euro heeft Aya nog nodig? → **6 euro**
- Omar heeft 32 euro. Omar betaalt 7 euro voor een boek. Daarna krijgt Omar 6 euro van opa. Hoeveel euro heeft Omar nu? → **31 euro**
- Een rij blokjes is 42 centimeter lang. Kofi legt er 7 centimeter bij. Hoe lang is de rij nu? → **49 centimeter**
- Amira heeft 76 knikkers. Bij een spelletje wint Amira er 12. Hoeveel knikkers heeft Amira nu? → **88 knikkers**

**Tafels**

- In een zakje zitten 5 snoepjes. Mehmet heeft 4 zakjes. Hoeveel snoepjes heeft Mehmet in totaal? → **20 snoepjes**
- Nina oefent elke dag 5 minuten op de piano. Hoeveel minuten oefent Nina in 8 dagen? → **40 minuten**
- In een bakje liggen 5 kleurpotloden. Op de tafel staan 9 bakjes. Hoeveel kleurpotloden zijn dat samen? → **45 kleurpotloden**
- In de klas staan 5 rijen tafels. In elke rij staan 4 tafels. Hoeveel tafels staan er in de klas? → **20 tafels**
- Een ijsje kost 2 euro. Milan koopt 8 ijsjes. Hoeveel euro moet Milan betalen? → **16 euro**

**Delen**

- De juf heeft 32 stickers. Ze verdeelt de stickers eerlijk over 8 kinderen. Hoeveel stickers krijgt elk kind? → **4 stickers**
- Samen krijgen 6 kinderen 36 euro. Ze verdelen het geld eerlijk. Hoeveel euro krijgt elk kind? → **6 euro**
- Sem heeft 6 snoepjes. Sem verdeelt ze eerlijk over 3 kinderen. Hoeveel snoepjes krijgt elk kind? → **2 snoepjes**
- Noor heeft 40 kralen. Noor maakt kettingen van 5 kralen. Hoeveel kettingen maakt Noor? → **8 kettingen**
- Er doen 14 kinderen mee met voetbal. In elk team zitten 7 kinderen. Hoeveel teams zijn er? → **2 teams**

**Tafels en delen**

- In de klas staan 9 rijen tafels. In elke rij staan 3 tafels. Hoeveel tafels staan er in de klas? → **27 tafels**
- Mama bakt 10 koekjes. Ze verdeelt de koekjes eerlijk over 2 bordjes. Hoeveel koekjes liggen er op elk bordje? → **5 koekjes**
- Milan verdeelt snoepjes over 4 kinderen. Elk kind krijgt 10 snoepjes. Hoeveel snoepjes verdeelt Milan? → **40 snoepjes**
- In de gymzaal zijn 16 kinderen. De juf maakt groepjes van 8. Hoeveel groepjes zijn er? → **2 groepjes**
- Een kaartje voor de film kost 7 euro. Sanne koopt 4 kaartjes. Hoeveel euro betaalt Sanne? → **28 euro**

**Alles door elkaar**

- Thijs bouwt een toren van 14 centimeter. Daarna maakt Thijs hem 26 centimeter hoger. Hoe hoog is de toren nu? → **40 centimeter**
- Daan en Aya hebben samen 16 knikkers. Ze verdelen de knikkers eerlijk. Hoeveel knikkers krijgt elk kind? → **8 knikkers**
- In de schoolbus zitten 4 kinderen. Bij de halte stappen er 26 in. Hoeveel kinderen zitten er nu in de bus? → **30 kinderen**
- Thijs heeft 30 knikkers. In de winkel koopt Thijs er nog 11. Hoeveel knikkers heeft Thijs nu? → **41 knikkers**
- Op maandag leest Sem 18 bladzijden. Op dinsdag leest Sem er 5. Op woensdag leest Sem er 7. Hoeveel bladzijden leest Sem in drie dagen? → **30 bladzijden**

## Samenvatting per bestand

- **00 Losse verbeteringen** — gedaan (Testkind, kopje Klokken koppelen, dagdeelgrenzen, luidspreker, omschrijving Geld, volgorde uit de database). Zelf testen: een paar rondes van dezelfde oefening achter elkaar, en kijken of de volgorde in beheer en bij het kind gelijk is.
- **01 Geld wisselen en Geldnotatie** — gedaan (10 nieuwe oefeningen). Zelf testen: op een iPad of de komma op het toetsenbord verschijnt bij "Bedrag opschrijven tot 10 euro".
- **02 SEO controleren** — gedaan, 0 pagina's aangevuld. Zelf beslissen: de dubbele titels in de oudere domeinen en de domeinnaam voor de sitemap (zie Vragen voor Sara).
- **03 Oefeningen verbergen** — gedaan (vinkje in beheer, twee klokoefeningen verborgen). Zelf testen: het vinkje aan- en uitzetten bij een leerdoel en kijken of het bij het kind verdwijnt en terugkomt.
- **04 Klokken koppelen en vraagteksten** — gedaan. Zelf testen: Klokken koppelen op een tablet (grootte van de klokken, de 12 goed leesbaar).
- **05 Dagdelen** — gedaan (nieuwe vraag, vaste knopvolgorde). Zelf testen: een ronde Dagdelen op een telefoon.
- **06 Tijd in de dag in stapjes** — gedaan (drie kopjes met elk drie stapjes, 6 nieuwe oefeningen). Zelf beslissen: of 12:30 bij "halve uren tot 12:00" hoort.
- **07 Klokken op volgorde** — gedaan (alleen ochtend, vakjes op een rij). Zelf testen: slepen op een tablet.
- **08 Hoe lang duurt het?** — gedaan (klok toont nu, kiezen in schooltaal). Zelf testen: een paar opgaven per niveau.
- **09 Digitale uitleg verbergen** — gedaan.
- **10 Logische situaties dagdelen** — gedaan. Zelf controleren: de tien voorbeeldvragen in dit rapport.
- **11 Tijd vooruit en terug** — gedaan. Zelf beslissen: of het woord VOORUIT terug moet bij Later.
- **12 Lege vakjes niet als 0** — gedaan.
- **13 Vlekken repareren** — gedaan (oranje inktvlek op de goede plek). Zelf controleren: de acht voorbeelden in dit rapport, en de grote vlek op een tablet.
- **14 Taalcontrole Tijd** — gedaan (139 opgaven aangepast, twee kalenders naast elkaar). Zelf controleren: de tabel "was → wordt".
- **15 Markering kalender** — gedaan. Zelf testen: tikken op een datum op een tablet.
- **16 Echt geld** — gedaan, downloaden gelukt. Zelf controleren: of de munten op deze maat goed leesbaar zijn (ze zijn een kwart groter dan de tekeningen).
- **17 Verhaaltjessommen** — gedaan (130 oefeningen, 1950 verhaaltjes). Zelf controleren: de voorbeeldverhaaltjes hierboven, en een paar oefeningen per onderwerp doorspelen.

---

# Wachtrij — 3 oktober 2026, middag

Vooraf `npm run backup` en een kopie in `backups/`. Er is niets uit de database verwijderd en aan antwoorden of voortgang van kinderen is niets veranderd. Getest is alleen met Testkind. Waar opgaven zijn vervangen, staan de oude op concept.

## Vragen voor Sara

(Bij twijfel heb ik steeds de veiligste keuze gemaakt; hier staat wat je nog kunt beslissen.)

- **01 — webadres met vier delen.** Je gaf als voorbeeld `/groep-4/aftrekken/aftrekken-tot-en-met-30/sommen-met-dezelfde-uitkomst`. De openbare pagina's hebben maar drie delen (groep, domein, oefening), dus het is `/groep-4/aftrekken/aftrekken-tot-en-met-30-sommen-met-dezelfde-uitkomst` geworden: ook gewone woorden en uniek. Wil je echt een extra laag met het onderwerp, dan moet de opbouw van alle openbare pagina's veranderen.
- **01 — "geen plaatjes" bij Optellen tot en met 30 en 40.** Er moesten precies dezelfde oefeningen in als bij Optellen tot en met 50, en daar hoort "Som bij de plaatjes" (stippen) bij. Ik heb die oefening met de simpele stippen laten staan. Moet hij er bij 30 en 40 uit?
- **01 — overlap bij Optellen tot en met 50.** Die oefeningen gaan over uitkomsten van 21 tot en met 50 (zoals bestand 00 vroeg), en tot en met 30 en 40 over 21–30 en 31–40. Zo overlapt "tot en met 50" een beetje met de twee nieuwe. Wil je dat "tot en met 50" alleen nog 41–50 doet? Dan maak ik daar nieuwe opgaven voor.
- **01 — bolletjes bij "De erafsom bij het plaatje".** Het bestaande type rekent hier zelf 1 bolletje uit. Ik heb de gevraagde 3 met de hand op het leerdoel gezet (in beheer: Moeilijkheid).

## 00 — Optellen uitbreiden

- **Gebouwd:** 4 nieuwe onderwerpen met samen 28 oefeningen (Optellen tot en met 50: 8, Rekenen met tientallen: 7, Optellen tot en met 100: 8, Wat zit er onder de vlek?: 5), elk met 15 vaste opgaven van makkelijk naar moeilijk en "vragen per oefensessie" 15. Optellen tot en met 20 is niet aangepast. Volgorde, kopjes, titels en bolletjes zoals gevraagd; zie WERKPLAN.md.
- **Hoe:** één nieuw type, `rekensom`. De bestaande types zijn intern begrensd op 20 en zijn met opzet niet aangepast; zo blijft Optellen tot en met 20 precies zoals het was. Bij "Aanvullen" en "Sommen en uitkomsten koppelen" krijgt het kind dezelfde schermen als tot en met 20.
- **Na een fout antwoord** staat het goede antwoord er in gewone taal: in het groene vak "15 + 10 = 25" of "28 + 23", en in de zin "Het goede antwoord is …, want …". Nooit een knopnummer. Daarvoor kan een figuur nu zelf zeggen hoe zijn goede antwoord heet; bij de bestaande oefeningen verandert er niets.
- **Van makkelijk naar moeilijk:** de vaste opgaven komen bij deze oefeningen in vaste volgorde, niet door elkaar. Bij alle andere oefeningen verandert er niets.
- Bij het nalezen verbeterd: een fout kaartje met een uitkomst boven de 100, sommen die over twee regels braken ("17 + / 34?"), en verwisselde sommen ("15 + 51" en "51 + 15") die allebei een keuze waren.
- **Getest met Testkind:** per onderwerp twee oefeningen geopend. "Som bij de plaatjes" fout beantwoord (24 in plaats van 25): fout gerekend, met "15 + 10 = 25" erbij. Bij "De vlek kan overal zitten" op de vlek getikt en 4 getypt. Bij "Zelfde uitkomst" een fout kaartje gekozen: het goede kaartje "28 + 23" stond groen.

Drie voorbeeldopgaven per onderwerp:

| Onderwerp | Opgave | Goed antwoord |
|---|---|---|
| Optellen tot en met 50 | Stippen: 11 en 26 | 11 + 26 = 37 |
| Optellen tot en met 50 | Welke som klopt? 18 + 23 = 40 / 28 + 10 = 38 / 12 + 18 = 20 / 17 + 25 = 32 | 28 + 10 = 38 |
| Optellen tot en met 50 | Maak beide kanten gelijk: 19 + ☐ = 25 + 8 | 14 |
| Rekenen met tientallen | 50 + 9 | 59 |
| Rekenen met tientallen | 49 + 3 | 52 |
| Rekenen met tientallen | 34 + 46 | 80 |
| Optellen tot en met 100 | 18 + 48 | 66 |
| Optellen tot en met 100 | Handig optellen: 19, 9, 1, 14, 11, 6 | 60 |
| Optellen tot en met 100 | 27 + ☐ = 100 | 73 |
| Wat zit er onder de vlek? | 6 + vlek = 9 | 3 |
| Wat zit er onder de vlek? | 41 + vlek = 77 | 36 |
| Wat zit er onder de vlek? | 12 + 48 = vlek | 60 |

Twee voorbeelden van SEO-titel en omschrijving:

| Pagina | Titel | Omschrijving |
|---|---|---|
| /groep-4/optellen/optellen-tot-en-met-50 | Optellen tot en met 50 oefenen – groep 4 \| Thuisles | Oefen erbijsommen tot en met 50 voor groep 4: uitrekenen, kiezen en puzzelen. Direct nakijken. |
| /groep-4/optellen/rekenen-met-tientallen-tiental-plus-eenheden | Tiental plus eenheden – rekenen met tientallen (optellen) – groep 4 \| Thuisles | Oefen erbijsommen bij rekenen met tientallen (optellen): tiental plus eenheden. Voor groep 4, direct nakijken. |

## 01 — Aftrekken uitbreiden en Optellen tot en met 30 en 40

Uitgevoerd na bestand 00, zoals gevraagd. "Aftrekken tot en met 15" en "Aftrekken met het rekenrek" zijn niet aangepast. Alles bij groep 4, met 15 vaste opgaven per oefening van makkelijk naar moeilijk, "vragen per oefensessie" 15, en de kopjes zichtbaar op het kinderscherm.

| Onderwerp | Oefeningen gemaakt | Getest met Testkind |
|---|---|---|
| Aftrekken tot en met 20 | 10 | "Aftrekken met plaatjes" (vraag "Hoeveel sterren houd je over?") en "Erafsommen tot en met 20" geopend |
| Aftrekken tot en met 30 | 6 | "Aftrekken met tientaloverschrijding tot 30" en "Sommen en uitkomsten koppelen" geopend |
| Aftrekken tot en met 40 | 6 | idem, tot 40 |
| Aftrekken tot en met 50 | 6 | idem, tot 50 |
| Aftrekken met tientallen | 7 | "Eenheden aftrekken binnen het tiental" en "Aftrekken met gelijke eenheden" geopend |
| Aftrekken tot en met 100 | 6 | "Aftrekken met tientaloverschrijding tot 100" en "Sommen en uitkomsten koppelen" geopend |
| Wat zit er onder de vlek? (Aftrekken) | 7 | "Vleksommen tot en met 30" geopend; "Vleksommen met de vlek vooraan" fout beantwoord (2 in plaats van 22): fout gerekend, met "22" groen en "22 − 12" erbij |
| Optellen tot en met 30 | 8 | "Optellen tot en met 30" en "Welke som past er niet bij?" geopend |
| Optellen tot en met 40 | 8 | "Optellen tot en met 40" en "Welke som past er niet bij?" geopend |
| Wat zit er onder de vlek? (Optellen) | 2 erbij (nu 7) | "Vleksommen tot en met 30" geopend; staat tussen "tot en met 20" en "tot en met 50" |

Samen 66 nieuwe oefeningen en 990 opgaven. "Geopend" betekent: de pagina laadde als Testkind, met de goede vraag en de goede vakjes of knoppen.

- De volgorde van de onderwerpen bij Aftrekken en Optellen is zoals gevraagd. Bij de plaatjes-oefeningen zegt de vraag "Hoeveel … houd je over?".
- Bij het nalezen verbeterd: bij "Sommen met dezelfde uitkomst" kwamen foute kaartjes met uitkomst 0 voor ("20 − 20"); foute keuzes zijn nu minstens 1.
- SEO: elke nieuwe pagina heeft een eigen titel en omschrijving met het onderwerp, "erafsommen" of "erbijsommen" en "groep 4". Een voorbeeld: "Sommen met dezelfde uitkomst – aftrekken tot en met 30 – groep 4 | Thuisles". Er zijn geen nieuwe dubbele titels, en de openbare pagina's staan in de sitemap.

## Samenvatting per bestand

- **00 — Optellen uitbreiden:** klaar; 28 nieuwe oefeningen (Optellen tot en met 50, Rekenen met tientallen, Optellen tot en met 100 en meer vleksommen). Test zelf: open als kind een paar oefeningen bij Optellen tot en met 100 en geef één keer bewust een fout antwoord.
- **01 — Aftrekken uitbreiden en Optellen tot en met 30 en 40:** klaar; 66 nieuwe oefeningen in 9 onderwerpen (zie de tabel hierboven). Test zelf: "Aftrekken met plaatjes" bij Aftrekken tot en met 20 op een tablet, en een vlekoefening waarbij het toetsenbord opengaat.
