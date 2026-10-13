# De vier goedgekeurde illustraties

Goedgekeurd door de eigenaar op 13 oktober 2026. De originelen staan
ongewijzigd in `ontwerp/zappie/illustraties/`; alles hier wordt daaruit
gemaakt met `node scripts/maak-zappie-illustraties.mjs`. Niet met de hand
bewerken: pas het origineel aan of zet er een nieuw neer, en draai het script.

| Naam | Origineel | Waar |
| --- | --- | --- |
| `eigen-wereld` | 1448 × 1086, zwevend eiland met vuurtoren, koepels en watervallen | Jouw wereld (startpagina) |
| `werkplaats` | 1448 × 1086, hal met gouden onderzeeër, vliegtuig, raket en hulprobots | De werkplaats |
| `atelier` | 1448 × 1086, interieur met vitrines en een leeg paspodium | Zappies atelier |
| `kust` | 1672 × 941, kust met koepels, vuurtoren en stad | Het panorama onderaan |

Per beeld 720 en 1440 breed, als AVIF en WebP. `manifest.json` bevat de maten,
de grootte en een controlegetal (SHA-256); `scripts/check-zappie-illustraties.mjs`
controleert die vóór elke build.

Het zijn platte, samengestelde beelden: de robots, voertuigen en het water
kunnen niet los bewegen. Wat er beweegt, zijn lagen eroverheen (licht, gloed,
wolken) en de interactieve Zappie. Voor echte bouwfasen in de werkplaats en
accessoires in dezelfde stijl zijn losse beelden nodig; zie ZAPPIE.md.
