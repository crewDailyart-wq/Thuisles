# Keuring Geld (squla-geld-geldmachine-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 1). Er is **niets** aan de les veranderd; dit is alleen een rapport.

## Uitslag: AFGEKEURD (1 fout, ernst middel)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-geld-gouden.ts` | goed: 12 vragen, 25 foute antwoorden, 728 varianten, geen verklappen, waarheid klopt; inhoud gelijk aan de oude les (15.8). Bestand ongewijzigd. |
| speelcontrole GOED | goed, tot het eind; F16 0, 15.47 0, F11 0; 10 met zin, 5 stil |
| speelcontrole ALLEFOUT | goed, tot het eind; 15 met zin, 0 zonder zin (15.49 goed) |
| `test-geld-gouden.mjs` route allefout (foto's) | "Alles in orde": rondje 25 keer bij fout, 0 keer om het antwoord; pijl vanzelf; F7/F8 0; geen overlap/sprong; eindkaart vrij; database niets bijgekomen |
| begincontrole | goed (15.38) |

Foto's: scratchpad `k20d1/foto-ALLEFOUT/squla-geld-…`, `k20d1/testfoto-geld-gouden/`.

## Fout

1. **Zin past niet bij het beeld (15.36, 15.48).** Bij de vraag met de munten zegt Bliepo "Oei, het geld zweeft! Er zweven 3 munten van 1 euro." (of "Het geld zweeft."), maar in beeld liggen de munten en de knoop stil in een raster van 6 vakken; er zweeft niets (geen beweging in het vlak).
   - Plek: `src/components/les/lessen/squla-geld-gouden-zinnen.ts:184`.
   - Foto: `testfoto-geld-gouden/allefout-vraag8-bellen-m1-1-vraag.png`.
   - Ernst: middel. (In de oude les zweefde het geld wel "door de ruimte"; in de gouden les niet meer.)

## Opmerkingen

- Pijl zonder tekst bij "stil bij goed": zelfde als bij Dagen (gedeeld lesscherm).
- Lichte vakken om de munten: dat zijn keuzevakken (mag), geen witte rand om een plaatje.
- Briefjes zonder "SPECIMEN": volgens Sara's besluit van 12 november niet meer ter discussie.

## Goed bevonden

Afspeelknop, vraag altijd in beeld, "Wat is dit?"-knoppen rechts onder Bliepo (15.32), geld als voorwerp in beeld bij "Waar zie je …?" (uitzondering 15.32), geen dubbele tekst, geen "nagekeken", eindzin + "Tik op de kaart." en afscheid na de tik (`squla-geld-gouden.tsx:826-833`), eindkaart links, groen + geluid na samen doen, hints verklappen niet, cijfers, 2 pogingen. Geen Synthesis-zinnen (Geld heeft geen Synthesis-les).

## Niet kunnen nagaan

Echte stem, geluiden horen, vloeiendheid (bewust niet), de overige testroutes (goed, fouten, weer, vangnet, wachten) los: niet gedraaid door de tijdslimiet; de speelcontrole GOED dekt de goede route wel.
