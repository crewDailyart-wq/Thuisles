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


## Herstel (20 november 2026)

"Dan is er geen school." werd "In het weekend is er geen school." Niet veranderd: de dagkaarten onder de trein (vraag voor Sara, KEUZES-VOOR-SARA.md Ronde 53 punt 2). Fouttabel-script en speelcontrole GOED: in orde.

## Herstel 2 (20 november 2026, besluit Sara Ronde 53 punt 2)

- **De dagkaarten staan nu rechts, onder Bliepo's zin** (15.32), niet meer links onder de trein. Zelfde wagons, kleuren en bordjes. Ze zijn in HTML getekend (rechts valt buiten het Phaser-canvas), net als de kaartjes van Meten. Kaarten met 1 dag: 3 naast elkaar. Kaarten met 2 dagen (weekend): 2 + 1, iets kleiner, zodat ook een zin van 4 regels en het vinkje erboven passen. Het rode rondje en het hulphandje komen bij de kaart op de nieuwe plek.
- Zinnen: niets veranderd.
- Gecontroleerd met schermfoto's en `scripts/test-tijd-gouden.mjs` (nieuwe controle: een kaart raakt nooit de zin, Bliepo of het vinkje, en blijft in het tekstvak): routes goed en fouten "Alles in orde". Fouttabel-script in orde. Speelcontrole goed en allefout: tot het eind.
- Klein punt: bij een gekozen weekendkaart staat het groene vinkje op de hoek van de kaart en bedekt het een stukje van het rechter bordje.

## Herstel 3 (20 november 2026, besluit Sara): vinkje boven de weekendkaart
- Het groene vinkje op een gekozen weekendkaart (kaart met 2 dagen) staat nu BOVEN de kaart, in het midden. Het naambordje is helemaal leesbaar. Om plek te maken staan de 2 kaarten van de bovenste rij iets verder uit elkaar (38 in plaats van 18), zodat het vinkje van de kaart eronder tussen die 2 kaarten past. Kaarten met 1 dag houden het vinkje op de hoek (daar was het geen probleem). Code: `squla-tijd-gouden-vlak.tsx` (`TUSSEN_DUBBEL`, `vinkBoven`), `squla-tijd-gouden.module.css` (`.vinkjeBoven`).
- Niet gelukt: de weekendkaarten groter maken. Geprobeerd met 0.8 (was 0.75): dan raakt de bovenste rij het vinkje van het lesscherm en de zin van 4 regels. Ze blijven 0.75.
- `test-tijd-gouden.mjs` kijkt nu ook of het vinkje op de kaart de zin of het vinkje van het lesscherm raakt.
- Na het herstel: `test-tijd-gouden.mjs` ONTWERP 1280x720, routes goed en allefout met foto's: Alles in orde (kaart over zin 0, over Bliepo 0, buiten het vak 0). Fouttabel-script in orde.
- Speelcontrole GOED en ALLEFOUT: allebei tot het eind, 0 fouten.
