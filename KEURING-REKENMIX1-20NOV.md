# Keuring Rekenmix 1 (squla-rekenmix-mix1-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 2). Er is **niets** aan de les, de code of de zinnen veranderd; dit is alleen een rapport.
Gespeeld als Testkind via `/voorbeeld/les/squla-rekenmix-mix1-1-gouden?naam=Testkind`.

## Uitslag: AFGEKEURD (1 taalfout, ernst laag)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-rekenmix-gouden.ts` | goed: 15 vragen van `squla-rekenmix-mix1-1` vergeleken (ding, ligging, aantal, keuzes, rijen = gelijk, 15.8), 30 foute antwoorden, 697 combinaties zonder verklapper, 772 beweringen waar |
| `node scripts/speelcontrole.mjs` GOED | goed tot het eind (22 stappen); F16 0, 15.47 0, F11 0; 10 met zin, 5 stil |
| `node scripts/speelcontrole.mjs` ALLEFOUT | goed tot het eind (201 stappen); F16 0, 15.47 0 (136 keer telwoord mét opdracht erboven), F11 0; `goed-na-hulp` 15 keer, altijd met zin (15.49) |
| `RUSTIG=1` speelcontrole GOED | F16 0 bij 15 wachtmomenten van 3 s |
| Begin zonder tik (`vraag-aanwezig-controle.mjs`) | alleen de lesachtergrond met de ronde afspeelknop (15.38) |
| `test-rekenmix-gouden.mjs` kleur, goed, fouten, allefout, anderefout | alle 5 "Alles in orde"; database 0 nieuwe regels |
| Antwoordplek (15.32) | goed: cijfers rechts onder Bliepo's zin |
| Einde (15.50, 15.46) | goed |

Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/k20d2/foto-goed/`, `foto-fout/`, `tfoto/rekenmix1/`.

## Fout

1. **"Tel elk potlood mee, ook de laatste." (14.2, 15.48). Ernst: laag.**
   Potlood is een het-woord: het moet "ook het laatste" zijn. De les weet dat al (`elk` = "elk" bij potlood), maar het
   einde van de zin staat vast op "de laatste". Gehoord in de route fouten: "Bijna! 5 is nog iets te weinig. Probeer het
   nog eens. Tel elk potlood mee, ook de laatste."
   Plek: `src/components/les/lessen/squla-rekenmix-gouden-zinnen.ts:400`, `:401`, `:402` (laatste variant van `rijen`, `los`, `paren`).
   Ter vergelijking: Plussommen doet het wel goed (`squla-plussommen-gouden-zinnen.ts:452`).
   Ook gezien (niet mijn les, voor de andere keurder): dezelfde vaste zin in `squla-rekenmix4-gouden-zinnen.ts:486-487`.

## Opmerkingen (geen afkeur)

- **Kijk als een kind (14.23):** de 6 potloden zijn allemaal groen en hangen rechtop in de lucht; de auto's en sterren zijn vrij klein met veel lege ruimte rechts ervan. Telbaar en duidelijk, maar minder vrolijk en groot dan het kan (`foto-goed/.../001.jpg`, `foto-fout/.../017.jpg`).
- De keuzeknoppen in het vlak heten voor een voorleesprogramma allemaal "Tel dit ding" (alleen in de code, niet in beeld).

## Goed bevonden (kort)

- Fouttabel per denkfout (te veel, te weinig, 2 keer geteld) met passende hints; nooit het goede getal in een hint.
- Samen tellen: "Tik op alle auto's. Ik tel hardop mee." blijft staan, het getal komt eronder (15.47); nummers boven de dingen; daarna groen + `goed-na-hulp`.
- Getallen in de kleur van de dingen (rode auto's: rode 8).

## Wat ik niet kon nagaan

- Echte stem, woord-oplichten en de geluiden zelf (headless, zonder geluid).
- Vloeiendheid (bewust niet), telefoon en tablet.


## Herstel (20 november 2026)

"Tel elk potlood mee, ook de laatste." werd "… ook het laatste." Het lidwoord volgt nu het woord (ook in "En het laatste is 8."). Ook nagekeken in alle gouden lessen: alleen Rekenmix 1 (potlood) en Rekenmix 4 (raketje, ruimteschip) hadden een het-woord; Tellen, Meer-minder en Rekenmix 3 gebruiken de-woorden. Fouttabel-script en speelcontrole GOED: in orde.
