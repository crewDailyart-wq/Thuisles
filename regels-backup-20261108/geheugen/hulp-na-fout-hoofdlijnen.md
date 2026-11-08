---
name: hulp-na-fout-hoofdlijnen
description: Vaste hoofdlijnen voor de hulp na een fout in Squla-lessen (zoals Synthesis); elke keer toepassen bij het langsgaan van lessen
metadata:
  type: feedback
---

Hoofdlijnen (Sara, 4 nov 2026; staat ook in BOUWREGELS 5.1, 5.4, 5.10 en 3.23):

1. Goed = kort en door. Eerste fout = korte reactie op wat het kind KOOS (zoals Synthesis: "Bij 9 uur wijst de kleine wijzer naar de 9") + een hint ALLEEN als die bij de vraag past; meteen opnieuw. Tweede fout = Bliepo legt uit, laat het goede antwoord zien, kind gaat door; gemiste vraag mag later terugkomen.
2. Uitleg na de tweede fout per soort vraag zoals Synthesis: klok/tellen/meerkeuze alleen kijken en luisteren; som/splits/slepen mag één keer een makkelijkere oefening of "ik doe het voor" (grens: nooit een tweede makkelijkere oefening, anders vicieuze cirkel). Geen keuzevraag "hulp of nog een keer", geen pauze, les stopt nooit, geen oneindig herhalen.
3. Doe het net als Synthesis: persoonlijk en uniek, inhoud per vraag eigen (noemt wat het kind koos), bevestigingen wisselen ("precies", "dat is 'm"), naam van het kind hooguit 1-2x per les (nooit bij fouten), korte openingen mogen wisselen en vaak wegblijven (`wissel` in squla-uitleg.ts), nooit dezelfde zin achter elkaar. Nooit overal dezelfde zin ("Niet helemaal"); wisselende opening ("Hmm", "Ah, ik snap wat je dacht", soms geen), nooit het woord "fout", per vraag eigen reactie.
4. Hulphandje alleen waar het past; hint moet rekenkundig/didactisch kloppen, grammaticaal perfect, kort, groep 3; niet elke vraag heeft een hint (verzin er geen).
5. Aanwijzen = duidelijk rondje om het ding, niet alleen oplichten (klok: `nadruk`). Geen dubbele vraag vóór het antwoord, ook niet met andere woorden (gewone les én uitleg na Nee).
6. Toets: geen uitleg bij fout. Slepen: voorwerp glijdt terug, geen zin.
7. Eerst één voorbeeld per vraagsoort laten zien, pas na akkoord uitrollen; Sonnet-helpers (max 3), onafhankelijke controleur keurt elke zin en hint; Synthesis na te kijken in INSPIRATIE.md (R3 Algemene hulpregels) vóór een nieuwe vraagsoort.

**Why:** Sara vond onze lessen te standaard en te vast; kind moet kunnen doorgaan na een fout.
**How to apply:** bij elke les die ik aanpas of controleer; code: `synthesis: true` + `reactie`/`toonAntwoord` in SqulaVraag (squla-hulp.ts); voorbeeld squla-klok-hoelaat-1. Test met ALLEFOUT=1 speelcontrole. Zie [[menselijke-controleronde]].

**Aanvulling 4 nov:** de vaste lijsten met openingen en 'ik laat het je zien' zijn uit de kern gehaald (squla-uitleg.ts); reactie begint meteen met de inhoud.
