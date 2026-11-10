# KINDTEST — gouden les Huisnummers (squla-huisnummers-gouden, "Huisnummers: wat komt erna?")

Gespeeld op 10 november 2026 door de onafhankelijke keurder, als Testkind (groep 3), op de laptop. Ik ben in gedachten
een kind van 6. Ik heb de les niet zelf meegebouwd.

Hoe gespeeld (altijd een Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Zichtbare Chrome met de echte stem** (Google-stem, met geluid), via het lesoverzicht `/voorbeeld/les` en echt op de
  link geklikt, zoals Sara het doet:
  - **(b) met fouten** (route "fouten"): 11 keer eerst fout, waarvan 5 keer ook een 2e fout (samen voordoen), 1 keer 2 keer
    hetzelfde getal (24), typen met het vinkje, slepen met een echte muis;
  - **(a) bijna alles goed** (route "woorden"), voor het oplichten van de woorden. Zie onder "Tempo en stem".
- **Chrome zonder venster** (snelle nepstem, schermfoto's bij elke vraag, elke fout en elk samen voordoen):
  **alles fout** (2 verschillende foute antwoorden per vraag; alle 28 foute keuzes en huizen die een kind kan kiezen of
  slepen, plus bij typen 2 per vraag: samen 34), **typen buiten de tabel** (nieuw: een nummer dat te ver ligt of de andere kant op),
  **lang wachten**, **vangnet**, **Enter** en **tik op de pijl**.
- Schermfoto's: in de scratchpad van de keurder (niet in Git).

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven tikken
(15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **143**; er kwam niets bij.

---

## PROBLEMEN

### 1. Bij typen zei Bliepo soms iets dat niet waar is — MIDDEL (hersteld)
- **Wat zie je:** bij vraag 11 (straat **?, 30, 31**, typen) typte ik 92. Bliepo: "Je typte 92. **De nummers hier beginnen
  met een 2.**" Maar op de bordjes staat 30 en 31. Als kind snap ik dat niet.
- **Ook gevonden (met het script, voor elk getal van 0 tot 99):** typ je bij "Welk huisnummer komt na 19?" (17, 18, 19, ?)
  het getal 15, dan zei Bliepo "15 komt voor 17, aan het begin van de straat." en bij de 2e fout "**Het vraagteken staat
  midden in de straat.**" Het vraagteken staat aan het eind. Typ je 30, dan "Voor 17 komt een nummer met een 2 vooraan."
  (niet waar: dat is 16). Samen 215 foute zinnen in de 3 typvragen (vraag 4, 11 en 16), alleen bij getallen die niet in de
  fouttabel staan, plus die ene rij (92) die er wél in staat.
- **Hersteld** (alleen in `squla-huisnummers-gouden-zinnen.ts`):
  - "De nummers hier beginnen met een …" alleen als dat bij alle nummers in de straat klopt; anders "Kijk goed welk cijfer
    vooraan hoort.";
  - staat het gat aan het begin of eind van de straat, dan nooit meer "midden in" of "aan het begin/eind": een nummer
    verder weg wordt "**{x} ligt te ver van {buur} af.**" (nieuwe denkfout `te-ver`), een nummer aan de andere kant
    "**{x} komt voor {17}. We zoeken het nummer erna.**" (`verkeerde-richting`);
  - de zin over 10 ernaast gaat altijd over het buurhuis van de vraag ("Na 39 komt een groter nummer dan 30.") en de uitleg
    bij de 2e fout is "Het nummer dat we zoeken, begint met een 4." (eerst stond "Na 39 komt …" 2 keer achter elkaar).
- Het fouttabel-script controleert dit nu (waarheidscontrole, 325 nummers) en stopt bij een zin die niet klopt.

### 2. "Je koos weer …" bij typen en slepen — KLEIN (hersteld)
- Een paar "weer"-zinnen zeiden "Je koos weer een nummer dat er al staat." ook als het kind typte of sleepte. Nu "typte" /
  "sleepte" (BLIEPO-KARAKTER §2: het werkwoord past bij wat het kind doet).

### 3. Woorden lichten niet aantoonbaar op ± 150 ms op — open (bekend)
- Zie "Tempo en stem". Zelfde bekende grens als bij Minsommen en Meer-minder: de Google-stem geeft geen woordmeldingen.

---

## Per fout antwoord (14.37): klopt Bliepo's reactie met de denkfout?

| Soort fout (voorbeeld) | Denkfout | Wat Bliepo zei en liet zien | Klopt? |
|---|---|---|---|
| nummer staat al (vraag 1: koos 6) | `staat-al` | "Huis 6 is er al. Begin bij 7. Welk nummer zeg je daarna?" Rood rondje om huis 7, knoppen weg, dan "Welk nummer komt er na 7?" met dezelfde keuzes | ja; 9 en 8 blijven over |
| 1 te ver (vraag 1: koos 9) | `een-te-veel` | "9 ligt 1 huis te ver. Begin bij 7. …" | ja |
| 1 te ver terug (vraag 7: koos 25) | `een-te-veel` | "25 ligt 1 huis te ver. Er gaat steeds 1 af. Begin bij 27 en tel 1 terug." | ja |
| andere kant op (vraag 13: koos 44) | `verkeerde-richting` | "44 komt na 43. We lopen terug. …" | ja |
| aan het eind van de straat (vraag 3: koos 19) | `buiten-de-rij` | "19 komt na 18, aan het eind van de straat. Kijk naar het huis links van het vraagteken. Begin bij 15 en tel 1 verder." | ja; noemt maar 1 buur (niets verklapt) |
| 2e fout, andere kant (vraag 3: eerst 13, dan 19) | `buiten-de-rij` | "19 komt na 18, aan het eind van de straat. Het vraagteken staat midden in de straat." Dan "Kom, we tellen samen.", Bliepo telt 14, 15 (rondje per huis), "En dan 16. 16 hoort tussen 15 en 17.", ik tik huis 16 | ja; geen "weer" (andere kant) |
| 10 ernaast (vraag 9: koos 38) | `tien-ernaast` | "38 begint met een 3. De huizen ernaast beginnen met een 2. …" | ja (27 en 29) |
| tiental eronder (vraag 12: koos 30) | `verkeerde-rij` | "Na 39 komt een groter nummer dan 30. …" | ja |
| cijfers om (vraag 10: sleepte 42) | `cijfers-omgedraaid` | "Je sleepte huis 42. De nummers hier beginnen met een 2. …" Huis glijdt terug | ja |
| 1 cijfer getypt (vraag 4: typte 2) | `alleen-tientalcijfer` | "Je typte 2. De huisnummers hier hebben 2 cijfers. Begin bij 19. …" Het vak wordt leeg | ja |
| zou verklappen (vraag 10: sleepte 26) | `buiten-de-rij`, zonder reden | "Huis 26 past niet op deze plek." (met "aan het eind" bleef alleen 24 over, 15.17) | ja |
| 2 keer hetzelfde (vraag 6: 2 keer 24) | `staat-al` 2× | "Je koos weer een nummer dat er al staat. Het nummer dat we zoeken, staat er nog niet." | ja, anders gezegd |
| 2 keer dezelfde soort (vraag 12: 2 keer 30) | `verkeerde-rij` 2× | "Je koos weer een te klein nummer. Kijk goed naar het eerste cijfer." | ja |
| typen buiten de tabel (na herstel) | `te-ver` / `verkeerde-richting` | zie "typen buiten de tabel" hieronder | ja |

Geen enkele eerste zin of hint noemt het antwoord of 2 buren tegelijk. Geen "fout", geen naam bij een fout. Rood scherm
bij fout, groen bij goed, geen rood op de keuze, de knoppen gaan meteen weg na een tik (schermfoto's).

## Kijken als een kind (14.23)

- De straat in de avond: grote huizen met een donker bordje en een groot wit nummer (± 34 punten), goed te lezen. Het huis
  met het vraagteken is iets grijzer. Bij slepen een stippellijn-huis op de lege plek; het huis "klikt" erin.
- Het rode rondje staat om het buurhuis dat Bliepo noemt (huis 7 bij "Begin bij 7"), nooit om het antwoord.
- Typen: ik tik op het bordje met het vraagteken, er knippert een streepje, ik typ, het vinkje verschijnt pas als er iets
  staat (eerste keer: "Klaar? Tik dan op het vinkje.", daarna niet meer). Letters komen er niet in. Enter werkt ook.
- Samen voordoen: Bliepo telt de huizen met een rondje per huis, dan komt het nummer op het bordje en mag ik het huis
  aantikken (bij slepen: het goede huis slepen; het handje laat het na ± 6 s zien).
- Geen gezichtjes, geen mensen, geen kaders om plaatjes. Bliepo staat nooit over de tekst; niets verspringt; de pijl gaat
  niet aan en uit. Eindkaart: 0 woorden eronder.

## F7: werd tekst weer grijs bij een drukke computer?

De bouwer zag 1 tot 4 keer "gedimd en weer gedimd" toen hij 2 tests tegelijk draaide. Ik heb het in elke run gemeten:
**0 keer** in alle runs, ook in de run die begon bij een belasting van 14 (alles fout, 199 metingen) en met de echte stem
(fouten). Ik draaide nooit 2 tests tegelijk. Conclusie: het lag aan de drukte van 2 tests tegelijk, niet aan de les.

## Heel snel en lang wachten

- Heel snel: Bliepo zegt niets over snel (draaiboek: niets bij verder tellen). Een tik tijdens de vraag stopt de stem.
- Lang wachten bij kiezen en typen: niets (geen zin, geen handje). Bij slepen en bij de kleine stap: handje na ± 6 s met
  1 zin ("Jij kunt dit. Hier moet een huis staan."). Het handje wijst de lege plek aan, niet het goede huis.

## Tempo en stem

- Einde zin → volgend stuk: gemiddeld 720–737 ms (doel ± 700), nooit buiten 550–950 ms.
- Echte stem (route fouten): 113 zinnen gestart, 80 helemaal uitgesproken, 33 afgebroken omdat ik al tijdens de vraag tikte
  (mag). Geen zin 2 keer (F8 = 0).
- Echte stem (route woorden, 8 minuten, zichtbare Chrome via het lesoverzicht): 69 zinnen gestart, 47 helemaal
  uitgesproken, 22 afgebroken door mijn tik tijdens de vraag (mag). F7 = 0, F8 = 0, 0 overlap, 0 sprongen.
- Woorden oplichten: de Google-stem gaf 0 woordmeldingen. Het eerste woord licht gemiddeld 60 ms na de start van de stem op
  (goed). Het einde kon ik maar bij 10 van de 42 zinnen meten (het meetscript herkent zinnen niet die als 1 uiting worden
  uitgesproken maar als 2 regels in beeld staan); daarvan 2 binnen ± 150 ms, gemiddeld 384 ms ernaast. Dit komt uit de
  gedeelde schatting van woordtijden (lib/stem.ts), niet uit deze les; met Ruth komen echte tijden. Open, zoals bij
  Minsommen en Meer-minder (KEUZES Ronde 24).
