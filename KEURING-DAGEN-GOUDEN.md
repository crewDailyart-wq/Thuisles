# KEURING gouden les Dagen (squla-dagen-van-de-week-gouden, "Dagen van de week")

Onafhankelijke keurder (niet de bouwer), 11 november 2026, branch backup-squla, na commit a122522. Kind-test van de
bouwer: KINDTEST-DAGEN-GOUDEN.md. Keuzes van de bouwer: KEUZES-VOOR-SARA.md Ronde 38. Mijn vragen: Ronde 39.

Geen betaald tegoed, niets online, oude lessen (regel 8) niet aangeraakt, geen helpers ingezet, niets in de database
geschreven. Getest als Testkind, Chrome met een leeg profiel en zonder koekje van een kind. `les_uitkomsten`: hoogste id
vóór en na alles **147**.

## UITSLAG

**GOEDGEKEURD** na 3 kleine herstellingen (zinnen van Bliepo). De les werkt goed en volgt de regels.

Telling: 0 ernstig, 0 middel, **3 klein** (alle 3 hersteld en opnieuw getest), **3 open punten voor Sara** (A t/m C).
De inhoud (17 vragen, dagen, dagkaarten, goede antwoorden) is niet veranderd.

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (vooral 3.7, 15.11, 15.17–15.30), LESRECEPT.md (ook "Geleerd bij Geld", "Vormen",
  "de keuring Vormen", "Dagen"), FOUTEN-VOORBEELDEN.md (F1–F10), KEUZES Ronde 37–38, de fouttabel, KEURING-VORMEN-GOUDEN.md,
  de les, de zinnen, het nieuwe vlak en de oude les.
- **Inhoud gelijk aan de oude les:** zelf naast elkaar gelegd (squla-dagen.tsx tegen `VRAGEN` in
  squla-dagen-gouden-zinnen.ts): 17 vragen in dezelfde volgorde: tik donderdag, zaterdag, dinsdag; na dinsdag [vrijdag,
  woensdag, maandag], na vrijdag [zaterdag, donderdag, zondag]; vóór vrijdag [donderdag, zaterdag, woensdag], vóór
  woensdag [donderdag, maandag, dinsdag]; mist woensdag, zaterdag, maandag (zelfde kaarten); gisteren (vandaag woensdag),
  morgen (vandaag vrijdag); weekend 1 en 2 (zaterdag én zondag goed); na zondag, vóór maandag; "Vandaag is het maandag,
  gisteren?" [dinsdag, zondag, zaterdag]. Zelfde goede antwoorden.
- **Regel 1:** commit a122522 voegt alleen nieuwe bestanden toe; in bestaande bestanden alleen regels erbij (index.ts,
  catalogus.ts, alle-lessen.html). `git diff 512f0eb` op squla-dagen.tsx, squla-dagen-trein.tsx, squla-dagen.module.css
  en squla-tijd.tsx (met squla-tijd-dagen-1/2/3): **leeg**.
- **Fouttabel-script** `npx tsx scripts/fouttabel-dagen-gouden.ts` (na herstel): 65 foute antwoorden, 425 beweringen,
  637 zinnen: in orde. Zelf elke rij nagelopen: elke zin is waar voor dat antwoord, geen hint noemt het antwoord, na
  elke eerste zin blijven minstens 2 keuzes over, weekend = zaterdag én zondag goed. Het script heeft er 2 controles
  bij (zie herstel 1 en 2); met de oude zinnen geven die 43 meldingen, nu 0.
- `npm run opgaven`: in orde. `npm run inhoudsvergelijk` (REV=512f0eb): **0 verdwenen**.
- **Speelcontrole** (F7=1, na herstel): GOED 75 stappen, ALLEFOUT 207 stappen, beide tot het eind, F7 0, F8 0. Vóór
  herstel: 72 en 196 stappen, ook F7 0, F8 0.
