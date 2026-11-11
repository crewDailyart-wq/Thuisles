# KINDTEST — gouden les Tijd (squla-tijd-dagen-1-gouden, "Dagen van de week", level 1)

Gespeeld op 11 november 2026 door **de bouwer zelf** (niet door een onafhankelijke helper: ik mocht geen helpers
inzetten, harde regel 10). De echte kind-test en de keuring doet hierna een aparte keurder. Ik heb geprobeerd te kijken
als een kind van 6, maar ik heb de les zelf gemaakt; dit verslag is dus geen keuring.

Hoe gespeeld (altijd Chrome met een **lege profielmap**, **zonder koekje** van een kind, `?naam=Testkind`):
- **Chrome zonder venster** (nepstem), met schermfoto's van elke vraag, elke hint en elk samen voordoen:
  `scripts/test-tijd-gouden.mjs`, routes **goed** (ook eerst een andere kaart aantikken en weer weghalen), **fouten**,
  **alles fout**, **elk ander fout antwoord**, **weer** (hetzelfde foute antwoord 2 keer), **vangnet** (niets doen bij de
  kleine stap), **lang wachten**, **tik op de pijl** en **kleur**.
- **Overlap en sprongen** op 1440 × 900, 1280 × 720, 1536 × 864 en 1024 × 768.
- **Speelcontrole** GOED en ALLEFOUT met de F7-meter; **wit blijft wit**; **woord voor woord** met de echte stem (zie
  KEUZES-VOOR-SARA.md Ronde 40 voor de cijfers).

In alle runs ging de les door tot de eindkaart. Nooit naar het menu, nooit gestopt (15.18). Nooit op de pijl hoeven
tikken (15.27). `les_uitkomsten`: hoogste id vóór en na alle runs **147**.

---

## PROBLEMEN DIE IK VOND (en hersteld heb)

1. **2 keer "school" in 1 reactie:** "Je koos zondag en maandag. Op maandag ga je naar school. In het weekend ga je niet
   naar school. Welke kaart …". Nu: "In het weekend ben je vrij. Welke kaart heeft 2 vrije dagen?". Ook de uitleg bij de
   2e fout zegt nu "vrije dagen" in plaats van "geen school".
2. **2 keer de dagnaam achter elkaar:** "Je koos zaterdag. Zaterdag hoort bij …". Nu: "Je koos zaterdag. Die hoort bij
   het weekend, maar is niet de laatste dag." (zo ook bij alle andere eerste zinnen: "Die komt vóór …", "Dat is niet de
   eerste dag.").
3. **2 keer hetzelfde getal:** "Je koos 1. Het weekend is langer dan 1 dag." Nu: "… langer dan dat."
4. **Een rondje om alle 7 wagons** (bij "Dat zijn 7 wagons") was breder dan de trein en liep tot vlak bij het tekstvak.
   Nu staat er dan geen rondje (Bliepo heeft net elke wagon apart met het rondje aangewezen).
5. **Verklapper bedacht vóór het bouwen:** "Je koos zaterdag. Na zaterdag komt nog een dag." zou maar 1 keuze overlaten
   (zondag). Niet gebruikt; het script rekent het na.

## WAT IK ZAG, PER SOORT VRAAG

| Soort | Wat het kind ziet en doet | Klopt het? |
|---|---|---|
| Begin | de hele weektrein, groet + "In deze les leer je hoe een week in elkaar zit. Elke dag is een wagon van de weektrein." | ja; geen startvraag |
| Eerste / laatste dag | de locomotief met 7 lege plekken (stippellijn); 3 dagkaarten; een tik zet een vinkje, nog een tik haalt het weg; het vinkje bij Bliepo kijkt na; bij goed rijdt de dag vooraan (of achteraan) de trein in | ja; geen rand of gloed om de keuze |
| Hoeveel dagen heeft het weekend? | alleen de locomotief; 3 getallen bij Bliepo; bij goed rijdt de hele trein binnen met 1 rondje om zaterdag en zondag terwijl Bliepo ze noemt | ja |
| Op welke dagen is het weekend? | lege trein; 3 kaarten met elk 2 wagons (zondag en maandag, zaterdag en zondag, donderdag en vrijdag); bij goed komen zaterdag en zondag achteraan met de gele haak eronder | ja; de kaarten zijn goed te lezen |
| Welke dag komt meteen na …? | locomotief, 1 wagon en een lege plek; 3 dagkaarten; bij goed rijdt de dag de lege plek in | ja |
| Hoeveel dagen heeft een week? | alleen de locomotief; 6, 7, 8 bij Bliepo; bij goed de hele trein | ja |
| 3 vragen terug | "Nu komen er nog 3 vragen van net terug." (of "We oefenen er nog 3 van net."), daarna de vragen met de andere hint | ja |
| 1e fout | Bliepo's scherm rood; rood rondje om de gekozen kaart terwijl hij die noemt (bij een getal geen rondje); dan de hint en de keuzes komen meteen terug | ja; rondje nooit om het antwoord (24 / 12 / 12 keer gemeten, 0 keer om het antwoord) |
| 2e fout | wat het kind koos ("Nu koos je …" of "Je koos weer …"), uitleg zonder opdracht, "Kom, we kijken samen." (3 versies), de hele trein, rondjes om de dagen, dan het rondje om de goede kaart; het kind tikt hem | ja |
| Lang niets doen | bij kiezen: niets (0 keer); bij de kleine stap op een kaart: na ± 6 s het handje naast de kaart met 1 zin; na 20 s doet Bliepo het zelf ("Kijk, …", geen "Ja") | ja |
| Einde | slotzin, kaart links van het tekstvak (0 woorden eronder), eindzin, "Tik op de kaart." zonder pijl | ja |

## WAT IK NIET KON DOEN

- Geen echte kind-test (geen kind, geen onafhankelijke helper).
- Bij de kleine stap op een **getal** komt geen hulphandje en geen vangnet (de knop staat bij Bliepo); het kind kan alleen
  dat ene getal tikken (zoals de klokles). Vraag aan Sara: KEUZES Ronde 40 punt 6.
- De echte stem van Ruth: nog niet ingesproken (browserstem).
