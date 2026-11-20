# Eindkeuring 20 november 2026: kloppen de herstelde punten?

Onafhankelijke keurder. Niets aan lessen, code of zinnen veranderd. Getest als Testkind, op de laptop (localhost:3000), 1 browser tegelijk. Geen tegoed gebruikt. Vloeiendheid en telefoon niet gemeten (pas aan het eind).

## Kort

- **18 van de 19 herstelde lessen: goed.**
- **1 nieuwe echte fout, in Splitsen extra:** een antwoordknop toont `3:tegel + 2:tegel = 5:tegel`. Die fout is ontstaan bij het herstel van vandaag.
- **1 kleine bijwerking van 15.51 (de pijl):** in Vormen verdwijnt de pijl 1 keer ±0,5 s en komt dan terug onder dezelfde zin.

## Wat nog echt fout is

1. **Splitsen extra: tekst `:tegel` op een antwoordknop** (nieuw, ernst hoog). Bij "Welke som heb je gemaakt?" staat op de goede knop `3:tegel + 2:tegel = 5:tegel`. De knop valt daardoor op en verklapt zo het antwoord. Hij loopt ook uit zijn vak.
   - Plek: `src/components/les/lessen/squla-splitsen-extra-zinnen.ts:169`. Daar staat `som(...).replace(/[{}]/g, "")`. Dat haalt alleen de haakjes weg. Sinds commit c2bfacc maakt `som()` (regel 46) `{3:tegel}` in plaats van `{3}`, dus `:tegel` blijft staan.
   - Foto: scratchpad `eind20/foto-zicht/squla-splits-splitsen1-1-gouden-extra/004.jpg`.
   - De speelcontrole merkte het niet: de les loopt wel tot het eind.
   - In Plussommen extra zit deze fout niet: `somKeuzes` maakt daar gewone tekst.
2. **Vormen: de pijl knippert 1 keer** (bijwerking van 15.51, ernst laag). Na het samen leggen van de puzzel staat de pijl onder "Kom, ik leg de andere stukjes erbij.". Dan verdwijnt hij ±0,55 s terwijl het geluidje speelt, en daarna komt hij terug met "Ja, deze is het.".
   - Oorzaak: `src/components/les/Lesscherm.tsx:892` zet `pijlWacht: true` altijd. Dat gebeurt ook als er onder de oude tekst al een pijl stond, en niet alleen onder een vraag. De pijl wordt verborgen op `Lesscherm.tsx:1386`.
   - Mogelijke oplossing (aan de bouwer): zet `pijlWacht` alleen aan als er op dat moment geen pijl in beeld is.
   - Dit geldt in principe voor alle 21 gouden lessen. Het valt alleen op als Bliepo zelf iets afmaakt en er meteen daarna een geluid en een reactie komen.

## Per punt

| Les | Hersteld punt | Uitslag | Hoe nagekeken |
|---|---|---|---|
| Dagen | "wagon" in plaats van "kaart"; rails onder de losse wagons | goed | foto: "Tik op de goede wagon.", wielen op het zijspoor; speelcontrole tot het eind |
| Geld | geen "zweeft" meer | goed | code `squla-geld-gouden-zinnen.ts:186`; speelcontrole tot het eind |
| Getallenlijn | hint "tel in je hoofd", geen sprongen; Bliepo verspringt niet | goed | code `squla-getallenlijn-gouden-zinnen.ts:629`. Niet hersteld (bewust, voor Sara): de reactie bij goed noemt nog "sprongen" (`:362`) |
| Klok | zin na samen voordoen; eigen zinnen | goed | speelcontrole ALLEFOUT: 38 met zin, 1 stil, **0 zonder zin** |
| Klok (c) | melding bij "Hij draait weer." / "Nog 1 keer." | **komt niet terug** | ALLEFOUT, F7=1, alleen gedraaid: F16 0, 15.47 0, F7 0, F8 0, F11 0, 286 stappen tot het eind |
| Huisnummers | hint verklapt niet meer | goed | code `squla-huisnummers-gouden-zinnen.ts:296,303` |
| Meten | vals alarm 15.47 weg | goed (uit het rapport) | niet opnieuw gedraaid |
| Minsommen | geen machine meer in de uitleg | goed | code `squla-minsommen-gouden-zinnen.ts:199-203`; speelcontrole tot het eind |
| Plussommen | "zijn samen" | goed | code (geen "is samen" meer) |
| Plussommen extra | lof alleen als het klopt; tegelkleur; "zijn samen" | goed | code `squla-plussommen-extra-gouden.tsx:359` |
| Rekenmix 1 | "ook het laatste" | goed | code `squla-rekenmix-gouden-zinnen.ts:400-402` |
| Rekenmix 2 | handje na 1,5 s | goed | code `SAMEN_HAND_MS = 1500` |
| Rekenmix 4 | "het laatste"; groter ruimteschip | goed | foto 011: groter en niets overlapt; speelcontrole tot het eind |
| Rekentaal | hang bij vraag 9 kwam door drukte | goed (uit het rapport) | niet opnieuw gedraaid |
| Splitsen (a) | Nee-route tot het eind | **goed** | zie hieronder |
| Splitsen extra | getallen in de kleur van de stippen | **niet goed** | de kleur in Bliepo's tekst klopt (foto 005), maar door dit herstel staat er nu `:tegel` op een antwoordknop (fout 1) |
| Tellen | "minder dan jij telde" | goed | code `squla-tellen-gouden-zinnen.ts:193-194` |
| Tellen extra | "een soort fruit" | goed | code `squla-tellen-extra-zinnen.ts:112,258` |
| Tijd | "In het weekend is er geen school." | goed | code `squla-tijd-gouden-zinnen.ts:275` |
| Vormen | puzzelstukjes niet over elkaar | goed | speelcontrole GOED en ALLEFOUT tot het eind; ontwerptest: overlap 0, sprongen 0 |
| Vormen (b) | "pijl ging 3 keer weg en kwam terug" | **deels echt** | zie hieronder |

