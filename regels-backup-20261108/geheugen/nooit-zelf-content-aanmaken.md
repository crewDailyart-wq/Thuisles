---
name: nooit-zelf-content-aanmaken
description: "Harde permanente afspraak — Claude maakt nooit zelf content aan in de Thuisles-database, ook niet tijdelijk om te testen."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: f37105ec-c6e0-497e-8ae2-a3645fc43f3c
  modified: 2026-09-12T01:02:15.282Z
---

Claude maakt **nooit** zelf content aan in de Thuisles-database: geen vragen,
leerdoelen, domeinen, subdomeinen of sjablonen. Ook niet tijdelijk, ook niet
"even om iets te testen", ook niet als het meteen daarna wordt opgeruimd. Geen
inserts via de commandoregel, geen seed-/demo-/voorbeelddata, geen fixtures,
geen migratie of opstarthook die content aanmaakt of aanvult.

De gebruiker is de enige die content toevoegt, via het admin-formulier of een
upload die die zelf start.

**Why:** drie keer verscheen er content die niemand had ingevoerd — 7
onverwachte onderwerpen en teruggekeerde omschrijvingen (uit `vulStructuur()`
en `vulNieuweKolommenAan()` in `src/lib/db/sqlite.ts`, beide verwijderd op
2026-09-12), en meerkeuzevragen bij REK-GET-TEL-01 die Claude zelf als
testdata had aangemaakt. Daardoor was de database niet meer te vertrouwen en
was bij opruimen nooit zeker of iets echt wegbleef.

**How to apply:** heb je testdata nodig om iets te controleren, vraag het eerst
en wacht op antwoord — de gebruiker bepaalt of het mag en wat erin komt. Kun je
iets zonder die data niet verifiëren, meld dan gewoon wat je niet hebt kunnen
controleren. Voeg ook geen nieuw automatisch mechanisme toe dat content
aanmaakt. De afspraak staat ook bovenaan `CLAUDE.md` in het project.
Zie ook [[thuisles-geen-seed-mechanisme]].
