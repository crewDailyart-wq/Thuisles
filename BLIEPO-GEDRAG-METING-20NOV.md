# Bliepo-gedrag in de gouden lessen: meting 20 november 2026

**Opdracht Sara (20 nov):** werkt Bliepo in alle gouden lessen (18 + 3 extra's = de 21 uit het lesoverzicht) precies zoals bij Synthesis? Referentie: SYNTHESIS-ANALYSE/PIJL-KLOK.md en BOUWREGELS 15.27 en 15.39. Nieuwe regel: **BOUWREGELS 15.51**, fout **F21**.

**Hoe gemeten:** zichtbare Chrome (niet headless), elke les geopend met een echte klik in het lesoverzicht `http://localhost:3000/alle-lessen.html`, als Testkind, met de echte stem (browserstem op volume 0, opnames van Ruth gedempt; geen tegoed gebruikt). De speler antwoordt goed en tikt **zelf nooit** op de pijl. Een meter in de pagina (`scripts/bliepo-gedrag-meter.js`) kijkt elke 40 ms naar de tekst, de pijl en de stem, en tikt bij 2 à 3 gewone stukken zelf op de pijl terwijl Bliepo praat. Per les ±2 minuten. Samenvatting: `node scripts/bliepo-gedrag-meting.mjs <map>`. Werkwijze: BOUWREGELS 15.51.

**De 4 vragen:**
1. Staat de pijl in beeld terwijl Bliepo praat? (aantal gewone stukken met pijl / gemeten stukken)
2. Tik op de pijl tijdens het praten: stopt de stem meteen, en gaat de les meteen door? ("door" = de les gaat verder; "nieuwe tekst" = wanneer de volgende tekst er staat)
3. Goed antwoord met een zin: gaat de les vanzelf door (zonder tik), en hoe lang na het groene scherm / na het einde van Bliepo's zin? (Synthesis: ±0,6–0,8 s na de stem)
4. Goed antwoord in stilte (alleen groen): vanzelf door, na hoeveel seconden, en staat er een pijl?

## Uitkomst NA de herstelling (alle 21 lessen)

| Les | 1 Pijl tijdens praten | 2 Tik tijdens praten | 3 Goed met zin: vanzelf door | 4 Stil goed: vanzelf door, pijl? |
|---|---|---|---|---|
| Dagen | 15/15 | stem stopt 0 ms, door 4 ms, nieuwe tekst 27/10 ms (2x) | ja, 5.5-7.8 s na groen; 0.9 s na de stem (10x) | ja, 1.4-1.6 s (7x), pijl nee |
| Geld | 14/14 | stem stopt 1 ms, door 5 ms, nieuwe tekst 33/39 ms (2x) | ja, 5.6-7.9 s na groen; 0.9 s na de stem (10x) | ja, 1.4-1.6 s (5x), pijl nee |
| Getallenlijn | 16/16 | stem stopt 0 ms, door 4 ms, nieuwe tekst 6/16 ms (2x) | ja, 5.0-9.1 s na groen; 0.9 s na de stem (11x) | ja, 1.4-1.6 s (5x), pijl nee |
| Huisnummers | 15/15 | stem stopt 0 ms, door 5 ms, nieuwe tekst 19/33 ms (2x) | ja, 5.3-7.1 s na groen; 0.9 s na de stem (9x) | ja, 1.4-1.6 s (6x), pijl nee |
| Klok | 20/20 | stem stopt 1 ms, door 4 ms, nieuwe tekst 1520/28 ms (2x) | ja, 2.7-8.9 s na groen; 0.7 s na de stem (12x) | ja, 2.1-2.1 s (1x), pijl nee |
| Meer-minder | 13/13 | stem stopt 0 ms, door 3 ms, nieuwe tekst 29 ms (1x) | ja, 4.8-7.0 s na groen; 0.9 s na de stem (10x) | ja, 1.6-1.6 s (5x), pijl nee |
| Meten | 15/15 | stem stopt 1 ms, door 6 ms, nieuwe tekst 29/32 ms (2x) | ja, 5.1-6.9 s na groen; 0.9 s na de stem (10x) | ja, 1.4-1.6 s (4x), pijl nee |
| Minsommen | 11/11 | stem stopt 1 ms, door 3 ms, nieuwe tekst 28/21 ms (2x) | ja, 5.4-7.6 s na groen; 0.9 s na de stem (8x) | ja, 1.6-6.4 s (3x), pijl nee |
| Plussommen extra | 7/7 | stem stopt 1 ms, door 3 ms, nieuwe tekst 3057/2748 ms (2x) | ja, 4.1-10.3 s na groen; 0.7 s na de stem (7x) | ja, 1.4-1.4 s (2x), pijl nee |
| Plussommen | 26/26 | stem stopt 1 ms, door 5 ms, nieuwe tekst 23/32/41 ms (3x) | ja, 5.4-7.5 s na groen; 0.9 s na de stem (8x) | ja, 1.6-1.6 s (3x), pijl nee |
| Rekenmix 1 | 13/13 | stem stopt 0 ms, door 6 ms, nieuwe tekst 25 ms (1x) | ja, 4.3-6.1 s na groen; 0.9 s na de stem (10x) | ja, 1.4-1.6 s (5x), pijl nee |
| Rekenmix 2 | 12/12 | stem stopt 0 ms, door 4 ms, nieuwe tekst 34 ms (1x) | ja, 5.1-7.8 s na groen; 0.9 s na de stem (10x) | ja, 1.6-1.6 s (5x), pijl nee |
| Rekenmix 3 | 14/14 | stem stopt 1 ms, door 6 ms, nieuwe tekst 16/23 ms (2x) | ja, 5.2-7.1 s na groen; 0.9 s na de stem (11x) | ja, 1.6-1.6 s (4x), pijl nee |
| Rekenmix 4 | 15/15 | stem stopt 0 ms, door 4 ms, nieuwe tekst 16/34 ms (2x) | ja, 4.6-7.3 s na groen; 0.9 s na de stem (13x) | ja, 1.6-1.6 s (2x), pijl nee |
| Rekentaal | 15/15 | geen tik gelukt | ja, 4.8-8.5 s na groen; 0.9 s na de stem (13x) | ja, 1.4-1.6 s (3x), pijl nee |
| Splitsen extra | 10/10 | stem stopt 1 ms, door 5 ms, nieuwe tekst 32/160 ms (2x) | ja, 4.1-8.9 s na groen; 0.9 s na de stem (6x) | ja, 1.6-1.6 s (2x), pijl nee |
| Splitsen | 12/12 | stem stopt 1 ms, door 3 ms, nieuwe tekst 12/9/8 ms (3x) | ja, 0.5-4.7 s na groen; 0.7 s na de stem (5x) | ja, 1.6-1.6 s (2x), pijl nee |
| Tellen extra | 5/5 | geen tik gelukt | ja, 5.6-6.7 s na groen; 0.9 s na de stem (3x) | ja, 1.4-1.4 s (1x), pijl nee |
| Tellen | 12/12 | stem stopt 0 ms, door 3 ms, nieuwe tekst 31 ms (1x) | ja, 4.5-7.3 s na groen; 0.9 s na de stem (9x) | ja, 1.4-1.6 s (6x), pijl nee |
| Tijd | 13/13 | stem stopt 1 ms, door 3 ms, nieuwe tekst 34 ms (1x) | ja, 5.8-9.0 s na groen; 0.9 s na de stem (10x) | ja, 1.4-1.6 s (5x), pijl nee |
| Vormen | 14/14 | stem stopt 1 ms, door 3 ms, nieuwe tekst 31/39 ms (2x) | ja, 4.6-7.6 s na groen; 0.9 s na de stem (9x) | ja, 1.4-1.6 s (5x), pijl nee |

Overal: **ja / ja / ja / ja, geen pijl**. Uitleg bij een paar getallen:
- **"nieuwe tekst" ruim 1 tot 3 s** (Klok 1,5 s; Plussommen extra 2,7–3,1 s): de stem stopt en de les gaat meteen door (3–5 ms), maar de les speelt dan eerst een animatie die bij de inhoud hoort (de klok rolt uit, de bakkerij vult). Dat is geen fout van de pijl.
- **Minsommen stil goed tot 6,4 s:** na het goede antwoord draait de machine eerst (naspelen); ook dan geen pijl en geen tekst.
- **"0,9 s na de stem"** (Klok 0,7 s): de les wacht na Bliepo's zin 0,7 s (15.27) en in de meeste lessen nog 0,15 s voor het nieuwe beeld van de volgende vraag. Dat ligt rond Synthesis (±0,6–0,8 s); niet veranderd.
- **Rekentaal en Tellen extra, vraag 2 "geen tik gelukt"** in deze ronde: de meter vond geen gewoon stuk dat lang genoeg duurde. In de eerste ronde (zelfde dag, zonder de laatste herstelling) wél: stem stopt 0–1 ms, door 3–5 ms.

## Wat er NIET klopte (vóór de herstelling) — in alle 21 lessen

Alle drie zaten in het gedeelde lesscherm (`src/components/les/Lesscherm.tsx`), dus in elke gouden les hetzelfde. Opgelost op 1 plek; de lesbestanden zijn niet veranderd.

| Wat | Gemeten vóór | Na |
|---|---|---|
| **A. Stil goed: pijl boven een leeg tekstvak** (de bekende melding, rond regel 875) | in de klokles 2 keer ±1,4 s; in de code in alle 21 | geen pijl meer (21/21) |
| **B. Stil goed: Bliepo las de oude vraag verder voor bij een leeg tekstvak** (als het kind al koos terwijl hij de vraag nog voorlas) | Dagen 3x, Geld 5x, Getallenlijn 5x, Huisnummers 5x, Klok 1x (de andere lessen werden al na de herstelling gemeten) | de stem stopt meteen bij stil goed (21/21) |
| **C. Na een antwoord stond de pijl al onder de oude vraag**, ±0,5 s vóór Bliepo's reactie (die wachtte op het geluid, 15.40) | alle 21 lessen, bij elk antwoord gemiddeld 0,45–0,49 s | de pijl komt tegelijk met de reactie (21/21) |

Vraag 1 tot en met 3 klopten al in alle lessen: de pijl staat er tijdens het praten, een tik stopt de stem binnen 1 ms en de les gaat binnen 3–7 ms door, en na goed gaat de les vanzelf door.

## Wat niet na te gaan was
- Op telefoon en tablet niet gemeten (pas aan het eind, BOUWREGELS bovenaan).
- Met de echte stem van Ruth (hoorbaar) niet: de browserstem stond op volume 0, de opnames waren gedempt; de tijden zijn wel echt.
- Vraag 2 en 4 bij een **fout** antwoord (de hint) niet apart gemeten; herstelling C geldt daar ook (zelfde code).
- In Tellen extra kwam bij 1 goed antwoord het 2e zinnetje van de lof niet als aparte stem in de meting (2,3 s na de stem); waarschijnlijk een meetfout (de opname startte buiten het zicht van de meter).

## Eindcontrole (na de herstelling)
`node scripts/speelcontrole.mjs` met GOED en met ALLEFOUT (F7=1), alle 21 gouden lessen: **alle 42 keer tot het eind**, F7, F8, F11, F16 en 15.47 overal 0. Splitsen en Splitsen extra liepen met 4 lessen tegelijk 1 keer vast (de speler kreeg een sleep- of plusstap niet gedaan omdat de laptop druk was); apart opnieuw gespeeld: GOED en ALLEFOUT allebei tot het eind, alles 0. De fouttabellen zijn niet opnieuw gedraaid: er zijn geen zinnen veranderd.
