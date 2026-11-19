# Keuring gouden lessen — 19 november 2026

Onafhankelijke keurder. Er is **niets** in de lessen veranderd; dit is alleen een rapport.
Gekeurd: de 21 gouden lessen uit `public/alle-lessen.html`, op BOUWREGELS 15.17, 15.29, 15.31 t/m 15.37,
cijfers, grammatica/kindertaal en woorden-passen-bij-beeld.

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npm run opgaven` | goed |
| `REV=HEAD npm run inhoudsvergelijk` | goed: niets verdwenen |
| `npm run stemdubbel` | **2 meldingen**: de Ruth-opnames van "1." en "11." hebben het woord 2 keer (al bekend, F8; gouden lessen knippen het af) |
| 21 fouttabel-scripts | alle 21 goed (geen hint die het antwoord verklapt, waarheid klopt) |
| `node scripts/speelcontrole.mjs` GOED, alle 21 | 0 fouten; F11 (dubbele tekst) 0, F16 0, zweven Rekentaal 0 |
| `node scripts/speelcontrole.mjs` ALLEFOUT, alle 21 | **2 fouten (F16)**: Getallenlijn en Klok, zie hieronder |
| `node scripts/vraag-aanwezig-controle.mjs` | goed: alle 21 tonen "Tik op het scherm. Dan begint Bliepo." |
| `node scripts/zweef-controle.mjs` (Rekentaal) | goed |
| test-tellen/splitsen/plussommen-extra-gouden, route goed en allefout | alle 6 goed, tot de eindkaart, database niets bijgekomen |
| `npm run bewaak` | zie onderaan |
| Grep disco/luidspreker/draaitafel (15.35) | leeg: goed |
| Grep "vinkje" in gesproken zinnen (15.37 punt 2) | geen: goed |
| Getallen in woorden (één, twee, drie …) in zichtbare zinnen | geen (alleen in code-namen en het ouderverslag "goed in één keer") |

Schermfoto's en logboeken: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keur/`.

## Per les

1. **Dagen van de week** — goed.
2. **Geld** — goed.
3. **Getallenlijn** — **afgekeurd (F16, 15.37)** in de foutroute: bij het begin stond 3 s alleen "Hoi Testkind! Fijn dat je er bent." wit in beeld, met Ja/Nee al tikbaar; de startvraag stond nog gedimd (nog niet gezegd). `squla-getallenlijn-gouden.tsx:941-944` (Ja/Nee komen al vóór de groet en de vraag zijn uitgesproken). In de goede route ging het wel goed: het gebeurt dus niet altijd. In het stemlogboek staat de groet 2 keer; dat moet in een zichtbare Chrome met echte stem nagekeken worden (mogelijk F8).
4. **Huisnummers** — goed.
5. **Klok** — **afgekeurd (F16)**, zelfde als Getallenlijn: groet wit, "Kun jij al klokkijken?" nog gedimd, Ja/Nee al tikbaar; groet 2 keer in het logboek (schermfoto `foto-fout/squla-klok-hoelaat-1-gouden/f16-01.jpg`). Verder: de getallenlijn bij "Tik op een getal op de lijn." staat in een wit vak met zwarte cijfers (twijfel 15.33/2.1, zie beslissingen).
6. **Meer-minder** — goed.
7. **Meten** — goed op de regels; let op: na een keuze krijgt het gekozen kaartje een vinkje én een gloed om plaatje en woord (foto `foto-goed/squla-meten-oppervlakte-1-gouden/003.jpg`); 7.8 zegt "alleen een vinkje". Kaartjes staan links onder het beeld, niet rechts (15.32-uitzondering? zie beslissingen).
8. **Minsommen** — goed.
9. **Plussommen** — goed. Kleine taalopmerking: "Welk antwoord hoort bij elke som? Tik ze weer aan." — "Tik ze weer aan" is vaag (15.36). `squla-plussommen-gouden-zinnen.ts:181`. (In de foutroute kon de automatische speler het verbinden niet afmaken; geen les-fout.)
10. **Plussommen extra** — goed (extra-test goed en allefout). Taal: "Kies maar een tegel, welke je wilt." is wat stroef.
11. **Rekenmix 1** — goed.
12. **Rekenmix 2** — goed op de lesregels. `npm run bewaak` (vloeiend): trage telefoon 1 hapering van 57 ms (grens 50 ms); mogelijk door de drukte op de laptop, opnieuw meten als de computer rustig is.
13. **Rekenmix 3** — goed op de regels; twijfel kleur (2.1): in de zin is het totaal 7 rood (kleur van de ballen), in het splitsbeen is het totaal wit en het deel 4 rood. Zelfde kleur, ander getal. `squla-rekenmix3-gouden-zinnen.ts:115` en `vlakken/squla-rekenmix-gouden-vlak.tsx:336-337`.
14. **Rekenmix 4** — goed. ("satellieten" is een moeilijk woord voor groep 3; twijfel.)
15. **Rekentaal** — **afgekeurd op beeld (15.33/15.34)**: (a) om de weegschaal, de doos/het kleed en het hout zit een duidelijke lichte gloed langs de rand (`vlakken/squla-rekentaal-gouden-vlak.tsx:84-90` GLOED, `:643-645`); 15.33 noemt "gloed in de randkleur" om tafel/kleed uitdrukkelijk. (b) bij "Welk broodje is het langst?" steekt het lange broodje rechts buiten het kleed, en de gele startstreep staat links naast het kleed (foto `foto-goed/squla-rekentaal-gouden/012.jpg`). De zweef-controle ziet dit niet (meet alleen de onderkant). Let op: de lichte rand `LICHT_RAND` (`:422-455`) wordt alleen nog gebruikt als de Magnific-plaatjes niet laden.
16. **Splitsen** — goed op de regels; heeft een startvraag ("Kun jij deze 5 pionnen al splitsen?"), terwijl BOUWREGELS 4 / T21 zegt "alleen de klok" (zie beslissingen). Kleine beeldopmerking: de bovenste ballen op de zolder steken door de dakrand (foto `013.jpg`).
17. **Splitsen extra** — **afgekeurd op taal (15.36)**: "Verander de stippen onder." is geen goede zin (bedoeld: in de 2 onderste cirkels / onderaan). `squla-splitsen-extra-zinnen.ts:80`. Ook "Je hebt 2 delen en 1 totaal." en "linkerdeel/rechterdeel" zijn moeilijk voor groep 3. De hint "Kijk naar de 2 delen onder in de machine." (`:164`) is beter, maar ook "onder in". `npm run bewaak` (vloeiend): "het eerste Phaser-beeld kwam er niet" voor deze les (zie onderaan).
18. **Tellen** — goed.
19. **Tellen extra** — goed (1 goed antwoord gecontroleerd op de foto: 8 peren).
20. **Tijd** — goed. (Bij de weekendvraag staat alleen de locomotief in beeld; past, maar is leeg.)
21. **Vormen** — goed op de regels. Taal: "En welke kraal komt er nu?" / "En wat hoort nu bij de pijl?" — het losse "En" aan het begin klinkt raar als er niets voor staat (15.36).

