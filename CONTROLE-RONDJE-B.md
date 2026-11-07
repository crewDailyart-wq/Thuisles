# Controle rondje groep B (6 november 2026)

Gelezen: `RONDJE-GROEP-B.md`, de verschillen tussen de back-ups (`scratchpad/rondje-b-kopie/`) en de huidige bestanden, `holo/rondje.ts`,
`squla-hulp.ts`, `squla-uitleg.ts`, `squla-huisnummers.tsx`, `squla-huisnummers-straat.tsx` en `scripts/speelcontrole.mjs`.
De 4 lessen (`squla-plussommen.tsx`, `squla-rekenmix.tsx`, `squla-getallenlijn.tsx`, `squla-huisnummers.tsx`) zijn niet veranderd ten opzichte van de back-up.
Alleen gelezen; niets gewijzigd, niets gedraaid behalve de typecontrole.

## FOUTEN (echt)
Geen echte fouten gevonden die het rondje breken. De typecontrole geeft 0 fouten in `src/`.

## RISICO (klein, niets uitgevoerd)
1. `squla-plussommen-vlak.tsx`, `rekRondje` (regel ~652-664): elke stip die erbij komt zet na 1100 ms alles weg (`rr.zet(new Map())`).
   Komen er twee stippen kort na elkaar, dan haalt de timer van de eerste het rondje van de tweede te vroeg weg.
   Voorstel: onthoud de laatste stip (teller) en haal alleen weg als die nog dezelfde is.
2. `strak()` (3 keer exact hetzelfde, in plussommen, rekenmix en getallenlijn): sprong bij 240. Net onder 240 is het rondje
   ongeveer b*1,15+44 (bij 240: 320 breed), net erboven ongeveer b+60 (bij 241: 301 breed). Een iets groter geheel krijgt dus een iets
   kleiner rondje. Deling door nul kan niet (delers zijn vaste getallen 1,15 en 1,4); lege groepen worden eerder opgevangen
   (`vakVan` en `vakOm` geven `null`; getallenlijn maakt dan geen rondje). `Math.max(60, ...)` voorkomt een te klein rondje.
   Voorstel: dit hoort als optie in `rondje.ts` (de helper zegt dat zelf ook). Nu dubbel werk; drie plekken om bij te houden.
3. `squla-getallenlijn-vlak.tsx` (regel ~482-520): de sleutel van een rondje bevat de plek (`n${n}-x-y`, `geheel-...@x`).
   Beweegt een kaart bij ordenen terwijl `tekenLicht` opnieuw loopt, dan wordt het rondje telkens opnieuw gemaakt (met animatie).
   Niet gezien of dat echt gebeurt; `tekenLicht` wordt alleen vanuit regel 279 aangeroepen (staatverandering).
4. `squla-huisnummers-straat.tsx` (SVG): het rondje-plaatje (60 KB) wordt pas geladen als het eerst nodig is; er is geen voorladen.
   Bij `licht` verschijnt een nieuw `<image>`. De browser haalt het plaatje maar 1 keer op (zelfde adres, cache), maar op een trage telefoon
   kan het eerste rondje even later verschijnen. Voorstel: plaatje voorladen (bijvoorbeeld `new Image()` bij het openen van de les).
