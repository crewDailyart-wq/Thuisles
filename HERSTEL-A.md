# Herstel groep A (klok, tijd, dagen, geld) — 7 november 2026

Alles uit OVERZICHT-A.md is langsgelopen. Uitleg per keuze: KEUZES-VOOR-SARA.md (blok "Groep A").
Foto's vóór en ná: `public/overbodige-plaatjes-na/<les-id>-voor.jpg` en `-na.jpg`.
Getest als Testkind, met schermfoto's vóór en na het antwoord. `npx tsc --noEmit`: geen fouten in deze bestanden.
Vloeiend (laptop en trage telefoon): hoelaat-1, klokkijken3-4, dagen-1, geld-2, geldmachine-1 halen 59-60 beelden/s, geen hapering boven 50 ms.
(Openen duurt in de ontwikkelversie langer dan 1 s; dat moet op de echte site gemeten worden.)

| Les | Gedaan | Wat | Foto's |
|---|---|---|---|
| squla-klok-hoelaat-1 | ja | bus speelt na (wegrijden, rijden, laden); zon/bakkerij/maan als zachte achtergrond; zon "lager" staat echt lager; klok op vaste plek | ja |
| squla-klok-hoelaat-2 | ja | oven gaat aan (gloed), taart springt uit de oven, bus speelt na, zon laag; klokkeuzes in vakken, plek willekeurig | ja |
| squla-klok-hoelaat-3 | deels | zelfde aanpak, oven gaat uit; vraag 9 (bus/bakkerij) bewust laten staan: Sara beslist | (zelfde vlak als hoelaat-1/2) |
| squla-klok-digitaal-1 | ja | grote klok naast laptop en telefoon (inzoomen) | ja |
| squla-klok-digitaal-2 | ja | bakkerij/maan achtergrond, deeg rijst, bus rijdt/rijdt weg, taart uit oven, taart op; keuzes in vakken | ja |
| squla-klok-klokkijken-2, -3, 1-3, 2-3, 3-1 | ja | plek goede klok willekeurig per les-start; keuzes in vakken | nee (alleen plek) |
| squla-klok-klokkijken1-1 (ook 2-2, digitaal-1) | ja | koppelen: rechts willekeurig, nooit recht tegenover; klokjes groter | ja |
| squla-klok-klokkijken3-4 | ja | vraagklok groot in eigen vak met "nu"; antwoorden in vakken; raket vertrekt, lampje gaat uit; rest achtergrond of weg | ja |
| squla-tijd-dagen-1 | ja | geen vraagteken/lege trein meer: locomotief, na antwoord rijdt de trein binnen; dagnamen groter; eindkaart toont de trein | ja |
| squla-tijd-dagen-2 | ja | dagnamen groter; plek willekeurig | nee |
| squla-tijd-dagen-3 | ja | tent komt dichtbij na antwoord; zwembad/bed achtergrond; schaar/huis/taart weg | ja |
| squla-tijd-kalender-1 | ja | keuzes in even hoge vakken (lijntje breder), gym = hoepel + bal, koppel-kalenders groter, "feest" op rood bordje | ja |
| squla-tijd-kalender-2 | ja | lange antwoorden onder elkaar en even breed | ja |
| squla-tijd-tijden-1 | ja | kampvuur achtergrond; boeken, maan (verklapte "laat") en zwembad weg; avond-icoon zoals ochtend | ja |
| squla-tijd-tijden-2 | ja | bakkerij achtergrond, brood weg, kortere vraag, knop "1 week kamperen" ook in de code | ja |
| squla-dagen-van-de-week | ja | dagnamen groter, dagkaarten willekeurig; eindkaart werkt weer | ja |
| squla-geld-geld-1 | deels | munten groter, bedragen rechts willekeurig; 3+ paren per ronde NIET gedaan (nieuwe inhoud, Sara beslist) | ja |
| squla-geld-geld-2 | ja | groepjes in vakken, 2 × 2 in het midden | ja |
| squla-geld-geldmachine-1 | ja | 6 zwevende keuzes in 2 rijen vierkante vakken, munten ±2,5 × groter; plek willekeurig | ja |
| squla-geld-geldmachine-2 | ja | groepjes in vakken | ja |
| squla-geld-zakgeld-1 | ja | schelpen, doos, bordje, jas weg (geld zelf in beeld); schoen achtergrond; vakken | ja |
| squla-geld-zakgeld-2 | ja | geld vliegt in de spaarpot na antwoord; marktkraam achtergrond; knopen weg; vakken | ja |

Gewijzigde bestanden: squla-klok.tsx, squla-tijd.tsx, squla-dagen.tsx, squla-geld.tsx, vlakken squla-klok-vlak.tsx,
squla-tijd-trein.tsx, squla-tijd-plaatjes.tsx, squla-tijd-tekeningen.ts, squla-dagen-trein.tsx, squla-geld-vlak.tsx.
Gedeeld, alleen iets bij (bestaand gedrag gelijk): soort.ts en Lesscherm.tsx (nieuwe keuze-instelling `onderElkaar`).

## Ronde 2 (na CONTROLE-HERSTEL-A.md, 7 november 2026)

Uitleg per keuze: KEUZES-VOOR-SARA.md (blok "Groep A — ronde 2"). Foto's vóór/ná: `public/overbodige-plaatjes-na/<les-id>-r2-voor.jpg`,
`-r2-na.jpg` (laptop) en `-r2-telefoon-voor.jpg` / `-r2-telefoon-na.jpg`. Getest als Testkind op `/voorbeeld/les/…`, laptop 1440x900 en telefoon 390x844.
`npx tsc --noEmit`: geen fouten in src. Vloeiend (hoelaat-1, klokkijken3-4, tijd-dagen-1; laptop en trage telefoon): 58-60 beelden/s, langste beeld ≤ 41 ms.

