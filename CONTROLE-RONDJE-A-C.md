# Controle rondje groep A en C (6 november 2026)

Controleur: Sonnet, alleen lezen. Ik heb `git diff` van de rondje-stukken gelezen, de twee verslagen (RONDJE-GROEP-A.md en -C.md), `holo/rondje.ts`, en de typecontrole gedraaid. Geen speelcontrole, geen Chrome, geen foto's.

## Typecontrole
`npx tsc --noEmit -p . | grep '^src/'`: geen fouten in `src/`.

## FOUTEN (echt, nu aanwezig)
Geen echte fout gevonden in de rondje-stukken van Tellen, Meer-minder, Vormen, Klok, Tijd, Dagen, Meten en Rekentaal. Wel de volgende dingen die ik zwaar genoeg vind om te melden:

1. `licht` en `gekozen` in `squla-meten.tsx` zijn NIET verwisseld. Gelezen: `licht` wordt gezet bij Bliepo die kaartjes noemt (regels 377, 423); `gekozen` bij wat het kind koos (385, 392) en wordt leeg gezet bij goed, fout en nieuwe vraag (373, 398, 402, 404, 406, 412). In het vlak is `gekozen` geel, `licht` een rondje. Klopt.
2. Vormen, puzzelhint (`squla-vormen-vlak.tsx`, rond regel 667-671): `this.time.delayedCall(2700, () => this.pzRondjes?.zet(new Map()))` wordt nooit geannuleerd. Komt er binnen 2,7 s een tweede hint (of een nieuwe puzzel met een hint), dan haalt de oude timer het nieuwe rondje te vroeg weg. Klein, maar wel echt gedrag. Voorstel: onthoud de timer en haal die weg (`remove`) bij een nieuwe hint en in `vergeet`, of laat de timer alleen wissen als `sl` nog `hint-${hintTeller}` is.

## RISICO (geen actieve fout)
1. `holo/rondje.ts`, `laad()` en `textuur()`: laadt het plaatje niet (404, offline), dan blijft `geladen` leeg, maar `laadt` is al afgerond. Elke `zet()` roept `laad().then(() => zet(laatste))` aan, en dat roept `textuur()` weer aan, enzovoort. Dat is een eindeloze lus van beloftes die de pagina kan vastzetten. Pas op het moment dat het plaatje echt ontbreekt. Voorstel: onthoud een mislukte poging (`mislukt = true`) en ga dan niet meer opnieuw laden. (Het bestand is niet door deze twee helpers gewijzigd.)
2. DOM-vlakken (Dagen en Rekentaal) hebben geen vooraf-laden van het plaatje. Alleen de Phaser-vlakken laden het via `rondje.ts`. De eerste keer dat een `<img>` verschijnt kan het plaatje nog laden terwijl de 240 ms-animatie al afspeelt; het rondje komt dan zonder pop-in. Voorstel: bij het openen van die lessen één keer `new Image().src = "/rondje/rondje-rood-2.png"`.
3. Meer-minder, `zetTel`: roept het draaiboek twee keer achter elkaar hetzelfde `tel` aan, of daalt `geteld`, dan wordt `van = 0` en verandert de sleutel (`rij-r0-r1`). Het rondje wordt dan weggehaald en opnieuw gemaakt, om alle rijen vanaf rij 1. Alleen zichtbaar als dat gebeurt; ik zie in het diff geen aanroep die dat nu doet, maar ik heb niet alle draaiboek-paden nagelopen.
4. Klok (`squla-klok-vlak.tsx`, `werkRondjes`): de sleutel bevat `@x,y`. Beweegt een ding met `wijs` of `nadruk` (versleept of verplaatst door een tween), dan wordt het rondje bij elke nieuwe positie vernietigd en opnieuw gemaakt (met 240 ms animatie). Voor een klok met `nadruk` of een tegel met `wijs` die ook versleept wordt, is dat niet vloeiend. In de gelezen code zie ik niet dat dat gebeurt; wel mogelijk. Het rondje staat ook meteen op de eindplek terwijl het ding nog 220 ms naar zijn plek tweent.
5. Klok `nadruk`: het rondje staat zodra het ding bestaat, ook als de klok nog aan het verschijnen is (`tover` met vertraging), omdat `werkRondjes()` onderaan `zet()` het meteen zet.
6. Tijd-trein, vloeiend-demo (`speelHandje`, rond regel 636-643): zet per wagon een rondje, maar haalt het aan het eind niet weg. Alleen de demo van `npm run vloeiend`, geen kind.
7. Tellen: het rondje van Bliepo's tellen blijft staan tot goed, fout of nieuwe opgave (zo staat het ook in het verslag van de helper). Het blijft dus ook na het laatste voorwerp. Is dat bedoeld, dan is het goed; Sara kan beslissen.
8. Dode code die nu niet meer gebruikt wordt: `zakRing` en `selectieRing`-aanroep in `squla-tellen-holo.tsx` (alleen nog `destroy`), en in `squla-dagen.module.css` een lege regel `.licht {}`. Niets kapot; opruimen alleen met toestemming van Sara (HARDE REGEL 3).

