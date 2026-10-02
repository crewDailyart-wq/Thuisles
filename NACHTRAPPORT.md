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
