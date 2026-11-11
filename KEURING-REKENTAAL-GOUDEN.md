# KEURING gouden les Rekentaal (squla-rekentaal-gouden, "Groot en klein, vol en leeg")

Onafhankelijke keurder (niet de bouwer), 11 november 2026, branch backup-squla, na commit 281843d. Kind-test van de
bouwer: KINDTEST-REKENTAAL-GOUDEN.md. Keuzes van de bouwer: KEUZES-VOOR-SARA.md Ronde 42. Mijn vragen: Ronde 43.

Geen betaald tegoed, niets online, oude lessen (regel 8) niet aangeraakt, geen helpers ingezet, niets in de database
geschreven. Getest als Testkind, Chrome met een leeg profiel en zonder koekje van een kind. `les_uitkomsten`: hoogste id
vóór en na alles **147**.

## UITSLAG

**GOEDGEKEURD** na 4 kleine herstellingen (alleen hints en 1 zin van Bliepo; geen inhoud, geen antwoord).

Telling: 0 ernstig, 0 middel, **4 klein** (hersteld en opnieuw getest), **5 open punten voor Sara** (A t/m E).
De inhoud (16 vragen, voorwerpen, maten, keuzes, goede antwoorden, 2 keer op volgorde) is niet veranderd.

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (vooral 3.7, 3.12, 5.3, 6.5, 7.8, 14.30–14.37, 15.9–15.30), LESRECEPT.md (ook
  "Geleerd bij Rekentaal" en de keuring-blokken Vormen, Dagen, Tijd), BLIEPO-KARAKTER.md, FOUTEN-VOORBEELDEN.md (F1–F10),
  WOORDEN-GROEP3.md, KEUZES Ronde 20–42, de fouttabel, KEURING-TIJD-GOUDEN.md, de les, de zinnen, het nieuwe vlak en de
  oude les.
- **Inhoud gelijk aan de oude les:** zelf naast elkaar gelegd (squla-rekentaal.tsx `vragenKeuken`/`vragenPicknick` tegen
  `VRAGEN`): **16 vragen** in dezelfde volgorde. Keuken: groter (pannenkoek 0,6 / 0,95 → groot), kleiner (beker 1,05 /
  0,65 → klein), vol, leeg, zwaarder (appel / meloen, meloen zakt), lichter (zak meel / aardbei, zak zakt → aardbei),
  langer (sliert 330 / 640), korter (600 / 400). Picknick: het grootst (mand 0,85 / 1,12 / 0,6), half vol (vol / leeg /
  half), het kleinst (appel 1,35 / 0,7 / 1), het langst (broodje 300 / 640 / 470), zwaarder (lege mand / meloen →
  meloen), het kortst (450 / 620 / 270), op volgorde appels (k, m, g) en bekers (k, m, g). Zelfde ids, maten en goede
  antwoorden. Niet overgenomen (zoals Geld, Vormen, Dagen, Tijd): de startvraag en de uitleg na Nee.
- **Harde regel 1:** commit 281843d haalde 1 regel weg: de kop "Rekentaal (1)" in public/alle-lessen.html werd
  "Rekentaal (2)" (de nieuwe les erbij). squla-rekentaal.tsx en squla-rekentaal-keuken.tsx zijn sinds 34ac9eb (8 nov)
  niet veranderd. `REV=fea6c0d NU=281843d node scripts/inhoudsvergelijk.mjs`: **0 verdwenen**; na mijn herstel tegen de
  werkmap ook 0.
- `npm run opgaven`: in orde (506 oefeningen, 7590 opgaven). Typecontrole: geen fouten in src.
- **Fouttabel-script** `npx tsx scripts/fouttabel-rekentaal-gouden.ts` (na herstel): 16 vragen, 29 foute antwoorden,
  153 beweringen, 385 zinnen op kale cijfers: in orde. Daarnaast zelf **elke** eerste zin, hint, uitleg, "weer"-zin en
  samen-zin van de 29 rijen nagelopen tegen het beeld en de woordenlijst (zie de 4 herstellingen).
- **Speelcontrole** (`F7=1`, na herstel): GOED 81 stappen, tot het eind, F7 0, F8 0 (47 uitingen); ALLEFOUT 191 stappen,
  tot het eind, F7 0, F8 0 (123 uitingen).
