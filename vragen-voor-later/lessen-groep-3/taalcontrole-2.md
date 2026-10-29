# Taalcontrole 2 groep 3-lessen (28 oktober 2026)

Aanleiding: "Er zijn 18 lampen aan" moest "Er branden 18 lampen" zijn.
Nagelopen: alle zinnen en teksten in `src/components/les/lessen/*.tsx`
(12 bestanden) en de aria-labels/zichtbare teksten in `vlakken/*.tsx`.
Alleen tekst veranderd; geen getallen, logica, antwoorden of opmaak.
`npx tsc --noEmit` en `npx eslint` op de gewijzigde bestanden: schoon.

## Verbeterd (ongeveer 42 zinnen)

### verhaaltjessommen.tsx
| oud | nieuw |
|---|---|
| Er zweven er 2 / 5 weg (lichtjes, 3x) | Er vliegen er 2 / 5 weg |
| Ik blies N ballonnen op. Jij liet er W knappen. | Jij blies N ballonnen op. Daarna liet jij er W knappen. (met naam: de naam) |
| Dat is 'm. / Dat is hem. | Dat klopt. |
| Erbij past niet. | Erbij past hier niet. |
| Er zijn er nog 13 aan. / Er zijn er minder aan. (lampen) | Er branden er nog 13. / Er branden er minder. |
| Doe ze uit tot er nog {N} aan zijn. | ... tot er nog {N} branden. |
| Er staan _wat_ _bloemen_ (ook knikkers, paddenstoelen, munten; 6x) | Er staan _een_ _paar_ _bloemen_ |
| knop "Wat bloemen" / "Wat knikkers" | "Een paar bloemen" / "Een paar knikkers" |
| Er staan wat bloemen / Er gloeien wat paddenstoelen / Er zweven wat lichtjes (en vuurvliegjes) / Er zijn wat ballonnen / Er zitten wat vogeltjes / Je hebt wat munten (9x) | ... een paar ... |
| Maar laat de {W} vogeltjes maar wegvliegen. / ...ballonnen maar knappen. | Laat de {W} vogeltjes maar wegvliegen. (dubbele "maar" weg) |
| Zullen we hier even pauze van nemen? | Zullen we even pauze nemen? |

Lampzinnen gecontroleerd: "Er branden N lampjes/lantaarntjes/lampen", "Er
brandt nog {1} lampje", "Er gaat {1} lampje uit" kloppen bij 1 en bij meer.
De templates met mv()/stuks() en `=== 1` zijn nagelopen; geen "1 lampjes".

### getallenlijn.tsx
- We beginnen met op deze getallen te tikken. -> Eerst tikken we op deze getallen.
- Probeer opnieuw. -> Probeer het opnieuw. (2x, gelijk aan de andere plekken)

### vergelijken.tsx
- Dat is hem, naam. / Dat is hem. (2x) -> Dat klopt, naam. / Dat klopt.
- ... steken N vuurvliegjes boven uit -> ... bovenuit

### zo-werkt-het.tsx
- Tot je dienst! -> Ik help je graag! ("tot uw dienst" is een vaste uitdrukking, niet "je")
- Dank je dat je het zegt. (2x) -> Fijn dat je het zegt.

## Gecontroleerd en goed bevonden
aftrekken-tot-10, flitsen, klokkijken, optellen-tot-10, optellen-tot-20,
optellen-tot-100, tellen-holo, tellen-tot-120, tientallen en alle
aria-labels in vlakken/*: geen fouten gevonden die duidelijk fout zijn.

## Twijfelgevallen (niet veranderd, graag laten beslissen)
1. "Dubbelen" / "Op deze kaarten staan dubbelen." / "Je bent goed in
   dubbelen." (flitsen.tsx, optellen-tot-10.tsx, optellen-tot-20.tsx):
   "dubbelen" als zelfstandig naamwoord is niet gangbaar. Alternatief:
   "dubbelsommen". Het is ook een lestitel, dus niet zelf aangepast.
2. "Er gaan er nog 7 gloeien." (paddenstoelen, verhaaltjessommen.tsx):
   grammaticaal goed, maar een beetje moeilijk voor 6 jaar. Alternatief:
   "Er gaan er nog 7 aan." (het woord [gloeien] staat nog ergens als
   gemarkeerd woord, dus niet zonder meer te vervangen.)
3. "Er staan een paar bloemen" is nu ook gebruikt voor aantallen als 12 of
   17. Dat is de keuze van de eigenaar ("Een paar"); "wat" bleef staan in
   "Er komen er nog wat bij" en "Plant er nog wat bij" (dat is goed
   Nederlands).
4. aftrekken-tot-10.tsx: "Hier meldt het grondstation zich af." (slot van
   een les met ruimtethema) is radiotaal en voor 6 jaar niet vanzelf te
   begrijpen. Alternatief: "Het grondstation zwaait je uit."
5. "Je bent goed op dreef." (optellen-tot-100.tsx) is een vaste uitdrukking
   die 6-jarigen mogelijk niet kennen. Alternatief: "Je gaat goed."
6. Bliepo zegt bij ballonnen die wegvliegen "Laat de {W} ballonnen die
   wegvliegen maar knappen" (Pluis-verhaal "Er zijn N ballonnen op een
   feestje"): wegvliegen en knappen zijn twee dingen. Past dat bij wat in
   beeld gebeurt? Alleen de eigenaar ziet het beeld.
7. "Er zweven er N weg" bij lichtjes is nu "vliegen"; in een ander verhaal
   staat "ze weg te laten zweven" / "wegzweven" (lichtjes, groep 3-deel).
   Dat kan blijven; zeg het als het overal "vliegen" moet zijn.

## Let op
Gewijzigde zinnen hebben mogelijk geen opgenomen stem meer in de cache;
de browserstem leest ze nu gewoon voor. Staan ze in STEMZINNEN.md, dan moeten
ze daar opnieuw worden bijgewerkt.
