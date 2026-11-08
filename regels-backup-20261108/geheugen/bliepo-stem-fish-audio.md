---
name: bliepo-stem-fish-audio
description: Bliepo praat met Fish Audio-stem "Sanne" (drama-3, website-instellingen, toon+tempo per groep, elke zin teruggeluisterd); terugval oude Fish-stem, dan browserstem.
metadata:
  type: project
---

Sinds 22 okt 2026: stem "Sanne" (fa6dc2d97c7c43a1be30879e7fe8b650), model drama-3, temperature 0.7, top_p 0.7, herhaling 1.2, latency normal (gemeten minste fouten); wav → de-esser (stem-klank.ts) → -16 LUFS → mp3 192. Uitspraaklijst stem-uitspraak.ts (Hoi→Hooij, Ja→Jaa). Elke zin 2 versies, strenge ASR-check + check met Nederlandse dragerzin (korte zinnetjes geven anders vals alarm), max 4. Antwoordkeuzes worden niet meer voorgelezen (Lesscherm kies). Toon per groep via [aanwijzing] vóór de zin (gemeten: niet voorgelezen, wel warmer/levendiger); tempo per groep 1-2: 0.85, 3-5: 0.9, 6-8: 0.95. Groep komt van het kind-cookie. Code: src/lib/stem-server.ts, src/lib/stemtekst.ts (getallen voluit, knippen, vergelijken), app/api/stem. Elke nieuwe zin gaat door transcribe-1; mist een woord → max 3x opnieuw, anders lijstje op /voorbeeld-bliepo (stem/mislukt.json) en die keer de oude stem. Oude stem 1778a8b9… (s2-pro, 0.88) = terugval via FISH_OUD_*. Alle instellingen als FISH_*-variabelen (lokaal .env.local, online Railway). POST /api/stem {actie:"alles"} maakt alles opnieuw (oude zinnen eerst gekopieerd naar stem/oud/oude-stem-<datum>). De eigenaar vond s2-pro "te AI".

**Why:** de eigenaar wil een warme, echte tutorstem die nooit een woord overslaat. De eigenaar heeft weinig computerkennis: simpel uitleggen, technische dingen zelf regelen.

**How to apply:** API-tegoed staat los van het app-abonnement (402 = op). Proefinstellingen van een website-taak zijn niet publiek op te halen (alleen tekst via api.fish.audio/task/<id>/public); website-standaarden staan in de JS (task-tts-*.js). Railway logt soms uit: dan moet de eigenaar `! ~/.npm-global/bin/railway login` doen. Zie [[railway-online]].