- **Eigen testscript** `scripts/test-dagen-gouden.mjs`, alle routes (kleur, goed, fouten, allefout, anderefout, weer,
  vangnet, wachten, tik-door, woorden) plus een nieuwe route **mistvangnet**: elke route tot de eindkaart, **nooit op de
  pijl hoeven tikken, 0 stukken die op een tik wachten**. Rondje bij een fout 34 / 16 / 17 keer, **0 keer om het
  antwoord**. "Weer" 17 van 17. Hulphandje alleen bij opdrachten (7,6–7,8 s na het begin, ± 6 s na de zin); bij
  keuzevragen 0 keer iets. Tik op de pijl: binnen 67–159 ms iets nieuws. Einde zin → volgend stuk gemiddeld 720–804 ms,
  nooit buiten 550–950 ms.
- **Vangnet slepen (45 s):** niets gedaan bij "Er mist een dag": na 45 s "Ik help je met deze.", dan samen (buren, de
  dag), en de opdrachtregel komt terug als opdracht **zonder pijl** ("Sleep jij woensdag naar de lege plek?").
- **Overlap en sprongen** (ONTWERP=1, alles fout, na herstel) op 1440 × 900, 1280 × 720, 1536 × 864 en 1024 × 768:
  0 overlap, 0 tekst buiten het vak, 0 sprongen, pijl nooit weg en terug, eindkaart 0 woorden eronder.
  Let op: 1 keer (route "fouten", zonder ONTWERP) mat het script 11 sprongen bij "Kom, we kijken samen." met het
  tekstvak op x = −810. Dat was terwijl een andere helper bestanden aanpaste (de ontwikkelversie bouwt dan opnieuw,
  LESRECEPT "Pas geen bestand aan terwijl een test loopt"). In 5 metingen daarna niet meer gezien.
- **Wit blijft wit** (site 3,5 s traag, 120 s): 3 keer een zin wit vóór Bliepo, **0 keer daarna weer grijs**.
- **Woord voor woord** (`IJK=1 scripts/test-woord-oplichten.mjs`, zichtbare Chrome, echte stem): 16/16 en 6/6 woorden
  apart opgelicht, grootste sprong 1 woord; per woord gemiddeld 115 ms naast het gesproken moment, 16 van 20 binnen
  ± 150 ms (grootste 460 ms; gedeeld spreekmodel, zelfde beeld als bij de andere gouden lessen).
- **Vloeiend** (`ALLEEN=squla-dagen-van-de-week-gouden npm run vloeiend`): laptop 60 beelden/s (langste beeld 32 ms),
  trage telefoon 59 beelden/s (29 ms). Mac in de energiebesparende stand en druk (zie open punt B).
- **Schermfoto's** bekeken als een kind van 6: hele weektrein, namen goed leesbaar, geen ogen of gezichtjes, geen kader
  om plaatjes; vinkje op de gekozen wagon (geen rand, geen gloed); rood rondje alleen om wat Bliepo noemt; bordje
  "vandaag" met gele pijl (F3); lege plek met stippellijn; kaarten onder de trein, nooit onder het tekstvak; eindkaart
  links; woorden grijs → wit → oranje.

## Per regel

