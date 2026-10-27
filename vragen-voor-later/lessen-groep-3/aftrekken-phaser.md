# Vragen: Aftrekken in Phaser (27 oktober 2026)

Lessen A1, A2, A3, A7 (`lessen/aftrekken-tot-10.tsx`) en A8, A9
(`lessen/getallenlijn.tsx`). Per vraag staat wat ik nu gekozen heb.

1. **"Naar de les" bij 2× fout in een toets (A1, A7).** Het lesscherm kan niet
   naar een andere les springen. Nu: Bliepo zegt het antwoord en "Dat leren we
   samen in de les.", en de toets gaat door. Aan het eind: "Je kunt minsommen
   maken onder de 10" (hooguit 2 fout) of "Een paar sommen leren we nog samen
   in de lessen". Moet de toets echt naar de eerste les gaan (dan is er iets
   nodig in het lesscherm)?
2. **15 toetsvragen (A1, A7).** Synthesis heeft 5 toetsvragen (welke som, de
   som, tot 0, het verschil, het verschil als som). Ik heb er 10 korte
   toetsvragen bij gezet: 5 minsommen met het potje en 5 keer het verschil
   tussen twee palen, met dezelfde hulp als de toets. Goed zo?
3. **Titel A2.** De les heet nu "Vuurvliegjes laten wegvliegen" (LESSENPLAN.md).
   In `src/lib/lessen/catalogus.ts` staat nog "Stippen weghalen"; die mag ik
   niet aanpassen. Graag daar ook veranderen.
4. **Keuzes met woorden.** Een paar keuzes zijn nog een woord (Ja, Nee, Hoger,
   Lager, Plussom, Minsom, Oranje, Paars, "Van 5 tot 8"...). Ze zijn zo kort
   mogelijk gemaakt en Bliepo leest ze voor als het kind erop tikt. Liever
   plaatjes (bijv. een pijl omhoog/omlaag, een gekleurd lampje)?
5. **Tikvlakken op de telefoon.** Het vlak wordt op een telefoon ±0,4 keer zo
   groot. De knoppen in het vlak zijn daarom 120 punten (48 px). Op de
   lantaarntjeslijn kan dat niet: 11 of 14 lantaarntjes naast elkaar passen
   niet in 48 px per stuk op 390 px breed. Nu: zo breed als kan (±31 px bij
   0–10, ±25 px bij 0–13) en hoog (±68 px). Goed genoeg, of de lijn op de
   telefoon in twee stukken?
6. **"Weet ik niet" bij het somvakje (A8, A9).** Het vakje in de som bovenaan
   heeft geen vraagteken-knop (zoals Synthesis). Bij 2× fout springt het
   vuurvliegje het voor en zegt Bliepo het antwoord; de som komt aan het eind
   terug. Goed zo?
7. **A9: "in één sprong" (10 − 5).** LESSENPLAN noemt "Ben je zeker? Dan in één
   sprong", maar INSPIRATIE.md labelt dat deel als groep 4. Ik heb het erin
   gelaten (één opgave), omdat LESSENPLAN het noemt. Eruit?
8. **A9: oefensommen.** Synthesis oefent daarna met 17 − 14, 25 − 22 (groep 4).
   Voor groep 3 zijn het 12 eigen sommen tot 13 met een verschil tot 10
   (bijv. 9 − 6, 12 − 8, 13 − 7). Het vuurvliegje staat steeds al op het
   kleinste getal. Goed zo?
9. **A8: spel van 10 sommen** in plaats van 5 (om aan 15 opgaven te komen),
   met 10 lampjes bovenaan.
10. **A2: oefensommen erbij.** 9 − 3, 7 − 7 en 6 − 2 erbij gezet (Synthesis: 5 − 4,
    12 − 9, 8 − 7, 14 − 11), zodat het er minstens 15 zijn. Wat twee keer mis
    gaat, komt aan het eind één keer terug.
11. **Hetzelfde verschil** (aftrekken-zelfde-verschil) gebruikt nog de oude
    torens met ruimteschepen; die les hoorde niet bij deze opdracht.
12. **Kaarttekeningen.** Mijn lessen hebben een nieuwe kaart (potje met
    vuurvliegjes, lantaarnpalen, lantaarntjes). De oude tekeningen (bliksem,
    ruimteschepen, sterretje) blijven bestaan voor de andere lessen.
