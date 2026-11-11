# KEURING gouden les Geld (squla-geld-geldmachine-1-gouden, "Munten en briefjes")

Onafhankelijke keurder (niet de bouwer), 11 november 2026, branch backup-squla, na commit f682494. Kind-test van de
bouwer: KINDTEST-GELD-GOUDEN.md. Keuzes van de bouwer: KEUZES-VOOR-SARA.md Ronde 34. Mijn vragen: Ronde 35.

Geen betaald tegoed, niets online, oude lessen (regel 8) niet aangeraakt, geen helpers ingezet, niets in de database
geschreven. Getest als Testkind, Chrome met een leeg profiel en zonder koekje van een kind. `les_uitkomsten`: hoogste id
vóór en na alles **147**.

## UITSLAG

**GOEDGEKEURD** na 1 kleine herstelling (alleen een kleur). De les zelf werkt goed en volgt de regels.

**Maar:** er staat 1 **groot open punt voor Sara**: de briefjes. Dat is geen bouwfout van deze les (de oude geldles en
andere lessen gebruiken dezelfde plaatjes, en Sara koos ze op 3 november), maar het botst met CLAUDE.md en BOUWREGELS
9.1. Zie punt A hieronder en KEUZES Ronde 35. Zolang Sara daar niet over beslist heeft, mag deze les niet online.

Telling: 0 ernstig in de les, 0 middel, **1 klein** (hersteld en opnieuw getest), **3 open punten voor Sara**.
De inhoud (vragen, geld, keuzes, goede antwoorden) is niet veranderd.

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md (ook de geldregel), BOUWREGELS.md (vooral 2.1–2.2, 3.7, 3.15, 3.20, 9.1–9.3, 14.20–14.37,
  15.8–15.30), LESRECEPT.md (ook "Geleerd bij Geld"), BLIEPO-KARAKTER.md §4 Geld, FOUTEN-VOORBEELDEN.md (F1–F10), KEUZES
  Ronde 32 en 34, de fouttabel, KEURING-TELLEN-SPLITSEN-GOUDEN.md, de zinnen, de les, het vlak en de oude les.
- **Inhoud gelijk aan de oude les:** zelf naast elkaar gelegd (squla-geld.tsx `geldmachine1Opgaven` en reserve
  `[0, 3, 4]`): 12 vragen in dezelfde volgorde, hetzelfde geld, dezelfde keuzes en goede antwoorden; daarna 3 terug.
  In orde. De oude les is niet veranderd (`git diff eb7020f f682494` op squla-geld.tsx, het oude vlak en de css: leeg).
  Wijzigingen in de vraagzinnen: vraag 6 (gemeld in Ronde 34) en vraag 8 "door de ruimte" weg (niet gemeld; nu in
  Ronde 35 gezet).
- **Fouttabel-script** `npx tsx scripts/fouttabel-geld-gouden.ts`: 12 vragen, 25 foute antwoorden, 161 beweringen: in
  orde (ook na mijn herstelling). Daarnaast zelf **alle 53 paren** (1e fout, 2e fout) per vraag uitgeschreven en gelezen:
  elke zin is waar voor dat antwoord, geen hint noemt het goede geld, na elke hint blijven 2 keuzes over, bij een ander
  fout antwoord "Nu koos je …", bij dezelfde denkfout een "weer"-zin, geen opdracht bij de 2e fout, geen woord 2 keer in
  de eerste zinnen van 1 vraag.
- `npm run opgaven`: in orde. `npm run inhoudsvergelijk` (eb7020f → f682494 en werkmap): **0 verdwenen**.
- **Speelcontrole** (`node scripts/speelcontrole.mjs`, F7=1, na de herstelling): GOED 59 stappen, tot het eind, F7 0,
  F8 0 (48 uitingen); ALLEFOUT 175 stappen, tot het eind, F7 0, F8 0 (141 uitingen).
