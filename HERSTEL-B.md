# Herstel groep B — voortgang (7 november 2026)

Groep B: Meten, Meer-minder-evenveel, Getallenlijn, Huisnummers, Tellen, Vormen.
Probleemlijst: OVERZICHT-B.md. Keuzes en nieuwe zinnen: onderaan KEUZES-VOOR-SARA.md (kopje "Groep B").
Foto's: `public/overbodige-plaatjes-na/<les-id>-voor.jpg` (oude foto uit het overzicht) en `-na.jpg` (nieuwe foto, Testkind, /voorbeeld/les).
Niets gecommit, niets online. Typecheck (`npx tsc --noEmit`): geen fouten in `src/`.

## Voor alle lessen van groep B
- Goede antwoord op een willekeurige plek (plaatjes, kaarten, getal- en woordknoppen); volgorde-opgaven liggen nooit al goed. Antwoorden, score en hints ongewijzigd.
- Keuzes in zachte vakken (zoals de geldles); voorbeeld bovenaan in een eigen vak.
- Glazen knikker (`public/voorwerpen/knikker-glas.png`, nieuw; de oude `knikker.png` blijft voor groep C).
- 4 getalknoppen als 2 × 2 (nieuwe losse instelling `perTwee` in `soort.ts`/`Lesscherm.tsx`; alleen gebruikt door Meer-minder en Getallenlijn).

## Per les
| Les | Gedaan | Wat | Foto's |
|---|---|---|---|
| squla-meten-hoeveelheden-1 | ja | zelfde broodje met meer/minder kaas; voorbeeld even groot in eigen vak; volgorde nooit al goed | voor/na (+ na-2) |
| squla-meten-hoeveelheden-2 | ja | mand zakt (stofwolkje); rugtas wipt; speelgoed hupt uit de tas; appels rollen in de tas; glazen knikker; maatbekers etiket boven, vakken; geen los plaatje bij "Nog 3 vragen" | voor/na |
| squla-meten-oppervlakte-1 | ja | kaarten in vakken; derde keuze nu "Blauw is 8 hokjes groot."; tekst valt niet meer van de kaart | voor/na |
| squla-meten-oppervlakte-2 | ja | kortere vraag na de eerste keer; tafels verder van de rand | voor (na: zie onder) |
| squla-meten-pizza-1 | ja | herhaalvraag nooit al op volgorde | voor (na: zie onder) |
| squla-meten-pizza-2 | ja | ijsjes met losse bolletjes, voorbeeld even groot in eigen vak | voor/na |
| squla-meer-minder-evenveel1-2 | ja | voorbeeld in warm vak, keuzes in vakken, kaarten op volgorde in vakken | voor/na |
| squla-meer-minder-evenveel1-3 | ja | 2 kaarten in vakken, midden | voor (na: zie onder) |
| squla-meer-minder-evenveel2-1 | ja | 3 kaarten met ruimte ertussen | voor (na: zie onder) |
| squla-meer-minder-evenveel2-2 | ja | idem | voor (na: zie onder) |
| squla-meer-minder-evenveel3-1 | ja | glazen knikker, getal boven in het midden, kaarten in vakken, potjes nooit al op volgorde | voor/na |
| squla-meer-minder-evenveel3-2 | ja | 4 knoppen 2 × 2; glazen knikker; rijen in het midden | voor/na |
| squla-getallenlijn-rangschikken-1 | ja | planeten: alleen het vraagteken leeg | voor/na |
| squla-getallenlijn-rangschikken-2 | ja | onder elke diamant/ster iets (getal, puntjes of ?) | voor/na |
| squla-getallenlijn-rangschikken-3 | ja | getallenlijn met de grenzen i.p.v. leeg scherm | voor/na |
| squla-getallenlijn-kat-1 | ja | planeet weg, raketje landt na het antwoord; figuurtjes bij bordjes weg; lijn van de rand | voor/na |
| squla-getallenlijn-kat-2 | ja | raketje vliegt in en landt; planeet in het midden; figuurtjes weg | voor/na |
| squla-getallenlijn-dieren-2 | ja | kaartjes nooit al op volgorde | voor (na: zie onder) |
| squla-getallenlijn-terugtellen-1 | ja | raket trilt met rook na goed, stijgt op na de laatste vraag; rij in het midden; 4 knoppen 2 × 2 | voor/na (foto vóór 2 × 2) |
| squla-tellen-resultatief1-3 | ja | glazen knikker, verspreide dingen weg van rand en microfoon | voor (na: zie onder) |
| squla-tellen-resultatief3-3 | ja | glazen knikker, rijen van 10 kleiner en in het midden | voor/na |
| squla-tellen-resultatief3-4 | ja | glazen knikker, knikkertje onder het getal op de zak, zak naar het midden | voor/na |
| squla-vormen-opruimen-1 | ja | plaatjes in vakken met ruimte; paren nooit recht boven elkaar | voor/na |
| squla-vormen-orienteren-1 | ja | elk antwoord in een vak | voor/na |
| squla-vormen-patronen-2 | ja | elk tweetal in een vak | voor/na |
| squla-huisnummers | ja | alleen willekeurige plek van het goede antwoord | — |
| vormen-kleuren-1/2/3 (puzzels) | niet aangeraakt | op verzoek | — |

