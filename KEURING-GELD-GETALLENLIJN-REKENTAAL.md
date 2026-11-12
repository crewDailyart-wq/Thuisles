# KEURING Geld, Getallenlijn en Rekentaal (wijzigingen uit commit 4c38ca4)

Onafhankelijke keurder, 12 november 2026, branch backup-squla. Niets veranderd aan lessen, niets online, geen helpers,
hoogste id `les_uitkomsten` voor en na: **147**. Getest als Testkind. Sara besloot: haar getekende speelgeld blijft,
zonder "SPECIMEN" (niet als fout gemeld).

## UITSLAG

| Les | Uitslag |
|---|---|
| Geld (squla-geld-geldmachine-1-gouden) | GOEDGEKEURD |
| Getallenlijn (squla-getallenlijn-kat-1-gouden) | GOEDGEKEURD |
| Rekentaal (squla-rekentaal-gouden) | GOEDGEKEURD |

0 harde fouten. 1 vraag voor Sara.

## Hoe ik gekeurd heb

- `git show 4c38ca4` gelezen: `squla-geld-vlak.tsx` (opt-in `herstelBriefje` en `zonderPaneelVak`, eigen sleutel `b10h` in
  cache en texturen), `squla-geld-gouden-vlak.tsx`, `squla-getallenlijn-gouden-zinnen.ts` (`ster(n)` geeft `{n:geel}`),
  `squla-rekentaal-gouden-vlak.tsx` (`metLichteRand`, `LICHT_RAND = "#e4edff"`).
- Harde regel 1 (niets verdwijnt): het oorspronkelijke `briefje-10-euro.svg` bestaat nog; het herstelde briefje is
  een kopie (`briefje-10-euro-hersteld.svg`); oude lessen gebruiken de oude sleutel. De wijziging in `squla-geld-vlak.tsx`
  is opt-in; `REV=8a1ea6b node scripts/inhoudsvergelijk.mjs` geeft 0 verdwenen.
- Fouttabel-scripts: Geld (12 vragen, 25 foute antwoorden, 161 beweringen), Getallenlijn (15 vragen en de uitlegvraag,
  37 foute antwoorden, 83 beweringen), Rekentaal (16 vragen, 29 foute antwoorden, 153 beweringen, 385 zinnen op kale
  cijfers en lengte): alle "in orde". FOUTTABEL-bestanden onveranderd na regenereren.
- Testscripts: Geld `goed` (**Alles in orde**), Getallenlijn `goed` en `kleur` (**Alles in orde**), Rekentaal `goed`
  (**Alles in orde**); met schermfoto's. Alle: 0 keer op de pijl getikt, 0 overlap, 0 sprongen (behalve Getallenlijn,
  zie hieronder), F7 en F8 0, niets bijgekomen in `les_uitkomsten`.
- Speelcontrole GOED en ALLEFOUT: Geld 60 en 155 stappen, Getallenlijn 62 en 170, Rekentaal 69 en 171; allemaal tot
  het eind.

## Per wijziging

1. **Geld: het briefje van 10 euro zonder de losse 8, en geen vak om het geld bij "Wat is dit?".** GOED.
   Schermfoto "Hoeveel euro is dit?" (vraag 4): het briefje van 10 staat groot, vrij in de ruimte, zonder zacht vak
   en zonder losse 8; er staat alleen de "10" rechtsboven en linksonder op het briefje zelf. Bij "Waar zie je een briefje
   van 10 euro?" (vraag 9) staan de 3 briefjes wel in vakken: dat zijn keuzevakken (zoals in BOUWREGELS toegestaan).
   Test: "0 keer een rondje bij een fout, 0 keer om het antwoord".
2. **Getallenlijn: de 13 en 14 sterren zijn geel.** GOED. In de test van `kleur` komen alleen wit
   (`rgb(255, 255, 255)`) en geel (`rgb(255, 224, 102)`) voor. De getallen op de lijn blijven wit, alleen de sterren
   in het verhaaltje ("Gisteren vond het er {13:geel}", "Wat is meer: {13:geel} of {14:geel}?") zijn geel. Dat
   volgt BOUWREGELS 2.1 en 14.27 (kleur van het voorwerp).
3. **Rekentaal: lichte rand `#e4edff` langs de vorm.** GOED. Schermfoto's (pannenkoeken en weegschaal bekeken):
   een dunne lichte lijn langs de tekening zelf, geen vak, geen rechthoek, geen witte achtergrond. Gebakken
   in een hulpplaatje (één keer), niet elk beeld (harde regel 7).

## Opmerkingen (geen blokkade)

- Getallenlijn (test `goed`): "sprongen > 2 px: Bliepo 4": de robot beweegt 15 px bij een nieuwe zin
  ([1116,590,236] naar [1121,605,225]). De test noemt het "alleen meten"; tekstvak, eerste regel en pijl springen niet.
  Dit komt van Bliepo's houding (arm omhoog/omlaag), niet van de wijziging.
- Rekentaal: speelvlak meting "vlak: 113" (px voorbij de linkerrand van het tekstvak). Dat is de breedte van het hele
  Phaser-vlak, de tekeningen zelf staan op "ding: -154" en "rand: -22" (dus ruimte links van het tekstvak). Op de foto
  overlapt niets met de tekst.

## Vraag voor Sara

**V1.** In Rekentaal (foto "Welke pannenkoek is groter?") heeft de plank onder de pannenkoeken nu 2 lichte randen
(boven en onder). Je zegt "langs de vorm", dus het hoort zo, maar het ziet er een beetje uit als een kader. Zo laten?
Advies: ja.
