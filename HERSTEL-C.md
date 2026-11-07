# Herstel groep C (piraat, splitsen, plussommen, minsommen, rekenmix, rekentaal) — 7 november 2026

Gedaan volgens HERSTEL-OPDRACHT.md en OVERZICHT-C.md. Keuzes en nieuwe zinnen: KEUZES-VOOR-SARA.md (onderdeel "Groep C").
Foto's: `public/overbodige-plaatjes-na/<les-id>-voor.jpg` en `-na.jpg` (extra vragen: `<les-id>-vNN-voor.jpg` / `-na.jpg`).
Getest als Testkind (voorbeeld, zonder stem), met schermfoto's van elke les uit de lijst. Typecheck (`npx tsc --noEmit`): geen fouten in `src/`.
Naspelen met echte tijd gecontroleerd: min-bus1-1 (pakjes springen pas na het antwoord de bus uit) en min-machine-1 (machine draait pas na het antwoord, daarna de uitkomst).

**Vloeiend (`npm run vloeiend`, alleen groep C-schermen):** gemeten terwijl de laptop zwaar belast was door andere helpers (load 80–700). 60 beelden/s bijna overal, maar op een paar schermen haperingen van 55–140 ms en bij 2 sleepschermen "voorwerp naast de muis" (splitsen2-1 telefoon, delen-1 laptop; dezelfde schermen slaagden in de andere stand). Het sleepgedrag heb ik niet veranderd; dit moet opnieuw gemeten worden als de laptop rustig is, vóór het online zetten.

## Gedeeld (additief)
- `src/components/les/soort.ts` + `Lesscherm.tsx` + `Lesscherm.module.css`: nieuwe opt-in instelling `midden` bij `l.kies(...)`: de antwoorden groot in een rij in het midden van het speelvlak (alleen liggend scherm, indeling Synthesis). Lessen die `midden` niet meegeven veranderen niet.
- Nieuw: `src/components/les/lessen/squla-meng.ts` (plek van het goede antwoord willekeurig per les-start, vast per vraag).
- Nieuwe plaatjes (in code getekend, stijl B): `public/voorwerpen/speelbal.png`, `pizzadoos-plat.png`, `speelblok-plat.png`, `doos-plat.png`, `boek-plat.png`; in `src/lib/voorwerpen/lijst-rekenmix.ts` erbij gezet. Oude plaatjes niet aangeraakt.

