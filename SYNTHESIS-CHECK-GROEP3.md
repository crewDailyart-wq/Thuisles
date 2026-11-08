# Synthesis-check groep 3 (8 november 2026)

Alleen voor eigen gebruik. Alleen groep 3. Niets gebouwd of aangepast; alleen gelezen
(INSPIRATIE.md, LESSENPLAN.md, de code in `src/components/les/lessen/`, `src/lib/lessen/catalogus.ts`,
de database alleen-lezen, vragen-voor-later/lessen-groep-3/, SQULA-VOORTGANG.md, het geheugen).
De lessen zelf zijn niet afgespeeld; dit is een controle op papier, in de code en in de database.

## Aantallen

- Synthesis-lessen met label groep 3 (ook "groep 3 en 4", "groep 3/4", "groep 3 (eind) en 4"): **59**
  (INSPIRATIE.md, tabel in "Ronde 2 · labeloverzicht", regels 37 t/m 198). Nagetelt: 38 "groep 3", 16 "groep 3 en 4", 4 "groep 3/4", 1 "groep 3 (eind) en 4".
- Daarnaast 1 les uit ronde 3: **Writing Numbers to 20** (staat niet in de tabel, wel in het lessenplan als G4b). Samen 60, net als LESSENPLAN.md.
- **GEBOUWD: 58** (met les-id in de code).
- **DEELS: 1** (Customizing the Tutor: stemkeuze, tempo en OpenDyslexic zijn bewust weggelaten).
- **ONTBREEKT: 0.** Elke groep 3-les heeft een draaiboek in de code. Ook alle 5 lessen van Compare the Pair (vergelijken) staan er.
- Writing Numbers to 20: gebouwd in de code, maar **niet in de database** (geen leerdoel, geen vragen). Een kind ziet hem dus nog niet.

## Let op: gebouwd is niet hetzelfde als zichtbaar voor groep 3

Van de 60 staan er in de database:
- **13 op groep 4** (verhuisd op 11 oktober 2026, omdat groep 3 tot 20 rekent; zie vragen-voor-later/lessen-groep-3/naar-groep-4.md). Het groep 3-deel van deze Synthesis-lessen zit er wel in, maar een kind van groep 3 krijgt ze niet.
- **2 op concept** (Zo werkt het, Jouw instellingen).
- **1 helemaal niet** (Writing Numbers to 20).
- De andere 44 staan op groep 3 (of groep 3-4) en zijn gepubliceerd op de laptop.
- Het besluit van 8 november ("grens 20 vervalt, getallen volgen Squla") maakt het mogelijk dat sommige van die 13 weer terug naar groep 3 moeten. Dat is aan Sara.

## Over de lessen van Compare the Pair (vergelijken)

Deze 5 lessen zijn **wel gebouwd**: `vergelijken-instaptoets`, `vergelijken-meer-of-minder`, `vergelijken-tekens`,
`vergelijken-getallen`, `vergelijken-eindtoets` (bestand `vergelijken.tsx`, 1498 regels; leerdoelen REK-GET-VER-01 t/m 05,
groep 3, gepubliceerd; plan G7 t/m G11). Ze hebben dezelfde onderdelen als Synthesis: grootste groep, hoeveel meer,
gelijk maken, de tekens =, < en >, getal rollen, teken kiezen, 8 < ? en ? > 8. Als Sara de les niet vond, ligt dat niet aan
"niet gebouwd". Mogelijke redenen: ze zoekt een andere naam (bij ons heten ze "Meer of minder" en "De tekens =, < en >"),
of ze keek bij Squla-lessen (daar heet het "Meer, minder, evenveel"). Dat heb ik niet kunnen nagaan.

Over "11 die niet op naam in LESSENPLAN.md staan": dat kon ik niet herhalen. Met de volledige naam ("Unit · Les") ontbreken er maar 2 in het plan:
Customizing the Tutor (staat als "Jouw instellingen", § 2.10) en Count the Jumps (staat als "Difference Dash: Count the Jumps", A8).
Alle andere 57 staan met hun volledige naam bij "Inspiratie". Compare the Pair en de toetsen staan er dus wel op naam.

