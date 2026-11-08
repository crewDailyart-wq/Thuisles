---
name: lessen-groep3-stand
description: Stand 10 okt 2026: 87 uitleglessen groep 3 (naar Synthesis) gebouwd en met toestemming in de database gezet; wat nog open is
metadata:
  node_type: memory
  type: project
  originSessionId: 898e19d0-30cf-41fb-b2df-e9e93328f8ce
  modified: 2026-10-10T11:50:43.016Z
---

Op 10 okt 2026 bouwde Claude alle 53 groep 3-lessen naar Synthesis (opdracht eigenaar: zelfde stijl, layout, uitleg; mascotte wordt de tutor want groep 3 kan niet lezen; stem later via ElevenLabs; tekst naast mascotte mag).

- Code: `src/components/les/` (Lesscherm, draaiboeken per onderdeel in `lessen/`, speelvlakken in `vlakken/`, afspraken in `BOUWEN.md`). Lichte catalogus `src/lib/lessen/catalogus.ts`; oefentype `lesscherm`; kinderkant speelt de les schermvullend via de oefenpagina met `?leerdoel=`.
- Los bekijken: `/voorbeeld/les`.
- Vragen voor de eigenaar: `vragen-voor-later/lessen-groep-3/*.md`.
- 10 okt avond: tweede ronde (eigenaar: "alle domeinen, ga langs je notities") — 87 lessen, ook groep 3-delen uit groep 4-lessen; met uitdrukkelijke toestemming in de database gezet (Ronde 5 in AANGEMAAKT.md). Niets gecommit (branch godot-lessen).
- 11 okt 2026: verbeterronde (taal + keuzes) alleen groep 3; 25 lessen boven groep 3-niveau (optellen tot 100, tientallen, 10 erbij/eraf, klok kwart/minuten/digitaal) naar groep 4 verhuisd in de database, lijst in vragen-voor-later/lessen-groep-3/naar-groep-4.md. Groep 3 = tellen tot 100, rekenen tot 20, hele/halve uren (SLO). In groep 3 blijven 58 lessen; ook de tellessen tot 100 gingen naar groep 4 (eigenaar: groep 3 = alles tot 20, ook tellen). Zie [[werk-per-groep]].
- 11 okt 2026: bij elke groep 3-les (behalve de 2 intro's) een losse oefening van 15 sommen direct na de les (56 stuks, 'Oefenen: …'/'Herhalen: …', AANGEMAAKT.md Ronde 6). Gecommit op tak godot-lessen (7f27637, 9a59210, 191b26d). Alle 56 gespeeld als Testkind en hersteld; open punten voor groep 4 staan in VERBETERRONDE.md §3b.
- De 8 oude lessen REK-OPT-OPT-75..82 (oude stijl) staan nog in de database; eigenaar beslist.

**Why:** grote opdracht over meerdere sessies; de eigenaar sliep en kon geen vragen beantwoorden.
**How to apply:** bij "ga verder met de lessen": eerst de antwoorden in de vragenbestanden lezen, dan de database-stap (met toestemming) en browsertests per les. Zie ook [[synthesis-ronde-2-stand]] en [[nooit-zelf-content-aanmaken]].
