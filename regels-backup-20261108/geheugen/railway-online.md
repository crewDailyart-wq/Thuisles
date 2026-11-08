---
name: railway-online
description: "Thuisles staat sinds 12 okt 2026 online op Railway (thuisles-production.up.railway.app), met wachtwoordslot en database op een volume; online en laptop zijn twee losse databases."
metadata:
  node_type: memory
  type: project
  originSessionId: 898e19d0-30cf-41fb-b2df-e9e93328f8ce
  modified: 2026-10-12T17:06:08.136Z
---

Sinds 12 okt 2026 draait Thuisles op Railway: project "thuisles", dienst "thuisles", volume "thuisles-volume" op /data (500 MB, proefplan). Adres: https://thuisles-production.up.railway.app.

- Uitrollen gaat met `~/.npm-global/bin/railway up --service thuisles --ci` vanaf de tak nieuwe-layout (niet via GitHub; `.railwayignore` stuurt public/godot wel mee, data/ niet).
- Variabelen: THUISLES_DB=/data/thuisles.db, THUISLES_GEBRUIKER, THUISLES_WACHTWOORD (slot in src/proxy.ts, alleen actief als die variabele staat).
- VERVALLEN 26 okt 2026: de laptop-database is NIET meer de baas. Nooit meer de hele laptop-database online zetten (HARDE REGEL 6 in CLAUDE.md): online staat voortgang van echte kinderen. `npm run online` zet alleen nog plaatjes/Godot online en stopt vóór de database; gerichte wijzigingen online via `node scripts/online-wijzig.mjs <bestand.sql>` (eerst reservekopie).
- Online uploads staan op het volume (/data/vragen via THUISLES_AFBEELDINGEN; scripts/start.mjs vult aan, app/vragen/[naam]/route.ts levert ze).
- De 22:00-back-up maakt ook thuisles-online-<datum>.db in iCloud (laatste 14).
- railway.json negeert Railway (verouderd); opstartlogica zit in `npm start`.
- Bestanden verwijderen van het volume weigert de CLI voor agents; de eigenaar moet dat zelf doen.

**Why:** de eigenaar wil vanaf elk apparaat werken, zonder code om te bouwen.
**How to apply:** database-wijzigingen online alleen gericht met scripts/online-wijzig.mjs (back-up eerst); nooit de hele database. Na codewijzigingen die online moeten: `railway up --service thuisles --ci`. Meld het als het script 'LET OP: online is er iets veranderd' zegt.
- Account staat op het Trial-plan (23 okt 2026). Bij de Railway-storing van 22-23 okt kregen Trial-accounts als laatste hun builds terug ("Deploys have been paused temporarily"); betaald plan (Hobby $5) mag Claude niet zelf kopen. Bij zo'n melding: status.railway.com bekijken, niet blijven proberen.
- Stembestanden online (/data/stem) kunnen per bestand met `railway volume files --volume thuisles-volume upload <lokaal> /stem/<naam> --overwrite`; schrijven via `railway ssh` wordt door de veiligheidscheck geweigerd.
