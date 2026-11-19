# WIJZIGINGEN-ZINNEN-RIJTJES — oud naast nieuw

19 november 2026 (B9, rijtjes nalopen). De gedeelde rijtjes van alle gouden lessen (`src/components/les/lessen/squla-klok-gouden-zinnen.ts`: lof, momenten, naam, goed na een fout, snel, einde, groet, onduidelijk, aanmoedigen, overgang) zijn nagelopen. Het overzicht oud (gewone Squla-lessen) naast nieuw (gouden lessen) staat in RIJTJES-OUD-NAAST-NIEUW.md.

**Alleen duidelijke fouten zijn verbeterd.** De zinnen in de rijtjes zelf zijn niet veranderd; twijfelgevallen en voorstellen om ze warmer te maken staan als vraag in KEUZES-VOOR-SARA.md, Ronde 51. De oude lessen en `nooit-dubbel.ts` zijn niet aangeraakt.

## Verbeterd: de zin als er geen naam is

De functie `metNaam` haalt `{naam}` weg als er geen naam is. Daarbij ging de komma mis. Op het scherm met een naam verandert er niets; de stem (lib/stem-server.ts, `zonderNaam`) deed het al goed.

| Zin in het rijtje | Oud (zonder naam) | Nieuw (zonder naam) | Waarom |
|---|---|---|---|
| Goed zo, {naam}! | Goed zo,! | Goed zo! | losse komma voor het uitroepteken |
| Knap gedaan, {naam}! | Knap gedaan,! | Knap gedaan! | idem |
| Wat goed, {naam}! | Wat goed,! | Wat goed! | idem |
| Jij weet het, {naam}! | Jij weet het,! | Jij weet het! | idem |
| Ja {naam}, zo is het! | Ja zo is het! | Ja, zo is het! | na "Ja" hoort een komma |

Ongewijzigd goed bleven: "{naam}, dat is helemaal goed!" → "Dat is helemaal goed!", "Hoi {naam}! Fijn dat je er bent." → "Hoi! Fijn dat je er bent.", "Dat onthoud ik, {naam}: jij kunt dit!" → "Dat onthoud ik: jij kunt dit!", "{naam}, je snapt het al goed." → "Je snapt het al goed.".

Kinderen zagen de foute vorm nog niet: een les kiest een naamzin alleen als het kind een naam heeft. Maar de functie wordt door alle gouden lessen gebruikt, dus nu klopt het ook als dat ooit anders loopt.

## 19 november 2026: Ronde 51 uitgevoerd (alle punten met advies ja)

Op verzoek van Sara zijn alle punten van KEUZES-VOOR-SARA.md Ronde 51 met advies "ja" doorgevoerd in `squla-klok-gouden-zinnen.ts`. Elke zin bleef op dezelfde plek in zijn rijtje; robotplekken en de nakijkplek (`WAS_NAKIJKEN`) zijn gelijk. `nooit-dubbel.ts` is niet veranderd. Oude zinnen staan in WEGGEHAALD.md.

| Punt | Rijtje | Oud | Nieuw |
|---|---|---|---|
| 2 | MOMENT laatste (robot) | De laatste vraag, en weer een groen scherm! | De laatste vraag, en een groen scherm! |
| 3 | MOMENT 3 op rij | Het gaat steeds beter: al 3 goed! | Het gaat lekker: al 3 goed! |
| 4 | MOMENT eerste (nakijkplek) | Inderdaad, jij begint sterk! | Zie je, jij begint meteen goed! |
| 5 | EINDE | Klaar! Wat heb je goed je best gedaan. | Klaar! Wat heb je goed je best gedaan! |
| 6 | NAAM_LOF | Ja {naam}, zo is het! | Ja, {naam}, zo is het! (zonder naam: "Ja, zo is het!") |
| 7 | LOF | Dat weet jij al goed! | Dat weet jij al! |
| 9 | NAAM_LOF (robot) | Dat onthoud ik, {naam}: jij kunt dit! | {naam}, dat zet ik in mijn geheugen! (zonder naam: "Dat zet ik in mijn geheugen!") |

**Punt 1 (code):** "Goed gekozen!" (LOF, plek 26) en "Gevonden!" (BEVESTIG, plek 6) komen alleen nog als het kind net op een keuzeknop tikte. De zinnen staan nog in het rijtje; na tikken in het vlak, slepen of de wijzer zetten slaat de les ze over. Hoe: `alleenBijKeuze(l, LOF)` en `alleenBijKeuze(l, BEVESTIG)` in `squla-klok-gouden-zinnen.ts`, gebruikt in alle 19 gouden lessen en in `squla-extra-basis.ts` (de 3 extra's). De les onthoudt bij elke beurt of het antwoord van een keuzeknop kwam (`volgKeuzes`). Splitsen sloeg "Goed gekozen!" al altijd over; dat blijft zo.

**Punt 11 (code):** bij de klok zegt Bliepo bij het hulphandje (wijzer zetten, op een getal tikken) geen "Denk maar even na." meer (`AANMOEDIG_DENK`, naast `AANMOEDIG_KIEST`).

**Punt 12:** BLIEPO-KARAKTER.md is gelijk gemaakt aan de code: in §10 zijn "Er is nog een betere keuze." en "Ik zie een andere die beter past." weg (WEGGEHAALD.md); bij §3.2 "Na lang nadenken" staat dat de code dit nog niet gebruikt; bij §5 staat dat de andere groeten later gaan afwisselen.

**Stem:** de bewaarde opname van "Klaar! Wat heb je goed je best gedaan." past niet meer bij de zin met uitroepteken. Die moet bij de Ruth-ronde aan het eind opnieuw. De andere veranderde zinnen hadden nog geen opname.
