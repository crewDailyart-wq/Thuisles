# Rondje-fixes H1 (6 november 2026)

## Wat ik veranderde
1. **Min-ruimte en Min-bus** (`src/components/les/lessen/squla-minsommen.tsx`): het rondje om wat overblijft stond tijdens de vraag "hoeveel zijn er over?". Nu valt het weg vóór de vraag (in `samenRekenen` en in de uitleg van ruimte en bus bij de begeleide vraag). In de uitleg zonder vraag blijft het rondje bij "Er blijven X over" (dat is het antwoord zelf, na de vraag). Bakjes, geld, kaal, bellen, verbinden: in de code geen rondje dat bij een vraag blijft staan; niet allemaal met foto's bekeken.
2. **Min-machine-1** (`squla-minsommen.tsx`, `squla-minsommen-vlak.tsx`): nieuwe waarde `licht: "stippen"` geeft 1 rondje om alle stippen, bij "Ik zet N stippen neer" (machine, bord, som en bij samen rekenen met stippen). Weg bij de volgende zin. Rondje iets lager/kleiner opgegeven zodat het niet onderaan wordt afgesneden.
3. **Meten pizza-1** (`squla-meten.tsx`, `squla-meten-vlak.tsx`): de naast elkaar gezette dingen (`vergelijk`) kunnen nu een rondje krijgen (`licht: ["v0"]`, `["v1"]`...). Bij "Die is het grootst/kleinst." in de uitleg staat 1 rondje om precies die pizza (of dat ding); daarna weg. De uitlegzin wordt dan in 3 delen uitgesproken (voor, die zin, na), met dezelfde tekst. Werkt voor alle Meten-lessen met `grootteVraag`.
4. **Klok gouden ring weg** (`squla-klok-vlak.tsx`, `ringVoor`): geen ring meer om een wijzerklok. De gewone gloed van een aangewezen klok (kleur van de klok) is gebleven.
5. **Klok sterker oplichten + geluidje** (`squla-klok-tekenen.ts` `wijzerklok`): kleur achter de wijzer veel dekkender (multiply, de wijzer blijft zichtbaar) met een felle dunne rand (oranje voor uur, paars voor minuten). Kort 1 keer pulseren van de klok (alleen als "rustig" uit staat). Nieuw geluid `oplicht` in `src/lib/lesgeluiden.ts` (zelf gemaakt in code, 2 zachte tonen, volume 0,02 en 0,014, zachter dan de andere), 1 keer per nieuwe aanwijzing (waar `nadruk` van waarde wisselt). Bron/licentie in `GELUIDEN-BRONNEN.md` (nieuw kopje "Zelf gemaakt in code"). Back-ups van elk gewijzigd bestand staan in de scratchpad-map.

## Wat ik zag (schermfoto's in public/rondje-controle/<les>/)
- min-ruimte-1, min-bus1-1: geen rondje tijdens de vraag (Nee-route).
- min-machine-1: rondje om alle stippen bij "Ik zet 10 stippen neer" (04-01-fijn-0.0s), niet afgesneden; weg tijdens de vraag.
- meten-pizza-1 (route fout, FIJN=1): rondje om de grote pizza bij "Die is het grootst." (fout-05-01-fijn-0.0s).
- klok-hoelaat-1 en klokkijken2-1: geen gouden ring, sterke gekleurde wijzer.
- `tsc`: geen fouten in `src/`.

## Vragen voor Sara
- De klok krijgt bij aanwijzen nog steeds de zachte gloed om de hele klok (in de kleur van de klok). Wil je die ook weg, zodat alleen de wijzer oplicht?
- Bij hoelaat-1 blijft de oranje uurwijzer oplichten tijdens de vraag "Naar welk getal wijst de kleine wijzer?" (dat verklapt niets). Goed zo?

## NIET GEZIEN
- Het geluidje `oplicht` is niet beluisterd (geen speelcontrole met geluid); alleen de code is er. Volume en irritatie moet Sara beoordelen.
- Het pulseren van de klok is niet op een foto te zien.
- Min-bus2-*, min-ruimte-2/3 en de andere Minsommen-soorten (bakjes, kaal, bellen, verbinden, geld) zijn niet met foto's gecontroleerd, alleen de code gelezen.
- Andere Meten-lessen (ijsjes, borden, schilderijen): niet gefotografeerd; of daar nog aanwijsmomenten zonder rondje zijn, weet ik niet.
- Speelcontrole (`speelcontrole.mjs`) niet gedraaid (zwakke computer); `bewaak` en vloeiend-test ook niet.
- Opname-script loopt in klokkijken2-1 een zin achter (ondertitel "de 7" bij nog oplichtende klok 8): moet van H3 gecontroleerd.
