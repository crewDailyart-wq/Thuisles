# Rondjescontrole B (6 november 2026)

Opgenomen met een eigen opnamescript (elke ~0,6 s een foto, contactbladen `film-NN.jpg` in `public/rondje-controle/<les>/`), omdat het standaardscript maar 1 foto per zin maakt en bij korte zinnen de zin en het beeld door elkaar haalde. Oordelen: `src/app/voorbeeld/lessen-bijhouden/rondje-oordelen-B.json`.

| Onderwerp | Lessen opgenomen | Oordeel |
|---|---|---|
| Getallenlijn | dieren-2 (kaarten ordenen), terugtellen-1 (lichtslinger) | goed, goed |
| Huisnummers | squla-huisnummers | goed na reparatie |
| Dagen | squla-dagen-van-de-week | goed |
| Rekentaal | squla-rekentaal | goed |
| Meten | oppervlakte-1, pizza-1 | goed, open |
| Tijd | kalender-1, dagen-1 | goed, goed na reparatie |
| Minsommen | min-ruimte-1, min-bus1-1, min-machine-1 | goed, goed, open |
| Klok | hoelaat-1, klokkijken2-1 | goed, open |

## Gerepareerd
- `src/components/les/lessen/squla-huisnummers.tsx` (regel 224, uitleg): `licht: 0` werd `licht: null`. Eerst stond er al een rondje om huis 21 bij de zin "Ik loop langs de huizen. Elk volgend nummer is 1 meer" (te vroeg). Nu komt het rondje pas bij "21". Opnieuw opgenomen: klopt.
- `src/components/les/lessen/squla-tijd.tsx` (squla-tijd-dagen-1, bij "De week begint op maandag"): `zetT(l, { licht: [0] })` erbij. Eerst bleef het rondje om zondag staan terwijl Bliepo maandag zei. Opnieuw opgenomen: klopt.
- Kopieen van de oude bestanden: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/squla-huisnummers.tsx.bak` en `.../squla-tijd.tsx.bak`.

## Bewust laten staan / vragen voor Sara
1. Pizza (meten-pizza-1): bij "Die is het grootst" geen rondje om de grote pizza (alleen gele streepjes). Rondje erbij?
2. Machine (min-machine-1): geen rondje bij "10 stippen", "er gaan er 3 weg", "tel alleen de gekleurde stippen". Rondje erbij?
3. Klokkijken2-1: de aangewezen klok krijgt nog een gouden ring (oud oplichten). Weg laten of houden?
4. "Blijft staan tijdens de vraag": Huisnummers (rondje om het lege huis), Min-ruimte (rondje om de 3 ballonnen die blijven), Min-bus (rondje om de 5 pakjes in de bus). Zo deed het oude oplichten het ook. Zo laten?
5. Tijd-dagen-1 (en tijd-dagen-2/3, niet opgenomen): in de code staan nog plekken waar 2 rondjes tegelijk kunnen staan, bv. `licht: [6, 0]` (zondag en maandag) bij "Zondag is de laatste wagon. Daarna begint de week weer bij maandag" en bij de vraag "Welke dag staat vooraan". Niet opgenomen, dus niet aangepast.
6. Het rondje om de klok in tijd-kalender-1 is groot en gaat links voorbij de rand van het scherm.

## NIET GEZIEN
- De echte duur van de zinnen met stem: in de opname duren zinnen ~0,3-1 s (geen stem), dus of een rondje precies samenvalt met het gesproken woord kon ik niet zien. Wel gezien: welk ding, in welke volgorde, nooit 2 tegelijk (behalve de twijfelgevallen hierboven), en weg voor de vraag.
- Het hangen van 20 seconden in squla-tijd-kalender-1: niet gezien (hele uitleg ~13 s).
- Momenten na een FOUT antwoord (hints) en de tweede-fout-route: niet opgenomen.
- Niet opgenomen: getallenlijn-kat/rangschikken/dieren-1/3, klok-klokkijken-*, klokkijken1/3, hoelaat-2/3, meten-hoeveelheden, minsommen-bus2/kaal, tijd-tijden, tijd-kalender-2, rekentaal (andere vraagsoorten).
- Een paar tussenmomenten (maandag/donderdag in dagen, 8 bij klokkijken2) vielen tussen twee foto's.