- **Eigen testscript** `scripts/test-rekentaal-gouden.mjs` (nepstem, alle routes, na herstel): kleur, goed, fouten,
  allefout, anderefout, weer, vangnet, volgvangnet, wachten, tik-door, woorden: **Alles in orde**, elke route tot de
  eindkaart, nooit op de pijl hoeven tikken, 0 stukken die op een tik wachten. Rondje bij een fout 16 / 32 / 16 keer,
  **0 keer om het antwoord**. "Weer" 16 van 16. Vangnet kleine stap 3 keer ("Kijk, deze pannenkoek is groter.", geen
  "Ja"). Vangnet op volgorde (45 s): "Ik help je met deze." → samen; de opdrachtregel komt terug als opdracht zonder pijl
  ("Tik jij op de grootste appel?"). Hulphandje: kleine stap 7,6 s na het begin van de opdracht, op volgorde 8,6 s (bij
  de eerste lege plek); bij keuzevragen **0 keer** iets tijdens 9 s wachten. Einde zin → volgend stuk gemiddeld 722–834
  ms, nooit buiten 550–950 ms.
- **Overlap en sprongen** (ONTWERP, route alles fout) op 1440 × 900 (alle routes), 1280 × 720, 1536 × 864 en 1024 × 768:
  steeds 0 overlap, 0 tekst buiten het vak, 0 sprongen (tekstvak, eerste regel, pijl, Bliepo), pijl nooit weg en terug,
  eindkaart 0 woorden eronder.
- **Schermfoto's** (98 stuks, route alles fout, ná herstel) bekeken als een kind van 6: zie hieronder.
- **Wit blijft wit** (`LESSEN=squla-rekentaal-gouden DUUR=120 node scripts/test-wit-blijft-wit.mjs`, site 3,5 s traag):
  4 keer een zin wit vóór Bliepo, **0 keer daarna weer grijs**. (De eerste poging kon Chrome niet bereiken; opnieuw
  gedraaid, toen in orde.)
- **Woord voor woord** (`IJK=1 LESSEN=squla-rekentaal-gouden node scripts/test-woord-oplichten.mjs`, zichtbare Chrome,
  echte Google-stem): **13/13 en 6/6 woorden apart opgelicht**, grootste sprong 1 woord, eerste woord 66–80 ms na de
  start. Per woord gemiddeld 152 ms naast het gesproken moment, 11 van 17 binnen ± 150 ms (grootste 463 ms). Zelfde beeld
  als bij de andere gouden lessen: dat komt uit het gedeelde spreekmodel van de Google-stem, niet uit deze les.
- **Vloeiend** (`ALLEEN=squla-rekentaal-gouden npm run vloeiend`, 4 keer): laptop 58–60 beelden/s, langste beeld 36, 62,
  52 en 45 ms; trage telefoon 57–60 beelden/s, langste beeld 54, 49, 48 en 61 ms. Eerlijkheid: de Mac was **nooit rustig**
  (belasting 10 tot 220: andere helpers draaiden speelcontrole en test-plussommen-gouden.mjs) en stond in de
  **energiebesparende stand** (`lowpowermode 1`). Deze cijfers tellen dus niet als bewijs, en ook niet als afkeuring: mijn
  herstel raakt alleen tekst, niet het beeld; de bouwer mat bij minder drukte 25–43 ms. Zie open punt E.

## Wat ik zag (als kind)

- Dezelfde tekeningen als de oude les; geen ogen, geen gezichtjes, geen mensen, geen kader om een plaatje.
- De weegschaal kantelt naar de zware kant: bij vraag 13 zakt de meloen en hangt de grote lege mand hoog. "Die is groot,
  maar hangt hoger." klopt met het beeld. Groot/klein, vol/leeg/half vol en lang/kort kloppen op elke foto met de zin.
- Bij lang en kort beginnen alle slierten en broodjes bij de gestippelde streep.
- Gekozen voorwerp: alleen een groen vinkje, geen rand, geen gloed. Op de weegschaal staat het vinkje op de balk naast de
  mand; nog duidelijk.
- Rood rondje alleen om wat Bliepo noemt; bij het langste broodje is het breed (tot x ± 925), maar blijft links van het
  tekstvak.
- Op volgorde: de plekken op de plank worden van links naar rechts groter; een gezette beker staat in zijn plek.
- Woorden: nog niet gezegd grijs, gezegd wit, het woord van nu oranje (foto hint vraag 16, vraag samen 12).
- Eindkaart links van het tekstvak, geen pijl, "Tik op de kaart."

