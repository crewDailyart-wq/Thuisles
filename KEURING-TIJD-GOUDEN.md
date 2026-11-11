# KEURING gouden les Tijd (squla-tijd-dagen-1-gouden, "Dagen van de week", level 1)

Onafhankelijke keurder (niet de bouwer), 11 november 2026, branch backup-squla, na commit 0d74091. Kind-test van de
bouwer: KINDTEST-TIJD-GOUDEN.md. Keuzes van de bouwer: KEUZES-VOOR-SARA.md Ronde 40. Mijn vragen: Ronde 41.

Geen betaald tegoed, niets online, oude lessen (regel 8) niet aangeraakt, geen helpers ingezet, niets in de database
geschreven. Getest als Testkind, Chrome met een leeg profiel en zonder koekje van een kind. `les_uitkomsten`: hoogste id
vóór en na alles **147**.

## UITSLAG

**GOEDGEKEURD** na 3 kleine herstellingen (zinnen, geen inhoud). De les werkt goed en volgt de regels.

Telling: 0 ernstig, 0 middel, **3 klein** (hersteld en opnieuw getest), **4 open punten voor Sara** (A t/m D).
De inhoud (vragen, dagen, kaarten, getallen, goede antwoorden, de 3 vragen die terugkomen) is niet veranderd.

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (vooral 2.1–2.2, 3.7, 3.15, 3.20, 3.23, 5.3, 6.5, 6.10, 7.8, 14.30–14.37,
  15.11–15.30), LESRECEPT.md (ook "Geleerd bij Tijd", "Geleerd bij Dagen", "Geleerd bij Vormen" en de keuring-blokken),
  FOUTEN-VOORBEELDEN.md (F1–F10), KEUZES Ronde 38 en 40, de fouttabel, KEURING-VORMEN-GOUDEN.md, de les, de zinnen, het
  nieuwe vlak en de oude les.
- **Inhoud gelijk aan de oude les:** zelf naast elkaar gelegd (squla-tijd.tsx `dagen1` met `eersteDag`, `laatsteDag`,
  `weekendHoeveel`, `weekendWelke`, `welkeNa`, `hoeveelWeek` tegen `VRAGEN` in squla-tijd-gouden-zinnen.ts): **12 vragen**
  in dezelfde volgorde: eerste dag (woensdag / maandag / zondag), laatste dag (zaterdag / dinsdag / zondag), hoeveel dagen
  weekend (1 / 2 / 5), welke dagen weekend (donderdag en vrijdag / zaterdag en zondag / zondag en maandag), 7 keer
  "Welke dag komt meteen na …?" (maandag, donderdag, woensdag, zaterdag, zondag, dan na "Hoeveel dagen heeft een week?"
  (6 / 7 / 8) nog dinsdag en vrijdag), met dezelfde 3 kaarten per vraag en hetzelfde goede antwoord. Daarna **3 vragen
  terug**: eerst wat niet meteen goed was, aangevuld met vraag 1, 3 en 9 (oude les: `speelAlles(l, opgaven, [0, 2, 8])`;
  gouden: `RESERVE = [0, 2, 8]`). Weekend = zaterdag én zondag (1 kaart met beide, telt als 1 goed antwoord).
  Niet overgenomen (zoals bij Geld, Vormen, Dagen): het voorbeeld "Kijk mee" na de startvraag; er is geen startvraag.
- `npm run opgaven`: in orde (506 oefeningen). `REV=a122522 NU=0d74091 node scripts/inhoudsvergelijk.mjs`: **0
  verdwenen**. (Tegen de werkmap meldt het script 8 "verdwenen" zinnen: die zitten in de gouden les Dagen, die een andere
  keurder op dit moment aanpast. Niet van deze les.)