| Regel | Uitkomst |
|---|---|
| 15.8 / 15.22 inhoud Squla, oude les blijft | goed (17 vragen, zelfde dagen en antwoorden) |
| 14.30 één juist antwoord of alle juiste | goed (weekend: zaterdag én zondag goed) |
| 15.9 / 14.36 fouttabel, waarheid | goed (65 rijen, alle zinnen nagelopen) |
| 15.17 hint verklapt niets | goed (rondje nooit om het antwoord; "vlak naast" alleen bij 2 buren) |
| 15.11 2 pogingen | goed |
| 15.18 nooit stoppen | goed (ook slepen 45 s en kleine stap 20 s) |
| 15.27 pijl, vanzelf door | goed (geen pijl bij vragen, opdrachten, handje, eindkaart) |
| 15.28 F7 / 15.29 F8 | 0 / 0 |
| 15.30 vaste zones | 0 overlap, 0 sprongen op 4 maten |
| 3.7 woorden per woord, F10 | goed |
| 3.15 knop 1 keer uitleggen | "Tik op de goede kaart." alleen bij de eerste kaartvraag |
| 3.20 cijfers / 2.1, 2.2, 14.27 kleur | goed (2, 1, 7 wit: verwijzen naar wagons van verschillende kleuren of naar niets) |
| 5.3 rood/groen, geen rood op de keuze | goed |
| 6.5 / 7.8a vinkje, geen gloed | goed (nog een tik haalt het vinkje weg) |
| 7.8 rondje (wagons) alleen als Bliepo iets noemt | goed |
| 15.19 hulphandje alleen bij opdrachten | goed |
| `killTweensOf` / onzichtbare kaarten | goed (na `killTweensOf` zet het vlak `setAlpha(1)` en de schaal terug; op alle foto's alles zichtbaar) |
| F3 bordje "vandaag" | goed |
| Herhaalde woorden | **na herstel 1, 2 en 3** |
| Harde regel 2 (database) | 147 → 147 |

## Gevonden en hersteld (alleen zinnen van Bliepo; geen vraag, dag of antwoord veranderd)

1. **KLEIN — 2 keer de dagnaam achter elkaar** in 18 eerste zinnen: "Je koos maandag. Maandag komt vóór dinsdag.",
   "Je sleepte vrijdag. Vrijdag hangt al ergens anders in de trein." De bouwer schreef zelf in LESRECEPT dat dit niet
   moet, maar had het maar in 1 zin hersteld. Nu: "Je koos maandag. **Die dag** komt vóór dinsdag.", "Je sleepte
   vrijdag. **Die dag** hangt al ergens anders in de trein." (zelfde betekenis).
2. **KLEIN — dezelfde zin 2 keer bij 1 vraag** (gisteren en morgen, 2 verschillende verre dagen): "Je koos maandag. Die
   dag ligt verder van vandaag af." en daarna "Nu koos je zondag. Die dag ligt verder van vandaag af." (LESRECEPT,
   keuring Tellen en Splitsen). Nu bij de 2e keer: "Je koos weer een dag die verder van vandaag af ligt." met
   "Gisteren is maar 1 dag geleden." / "Morgen is over 1 dag." (1 in wit). Het script had hiervoor alleen een
   opmerking, geen controle; die controle staat er nu in.
3. **KLEIN — 2 keer "Kom," achter elkaar** na het vangnet bij slepen: "Kom, ik help je met deze." "Kom, we kijken
   samen." Nu: "Ik help je met deze."

Na het herstel opnieuw: fouttabel-script, speelcontrole GOED en ALLEFOUT, routes allefout en weer (1440 × 900),
mistvangnet, overlap op 4 maten, wit blijft wit, woord voor woord, vloeiend: alles in orde.

## Open punten voor Sara (KEUZES Ronde 39)

**A. De 3 herstelde zinnen** (zie boven). Goed zo? Advies: **ja**.

**B. Vloeiend** gaf 60 / 59 beelden/s, maar de Mac stond in de energiebesparende stand en was erg druk (een andere
helper werkte tegelijk). Openen duurde in de ontwikkelversie 3,8 tot 10 s. Graag nog 1 keer meten op de echte site,
met de energiebesparing uit, vóór het online gaat.

**C. De keuzes van de bouwer (Ronde 38, punt 1 t/m 9)** staan nog open, vooral punt 9: deze les als gouden les Dagen
(de oude les volgt alleen het leerdoel van Squla) of liever squla-tijd-dagen-1.

## Dezelfde fout in andere gouden lessen

Gezocht in de fouttabellen van alle andere gouden lessen naar "2 keer hetzelfde woord achter elkaar" (Je koos X. X …):
**0 met een dagnaam**; wel 3 zinnen met een getal in Minsommen ("Je koos 3. 3 gaat eraf.", "Je koos 6. 6 gaat eraf.")
en Plussommen ("Je koos 7. 7 is te weinig."). Niet veranderd (al gekeurd; eerst Sara). De gouden les Tijd heeft deze
fouten niet.
