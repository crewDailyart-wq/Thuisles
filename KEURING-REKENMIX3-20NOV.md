# Keuring Rekenmix 3 (squla-rekenmix-mix3-4-gouden) — 20 november 2026

Onafhankelijke keurder (deel 2). Er is **niets** aan de les, de code of de zinnen veranderd; dit is alleen een rapport.
Gespeeld als Testkind via `/voorbeeld/les/squla-rekenmix-mix3-4-gouden?naam=Testkind`.

## Uitslag: GOEDGEKEURD (met opmerkingen)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-rekenmix3-gouden.ts` | goed: 15 vragen van `squla-rekenmix-mix3-4` vergeleken (ding, doos of zak, totaal, deel buiten, keuzes = gelijk, 15.8), 30 foute antwoorden, 259 beweringen waar, het goede getal nooit genoemd, altijd een vraag na de hint |
| `node scripts/speelcontrole.mjs` GOED | goed tot het eind (18 stappen); F16 0, 15.47 0, F11 0; 9 met zin, 6 stil |
| `node scripts/speelcontrole.mjs` ALLEFOUT | goed tot het eind (108 stappen); F16 0, 15.47 0 (58 keer telwoord mét opdracht erboven), F11 0; `goed-na-hulp` 15 keer, altijd met zin (15.49) |
| `RUSTIG=1` speelcontrole GOED | F16 0 bij 15 wachtmomenten van 3 s |
| Begin zonder tik | alleen de lesachtergrond met de ronde afspeelknop (15.38) |
| `test-rekenmix3-gouden.mjs` kleur, goed, fouten, allefout, anderefout | alle 5 "Alles in orde"; reacties passen bij de keuze (te weinig, "buiten" genoemd); database 0 nieuwe regels |
| Antwoordplek (15.32) | goed: cijfers rechts onder Bliepo's zin |
| Einde (15.50, 15.46) | goed |

Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/k20d2/foto-goed/`, `foto-fout/`, `tfoto/rekenmix3/`.

## Kleurregel (speciaal gevraagd): in orde

Het totaal staat in de kleur van de dingen, op beide plekken: "Er zijn **8** ballen." met een rode 8 en in het splitsbeen
bovenaan ook een rode 8 (ballen = rood); bij knikkers is alles blauw ("Er zijn **10** knikkers.", splitsbeen 10 en 7 blauw).
Het testscript (route kleur) mat alle getallen in Bliepo's tekst: ballen rgb(255,123,123), knikkers rgb(143,196,255).
Het vraagteken (wat je zoekt) is wit. De twijfel uit de keuring van 19 november (totaal wit in het splitsbeen) is opgelost
(`vlakken/squla-rekenmix-gouden-vlak.tsx:336-339`). Foto's `foto-goed/.../001.jpg` en `002.jpg`.

## Opmerkingen (geen afkeur)

- **Ballen en doos staan niet op dezelfde hoogte (14.23/15.34, twijfel):** de ballen liggen in een rij hoger dan de onderkant van de doos, zonder ondergrond; het lijkt alsof ze iets zweven naast de doos die op de vloer staat (`foto-goed/.../001.jpg`).
- Het deel dat je ziet (5) en het totaal (8) hebben dezelfde kleur, omdat het dezelfde dingen zijn. Dat volgt de regel (kleur van het voorwerp), maar het kind ziet in het splitsbeen geen verschil tussen totaal en deel.

## Goed bevonden (kort)

- Hints zeggen waar het om gaat ("Tel verder vanaf 3.", "Buiten liggen er 5. Tel door tot 8.") zonder het antwoord; de vraag komt terug.
- Samen tellen: "Tik op de nieuwe ballen. Ik tel verder." blijft staan, getal eronder (15.47); daarna groen + `goed-na-hulp`.
- Grammatica "er zat 1" / "er zaten 4" via een hulpfunctie.

## Wat ik niet kon nagaan

- Echte stem, woord-oplichten en de geluiden zelf (headless, zonder geluid).
- Vloeiendheid (bewust niet), telefoon en tablet.