## Per les
| Les | Gedaan | Wat | Foto's |
|---|---|---|---|
| squla-min-bus1-1/1-2/1-3, bus2-1/2-2/2-3 | ja | VERKLAPT opgelost: alle pakjes in de bus tijdens de vraag; na het antwoord springen ze eruit (boogje, stuiter, stofwolkje). Bus 2: getal staat al in de cirkel. Hint aangepast. Antwoorden in het midden, plek wisselt. | alle 6 (bus1-1 ook v02) |
| squla-splits-splitsen2-1 | ja | VERKLAPT opgelost: alleen het briefje, munten pas na het antwoord. Beginscherm: geen losse zwevende getallen meer. Plek tegels wisselt. | splitsen2-1 (+v00, v03) |
| squla-splits-delen-1 | ja | VERKLAPT opgelost: 1 gemengde hoop knikkers; na het antwoord vallen ze per kleur in de bakjes. Potlodenrek kleiner. | delen-1 (+v07, v13) |
| squla-piraat-1/2/3 | ja | Planeet/raket/maan/komeet weg (kale sommen en raadsels; maan-darijn verklapte niet meer). Som groot in het midden, tegels met lucht tot de letters. Raadselantwoorden groot in het midden. Plek wisselt. | piraat-1 (+v11, v13, v14, v01), piraat-2, piraat-3 (+v00, v02, v04, v12) |
| squla-rekenmix-mix4-2 | ja | KAPOT opgelost (fout in de flits na een goed antwoord liet het vlak vastlopen); de les loopt nu door (getest t/m vraag 3). | mix4-2 |
| squla-min-machine-1, -2 | ja | Machine draait pas na het antwoord; tijdens de vraag 10 blokjes en een lege bak. Antwoorden onder de bak (de na-foto's zijn van vóór die laatste verschuiving). | machine-1 (+v02), machine-2 |
| squla-min-machine-4 | deels | Strandbal i.p.v. "verbodsbord"-bal; antwoorden in het midden. Naspelen (munten naar het ding): Sara beslist. | machine-4 |
| squla-min-ruimte-1, -2, -3 | ja | Komeet/satelliet/raket bij kale som weg; antwoorden in het midden; typvraag: vraagteken in de som is geen vakje meer. | ruimte-1 (+v02), ruimte-2 (+v17) |
| squla-min-machine-3, kaal-1/2/3 | ja | Vraagteken op het bord is geen invulvak meer bij typvragen; keuzes in het midden. | (geen voor-foto in de lijst) |
| squla-plus-bakkerij-1/2/3 | ja | Antwoorden groot in het midden onder de toonbank; taart bij typvragen weg; typen in het vakje van de som; luidsprekers klein en zacht. | bakkerij-1 (+v05, v06), bakkerij-2 (+v08), bakkerij-3 (+v17) |
| squla-plus-dansen-1..4 | ja | Luidsprekers klein en zacht achteraan; kaartjes/platen wisselende volgorde. Beginzin dansen-4: Sara beslist. | dansen-1 (+v02), dansen-2, dansen-3, dansen-4 |
| squla-plus-kaal-1/2/3 | ja | Zwevende cijfers weg, plusteken klein en zacht; typen in het vakje van de som. | kaal-1, kaal-3 |
| squla-plus-bus1-1/1-2/1-3 | ja | "bij de halte" weg uit de zin; stapel nieuwe pakjes iets weg van de microfoonknop. Traag laden niet gezien. | bus1-1 |
| squla-splits-splitsen1-1 | ja | 1 nette doek (glijdt weg bij optillen); oranje vak echt oranje (en paars voller). | splitsen1-1 (+v15) |
| squla-splits-splitsen1-2 | ja | Ballen bij de splitspaal (telhulp) blijven, meer naar het midden; shirts: getal onder het vak; plek wisselt. | splitsen1-2 (+v02) |
| squla-splits-splitsen2-2 | ja | Geld weg; verbind-rij weg van Bliepo; plek wisselt; beginscherm toont het hele huisje. | splitsen2-2 (+v00, v06) |
| squla-rekenmix-mix1-1 | ja | Strandbal; antwoorden in het midden onder de tekening. | mix1-1 (+v01, v03) |
| squla-rekenmix-mix1-2 | ja | Kleed en platte tekeningen i.p.v. streepje-plank en 3D-dozen. | mix1-2 (+v10) |
| squla-rekenmix-mix1-3, mix3-2 | ja | Direct in de rij tikken (geen dubbele rij meer); rij van 5 in het midden. | mix1-3 (+v13), mix3-2 |
| squla-rekenmix-mix1-4 | ja | Alle dingen in een vraag even groot. | mix1-4 (+v34) |
| squla-rekenmix-mix2-1 | nee | Boterhammen: nieuwe plaatjes nodig (Sara beslist). Wel: plek van de keuzes wisselt. | mix2-1 (alleen ter vergelijking) |
| squla-rekenmix-mix2-2 | ja | Strandbal; "achter de doos" duidelijk; antwoorden in het midden. Beginzin "onder": Sara beslist. | mix2-2 (+v07) |
| squla-rekenmix-mix2-4, mix4-3, mix4-4 | ja | Groepjes compacter met lucht ertussen; groepje bovenaan los van de keuzes; los ding bij meer/minder weg. Plek keuzes wisselt. | mix2-4 (+v19), mix4-3 (+v08), mix4-4 (+v01, v08) |
| squla-rekenmix-mix3-1 | deels | Strandbal; taal "kleinst, kleiner, klein" niet veranderd (Sara koos optie B op 6 nov). | mix3-1 |
| squla-rekenmix-mix3-3, mix3-4, mix4-1 | ja | Antwoorden in het midden; strandbal. | — |
| squla-rekentaal | ja | Vraag en "Tik erop" in 1 zin; plek van het goede ding wisselt. | rekentaal |

## Ronde 2 (na de controle, 7 november 2026)
Afkeuringen uit CONTROLE-HERSTEL-C.md opgelost. Getest als Testkind (voorbeeld, zonder stem) op laptop 1440 × 900 en telefoon 390 × 844, 1 Chrome tegelijk, geen foutmeldingen. `npx tsc --noEmit`: geen fouten in `src/`.
Foto's: `public/overbodige-plaatjes-na/<les-id>-r2-voor.jpg` en `-r2-na.jpg` (telefoon: `-r2-telefoon-…`).

| Les | Gedaan | Wat | Foto's |
|---|---|---|---|
| squla-min-ruimte-1/2/3, squla-plus-bakkerij-1 (en alle andere keuzes-in-het-midden met 4 of meer knoppen) | ja | `Lesscherm.module.css` (additief, alleen bij 4+ knoppen in `.keuzesMidden`): tekst 32 i.p.v. 38, minder ruimte; past het toch niet, dan 2 × 2. 4 sommen staan nu helemaal in beeld met ruimte tot de microfoonknop. Rijen met 2 of 3 keuzes, telefoon en lessen zonder `midden` ongewijzigd. | ruimte-2-r2, bakkerij-1-r2 |
| squla-min-ruimte-1/2 (zin) | ja | "Is het 13, 14 of 16?" volgt nu dezelfde (gemengde) volgorde als de knoppen (`meng()` onthoudt de volgorde per lijst). | ruimte-2-r2-zin |
| squla-plus-kaal-1/2/3, typvragen bakkerij-3 | ja | Op een staand scherm (alleen Squla; alleen Plussommen zet daar een som) is de som bovenaan ±2,3 × zo groot en het invulvak 200 × 172 (was 90 × 76). Nog steeds 1 invulvak; laptop ongewijzigd. Geen overlap met toonbank of plusteken. | kaal-1-r2-telefoon, bakkerij-3-r2-telefoon |
| squla-rekenmix-mix1-1 | ja | Potloden (paren en rijen) bijna 2 × zo lang en dicht bij elkaar; alleen het potlood, andere dingen ongewijzigd. | mix1-1-r2 (+v10) |
| squla-min-machine-4 | ja | Munten 90 (1 euro) en 100 (2 euro) i.p.v. 62/68; rij iets hoger. Elk geldstuk verschijnt zodra zijn eigen plaatje binnen is (eerder wachtte alles op de grote briefjes van 3,3 MB); al het geld wordt bij de eerste geldvraag vast geladen, munten eerst. | machine-4-r2, -r2-telefoon |
| squla-splits-splitsen2-1 | ja | Beginscherm en eerste vraag delen dezelfde vraag: tegels in dezelfde volgorde. | splitsen2-1-r2 |
| "Hoeveel is 7 − / 4?" (afbreken midden in de som) | nee | Kan alleen in het gedeelde `BliepoTekst.tsx`, dat alle lessen raakt (ook oude); niet gedaan. |  |

## Ronde 3 (vloeiendcontrole, 7 november 2026)
| Les | Gedaan | Wat | Foto's |
|---|---|---|---|
| squla-splits-splitsen2-1 (trage telefoon: "gesleepte voorwerp staat ±89 px naast de vinger") | ja | Oorzaak: niet de herstelwijzigingen van vandaag (de melding stond al in de logs van 5 en 6 november, vóór ronde 1). Op het staande scherm liggen de getaltegels vlak boven de onderrand van het speelvlak (canvas 390 × 287). De controle sleept tot 60 px naar beneden, dus buiten het speelvlak; Phaser negeert een vinger buiten het canvas, waardoor de tegel stil bleef staan. Bij de proefsleep (+70, +40) werd het zelfs een tik, en dan legt de les de tegel in het vak (fout antwoord). Herstel in `squla-splitsen-vlak.tsx` (alleen de sleeplaag van splitsen2/piraat): komt de vinger buiten het speelvlak, dan volgt de tegel hem nu toch (via een `touchmove` op het venster, alleen als Phaser zelf niet meer volgt). Gewoon slepen binnen het vlak, tikken en loslaten werken als eerst. Uitslag `ALLEEN="splitsen2-1"`: laptop 0 px, telefoon 0 px, 60 beelden/s. Ook gecontroleerd: splitsen2-2, splitsen1-1, piraat-1 (allemaal ✓). `npx tsc --noEmit`: geen fouten in `src/`. | eigen foto's (scratchpad): binnen het vlak zit de tegel precies onder de vinger |
