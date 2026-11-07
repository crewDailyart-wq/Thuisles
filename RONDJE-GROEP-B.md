# Rondje groep B (plussommen, rekenmix, getallenlijn, huisnummers)

Opdracht (Sara, 6 november 2026): wat Bliepo aanwijst, noemt of telt krijgt een rood, met de hand getekend dubbel rondje
(`public/rondje/rondje-rood-2.png`) in plaats van gloed, gele kleur of een pulserende ring. Gedeelde hulp: `src/components/les/holo/rondje.ts`
(niet gewijzigd). Groen (goed) en rood (fout) blijven als gloed.

Alle vier vlakken worden alleen door Squla-lessen gebruikt (grep op alle imports in `src`: alleen de lessen `squla-plussommen`, `squla-rekenmix`,
`squla-getallenlijn`, `squla-huisnummers`). Dus geen prop `rondje` nodig: het rondje staat altijd aan.

Kopieen van de oorspronkelijke bestanden: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/rondje-b-kopie/`.

## Per vlak

### `squla-plussommen-vlak.tsx` (Phaser)
- Weg: gloed (`LICHT`) op een groepje (`licht`), op de pakjes in de bus (`busLicht`), op de pakjes die tot nu toe geteld zijn (`busTel`), en het oplichten van een stip die erbij komt op het rek.
- Er voor in de plaats:
  - `licht` (bakkerij): 1 rondje om het hele groepje (alle plaatjes van dat groepje).
  - `busLicht`: 1 rondje om alle pakjes in de bus.
  - `busTel`: 1 rondje om de pakjes die tot nu toe geteld zijn (sleutel `tel<n>`, dus bij elke telstap een nieuw rondje).
  - Rek (`zetRek`): een stip die erbij komt krijgt ruim 1 seconde een rondje (`rekRondje`), daarna weg.
- Rondjes zitten in de container van het beeld; bij een nieuw beeld `vergeet()`. Eigen hulp `vakVan` (houdt rekening met plaatjes met de oorsprong onderaan, zoals de pakjes naast de bus); `strak()` laat een rondje om een groot geheel strak sluiten.
- Bewust niet veranderd: gloed bij `gekozen` (keuze van het kind, geen aanwijzing van Bliepo), groene gloed bij goed (`flits`/`goedIds`), kleurringen in de getalkleur (BOUWREGELS 2.1), `uit` (dof gemaakt), de DOM-getallen boven de pakjes (`telgetal`, `busgetal`; het rondje staat om de pakjes zelf).

### `squla-rekenmix-vlak.tsx` (Phaser)
- Weg: `flits` (gloed + opzwellen) in `zetLicht`.
- Er voor in de plaats: 1 rondje om de aangewezen stukken van de tekening (`vakOm`). Telt Bliepo samen (steeds meer licht op), dan komt het rondje om wat er net bij kwam; de getallen erboven laten zien wat al geteld is. Bij een groot geheel sluit het rondje strak (`strak()`).
- Bewust niet veranderd: het dof maken van de rest (alpha 0,3), groene gloed bij goed/plekGoed, de selectiering bij verbinden (keuze van het kind), de gloed van het lichtje dat voordoet hoe je sleept (`hand`; een voordoeging, geen aanwijzing), het goudkleurige "?"-rondje in een tekening (`licht: true` bij een stuk van soort "rondje"; dat is vorm van de opgave, geen aanwijzen).

### `squla-getallenlijn-vlak.tsx` (Phaser)
- Weg: `selectieRing` (pulserende ring), het gele label op de lijn, de gloeiende stip.
- Er voor in de plaats (`tekenLicht`): rondje om het ding in een rij, om het getal op de lijn (of de plek van het streepje), om de kaart/het vak bij ordenen, om het bordje. Zijn er 3 of meer tegelijk aangewezen (samen tellen): 1 rondje om het geheel. Bij 1 of 2: 1 per ding.
- Bewust niet veranderd: groene golf bij goed, de gloed-plaatjes van de dingen zelf.

### `squla-huisnummers-straat.tsx` (SVG/DOM, geen Phaser)
- Dit vlak is een SVG. Weg: gele schaduwellips onder het huis en de gele rand om het bordje. Erbij: de rondjes-afbeelding als `<image>` om het huis (met bordje). Het lopen langs de straat (`licht: i`) en de uitleg ("welk huisnummer komt na 24") wijzen zo met een rondje aan.
- Niet veranderd: `HuisOud` (oude, ongebruikte variant), de pop-animatie bij goed.

## Controles
- `npx tsc --noEmit -p .`: geen fouten in `src/` (na alle wijzigingen).
- Schermfoto's (headless Chrome, Testkind), gezien:
  - plussommen `squla-plus-bakkerij-1`: rondje om het aangewezen groepje taartjes; weer weg bij het volgende beeld.
  - huisnummers `squla-huisnummers`: rondje om het huis met het vraagteken (geen gele gloed meer).
  - getallenlijn `squla-getallenlijn-terugtellen-1` (rij met lichtslinger): rondje om het lampje (13) dat Bliepo noemt; daarna weg bij de vraag.
  - rekenmix `squla-rekenmix-mix1-1` (appels tellen): rondje om de appel die Bliepo nu telt (de getallen 1-3 erboven blijven staan). Eerste versie gaf een enorm ovaal om alle 4 appels; daarom telt het rondje nu het nieuwe ding en sluit een groot geheel strak (`strak()`). Na die aanpassing opnieuw gekeken: goed.
- Speelcontrole (`GOED=1`) vlak na mijn wijzigingen: `squla-rekenmix-mix1-1` 16 stappen tot het eind; `squla-plus-bakkerij-1` 27 stappen tot het eind; `squla-huisnummers` 28 stappen tot het eind.
- Een grote run over 8 lessen (GOED / ALLEFOUT / NEE) gaf vooral "0 stappen" bij 6 van 8 lessen en bij NEE "site draait niet": de machine had op dat moment een load van ongeveer 400 (veel helpers tegelijk), dus dat is een opstart-flake, geen uitkomst.
- `ALLEFOUT=1` op `squla-huisnummers`: "de speler komt hier niet verder" na 105 stappen ("Sleep het goede huis naar de lege plek."). Niet vergeleken met de situatie vóór mijn wijziging; ik heb alleen de tekening van het aangewezen huis veranderd, niet de sleeplogica, maar het is niet bewezen dat dit al eerder zo was.

## NIET GEZIEN
- Plussommen: de bus (`busLicht`, `busTel`, rondje om de pakjes), het rek met stippen (`rekRondje`) en de disco-vragen: niet op een schermfoto gezien (alleen de bakkerij).
- Getallenlijn: de lijn met getallen/streepjes, ordenen (kaarten/vakken) en bordjes: niet gezien. Ook niet gezien: een rondje om 3 of meer dingen tegelijk (de "geheel"-tak).
- Rekenmix: alleen de telles in `mix1-1` gezien; andere vraagsoorten (verbinden, volgorde, kijk met vormen) niet.
- Speelcontrole in de routes ALLEFOUT en NEE: niet betrouwbaar gelukt (load); alleen GOED voor 3 lessen is groen.
- `npm run vloeiend` (beelden per seconde, hapering): NIET gemeten. Met een load van ongeveer 400 zijn de metingen niet bruikbaar. Per beeld wordt niets nieuws gemaakt (rondje wordt alleen gemaakt als het rondje verschijnt, eenmalig geladen plaatje), maar een meting ontbreekt.
- De animatie van het rondje bij het huisnummers-vlak (SVG): geen tween, het rondje staat er gewoon; niet gevraagd, wel verschil met de Phaser-vlakken.
- Een wens voor `rondje.ts`: een optie om strak om een groot geheel te sluiten (nu pas ik dat in elk vlak zelf toe met `strak()`).
