# KINDTEST — gouden les Dagen (squla-dagen-van-de-week-gouden, "Dagen van de week")

Gespeeld op 11 november 2026 door **de bouwer zelf** (niet door een onafhankelijke helper: ik mocht geen helpers
inzetten, harde regel 10). De echte kind-test en de keuring doet hierna een aparte keurder. Ik heb geprobeerd te kijken
als een kind van 6, maar ik heb de les zelf gemaakt; dit verslag is dus geen keuring.

Hoe gespeeld (altijd Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Chrome zonder venster** (nepstem), met schermfoto's van elke vraag, elke hint en elk samen voordoen:
  `scripts/test-dagen-gouden.mjs`, routes **goed** (ook eerst een andere wagon of kaart aantikken en weer weghalen, en
  bij slepen eerst een andere kaart in de lege plek), **fouten**, **alles fout**, **elk ander fout antwoord**, **weer**
  (hetzelfde foute antwoord 2 keer), **vangnet** (niets doen bij de kleine stap), **lang wachten**, **tik op de pijl** en
  **kleur**. Bij "Er mist een dag" zijn de kaarten echt met de muis gesleept (langzaam, zoals een kind).
- **Overlap en sprongen** op 1440 × 900, 1280 × 720, 1536 × 864 en 1024 × 768.
- **Speelcontrole** GOED en ALLEFOUT met de F7-meter; **wit blijft wit**; **woord voor woord** met de echte stem.

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven
tikken (15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **147**.

---

## PROBLEMEN DIE IK VOND (en hersteld heb)

1. **"Je koos maandag. Maandag is verder weg van vandaag."**: 2 keer de dagnaam achter elkaar, en "verder weg" zonder
   "van wat". Nu: "Je koos maandag. Die dag ligt verder van vandaag af."
2. **"Je zit er vlak naast." bij een wagon aan het eind** (bedacht vóór het bouwen, door het script bevestigd): "Je zit er
   vlak naast." bij zondag zou maar 1 wagon overlaten (zaterdag). Bij een wagon aan het eind zegt Bliepo nu alleen welke
   wagon het kind koos.
3. **"Hangt al verderop in de trein"** klopte niet bij maandag (die hangt vóór de lege plek). Nu: "… hangt al ergens
   anders in de trein." (het script loopt het na).
4. **De testspeler** nam het goede antwoord als 1 dag, maar bij het weekend zijn er 2 goede (zaterdag en zondag). In de
   les zelf ging het goed; het testscript is aangepast (LESRECEPT "Geleerd bij Dagen").

## WAT IK ZAG, PER SOORT VRAAG

| Soort | Wat het kind ziet en doet | Klopt het? |
|---|---|---|
| Begin | de hele weektrein, groet + "In deze les leer je de dagen van de week. Ze rijden mee in de weektrein." | ja; geen startvraag |
| Tik op de wagon van … | de hele trein; een tik zet een groen vinkje op de wagon, nog een tik haalt het weg; het vinkje bij Bliepo kijkt na (de 1e keer: "Klaar? Tik dan op het vinkje.") | ja; geen rand en geen gloed om de keuze |
| Welke dag komt na/vóór …? | locomotief, 1 wagon en een lege plek (stippellijn); 3 dagkaarten eronder; bij goed rijdt de dag de lege plek in (de wagon wipt op) | ja |
| Er mist een dag | de hele trein met 1 lege plek; een kaart slepen (of tikken), wisselen mag, de lege plek licht geel op als de kaart erboven hangt; dan het vinkje | ja |
| Gisteren / morgen | de hele trein, boven vandaag een geel bordje "vandaag" en een gele pijl (F3) | ja |
| Het weekend | zaterdag én zondag goed; bij de 2e vraag heeft de 1e dag al een vinkje en is niet meer te tikken | ja |
| "Vandaag is het maandag. Gisteren?" | lege plek, dan maandag met het bordje "vandaag"; 3 kaarten | ja (zelfde beeld als de oude les) |
| Fout | Bliepo's scherm rood; rood rondje om de gekozen wagon of kaart zolang hij hem noemt; de hint eindigt met de vraag of de opdracht | ja; rondje nooit om het antwoord (0 van 34) |
| Samen voordoen | bij "Tik op de wagon": het rondje loopt van maandag tot de dag, Bliepo noemt elke dag; bij na/vóór: de hele trein, rondje om de dag en dan om het antwoord, dan om de kaart; bij slepen: rondje om de buren, dan om de kaart, het handje doet het slepen voor | ja |
| Einde | "Nu ken je de dagen van de week.", de kaart met de trein, eindzin + "Tik op de kaart." | ja; 0 woorden onder de kaart |

## PER FOUT ANTWOORD: KLOPT BLIEPO'S REACTIE MET DE DENKFOUT? (bewust verschillende foute antwoorden)

| Vraag | Fout antwoord | Wat Bliepo zei | Klopt? |
|---|---|---|---|
| 1 donderdag | maandag | "Je koos de wagon van maandag." + "De week begint vooraan met maandag. Zeg de dagen op tot donderdag." | ja (geen reden verzonnen) |
| 2 zaterdag | zondag (eind) | "Je koos de wagon van zondag." + "Lees de bordjes vanaf maandag, vooraan. Waar staat zaterdag?" | ja; geen "vlak naast" (anders verklapt) |
| 4 na dinsdag | maandag | "Maandag komt vóór dinsdag." + "Na dinsdag is de dag erachter. …" | ja (vóór en na verwisseld) |
| 6 vóór vrijdag | zaterdag, 2 keer | 2e keer: "Je koos weer de dag na vrijdag. Vóór is de dag ervoor, niet de dag erachter." | ja ("weer" klopt) |
| 8 mist woensdag | vrijdag | "Vrijdag hangt al ergens anders in de trein." + "Kijk naar de wagons naast de lege plek. Sleep de dag die daartussen hoort." | ja |
| 9 mist zaterdag | zondag | "Zondag hangt al vlak naast de lege plek." | ja |
| 11 gisteren (woensdag) | maandag | "Die dag ligt verder van vandaag af." + "Gisteren is al voorbij. Welke dag was het gisteren?" | ja |
| 13 weekend | maandag | "Dat is een schooldag." + "Op een schooldag ga je naar school. Tik op een dag van het weekend." | ja |
| 15 na zondag | zaterdag | "Zaterdag komt vóór zondag." + "Na de laatste dag begint de week opnieuw. Welke dag komt na zondag?" | ja |
| 17 gisteren (maandag) | dinsdag | "Dat is morgen." + "Maandag is de eerste dag. Gisteren was de dag daarvoor. Welke dag was dat?" | ja |

Alle 65 foute antwoorden (17 vragen + de 2e weekendvraag na zondag) staan in FOUTTABEL-squla-dagen-van-de-week-gouden.md;
het script heeft elke zin nagelopen tegen het beeld van die vraag.

## WAT IK NIET KON NAGAAN

- Een echt kind van 6 (de trein op een tablet slepen met een vinger).
- De stem van Ruth (de les gebruikt de browserstem).
- Telefoon rechtop: de nieuwe trein staat dan op 1 rij en is klein (latere fase, DESIGN-LATER.md; de oude trein had 2
  rijen op een staand scherm).

## METINGEN

- **Fouttabel-script** `npx tsx scripts/fouttabel-dagen-gouden.ts`: 17 vragen (+ de 2e weekendvraag na zondag), 65 foute
  antwoorden, 409 beweringen nagelopen, 621 zinnen op kale cijfers en lengte: in orde.
- **`npm run opgaven`** in orde; **`npm run inhoudsvergelijk`** (REV=512f0eb en de werkmap): 0 verdwenen.
- **Speelcontrole** met F7=1: GOED 57 stappen, ALLEFOUT 219 stappen, beide tot het eind; F7 0, F8 0.
- **Eigen testscript**, alle routes: tot de eindkaart, 0 keer op de pijl hoeven tikken, 0 stukken die op een tik wachten.
  Rondje bij een fout 34 / 16 / 17 keer, 0 keer om het antwoord. "Weer" 17 van 17. Vangnet 3 keer ("Kijk, …", geen
  "Ja"). Hulphandje alleen bij opdrachten (slepen en de kleine stap; 7,6–7,8 s na het begin, ± 6 s na de zin), bij
  keuzevragen 0 keer iets. Tik op de pijl: binnen 48–108 ms iets nieuws. Einde zin → volgend stuk gemiddeld 719–811 ms;
  1 keer 1019 ms (na een lof van 2 zinnen), verder alles binnen 550–950 ms.
- **Overlap en sprongen** (ONTWERP=1, alles fout) op 1440 × 900, 1280 × 720, 1536 × 864 en 1024 × 768: 0 overlap, 0 tekst
  buiten het vak, 0 sprongen, pijl nooit weg en terug, eindkaart 0 woorden eronder. Speelvlak: de rails eindigen 22 px
  links van het tekstvak, de wagons en kaarten (knoppen) 262 px (1440 × 900).
- **Getalkleur:** de getallen in Bliepo's tekst (7, 1, 2) zijn wit (ze verwijzen naar niets of naar wagons van
  verschillende kleuren).
- **Wit blijft wit** (site 3,5 s traag, 120 s): 2 keer een zin wit vóór Bliepo, 0 keer daarna weer grijs.
- **Woord voor woord** (`IJK=1 scripts/test-woord-oplichten.mjs`, zichtbare Chrome, echte Google-stem): 16/16 en 6/6
  woorden apart opgelicht, grootste sprong 1 woord; per woord gemiddeld 121 ms naast het gesproken moment, 15 van 20
  binnen ± 150 ms (grootste 458 ms; gedeeld spreekmodel).
- **Vloeiend** (`ALLEEN=squla-dagen-van-de-week-gouden npm run vloeiend`): laptop 60 beelden/s (langste beeld 36 ms),
  trage telefoon 60 beelden/s (23 ms). Openen in de ontwikkelversie 1,6 s / 3,4 s (op de echte site moet het onder 1 s).
  De Mac stond in de energiebesparende stand (lowpowermode 1), belasting ± 4.