## De tabel

Kolommen: nr, Synthesis-les, label, les-id in de code, oordeel, leerdoel in de database (groep, status), opmerking.

| nr | Synthesis-les | Label | Les-id | Oordeel | Database | Opmerking |
|---|---|---|---|---|---|---|
| 1 | Flashcards 2 · 10 More, 10 Less | groep 3/4 | `flitsen-tien-erbij-eraf` | GEBOUWD | REK-OPT-REK-10, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 2 | Flashcards 2 · Subtract to 20 | groep 3/4 | `flitsen-min-tot-20` | GEBOUWD | REK-AFT-AFT-57, groep 3-4, gepubliceerd |  |
| 3 | Flashcards 2 · Add to 20 | groep 3/4 | `flitsen-plus-tot-20` | GEBOUWD | REK-OPT-OPT-87, groep 3-4, gepubliceerd |  |
| 4 | Flashcards 2 · Doubles | groep 3/4 | `flitsen-dubbelen` | GEBOUWD | REK-SPL-VER-02, groep 3-4, gepubliceerd |  |
| 5 | Flashcards 1 · Mastery Check | groep 3 | `flitsen-eindtoets` | GEBOUWD | REK-OPT-OPT-85, groep 3, gepubliceerd |  |
| 6 | Flashcards 1 · Make 10 | groep 3 | `flitsen-maak-10` | GEBOUWD | REK-SPL-SPL-45, groep 3, gepubliceerd |  |
| 7 | Flashcards 1 · Subtract to 10 | groep 3 | `flitsen-min-tot-10` | GEBOUWD | REK-AFT-AFT-56, groep 3, gepubliceerd |  |
| 8 | Flashcards 1 · Add to 10 | groep 3 | `flitsen-plus-tot-10` | GEBOUWD | REK-OPT-OPT-84, groep 3, gepubliceerd |  |
| 9 | Flashcards 1 · Subtract to 5 | groep 3 | `flitsen-min-tot-5` | GEBOUWD | REK-AFT-AFT-55, groep 3, gepubliceerd |  |
| 10 | Flashcards 1 · Add to 5 | groep 3 | `flitsen-plus-tot-5` | GEBOUWD | REK-OPT-OPT-83, groep 3, gepubliceerd |  |
| 11 | Flashcards 1 · Count to 10 | groep 3 | `flitsen-tellen-tot-10` | GEBOUWD | REK-GET-TEL-58, groep 3, gepubliceerd |  |
| 12 | Flashcards 1 · Assessment | groep 3 | `flitsen-instaptoets` | GEBOUWD | REK-OPT-OPT-71, groep 3, gepubliceerd |  |
| 13 | Getting Started · Inputs | groep 3 en 4 | `intro-zo-werkt-het` | GEBOUWD | REK-GET-TEL-49, groep 3-4, concept | Microfoonvraag bewust weggelaten.; status concept |
| 14 | Getting Started · Customizing the Tutor | groep 3 en 4 | `intro-instellingen` | DEELS | REK-GET-TEL-50, groep 3-4, concept | Wel: woorden oplichten, naam, grote letters, gevoelsvraag. Niet: stemkeuze, tempo, OpenDyslexic (bewust, 10 okt).; status concept |
| 15 | Add up to 100 · Mastery Check | groep 3 en 4 | `optellen-100-eindtoets` | GEBOUWD | REK-OPT-OPT-70, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 16 | Add up to 100 · 10s Plus Ones | groep 3 | `optellen-100-tiental-plus-eenheden` | GEBOUWD | REK-OPT-OPT-68, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 17 | Add up to 100 · Bridging to 10s | groep 3 (eind) en 4 | `optellen-100-aanvullen-tot-tiental` | GEBOUWD | REK-OPT-OPT-67, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 18 | Add up to 100 · Part Part Whole | groep 3 | `optellen-100-splitsen` | GEBOUWD | REK-SPL-SPL-44, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 19 | Add up to 100 · Add 10s | groep 3 en 4 | `optellen-100-tientallen-erbij` | GEBOUWD | REK-OPT-REK-08, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 20 | Add up to 100 · Assessment | groep 3 en 4 | `optellen-100-instaptoets` | GEBOUWD | REK-OPT-OPT-66, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 21 | Power of Place · The Power of Place | groep 3 en 4 | `tientallen-plek-van-de-tientallen` | GEBOUWD | REK-GET-TIE-07, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 22 | Grouping 10s · 10s All the Way Up | groep 3 en 4 | `tientallen-groepjes-van-tien` | GEBOUWD | REK-GET-TIE-02, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 23 | Word Problems · Mastery Check | groep 3 en 4 | `verhaal-eindtoets` | GEBOUWD | REK-VER-OPT-65, groep 3-4, gepubliceerd |  |
| 24 | Word Problems · Mixed Problems | groep 3 en 4 | `verhaal-verstopte-getallen` | GEBOUWD | REK-VER-OPT-64, groep 3-4, gepubliceerd |  |
| 25 | Word Problems · Bigger Problems | groep 3 en 4 | `verhaal-grote-verhalen` | GEBOUWD | REK-VER-OPT-63, groep 3-4, gepubliceerd |  |
| 26 | Word Problems · Small Problems | groep 3 | `verhaal-kleine-verhalen` | GEBOUWD | REK-VER-OPT-62, groep 3, gepubliceerd |  |
| 27 | Word Problems · Assessment | groep 3 en 4 | `verhaal-instaptoets` | GEBOUWD | REK-VER-OPT-61, groep 3-4, gepubliceerd |  |
| 28 | Subtract on the Number Line · Count the Jumps | groep 3 en 4 | `getallenlijn-sprongen-tellen` | GEBOUWD | REK-AFT-AFT-49, groep 3, gepubliceerd |  |
| 29 | Telling Time · Quarter Past | groep 3 en 4 | `klok-kwart-over` | GEBOUWD | REK-TIJ-DEW-30, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 30 | Telling Time · Halfway Around | groep 3 | `klok-halve-uren` | GEBOUWD | REK-TIJ-DEW-29, groep 3, gepubliceerd |  |
| 31 | Telling Time · Set the Hour | groep 3 | `klok-hele-uren-zetten` | GEBOUWD | REK-TIJ-DEW-28, groep 3, gepubliceerd |  |
| 32 | Telling Time · Hour Hand Hunt | groep 3 | `klok-urenwijzer` | GEBOUWD | REK-TIJ-DEW-27, groep 3, gepubliceerd |  |
| 33 | Compare the Pair · Mastery Check | groep 3 | `vergelijken-eindtoets` | GEBOUWD | REK-GET-VER-05, groep 3, gepubliceerd |  |
| 34 | Compare the Pair · Comparing Numbers | groep 3 | `vergelijken-getallen` | GEBOUWD | REK-GET-VER-04, groep 3, gepubliceerd |  |
| 35 | Compare the Pair · Comparison Symbols | groep 3 | `vergelijken-tekens` | GEBOUWD | REK-GET-VER-03, groep 3, gepubliceerd |  |
| 36 | Compare the Pair · More or Less | groep 3 | `vergelijken-meer-of-minder` | GEBOUWD | REK-GET-VER-02, groep 3, gepubliceerd |  |
| 37 | Compare the Pair · Assessment | groep 3 | `vergelijken-instaptoets` | GEBOUWD | REK-GET-VER-01, groep 3, gepubliceerd |  |
| 38 | Count to 120 · Mastery Check | groep 3 en 4 | `tellen-120-eindtoets` | GEBOUWD | REK-GET-TEL-57, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 39 | Count to 120 · Counting On | groep 3 en 4 | `tellen-120-doortellen` | GEBOUWD | REK-GET-TEL-54, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 40 | Count to 120 · The Next 10 | groep 3 | `tellen-120-na-tien` | GEBOUWD | REK-GET-TEL-53, groep 3, gepubliceerd |  |
| 41 | Count to 120 · Color Count | groep 3 | `tellen-120-kleuren-tellen` | GEBOUWD | REK-GET-TEL-52, groep 3, gepubliceerd |  |
| 42 | Count to 120 · Assessment | groep 3 en 4 | `tellen-120-instaptoets` | GEBOUWD | REK-GET-TEL-51, groep 4, gepubliceerd | staat in de database op groep 4 (verhuisd 11 okt) |
| 43 | Add up to 20 · Mastery Check | groep 3 | `optellen-20-eindtoets` | GEBOUWD | REK-OPT-OPT-65, groep 3, gepubliceerd |  |
| 44 | Add up to 20 · Close To Doubles | groep 3 | `optellen-20-bijna-dubbel` | GEBOUWD | REK-OPT-OPT-64, groep 3, gepubliceerd |  |
| 45 | Add up to 20 · Add Across 10 | groep 3 | `optellen-20-over-de-10` | GEBOUWD | REK-OPT-OPT-63, groep 3, gepubliceerd |  |
| 46 | Add up to 20 · Adding onto 10 | groep 3 | `optellen-20-bij-10` | GEBOUWD | REK-OPT-OPT-62, groep 3, gepubliceerd |  |
| 47 | Add up to 20 · Assessment | groep 3 | `optellen-20-instaptoets` | GEBOUWD | REK-OPT-OPT-61, groep 3, gepubliceerd |  |
| 48 | Subtract Within 10 · Mastery Check | groep 3 | `aftrekken-10-eindtoets` | GEBOUWD | REK-AFT-AFT-46, groep 3, gepubliceerd |  |
| 49 | Subtract Within 10 · Difference Dimension | groep 3 | `aftrekken-10-verschil` | GEBOUWD | REK-AFT-AFT-45, groep 3, gepubliceerd |  |
| 50 | Subtract Within 10 · Dot Destruction | groep 3 | `aftrekken-10-stippen-weghalen` | GEBOUWD | REK-AFT-AFT-44, groep 3, gepubliceerd |  |
| 51 | Subtract Within 10 · Assessment | groep 3 | `aftrekken-10-instaptoets` | GEBOUWD | REK-AFT-AFT-43, groep 3, gepubliceerd |  |
| 52 | Add within 10 · Mastery Check | groep 3 | `optellen-tot-10-eindtoets` | GEBOUWD | REK-OPT-OPT-60, groep 3, gepubliceerd |  |
| 53 | Add within 10 · Splitting Sums | groep 3 | `optellen-tot-10-splitsen` | GEBOUWD | REK-SPL-SPL-43, groep 3, gepubliceerd |  |
| 54 | Add within 10 · Add Three Numbers | groep 3 | `optellen-tot-10-drie-getallen` | GEBOUWD | REK-OPT-OPT-59, groep 3, gepubliceerd |  |
| 55 | Add within 10 · Missing Numbers | groep 3 | `optellen-tot-10-ontbrekend-getal` | GEBOUWD | REK-OPT-OPT-58, groep 3, gepubliceerd |  |
| 56 | Add within 10 · True or False | groep 3 | `optellen-tot-10-klopt-de-som` | GEBOUWD | REK-OPT-OPT-57, groep 3, gepubliceerd |  |
| 57 | Add within 10 · Doubles | groep 3 | `optellen-tot-10-dubbelen` | GEBOUWD | REK-SPL-VER-01, groep 3, gepubliceerd |  |
| 58 | Add within 10 · Adding below 10 | groep 3 | `optellen-onder-10` | GEBOUWD | REK-OPT-OPT-56, groep 3, gepubliceerd |  |
| 59 | Add within 10 · Assessment | groep 3 | `optellen-tot-10-instaptoets` | GEBOUWD | REK-OPT-OPT-55, groep 3, gepubliceerd |  |
| 60 | Count to 120 · Writing Numbers to 20 (ronde 3) | groep 3 | `tellen-120-getallen-schrijven` | GEBOUWD | NIET in de database | wel in de code, geen leerdoel en geen vragen in de database |

