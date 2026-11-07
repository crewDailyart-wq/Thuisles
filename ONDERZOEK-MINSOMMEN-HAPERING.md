# Onderzoek hapering "Minsommen in de ruimte" (squla-min-ruimte-1, -2, -3)

Gedaan op 6 november 2026. Niets gecommit, niets online, niets in de database.
Alleen gewijzigd: `src/components/les/vlakken/squla-minsommen-vlak.tsx`.
Reservekopie van het bestand vóór mijn werk: scratchpad `minsommen-vlak.start-onderzoek.bak`.

## Oorzaken (gemeten, trage telefoon = 4x tragere processor, dev-versie)
Ik zette tijdelijk tijdmetingen om de functies van de scène (later weer weggehaald).

1. **Eerste oplichten (`goed()` -> `flits` -> `texGloed` -> `bak`)**: 107 ms in 1 beeld
   (`bak` van het raketje, 107 ms; `goed` totaal 116 ms). Het grootste deel is het
   eerste keer aanmaken van het gloed-programma van de grafische kaart (addGlow).
2. **Toneel met bellen (`maakBubbels`)**: 119 ms in 1 beeld. Het bellenplaatje (28 ms) plus
   6 sommen met elk 2 tot 3 losse tekstplaatjes (`tekstTex`/`somRij`, 2 tot 13 ms per stuk,
   `somRij` samen ongeveer 90 ms) werden allemaal in hetzelfde beeld getekend.
3. Het ring-plaatje van een nieuw voorwerp (`tex` met kleur): 43 tot 55 ms in 1 beeld bij elk
   nieuw voorwerp/kleur. Niet aangepast (zit in gedeelde code `tekenMetRing`/`glansBeeld`);
   het is net onder de grens op de laptop-meting.
4. Niet door ons: de pagina zelf (Bliepo 3D `Bliepo3DEcht`, Phaser-start in de dev-versie)
   geeft in de eerste seconden 60 tot 130 ms stukken.

## Wat ik veranderde (alleen `squla-minsommen-vlak.tsx`)
- `maak()` (rond regel 414-419): een heel klein plaatje (8x8) één keer met gloed "bakken"
  (`sqm-warm`, `sqm-warm-gloed`), nog vóór het scherm klaar is. Zo is het gloed-programma
  al klaar bij het eerste goede antwoord. Het ziet er hetzelfde uit; het plaatje wordt nergens getoond.
- `maakBubbels` (rond regel 613-627): eerst het bellenplaatje, daarna elke bel in een eigen
  beeld (20 ms na elkaar, dus alle 6 binnen ongeveer 140 ms terwijl het toneel toch al
  260 ms inzweeft). `bubbelBoxen[i]` wordt nu per plek gevuld; een bel die al "weg" was
  voor hij er is, wordt meteen verborgen (`bubbelWeg`). `zetBubbels` en `bubbelFout` hadden al
  een controle op een ontbrekende bel.
- Verder niets weggehaald; de tijdelijke meetcode is eruit.

## Metingen (loaf.mjs: langste "blokkering" in een beeld na het openen, trage telefoon, 3 s demo)
Productiebouw-kopie (poort 3101), 3 metingen per les. "blok" = geblokkeerde ms (eis hooguit 50).

| les | voor (blok) | na (blok) |
|---|---|---|
| ruimte-1 | 70, 105, 65 | 70, 21, 17 |
| ruimte-2 | 28, 49, 113 | 41, 84, 3 |
| ruimte-3 | 162, 65, 118 | 58, 40, 30 |

Gemiddeld ongeveer 81 ms voor en ongeveer 40 ms na. Langste beeld (lang): voor 92-224 ms,
na 69-147 ms. Eerst 107 ms bak in 1 beeld -> na de warm-up 22-27 ms (dev, `goed` totaal 30-37 ms).
De computer had tijdens het meten een zeer hoge belasting (load 130-370, andere helpers),
dus de cijfers schommelen sterk.

## NIET GEZIEN
- `npm run vloeiend` volledig groen: NIET gezien. Op de dev-server gaf het (onder zware
  belasting) nog 55-65 ms hapering bij "moeilijker" en "nog moeilijker" op de trage telefoon;
  openen 3-6 s (dev). Op de productiekopie heb ik `npm run vloeiend` zelf niet gedraaid,
  alleen mijn eigen meting (loaf.mjs).
- Of er nog 1 beeld van 50-85 ms overblijft (ruimte-2 run2: 84 ms blok): de oorzaak
  daarvan heb ik niet gemeten (waarschijnlijk het ring-plaatje van punt 3 of de pagina zelf).
- Laptop-metingen van voor/na: niet apart gedaan.
- Het bus-toneel in de demo wordt overgeslagen (plaatjes niet geladen in deze les), dus niet gemeten.
- Uiterlijk: niet met schermfoto's vergeleken; wel is er niets aan tekenen veranderd (alleen
  het moment waarop bellen worden aangemaakt, 20 ms per bel, en een extra onzichtbaar plaatje).
- Speelcontrole: zie onderaan.

## Speelcontrole
NIET GEZIEN: de speelcontrole (GOED=1, ALLEFOUT=1, NEE=1) is niet afgerond. Op de dev-server (poort 3000) werd hij overgeslagen/liep vast omdat de site door de zware belasting (load 130+) te traag antwoordde (eerste poging gaf 'komt niet verder', tweede 'site draait niet'). Op de productiekopie (poort 3101) liep de GOED=1-run na ruim 6 minuten nog en is door mij gestopt. Dus: nog te doen, bij lagere belasting: `GOED=1/ALLEFOUT=1/NEE=1 LESSEN=squla-min-ruimte-1,-2,-3 node scripts/speelcontrole.mjs`.

Let op: de productiekopie op poort 3101 (scratchpad `prod`) is nu opnieuw gebouwd MET mijn wijziging.
