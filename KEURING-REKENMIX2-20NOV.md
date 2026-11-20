# Keuring Rekenmix 2 (squla-rekenmix-mix2-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 2). Er is **niets** aan de les, de code of de zinnen veranderd; dit is alleen een rapport.
Gespeeld als Testkind via `/voorbeeld/les/squla-rekenmix-mix2-1-gouden?naam=Testkind`.

## Uitslag: GOEDGEKEURD (met opmerkingen)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-rekenmix2-gouden.ts` | goed: 15 vragen van `squla-rekenmix-mix2-1` vergeleken (boterham of spiesje, beleg, vraag, volgorde = gelijk, 15.8), 30 foute plaatjes, 495 beweringen waar, geen herhaling, altijd een vraag of opdracht na de hint |
| `node scripts/speelcontrole.mjs` GOED | goed tot het eind (35 stappen); F16 0, 15.47 0, F11 0; 10 met zin, 5 stil |
| `node scripts/speelcontrole.mjs` ALLEFOUT | goed tot het eind (118 stappen); F16 0, F11 0. De speler kon in de tekening niet altijd een fout plaatje kiezen (4 keer toch goed in één keer); geen les-fout |
| `RUSTIG=1` speelcontrole GOED | F16 0 bij 30 wachtmomenten van 3 s |
| Begin zonder tik | alleen de lesachtergrond met de ronde afspeelknop (15.38) |
| `test-rekenmix2-gouden.mjs` kleur, goed, fouten, allefout, anderefout | alle 5 "Alles in orde"; database 0 nieuwe regels |
| Antwoordplek (15.32) | de boterhammen en spiesjes zijn zelf de keuzes in het beeld (uitzondering 15.32), met een vinkje en de knop Controleer rechts onder de zin: goed |
| Einde (15.50, 15.46) | goed |

Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/k20d2/foto-goed/`, `foto-fout/`, `tfoto/rekenmix2/`.

## Opmerkingen (geen afkeur)

- **Spiesjes klein (14.23 "groot genoeg").** De spiesjes zijn dunne stokjes met kleine stukjes fruit, met veel lege ruimte eromheen (`foto-goed/.../001.jpg`). Te tellen, maar voor een kind van 6 aan de kleine kant; de boterhammen zijn wel groot.
- **Samen kijken na de 2e fout (15.11).** Bliepo noemt per plaatje hoeveel erop zit en vraagt dan "Weet jij nu welke boterham het is? Tik erop." Het goede plaatje wordt pas aangewezen (handje) na ± 6 s of na een andere tik (`squla-rekenmix2-gouden.tsx:279-341`). 15.11 zegt "nu pas het goede antwoord in beeld". Dit is goedgekeurde eigen invulling (B1), maar Sara kan kijken of dit genoeg "samen voordoen" is.
- Woord "leger" ("de boterham die leger is dan bovenaan") kan een kind verwarren met een leger; "met minder ... erop" is eenvoudiger (15.48, twijfel).
- De keuzes heten voor een voorleesprogramma "Tel dit ding" (alleen in de code).

## Goed bevonden (kort)

- Vraag altijd in beeld, ook na de hint ("Kijk eerst bovenaan, en dan naar de rest. Kies nog een keer. Op welke boterham zit evenveel komkommer?").
- Reacties passen bij de keuze (evenveel gekozen, meer gekozen, het tegenovergestelde, het middelste); 2× dezelfde keuze krijgt "Je tikte weer op dezelfde boterham."
- Lidwoorden kloppen (het spiesje / de boterham via de woordenlijst in de zinnen).

## Wat ik niet kon nagaan

- Echte stem, woord-oplichten en de geluiden zelf (headless, zonder geluid).
- Vloeiendheid (bewust niet), telefoon en tablet.


## Herstel (20 november 2026)

Bij samen kijken (na de 2e fout) wijst het handje het goede plaatje nu ± 1,5 s na Bliepo's opdrachtzin aan (was ± 6 s). Speelcontrole GOED en ALLEFOUT, fouttabel-script: in orde.
