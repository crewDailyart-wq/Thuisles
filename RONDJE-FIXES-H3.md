# Verslag H3 (rondje-opnames, oplichten, review)

## 1. Opnamescript (`scripts/rondjecontrole.mjs`)
- Nieuwe modes: `ROUTE=nee`, `ROUTE=fout` of `ROUTE=nee,fout` (zonder ROUTE werkt het zoals voorheen, 8 zinnen).
- Met ROUTE: volgt tot 25 zinnen, klikt Verder, beantwoordt de eerste vragen (goed bij nee, fout bij fout), maakt foto "net voor het antwoord" en "kort na het antwoord". Slepen gebruikt dezelfde haakjes (`s1Stap`, `s2Stap`, `sleepKlaar`) als de speelcontrole; knoppen/invoer idem.
- `FIJN=1`: extra foto's elke 0,3 s. `MAXANTW=n`: aantal antwoorden.
- opnames.json krijgt per zin het veld `route`; de andere route blijft staan. Foto's van "fout" beginnen met `fout-`.
- Statuspagina toont "Na een fout antwoord, zin N".
- Beperking: een schermfoto kost ongeveer 0,4 s en de foto kan een zin te laat zijn. Rondjes van 0,42 s zijn daarom nauwelijks te zien.

## 2. Vijf lessen (oordelen in `rondje-oordelen-E.json`, allemaal "open")
- Delen: nergens een rondje (bakjes worden genoemd). Niet gerepareerd, vraag voor Sara.
- Tellen-fruit: rondje op de goede appel gezien. GEVONDEN en GEREPAREERD: bij het samen tellen stonden 2-3 rondjes tegelijk (stap korter dan 420 ms). Fix in `squla-tellen-holo.tsx` (`rondjeKort`, kopie van het origineel in de scratchpad). Niet op foto bevestigd. `tsc` geeft geen fouten in `src/`.
- Tellen-telrij: de Nee-route is alleen de vraag zonder uitleg (afwijking van 4.4?). Na een fout komt een Ja/Nee-hulpvraag. Geen rondje.
- Meer-minder (evenveel3-1): geen rondje in de uitleg, wel een lichtvlak onder potje 24. Niet gerepareerd.
- Rekenmix mix1-1: rode getallen bij het tellen, geen rondje gezien. Niet gerepareerd (H2-bestand).

## 3. Statuspagina
`Oplichten.tsx` + `oplichten.json` (klok erin), getoond onder Rondje-controle in `page.tsx`.

## 4. Review
Zie `RONDJE-ONHANDIG.md` (alleen voorstel).

## NIET GEZIEN
- Rondjes van 0,42 s per appel/knikker op een foto (te traag om te vangen), dus de fix bij Tellen is alleen uit de code.
- Delen: rondje bij de knikkers die in het bakje vallen.
- Geen enkele les op "goed" gezet.
- Van de film-mappen (`film-*.jpg`) in sommige lesmappen weet ik niet wie ze maakt; opnames.json ontbreekt daar.
