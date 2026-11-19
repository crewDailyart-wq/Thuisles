# Geluiden van de gouden lessen

In de gouden lessen klinkt een kort geluid als het kind antwoordt.
Er zijn 4 vaste plekken. Elke plek is 1 bestand in deze map.

| Plek | Bestand | Wanneer |
|---|---|---|
| goed in 1 keer | `goed.wav` | Het kind heeft het meteen goed. |
| goed na hulp | `goed-na-hulp.wav` | Goed na een tip, na een 2e poging of na samen doen. |
| nog niet goed | `nog-niet-goed.wav` | Het antwoord is nog niet goed. Heel zacht, nooit een zoemer. |
| beloning | `beloning.wav` | Voor later (een beloning, zoals een sleutel). Speelt nu nog nergens. |

## Een geluid vervangen

1. Zoek of maak een nieuw geluid.
2. Geef het precies dezelfde naam als hierboven, bijvoorbeeld `goed.wav`.
3. Zet het in deze map (`public/geluiden/`) en vervang het oude bestand.

Meer hoeft niet. De les pakt vanzelf het nieuwe geluid.

Let op:
- Het bestand moet **.wav** zijn. Heb je een mp3? Vraag Claude om hem om te zetten.
- **Kort:** liefst korter dan 0,6 seconde. Bliepo wacht hooguit ongeveer een halve seconde met praten. Een langer geluid loopt door onder zijn stem.
- **Zacht:** het geluid wordt nog iets zachter gezet, maar kies geen hard geluid.
- Gebruik geen geluid van Synthesis of een ander platform.

## Wanneer klinkt het?

- Alleen in de nieuwe gouden lessen.
- Pas na de eerste tik van het kind (eerder laat de browser geen geluid toe).
- Niet als de knop "Geluidjes" bovenin uit staat, of als de ouder de geluidjes heeft uitgezet.
- Eerst het geluid, daarna pas de zin van Bliepo.

## Bron

De geluiden die er nu staan zijn tijdelijk. Ze zijn **door code gemaakt, vrij te gebruiken**
(`scripts/maak-geluiden.mjs`, 19 november 2026). Opnieuw maken: `node scripts/maak-geluiden.mjs`
(een bestaand bestand wordt niet overschreven; met `OVERSCHRIJF=1` wel).

De geluidjes in de map `les/` horen bij de oudere lessen en blijven zoals ze zijn.
