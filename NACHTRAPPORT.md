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
