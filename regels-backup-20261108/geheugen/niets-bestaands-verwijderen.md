---
name: niets-bestaands-verwijderen
description: "Harde permanente afspraak — bij een wijziging aan een bestaand scherm in Thuisles mag niets wat er al stond verdwijnen, veld noch opgeslagen waarde."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f37105ec-c6e0-497e-8ae2-a3645fc43f3c
  modified: 2026-09-14T16:39:47.542Z
---

Bij elke wijziging aan een bestaand scherm, formulier of functie in Thuisles
(kinderkant, ouderomgeving, beheeromgeving) blijft **alles wat er al stond**
werken en zichtbaar. Nooit een veld, knop, instelling of functie verwijderen
zonder dat de gebruiker daar expliciet om vraagt. Bij twijfel: vragen, niet
verwijderen.

Dit geldt ook voor opgeslagen waarden, niet alleen voor wat je op het scherm
ziet.

**Why:** "Vragen per oefensessie" moest twee keer gebouwd worden. Het veld
verhuisde op verzoek naar het sjabloonscherm, maar `bewerkLeerdoel` bleef
`vragenPerSessie` meesturen. Dat veld stond niet meer in dat formulier, dus
kwam het leeg binnen en werd als `null` over het opgeslagen getal geschreven —
wie daarna een leerdoeltitel aanpaste, raakte de instelling kwijt zonder
zichtbare fout.

**How to apply:** maak vóór en ná een wijziging aan een bestaand scherm een
lijst van labels, knoppen en keuzelijsten, vergelijk die, en meld elk verschil
expliciet — ook kleine, ook logische. Verplaats je een veld naar een ander
scherm, controleer dan dat de serveractie van het oude scherm het veld niet
meer meestuurt. De regel staat ook bovenaan `CLAUDE.md` als harde regel 1.
Zie ook [[nooit-zelf-content-aanmaken]].
