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

## 19 november 2026 (later): Ronde 51 punt 10 en 13 uitgevoerd (besluit Sara)

Elke zin bleef op zijn plek in het rijtje; robotplekken, de kijkvraag-plek (4), "Goed gekozen!" (26) en "Gevonden!" (6) zijn gelijk. `nooit-dubbel.ts` is niet veranderd. Oude zinnen staan in WEGGEHAALD.md. Per zin oud / nieuw / doorgevoerd of afgewezen (met reden): RIJTJES-RESULTAAT-WARMER.md.

**Punt 13, warmer (16 doorgevoerd, 9 afgewezen):**

| Rijtje, plek | Oud | Nieuw |
|---|---|---|
| LOF 2 | Helemaal goed! | Helemaal goed, knap van jou! |
| LOF 4 (kijkvraag) | Dat heb je goed gezien. | Dat heb je goed gezien, zeg! |
| LOF 7 | Heel goed! | Heel goed, ik ben blij! |
| LOF 12 | Goed zo! | Goed zo, dat kun jij! |
| LOF 17 | Netjes! | Netjes gedaan, hoor! |
| LOF 21 | Top! | Top, daar word ik blij van! |
| LOF 32 (robot) | Mijn scherm is helemaal groen. Goed zo! | Mijn scherm is helemaal groen. Dat komt door jou! |
| LOF 37 (robot) | Mijn scherm straalt groen! | Mijn scherm straalt groen voor jou! |
| LOF 39 (robot) | Die bewaar ik in mijn geheugen. Goed zo! | Die bewaar ik in mijn geheugen. Fijn! |
| BEVESTIG 2 | Nu heb je hem. | Nu heb je hem! |
| BEVESTIG 3 | Die is goed. | Die is goed. Fijn! |
| BEVESTIG 4 | Zo is het. | Zo is het. Goed doorgezet! |
| BEVESTIG 7 | Nu zit het goed. | Nu zit het goed. Mooi! |
| EINDE 1 | Goed gedaan! Tot de volgende keer. | Goed gedaan! (na de tik op de kaart: "Ik zie je graag de volgende keer.") |
| EINDE 7 | Dat was de les. Tot snel! | Dat was de les. Ik vond het fijn. (na de tik: "Tot snel!") |
| EINDE 8 (robotplek) | Alles is af. De les is klaar! | Alles is af. Wat ben jij goed bezig geweest! |

**Punt 10, het afscheid na de kaart (BOUWREGELS 15.50):** EINDE 9 (robot) "Deze les bewaar ik in mijn geheugen. Tot de volgende keer!" werd bij de kaart "Deze les bewaar ik in mijn geheugen."; "Tot de volgende keer!" komt na de tik. Hoe: `EINDE_AFSCHEID` (zelfde plekken als `EINDE`) en `afscheidNa(eind)` in `squla-klok-gouden-zinnen.ts`; alle 21 gouden lessen en `squla-extra-basis.ts` zeggen eerst "eindzin + Tik op de kaart.", wachten op de tik en zeggen dan het afscheid (als die eindzin er een heeft). De klok zei nog geen "Tik op de kaart."; die heeft nu dezelfde 3 varianten als de andere lessen (`VAR.kaartTik`), zodat de opdracht het laatste in beeld is (15.37).

**Stem:** "Helemaal goed!" en "Zo is het." hadden een bewaarde opname; de nieuwe zinnen komen in de Ruth-ronde (DESIGN-LATER.md).