## Per regel

| Regel | Uitkomst |
|---|---|
| 15.8 / 15.22 inhoud Squla, oude les blijft | goed (16 vragen, zelfde voorwerpen, maten en antwoorden) |
| 14.30 één juist antwoord | goed (1 goed voorwerp; op volgorde 1 goede volgorde) |
| 15.9 / 14.36 fouttabel, waarheid | goed na herstel 3 en 4 (29 rijen; alle zinnen zelf nagelopen) |
| 15.17 hint verklapt niets | goed (rondje nooit om het antwoord; bij 3 voorwerpen 2 over na de eerste zin; vraag 1–8 en 13: zie open punt A) |
| 15.11 2 pogingen | goed (1e: zin + hint, opnieuw; 2e: uitleg + samen voordoen, door) |
| 15.18 nooit stoppen | goed (vangnet 20 s en 45 s) |
| 15.27 pijl, vanzelf door | goed (geen pijl bij vraag, opdracht, hulphandje en eindkaart) |
| 15.28 F7 / 15.29 F8 | 0 / 0 |
| 15.30 vaste zones | 0 overlap, 0 sprongen op 4 maten |
| 3.7 woorden per woord, F10 | goed (13/13, 6/6 apart; afwijking per woord: gedeelde stem) |
| 15.28 wit blijft wit | 4 keer wit vóór Bliepo, 0 keer weer grijs |
| 3.12 / 14.25 woorden kloppen met beeld | goed na herstel 2 ("Er staat nog een kleinere" bij bekers) |
| 14.33 / WOORDEN-GROEP3 | goed na herstel 1 (geen "vergelijk" meer) |
| 3.20 cijfers | goed (geen getal in Bliepo's zinnen; geen kaal cijfer in 385 zinnen) |
| 5.3 rood/groen, geen rood op de keuze | goed, met open punt B (rood rondje om wat het kind koos) |
| 6.5 / 7.8a vinkje, geen gloed | goed (nog een tik haalt het vinkje weg) |
| 7.8 rondje alleen als Bliepo iets noemt | goed (1 tegelijk) |
| 6.10 / 15.19 hulphandje | goed (alleen bij opdrachten; nooit op het goede voorwerp bij op volgorde) |
| `killTweensOf` / onzichtbare kaarten | goed: het vlak stopt alleen de eigen beweeg-tween (`getData("beweeg").stop()`), nooit `killTweensOf`; het rondje krijgt `setAlpha(1)`; op alle foto's zijn alle voorwerpen zichtbaar |
| 1.23 plek van het goede antwoord | goed (`schud` per vraag) |
| 1.1 / 1.2 geen mensen, geen ogen | goed |
| 10.1 vloeiend | niet rustig te meten (58–60 beelden/s, langste beeld 36–62 ms bij belasting 10–220 en energiebesparing); zie E |
| Harde regel 1 (oude les) | goed (zie boven) |
| Harde regel 2 (database) | 147 → 147 |

## Gevonden en hersteld

In `src/components/les/lessen/squla-rekentaal-gouden-zinnen.ts`; de waarheidscontrole in
`scripts/fouttabel-rekentaal-gouden.ts` is meeveranderd (en kent nu een controle op "vergelijk");
FOUTTABEL-squla-rekentaal-gouden.md opnieuw gemaakt. Geen inhoud, geen antwoord veranderd.

1. **KLEIN — "vergelijk" staat op de niet-lijst** (WOORDEN-GROEP3.md: "vergelijken (als werkwoord)", 14.33). Hints:
   "Vergelijk hoe breed ze zijn." (vraag 1), "Vergelijk ze allemaal met elkaar." (vraag 9 en 11), en de reserve "Vergelijk
   ze naast elkaar." (vraag 2). Nu: "Kijk hoe breed elke pannenkoek is.", "Kijk naar alle manden.", "Kijk naar alle
   appels.", "Kijk naar allebei de bekers." (elk gevolgd door de vraag).
2. **KLEIN — bekers liggen niet** (3.12): "Je begon met deze beker. Er ligt nog een kleinere." Nu bij bekers "Er staat nog
   een kleinere." (appels: "ligt" blijft).
3. **KLEIN — de hint bij op volgorde paste niet bij de denkfout** (15.9): wie de kleinste vooraan zette en daarna de
   grootste (`grootste-in-het-midden`), kreeg "Begin met de kleinste en pak dan steeds een grotere." of "Kijk welke het
   kleinst is." Dat had het kind al goed gedaan. Nu per denkfout: `grootste-in-het-midden` → "Tik steeds op de kleinste
   die nog over is."; `niet-bij-kleinste` → "Kijk welke het kleinst is." / "Zoek eerst de kleinste." (ook geen "Je begon …"
   + "Begin …" meer); `groot-naar-klein` houdt "Begin met de kleinste en pak dan steeds een grotere.". Altijd gevolgd door
   "Zet de … van klein naar groot.".