**Totaal: 17 goed (waarvan een paar met kleine opmerkingen), 4 afgekeurd** (Getallenlijn, Klok, Rekentaal, Splitsen extra).

Niet gevonden in alle 21: dubbele tekst tegelijk (F11), wachten zonder vraag in de goede route, disco, "vinkje" in een vraag, hints die het antwoord verklappen (scripts + code: ringen/handjes op het antwoord alleen bij samen voordoen), antwoordknoppen links (raster) bij gewone keuzes.

## Wat Sara moet beslissen

1. **Gloed om voorwerpen** (Rekentaal weegschaal/kleed, Rekenmix 3 doos): is dit de toegestane "hologram-gloed" of de verboden lichte rand van 15.33? Op de foto lijkt het een lichte rand.
2. **Startvraag** in Splitsen en Getallenlijn: BOUWREGELS T21 zegt "alleen de klok", de code zegt dat het draaiboek er een heeft. Mag die blijven?
3. **Keuzes in het beeld** bij Vormen (kralen/fruit-tegels linksonder) en Meten (kaartjes linksonder): tellen die als "voorwerpen in het beeld" (mag), of moeten ze rechts onder Bliepo (15.32)?
4. **Meten**: gloed om het gekozen kaartje naast het vinkje — mag dat (7.8 zegt alleen een vinkje)?
5. **Klok**: getallenlijn in een wit vak met zwarte cijfers — goed zo?
6. **Rekenmix 3**: kleur van het totaal (rood in de zin, wit in het splitsbeen).
7. **Opnames "1." en "11."** opnieuw laten maken bij Ruth (kost tegoed; nu wordt het afgeknipt).

## npm run bewaak

Bij het schrijven van dit rapport liep `npm run bewaak` nog (hij staat nog bij de vloeiend-meting). Tot dan:
schermen goed, waardebewaking 11/11 goed, oefentypes goed. Vloeiend: Rekenmix 2 op trage telefoon 1 hapering van
57 ms (grens 50 ms), en voor Splitsen extra kwam het eerste Phaser-beeld niet in de meting (2 keer). Allebei
opnieuw meten als de computer rustig is: de laptop was druk met de andere tests. De rest van de bewaking
(overlap, speel, stem) is niet afgewacht.