## Lijst "ontbreekt"

Er ontbreekt geen enkele les in de code. Wat een kind van groep 3 nu toch niet kan spelen, staat hieronder, met 1 zin over wat het kind daar doet.

### Niet in de database (gebouwd, maar nergens te kiezen)
- **Count to 120 · Writing Numbers to 20** (`tellen-120-getallen-schrijven`): het kind telt de gevulde plekken in een tienstrook, tikt het juiste cijfer en schrijft het cijfer zelf over een stippelspoor.

### Deels
- **Getting Started · Customizing the Tutor** (`intro-instellingen`): het kind zet woorden oplichten aan of uit, hoort of de naam goed klinkt en kiest gewone of grote letters; ontbreekt: stem kiezen, tempo, OpenDyslexic (staat als bewust weggelaten in vragen-voor-later/lessen-groep-3/verhaaltjes-flitsen-intro.md). Deze les en "Zo werkt het" staan op concept.

### Gebouwd, maar in de database op groep 4 (verhuisd 11 oktober)
- **Flashcards 2 · 10 More, 10 Less** (`flitsen-tien-erbij-eraf`): het kind typt snel wat 10 erbij of 10 eraf is, eerst oefenen en dan een race.
- **Add up to 100 · Mastery Check** (`optellen-100-eindtoets`): het kind doet tientallen bij elkaar (30 + 40) en tiental plus eenheden (70 + 6), snel voor een trofee.
- **Add up to 100 · 10s Plus Ones** (`optellen-100-tiental-plus-eenheden`): het kind herkent hele tientallen en bouwt een tiental plus eenheden in de plaatswaardekaart.
- **Add up to 100 · Bridging to 10s** (`optellen-100-aanvullen-tot-tiental`): het kind telt door tot 38 en vult aan tot het volgende tiental.
- **Add up to 100 · Part Part Whole** (`optellen-100-splitsen`): het kind leert de woorden samenstellen en splitsen en splitst 5, 7 en 12.
- **Add up to 100 · Add 10s** (`optellen-100-tientallen-erbij`): het kind telt tientallen erbij, 20 + 10 en 10 + 3.
- **Add up to 100 · Assessment** (`optellen-100-instaptoets`): het kind tikt tientallen en rekent 30 + 50 en 30 + 40; te traag stuurt hem naar les 1.
- **Power of Place · The Power of Place** (`tientallen-plek-van-de-tientallen`): het kind leert de cijfers 0 tot 9 en dat 10 enen 1 tiental zijn.
- **Grouping 10s · 10s All the Way Up** (`tientallen-groepjes-van-tien`): het kind telt stippen tot 10 en 20 en daarna tientallen tot 100.
- **Telling Time · Quarter Past** (`klok-kwart-over`): het kind kleurt een kwart van de klok in en leest en zet kwart over.
- **Count to 120 · Mastery Check** (`tellen-120-eindtoets`): het kind telt een kleur in een rooster en telt door.
- **Count to 120 · Counting On** (`tellen-120-doortellen`): het kind vindt 20, benoemt getallen tot 50 en telt 3 door binnen de rij.
- **Count to 120 · Assessment** (`tellen-120-instaptoets`): het kind telt een kleur in een rooster, zoekt een getal en telt door (73 + 8).

## Wat ik niet kon nagaan

- Of elke les precies zo speelt als Synthesis: dat heb ik alleen uit de plannen, de code-uitleg en de vragenbestanden gehaald, niet door af te spelen. Verschillen die bewust zijn gekozen (typen in een echt vak, vuurvliegjes in plaats van blokjes, haas die 60 seconden doet) tel ik niet als "deels".
- Of de lessen ook online staan: alleen de laptop-database is gelezen.
