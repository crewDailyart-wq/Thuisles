# Rondje-controle A (6 november 2026, BOUWREGELS 7.8 en 12.13)

Opgenomen met `npm run rondjecontrole` (1 les tegelijk, als Testkind), foto's in `public/rondje-controle/<les>/`. Oordelen: `src/app/voorbeeld/lessen-bijhouden/rondje-oordelen-A.json`.

| Onderwerp | Les | Oordeel |
|---|---|---|
| Geld | squla-geld-geldmachine-1, squla-geld-zakgeld-1 | goed, goed |
| Splitsen | squla-splits-splitsen2-1 | fout (niet gerepareerd) |
| Splitsen | squla-splits-delen-1 | open |
| Piraat | squla-piraat-2 | open |
| Tellen | squla-tellen-fruit-1, squla-tellen-telrij-1 | open, open |
| Meer-minder | squla-meer-minder-evenveel1-1 | open (dit id is een telles met appels) |
| Vormen | squla-vormen-patronen-1 | goed |
| Plussommen | squla-plus-bakkerij-1 | goed (na reparatie) |
| Rekenmix | squla-rekenmix-mix1-1 | open |

## Gerepareerd
- `src/components/les/lessen/squla-plussommen.tsx` (bakkerijUitleg): het rondje om het nieuwe taartje bleef staan tijdens de vraag 'Hoeveel taartjes liggen er nu?' (gaat over alle taartjes). Nu `zet(l, { licht: [] })` voor de vraag, op 2 plekken. Opnieuw opgenomen: tijdens de vraag geen rondje. Kopie van het oude bestand: scratchpad/squla-plussommen.tsx.kopie.

## Bewust laten staan / vragen voor Sara
- splitsen2-1 (geld): 'Het briefje is al 10 euro. Tel de munten erbij.' staat onder 1 rondje om de munten (squla-splitsen.tsx regel 221-222). Het briefje krijgt nooit een rondje. Oplossing is de zin in 2 zinnen splitsen (nieuwe stemzinnen) of kiezen dat het rondje om de munten mag blijven. Mag ik splitsen?
- piraat-2, Nee-route: geen rondje bij 'Er gaat er 1 weg' enz.; het sleepvlak kent geen rondje. Willen jullie hier een rondje om de ster die weggaat?
- 'Blijft staan tijdens de vraag': geldmachine-1 (munt van 1 euro blijft staan bij 'Is dit een munt of een briefje?') en tellen-fruit-1 (rondje om de appel bij 'Tik steeds op de appel met de kring'). Niet als fout gezien.

## NIET GEZIEN
- Het script stopt bij de eerste vraag, dus latere uitlegstappen en Hulp na een fout zijn niet opgenomen.
- De korte rondjes (420 ms) bij tellen per voorwerp en bij het verdelen in delen-1 staan niet op de foto's.
- Telrij-1: uitleg niet gezien. Meer-minder echte vergelijking (meer/minder/evenveel met 2 groepen), Vormen en Rekenmix: maar 1 les/2e vraagsoort niet gezien. Geen tweede les per onderwerp opgenomen (tijd en zwakke computer). `npx tsc` niet gedraaid.