5. Dode code: in getallenlijn blijft `lichtjes` (regel 174, 247-248) bestaan maar wordt niet meer gevuld; in rekenmix wordt `vorigLicht`
   nog gezet maar niet meer gelezen; `stip-g` wordt nog gebakken. Onschuldig, wel opruimen later (alleen met Sara's akkoord, HARDE REGEL 3).

## Punt 1 (logica), wat ik wel gelezen heb en in orde is
- Plussommen: `rondjes` wordt bij een nieuw beeld eerst `vergeet()`-ed en dan opnieuw gemaakt in de nieuwe container (regel ~397-405). Tellen krijgt een
  nieuwe sleutel per stap (`tel<n>`), het oude rondje verdwijnt dus. Bij `flits` (goed) wordt alles weggehaald. `rekRondjes` wordt bij een nieuw rek vergeten.
- Rekenmix: `leeg()` roept `vergeet()` aan voor elk deel. `zetLicht` zet het rondje weg als het deel niet meer aangewezen is of `aan` leeg is. Telt Bliepo
  een voor een, dan komt het rondje om het nieuwe ding (logica `erbij`/`d.wijs` klopt voor groeien, gelijk blijven en krimpen).
- Getallenlijn: `ruimOp()` roept `vergeet()` aan; de houder wordt 1 keer gemaakt en blijft staan (leeg als er niets aangewezen is).
- Races bij laden: `rondje.ts` heeft de controle `scene.sys?.isActive()` en onthoudt de laatste wens (`laatste`), dus een rondje dat te vroeg
  gevraagd werd verschijnt na het laden. Geen dubbele rondjes: bestaande sleutels blijven staan.
- `rustig`: geen animatie, wel rondje (in `rondje.ts`). `uit`/dof: plussommen en rekenmix laten de rest dof; het rondje zelf wordt niet dof (rekenmix) en volgt de
  container-alpha (plussommen `dim`, de hele container). Geen fout.
- Pointer-events: Phaser-plaatjes zijn niet aanklikbaar (geen `setInteractive`), dus ze blokkeren niets. In de SVG staat `pointerEvents: none` op het rondje.

## Punt 3: blijft wat blijven moet?
- Plussommen: groene gloed (`flits`/`GOED`) en gloed bij `gekozen` blijven (`tekenStaat` regel ~566-569); kleurringen en getallen boven de pakjes zijn niet aangeraakt (niet in de diff).
- Rekenmix: groene gloed in `goed()` en `plekGoed` (regel ~489, 507, 855) blijft; alleen de gloed bij het aanwijzen is weg.
- Getallenlijn: de golf bij goed (`doeGolf`) staat er nog. Weg zijn alleen de gele label, de gloeiende stip en de pulserende ring bij aanwijzen. Dit is bewust gevraagd (rondje in plaats van gloed).
- Huisnummers: de gele rand om het bordje en de gele schaduw zijn weg (gevraagd). Wel nog geel: `LegePlek` krijgt geel (`GEEL`) als je erboven sleept (`aan={boven(sleep)}`)
  en dat is een keuze van het kind, geen aanwijzing van Bliepo, dus terecht gebleven. `HuisOud` is ongebruikt en ongewijzigd (hij houdt de oude gele variant).
- Niets dat verdwenen is, op de gevraagde gloed na. De rode foutgloed (`schud` bij fout) in huisnummers is niet aangeraakt.
- Getalkleur-ringen (BOUWREGELS 2.1): niet in de diff, dus niet geraakt. Of de rondjes zelf (rood) bij een getalkleur-ring botsen heb ik niet visueel kunnen zien.

## Punt 4: oude lessen
`grep` op de 7 bestandsnamen in `src` en `scripts`: alleen de 4 Squla-lessen (`squla-plussommen`, `squla-rekenmix`, `squla-getallenlijn`, `squla-huisnummers`)
en de vlakken zelf gebruiken ze. Oude (niet-Squla) lessen worden niet geraakt. `rondje.ts` en `public/rondje/` zijn nieuw (nog niet in git).

## Punt 5: prestaties (alleen uit de code, niet gemeten)
- Het plaatje wordt in `rondje.ts` 1 keer geladen (`geladen`/`laadt` op module-niveau) en 1 keer als textuur gezet (`textures.exists`). Per beeld wordt niets nieuws geladen.
- Een rondje is 1 `add.image` (+ 1 tween van 240 ms) alleen bij het verschijnen; bestaande rondjes worden niet opnieuw gemaakt. Dat is licht.
- Rekenmix maakt per deel een eigen `maakRondjes` (1 object per deel, geen extra textuur).
- Huisnummers (SVG): zie risico 4. Geen tween; het plaatje is 1 extra `<image>` per aangewezen huis.

## Punt 6: ALLEFOUT op `squla-huisnummers` ("speler komt niet verder")
Waarschijnlijke oorzaak: de testspeler, niet de rondje-wijziging en niet de weggehaalde oude hulproute.
Bewijs uit de code:
1. `squla-huisnummers.tsx` gebruikt `squlaVraag` niet. Het heeft zijn eigen route (`speelVraag`, regel ~187-222): eerste fout = reactie en opnieuw, tweede fout = `samen()` en door.
   De oude route in `squla-hulp.ts` / `squla-uitleg.ts` (keuzevraag, pauze) kwam hier niet in voor. Alleen `uitlegKeuze` (de Nee-route) gaat via `begeleideVraag`, en die
   werkt niet met ALLEFOUT in de Ja-route.
2. De vraag waar het vastloopt ("Sleep het goede huis naar de lege plek.") is een sleepvraag (`losse` in `VRAGEN`, de eerste is vraag 5). De losse huizen zijn
   `<g data-ding={n}>` in de SVG (`squla-huisnummers-straat.tsx`, regel ~320).
3. In `scripts/speelcontrole.mjs` kent de testspeler bij `soort === "fout"` (regel 500) alleen knoppen binnen `data-knop="keuzes"`/`bediening`.
   Een `data-ding` komt alleen voor bij `soort === "goed"` (regel 499). Een foute sleepvraag kan hij dus niet beantwoorden: geen enkele regel
   klikt een verkeerd huis aan. Daarna valt hij terug op `data-zin/data-getal/data-signaal` en `BUTTON`; een `<g>` is geen van die drie. Dat past bij
   "zelfde zin een minuut lang, met tikken" (regel 420-422) = "komt niet verder".
4. De ALLEFOUT-stand is nieuw in `speelcontrole.mjs` (de `git diff` toont de nieuwe regel 478), dus het is een beperking van het testscript, niet van de les.
5. Het rondje kan het niet zijn: de `<image>` heeft `pointerEvents: none`, staat alleen bij `licht` (het lopen langs de straat), en niet bij de losse huizen
   (`<Huis ... />` van de losse huizen krijgt geen `licht`).
Zeker is dit niet: ik heb de run niet herhaald en geen schermfoto's bekeken. Wel kan ik uit de code geen weg vinden waarlangs de testspeler bij ALLEFOUT een verkeerd huis aantikt.
Voorstel (niet uitgevoerd): in `speelcontrole.mjs` bij `soort === "fout"` een regel erbij die een `[data-ding]` aantikt waarvan de waarde niet het goede antwoord is.

## NIET GECONTROLEERD
- Geen schermfoto's, geen speelcontrole, geen vloeiend-test (zoals gevraagd): de uitkomst van de helper (schermfoto's en 3 GOED-runs) heb ik niet nagekeken.
- Of het rondje op elke plek mooi om het ding sluit (plussommen bus en rek, getallenlijn lijn/ordenen/bordjes, rekenmix verbinden/kijk) is alleen uit de code bekeken, niet visueel.
- De 3-of-meer-tak in de getallenlijn en `strak()` bij echte afmetingen: alleen de formule gelezen.
- `squla-plussommen-tekenen.ts`, `squla-rekenmix-tekenen.ts`, `squla-getallenlijn-teken.ts` zijn niet gewijzigd (geen diff); niet verder gelezen.
- Wijzigingen van anderen in dezelfde bestanden: alleen gekeken naar het verschil met de back-up van vóór dit werk; of die back-up zelf alle andere wijzigingen al bevatte, kon ik niet nagaan.
- Of de in `squla-hulp.ts` verwijderde oude route ergens anders in een les nog gebruikt wordt: niet onderzocht buiten huisnummers.

## In orde
- Typecontrole: geen fouten in `src/`.
- Geen verdwenen velden/knoppen/instellingen gezien; groene en rode gloed bij goed/fout en keuze van het kind zijn behouden.
- Oude lessen worden niet geraakt. Plaatje wordt 1 keer geladen (Phaser). Opruimen bij nieuw beeld klopt in alle drie de Phaser-vlakken.
