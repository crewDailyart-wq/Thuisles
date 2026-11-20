# Keuring Tijd: Dagen van de week (squla-tijd-dagen-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 3). Er is **niets** aan lessen, code of zinnen veranderd; dit is alleen een rapport.
Getest als Testkind op http://localhost:3000. Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keur3/` (mappen `foto-goed/squla-tijd-dagen-1-gouden`, `foto-allefout/…`, `test-tijd-*`, `begin`).

## Oordeel: GOEDGEKEURD (met 1 vraag voor Sara)

## Wat gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-tijd-gouden.ts` | goed: inhoud, verklap- en waarheidscontrole in orde (12 vragen + terugkomende versie, 48 foute antwoorden, 877 varianten, 896 beweringen). Fouttabel-bestand bleef gelijk. |
| speelcontrole GOED | tot het eind, 0 fouten; F11 0, F16 0; 11 met zin, 4 stil |
| speelcontrole ALLEFOUT | tot het eind (104 stappen), 0 fouten; `goed-na-hulp` 8 keer |
| `test-tijd-gouden.mjs` goed, allefout, fouten | alle 3 "Alles in orde" |

## Vraag voor Sara (twijfel, geen afkeur)

1. **De antwoordkeuzes (dagkaarten/wagons) staan links onder de trein, niet rechts onder Bliepo's zin** (foto `foto-goed/…/003.jpg`, `test-tijd-goed/goed-vraag4-weekendWelke-1-vraag.png`). 15.32 noemt alleen Vormen en Meten uitdrukkelijk; de wagons kun je zien als "voorwerpen in het beeld" (dan mag het). 15.32 zegt: bij twijfel rechts en melden. Ik meld het; de getallen (1/5/2, 8/7/6) staan wél rechts.

## Kleine opmerkingen

2. "Dan is er geen school." als goed-reactie (`squla-tijd-gouden-zinnen.ts:275`): na een lofzin klinkt het los ("Goed zo! Dan is er geen school."). Klein (15.36).
3. Bij "Hoeveel dagen heeft het weekend?" staat alleen de locomotief in beeld (foto `foto-goed/…/004.jpg`): past, maar leeg. Al eerder gemeld.

## Nagekeken en in orde

- Begin: groet + "In deze les leer je hoe een week in elkaar zit. Elke dag is een wagon van de weektrein." met de hele trein in beeld (`begin/…-2s.png`), daarna "Wat is de eerste dag van de week? Tik op de goede kaart." Geen startvraag (geen Synthesis-les): goed.
- Een gekozen kaart krijgt een vinkje; de gloed om de wagons hoort bij het plaatje (15.33 aanvulling).
- Rondje alleen om wat Bliepo noemt (bij samen doen om de kaart in het rondje, `foto-allefout/…/020.jpg`), nooit om het antwoord bij een hint.
- Hint na de 1e fout verklapt niet ("De dag erna hoort op de lege plek. Kies nog een keer. Welke dag komt meteen na zaterdag?", met een lege plek achter zaterdag in beeld).
- Vraag altijd in beeld (F16 0); eind: "Deze les bewaar ik in mijn geheugen. Tik maar op de kaart."; kaart links (15.46, 15.50).
- Geen "nagekeken", disco, "vinkje" in een zin; cijfers.

## Niet kunnen nagaan

Echte stem, of de geluiden echt klinken (in beide speelcontrole-runs "stil: nog geen tik"), de duur van het rode scherm, tablet/telefoon, vloeiendheid (bewust later).
