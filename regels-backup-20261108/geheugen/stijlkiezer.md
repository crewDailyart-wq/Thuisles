---
name: stijlkiezer
description: "Stijlkiezer /admin/stijl geldt voor de hele kinderkant; stijl staat in de database, dus lokaal en online los, en npm run online overschrijft de online stijl."
metadata:
  node_type: memory
  type: project
  originSessionId: 898e19d0-30cf-41fb-b2df-e9e93328f8ce
  modified: 2026-10-25T23:55:38.248Z
---

Sinds 26 okt 2026 stuurt de stijlkiezer (/admin/stijl, ook /beheer/stijl) de hele kinderkant via lib/stijl.ts (stijlCss) en components/StijlVariabelen (kind-layout, Zappie-layout, lessen, voorbeelden). Eind van de klus stond de standaardstijl aan; de stijl van de eigenaar (Lexend + hoekig) staat bij "Terug naar vorige versie".

Gedeeld opdrachtscherm: Bliepo via BliepoVloer (oefening, instaptoets, les, gesprek). `npm run bliepo` (in bewaak) faalt als Bliepo of zijn tekst niet zichtbaar is; draait tegen localhost:3000 of BASIS=… WW=….

Op 26 okt zijn alle 9680 gepubliceerde vragen even op concept gezet, maar de eigenaar draaide dat terug ("ik heb fout gemaakt"): dezelfde 9680 staan weer op gepubliceerd. Vraag bij zo'n massale statuswijziging voortaan eerst even of het echt zo bedoeld is. Op 27 okt 2026 vroeg de eigenaar het opnieuw en bevestigde het: alle 9680 online op concept (alleen online; lokaal niet), ids in backups/online-gepubliceerd-voor-concept-20261027.json.

**Why:** de eigenaar wil zelf de stijl kiezen, ook online.
**How to apply:** de stijl is een instelling in de database (app_instellingen "stijl", "stijl-vorige", "stijl-themas"): lokaal en online zijn los. Sinds 26 okt gaat de hele laptop-database niet meer online (regel 6), dus een online gekozen stijl blijft staan; lokaal en online zijn echt los. Zie [[railway-online]].

26 okt (later): zinnen van Bliepo staan onder elkaar (BliepoZinnen, stijl "zinnen" 1-6, standaard 3); ronde microfoonknop altijd naast Bliepo in opdrachten (grijs als praten uit). De oranje knop "Vraag het Bliepo" staat er nog naast — eigenaar nog niet gevraagd of die weg mag. Fenna heeft "Praten met Bliepo" aan (ouder: /ouder/instellingen).
