# Rood rondje, groep C (klok, tijd, dagen, meten, rekentaal)

Stand: werk bezig (6 november 2026). Wat Bliepo aanwijst krijgt een rood, met de hand getekend dubbel rondje
(`public/rondje/rondje-rood-2.png`) in plaats van gloed, gele rand of optillen. Groen (goed) en rood (fout) blijven.

Geen van de vlakken wordt door oude (niet-Squla) lessen gebruikt (grep op bestandsnaam in `src`): het rondje staat dus altijd aan.

## Per vlak

| Vlak (bestand) | Soort | Wat veranderd is | Wat nu een rondje krijgt |
|---|---|---|---|
| `vlakken/squla-klok-vlak.tsx` | Phaser | Nieuwe staat `wijs` (voor `licht` uit het draaiboek). Gedeelde `maakRondjes` uit `holo/rondje.ts`. Staat `licht` blijft bestaan voor de eigen keuze van het kind (memory-lijnen) en houdt zijn gloed + ring. | Elk aangewezen ding (klok, getal, tegel): 1 rondje per ding, op zijn plek; weg bij nieuw beeld of als het niet meer aangewezen wordt. |
| `vlakken/squla-tijd-trein.tsx` | Phaser | Optillen (y -10) van aangewezen wagons vervangen door rondje; rondje zit in de treingroep (rijdt mee). Gele rand om kaartjes (`kaartLicht`) vervangen door rondje in het kaartje. | Wagons: naast elkaar = 1 rondje om het geheel (bijv. maandag t/m vrijdag), anders per wagon. Kaartjes: 1 rondje per kaartje. |
| `vlakken/squla-tijd-plaatjes.tsx` | Phaser | Gele gloed bij `licht` vervangen door rondje (`kleur()` geeft nu alleen nog groen). | Kaartjes (kaart, los, links, rechts): 1 rondje per kaartje. |
| `vlakken/squla-dagen-trein.tsx` + `squla-dagen.module.css` | DOM/CSS (was al zo) | `.licht` tilde de wagon op en gaf een witte rand; nu een `<img>`-rondje. | Wagons: naast elkaar = 1 rondje, anders apart. |
| `vlakken/squla-meten-vlak.tsx` (+ `lessen/squla-meten.tsx`) | Phaser | Gele gloed bij `licht` vervangen door rondje. Nieuwe prop `gekozen` voor "het kind koos dit al" (dat was `licht`, blijft gele gloed). | Kaartjes die Bliepo aanwijst: 1 rondje per kaartje. |
| `vlakken/squla-rekentaal-keuken.tsx` + `squla-rekentaal.module.css` | DOM/CSS | Gele ring (`data-markeer`) vervangen door `<img>`-rondje in de knop. | Aangewezen voorwerp (beker, appel, ...): 1 rondje. |

## Bewust niet veranderd
- Gele pijl "vandaag" (tijd-trein, dagen-trein): een pijl die betekent "dit is vandaag", geen aanwijslicht.
- `gekozen` in dagen-trein (kind koos een wagon, witte rand) en de keuze van het kind in meten (nu `gekozen`, gele gloed).
- Zachte gloed om de tekening bij een verhaaltje (tijd-trein `plaatjeVan`): geen aanwijzing, hoort bij de tekening.
- Tellen in `squla-meten-vlak` (`tel`, getalbadges op de tekening): de nummertjes zelf zijn het tellen; geen gloed. Zie NIET GEZIEN.
- `squla-tijd-tekeningen.ts` en `squla-meten-tekeningen.ts` niet aangeraakt. (`squla-klok-tekenen.ts` wel: alleen de wijzer-aanwijzing, zie hieronder.)