## Controle (speelcontrole als Testkind, laptop 1440 × 900, 1 Chrome, 1 les tegelijk)
- Tot het eind gespeeld zonder fouten: alle 25 aangepaste lessen plus de "in orde"-lessen evenveel1-1, getallenlijn-dieren-3, vormen-patronen-1 en tellen-resultatief2-2 (gedeelde code).
- getallenlijn-rangschikken-2 (en eerder huisnummers): de speelcontrole meldt soms "de zin noemt het vraagteken, maar 'Weet ik niet' staat er niet". Dat is een bestaande, wisselende melding van het controlescript bij de bestaande zin "Welk getal hoort bij het vraagteken?" (rangschikken-1 en -3 gebruiken dezelfde zin en kwamen er wel doorheen). De les zelf loopt tot het eind.
- meten-pizza-3: 1 keer "alleen in de tekening te doen" bij de weegschaal (de laptop stond op belasting 150–400 door andere helpers); het scherm zelf is goed (zie foto). Niet opnieuw kunnen controleren.
- NIET gedaan: `npm run vloeiend` (beeldjes per seconde) — de laptop was te zwaar belast (load 150–400) voor een eerlijke meting. Alle nieuwe animaties gebruiken alleen tweens op bestaande plaatjes en één keer getekende textures (geen gloed per beeld).

## Ronde 2 (na CONTROLE-HERSTEL-B.md, 7 november)
| Wat | Gedaan | Hoe | Foto's (public/overbodige-plaatjes-na/) |
|---|---|---|---|
| squla-vormen-opruimen-1: rij van 3 buiten het vak | ja | in `parenVraag`: 3 dingen nu maat 72 (was 84), vak 264 breed (was 250); rij past ruim, ook op telefoon | opruimen-1-na-r2.jpg, -na-r2-telefoon.jpg |
| squla-meer-minder-evenveel1-2: bloemen te klein op telefoon | ja | alleen op een staand scherm en alleen bij "op volgorde": hoge kaarten, de groepjes van 5 als kolommen; vakjes en kaarten gebruiken bijna de hele hoogte. Voorwerpen ongeveer 1,5 × zo groot (±12 px i.p.v. ±8 px). Laptop ongewijzigd. Antwoord, bordjes, slepen en tikken werken (gespeeld tot het eind) | evenveel1-2-na-r2-telefoon.jpg |
| Punt A: precies omgekeerd | ja | `mengOrden` (Meten), `mengNietOpVolgorde` (Meer-minder), `mengNietOplopend` (Getallenlijn): bij 3 of meer nooit al goed en ook nooit precies omgekeerd | — |
| squla-meten-oppervlakte-1: tafels krap tegen de rand | ja | bij 4 of meer losse kaartjes minder ruimte ertussen (20 i.p.v. 40); nu ±80 px van de rand (was 46) | oppervlakte-1-na-r2.jpg |
| squla-getallenlijn-kat-2: 10 stond niet onder de lijn | ja | bij "Bij welk getal staat de ufo/satelliet?" staan nu 10, 15 en 20 onder de lijn, net als bij de pijlvragen in dezelfde les | kat-2-na-r2.jpg |
| Punt B: bal.png | ja | groep B tekent "bal" nu als de strandbal `speelbal` (Tellen, Vormen-opruimen/oriënteren/patronen, Getallenlijn, Meer-minder). Woord blijft "bal". bal.png zelf niet aangeraakt; vormenpuzzels niet aangeraakt | tellen-resultatief3-3-na-r2.jpg, orienteren-1-na-r2.jpg, getallenlijn-dieren-1-na-r2.jpg |

Controle: speelcontrole als Testkind, 1 Chrome tegelijk. Laptop: opruimen-1, oppervlakte-1, getallenlijn-kat-2, tellen-resultatief3-3, orienteren-1, getallenlijn-dieren-1, evenveel1-2 — alle tot het eind, 0 fouten. Telefoon (390 × 844): evenveel1-2 en opruimen-1 — tot het eind, 0 fouten. `npx tsc --noEmit`: geen fouten in `src/`. `npm run vloeiend` niet gedraaid (laptop druk); alleen indeling veranderd, geen nieuwe animaties of gloed.
