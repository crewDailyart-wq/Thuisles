# Keuring Huisnummers (squla-huisnummers-gouden) — 20 november 2026

Onafhankelijke keurder (deel 1). Er is **niets** aan de les veranderd; dit is alleen een rapport.

## Uitslag: GOEDGEKEURD (met 2 opmerkingen)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-huisnummers-gouden.ts` | goed: 17 vragen, 47 foute antwoorden, 919 varianten, geen verklappen, inhoud gelijk aan de oude les (15.8). Bestand ongewijzigd. |
| speelcontrole GOED | goed, tot het eind; F16 0, 15.47 0, F11 0; 12 met zin, 5 stil |
| speelcontrole ALLEFOUT | goed, tot het eind; 16 met zin na hulp, 0 zonder zin (15.49 goed) |
| `test-huisnummers-gouden.mjs` route allefout (foto's) | na 10 minuten gestopt (werkwijze) bij de laatste vraag (17 van 17); geen fout gemeld tot dat moment; foto's van alle 17 vragen |
| begincontrole | goed (15.38) |

Foto's: scratchpad `k20d1/foto-GOED/squla-huisnummers-gouden/`, `k20d1/testfoto-huisnummers-gouden/`.

## Opmerkingen (geen afkeur)

1. **Hint bijna het antwoord (15.17, twijfel):** bij "Welk huisnummer komt na 39?" zegt de hint "Met 41 sla je een huis over. Begin bij 39 en tel 1 verder." (`squla-huisnummers-gouden-zinnen.ts:294`, ook `:301` "Begin bij … en tel 1 terug"). Dat is een rekenstap, niet het antwoord zelf, en het fouttabelscript keurt hem goed. Maar voor een kind is "39 en 1 verder" bijna het antwoord. Sara beslist of dat te veel is.
2. **Zweven (15.34, twijfel):** de huizen om uit te kiezen bij "Sleep het goede huis naar de lege plek" staan onder de straat in de lucht. Het zijn keuzes die je sleept; nakijken of dat mag.

Kleine dingen: pijl zonder tekst bij "stil bij goed" (gedeeld lesscherm); bij hardop tellen ("27.") staat de punt in oranje en het getal wit (woord-oplichten).

## Goed bevonden

Afspeelknop, vraag altijd in beeld, typen in een echt invulvak op het bordje (HARDE REGEL 5), keuzes rechts onder Bliepo, huizen staan op de straat, rondje alleen om wat Bliepo noemt, geen dubbele tekst, geen "nagekeken", eindzin + "Tik op de kaart." en afscheid na de tik (`squla-huisnummers-gouden.tsx:642-649`), eindkaart links, groen + geluid na samen doen, 2 pogingen, cijfers. De zin "Je ging een beetje te ver." (vertaald) is eerder vervangen (15.41).

## Niet kunnen nagaan

Echte stem, geluiden horen, vloeiendheid (bewust niet), de laatste vraag en de eindkaart in het testscript (tijdslimiet; de speelcontrole kwam wel tot de eindkaart).

## HERSTELD 20 november 2026: opmerking 1 (hint)

- Opmerking 1 (15.17): beoordeeld als verklappen. "Begin bij 39 en tel 1 verder." is voor een kind bijna het antwoord (40), net als het eerder geschrapte "Begin bij de 5 en tel 1 streepje verder." bij Getallenlijn. Nu: "Begin bij huis 39 en tel in je hoofd verder." (en "… tel in je hoofd terug."). Het rondje om het buurhuis blijft. Oud naast nieuw: WIJZIGINGEN-ZINNEN-HUISNUMMERS.md.
- Fouttabel-script na het herstel: in orde (17 vragen, 919 varianten, geen verklappen).
- Opmerking 2 (zwevende huizen om te slepen): NIET HERSTELD, buiten de opdracht; het zijn keuzes die je sleept. Voor Sara.
