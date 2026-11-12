# Herkeuring van 3 hersteld lessen (12 november 2026, na commit 80acf39)

Onafhankelijke keurder. Niets aan lessen veranderd. Testkind, geen schrijven in de database (hoogste id les_uitkomsten bleef 147).

| Les | Uitslag |
|---|---|
| Splitsen extra (squla-splits-splitsen1-1-gouden-extra) | GOEDGEKEURD |
| Plussommen extra (squla-plus-bakkerij-1-gouden-extra) | GOEDGEKEURD |
| Rekenmix 2 (squla-rekenmix-mix2-1-gouden) | GOEDGEKEURD |

## Gedraaid (een voor een)
- test-splitsen-extra-gouden.mjs (goed, fout1, allefout, stil): groen, tot de eindkaart, hulphandje na 6,1 s, database niets bijgekomen.
- test-plussommen-extra-gouden.mjs (goed, fout1, allefout, stil): groen, hulphandje na 6,1 s, database niets bijgekomen.
- test-rekenmix2-gouden.mjs (alle routes): "Alles in orde", 0 nieuwe regels, 0 keer op de pijl getikt.
- Speelcontrole GOED en ALLEFOUT: Rekenmix 2 speelt tot het eind (48 en 169 stappen). Splitsen extra en Plussommen extra staan als "stap alleen in de tekening" (de speler kan maken/slepen niet zelf; geen fout, dat is bekend). Hun echte route is door de eigen testscripts gespeeld.

## Eerdere afkeuringen
- Splitsen H1 (vinkje): opgelost. "Tik op het vinkje" staat nog maar 1 keer, in de eerste splitsopdracht (zoekOpdracht). De 3 andere opdrachten en alle hints zijn zonder knop-uitleg. Nieuwe hints: "Verander een deel. Samen moet het 7 zijn." / "Maak een deel groter of kleiner." / "Probeer een ander deel." Die verklappen niets.
- Plussommen H2 (hint omwisselen): opgelost. Nu "Kijk goed naar de tegels. Tel de vakjes nog eens, een voor een." Past bij 9 en bij 11, noemt geen "dezelfde"/"hetzelfde".
- Plussommen K1 (hokjes): opgelost. In alle kindzinnen en in de fouttabel staat nu "vakjes" (WOORDEN-GROEP3). "hokjes" staat alleen nog in codenamen (telHokjes, foutcode), die het kind niet leest.
- Rekenmix 2 H1 (volst/leegst): opgelost. Nu "Die boterham heeft de meeste kaas." / "Dat spiesje heeft het meeste fruit." / "Je koos de boterham met het minste ei." Lidwoorden kloppen met het beleg (de kaas, de banaan, de komkommer, de tomaat, het ei, het fruit).
- Rekenmix 2 H2 (alle 3): opgelost. Nu "Kijk nog eens goed naar alle 3 boterhammen." / "alle 3 spiesjes" (in de test gezien bij vraag 2 en 14).

## Nieuwe fouten in de herschreven zinnen
Geen harde fouten gevonden. Geen "fout" in zichtbare tekst, geen dubbel getal, hints verklappen niets, Nederlands klopt.

## Kleine punten (geen blokkade, al eerder gemeld)
- Rekenmix 2 K1: "voller" en "leger" ("Je zoekt de boterham die voller is") staan niet op WOORDEN-GROEP3.
- Rekenmix 2: in de uitleg bij fout 2 staat soms "boterham" en "ei" twee keer kort na elkaar ("Die boterham heeft het minste ei. Je zoekt de boterham met het meeste ei."). Leest goed, alleen een woord dubbel.
- Plussommen K2: tekstfout in FOUTTABEL regel 66 ("3 en 7 werd 37") is niet in de les.
