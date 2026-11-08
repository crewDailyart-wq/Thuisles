---
name: phaser-vloeiend
description: "Elke Phaser-opdracht moet vloeiend lopen (±60 beelden/s op de laptop van de eigenaar); altijd meten in een echte Chrome met GPU, niet alleen headless."
metadata:
  node_type: memory
  type: feedback
  originSessionId: 898e19d0-30cf-41fb-b2df-e9e93328f8ce
  modified: 2026-10-27T01:11:16.253Z
---

Alles wat ik met Phaser bouw (opdrachten, spelletjes, proefjes) moet vloeiend lopen, en ik test daar zelf op vóór ik het af meld (eigenaar, 27 okt 2026: "zorg ervoor dat bij toekomstige opdrachten Phaser vloeiend verloopt, test hier ook op").

**Why:** het eerste parels-proefje (/voorbeeld-phaser) haalde op de laptop van de eigenaar maar 13–15 beelden/s; slepen liep achter de muis aan. Oorzaak: het Glow-filter van Phaser 4 (filters.external.addGlow) werd elk beeld opnieuw uitgerekend voor elk object. Headless Chrome (poort 9337, SwiftShader) liet dat niet zien.

**How to apply:**
- Meten in een echte Chrome met GPU: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9338 --user-data-dir=<scratchpad>/chrome-echt`, tab naar voren (Target.activateTarget + Page.bringToFront), dan 3 s requestAnimationFrame tellen. Eis: ongeveer 60 (een lege pagina haalt 61 op deze laptop), langste beeld onder ~35 ms. Ook tijdens slepen meten, en controleren dat het object precies op de muispositie staat. Venster daarna weer dichtdoen.
- Daarnaast de trage-telefoontest (laadtijd) blijven doen.
- Dure effecten (glow, blur, shaders/filters) niet per beeld laten draaien op objecten die stilstaan of alleen verschuiven: één keer "bakken" in een DynamicTexture (`addDynamicTexture(...).draw(obj).render()`), daarna een gewoon plaatje. Live filters alleen als het effect zelf moet bewegen, en dan meten.
- Haalt het de 60 niet: oorzaak zoeken (aan/uit-vergelijking met een `?`-schakelaar) vóór ik iets online zet. Zie [[stijlkiezer]] voor de rest van de kinderkant.
