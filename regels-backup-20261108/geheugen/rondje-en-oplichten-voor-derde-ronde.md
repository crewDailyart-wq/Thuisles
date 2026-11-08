---
name: rondje-en-oplichten
description: "6 en 8 nov 2026: Bliepo wijst aan met een rood dubbel rondje alleen als hij iets noemt; bij een tik zachte gloed om de keuze, geen rood; oplichten alleen klok-wijzers en Meten-schilderijen; BOUWREGELS 7.8/7.9"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 898e19d0-30cf-41fb-b2df-e9e93328f8ce
  modified: 2026-11-06T21:28:51.923Z
---

Sara (6 nov 2026): wat Bliepo aanwijst/noemt/telt krijgt een rood, met de hand getekend DUBBEL rondje (`public/rondje/rondje-rood-2.png`, hulp `src/components/les/holo/rondje.ts`) in plaats van gloed. Altijd maar één rondje tegelijk, op het moment dat Bliepo het noemt; het komt ALLEEN als Bliepo het noemt (niet bij een tik van het kind) en blijft zolang Bliepo erover praat. Mag blijven staan tijdens de vraag als het aanwijst waar de vraag over gaat, MOET weg als het het antwoord verklapt. (De oude zin "op dezelfde momenten als het oude oplichten" is vervallen, 8 nov.)

**Why:** gloed was niet duidelijk genoeg; eerdere helpers lieten rondjes blijven staan of dubbel verschijnen.

**How to apply:** BOUWREGELS 7.8 (rondje) en 7.9 (oplichten). Oplichten = sterke glow langs de eigen rand van het ding, in zijn eigen kleur (klok: kleine wijzer oranje, grote paars), zacht pulserend, NOOIT een vlak/capsule/kader eromheen; alleen bij klok-wijzers (grote wijzer ook korter gemaakt, nooit over de 12) en de schilderijen bij Meten. Wagons van de weektrein houden een rondje (bevestigd 8 nov: wagons = rondje, klok = oplichten). Oplicht-geluidje staat voorlopig UIT (`OPLICHT_GELUID = false`). Nooit rondje én oplichten op hetzelfde ding. Controle van het rondje echt op het scherm: `npm run rondjecontrole`, foto's op /voorbeeld/lessen-bijhouden. Zie [[werkwijze-lessen-uit-fouten]].

**Update 8 nov 2026 (Sara, besluit 1-5, voorlopig tot de Synthesis-vergelijking):**
- Rondje alleen als Bliepo iets noemt. Bij tikken van het kind GEEN rondje, wel een zachte gloed om wat het kind koos (zoals bij Meten). Geen rood op wat het kind koos; alleen Bliepo's scherm kleurt rood bij fout en groen bij goed. Geen fout-geluidje.
- Het rondje blijft zolang Bliepo erover praat (geen korte flits van 420-800 ms). Normaal 1 rondje tegelijk; bij dingen die bij elkaar horen voor de som (optellen, aftrekken, splitsen, tellen, vergelijken, sprongen op de getallenlijn, begin- en eindtijd) blijft het genoemde als zachter rondje staan (fel = nu, zacht = hoorde er al bij). Bij "samen", "over" of het antwoord worden ze weer fel, daarna allemaal weg. Niet bij elkaar horend ("dit is maandag", "dit is dinsdag"): vorige rondje weg. Alleen rondjes, geen oplichten. Volg de Synthesis-draaiboeken waar het kan.
- Klok: oplichten langs de eigen rand van de wijzer (geen "zachte kleur achter de wijzer" meer). Wagons: rondje.
