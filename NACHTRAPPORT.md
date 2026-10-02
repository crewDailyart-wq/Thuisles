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
