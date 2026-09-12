# Notitie: wat de methodezoeker ophaalt en bewaart

**LEGAL REVIEW REQUIRED — automatisch lezen van schoolwebsites.**

Deze notitie legt vast wat de zoeker precies doet, zodat het beoordeeld kan
worden voordat Thuisles online gaat.

## Wat er wordt opgehaald

Per school, uitsluitend op basis van het websiteadres dat in de open data van
DUO staat:

1. `https://<website>/robots.txt` — om te zien of de site geautomatiseerd
   bezoek toestaat.
2. De startpagina van de school.
3. Hooguit zes pagina's of PDF's van diezelfde website, gekozen op woorden in
   het webadres: *schoolgids, schoolplan, onderwijs, methode, vakken, rekenen*
   en dergelijke.

Er wordt niets ingevuld, niets verstuurd en niets ingelogd. Alleen openbaar
bereikbare pagina's worden gelezen.

## Wat er wordt bewaard

Per gevonden methode precies drie dingen, en niets anders:

| Wat | Voorbeeld |
| --- | --- |
| De ene zin waarin de methodenaam staat, maximaal 300 tekens | "Voor rekenen werken wij met de methode Pluspunt 4." |
| De link naar de pagina of PDF | `https://school.nl/schoolgids-2025-2026.pdf` |
| Het jaartal of schooljaar van het document, als dat te vinden is | `2025/2026` |

Plus de datum waarop is gezocht.

**Niet bewaard:** de pagina zelf, de schoolgids zelf, afbeeldingen, namen van
personen, of enige andere inhoud. Het opgehaalde bestand wordt na het lezen
weggegooid en nergens opgeslagen.

## Hoe er wordt omgegaan met de website

- **robots.txt wordt gevolgd.** Zegt een site "niet doen", dan wordt die site
  overgeslagen. Is robots.txt niet te bereiken, dan wordt de site ook
  overgeslagen — bij twijfel niet.
- **Hooguit één verzoek per drie seconden per website.**
- **Een herkenbare user-agent** met een verwijzing naar een uitlegpagina, zodat
  een beheerder kan zien wie er langskwam en contact kan opnemen.
- **Korte tijdslimiet** (20 seconden) en een maximum van 12 MB per bestand.
- Fouten worden stil gelogd en blokkeren de rest niet.

## Wat de zoeker uitdrukkelijk NIET doet

- De zoeker zet **nooit** zelf een methode op "geverifieerd".
- Ouders zien **nooit** iets van een voorstel. Voor hen blijft de school
  "Rekenmethode nog niet bekend" totdat Thuisles het met de hand bevestigt.
- De zoeker raadt nooit. Wordt er geen methodenaam letterlijk teruggevonden,
  dan is de uitkomst "niets gevonden".

## Wat er nog beoordeeld moet worden

1. Mag een schoolwebsite geautomatiseerd gelezen worden voor dit doel, ook als
   robots.txt het niet verbiedt?
2. Is het bewaren van één zin uit een schoolgids toegestaan (citaatrecht,
   databankenrecht)?
3. Moet er een afmeldmogelijkheid komen voor scholen, en zo ja hoe?
4. Hoort er een uitlegpagina te komen op het adres in de user-agent?
5. Is de bewaartermijn van de voorstellen begrensd?
