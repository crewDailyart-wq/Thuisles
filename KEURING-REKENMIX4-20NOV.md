# Keuring Rekenmix 4 (squla-rekenmix-mix4-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 3). Er is **niets** aan lessen, code of zinnen veranderd; dit is alleen een rapport.
Getest als Testkind op http://localhost:3000. Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keur3/` (mappen `foto-goed/squla-rekenmix-mix4-1-gouden`, `foto-allefout/…`, `test-rekenmix4-*`).

## Oordeel: GOEDGEKEURD (met kleine opmerkingen)

## Wat gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-rekenmix4-gouden.ts` | goed: inhoud 15 vragen gelijk aan squla-rekenmix-mix4-1; 761 verklapcombinaties, 603 beweringen, 0 kaal cijfer, kiezer 0 keer dubbel. Fouttabel-bestand bleef gelijk. |
| speelcontrole GOED | tot het eind, 0 fouten; F11 0, F16 0, 15.47 0; 10 met zin, 5 stil (1 op 3, 15.39) |
| speelcontrole ALLEFOUT | tot het eind (195 stappen), 0 fouten; 104 keer telwoord met opdracht erboven (15.47 goed); `goed-na-hulp` 15 = 15 keer samen tellen (15.49) |
| `test-rekenmix4-gouden.mjs` goed, allefout, fouten | alle 3 "Alles in orde"; overlap 0, sprongen 0, F7 0, F8 0, database niets bijgekomen |

## Kleine opmerkingen

1. Het ruimteschip (plaatje `satelliet.png`, vraag 11) is veel kleiner dan de planeten en sterren eromheen (ongeveer 95 × 50 punten, foto `foto-allefout/…/030.jpg`). Je moet erop tikken bij samen tellen; voor kleine vingers aan de kleine kant. 14.23 ("groot"), klein.
2. Bij een goed antwoord dat stil blijft (15.39) loopt het natellen met nummers door terwijl Bliepo's tekstvak leeg is en de blauwe pijl wel rechts staat (`foto-goed/…/001.jpg`). Een pijl zonder tekst; 15.27 zegt "pijl bij elk stuk tekst". Zelfde in Tellen en Tellen extra (gedeelde code). Klein, voor Sara om te zien.
3. Eindkaart toont vormen (cirkel, driehoek, vierkant) bij een les over tellen in de ruimte; generieke Rekenmix-kaart. Klein.

## Nagekeken en in orde

- Kijk als een kind: raketjes, sterren, planeten, ufo's, knopen, ballen, appels: telbaar, groot genoeg (behalve punt 1), geen witte rand, niets zweeft (ze zweven "in de ruimte", dat hoort zo).
- Getal in de kleur van het ding (raketje rood, planeet paars, ruimteschip groen, ...); "1 keer", "2 rijen" wit.
- Keuzes rechts onder Bliepo (15.32). Vraag altijd in beeld (F16 0); bij hardop tellen blijft de opdracht staan ("Tik op elke planeet. Ik tel mee." met "9." eronder; 15.47/F19).
- Hint na de 1e fout zegt waar je kijkt zonder het antwoord ("Wijs elke ufo aan en zeg het getal. Sla er geen over. Hoeveel zijn het er dan?"); fouttabel-script vond geen verklapper (15.17). Bij de 2e fout mag het antwoord in beeld (15.11).
- "satelliet" is "ruimteschip" geworden (taal groep 3).
- Eind: "Dat was de les. Ik vond het fijn. Tik op de kaart." — eindzin, dan kaart-opdracht; kaart links (15.46, 15.50).
- Geen "nagekeken", disco, "vinkje" in een zin; geen getallen in woorden.

## Niet kunnen nagaan

Echte stem, of de geluiden echt klinken (in de GOED-run "stil: nog geen tik", omdat de speler met JavaScript tikt), de precieze duur van het rode scherm (testscripts praten versneld), tablet/telefoon, vloeiendheid (bewust later).
