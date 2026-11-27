# Opdracht: het nieuwe eindscherm in een gouden les bouwen (27 november 2026)

Voorbeeld die al klaar is en door Sara is goedgekeurd: `src/components/les/lessen/squla-tellen-extra-gouden.tsx` (id `squla-tellen-fruit-1-gouden-extra`). Bouw het EXACT zo na in jouw lessen.

## Wat het eindscherm doet (Sara heeft dit besloten)
Ster draait in het midden met geluid, sleutel ernaast, dan leerzin, dan de kaart met het onderwerp. Het kind tikt op de kaart: het RONDJE (alleen een ring, geen vinkje, geen wit vlak) loopt vol in de kleur van het resultaat (`src/lib/les-kleuren.ts`) en het resultaat wordt bewaard. Daarna zegt Bliepo 1 standaard eindzin over hoe het ging (NIET over de kleur) en gaat het kind terug naar `/voorbeeld/onderwerpen`. Het kind krijgt altijd een ster. Een sleutel per vraag (antwoord in 1 keer goed) is maar 1 keer te verdienen.
Alle onderdelen zitten al in `Eindscherm.tsx`, `Lesscherm.tsx`, `soort.ts`, `eindzinnen.ts` en `lesuitkomstacties.ts`; die pas je NIET aan (alleen als je een echte fout vindt: meld die dan, repareer hem niet stilletjes).

## Per les doen
1. Draaiboek: `eindscherm: true`, `eindOnderwerp` (kort, de naam van het onderwerp), `eindLeerzin` (1 korte zin "Je kunt nu …", groep 3, cijfers voor hoeveelheden, past bij wat de les leerde), `eindPlaatje` (een bestaand plaatje uit `public/` dat bij de les hoort, geen poppetjes of gezichtjes; maak GEEN nieuwe plaatjes), `eindKaartZin: EIND_TIK_KAART` (uit `../eindzinnen`).
2. Voortgang en sleutels: net als Tellen extra. `B.st(l).totaal` = aantal vragen van de les, `l.voortgang`, en bij elk antwoord het bewaren van de uitkomst (`bewaarUitkomst`) en `l.sleutel?.()` alleen als het antwoord de EERSTE keer van die vraag in 1 keer goed was en de sleutel nog niet verdiend was (zie `noteer` in `squla-extra-basis.ts`). Heeft jouw les een eigen `noteer`, haal dan hetzelfde gedrag daarin. Geen vragen toevoegen of weghalen: het aantal vragen blijft zoals het is.
3. Einde: vervang de oude slotzin + oude kaart + oude eindzin door `eindeScherm(l)` zoals in Tellen extra: `resultaat(l)` (percentage goed in 1 keer via `percentageGoed`, ook `&snel=pNN`), `l.eindscherm?.(resultaat(l))`, wacht ±1,5 s, `B.zeg(l, eindzin(resultaat(l).percentage))`, dan `await l.eindAfsluiten?.()`. Gebruik ALLEEN `eindzin()` uit `src/components/les/eindzinnen.ts` (standaardzinnen, door Fable gecontroleerd); schrijf geen eigen eindzinnen.
4. Snelle test: `&snel=1` / `&snel=p72` moet naar het eindscherm gaan zoals in Tellen extra (`snelNaarEinde`), zonder iets te bewaren.
5. De oude kaart-code (component) blijft staan, de les gebruikt hem alleen niet meer. Verwijder niets (HARDE REGEL 1 en 3). Schrijf in je eindrapport per les precies welke oude onderdelen niet meer gebruikt worden, dan zet de hoofdsessie ze in WEGGEHAALD.md. Zet zelf niets in WEGGEHAALD.md (andere helpers werken ernaast).
6. Controleer ALLES wat al goed werkte: alle vragen, hints, uitleg, fouttabel, hulphandje, voortgangsbalk blijven werken. Rond je het eindscherm in, dan moet de rest identiek blijven.

## Testen (alleen als "Testkind", nooit als echt kind)
- Dev-server draait op http://localhost:3000. `npx tsc --noEmit` mag alleen de bekende fout in `squla-rekenmix-gouden-zinnen.ts` geven (filter op `^src`).
- Speelcontrole: `LESSEN=<id> GOED=1 node scripts/speelcontrole.mjs` en `LESSEN=<id> ALLEFOUT=1 node scripts/speelcontrole.mjs` (met `perl -e 'alarm 280; exec @ARGV' --` als timeout; er is geen `timeout` op deze Mac). De eind-"klaar" is `[data-eindscherm] [data-eind-leerzin]`.
- Foto's: `LES=<id> UIT=<map in je scratchpad> PERC=100,72,45,20 node scripts/foto-kleuren.mjs` (kaart na de tik + GIF). Bekijk een paar foto's zelf: staat de leerzin/het plaatje goed, past het rondje, geen overlap met de rest van de les?
- Speel de les ook een keer tot het echte einde met snelle link `http://localhost:3000/voorbeeld/les/<id>?naam=Testkind&snel=p72&blijf=1`.

## HARDE REGELS (altijd)
Niets wat bestaat mag verdwijnen. Nooit zelf content in de database maken (geen vragen, geen sjablonen; alleen het testprofiel Testkind speelt, en alleen via de gewone les). Oude lessen van vóór 27 oktober 2026 nooit aanraken. Niets online zetten. Geen ElevenLabs of ander betaald tegoed. Geen cijfertoetsenbord. Je zet zelf geen helpers in. Je commit en pusht NIET (de hoofdsessie doet dat). Antwoord in je rapport in het Nederlands, kort, met per les: wat je deed, wat je testte (uitkomst), de leerzin en het plaatje, de lijst met niet meer gebruikte oude onderdelen, en elk punt waar je twijfelt of iets afweek.