## Wat blijft, en wat weg is
- Blijft (gelezen in de code): groen bij goed (Tellen `goed()`, Vormen `goedIds`, Klok `goed`, Tijd-trein en Tijd-plaatjes `groen`, Meten groen en rood, Rekentaal `data-goed`); rood bij fout in Meten en Klok (`fout`, dof en schudden); getalkleur-tekening (in de tekenbestanden, niet aangeraakt); de gele "vandaag"-pijl in tijd-trein (`pijl`, `vandaag`) en dagen-trein; wat het kind zelf koos (Dagen `gekozen`, Meten `gekozen` geel, Klok `licht` voor eigen keuze regel 765, Vormen gekozen puzzelstukje).
- Bewust weg (door de opdracht van Sara): gele gloed op getelde voorwerpen (Tellen, Meer-minder), gele rand om de telknop (alleen de witte `:focus-visible` blijft staan), optillen van wagons (Tijd-trein, Dagen), gele rand om kaartjes, gele ring bij Rekentaal.
- Mogelijk te veel weg, vraag het aan Sara (HARDE REGEL 1 en 3): in `squla-klok-tekenen.ts` is de oranje/paarse pil-tint van de wijzer met `nadruk` verdwenen. Dat is dezelfde soort "oplichten" die Sara wilde vervangen, maar de helper heeft het besluit niet voorgelegd. De functie `wijzerPunt()` zet nu een klein rondje (34 x 28) op de punt van de wijzer; de wijzer zelf is niet meer gekleurd. De prop `nadruk` bestaat nog in het type `Ding`.
- Niet aan oude lessen geraakt: elk gewijzigd vlak wordt alleen door Squla-lessen geïmporteerd (grep: `squla-klok`, `squla-tijd`, `squla-dagen`, `squla-meten`, `squla-rekentaal`, `squla-vormen`, `squla-meer-minder`, `squla-tellen`; `squla-tijd-trein` importeert `DAGEN` uit `squla-dagen-trein`, geen aanwijsgedrag). `squla-klok-tekenen.ts` wordt ook gebruikt door `squla-tijd-tekeningen.ts` (alleen `klokPlaatje`, ongewijzigd).

## Prestaties (HARDE REGEL 7, alleen uit de code)
- In orde: het plaatje wordt in `rondje.ts` één keer geladen (`geladen`, `laadt`) en per scène één keer als textuur gezet; een rondje dat er al staat wordt niet opnieuw gemaakt (zelfde sleutel); niets wordt per beeld uitgerekend; de animatie is één tween van 240 ms (alpha en schaal) bij verschijnen. De `maakRondjes`-exemplaren in Meten, Tijd-plaatjes en Tijd-trein worden pas gemaakt als het ding wordt aangewezen.
- Dagen en Rekentaal: CSS-animatie met alleen `opacity` en `scale`, geen filter; `prefers-reduced-motion` zet hem uit. Het `<img>` heeft een vaste sleutel per rij dus blijft staan tussen renders. Browser-cache zorgt dat het plaatje na de eerste keer niet opnieuw laadt (niet gemeten).
- Rustig: `rondje.ts` slaat de animatie over bij `rustig` (alleen het plaatje). Klok, Tijd-trein, Meten, Plaatjes en Vormen geven `rustig` door. Telrij en Meer-minder ook. In de DOM-vlakken is `rustig` alleen de CSS-regel `prefers-reduced-motion`.

## Dubbele code (alleen melden)
- Dagen-trein en Rekentaal hebben elk een eigen `<img>`-rondje met eigen CSS (`@keyframes rondjeIn` staat twee keer, in `squla-dagen.module.css` en `squla-rekentaal.module.css`), en dezelfde schaalformule (`b * 1.15 + 44`, `h * 1.4 + 50`) als `maat()` in `rondje.ts`, plus de scheefstand-formule. Voorstel: één kleine component `<Rondje b h sleutel />` naast `rondje.ts`, zoals de helper van groep C zelf al voorstelde.
- De "dichtbij elkaar, dan één rondje"-logica staat drie keer: Vormen (`zetRondjes`, ruimte-regel), Tijd-trein (`rondjeVakken`, opeenvolgende wagons), Dagen-trein (`rondjeRuns`). De laatste twee zijn bijna identiek.

## NIET GECONTROLEERD
- Hoe het er op het scherm uitziet (plek, grootte, scheef, of het rondje andere dingen raakt): geen foto's bekeken. De helpers zeggen zelf dat Telrij, de zak, verspreid tellen, de puzzelhint, Tijd-trein, Tijd-plaatjes en Meten niet op een foto zijn gezien; Rekentaal is na de `maxWidth`-reparatie niet opnieuw bekeken. Ik heb dat ook niet gezien. De formules voor Rekentaal (`left`, `top`, `width`, `height`) klopt wel rekenkundig met het midden van de knop.
- De hard-gecodeerde maten in Dagen (`BOVEN + H - 29`, `wh = 56`) zijn niet gecontroleerd tegen andere schermformaten.
- Speelcontrole (GOED, ALLEFOUT, NEE) en `npm run vloeiend`: niet gedraaid (opdracht). Dus geen meting van beelden per seconde of hapering en geen bewijs dat de lessen nog doorspelen.
- Draaiboekpaden in `squla-tellen.tsx`, `squla-meer-minder.tsx`, `squla-klok.tsx`, `squla-tijd.tsx`, `squla-dagen.tsx`, `squla-rekentaal.tsx` heb ik alleen op `licht`/`tel`-aanroepen doorzocht, niet op elke vraagsoort gelezen. De diffs van die bestanden bevatten veel andere wijzigingen (hulp, zinnen) die ik niet heb beoordeeld.
- Of de witte focusring bij de tel-knop (Tellen) samen met het rode rondje goed oogt: beslissing van Sara, niet beoordeeld.
- Of het plaatje `public/rondje/rondje-rood-2.png` er goed uitziet: niet bekeken.
