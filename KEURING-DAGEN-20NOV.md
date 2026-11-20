# Keuring Dagen van de week (squla-dagen-van-de-week-gouden) — 20 november 2026

Onafhankelijke keurder (deel 1). Er is **niets** aan de les veranderd; dit is alleen een rapport.

## Uitslag: AFGEKEURD (1 fout, ernst middel)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-dagen-gouden.ts` | goed: 17 vragen + 2e weekendvraag, 65 foute antwoorden, 1768 varianten, geen hint die verklapt, waarheid klopt. Inhoud gelijk aan de oude les (15.8). FOUTTABEL-bestand kwam er ongewijzigd uit. |
| speelcontrole GOED (`GOED=1 ALLES=1`) | goed, tot het eind; F16 0, 15.47 0, F11 0; GOED-REACTIE 12 met zin, 5 stil, 0 zonder zin |
| speelcontrole ALLEFOUT | goed, tot het eind; F16 0, 15.47 0, F11 0; 16 met zin na hulp, 0 zonder zin (15.49 goed) |
| `test-dagen-gouden.mjs` route kleur + goed | goed (eindkaart vrij, pijl vanzelf ±0,7 s, F7/F8 0, geen overlap of sprong) |
| `test-dagen-gouden.mjs` route allefout (met foto's) | "Alles in orde": 34 keer rondje bij fout, 0 keer om het antwoord; F7 0, F8 0; eindkaart vrij; database niets bijgekomen |
| `test-dagen-gouden.mjs` alle routes in 1 keer | na 10 minuten gestopt (werkwijze: hooguit 10 min per proces); route "fouten" daardoor niet afgemaakt |
| begincontrole (`vraag-aanwezig-controle.mjs`) | goed: alleen achtergrond + ronde afspeelknop (15.38) |

Schermfoto's: scratchpad `k20d1/foto-GOED`, `k20d1/foto-ALLEFOUT`, `k20d1/testfoto-dagen`, `k20d1/testfoto-dagen-gouden`.

## Fout

1. **Woord past niet bij het beeld (15.36, 15.48; "woorden passen bij beeld").** Bij "Welke dag komt na/vóór …?" zegt Bliepo "Tik op de goede kaart." en bij samen doen "Tik jij op de kaart in het rondje?", maar de keuzes zijn getekend als **wagons** (zelfde wagontekening als de trein). Een kind ziet geen kaart.
   - Plek: `src/components/les/lessen/squla-dagen-gouden-zinnen.ts:192-193` (vraag), `:225` en `:279` (samen/hand), tekening `src/components/les/vlakken/squla-dagen-gouden-vlak.tsx:16` ("dezelfde wagontekening").
   - Foto: `testfoto-dagen/kleur-vraag4-na-dinsdag-1-vraag.png`, `-samen.png`.
   - Ernst: middel. Oplossing is aan de bouwer/Sara: of "wagon" zeggen, of er echt kaarten van maken.

## Opmerkingen (geen afkeur, wel nakijken)

- **Zweven (15.34, twijfel):** de 3 keuze-wagons onder de trein staan los in de lucht, zonder rails. Het zijn keuzes, maar een wagon hoort op rails.
- **Pijl zonder tekst:** bij "stil bij goed" (15.39) staat de blauwe pijl 1 s alleen in beeld, met een leeg tekstvak (foto `foto-GOED/.../003.jpg`). Dit zit in het gedeelde lesscherm (`Lesscherm.tsx` rond regel 875, `spreek([])`), dus in alle gouden lessen. Sara beslist of dat mag.
- Taal klein: "Na is de dag die erachter komt." (hint) leest raar zonder aanhalingstekens; "Kijk, ik tik hem aan. Nu heb je allebei de dagen." na het vangnet (Bliepo deed het, niet het kind).

## Goed bevonden

Afspeelknop (15.38), vraag altijd in beeld (15.37), geen dubbele tekst (15.31), geen "nagekeken" (15.45), geen "vinkje" in een zin, eindzin dan "Tik op de kaart." en afscheid pas na de tik (15.50, `squla-dagen-gouden.tsx:816-829`), eindkaart links naast het tekstvak (15.46), na samen doen groen + goed-na-hulp (15.49, `:528-529`), rondje nooit om het antwoord (15.17), cijfers in zinnen (3.20), 2 pogingen (15.11). Geen Synthesis-zinnen gevonden (dagen heeft geen Synthesis-les).

## Niet kunnen nagaan

- Echte stem (Ruth) en woorden die meelichten: alleen met browserstem/zonder geluid getest.
- Geluiden zelf gehoord: nee (zonder geluid getest; de controle meldt alleen welke plek klonk).
- Vloeiendheid: bewust niet gemeten (pas aan het eind).
- Route "fouten", "weer", "vangnet", "wachten" van het testscript: niet apart gedraaid (tijdslimiet).
