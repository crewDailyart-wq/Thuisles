# Controle herstel groep C, ronde 2 — 7 november 2026

Onafhankelijke controleur. Getest als Testkind in `/voorbeeld/les/<id>`, zonder stem, met eigen schermfoto's.
Laptop 1440 × 900 en telefoon 390 × 844. Telkens 1 eigen Chrome tegelijk. Niets aangepast, niets in de database gezet.
Geen foutmeldingen in alle runs.

Fotomap (paden hieronder zijn relatief aan deze map):
`/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keurC2/`
`L/` = laptop, `T/` = telefoon, `X/` = extra proef, `RL/` en `RT/` = regressie laptop en telefoon.
Laptopfoto's zijn verkleind (0,6×).

## GOEDGEKEURD

1. **squla-min-ruimte-1, -2, -3 — 4 sommen.** Alle 4 sommen staan helemaal in beeld, met ruimte tot de rand en
   tot de microfoonknop (`L/squla-min-ruimte-2-v07.jpg`, `L/squla-min-ruimte-1-v06.jpg`, `L/squla-min-ruimte-3-v07.jpg`).
   Telefoon: 2 × 2, vrij van de microfoon (`T/squla-min-ruimte-2-v07.jpg`, `T/squla-min-ruimte-3-v07.jpg`).
   **Zin en knoppen in dezelfde volgorde**: "Is het 16, 14 of 13?" bij knoppen 16 14 13 (`L/squla-min-ruimte-2-v04.jpg`),
   ook v05 en v15; op de telefoon "Is het 14, 13 of 16?" bij 14 13 16 (`T/squla-min-ruimte-2-v04.jpg`).
   Rijen met 3 sommen ongewijzigd (`L/squla-min-ruimte-2-v06.jpg`).
2. **squla-plus-bakkerij-1 — 4 sommen.** Rij past, raakt de microfoon niet (`L/squla-plus-bakkerij-1-v05.jpg`);
   telefoon 2 × 2 (`T/squla-plus-bakkerij-1-v05.jpg`).
3. **squla-plus-kaal-1/2/3 en typvraag bakkerij-3 op telefoon.** Som is nu groot en groter dan het plusteken,
   1 invulvak van ongeveer 80 × 68 beeldpunten, met `inputMode="numeric"` en `pattern="[0-9]*"`. Een getypt cijfer
   staat groot in het vak (`X/kaal1-tel-getypt.jpg`). Foto's: `T/squla-plus-kaal-1-v01.jpg`, `T/squla-plus-kaal-2-v01.jpg`,
   `T/squla-plus-bakkerij-3-v12.jpg`.
4. **squla-rekenmix-mix1-1 — potloden.** Groot en dicht bij elkaar (`L/squla-rekenmix-mix1-1-v03.jpg`,
   `T/squla-rekenmix-mix1-1-v03.jpg`).
5. **squla-min-machine-4 — munten.** Laptop: munten groot, "2" en "1" goed leesbaar. Ze staan er na ±1 seconde,
   samen met de knoppen, ook bij een koude start (`X/machine4-lap-t00400.jpg` alles nog aan het invagen,
   `X/machine4-lap-t01098.jpg` alles staat er). Telefoon: kleiner, maar 2 euro en 1 euro zijn uit elkaar te houden (grootte
   en cijfer) (`T/squla-min-machine-4-v01.jpg`, uitvergroot `zoom-munten.jpg`).
6. **squla-splits-splitsen2-1 — beginscherm.** Tegels in dezelfde volgorde als bij de eerste vraag: laptop 10 4 14
   (`L/squla-splits-splitsen2-1-v00-begin.jpg` vs `-v01.jpg`), telefoon 14 4 10 (`T/...-v00-begin.jpg` vs `-v01.jpg`).

## REGRESSIE (Lesscherm.module.css en Lesscherm.tsx) — GOEDGEKEURD

Kort gespeeld op laptop en telefoon: squla-klok-hoelaat-1, squla-klok-klokkijken3-4, squla-meten-pizza-1,
squla-tellen-fruit-1, squla-piraat-1, squla-plus-dansen-1. Niets over elkaar, niets achter knoppen of microfoon,
knoppen op de gewone plek naast/onder de zin.
Foto's: `RL/squla-klok-hoelaat-1-v02.jpg`, `RL/squla-klok-klokkijken3-4-v01.jpg`, `RL/squla-meten-pizza-1-v03.jpg`,
`RL/squla-tellen-fruit-1-v03.jpg`, `RL/squla-piraat-1-v04.jpg`, `RL/squla-plus-dansen-1-v02.jpg` en dezelfde namen in `RT/`.
De klok mag op de telefoon groeien (nieuw): grote klok, ballon eronder, geen overlap (`RT/squla-klok-hoelaat-1-v02.jpg`,
`RT/squla-klok-klokkijken3-4-v01.jpg`).

## Opmerkingen (geen afkeuring, Sara beslist)

- Op de laptop zijn 4 getalknoppen (bv. "4 16 5 3") nu smaller dan 3 getalknoppen in dezelfde les
  (`L/squla-min-ruimte-1-v04.jpg`); klein verschil.
- Op de telefoon staan 4 getalknoppen als 3 + 1 (`T/squla-min-ruimte-1-v04.jpg`); dat was al zo.
- Bakkerij-3 "Welke 2 sommen passen erbij?": de 4 somkaartjes zijn op de telefoon klein (`T/squla-plus-bakkerij-3-v06.jpg`);
  niet in deze herstelronde.
- Piraat op de telefoon: alles vrij klein bovenin (`RT/squla-piraat-1-v04.jpg`); was al zo, geen gevolg van deze wijziging.
- Nog open uit ronde 1: "Hoeveel is 7 − / 4?" breekt midden in de som (niet aangepast, raakt alle lessen).

## Samenvatting
Alle 6 afkeuringen uit ronde 1 zijn opgelost en GOEDGEKEURD op laptop en telefoon. De gedeelde wijzigingen in het
lesscherm breken de andere lessen niet (klok, meten, tellen, piraat, plus). 4 kleine opmerkingen voor Sara, geen
nieuwe afkeuring.