- **Eigen testscript** `scripts/test-geld-gouden.mjs` (nepstem), routes kleur, goed, fouten, allefout, anderefout,
  weer, vangnet, wachten: alles in orde, elke route tot de eindkaart, **nooit op de pijl hoeven tikken, 0 stukken die op
  een tik wachten**. Rondje bij een fout 13 / 15 / 3 keer, **0 keer om het antwoord**. "Weer" 15 van 15. Vangnet 3 keer
  ("Kijk, hier is …", geen "Ja"). Hulphandje alleen bij opdrachten (7,5 s na het begin van de opdracht, ± 6 s na de
  zin), bij keuzevragen 0 keer iets.
- **Tempo:** einde zin → volgend stuk gemiddeld 743–811 ms, kleinste 701, grootste 865; 0 buiten 550–950 ms.
- **Overlap en sprongen** (ONTWERP=1, route alles fout): 1440 × 900, 1280 × 720, 1536 × 864 en 1024 × 768: steeds 0
  overlap, 0 tekst buiten het vak, 0 sprongen (tekstvak, eerste regel, pijl, Bliepo), pijl nooit weg en terug, eindkaart
  0 woorden eronder. Speelvlak 64 px links van het tekstvak (1440 × 900).
- **Wit blijft wit** (`scripts/test-wit-blijft-wit.mjs`, site 3,5 s traag, 120 s): 3 keer een zin wit vóór Bliepo, **0
  keer daarna weer grijs**.
- **Woord voor woord** (`IJK=1 scripts/test-woord-oplichten.mjs`, zichtbare Chrome, echte Google-stem): 19/19 en 14/14
  woorden apart opgelicht, grootste sprong 1 woord, eerste woord 71–89 ms na de start. Per woord gemiddeld 212 ms naast
  het gesproken moment, 13 van 31 binnen ± 150 ms (grootste 569 ms). Zelfde uitkomst als de bouwer; dat komt uit het
  gedeelde spreekmodel van de Google-stem, niet uit deze les (precies wordt het met Ruth).
- **Vloeiend** (`ALLEEN=… npm run vloeiend`, niets anders draaide): laptop 60 beelden/s, langste beeld 42 ms; trage
  telefoon 58 beelden/s, 45 ms. Let op: de Mac stond in de **energiebesparende stand** (Low Power Mode); de meting was
  toch 58–60, dus niet de bekende valse 30. Openen in de ontwikkelversie 1,8 s / 2,7 s (op de echte site moet het onder
  1 s; nog niet gemeten).
- **Schermfoto's** van elke vraag, elke hint, elk samen voordoen en de eindkaart bekeken als een kind van 6.

## Per regel

| Regel | Uitkomst |
|---|---|
| 15.8 / 15.22 inhoud Squla, oude les blijft | goed |
| 14.30 één juist antwoord | goed (3 kaartjes of 3 knoppen, 1 goed; zwevende munten: alle 3 munten van 1 euro) |
| 15.9 / 14.36 fouttabel, waarheid | goed (25 rijen, 53 paren gelezen) |
| 15.17 hint verklapt niets | goed (rondje nooit om het antwoord; zoekgetal wit; handje bij de zwevende munten in de lege ruimte) |
| 15.11 2 pogingen | goed (1e: zin + hint, opnieuw; 2e: uitleg + samen voordoen, door) |
| 15.18 nooit stoppen | goed |
| 15.27 pijl, vanzelf door | goed |
| 15.28 F7 / 15.29 F8 | 0 / 0 |
| 15.30 vaste zones | 0 overlap, 0 sprongen op 4 maten |
| 3.7 woorden per woord, F10 | goed (afwijking per woord: gedeelde stem, zie boven) |
| 3.15 knop 1 keer uitleggen | "Tik erop." 1 keer; "Klaar? Tik dan op het vinkje." 1 keer (door het lesscherm) |
| 3.17 naam | groet + hooguit 1 lof |
| 3.20 cijfers | goed |
| 2.1 / 2.2 / 14.20 / 14.22 kleur getal | goed na herstelling 1 |
| 5.3 rood/groen, geen rood op de keuze | goed |
| 6.5 / 7.8a vinkje, geen gloed | goed (vinkje op het kaartje, nog een tik haalt het weg) |
| 7.8 rondje alleen als Bliepo iets noemt | goed (zie open punt C) |
| 6.10 / 15.19 hulphandje | goed (alleen opdrachten; nooit op een goede munt bij de opdracht zelf) |
| 15.13 punt 3 "volgende keer beter" | alleen bij veel fouten (gezien bij alles fout) |
| `killTweensOf` / onzichtbare kaarten | niet van toepassing: het geldvlak gebruikt geen `killTweensOf`; op de foto's is elk kaartje zichtbaar |
| 1.1 / 1.2 geen mensen, geen ogen | goed (de knoop heeft 4 gaatjes, geen gezicht) |
| **9.1 / CLAUDE.md geld** | **niet volgens de regel: zie A (besluit Sara)** |
| 10.1 vloeiend | goed (58–60 beelden/s) |
| Harde regel 2 (database) | 147 → 147 |

