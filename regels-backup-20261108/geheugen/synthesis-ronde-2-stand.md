---
name: synthesis-ronde-2-stand
description: "Ronde 2 is af (10 okt 2026); waar ronde 2 (alles opnieuw spelen en elke begeleiderzin noteren) gebleven is, stand 9 okt 2026, en hoe verder te gaan"
metadata:
  node_type: memory
  type: project
  originSessionId: 898e19d0-30cf-41fb-b2df-e9e93328f8ce
  modified: 2026-10-09T02:48:43.139Z
---

Ronde 2 van Synthesis (opdracht van de eigenaar, 9 okt 2026): alle 160 lessen opnieuw spelen en per stap elke zin van de begeleider in indirecte rede noteren, met labels groep 3 / 4 / 3 en 4 / 5+. Alleen spelen en noteren, niets bouwen, niets aan de website veranderen.

**Stand 10 okt 2026:** RONDE 2 AF — alle lessen (ook Getting Started en Flashcards 1–4) opnieuw gespeeld en genoteerd in INSPIRATIE.md. Tips: lesadressen zijn niet te raden (counting_clock bestaat niet, the_counting_clock wel) → open ze via Progress → unit → les. Bij keuzeknoppen linksonder Enter gebruiken. Wijzerklokken: tik wijzer + tik plek via nagebootste pointer-events en 3-4 s wachten (wijzer draait langzaam). a.m./p.m. moet je slepen. Bij lange pauze stopt een les en begint opnieuw. Let op: in sommige Mastery Checks (Expanding Numbers) sturen twee fouten op één vraag je terug naar de eerste les; doe dus maar één fout. Chrome moet vooraan en zichtbaar staan (anders stopt Synthesis: geen animatie, pauze); screenshots laten het venster verspringen en zetten de les soms op pauze, dus spaarzaam. Toetsen met tijdgrens: laat een snel script antwoorden (localStorage __h8–__h10: __adv, __a2, __autoSum, __plus).

Waar alles staat:
- INSPIRATIE.md (nooit committen; staat in .git/info/exclude): bovenaan labeltabel, afvinklijst en "Ronde 2 · stand"; aantekeningen onderaan onder "## Ronde 2 · aantekeningen per les".
- Reservekopie: ~/Documents/Thuisles-reserve/INSPIRATIE.md (na elke unit verversen).
- Screenshots: ~/Desktop/synthesis-screenshots/ronde-2/ (2 per les).

Werkwijze die werkt:
- Same Difference-achtige lessen: getypte antwoorden in het verschilscherm worden alleen goedgekeurd als ze kloppen (geen knop, geen reactie bij fout). Keuzevragen in toetsen hebben soms een blauw vinkje linksonder ter bevestiging.
- Asteroid Multiples (schietspel): hulpscript leest de getallen via een haak op canvas fillText en het schip via pixels; __astAll(N) speelt het af. Getallenlijn-lessen: __nl() (tikken, springen, invullen + SUBMIT).
- Stippen-lessen (delen): echte sleepbewegingen (left_click_drag) werken, nagebootste niet. Een stip die over een andere groep heen gaat plakt eraan vast: kort en door lege ruimte slepen. Dubbeltikken haalt een stip uit een groep. Hulpscripts staan in localStorage "__h" van tutor.synthesis.com (eval na elke navigatie).
- Nee bij "weet je dit al?", behalve Assessments en Mastery Checks (Ja → Test).
- Per les één keer goed en minstens één keer expres fout.
- Screenshots opslaan met de screenshot-optie save_to_disk en dan kopiëren. Nooit `screencapture` gebruiken: dat pakt het hele scherm van de eigenaar.
- De pijl kan met Enter. Tegels vallen in een vorm als je het vakje linksonder van de vorm tikt.
- Stippen slepen, lang drukken en dubbeltikken lukt alleen met nagebootste pointer-events via JavaScript.
- Sommige lessen (Dot Destruction) gaan na een paar seconden vanzelf door: elke 1,5 seconde kijken en gemiste zinnen eerlijk als gat noteren.

**Why:** de eigenaar wilde stoppen en vroeg uitdrukkelijk om te onthouden waar we gebleven waren.
**How to apply:** zegt de eigenaar "ga verder" met Synthesis/ronde 2, lees dan eerst "Ronde 2 · stand" in INSPIRATIE.md en ga door bij de volgende les. Werkt de Chrome-extensie niet: laat de eigenaar `/chrome` typen of de extensie in chrome://extensions uit- en aanzetten. Zie ook [[synthesis-doorspelen-stand]].