4. **KLEIN — dezelfde hint te vaak** (5.10, LESRECEPT "varieer de hint"): "Ze beginnen bij dezelfde streep." was de hint
   bij vraag 8, 12 en 14, en het samen voordoen zegt bij die vragen ook "De … beginnen bij dezelfde streep.". Een kind
   dat veel fouten maakt, hoorde het 6 keer. Nu bij vraag 8 "Kijk welke sliert als eerste ophoudt." en bij vraag 12
   "Kijk waar ze allemaal stoppen."; vraag 14 houdt de streep.

Daarna opnieuw: fouttabel-script, opgaven, inhoudsvergelijk, speelcontrole GOED en ALLEFOUT, alle routes van het eigen
testscript, overlap op 4 maten, schermfoto's, wit blijft wit, woord voor woord en vloeiend: in orde (de cijfers hierboven
zijn van ná het herstel).

## Open punten voor Sara (KEUZES Ronde 43)

**A. Vragen met 2 voorwerpen (vraag 1–8 en 13): de 2e poging is altijd goed.** Na de 1e fout blijft er maar 1 voorwerp
over, dus het kind kan niet nog eens fout kiezen; "goed na een fout" zegt dan weinig. Dat komt door de inhoud van Squla
(2 keuzes). Ik vind het aanvaardbaar: de hint leert hoe je kijkt, en toevoegen mag niet zonder Sara. Advies: **laten zo**
(Ronde 42 punt 7).

**B. Rood rondje om wat het kind koos.** Bij de 1e fout zegt Bliepo "Je koos deze mand." en staat er een rood rondje om
die mand. 5.3 zegt "geen rood rondje om de keuze van het kind"; 7.8 zegt "rondje om wat Bliepo noemt". Hier noemt Bliepo
het ("deze"), het rondje staat er alleen zolang hij het zegt, nooit om het antwoord, en Tijd, Dagen en Vormen doen het
net zo (goedgekeurd). Advies: **laten zo**, maar graag 1 keer jouw ja.

**C. "Kijk hoe hoog en hoe breed ze zijn." bij vraag 2** na "Hij is hoger en breder dan de andere.": geen woord letterlijk
2 keer, maar wel bijna hetzelfde. Laten zo? Advies: **laten zo** (de andere woorden zijn moeilijker of verklappen meer).

**D. Donkere ruimte** (Ronde 42 punt 8): de donkerblauwe randen zijn op de foto's iets minder scherp, maar de voorwerpen
zijn duidelijk. Advies: **laten zo**.

**E. Vloeiend nog 1 keer meten** met de stekker erin en de energiebesparing uit, vóór het online gaat (de Mac stond op
`lowpowermode 1`).

**Om te weten (niet als fout geteld):**
- Op volgorde zegt de opdracht "Tik eerst op de kleinste." (oude les); dat is een opdracht, geen knop-uitleg.
- "Nu wordt mijn scherm groen." kwam 1 keer als korte bevestiging na een fout (robotzin uit het rijtje; mag).
- Er draaien op de Mac nog oude wachtlussen van eerdere helpers (`until ! pgrep -f test-meten-gouden.mjs …`). Die vinden
  zichzelf met `pgrep -f` en stoppen nooit; ze tonen bij `pgrep -fl test-` een "lopende test" die er niet is. Niet van
  mij; niet gestopt.

## Dezelfde fout in andere gouden lessen

Gezocht in de 13 andere gouden lessen (alleen de zinnen-bestanden): "vergelijk" in een zin van Bliepo: **0 gevonden**
(alleen in opmerkingen). "Er ligt" bij iets wat staat: **0 gevonden**. Niets veranderd in andere lessen.
