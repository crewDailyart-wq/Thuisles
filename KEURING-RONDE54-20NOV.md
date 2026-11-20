# Keuring Ronde 54 (20 november 2026)

Onafhankelijke keuring van de 4 herstellen van 20 november (commits b1fd687, e17250f, b2cfa3d, 506ebaa):
Tellen extra (vinkje in het lijstje), Tijd (vinkje boven de weekendkaart), Plussommen (kaartjes op de toonbank)
en Klok (stoep onder de bezorgbus). Alleen gekeken en getest; er is niets aan lessen, code of zinnen veranderd.
Getest als Testkind, 1 browser tegelijk, niets online, database alleen gelezen (0 nieuwe regels in
les_uitkomsten, hoogste id bleef 147). Vloeiendheid en telefoon niet gemeten (komt aan het eind).

Halverwege raakte de schijf van de laptop vol. Na het opruimen zijn de ontbrekende stappen opnieuw gedraaid;
alles hieronder is dus wel gecontroleerd.

## Kort: per les

| Les | Uitslag |
|---|---|
| Tijd (`squla-tijd-dagen-1-gouden`) | **Goed.** Het vinkje staat boven de gekozen weekendkaart, tussen de 2 bordjes. "zondag" en "maandag" zijn helemaal leesbaar. Het vinkje raakt de zin niet (ook niet bij 4 regels), en ook Bliepo en de Controleer-knop niet. |
| Tellen extra (`squla-tellen-fruit-1-gouden-extra`) | **Goed.** Bij het gekozen fruit staat alleen het vinkje; geen witte rand en geen lichte achtergrond. |
| Plussommen (`squla-plus-bakkerij-1-gouden`) | **Goed.** De 3 kaartjes staan met hun onderkant in het blad van de toonbank. Niets zweeft, niets steekt buiten de toonbank. De kassa staat achter het middelste kaartje, de bovenkant blijft zichtbaar. Niets raakt de zin of Bliepo. |
| Klok (`squla-klok-hoelaat-1-gouden`) | **Goed.** De bus staat met zijn wielen op de stoep ("De bus rijdt weer terug", "De bezorgbus staat weer klaar"). De stoep stopt vlak voor de klok en raakt de klok, de zin, de knoppen en Bliepo niet. Bij de zon en de bakkerij is er geen stoep. |

## Speelcontrole (`scripts/speelcontrole.mjs`)

| Les | Alles goed | Alles fout |
|---|---|---|
| Tijd | tot het eind, 0 fouten | tot het eind, 0 fouten |
| Tellen extra | tot het eind, 0 fouten | tot het eind, 0 fouten |
| Plussommen | tot het eind, 0 fouten | tot het eind, 0 fouten (162 stappen) |
| Klok | tot het eind, 0 fouten (94 stappen) | tot het eind, 0 fouten (232 stappen) |

Bij de Klok ook: F16 0, 15.47 0, F11 0.

## Testscripts

- `test-tijd-gouden.mjs` (ontwerp 1280x720, goed en alles fout): Alles in orde.
- `test-tellen-extra-gouden.mjs` (goed en alles fout): allebei tot de eindkaart, database niets bijgekomen.
- `test-plussommen-gouden.mjs` (ontwerp 1280x720, alles fout): Alles in orde; 0 zinnen met een opdracht bij de 2e fout, 0 keer dubbele tekst.
- `test-klok-gouden-pijl.mjs` (ontwerp 1280x720, nee-goed, foto bij elke vraag): Alles in orde; Bliepo raakt tekst, knoppen en pijl 0 keer, 0 sprongen, F7 0.

## Andere controles

- `npm run opgaven`: in orde.
- `REV=HEAD npm run inhoudsvergelijk`: in orde, er is niets verdwenen.
- `npm run stemdubbel`: 2 meldingen "DUBBEL?" (zin 1. en zin 11.), dezelfde als bij een eerdere controle vandaag.
- `npx tsc --noEmit`: in `src/` alleen de bekende fout in `squla-rekenmix-gouden-zinnen.ts:332`. De andere meldingen staan in `backups/`, `output/` en `.next/`, niet in de lescode.

## Kleine punten (geen fout van de herstellen)

1. Tijd: het vinkje boven een weekendkaart is kleiner (28) dan het vinkje op een kaart met 1 dag (46).
   `src/components/les/vlakken/squla-tijd-gouden.module.css:61-73`.
2. Klok: de stoep ligt links over de boeken en de pennenbak van de achtergrond heen (de onderkant ervan is
   nog zichtbaar onder de stoep). Het stoort niet bij de vraag.

## Voor Sara om te beslissen

1. **Tellen extra: begint het lijstje met de appel al gekozen?** Als het lijstje verschijnt, is de appel al
   gekozen en staat er een vinkje bij. Toch zegt Bliepo "Kies eerst een soort fruit en tik dan op de vakjes."
   Dat komt door `startVerf` in `src/components/les/lessen/squla-tellen-extra-gouden.tsx:474`.
   Keuze: (a) bij het begin is er nog niets gekozen, zodat de zin klopt; of (b) de appel blijft gekozen en de zin
   wordt aangepast.
2. **Tijd: vinkje boven de weekendkaart even groot maken als op de andere kaarten?** (punt 1 hierboven)
