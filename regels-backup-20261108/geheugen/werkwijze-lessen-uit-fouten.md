---
name: werkwijze-lessen-uit-fouten
description: Fouten van 29-30 okt 2026 en hoe het voortaan moet - browserstem, tegoed, scope, testen, online zetten, Testkind.
metadata:
  type: feedback
---

Fouten die Sara boos maakten, en hoe het voortaan moet:

1. **Een terugval niet weghalen voordat alles gedekt is.** Ik zette de browserstem overal uit terwijl ~2.400 zinnen in de oudere lessen geen Ruth-audio hadden: zinnen werden stil en de les sprong door. Eerst meten wat er ontbreekt, dan pas uitzetten. De speelcontrole bootst audio na en ziet stille zinnen niet.
2. **Tegoed:** ruim 39.000 ElevenLabs-tegoed ging op aan oudere lessen zonder aparte vraag. Nu HARDE REGEL 9: boven 5.000 eerst vragen met schatting.
3. **Omvang verkeerd begrepen:** "oude lessen" = alleen opdrachten van vóór 27 okt; alle lessen sinds 27 okt zijn nieuw (HARDE REGEL 8). Bij de stijlpagina bouwde ik 5 onderdelen terwijl ze alleen de tekst boven Bliepo bedoelde. Bij twijfel eerst één korte vraag.
4. **Online zetten:** als Sara iets wil zien, meteen `railway up` en het Railway-nummer melden; de lange eindcontrole erna laten lopen. Elke nieuwe vraag brak de commit af, waardoor de nacht niets op GitHub kwam: commit pas als er rust is, en zeg eerlijk dat het nog niet op GitHub staat.
5. **Testen:** een Chrome-tab op de achtergrond tekent geen Phaser (Bliepo leek weg): gebruik schermfoto's uit de speelcontrole (SCHERMFOTO=map). Een les-id uit de broncode kan een 404 zijn: les-id uit de database halen. Na een afgebroken controle achtergebleven headless Chromes (vloeiendcontrole) zelf afsluiten; bij laptopbelasting boven ~20 geven tests valse fouten.
6. **Echt kind:** Sara's Chrome is ingelogd als een echt kind. Daar nooit aantikken zonder toestemming; testen met Testkind.

**Why:** Sara heeft weinig tijd en computerkennis en verwacht dat het in één keer goed is. Herhaalde fouten kosten haar vertrouwen.

**How to apply:** Lees dit vóór grote klussen. Zie ook [[lessen-ontwerp-voorkeuren]], [[railway-online]].
