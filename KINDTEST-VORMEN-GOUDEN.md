# KINDTEST — gouden les Vormen: Patronen (squla-vormen-patronen-1-gouden, "Patronen")

Gespeeld op 11 november 2026 door **de bouwer zelf** (niet door een onafhankelijke helper: ik mocht geen helpers
inzetten, harde regel 10). De echte kind-test en de keuring doet hierna een aparte keurder. Ik heb geprobeerd te kijken
als een kind van 6, maar ik heb de les zelf gemaakt; dit verslag is dus geen keuring.

Hoe gespeeld (altijd Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Chrome zonder venster** (nepstem), met schermfoto's van elke vraag, elke hint en elk samen voordoen:
  `scripts/test-vormen-gouden.mjs`, routes **goed** (ook eerst een andere keuze en weer weghalen), **fouten**, **alles
  fout**, **elk ander fout antwoord**, **weer** (hetzelfde foute antwoord 2 keer), **vangnet** (niets doen bij de kleine
  stap en bij de puzzel), **lang wachten**, **tik op de pijl** en **kleur**. De kralen zijn echt met de muis gesleept en
  ook aangetikt.
- **Overlap en sprongen** op 1440 × 900, 1280 × 720, 1536 × 864 en 1024 × 768.
- **Speelcontrole** GOED en ALLEFOUT met de F7-meter; **wit blijft wit**; **woord voor woord** met de echte stem.

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven
tikken (15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **147**.

---

## PROBLEMEN DIE IK VOND (en hersteld heb)

1. **Een hint met de vraag erachter was te lang** ("Kijk naar het begin van de ketting. Zoek het stukje dat steeds
   terugkomt. Welke kraal komt na de rode kraal?" en "Kijk naar wat links van de lege plek ligt. …"): Bliepo werd kleiner
   (15.30). Korter gemaakt ("Zoek het stukje dat steeds terugkomt.", "Kijk links van de lege plek. Zoek die kraal
   eerder."). Na "Zoek eerder in de ketting een rode kraal. Kijk wat daarna komt." komt de vraag niet nog eens: dat was
   dubbel.
2. **"Maak de puzzel." kwam 2 keer** na elke verkeerde plek (F8). Nu zegt Bliepo na het rondje een andere korte zin
   ("Sleep jij het stukje erheen?" / "Sleep het stukje naar die plek.").
3. **Een hint die niet klopte**: bij vraag 12 zei de hint "Zoek eerder in de rij een boek", maar vóór de lege plek ligt
   alleen het boek ernaast. Het fouttabel-script vond het; nu zegt de hint iets wat wel klopt ("Zoek eerder in de rij een
   blok. Kijk wat ervoor komt.").
4. **Een eerste zin die het antwoord bijna noemde** ("Na een rode kraal …" terwijl het antwoord een rode kraal was): nu
   "Na rood komt nooit groen.".
5. **De ketting kon alleen in 1 keer**: in het oude vlak ging hij op slot zodra hij vol was. Nu mag het kind schuiven en
   tikt het op het vinkje (alleen in de gouden les, zie KEUZES Ronde 36).

## WAT IK ZAG, PER SOORT VRAAG

| Soort | Wat het kind ziet en doet | Klopt het? |
|---|---|---|
| Kraal kiezen (7×) | ketting met een lege plek; 3 kralen in een zacht vak; tik = vinkje, dan het vinkje bij Bliepo | ja |
| Ketting langer (3×) | 3 lege plekken; 3 losse kralen; slepen of tikken; vinkje | ja |
| Wat hoort bij de pijl (3×) | dingen op een rij, een lege plek met een pijl; 3 plaatjes | ja |
| Welke vorm komt nu (1×) | vormen op een rij met een pijl; 3 vormen | ja |
| Puzzel (1×) | eerst het hele plaatje, dan de stukjes; slepen | ja; het gekozen stukje licht geel op (oude puzzel, KEUZES Ronde 36 punt 8) |

## PER FOUT ANTWOORD (14.37)

Alle 37 rijen van de fouttabel kwamen in de routes voor. Voorbeelden (alles fout, 1440 × 900):

| Vraag | Gekozen | Denkfout | Wat Bliepo zei | Klopt? |
|---|---|---|---|---|
| 1 | blauw | verkeerde-volgorde | "Je koos de blauwe kraal. Na rood komt nooit blauw." + "Zoek eerder in de ketting een rode kraal. Kijk wat daarna komt." | ja: na rood komt groen |
| 1 (2e) | rood | laatste-herhaald | "Nu koos je de rode kraal. Aan het eind ligt al een rode kraal. In een patroon komt steeds hetzelfde stukje terug." + samen | ja |
| 4 | blauw | paar-vergeten | "In dit patroon komt blauw na 2 rode kralen." (2 rood) | ja: rood rood blauw blauw groen groen |
| 5 (2e) | oranje | laatste-herhaald | "Aan het eind liggen al 2 oranje kralen." | ja |
| 7 | blauw | buur-herhaald (rechts) | "Rechts van de lege plek ligt al een blauwe kraal." | ja |
| 8 | groen, blauw, geel | verkeerde-volgorde | "Je sleepte eerst een groene kraal. Na rood komt nooit groen." | ja |
| 10 (2e) | groen, geel, paars | laatste-herhaald | "Nu sleepte je eerst een groene kraal. De ketting eindigt al met een groene kraal." | ja |
| 12 | boek | buur-herhaald | "Links van de pijl ligt al een boek." + "Zoek eerder in de rij een blok. Kijk wat ervoor komt." | ja |
| 14 | cirkel | paar-vergeten | "In dit patroon komt de cirkel na 2 oranje driehoeken." | ja |
| 15 | stukje mis | stukje-mis | "Daar hoort dat stukje niet." + "Kijk naar de randjes van het stukje. Welke kleuren raken elkaar?" | ja |

"Weer": 14 van 14 keer bij de 2e fout met hetzelfde antwoord. Het rondje bij een fout stond 28 keer om de keuze van het
kind, 0 keer om het antwoord.

## TIJDEN

- Einde zin → volgend stuk: gemiddeld 744–818 ms (doel ± 700), alleen langer bij het vangnet van de puzzel (Bliepo legt
  stukjes: 1,0 s en 3,0 s).
- Hulphandje: alleen bij opdrachten (ketting, puzzel, kleine stap), 7,4–7,9 s na het begin van de opdracht (± 6 s na de
  zin). Bij kiezen 0 keer iets tijdens het wachten.
- Tik op de pijl: binnen 43–134 ms iets nieuws.

## OPEN (voor de keurder en Sara)

- Het gekozen puzzelstukje licht geel op (oude puzzel).
- De losse puzzelstukjes liggen een beetje over elkaar (zelfde plekken als de oude les).
- Op de echte site moet het openen nog onder 1 s gemeten worden.
