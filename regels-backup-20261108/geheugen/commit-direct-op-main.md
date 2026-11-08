---
name: commit-direct-op-main
description: Werkvoorkeur — in Thuisles mag rechtstreeks op main gecommit worden; geen aparte branch per wijziging.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f37105ec-c6e0-497e-8ae2-a3645fc43f3c
  modified: 2026-09-14T16:44:11.088Z
---

In dit project committen op `main` is prima. Geen aparte branch aanmaken per
wijziging en daarna mergen.

**Why:** Thuisles is een solo-project met één ontwikkelaar. De omweg via een
branch leverde alleen extra stappen op — drie keer achter elkaar volgde het
verzoek om te mergen en daarna de branches op te ruimen.

**How to apply:** commit rechtstreeks op `main` zodra erom gevraagd wordt.
Committen blijft iets wat de gebruiker vraagt, niet iets wat uit zichzelf
gebeurt. Bij een wijziging die wél risicovol of experimenteel is, mag een
branch alsnog voorgesteld worden — maar dan als vraag, niet als standaard.
