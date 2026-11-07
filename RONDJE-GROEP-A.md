# Rondje groep A (Tellen, Meer-minder, Vormen)

Stand: code af, controles maar deels gelukt (6 november 2026). De laptop was overbelast (load average 150 tot 430, andere helpers tegelijk), dus veel checks liepen vast of waren zeer traag.

## Eerst gecontroleerd
De vier vlakken (tellen-holo, tellen-telrij, meer-minder-vlak, vormen-vlak) worden alleen door Squla-lessen gebruikt
(`squla-tellen`, `squla-meer-minder`, `squla-vormen`). Alleen `squla-rekenmix-tekenen.ts` leest `tekenVorm` uit
`squla-vormen-tekenen.ts` (een tekenfunctie, geen aanwijzing). Dus het rondje staat altijd aan, geen prop nodig.
Hulp gebruikt: `src/components/les/holo/rondje.ts` (niet gewijzigd).

## squla-tellen-holo.tsx (Tellen met fruit, Resultatief tellen, zak)
- Samen tellen: de gele gloed op het getelde voorwerp is weg. Bij rijen komt een rondje om de rij die Bliepo telt
  (iets smaller en lager gemaakt zodat het het getal en de volgende rij niet raakt). Bij verspreide voorwerpen en de zak
  komt een rondje om het voorwerp dat hij nu telt; het rondje loopt mee van voorwerp naar voorwerp.
- De zak (`zakLicht`): de pulserende gele ring is vervangen door een rondje om de zak.
- Begeleide uitleg (`telActief`): het voorwerp dat het kind moet aantikken krijgt een rondje (nieuwe scènemethode `wijs`).
  Dan staat alleen dat rondje er (geen tweede rondje van het tellen).
- Het rondje blijft staan tot het tellen verandert, het antwoord goed/fout is, of er een nieuwe opgave komt.
- Gebleven: groene gloed bij goed, het dof maken van wat al geteld is, de getallen en turfstreepjes (geen aanwijzing).
## squla-tellen.module.css
- `.telknop`: de gele rand is weg (de aanwijzing is nu het rondje in Phaser); de knop is nog steeds er, onzichtbaar en
  klikbaar. De witte focusrand (`:focus-visible`) is niet aangeraakt.
## squla-tellen-telrij.tsx (Telrij)
- `licht`: de gele gloed op de grond onder het huis en de gele rand om het kaartje zijn vervangen door een rondje om het huis of kaartje.
- Gebleven: het lichtje van `hand` (laat zien hoe je sleept; geen aanwijzing van een ding), groene lichtgolf bij goed.
## squla-meer-minder-vlak.tsx
- `tel`: de gele gloed op het getelde voorwerp is weg; een rondje om de rij(en) waar Bliepo nu in telt (bij een sprong
  van meerdere rijen: om alle rijen). Eén rondje per kaart.
- Gebleven (en bewust niet veranderd): `lichtOp` (reactie op het tikken van het kind op een kaart) en de goed/fout-kleuren.
## squla-vormen-vlak.tsx
- `licht`: de gele gloed is weg; wat in `licht` staat krijgt een rondje. Dingen die dicht bij elkaar staan (een rijtje
  kralen, een paar) krijgen samen 1 rondje; dingen ver uit elkaar krijgen elk een rondje. Groen en dof krijgen er geen.
- Puzzelhint: de gele rand om de plek waar het stukje hoort is een rondje geworden (2,7 s, daarna weg).
- Gebleven: het gekozen stukje (door het kind aangetikt) blijft geel opgelicht (selectie van het kind, niet "Bliepo wijst aan").

## Controles (wat echt gedaan is)
- `npx tsc --noEmit -p .`: geen fouten in `src/` (twee keer gedraaid, de laatste na alle wijzigingen).
- Schermfoto's bekeken (Testkind):
  - Tellen fruit-1 (Nee-route): rondje om de getelde rij (5 appels), later om de volgende rij; bij "tik op de appel met de kring" een rondje om de appel die je moet aantikken. Zie rondje-a/t3-03.jpg, t3-06.jpg, t1-13.jpg.
  - Tellen resultatief3-4 (zak): rondje om het eerste knikkertje bij het tikken (z5-3.5.jpg).
  - Meer-minder evenveel1-1: rondje om de getelde rij van 5 appels, de rest dof (m1-05.jpg).
  - Vormen patronen-1: 1 rondje om 3 kralen die bij elkaar horen (p1-04.jpg).
  - (alle foto's staan in de map scratchpad/rondje-a/)
- Speelcontrole GOED=1 voor 5 lessen: telrij-1 gelukt (16 stappen, tot het eind). fruit-1, meer-minder-evenveel1-1 en vormen-patronen-1 gaven "0 stappen" (opstart-flake door overbelasting; niet opnieuw gelukt).

## NIET GEZIEN / NIET GEDAAN
- Het rondje bij Telrij (`licht`) is niet op een foto gezien (de Nee-route kwam niet in beeld voor het einde van mijn tijd). De code is wel getypecheckt en de les speelt door (16 stappen).
- Het rondje om de zak (`zakLicht`) en het rondje bij verspreide voorwerpen (fruit-3) niet gezien (dev-server laadde plaatjes/chunks niet door de overbelasting).
- De puzzelhint (rondje op de plek van het stukje) niet gezien.
- Speelcontrole met ALLEFOUT=1 en NEE=1 niet gedraaid; GOED=1 maar voor 1 van 5 lessen geslaagd (de rest: opstart-flake).
- `npm run vloeiend` niet gedraaid: geen meting van beelden per seconde of hapering. Wat ik wel weet: per rondje wordt 1 plaatje aangemaakt (de gedeelde hulp laadt de afbeelding 1 keer); bij tellen verschijnt/verdwijnt er per getelde stap hooguit 1 plaatje (bij verspreid/zak en 260 ms per stap; bij rijen 1 per rij). Gemeten is het niet.
- Aandachtspunten voor Sara/de controleur:
  - De witte focusrand om de aan te tikken knop (`.telknop:focus-visible`) staat er nog; bij het tikken-met-de-kring staat er dus een witte ring + het rode rondje. Dit is de toetsenbord-focus; ik heb hem niet weggehaald (regel 3). Beslissing nodig.
  - Het gekozen stukje van een puzzel blijft geel opgelicht (selectie), ook als Bliepo het bij de hint kiest.
  - `lichtOp` bij meer-minder (even oplichten als het kind op een kaart tikt) is bewust niet veranderd.
  - Niets nodig aan `rondje.ts` (niet gewijzigd).
