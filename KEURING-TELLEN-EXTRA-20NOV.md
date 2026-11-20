# Keuring Tellen extra (squla-tellen-fruit-1-gouden-extra) — 20 november 2026

Onafhankelijke keurder (deel 3). Er is **niets** aan lessen, code of zinnen veranderd; dit is alleen een rapport.
Getest als Testkind op http://localhost:3000. Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keur3/` (mappen `foto-goed/…-extra`, `foto-allefout/…-extra`, `test-tellen-extra-*`).

## Oordeel: GOEDGEKEURD (met opmerkingen voor Sara)

## Wat gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-tellen-extra-gouden.ts` | goed (382 combinaties, 23 rijen, geen verklapper, nooit "fout"). Fouttabel-bestand bleef gelijk. |
| speelcontrole GOED | tot het eind, 0 fouten; F11 0, F16 0; 4 met zin, 1 stil |
| speelcontrole ALLEFOUT | tot het eind, 0 fouten; 26 keer telwoord met opdracht erboven (15.47); `goed-na-hulp` 5 = 5 keer samen doen (15.49) |
| `test-tellen-extra-gouden.mjs` goed, fout1, allefout | alle 3 tot de eindkaart; denkfouten vastgelegd; database niets bijgekomen |
| Tellen in de schermfoto | vraag 1: 8 peren, 9 appels, 6 pruimen, 4 citroenen — klopt met de code |

## Opmerkingen

1. **Het lijstje gebruikt het keerteken**: "4 × appel", "7 × peer", "10 × pruim" (`src/components/les/vlakken/squla-tellen-extra-vlak.tsx:110`, foto `foto-goed/…-extra/002.jpg`). Groep 3 kent "×" niet. Twijfel 15.48 / 14.33; ernst klein tot middel. Voor Sara.
2. Taal (15.48): "Kies eerst een fruit en tik dan op de vakjes." (`squla-tellen-extra-zinnen.ts:112`): "een fruit" is geen goed Nederlands; bijvoorbeeld "Kies eerst een soort fruit". Klein.
3. De pruim lijkt op een paarse appel (zelfde vorm met blaadje), foto `foto-goed/…-extra/001.jpg`. Alleen de kleur onderscheidt hem. 14.23, klein.
4. Bij het samen tellen van peren én pruimen krijgt elk nummer de kleur van zijn eigen fruit (1 2 3 paars, 4 groen, ...), terwijl het één telling is. Te verdedigen (2.1), maar het kan een kind verwarren. Twijfel, klein.
5. Zelfde als Tellen: bij een stil goed antwoord loopt het natellen zonder tekst, met alleen de pijl. Klein.

## Nagekeken en in orde

- Keuzes (fruitsoorten, getallen) rechts onder Bliepo (15.32); bij het lijstje kies je de soort in het lijstje links (dat is een voorwerp in het beeld).
- Vraag of opdracht altijd in beeld (F16 0); bij samen tellen blijft de opdracht staan (15.47).
- Na samen tellen/maken groen + `goed-na-hulp` (15.49).
- Eind: eindzin + "Tik op de kaart." (of variant) als laatste; afscheid pas na de tik (`squla-tellen-extra-gouden.tsx:553-556`); kaart links.
- Getallen in de kleur van het fruit; "tot wel 10" wit.
- Geen vertaalde Synthesis-zinnen gevonden (15.41), geen "nagekeken", disco, "vinkje"; cijfers.

## Niet kunnen nagaan

Echte stem, of de geluiden echt klinken, de duur van het rode scherm, tablet/telefoon, vloeiendheid (bewust later). Inhoud t.o.v. Squla (15.8) is hier niet van toepassing op dezelfde manier: dit is de extra les met de Synthesis-opdrachten (besluit Sara 20.3).
