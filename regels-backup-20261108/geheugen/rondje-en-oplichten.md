---
name: rondje-en-oplichten
description: "6 nov 2026: Bliepo wijst aan met een rood dubbel rondje (Magnific), oplichten alleen waar rondje onhandig is (klok-wijzers, Meten-schilderijen); regels 7.8/7.9 in BOUWREGELS.md"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 898e19d0-30cf-41fb-b2df-e9e93328f8ce
  modified: 2026-11-06T21:28:51.923Z
---

Sara (6 nov 2026): wat Bliepo aanwijst/noemt/telt krijgt een rood, met de hand getekend DUBBEL rondje (`public/rondje/rondje-rood-2.png`, hulp `src/components/les/holo/rondje.ts`) in plaats van gloed. Altijd maar één rondje tegelijk, op het moment dat Bliepo het noemt; het komt en gaat op dezelfde momenten als het oude oplichten (dat moment "was perfect"). Mag blijven staan tijdens de vraag als het aanwijst waar de vraag over gaat, MOET weg als het het antwoord verklapt.

**Why:** gloed was niet duidelijk genoeg; eerdere helpers lieten rondjes blijven staan of dubbel verschijnen.

**How to apply:** BOUWREGELS 7.8 (rondje) en 7.9 (oplichten). Oplichten = sterke glow langs de eigen rand van het ding, in zijn eigen kleur (klok: kleine wijzer oranje, grote paars), zacht pulserend, NOOIT een vlak/capsule/kader eromheen; alleen bij klok-wijzers (grote wijzer ook korter gemaakt, nooit over de 12) en de schilderijen bij Meten. Wagons van de weektrein houden een rondje. Oplicht-geluidje staat voorlopig UIT (`OPLICHT_GELUID = false`). Nooit rondje én oplichten op hetzelfde ding. Controle van het rondje echt op het scherm: `npm run rondjecontrole`, foto's op /voorbeeld/lessen-bijhouden. Zie [[werkwijze-lessen-uit-fouten]].
