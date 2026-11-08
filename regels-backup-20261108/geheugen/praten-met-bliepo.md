---
name: praten-met-bliepo
description: AI-tutor "Vraag het Bliepo" (22 okt 2026): OpenAI luistert/denkt, Ruth (ElevenLabs) spreekt; ouder zet aan (standaard uit); limieten en beheerpagina.
metadata:
  type: project
---

Gebouwd 22 okt 2026 (commit a817aa5). Knop "Vraag het Bliepo" (ingedrukt houden, max 15 s) in OefenSpeler en Lesscherm, alleen als ouder "Praten met Bliepo" aanzet (kind_instellingen bliepopraten/bliepovragen, bewust NIET in KIND_INSTELLINGEN); demo altijd aan op /voorbeeld-bliepo (50/dag). Route /api/tutor: OpenAI gpt-4o-mini-transcribe → standaardvraag (hints.ts, hintladder per domein, zonder AI) → gedeeld antwoord (embedding, tutor_antwoorden) → gpt-4.1-mini + moderation parallel met Ruth eleven_v4_turbo (Fish reserve). Limieten: per kind per dag, OPENAI_BUDGET_USD (80% melding, 100% alleen hints), ELEVEN_RESERVE 10k tekens. Beheer: /admin/bliepo. Geen opnames/namen bewaard. Op 22 okt had OpenAI nog $0 tegoed (eigenaar zet later geld erop; auto recharge uit = harde limiet) en Railway had een storing.

**Why:** eigenaar wil een echte online AI-tutor, zo goedkoop mogelijk; Bliepo verklapt nooit het antwoord.

**How to apply:** Testkind heeft bliepopraten=aan (test). Live latency met echte OpenAI nog meten zodra er tegoed is. Zie [[bliepo-stem-fish-audio]].
