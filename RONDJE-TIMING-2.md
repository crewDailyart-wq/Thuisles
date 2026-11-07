# Rondje-timing, tweede ronde (groep: tellen, meer-minder, vormen, plussommen, rekenmix, getallenlijn, minsommen, meten, tijd)

Regel: het rondje komt precies op de momenten dat het oplichten kwam en gaat precies weg wanneer het oplichten wegging.
Vergeleken met `git diff HEAD` en `*.timing2.bak` in de scratchpad (kopieen van de bestanden voor deze ronde).

## Veranderd
- `squla-rekenmix-vlak.tsx` (`zetLicht`): het oude oplichten was `flits(..., 450)` op wat NIEUW aanging (dus niet blijvend). Het rondje stond eerst zolang `licht` bleef staan. Nu: rondje om wat nieuw aangaat, 450 ms, dan weg (token per deel, zodat een nieuwe aanroep het oude rondje niet te vroeg weghaalt). Dezelfde aanroep nog eens = niets nieuws, net als de gloed. De velden `aan`/`wijs` en de "erbij"-redenering zijn niet meer nodig en weg uit dit stuk.
- `squla-minsommen-vlak.tsx` (`goed`): oud = `flits(..., 800)` op alle items met alpha >= 0,5, bij elk soort tafereel. Rondje stond blijvend en alleen bij ruimte/bus/bakjes. Nu: rondje om wat overblijft, 800 ms, daarna weg (licht-rondje van Bliepo blijft ernaast gewoon staan, apart bijgehouden in `lichtWens`/`goedVak`, samengevoegd in `zetRondjes()`), bij elk soort tafereel; een nieuw tafereel zet alles weg.
- `squla-plussommen-vlak.tsx` (`rekRondje`): token per stip (`rekTok`); een oudere timer van dezelfde stip haalt het rondje van een latere keer niet meer te vroeg weg. De timer van een andere stip deed dat al niet meer (aparte sleutel per stip).

## Vergeleken en in orde (niet veranderd)
- Vormen puzzelhint: elke hint heeft een eigen sleutel (`hint-N`) en haalt alleen zichzelf weg na 2,7 s (= 450 ms x 2 x 3 van het oude knipperkader). Al goed. `licht`: zelfde uitsluitingen als het oude geel (dof/groen krijgt geen rondje).
- Meer-minder: rondje alleen om het ene getelde voorwerp (`geteld-1`), 420 ms, token per kaart; een herhaald `tel` vervangt het rondje, het groeit niet. Gelijk aan het oude oplichten (ook niet bij rustig).
- Tellen (holo): samen tellen = rondje om het getelde voorwerp, 420 ms, eigen tijd per voorwerp, ook bij rustig (zoals oud); zak = rondje zolang `zakLicht` (zoals de oude ring); "tik het voorwerp aan" (`wijs`) is nieuw en blijft staan tot getikt; bij nieuwe opgave alles leeg; bij `goed()` weg (de groene gloed neemt het over).
- Tellen (telrij): rondje zolang `licht` een plek aanwijst, weg bij null/nieuwe opgave (zoals de oude gloed).
- Getallenlijn: oud = ring die bleef staan tot de volgende `tekenLicht`; nu hetzelfde. Eigen `strak()` laten staan.
- Meten: `licht` = rondje zolang Bliepo aanwijst (niet bij goed/fout); wat het kind koos blijft gele gloed via `gekozen`.
- Tijd-trein en tijd-plaatjes: rondje zolang `licht`/`kaartLicht`, weg bij goed (groen), nieuw beeld ruimt op.
- `strak()` staat nog drie keer identiek (plussommen, rekenmix, getallenlijn): gelaten, wens voor `rondje.ts`: een optie voor "strak om een groot geheel".

## Let op (niet veranderd, voor Sara/de eigenaar)
- Tijd-trein: de wagon die oplichtte sprong 10 punten omhoog (tween). Die sprong is weggehaald toen het rondje kwam (eerdere helper). Niet teruggezet: dat is aan Sara.
- Rekenmix: het oude oplichten sloeg een item over zonder gloed-plaatje (`-g`); het rondje komt ook om zo'n item. Dat komt in de praktijk niet voor, niet gecontroleerd.
- Dode code die blijft staan (regel 3): `lichtjes` in getallenlijn, `ringen`/`selectieRing`/`flits`/`texGloed` in minsommen, `vorigLicht` blijft in rekenmix wel in gebruik.

## Gezien
- `npx tsc --noEmit -p .`: geen fouten in `src/` (alleen oude `.next`-meldingen).

## NIET GEZIEN
- Geen enkele schermfoto genomen (computer zwak; vooral code vergeleken). De nieuwe timing van rekenmix, minsommen-goed en plussommen-rek is dus niet met eigen ogen gezien.
- Geen speelcontrole, geen vloeiend-test, geen `npm run bewaak`.
- Plussommen bus, getallenlijn "geheel", meer-minder, meten, tijd: niet op beeld bekeken.