## Aanvullingen na het bekijken
- Klok: de wijzer met `nadruk` kreeg al een oranje/paars ringetje en een pil-tint (in `squla-klok-tekenen.ts`, van 4 november). Die zijn weggehaald uit de tekening; nieuwe functie `wijzerPunt()` geeft de punt van de wijzer en het vlak zet daar het rode rondje (alleen dit; niet ook om de hele klok). Het rondje om de punt is klein gemaakt (34 x 28 punten, voor de schaal van het ding).
- Dagen-trein en rekentaal zijn DOM-vlakken (geen Phaser; zo waren ze al). Het rondje is daar een `<img>` met CSS-animatie (alleen opaciteit en schaal, geen filter). Fout gevonden en hersteld: een globale `img { max-width: 100% }` kneep het rondje bij grote voorwerpen (pannenkoek) smaller en scheef; nu `maxWidth: none`. Na dit herstel is rekentaal NIET opnieuw gefotografeerd.
- Dagen-trein: de wagon is maar ~56 punten hoog onderin de knop (140); het rondje is daarop afgestemd (de eerste versie stond te hoog; de verbeterde versie is gefotografeerd, zie zaterdag hieronder).

## Controles (met cijfers)
- `npx tsc --noEmit -p .`: 0 fouten in `src/` (aan het eind gedraaid, ook na de laatste wijzigingen).
- Schermfoto's (als Testkind, route Nee) die ik echt heb bekeken:
  - `squla-klok-hoelaat-1`: rood dubbel rondje om de punt van de grote wijzer (foto klok2-08); de oude oranje ring is weg. Rondje stond nog te groot, daarna verkleind (niet opnieuw gefotografeerd).
  - `squla-dagen-van-de-week`: rood rondje om de wagon zaterdag terwijl Bliepo "Zaterdag." zegt (foto sd-002), netjes om de wagon. Gloed van de wagons zelf (kleur van de dag) ongewijzigd.
  - `squla-rekentaal`: rondje om de grote pannenkoek (foto squla-rekentaal-001) stond 40 punten te ver links; oorzaak gevonden (max-width) en hersteld, niet opnieuw bekeken.
- Foto's staan in `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/rondje-c/`.
- Back-ups van de oorspronkelijke bestanden: `.../scratchpad/c-orig/` (en `squla-klok-tekenen.na-andere.ts` = de stand met de wijzigingen van anderen, vlak voor mijn aanpassing).

## NIET GEZIEN (niet gemeten of niet bekeken)
- `npm run speelcontrole` (GOED, ALLEFOUT, NEE): NIET gedraaid. De computer had load average 150 tot 425; mijn schermfoto-runs duurden al 4 tot 10 minuten per les. Dat moet nog.
- `npm run vloeiend` (laptop, 55 beelden/s, hapering): NIET gemeten. Het rondje is een enkel plaatje per aangewezen ding (geen gloed, geen nieuw plaatje per beeld); de enige nieuwe beweging is een korte fade/schaal bij verschijnen. Maar dat is een verwachting, geen meting.
- Tijd-trein (`squla-tijd-dagen-*`, wagons en kaartjes), tijd-plaatjes (`squla-tijd-kalender-*`, `squla-tijd-tijden-*`) en meten (`squla-meten-*`): code gebouwd en typecontrole schoon, maar het aanwijsmoment is NIET op een schermfoto gezien (mijn foto's kwamen telkens vlak voor of na het aanwijzen). Dus niet gezien: grootte/plek van het rondje bij die vlakken, en of het bij een nieuwe vraag goed weggaat.
- Klok: de andere vraagsoorten (digitaal, memory-lijnen, tegels slepen) niet gezien; de staat `licht` (eigen keuze van het kind) is bewust onaangeraakt maar niet gefotografeerd.
- Meten: of de gele gloed (`gekozen`) bij de vraag waar het kind 2 kaartjes kiest nog goed werkt: niet gezien.
- `tel`-badges in meten (Bliepo telt mee): geen rondje toegevoegd (de nummerbadges zijn zelf het tellen); keuze van mij, niet gezien of Sara dat zo wil.

## Voor Sara / volgende helper
- `holo/rondje.ts` niet gewijzigd. Wel nodig voor DOM-vlakken: een kleine gedeelde React-component (`<Rondje b h />`) zodat dagen-trein en rekentaal niet elk hun eigen `<img>` + CSS hebben.
- Niets gecommit, niets online, niets in de database gezet, geen betaald tegoed gebruikt.