| Punt | Gedaan | Wat | Foto's |
|---|---|---|---|
| hoelaat-1: bus tegen de klok | ja | bus links van de klok, rijdt alleen zo ver als er plek is; oude beeld wordt bij een nieuwe vraag echt weggehaald (ook als de bus nog naspeelt); klok bij bus- en zonvragen even groot | hoelaat-1-r2 |
| hoelaat-2: taart over de oven | ja | taart landt naast de oven (telefoon) of bovenop de oven (laptop, naast de klok), altijd in beeld | hoelaat-2-r2 |
| klokkijken3-4: vak "nu" | ja | vak "nu" vast midden bovenaan; oude klok + vak eerst weg, dan het nieuwe; taart en gieter als zachte achtergrond (zin klopt weer) | klokkijken3-4-r2 |
| tijd-kalender-1: gym-vraag | ja | 3 keuzes in 1 rij, even hoog (zoals vraag 1), plek willekeurig | tijd-kalender-1-r2 |
| A1 klok telefoon | ja | klokvlak groeit staand door tot boven de ballon; vraagklok ±180-225 px i.p.v. 100-125, antwoordklokken ±110 px i.p.v. 75; verbinden/memory onder elkaar en groter | hoelaat-1/2, klokkijken3-4, klokkijken1-1 -r2-telefoon |
| A2 weektrein telefoon | ja | trein in 2 rijen, wagons ±2× zo breed (dagnaam ±13 px i.p.v. 7); dagkaarten groter | dagen-van-de-week, tijd-dagen-1/2/3 -r2-telefoon |
| klein: knop "2" weekend | niet nodig | staat in eigen foto's helemaal in beeld | tijd-dagen-1-r2-telefoon |

Gewijzigde bestanden ronde 2: vlakken `squla-klok-vlak.tsx`, `squla-tijd-trein.tsx`, `squla-dagen-trein.tsx`, `squla-tijd-plaatjes.tsx`; les `squla-klok.tsx` (taart/gieter achtergrond).
Gedeeld, alleen iets bij: `soort.ts` (`staandHoogte`, `magStaandGroeien`), `holo/motor.tsx` (optie `hoogte`), `Lesscherm.tsx`
(alleen voor een vlak met `staandGroei` op een staand scherm: hoger vlak; nu alleen het klokvlak). Laptop en alle andere vlakken: zelfde maat als eerst.
Ook op telefoon nagelopen: digitaal-1 (grote klok, keuzes in vakken eronder). Niet zelf nagelopen op telefoon: de sleepvraag met klokjes (zelfde indeling als eerst, nu bovenin een hoger vlak) en digitaal-2.

## Ronde 3 (na CONTROLE-HERSTEL-AB2.md, 7 november 2026)

Uitleg: KEUZES-VOOR-SARA.md (blok "Groep A — ronde 3"). Getest als Testkind, laptop 1440x900 en telefoon 390x844. `npx tsc --noEmit`: geen fouten in src.

| Punt | Gedaan | Wat | Foto's (`public/overbodige-plaatjes-na/`) |
|---|---|---|---|
| 3 keuzeklokken telefoon | ja | 2 + 1 (of 1 + 2 bij achtergrond), klok ±150 px i.p.v. ±100; laptop en "nu"-vraag ongewijzigd | squla-klok-digitaal-2-r3-, squla-klok-hoelaat-2-r3-voor/na |
| N1 kalender-1 telefoon | ja | kalendervlak groeit staand mee; keuzes in rijen, brede kalender eigen rij; andere vragen op dezelfde plek | squla-tijd-kalender-1-r3-voor/na |
| N2 eerste knop afgeknipt | ja | gedeelde regel in Lesscherm: rij nooit breder dan de ballon; 4 lessen op laptop (ongewijzigd) en telefoon gemeten | squla-tijd-dagen-1-r3-knop-, squla-plus-bakkerij-1-r3-voor/na |
| N3 rondje weekend | ja | rondje blijft binnen het vlak | squla-tijd-dagen-1-r3-rondje-voor/na (laptop) |
| N4 weekendparen telefoon | ja | elk paar een zacht vak, meer ruimte | squla-tijd-dagen-1-r3-voor/na |

Gewijzigd: `vlakken/squla-klok-vlak.tsx` (alleen staande indeling), `vlakken/squla-tijd-plaatjes.tsx` (staand groeien; tikpunt nu met gelijke schaal, op laptop hetzelfde), `vlakken/squla-tijd-trein.tsx` (rondje, vak per paar staand), gedeeld `Lesscherm.tsx` (1 regel `maxWidth`).
Echte tik op het canvas (telefoon, kalender-1) gecontroleerd: komt goed aan.

## Ronde 7 (toets weggehaald materiaal, 7 november 2026)

Lijst en reden per item: WEGGEHAALD.md. Teruggezet: zakgeld-1 bordje en jas; tijden-1 drie boeken, zwembad, maan (alleen bij de uitleg); tijden-2 brood; dagen-3 schaar, huis en taart (zachte achtergrond).
Niet teruggezet: zakgeld-1 doos (echt losse versiering). Hoelaat-3 vraag 9 (bus/bakkerij): vervangen op verzoek van Sara, zij beslist.
Alleen herschreven of vervangen (niet weggehaald): "1 week kamperen", kortere vraag bij tijden-2, klok-vragen met bus/zon/oven (sfeer of naspeel).
Foto's: scratchpad a7 (voor); laptop getest als Testkind.
