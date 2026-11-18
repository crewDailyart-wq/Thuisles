# Dit moet aan het einde nog gebeuren (lijst van Sara en Claude, bijgewerkt 17 november 2026)

Deze lijst wordt bijgehouden. Wat klaar is, krijgt een vinkje; niets verdwijnt zonder dat Sara het zegt.

## Volgorde van werken (Sara, 17 november 2026)
1. De helpers die al bezig zijn afmaken (hulphandje in alle gouden lessen, dubbel gezegd).
2. A: zinnenronde met Fable, alleen gouden lessen (15 + Rekenmix 2, 3, 4 + 3 extra's): zinnen beoordelen, verbeteren, toetsen aan de bouwregels, doorvoeren. Eén helper tegelijk.
3. B: variatie in wat Bliepo zegt (reacties/lof/aanmoediging 3-5 varianten, instructies 2-3 varianten, nooit 2x dezelfde zin achter elkaar; fouttabel intact; geen ElevenLabs-tegoed; schatting aantal zinnen en kosten in KEUZES-VOOR-SARA.md).
4. Kale cijfers (waar het past kleur van het voorwerp).
5. Scherm Kralenavontuur (404) uitzoeken.
6. Onafhankelijke keuring per les, één korte lijst aan Sara.

## Rekentaal-plaatjes (Sara, 17 november 2026)
- [ ] De gouden les Rekentaal (squla-rekentaal-gouden) tekent de voorwerpen nog zelf in code. Maak ze met Magnific in de Bliepo-stijl, efficiënt (vellen van 9, bestaande plaatjes in public/voorwerpen hergebruiken: beker, mand, appel, watermeloen, aardbei, zak-meel, broodje, picknickkleed). Ontbreekt nog: pannenkoek, glas met sap (leeg/half/vol), sliert spaghetti, weegschaal, tafel. Pas ná het hulphandje-werk aan hetzelfde vlak (squla-rekentaal-gouden-vlak.tsx). Kosten melden.

## Vloeiend-meting (besluit Sara, 17 november 2026)
- [ ] Eén keer meten voor ALLE opdrachten, als alle ongeveer 1000 opdrachten klaar zijn (niet per les). `npm run vloeiend`; minstens 55-60 beelden per seconde, hapering hooguit 50 ms, op laptop én trage telefoon.
- [ ] Vooraf: energiebesparing van de Mac uit, geen helpers of tests ernaast (anders meet hij te traag).
- [ ] Na het online zetten opnieuw op de echte site: `BASIS=https://… WW=… npm run vloeiend` (ook: opent een les in minder dan 1 seconde?).
- Risico dat Sara kent: blijkt een les niet vloeiend, dan moet die achteraf worden aangepast. Daarom eventueel eerst één meting op de gouden lessen die er nu zijn (Sara besluit).

## Stem
- [ ] Officiële stem (Ruth) met exacte woordtijden: dan het woord-voor-woord oplichten gelijk laten lopen met de stem in alle gouden lessen (DESIGN-LATER.md). Eerst toestemming voor het tegoed (regel 9).
- [ ] `scripts/test-woord-oplichten.mjs` opnieuw draaien, ook voor de 3 extra-lessen (Tellen, Splitsen, Plussommen).

## Lessen
- [ ] Ronde 48 in KEUZES-VOOR-SARA.md: Sara beantwoordt de vragen.
- [ ] Kale cijfers in zichtbare zinnen (ongeveer 250): waar het past de kleur van het voorwerp, anders wit (besluit Sara 17 november). Na afloop van de andere helpers; daarna keuring.
- [ ] De 12 andere Rekenmix-lessen bouwen zodra Sara kiest welke gouden les ze volgen (RAPPORT-REKENMIX-OVERZICHT.md).
- [ ] Het nieuwe hulphandje in alle gouden lessen (bezig, 17 november); later ook in de andere lessen.
- [ ] Alle oude lessen aanpassen aan het skelet van de gouden lessen (Sara: gouden lessen zijn de basis). Pas als Sara het zegt; oude lessen vóór 27 oktober blijven tot dan onaangeraakt.
- [ ] Zinnenbestand opnieuw maken na de laatste zinwijzigingen: `npx tsx scripts/zinnen-voor-controle.ts`.
- [ ] Onafhankelijke keuring van wat nieuw is (handje, dubbel-gezegd-herstel, kale cijfers).

## Losse punten
- [ ] Scherm Kralenavontuur (tellen-sprongen) geeft een 404 (niet nieuw): uitzoeken als Sara het wil.
- [x] De "404 Not Found"-meldingen in de lessen: uitgezocht (17 november). Het is de stem: er is nog geen officiële stem (Ruth), dus de site antwoordt 404 en de les gebruikt de stem uit de browser. Verdwijnt vanzelf met de officiële stem.
- [ ] Opstarttijd van minder dan 1 seconde kan pas op de echte site worden gemeten.

## Online zetten
- [ ] Alleen als Sara "zet online" zegt, en pas na de volle controle (`npm run bewaak`, speelcontrole, vloeiend). Niets gaat online zonder die woorden.

## Toegevoegd 18 november 2026
- **Eigen tegels in Magnific** (Sara): de blokjes (tegels) in Plussommen extra, Tellen extra e.d. lijken te veel op Synthesis. Maak eigen aantrekkelijke kinder-tegels in Magnific (Bliepo-stijl), eerst een proefvel laten zien. Raakt `optellen10-holo-tegels.tsx` (nu door de handje-helpers aangepast): pas doen als die klaar zijn.
- **Vaste plek antwoordknoppen** (15.32): per gouden les met schermfoto's controleren dat álle antwoorden rechts onder Bliepo's zin staan; automatische controle (x in rechterkolom) toevoegen aan speelcontrole. Alleen Plussommen extra is bekeken.
