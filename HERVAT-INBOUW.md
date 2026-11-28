# Opdracht: verdergaan waar je was in een gouden les bouwen (28 november 2026)

Sara: een kind dat een les halverwege verlaat, komt terug bij de vraag waar het was, niet bij het begin. Opnieuw doen na een afgemaakte les begint bij het begin (zoals Synthesis: zomaar opnieuw, geen ouder, oud resultaat blijft).

## Al klaar (gedeeld; NIET aanpassen, meld een fout in je rapport)
`Lesscherm.tsx` laadt de stand voor de les start en zet `l.hervat`, `l.openingsZin`, de sleutelteller; `l.stap` en `l.onthoud` bewaren; na de tik op de kaart sluit de server de stand. Zie `soort.ts` (`hervat`, `stap`, `onthoud`, `openingsZin`) en `src/lib/hervatstand.ts`.

## Voorbeeld
`squla-tellen-extra-gouden.tsx` (speel) en `squla-extra-basis.ts` (`st`, `noteer`, `klaarAl`).

## Per les doen
1. `noteer`: na het toevoegen van de denkfouten `l.stap?.(vraag, uit, fouten);`. Staat van de les: `alleDenkfouten` begint met `[...(l.hervat?.denkfouten ?? [])]`.
2. Maak een `klaarAl(l, vraag)` zoals in de basis (zet `eerste`, werkt de voortgangsbalk bij). In `speel`: elke vraag die al gemaakt is overslaan, met zijn overgangszin en zijn uitleg ervoor. Het eerste beeld/vlak moet wel opgezet worden, zodat de volgende vraag goed tekent.
3. Opening: is `l.hervat` er, dan zegt Bliepo `l.openingsZin` in plaats van groet, uitleg, startvraag en proef. Is alleen `l.openingsZin` er (opnieuw doen), dan die zin eerst en daarna de les zoals altijd (de groet mag blijven).
4. De terugkomende vraag moet DEZELFDE zijn: controleer dat de vraag-id's en de volgorde niet van toeval afhangen. Hangt een id of volgende vraag af van een keuze van het kind of van `Math.random`, bewaar dan met `l.onthoud(sleutel, waarde)` wat nodig is (alleen dat), of herken op volgorde. Tellers die het verloop sturen (aantal fouten voor een bonus, proef gehaald, terugvragen aan het eind) reken je uit `l.hervat.antwoorden` / `extra` terug.
5. Gestopt na de laatste vraag maar voor de tik: dan gaat de les meteen naar het eindscherm.
6. Niets verwijderen; vragen, aantallen, hints, uitleg en fouttabel blijven. Geen andere dingen verbouwen.

## Controle per les (1 volledige controle, als Testkind)
De dev-server draait AL op http://localhost:3000 op een wegwerpkopie `backups/hervat-proef.db`. Start of stop hem niet.
`DB=backups/hervat-proef.db scripts/een-chrome.sh perl -e 'alarm 560; exec @ARGV' -- node scripts/hervat-controle.mjs <lesId>`
Alle Chrome-tests ALLEEN via `scripts/een-chrome.sh` (er mag er maar 1 tegelijk lopen; je wacht vanzelf op je beurt). Gebruik geen `pkill` en geen andere Chrome-scripts buiten dit slot. Een les is pas klaar bij `GOEDGEKEURD`. `npx tsc --noEmit`: alleen de bekende fout in squla-rekenmix-gouden-zinnen.ts.
Heeft de les routes die de controle niet raakt (Ja/Nee-startvraag, proef, terugvragen, bonus), kijk die dan in de code na en noem ze in je rapport.

## HARDE REGELS
Niets wat bestaat mag verdwijnen. Nooit zelf content in de database maken. Nooit de echte database `data/thuisles.db` aanraken; alleen de wegwerpkopie. Oude lessen van vóór 27 oktober 2026 nooit aanraken. Niets online. Geen ElevenLabs of ander betaald tegoed. Geen helpers inzetten. Niet committen. Rapport in het Nederlands, kort: per les wat je deed, de uitslag van de controle, twijfels.