- **Fouttabel-script** `npx tsx scripts/fouttabel-tijd-gouden.ts` (na de herstellingen): 12 vragen + hun terugkomende
  versie, 48 foute antwoorden, 240 beweringen, 524 zinnen op kale cijfers: in orde. Daarnaast zelf **elke** eerste zin,
  hint, uitleg en "weer"-zin van de 48 rijen nagelopen: elke zin is waar voor dat antwoord, geen hint noemt het goede
  antwoord, na elke eerste zin blijven 2 keuzes over. Weekend: overal zaterdag én zondag ("Op allebei de dagen van het
  weekend ben je vrij.", "Daarna komen zaterdag en zondag. Dat zijn 2 dagen zonder school.").
- **Eigen herhalingscheck** (scratchpad, alle paren foute antwoorden per vraag, 1e fout = eerste zin + hint, 2e fout =
  "Nu koos je …"/"Je koos weer …" + uitleg): zie de 3 herstellingen en open punt B.
- **Speelcontrole** (`F7=1`, na de herstellingen): GOED 53 stappen, tot het eind, F7 0, F8 0 (31 uitingen); ALLEFOUT 168
  stappen, tot het eind, F7 0, F8 0 (125 uitingen).
- **Eigen testscript** `scripts/test-tijd-gouden.mjs` (nepstem, na de herstellingen), routes goed, fouten, allefout,
  anderefout, weer, vangnet, wachten, tik-door, kleur: alles in orde, elke route tot de eindkaart, **nooit op de pijl
  hoeven tikken, 0 stukken die op een tik wachten**. Rondje bij een fout 12 / 24 / 12 / 3 keer, **0 keer om het
  antwoord**. "Weer" 15 van 15. Vangnet 2 keer ("Kijk, maandag is …", "Kijk, zondag is …", geen "Ja"). Hulphandje alleen
  bij de kleine stap (7,4 s na het begin van "Tik jij op de kaart van maandag?"), bij keuzevragen 0 keer iets. Tik op de
  pijl: binnen 42–200 ms iets nieuws. Getallen in de tekst wit (2, 7, 3).
- **Tempo:** einde zin → volgend stuk gemiddeld 722–827 ms, 1 keer 1038 ms (1536 × 864, drukke Mac), verder nooit buiten
  550–950 ms.
- **Overlap en sprongen** (ONTWERP=1, route alles fout): 1440 × 900 (alle routes), 1280 × 720, 1536 × 864 en 1024 × 768:
  steeds 0 overlap, 0 tekst buiten het vak, 0 sprongen (tekstvak, eerste regel, pijl, Bliepo), pijl nooit weg en terug,
  eindkaart 0 woorden eronder. Trein 22 px links van het tekstvak (1440 × 900).
- **Wit blijft wit** (`scripts/test-wit-blijft-wit.mjs`, site 3,5 s traag, 120 s): 2 keer een zin wit vóór Bliepo, **0
  keer daarna weer grijs**. (Liep tegelijk met de test van een andere helper; deze meting hangt niet van snelheid af.)
- **Woord voor woord** (`IJK=1 LESSEN=squla-tijd-dagen-1-gouden node scripts/test-woord-oplichten.mjs`, zichtbare
  Chrome, echte Google-stem; de les ging deze keer gewoon open): **19/19 en 13/13 woorden apart opgelicht**, grootste
  sprong 1 woord, eerste woord 64–79 ms na de start. Per woord gemiddeld 238 ms naast het gesproken moment, 10 van 30
  binnen ± 150 ms (grootste 846 ms). Zelfde beeld als bij Geld, Vormen en Dagen: dat komt uit het gedeelde spreekmodel
  van de Google-stem, niet uit deze les (echte woordtijden komen met Ruth).
- **Vloeiend** (`ALLEEN=squla-tijd-dagen-1-gouden npm run vloeiend`): laptop **57 beelden/s, langste beeld 49 ms**,
  trage telefoon **60 beelden/s, langste beeld 44 ms**: in orde. Openen in de ontwikkelversie 3,3 s / 4,6 s (alleen een
  waarschuwing; op de echte site moet het onder 1 s). Eerlijkheid: de Mac stond in de **energiebesparende stand en op de
  batterij** (`pmset`: lowpowermode 1), en de helper van Rekentaal startte steeds zijn eigen Chrome-tests. Een eerste
  meting liep per ongeluk tegelijk met zo'n test (laptop 59 beelden/s, 1 keer 61 ms): die telt niet. Zie open punt D.
- **Schermfoto's** van elke vraag, elke hint, elk samen voordoen en de eindkaart bekeken als een kind van 6 (± 230
  foto's): de wagons en de locomotief gloeien, geen ogen of gezichtjes, geen kader om plaatjes; vinkje op de gekozen
  kaart zonder rand of gloed; rood rondje alleen om wat Bliepo noemt (bij het samen voordoen 1 rondje om zaterdag en
  zondag samen, 1 om de goede kaart); woorden grijs → wit → oranje; eindkaart links van het tekstvak.

## Per regel

| Regel | Uitkomst |
|---|---|
| 15.8 / 15.22 inhoud Squla, oude les blijft | goed (12 vragen + 3 terug, zelfde kaarten en antwoorden) |
| 14.30 één juist antwoord | goed (3 keuzes, 1 goed; weekend = 1 kaart met zaterdag én zondag) |
| 15.9 / 14.36 fouttabel, waarheid | goed (48 rijen; alle zinnen zelf nagelopen) |
| 15.17 hint verklapt niets | goed (rondje nooit om het antwoord; na elke eerste zin 2 keuzes over); zie open punt A |
| 15.11 2 pogingen | goed (1e: zin + hint, opnieuw; 2e: uitleg + samen voordoen, door) |
| 15.18 nooit stoppen | goed (ook vangnet 20 s) |
| 15.27 pijl, vanzelf door | goed (geen pijl bij vraag, opdracht, hulphandje en eindkaart) |
| 15.28 F7 / 15.29 F8 | 0 / 0 |
| 15.30 vaste zones | 0 overlap, 0 sprongen op 4 maten |
| 3.7 woorden per woord, F10 | goed (19/19, 13/13 apart; afwijking per woord: gedeelde stem) |
| 3.15 knop 1 keer uitleggen | "Tik op de goede kaart." alleen bij de eerste kaartvraag |
| 3.17 naam | groet + hooguit 1 lof |
| 3.20 cijfers | goed (geen kaal cijfer in 524 zinnen) |
| 2.1 / 2.2 / 14.20 kleur getal | goed (wit: de getallen wijzen naar wagons van verschillende kleuren of naar niets) |
| 3.12 / 14.25 woorden kloppen met beeld | goed |
| 5.3 rood/groen, geen rood op de keuze | goed |
| 6.5 / 7.8a vinkje, geen gloed | goed (nog een tik haalt het vinkje weg) |
| 7.8 rondje alleen als Bliepo iets noemt | goed (geen rondje om alle 7 wagons) |
| 6.10 / 15.19 hulphandje | goed (alleen bij de kleine stap op een kaart, nooit bij kiezen) |
| `killTweensOf` / onzichtbare kaarten | niet van toepassing: dit vlak gebruikt geen `killTweensOf` (er wordt niet gesleept); op alle foto's zijn alle kaarten zichtbaar |
| 1.1 / 1.2 geen mensen, geen ogen | goed |
| 10.1 vloeiend | 57 / 60 beelden/s, langste beeld 49 / 44 ms (energiebesparing aan; zie D) |
| Harde regel 1 (oude les) | goed: commit 0d74091 heeft 0 regels weggehaald; squla-tijd.tsx, squla-tijd-trein.tsx en squla-dagen-trein.tsx ongewijzigd |
| Harde regel 2 (database) | 147 → 147 |

## Gevonden en hersteld

Alle 3 in `src/components/les/lessen/squla-tijd-gouden-zinnen.ts` (de controle in `scripts/fouttabel-tijd-gouden.ts` is
meeveranderd; FOUTTABEL-squla-tijd-dagen-1-gouden.md opnieuw gemaakt). Geen inhoud, geen antwoord veranderd.

1. **KLEIN — 2 keer hetzelfde getal in 1 zin** (LESRECEPT, geleerd bij Tijd: "ook een getal niet 2 keer"): "Je koos 5.
   Op 5 dagen ga je naar school." Nu: "Je koos 5. Op zoveel dagen ga je naar school." (vraag 3 en zijn terugkomende
   versie, 1e en 2e fout).
