# Keuring Tellen (squla-tellen-fruit-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 3). Er is **niets** aan lessen, code of zinnen veranderd; dit is alleen een rapport.
Getest als Testkind op http://localhost:3000. Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keur3/` (mappen `foto-goed/squla-tellen-fruit-1-gouden`, `foto-allefout/…`, `test-tellen-*`).

## Oordeel: GOEDGEKEURD (met kleine opmerkingen)

## Wat gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-tellen-gouden.ts` | goed (113 beweringen, 683 combinaties, 783 paren, kiezer 0 keer dubbel). Fouttabel-bestand bleef gelijk. |
| speelcontrole GOED | tot het eind, 0 fouten; F11 0, F16 0; 9 met zin, 6 stil |
| speelcontrole ALLEFOUT | tot het eind (297 stappen), 0 fouten; 208 keer telwoord met opdracht erboven (15.47); `goed-na-hulp` 15 = 15 keer samen tellen (15.49) |
| `test-tellen-gouden.mjs` goed, allefout | "Alles in orde", database niets bijgekomen |
| Inhoud t.o.v. de oude les (15.8) | zelf vergeleken: de 15 vragen en keuzes (`squla-tellen-gouden-zinnen.ts:58-74`) zijn gelijk aan `squla-tellen.tsx:547-572` (FRUIT1) |

## Kleine opmerkingen

1. Taal (15.48): "Er ligt 1 pruim minder." en "Er liggen een paar peren minder." (`squla-tellen-gouden-zinnen.ts:193-194`) klinken krom; bedoeld is "Er is 1 pruim minder" of "Er liggen minder pruimen". Klein.
2. Het fruit is vrij klein (peer ongeveer 50 × 75 punten, foto `foto-goed/…/001.jpg`); wel goed telbaar in rijen van 5. Klein.
3. Zelfde als Rekenmix 4: bij een stil goed antwoord loopt het natellen zonder tekst, met alleen de blauwe pijl (`foto-goed/…/002.jpg`). Klein.

## Nagekeken en in orde

- Rijen van 5, telbaar; getallen in de kleur van het fruit; keuzes rechts onder Bliepo (15.32).
- Bij samen tellen blijft de opdracht staan, met het getal eronder (15.47/F19, 208 keer gemeten).
- Hint na de 1e fout zonder antwoord (bijvoorbeeld "Je koos 10. Zoveel liggen er in de volle rijen. Kijk ook naar de laatste rij en tel opnieuw."); bij de 2e fout mag het (15.11).
- Na samen tellen groen + `goed-na-hulp` (15.49, F20).
- Eind: eindzin + "Tik op de kaart." als laatste; kaart links (15.46, 15.50).
- Geen vertaalde Synthesis-zinnen meer gevonden in de lijsten die ik las (15.41); geen "nagekeken", disco, "vinkje"; cijfers.

## Niet kunnen nagaan

Echte stem (ook "1...1" bij Ruth, F8), of de geluiden echt klinken, de duur van het rode scherm, tablet/telefoon, vloeiendheid (bewust later).
