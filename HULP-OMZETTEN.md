# Opdracht voor helpers: de hulp na een fout omzetten (4 november 2026)

Sara (eigenaar) wil dat ALLE Squla-lessen groep 3 de hulp na een fout krijgen zoals Synthesis.
Het voorbeeld dat Sara heeft goedgekeurd ("perfect, heel tevreden") is de klokles
`squla-klok-hoelaat-1` in `src/components/les/lessen/squla-klok.tsx`. Neem dat als patroon.

Antwoord altijd in het Nederlands. Alles wat je schrijft voor kinderen: grammaticaal 100% correct,
kindvriendelijk voor groep 3 (6-7 jaar), korte zinnen, didactisch duidelijk.

## Harde regels (CLAUDE.md, ook voor jou)
- Regel 8: raak NOOIT lessen van vóór 27 oktober 2026 of de ~9.680 concept-opdrachten aan. Alleen de `squla-*` lessen.
- Regel 9: geen betaald tegoed gebruiken (geen ElevenLabs, geen Magnific). Geen afbeeldingen genereren.
- Maak nooit content in de database. Zet nooit .db, .env of backups/ in Git. Niets online zetten. Geen commit, geen push.
- Test alleen als profiel "Testkind" (de speelcontrole doet dat al: `?naam=Testkind`).
- Verwijder of verander niets wat bestaat zonder dat het nodig is voor deze opdracht (HARDE REGEL 1 en 3).
- Start NIET zelf andere helpers. Draai maximaal één speelcontrole tegelijk.
- Raak NIET aan: `src/components/les/lessen/squla-hulp.ts`, `squla-uitleg.ts` (de kern is van de hoofdassistent),
  `public/beginzinnen/lijst.json`, `BEGINZINNEN.md`, `src/lib/lessen/beginzinnen.*` (een andere assistent werkt aan de beginzinnen),
  en bestanden van andere helpers. Heb je een wijziging nodig in de kern? Meld het in je verslag.
- Lees eerst `BOUWREGELS.md` (vooral 3.23, 4.4, 4.5, 5.1 t/m 5.10, 11.2, 14.x) en `ONTWERPREGELS.md`.

## Wat er moet gebeuren (per les in jouw bestanden)
De regels staan in BOUWREGELS 5.1, 5.4 en 5.10. Kort:
1. Goed = kort en door. Eerste fout = korte reactie op wat het kind KOOS + een hint ALLEEN als die bij de vraag past,
   en het kind probeert het meteen opnieuw. Tweede fout = Bliepo legt het uit en laat het goede antwoord zien; het kind
   gaat door naar de volgende opgave (de vraag komt later nog terug via de bestaande "terug"-mechaniek).
2. Geen keuzevraag "hulp of nog een keer", geen pauze, de les stopt nooit, nooit oneindig herhalen.
3. Geen vaste "Niet helemaal". Wees uniek en niet standaard: eigen zinnen per les en per vraag die bij het onderwerp passen.
   De kern wisselt de opening en de zin "ik laat het je zien" zelf af (`wissel`); jij schrijft de INHOUD per vraag.
4. De uitleg na de tweede fout is bij klok, tellen en meerkeuze ALLEEN kijken en luisteren (het kind hoeft niets te doen).
   Bij som-, splits- en sleepvragen mag het één keer een makkelijkere oefening zijn, alleen als Synthesis dat bij die
   soort doet (zie `INSPIRATIE.md`, "R3 · Algemene hulpregels", en zoek de vraagsoort op). Twijfel je: kies alleen kijken.
   Grens: nooit een tweede makkelijkere oefening na de eerste; gaat dat mis, dan tonen en door.
5. Aanwijzen = een duidelijk RONDJE (zie `nadruk` in `vlakken/squla-klok-tekenen.ts`), niet alleen oplichten.
   Bij andere vlakken: gebruik waar het kan het bestaande ring/rondje (`ringVoor` in squla-klok-vlak.tsx) of een duidelijke
   omtrek; verzin niets nieuws dat op telefoons zwaar is (BOUWREGEL 10/regel 7: vloeiend, dure gloed één keer bakken).
6. Hulphandje alleen waar het past; elke hint rekenkundig correct en didactisch bruikbaar; niet elke vraag heeft een hint.
   Verzin geen hint om er een te hebben.