## Gevonden en hersteld

1. **KLEIN — de 3 in "Er zweven 3 munten van 1 euro." was wit** (vraag 8). De 3 verwijst naar de munten, dus hoort hij
   in de kleur van de munten (2.2, 14.20; in de lofzin "Ja, je vond ze alle 3." was hij al geel). Het gezochte bedrag
   (de 1) blijft wit (14.22). Herstel in `squla-geld-gouden-zinnen.ts` (`bellenIntro`). Daarna opnieuw: fouttabel-script,
   speelcontrole GOED en ALLEFOUT, route kleur: in orde.

## Open punten voor Sara (KEUZES Ronde 35)

**A. De briefjes (groot).** De bouwer schreef "vlak getekende briefjes". Dat klopt niet: het zijn **bijna echte
afbeeldingen van de echte briefjes** (met handtekening, sterren, gebouw, veiligheidsstrook), **zonder "SPECIMEN"**, in
hoge resolutie (1 PNG van 2,5 MB in elk SVG-bestand in public/geld/getekend/). CLAUDE.md en BOUWREGELS 9.1 zeggen:
ECB-specimen 72 dpi, met "SPECIMEN" erop; volgens besluit ECB/2013/10 mag een briefje op een website alleen zo.
Daarnaast staat er op het briefje van 10 euro rechts een "8" (een foutje in het plaatje), terwijl Bliepo zegt "Lees het
getal erop". Ik heb niets veranderd (regel 3). Dezelfde plaatjes zitten in de oude geldlessen, Minsommen en Splitsen.

**B. Een zacht vak met een dunne rand om het ene geld bij "Wat is dit?".** Het is heel licht, maar het lijkt op een
kader om geld (CLAUDE.md: "nooit een kader om geld"). Het komt uit het oude geldvlak (jouw proef van 2 november); de
oude les heeft het ook. Niets veranderd.

**C. Het rode rondje bij "Wat is dit?" blijft staan** zolang het kind na de hint opnieuw kiest (niet alleen zolang
Bliepo praat). Het staat om het geld in beeld, niet om het antwoord (een knop). Ik vind het niet fout, maar het wijkt
een beetje af van 7.8 ("zolang Bliepo erover praat").

**Om te weten:** bij dezelfde denkfout 2 keer bij munten herhaalt de "weer"-zin deels de 1e zin (vraag 6: "… is goud in
het midden" en daarna "… die van 2 euro is goud"). Er komt wel iets nieuws bij (de andere munt), en daarna doet Bliepo
het meteen samen voor. Niet als fout geteld.

## Dezelfde fout in andere gouden lessen

Niet nagelopen (geen fout die Sara aanwees). De briefjes (A) zitten in alle lessen die public/geld/getekend/ gebruiken:
de oude geldlessen, Minsommen en Splitsen (alleen gemeld, niets veranderd).