2. **KLEIN — 2 keer "weer" in 1 reactie** bij hetzelfde foute antwoord 2 keer: "Je koos weer 1. Na vrijdag is er geen
   school meer, tot het weer maandag is." Nu: "… tot het maandag is." (vraag 3 en terug).
3. **KLEIN — idem:** "Je koos weer dinsdag. Na zondag begint de week weer vooraan in de trein." Nu: "Na zondag begint
   de week opnieuw vooraan in de trein." (vraag 9 en terug).

Daarna opnieuw: fouttabel-script, speelcontrole GOED en ALLEFOUT, alle routes van het eigen testscript en overlap op 4
maten: in orde (de cijfers hierboven zijn van ná de herstellingen).

## Open punten voor Sara (KEUZES Ronde 41)

**A. De hint bij "Wat is de laatste dag van de week?" als die terugkomt** is: "Na de laatste dag begint een nieuwe week.
Wat is de laatste dag van de week?". Die klopt, maar helpt het kind niet echt (hij zegt alleen wat de vraag al zegt).
Advies: **vervangen** door bijvoorbeeld "Na de laatste dag komt weer maandag. Wat is de laatste dag van de week?".

**B. Bij een 2e fout met een ander antwoord** zegt Bliepo bij "Welke dag komt meteen na …?" bijvoorbeeld: "Nu koos je
woensdag. Die komt niet meteen na maandag. Meteen na maandag komt de dag die er direct achter hangt." Dat is 2 keer
"meteen na maandag" achter elkaar. Ik heb het niet veranderd: zonder de dagnaam ("Meteen na is de dag die er direct
achter hangt.") weet een kind bij "Je koos weer woensdag." niet meer achter welke dag. Laten zo? Advies: **laten zo**
(de dag van de vraag mag terugkomen; het is duidelijk).

**C. "Je koos zondag. Die komt vóór maandag."** (vraag "Welke dag komt meteen na maandag?"). Dat klopt (de zondag vóór
een maandag), maar in de weektrein hangt zondag achteraan. Laten zo? Advies: **laten zo** (vraag 9 leert dat na zondag
weer maandag komt).

**D. Vloeiend:** gemeten 57 / 60 beelden/s (in orde), maar met de energiebesparing aan en op de batterij; graag nog 1 keer meten met de stekker erin en de energiebesparing uit, vóór het online
gaat.

**Ronde 40 punt 6 (kleine stap bij een getal):** ik vind het redelijk. Het kind ziet de hele trein met 1 rondje om
zaterdag en zondag (of telt met Bliepo de 7 wagons) en tikt dan het enige getal dat er staat. Dat is dezelfde kleine stap
als bij de klokles. Advies: **ja, laten zo**.

**Om te weten (niet als fout geteld):**
- "Dat zijn 7 wagons: 7 dagen." (samen voordoen bij "Hoeveel dagen heeft een week?") noemt 2 keer 7. Dat is bewust: het
  koppelt de wagons aan de dagen, ná het antwoord.
- Bij "Hoeveel dagen heeft het weekend?" als die terugkomt: "Je koos 1. Het weekend is langer dan dat. Het weekend zijn
  de vrije dagen. Hoeveel dagen heeft het weekend?" Het woord "weekend" is het onderwerp van de vraag (schoolterm).
- De gouden les Dagen (andere keurder) zegt "Je koos dinsdag. Dinsdag komt vóór woensdag." (gemeld door de bouwer) en
  heeft ook de zin "Na zondag begint de week weer vooraan in de trein."; als daar "Je koos weer …" voor komt, is het 2
  keer "weer". Alleen gemeld, niet aangeraakt.

## Dezelfde fout in andere gouden lessen

Gezocht in de 11 andere gouden lessen naar "2 keer hetzelfde getal in de eerste zin" (`Je koos/telde/legde …` met 2 keer
hetzelfde getal): **0 gevonden**. "Weer" in een uitleg na "Je koos weer …": alleen mogelijk in de gouden les Dagen (zie
hierboven, gemeld aan de coördinator). Niets veranderd in andere lessen.