7. Geen dubbele vraag vóór het antwoord, ook niet met andere woorden (BOUWREGELS 3.23), in de gewone route én in de uitleg na Nee.
8. Elke foute keuze die een kind VAAK maakt (getal ernaast, verkeerde bewerking, twee getallen opgeteld, omgedraaide
   cijfers, een ander uur lezen) krijgt een eigen reactie die zegt wat het kind waarschijnlijk deed, zonder dat het zich
   dom voelt, voorbeeld: "Bij 11 uur wijst de kleine wijzer naar de 11." Rekenkundig altijd controleren. Niet zeker? Dan
   geen reactie: de kern valt terug op de tip van de vraag. Bij een toets: geen uitleg bij fout.
9. Slepen: een verkeerd voorwerp glijdt terug, zonder zin (zoals Synthesis).

## Hoe je het technisch doet (zie het voorbeeld in squla-klok.tsx)
- `SqulaVraag` (in squla-hulp.ts) heeft nu: `synthesis?: boolean`, `reactie?: (x) => string[]` (eerste fout; zonder: de `tip`),
  `toonAntwoord?: () => Promise<void>` (tweede fout: het goede antwoord in beeld + in woorden, zonder de vraag nog eens te stellen).
- `synthesis: true` zet de nieuwe route aan voor die vraag. In de klokles gaat het via `speelAlles(..., synthesisHulp)`.
  Zet het aan voor ELKE vraag van de lessen in jouw bestanden, pas nadat `reactie` (waar zinvol) en `toonAntwoord` er zijn.
  Zonder `toonAntwoord` ziet het kind na de tweede fout het antwoord niet: dat is NIET goed, voeg het toe.
- De uitleg na "Nee" (begeleide uitleg, `squla-uitleg.ts`): roep `zetSynthesisHulp(l)` aan in `speel(l)` van de les. Dan gebruikt
  `begeleideVraag`/`uitlegKeuze` dezelfde route. Geef `uitlegKeuze` waar het kan `reactie` en `laatZien` (zie `uitlegHeel` in squla-klok.tsx).
- `samen` (de uitleg bij de tweede fout) wordt via `uitlegVoorVraag` uitgevoerd en mag de vraag niet opnieuw stellen.
- Antwoordtype T kan een string, getal of object zijn: kijk per vraagsoort wat `testAntwoord` en `isGoed` doen.
- Eén vraagsoort die in veel lessen voorkomt: schrijf de reactie en `toonAntwoord` één keer in de gedeelde functie van dat bestand
  (zoals `knopVraag`/`kiesVraag` in squla-klok.tsx), en geef per les alleen wat uniek is.

## Controle die je zelf doet, per les
1. `npx tsc --noEmit -p . 2>&1 | grep "^src/"` moet leeg zijn.
2. Speelcontrole, één les tegelijk (de dev-server draait op poort 3000):
   - `GOED=1 LESSEN=<id> node scripts/speelcontrole.mjs` (alles goed)
   - `ALLEFOUT=1 LESSEN=<id> node scripts/speelcontrole.mjs` (elk antwoord fout; moet "tot het eind" halen)
   - `ALLEFOUT=1 NEE=1 LESSEN=<id> node scripts/speelcontrole.mjs` (via Nee/uitleg)
   - `SCHERMFOTO=<map>` bewaart schermfoto's en `schermen.txt` met elke zin. Lees die: staat er "Niet helemaal", "pauze",
     een dubbele vraag, een foute zin of een onzin-hint, dan is het niet af. Kijk ook een paar schermfoto's.
   "0 stappen" bij belasting = opnieuw draaien.
3. Alleen groep 3-lessen. Nooit een les van groep 4 meenemen.
4. Lees al je nieuwe zinnen hardop na op grammatica en kindvriendelijkheid.

## Je verslag (kort, Nederlands)
Per bestand: welke lessen omgezet zijn, welke vraagsoorten welke reactie kregen, wat bewust passief of zonder hint is
gebleven (en waarom), wat niet gelukt is, en de uitkomst van de speelcontrole per les (goed / alle fout / via Nee).
Zeg eerlijk wat je niet hebt kunnen verifiëren. Schrijf geen commit.