### (a) Splitsen, Nee-route

- `test-splitsen-gouden.mjs` SCENARIO=goed. Daarin kiest de speler bij de startvraag Nee. Slepen gaat met echte muisbewegingen; de knop Nee wordt aangetikt in de pagina.
  - Uitslag: "Alles in orde", tot de eindkaart zonder ooit op de pijl te tikken, F7 0, F8 0, overlap 0, sprongen 0.
  - Foto: `eind20/foto-spl-test/goed-eindkaart.png`.
- Speelcontrole GOED met NEE=1: 18 stappen, tot het eind, F16 0, F11 0.
  - Na Nee volgt de uitleg: "Sleep 1 pion naar het paarse vak…". Daarna komen alle vragen tot de doek-vragen.
  - Foto's `eind20/foto-spl-nee/`. Geen leeg scherm.
- 18 stappen is niet te weinig. Slepen telt als stap in de tekening, en daar telt de speelcontrole alleen de knoppen van.
- ALLEFOUT: 39 stappen, tot het eind, alles 0.

### (b) Vormen, de pijl

Opnieuw gemeten met ONTWERP=1, 1280×720, allefout. Ik gebruikte een kopie van de test die de momenten laat zien, zodat het script zelf niet veranderd is. Dit keer 4 meldingen:

- **3 keer is het normaal.** Tussen 2 vragen is het tekstvak 0,15 s leeg. Sinds 15.51 gaat de pijl dan mee weg ("nooit een pijl boven een leeg tekstvak"). Vroeger bleef hij 0,15 s boven het lege vak staan. Dit volgt de nieuwe regel; de test telt het nog als knipperen. **Advies:** pas de knippertest aan, zodat een leeg tekstvak ertussen niet meetelt. Dat geldt voor alle `test-*-gouden.mjs`, bijvoorbeeld `scripts/test-vormen-gouden.mjs:604-610`.
- **1 keer is het echt, maar klein.** Dit is fout 2 hierboven.

### (d) Steekproef 15.51 (Dagen, Rekenmix 2, Tijd, Vormen)

Gemeten in zichtbare Chrome, via het lesoverzicht. De speler tikt nooit zelf op de pijl; de meter tikt een paar keer.

| Les | Pijl tijdens praten | Tik op de pijl | Goed met zin | Stil goed |
|---|---|---|---|---|
| Dagen | 16/16 | stem stopt 1 ms, door 3 ms | vanzelf door, 0,9 s na de stem | vanzelf door, 1,6 s, **geen pijl** |
| Rekenmix 2 | 11/11 | stem stopt 1 ms, door 4 ms | vanzelf door, 0,9 s | vanzelf door, 1,4-1,6 s, **geen pijl** |
| Tijd | 13/13 | stem stopt 0 ms, door 3 ms | vanzelf door, 0,9 s | vanzelf door, 1,6 s, **geen pijl** |
| Vormen | 15/15 | stem stopt 1 ms, door 4 ms | vanzelf door, 0,9 s | vanzelf door, 1,4-1,6 s, **geen pijl** |

Overal goed. In de speelcontrole met STEM=1 staan deze 4 lessen wel op ✗. Dat komt alleen doordat de opnames van Ruth nog ontbreken ("geen stem van Ruth voor …"), en die komen pas aan het eind.

## Controles

| Controle | Uitslag |
|---|---|
| `npm run opgaven` | goed (einde 0) |
| `npm run stemdubbel` | alleen de bekende "1." en "11." (einde 1, verwacht) |
| `REV=HEAD npm run inhoudsvergelijk` | goed: 0 verdwenen |
| `npx tsc --noEmit` | in `src/` alleen de bekende fout `squla-rekenmix-gouden-zinnen.ts:332`. De andere meldingen komen uit mappen buiten de code (`output/reservekopie-…`, `backups/…`, `.next/`). |
| speelcontrole Splitsen GOED+NEE / ALLEFOUT | tot het eind; F16 0, 15.47 0, F11 0 |
| speelcontrole Vormen GOED / ALLEFOUT | tot het eind (66 / 495 stappen); F16 0, 15.47 0, F11 0 |
| speelcontrole Dagen, Geld, Rekenmix 4, Splitsen extra, Minsommen (GOED, met foto's) | alle 5 tot het eind |
| database | in les_uitkomsten 0 nieuwe regels die niet van Testkind zijn (alleen gelezen) |

## Niet kunnen nagaan

- De echte stem van Ruth (nog niet opgenomen) en geluid dat je echt hoort.
- `test-meten-gouden` en `test-rekentaal-gouden` niet opnieuw gedraaid. Ik heb op hun herstelrapport vertrouwd.
- Telefoon en tablet, en vloeiendheid: bewust niet (pas aan het eind).

## Opruimen

Mijn eigen Chrome-processen zijn allemaal weg en het browserslot is weggehaald.

Er draait nog 1 oude headless Chrome van een eerdere test (`test-klok-pijl`, PID 99416, al ±4 uur, zonder ouderproces). Die is niet van mij. Stoppen werd door de rechten geweigerd. Sara kan hem stoppen met `kill 99416`, of hem laten staan; hij doet niets.
