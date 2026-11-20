# Keuring Meer-minder (squla-meer-minder-evenveel2-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 1). Er is **niets** aan de les veranderd; dit is alleen een rapport.

## Uitslag: GOEDGEKEURD

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-meer-minder-gouden.ts` | goed: 15 vragen, 30 foute antwoorden, reken- en verklapcontrole in orde. Bestand ongewijzigd. (Dit script vergelijkt de inhoud niet met de oude les; dat heb ik niet apart met de hand gedaan, zie onderaan.) |
| speelcontrole GOED | goed, tot het eind; F16 0, 15.47 0, F11 0; 10 met zin, 5 stil |
| speelcontrole ALLEFOUT | goed, tot het eind; **15.47: 0 keer alleen een telwoord, 19 keer telwoord mét opdracht erboven** (B7 werkt); 15 met zin, 0 zonder zin (15.49 goed) |
| `test-meer-minder-gouden.mjs` route allefout | na 10 minuten gestopt zonder uitslag (laptop zeer druk, load ±20); geen bruikbare uitkomst |
| begincontrole | goed (15.38) |

Foto's: scratchpad `k20d1/foto-GOED/squla-meer-minder-…/`, `k20d1/foto-ALLEFOUT/squla-meer-minder-…/`.

## Gezien als kind

- "Op welke kaart liggen de meeste koekjes?": 3 kaarten met 12, 14 en 13 koekjes in rijen van 5, goed telbaar; de gekozen kaart krijgt alleen een vinkje (7.8a).
- Samen tellen: "Nu jij! Tik op de kralen in de laatste rij." met het getal 15 boven de kralen en de laatste rij nog vaag; de opdracht blijft staan terwijl Bliepo meetelt (15.47).

## Goed bevonden

Afspeelknop, vraag altijd in beeld, geen getallen boven de groepen zolang de vraag open is, keuzes rechts onder Bliepo, geen dubbele tekst, geen "nagekeken", eindzin + "Tik op de kaart." en afscheid na de tik (`squla-meer-minder-gouden.tsx:737-744`), eindkaart links, na samen tellen groen + geluid vlak vóór de slotzin (`:492-496`), 2 pogingen, cijfers, hints verklappen niet. Vertaalde Synthesis-zinnen zijn eerder vervangen (15.41); ik vond er geen meer (alleen vergeleken met het Nederlandse draaiboek).

## Opmerking

Pijl zonder tekst bij "stil bij goed": gedeeld lesscherm, zie Dagen.

## Niet kunnen nagaan

Echte stem, geluiden horen, vloeiendheid (bewust niet), het testscript (tijdslimiet), en inhoud vraag voor vraag tegen de oude les (geen script daarvoor; eerdere keuring vond het gelijk).
