# SAMENVATTING VOOR SARA (7 november 2026, 's nachts gewerkt)

**Alles bekijken in één keer:** http://localhost:3000/overbodige-plaatjes-na/index.html (88 lessen, vóór en ná, met link naar elke les; dev-server moet draaien).
**Je keuzes nakijken:** `KEUZES-VOOR-SARA.md`. **Wat er mis was:** `OVERZICHT-A/B/C.md` en `OVERBODIGE-PLAATJES.md`. **Wat de controleurs zeiden:** `CONTROLE-HERSTEL-*.md`.

**Gedaan (alleen Squla-lessen):**
- Alle 134 Squla-lessen zijn op schermfoto's bekeken (ongeveer 1.900 vragen). Daarna zijn alle problemen opgelost in groep A (klok, tijd, dagen, geld), B (meten, meer-minder, getallenlijn, huisnummers, tellen, vormen) en C (piraat, splitsen, plus, min, rekenmix, rekentaal).
- Losse plaatjes doen nu iets (bus rijdt, oven gaat aan, mand zakt, raket landt, geld valt in spaarpot) of zijn weg of zacht op de achtergrond.
- Plaatjes die het antwoord verklapten, zijn opgelost (o.a. alle 6 Min-bus-lessen, maan bij Tijd, volgorde bij Meten/Getallenlijn).
- Het goede antwoord staat niet meer steeds op dezelfde plek (regel 1.23 in BOUWREGELS.md).
- Te kleine dingen zijn groter, ook op telefoon: klok, dagnamen op de weektrein, munten, potloden, kalender (regel 1.24).
- Een echte fout gevonden en opgelost: rekenmix-mix4-2 liep vast.
- Controleurs hebben elke les met schermfoto's gekeurd; afgekeurde delen zijn herbouwd en opnieuw goedgekeurd.
- Vormenpuzzels zijn niet veranderd (jouw besluit).
- Back-up staat op GitHub, branch `backup-squla` (niet online, main niet aangeraakt).

**Gemeten:**
- Speelcontrole: 101 + 21 lessen tot het eind gespeeld als Testkind. Bij plus-bakkerij-3 en splitsen1-1 kan het testscript niet zelf typen/slepen; met de hand werkt het.
- Snelheid: bijna alle metingen 59-60 beeldjes per seconde. Eén telefoon-sleepprobleem bij splitsen2-1 (al van 5 en 6 november) is opgelost en daarna goed gemeten; de rest haalde de norm. Opentijd (onder 1 seconde) kan alleen op de echte site gemeten worden.

**Niet gedaan / jouw beslissing:**
- Nieuwe zinnen hebben nog geen opgenomen stem (geen ElevenLabs). Lijst staat in KEUZES-VOOR-SARA.md.
- Eerst gevraagd hadden moeten worden, nu weggehaald als losse versiering: o.a. schelpen en knopen bij zakgeld. Staat in KEUZES-VOOR-SARA.md; terugzetten kan.
- Hoelaat-3 vraag 9 ("broodjes gebakken") laten staan. Geld-1 met meer paren niet gedaan.
- Beginzinnen plus-dansen-4 en rekenmix-mix2-2 niet aangeraakt (andere assistent). Rekenmix-mix2-1: boterhammen nog dezelfde 3 (nieuwe plaatjes nodig).
- Zin die midden in een som afbreekt ("Hoeveel is 7 − / 4?"): zit in een bestand dat ook oude lessen gebruiken; niet aangeraakt.
- Er is niet online gezet.

---

# Squla Rekenen groep 3 nabouwen — voortgang

Opdracht van Sara (30 oktober 2026, 's avonds): alles uitspelen (alle levels, alle vragen,
ook fout), vastleggen in SQULA-ANALYSE/, daarna alles bouwen in Phaser met Bliepo als tutor
(Synthesis-hulp), per Squla-level een les (gewoon + moeilijkere varianten), eigen woorden en
andere getallen, zelfde getallenreeks. Wat niet gezien is, wordt niet gebouwd (lijst onderaan).
De 3 voorbeeldlessen (huisnummers, rekentaal, dagen) blijven zoals ze zijn.

Back-up-branch: `squla-backup-20261030` (GitHub). Main is niet aangeraakt.

## Werkwijze spelen (geleerd)
- Tab "leuk leren - Squla" in Sara's Chrome. Oude quizvorm: tekst staat in de DOM (document.body.innerText),
  maar de knoppen reageren alleen op een echte muisklik (computer left_click op de coördinaten uit
  getBoundingClientRect; die zijn gelijk aan de schermfoto-coördinaten 1456×821). Een JS-klik werkt niet.
- Na een antwoord: uitlegbalk onderin (bij fout: uitlegtekst) + roze pijlknop om door te gaan.
- Een level gaat pas open als het vorige af is.

## Per oefening
| Onderwerp | Oefening | Gespeeld (levels) | Analyse | Gebouwd | Getest |
|---|---|---|---|---|---|
| Tijd | De kalender (16838) | levels 1-2 gespeeld | ja | ja (kalender-1/2) | ja: tot het eind (goed; kalender-2 ook fout); mensen eruit 1 nov |
| Tijd | Tijden (16602) | levels 1-2 gespeeld | ja | ja (tijden-1/2) | ja: tot het eind (goed; tijden-2 ook fout); mensen eruit 1 nov |
| Tijd | Dagen van de week (8961) | levels 1-3 gespeeld | ja | ja (dagen-1/2/3) | ja: tot het eind (goed); mensen eruit 1 nov |
| Getallenlijn | Getallen rangschikken t/m 20 (16056) | levels 1-3 gespeeld | ja | ja (rangschikken-1/2/3) | ja: 9/9 tot het eind (goed, 1 nov) |
| Getallenlijn | Getallenlijn met Kit de Kletskat (16600) | levels 1-2 gespeeld | ja | ja (kat-1/2) | ja: 9/9 tot het eind (goed, 1 nov) |
| Getallenlijn | Getallenlijn met dieren (15757) | levels 1-3 gespeeld | ja | ja (dieren-1/2/3) | ja: 9/9 tot het eind (goed, 1 nov) |
| Getallenlijn | Getallenlijn (10986) | levels 1-1 gespeeld | ja | ja (terugtellen-1) | ja: 9/9 tot het eind (goed, 1 nov) |
| Getallenlijn | Getallenlijn, filmpje (7872) | levels 1-1 gespeeld | ja | geen les (filmpje, volgens afspraak) | geen les (filmpje, volgens afspraak) |
| Getallenlijn | Sprongen van 10, filmpje (8177) | levels 1-1 gespeeld | ja | geen les (filmpje, volgens afspraak) | geen les (filmpje, volgens afspraak) |
| Tellen | Tellen met fruit (15682) | levels 1-3 gespeeld | ja | ja (fruit-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Tellen | Resultatief tellen 1 (10967) | levels 1-3 gespeeld | ja | ja (resultatief1-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Tellen | Resultatief tellen 2 (10968) | levels 1-3 gespeeld | ja | ja (resultatief2-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Tellen | Resultatief tellen 3 (10969) | levels 1-4 gespeeld | ja | ja (resultatief3-1/2/3/4) | ja: tot het eind (goed, 1 nov) |
| Tellen | Tellen tot 10, filmpje (8192) | levels 1-1 gespeeld | ja | geen les (filmpje, volgens afspraak) | geen les (filmpje, volgens afspraak) |
| Tellen | Telrij (10977) | levels 1-2 gespeeld | ja | ja (telrij-1/2) | ja: tot het eind (goed, 1 nov) |
| Tellen | Telrij, filmpje (8195) | levels 1-1 gespeeld | ja | geen les (filmpje, volgens afspraak) | geen les (filmpje, volgens afspraak) |
| Meer, minder, evenveel | Meer, minder, evenveel 1 (10971) | levels 1-3 gespeeld | ja | ja (evenveel1-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Meer, minder, evenveel | Meer, minder, evenveel 2 (10972) | levels 1-2 gespeeld | ja | ja (evenveel2-1/2) | ja: tot het eind (goed, 1 nov) |
| Meer, minder, evenveel | Meer, minder, evenveel 3 (10973) | levels 1-2 gespeeld | ja | ja (evenveel3-1/2) | ja: tot het eind (goed, 1 nov) |
| Meer, minder, evenveel | Meeste, minste, filmpje (8046) | levels 1-1 gespeeld | ja | geen les (filmpje, volgens afspraak) | geen les (filmpje, volgens afspraak) |
| Geld | De geldmachine (16842) | levels 1-2 gespeeld | ja | ja (geldmachine-1/2) | ja: tot het eind (goed, 1 nov) |
| Geld | Zakgeld verdienen (16843) | levels 1-2 gespeeld | ja | ja (zakgeld-1/2) | ja: tot het eind (goed, 1 nov) |
| Geld | Geld (16844) | levels 1-2 gespeeld | ja | ja (geld-1/2) | ja: tot het eind (goed, 1 nov) |
| Minsommen | Minsommen (16055) | levels 1-3 gespeeld | ja | ja (ruimte-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Minsommen | Bussommen 1 (7275) | levels 1-3 gespeeld | ja | ja (bus1-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Minsommen | Bussommen 2 (7276) | levels 1-3 gespeeld | ja | ja (bus2-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Minsommen | Minsommen (6919) | levels 1-4 gespeeld | ja | ja (machine-1/2/3/4) | ja: tot het eind (goed, 1 nov) |
| Minsommen | Kale sommen (7277) | levels 1-3 gespeeld | ja | ja (kaal-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Plussommen | Plussommen (16054) | levels 1-3 gespeeld | ja | ja (bakkerij-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Plussommen | Dansende sommen (15684) | levels 1-4 gespeeld | ja | ja (dansen-1/2/3/4) | ja: tot het eind (goed, 1 nov) |
| Plussommen | Bussommen 1 (7272) | levels 1-3 gespeeld | ja | ja (bus1-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Plussommen | Bussommen 2 (7273) | levels 1-3 gespeeld | ja | ja (bus2-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Plussommen | Kale sommen (7274) | levels 1-3 gespeeld | ja | ja (kaal-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Vormen en figuren | Patronen (16552) | levels 1-2 gespeeld | ja | ja (patronen-1/2) | ja: 7/7 Vormen tot het eind (goed en soms fout) |
| Vormen en figuren | Rommelmonster (17049) | levels 1-2 gespeeld | ja | ja (opruimen-1; level 1 is bij Squla een filmpje) | ja: tot het eind |
| Vormen en figuren | Oriënteren (11412) | levels 1-1 gespeeld | ja | ja (orienteren-1) | ja: tot het eind |
| Vormen en figuren | Vormen en kleuren (7435) | levels 1-3 gespeeld | ja | ja (kleuren-1/2/3) | ja: tot het eind |
| Vormen en figuren | Vormen en kleuren, filmpje (7974) | levels 1-1 gespeeld | ja | geen les (filmpje, volgens afspraak) | geen les (filmpje, volgens afspraak) |
| Meten en maten | Rekentaal met pizza (15756) | levels 1-3 gespeeld | ja | ja (pizza-1/2/3) | ja: tot het eind (goed, 1 nov) |
| Meten en maten | Hoeveelheden (16601) | levels 1-2 gespeeld | ja | ja (hoeveelheden-1/2) | ja: tot het eind (goed, 1 nov) |
| Meten en maten | Oppervlakte (11508) | levels 1-2 gespeeld | ja | ja (oppervlakte-1/2) | ja: tot het eind (goed, 1 nov) |
| Klokkijken | De digitale klok (16839) | levels 1-2 gespeeld | ja | ja (digitaal-1/2, nu "De klok en de tijd") | ja: 18/18 Klok tot het eind (bouwhelper 2, 1 nov) |
| Klokkijken | Hoe laat is het? (15822) | levels 1-3 gespeeld | ja | ja (hoelaat-1/2/3) | ja: 18/18 Klok tot het eind (bouwhelper 2, 1 nov) |
| Klokkijken | Klokkijken (14274) | levels 1-4 gespeeld | ja | ja (klokkijken-1/2/3 = levels 1, 3, 4; level 2 is bij Squla een filmpje) | ja: 18/18 Klok tot het eind (bouwhelper 2, 1 nov) |
| Klokkijken | Klokkijken 1 (10999) | levels 1-3 gespeeld | ja | ja (klokkijken1-1/2/3) | ja: 18/18 Klok tot het eind (bouwhelper 2, 1 nov) |
| Klokkijken | Klokkijken 2 (11000) | levels 1-3 gespeeld | ja | ja (klokkijken2-1/2/3) | ja: 18/18 Klok tot het eind (bouwhelper 2, 1 nov) |
| Klokkijken | Klokkijken 3 (6935) | levels 1-4 gespeeld | ja | ja (klokkijken3-1/2/3/4) | ja: 18/18 Klok tot het eind (bouwhelper 2, 1 nov) |
| Klokkijken | Klokkijken, filmpje (7977) | levels 1-1 gespeeld | ja | geen les (filmpje, volgens afspraak) | geen les (filmpje, volgens afspraak) |
| Splitsen | Splitsen 1 (16840) | levels 1-2 gespeeld | ja | ja (splitsen1-1/2) | ja: tot het eind (bouwhelper 2, 1 nov) |
| Splitsen | Splitsen 2 (16841) | levels 1-2 gespeeld | ja | ja (splitsen2-1/2) | ja: tot het eind (bouwhelper 2, 1 nov) |
| Splitsen | Delen (14737) | levels 1-1 gespeeld | ja | ja (delen-1) | ja: tot het eind (bouwhelper 2, 1 nov) |
| Rekenen met getallen | De piratenschat met plus en min (15823) | levels 1-3 gespeeld | ja | ja (piraat-1/2/3) | ja: tot het eind (bouwhelper 2, 1 nov) |
| Filmpjes | Rekenen met staafjes (8130) | levels 1-1 gespeeld | ja | geen les (filmpje, volgens afspraak) | geen les (filmpje, volgens afspraak) |
| Rekenmix | Rekenen met de Reuzenkrokodil (12517) | levels 1-4 gespeeld | ja | ja (mix1-1/2/3/4) | ja: tot het eind (goed, 1 nov) |
| Rekenmix | Een getal in een hoed? (15728) | levels 1-4 gespeeld | ja | ja (mix2-1/2/3/4) | ja: tot het eind (goed, 1 nov) |
| Rekenmix | Rekenen met dieren (12505) | levels 1-4 gespeeld | ja | ja (mix3-1/2/3/4) | ja: tot het eind (goed, 1 nov) |
| Rekenmix | Rekenen met kikker (12435) | levels 1-4 gespeeld | ja | ja (mix4-1/2/3/4) | ja: tot het eind (goed, 1 nov) |

## Keuzes (bij twijfel, wat het beste is voor het kind)
- Dagen van de week: de voorbeeldles `squla-dagen-van-de-week` blijft zoals hij is (opdracht). De 3 Squla-levels worden daarnaast als eigen lessen gebouwd (squla-tijd-dagen-1/2/3), met dezelfde weektrein, zodat elk level precies Squla volgt.
- De bonusspelletjes van Squla ("Rennen maar!", disco-kaartje kiezen) horen niet bij het leerdoel: niet nagebouwd.
- Squla's vraag over koffie/limonade (wat duurt korter) is dubbelzinnig: in onze les een duidelijk verschil (bijvoorbeeld tanden poetsen vs. een nacht slapen).
- Luistervragen zonder tekst: bij ons zegt Bliepo de keuzes en staan ze als knop (voorlezen bij aanwijzen).
- Filmpjes (uitlegvideo's) worden geen eigen les: Squla stelt daar geen vragen. Wat ze uitleggen, gebruikt Bliepo in de uitleg van de lessen over hetzelfde onderwerp. (7872 en 8177 gaan boven de 20/100; geen groep 3-oefening bij Squla zelf.)
- Helpers konden het geluid van Squla niet horen: voorgelezen vragen zonder tekst staan onder NIET GEZIEN; de les volgt wat er in beeld te zien was.
- Getallenlijn 10986 (1 level, vragen uit een pool): 1 les.
- Meer, minder, evenveel: filmpje 8046 wordt geen les (zie filmpjes). 7 lessen (3+2+2 levels).
- Minsommen bussommen: bij Squla klopt het plaatje vaak niet met het verhaal (iedereen nog in de bus én uitstappers ernaast). Bij ons klopt het beeld altijd met het verhaal (beter voor het kind).
- Spelletjes met tijdsdruk of levens (bubbels, disco): alleen de rekenvraag nagebouwd, zonder tijdsdruk of levens.
- Plussommen: Squla zei bij typen soms "goed gedaan" bij een fout antwoord; dat nemen we niet over (Bliepo geeft altijd de vaste hulp).
- Dansende sommen: verschil tussen level 1/4 en 2/3 alleen hoorbaar (niet gezien); geen verzonnen verschil.

## STAND bij onderbreking (30 okt, ±18:45) — tegoed op
- Alle helpers zijn stilgezet: halverwege. Hun bestanden staan er wel: squla-tijd/-getallenlijn/-tellen/-meer-minder/-minsommen/-plussommen.tsx (deels getest; Tellen staat al in index.ts/catalogus.ts, anderen misschien ook — eerst nakijken met npx tsc en npm run opgaven).
- (bijgewerkt) Geld is daarna helemaal gespeeld (3 oefeningen, 2 levels elk); Klokkijken en Meten en maten halverwege. Nog niet gespeeld: Rekenen met getallen, Vormen en figuren, Rekenmix, Splitsen, filmpje 8130.
- Back-upcommit tegengehouden door de overlapcontrole: op tablet/telefoon vallen Pauze, geluidjes en "Praten met Bliepo staat uit" buiten beeld bij oude lessen (o.a. verhaal-eindtoets). Ook los getest (dus niet alleen drukte). OPGELOST: de controle mat het lesvlak terwijl het nog onzichtbaar (opacity 0) en ongeschaald was (drukke laptop, trage dev-server). scripts/overlapcontrole.mjs slaat nu knoppen in een onzichtbaar scherm over; onder belasting 37 opnieuw getest: niets overlapt.

## STAND 1 NOVEMBER (ochtend) — IN ÉÉN OOGOPSLAG

Alles staat vast: back-up op GitHub (branch backup-squla), niets online. Typecontrole schoon, alle 137 lessen laden. Overzicht met schermfoto's: http://localhost:3000/admin/overzicht-squla (alleen laptop; nu 13 van 138 schermfoto's, de rest maakt `node scripts/squla-overzicht.mjs` bij de volgende start). PROEF GLANS: public/proef-plaatjes/proef-glans.png (voor/na), oude code in plaatjes-backup/proef-glans/ en in git (commit 731f75d). Alle shells en headless Chromes gestopt; alleen de dev-server draait. Plaatjes: 172 uit Magnific, 1 tijdelijk (spies-leeg), credits Magnific ±30.650 over.

| Onderwerp | Lessen | Af? | Getest | Gekeurd | Wijkt af van regels |
|---|---|---|---|---|---|
| Meten en maten | 7 | af | 4/7 tot het eind (rest te traag door drukte); hulp nog niet | controleur halverwege gestopt (limiet) | vloeiend nog niet gehaald |
| Minsommen | 16 | af | 2/16 tot het eind ná omzetting (drukte) | nee | kleuren bij sommen ontbreken (getal en voorwerpen niet in dezelfde kleur) |
| Plussommen | 16 | af | 16/16 tot het eind (alles goed); hulp deels | nee | kleuren bij sommen ontbreken; kaal-2 vloeiend niet gehaald |
| Geld | 6 | af | 1/6 tot het eind in nieuwe stijl (drukte) | nee | overlap/vloeiend niet gedraaid |
| Vormen en figuren | 7 | af | 7/7 ✓ (goed en soms fout) | nee | vloeiend wisselend; PROEF GLANS in kleuren-2 |
| Klokkijken | 18 | af | 18/18 ✓ | nee | GEBRUIKT DIGITALE KLOK (digitaal-1/2 en elders) en een eigen klok i.p.v. de Synthesis-klok → aanpassen |
| Splitsen | 5 | half af (bouwer gestopt bij overlapcontrole) | onbekend | nee | nog niet nagekeken |
| Piratenschat | 3 | half af (zelfde bouwer) | onbekend | nee | nog niet nagekeken |
| Rekenmix | 16 | half af (bouwer gestopt tijdens testen 3-1 en 4-3) | deels | nee | nog niet nagekeken |
| Tellen | 15 (+3 proef) | omgezet naar voorwerpen, laatste tsc/lint klaar | opnieuw testen | nee | nog niet nagekeken |
| Getallenlijn | 9 | omgezet | opnieuw testen | nee | idem |
| Tijd | 7 | omgezet | opnieuw testen | nee | idem |
| Meer, minder, evenveel | 7 | omgezet | opnieuw testen | nee | idem |

Nog voor ALLE onderwerpen: beginscherm "Kun je dit al?" moet een voorbeeld van de echte opdracht tonen met een zin waar de les over gaat (Sara stuurt nog een verbetering); glow/hologram per les afwisselen en nooit doorzichtig; vloeiend opnieuw meten op een rustige laptop; zinnen in STEMZINNEN.md (stem later, met akkoord).

Plaatjes per onderwerp: allemaal gemaakt in Magnific behalve spies-leeg (Meten). Voetbal is gelukt. Ingesloten wit per plaatje doorzichtig gemaakt. Stijlverschillen in sets: boterhammen, dozen, boeken.

### 1 NOV, NA DE PROEF
- Glans GOEDGEKEURD ("perfect"), variant B gekozen (dunne rand + zachte vaste gloed). Toegepast: centraal op ALLE Magnific-plaatjes (src/components/les/voorwerpen.ts, glansBeeld; plaatjes zelf niet veranderd) en op alle platte vormen in Vormen (VORMSTIJL standaard aan). Vergelijking: public/proef-plaatjes/proef-glans-2.png.
- Nieuwe regel 4.3 (eigen beginzin per les, browserstem, ook in STEMZINNEN.md) in BOUWREGELS.md.
- Helpers (max 3): bouwhelper 1 (Sonnet): beginzinnen in alle onderwerpen behalve Klok/Splitsen/Piraat + kleuren koppelen in Plus-/Minsommen. Bouwhelper 2 (Sonnet): Klokkijken naar de Synthesis-wijzerklok (geen digitale klok) + Splitsen en Piratenschat afmaken. Controleur (Opus) start per onderwerp zodra een bouwhelper het af meldt.

### 1 NOV: GESTOPT OP VERZOEK VAN SARA ("stop")
- Beide bouwhelpers gestopt halverwege. Niet gecommit, half af: squla-klok.tsx + klok-vlakken (omzetten naar Synthesis-wijzerklok), squla-minsommen/-plussommen + vlakken + nieuw squla-getalring.ts (kleuren koppelen). Beginzinnen: nog niet begonnen of net begonnen.
- Plaatjesklus (witte randjes, niet-passende en lelijke plaatjes, keurpagina /admin/plaatjes-keuren): alleen het script scripts/inbox/randen.mjs gemaakt en op 4 plaatjes in de kladmap getest; NOG NIETS aan de echte plaatjes veranderd.

### 1 NOV, PLAATJES VERBETERD (Sara: geen keurpagina, controleur keurt)
- Alle 172 plaatjes: witte randjes weg en rand 1-2 px ingekort (scripts/inbox/randen.mjs; ook in de vaste verwerkstap). Backups: plaatjes-backup/<naam>-202611010807.png.
- 16 lelijke/onduidelijke opnieuw in Magnific (1.200 credits): bezorgbus, bus, picknickkleed, rode-rots, doek, hoepel, stoelenkring, pennenbeker, kaars, taart-kaarsje, wandplank, bloembak, schoolbord, tekendoos, pizzadoos, oude-raket. Binnenwit van hoepel en stoeltjes doorzichtig gemaakt. Nieuwe laadruimte bezorgbus doorgegeven aan bouwhelper 1.
- Plantje in de klokkijklessen: bouwhelper 2 vervangt het door iets wat bij tijd past.
- Regels 1.18-1.20 in BOUWREGELS.md. Controleur (Opus) keurt nu alle plaatjes via schermfoto's (CONTROLE-SQULA.md, "Plaatjes (ronde 1)"); afgekeurd = opnieuw verbeteren tot goedgekeurd. Keurpagina NIET gemaakt (Sara wil niets zelf keuren).

### 1 NOV, BEGINSCHERM (Sara)
- Ontwerper (Opus) ontwerpt het beginscherm "Kun je dit al?" één keer (vast: voorbeeld van de echte opdracht, Bliepo, Ja/Nee; zin per les eigen, mag langer) + 3 voorbeeldlessen (klok, splitsen, som). Daarna past een Sonnet-helper het toe op alle lessen. Bouwhelper 1 gestopt met beginzinnen; doet alleen kleuren + afkeuringen. Hologram: Sara's opmerking ingetrokken, regel 7.1 ongewijzigd.

### 1 NOV: KLOK, SPLITSEN, PIRAAT AF (bouwhelper 2)
- Klokkijken (18): alle klokken = Synthesis-klok (Klokje, klok-wijzerklok.tsx), geen digitale klok; digitaal-1/2 heten nu "De klok en de tijd"; hoelaat-1/2/3 = dagverhaal bezorgbus (i.p.v. plantje, doel behouden); eigen beginzinnen. Ongebruikte digitale tekencode staat nog in squla-klok-tekenen/-vlak (weghalen = vragen aan Sara, regel 3). In klokkijken3-4 nog "plantjes krijgen water" (vorige bouwer, laten staan).
- Splitsen (5) + Piratenschat (3): af, alles speelt tot het eind; gekoppelde kleuren paars/oranje.
- Nu: ontwerper maakt voorbeeld-beginschermen in klok + splitsen; controleur keurt Vormen; bouwhelper 1 kleuren + afkeuringen.

### 1 NOV: BOUWHELPER 1 KLAAR
- Kleuren gekoppeld in Plus-/Minsommen (squla-getalring.ts: dunne rand + gloed in getalkleur, voorwerp vol). Pakjes passen in nieuwe bus. Alle afkeuringen Meten/Geld/Plus/Min opgelost. Alle lessen spelen tot het eind (GOED=1).
- GEVONDEN: Tijd heeft nog mensen (Noa, Sam, bakker Tim) → bouwhelper 1 haalt ze eruit. Telrij-lessen gaan tot ± 80: nagekeken, Squla's telrij 10977 doet dat ook in groep 3 → klopt (regel 11.5; uitzondering bij 11.4 bijgeschreven).

### 1 NOV: DEKKING SQULA GROEP 3 NAGEKEKEN
- Elk level van elke oefening uit de inventaris (00-INVENTARIS.md, 14 onderwerpen, ±50 oefeningen) heeft een les: 132 nieuwe lessen + 3 voorbeeldlessen. Filmpjes (en Rommelmonster L1, Klokkijken 14274 L2) bewust geen les. Tabel "Per oefening" bijgewerkt.
- NIET gelukt: op Squla zelf kijken of er sinds 30 okt nieuwe oefeningen zijn. Squla toont bij profiel "Sara" een introscherm ("Ik ben de ouder / Dat ben ik!"); doorklikken verandert iets in Sara's account, dus niet gedaan. VRAAG SARA: intro zelf doorlopen, dan vergelijken we de lijst.

### KEURSTAND (1 nov, avond)
- GOEDGEKEURD: Meten (7), Geld (6), Klokkijken (18), Splitsen 4/5, Tellen 6/15, Getallenlijn 5/9, Meer-minder 3/7, alle plaatjes.
- In verbetering (bouwhelper 1): Vormen, rest Tellen/Getallenlijn/Meer-minder, splits-delen-1, Piratenschat (3).
- Nu gekeurd: Minsommen + Plussommen ronde 2 (controleur 2), Rekenmix + Tijd ronde 1 (controleur 3).
- Beginscherm (eigen zin + voorbeeld) in ALLE Squla-lessen. Getalkleuren in de zin zichtbaar (besluit Sara). Kaarten zonder rand (besluit Sara).

### 1 NOV: REGEL 14.23 "KIJK ALS EEN KIND" (Sara, na de potloden)
- Toegevoegd aan BOUWREGELS, controle- en bouwopdrachten en geheugen. TE DOEN vóór de eindcontrole: één visuele ronde over ALLE 132 lessen op schermfoto's (ook al goedgekeurde Meten, Geld, Klok), alleen op 14.23.

### KEURSTAND (1 nov, laat)
- HELEMAAL GOEDGEKEURD: Meten (7), Geld (6), Klokkijken (18), Getallenlijn (9), Meer-minder (7), Tellen (15), Vormen (7), Splitsen (5), Piratenschat (3) = 77 lessen, plus alle plaatjes.
- In verbetering (bouwhelper 2): Rekenmix (11/16 goed), Tijd (6/7), Plussommen + Minsommen (bakkerij, dansen, machine-4, bus, getallen boven 10).
- Nog te doen: visuele 14.23-ronde over de lessen die vóór 14.23 zijn goedgekeurd; vloeiend; eindcontrole.

### NA DE PLANNING (Sara, 1 nov): doorwerken tot heel groep 3 af is
- Volgens deze tabel zijn alle Squla-onderwerpen gespeeld. Wat nog openstaat: Splitsen + Piratenschat en Rekenmix afbouwen; nakijken of ELK level van elke oefening uit de analyses een les heeft; op Squla zelf nakijken of er groep 3-oefeningen zijn die nog niet in de tabel staan (dan spelen, alle levels, ook fout en filmpjes); de tabel bovenaan bijwerken (kolom Gebouwd loopt achter).
- Elk nieuw onderwerp: bouwen → plaatjes (één keer, hergebruiken) → beginscherm (ontwerp Opus) → keuren door de controleur → verbeteren tot goedgekeurd. Lessen uit fouten: BOUWREGELS.md hoofdstuk 14.

### AFSPRAKEN SARA (1 november)
- Maximaal 3 helpers: 2 bouwhelpers op Sonnet, 1 controleur op Opus die alleen keurt als een onderwerp af is. Bij elke helper melden welk model hij gebruikt.
- De controleur keurt per les: rekenvraag en antwoord; plaatje past logisch; tekst en gesproken zin correct Nederlands; logisch na het weghalen van mensen; beginscherm "Kun je dit al?" met voorbeeld van de echte opdracht en een duidelijke zin waar de les over gaat; Ja en Nee kloppen daarna. Hij bekijkt de plaatjes zelf op schermfoto's: goedgekeurde glansstijl, geen gezicht (simpele oogjes bij dieren), geen mensen, passend, niet doorzichtig/onduidelijk door glow. Hij keurt op ALLE regels uit BOUWREGELS.md. Verslag in CONTROLE-SQULA.md.
- Zelfstandig doorwerken, alleen vragen bij echte twijfel. Overzicht bijhouden op /admin/overzicht-squla (node scripts/squla-overzicht.mjs).
- Volgorde keuren: eerst Meten, Minsommen, Geld, Plussommen, Vormen, Klokkijken; dan Splitsen + Piratenschat, Rekenmix, de omgezette onderwerpen.
- Glansstijl: eerst proef in squla-vormen-kleuren-2 (gebouwd 1 nov, wacht op oordeel Sara). Goedgekeurd → vaste regel in BOUWREGELS.md en zelf toepassen op alle te vlakke plaatjes (simpel: in code; ingewikkeld: opnieuw in Magnific, Nano Banana 2, 1K, zelfde glansstijl). TOT HET OORDEEL GEEN ANDERE LESSEN AANPASSEN.
- Glow in the dark en hologram alleen waar het past, per les afwisselen; voorwerpen nooit doorzichtig of onduidelijk.
- Oplichten (Synthesis) in alle lessen: woorden lichten op tijdens voorlezen en bij tikken; getallen pas omcirkelen na tikken.
- Klokkijken: alleen wijzerklok, de klok uit de bestaande Synthesis-kloklessen hergebruiken.
- Geen mensen in plaatjes, dieren beperken; regel 8 en 9; geen ElevenLabs.
- BOUWREGELS.md = alle verbeteringen van Sara; elke helper leest het eerst; nieuwe verbetering direct erbij.

## NIET GEZIEN IN SQULA (niet gebouwd)
- 1 nov nacht: WEEKLIMIET Claude bereikt (reset 07:00). Gestopt halverwege: controleur (aafc17cbc1e977cef; Meten bijna klaar, daarna wachtrij Minsommen, Geld, Plussommen, Vormen, Klokkijken), plaatjeshelper (a3be55aa5e4a8d38c; ronde nieuwe voorwerpen + voetbal/spies-leeg), omzetter Tellen/Getallenlijn/Tijd/Meer-minder (abd4ec35c18985d27; bij laatste tsc/lint), bouwer Splitsen+Piraat (a547f464bb447ff0e; bij overlapcontrole), bouwer Rekenmix (a53ec6b029a39a9a8). Klaar: Meten, Minsommen, Geld, Plussommen, Vormen, Klokkijken. Hervatten met SendMessage na 07:00.
- 31 okt: KLOKKIJKEN GEBOUWD (18 lessen squla-klok-*). Alle 18 ✓ tot het eind (eigen kopie speelcontrole met 45 s startwacht, door drukte). Egelopvang → plantje in de kas; bakker Bo → bakkerij; kinderen → dingen met een klok; duim → vinkje/kruisje. Kwart over/voor zat alleen in het filmpje → niet gebouwd. Vloeiend deels niet gehaald (drukte). Controleur keurt na Vormen.
- AANDACHTSPUNT (techniek): bezorgbus (pakjes in laadruimte) en telefoon/laptop/oven (klokje op schermpje) tekenen IN een plaatje op gemeten plekken. Wordt zo'n plaatje vervangen, dan moet de plek opnieuw nagekeken worden (staat bij Claude op de lijst voor 'verwerk de inbox').
- 31 okt: VORMEN GEBOUWD (7 lessen: patronen-1/2, opruimen-1, orienteren-1, kleuren-1/2/3). Alle 7 ✓ (goed en soms fout). Dierenpatroon → bal/blok/potlood/boek; smileys → zon/maan/ster/planeet; foto's met kinderen → hinkelbaan/boom zonder mens. Vloeiend niet overal gehaald (drukte) → opnieuw meten. Controleur keurt na Plussommen. Plaatjeshelper maakt nieuwe voorwerpen (ballonkleuren enz.). LEGAL REVIEW: roosters Patronen L2, zinnen Opruimen.
- 31 okt: PLAATJES 163 gemaakt via Magnific en in de lessen gezet (22 rondes). Credits 43.700 → 30.650 (13.050 = 174 × 75). Open: voetbal (werd Amerikaanse football) en spies-leeg (geblokkeerd); omschrijving aangepast, volgende ronde opnieuw. Ingesloten wit (hengsels, gaten, donutgat …) per plaatje doorzichtig gemaakt. Schermfoto-controle per plaatje nog niet gedaan (te druk) → later `node scripts/inbox/schermfotos.mjs na <namen>`. Let op: boterhammen/dozen/boeken in een set verschillen wat in stijl.
- 31 okt nacht: PLUSSOMMEN GEBOUWD (16 lessen: bakkerij-1/2/3, dansen-1..4, bus1-1/2/3, bus2-1/2/3, kaal-1/2/3). Alle 16 ✓ tot het eind (alles goed); hulp deels getest. Kinderen in bus → pakjes in bezorgbus. Vloeiend: kaal-2 nog niet gehaald (hapering 106 ms, drukte; aangepast). LET OP: pakjes worden in de laadruimte van het busplaatje getekend; plus- en minsommen gebruiken andere maten → controleur kijkt. Zinnen nog niet in STEMZINNEN.md (doet hoofdagent aan het eind). LEGAL REVIEW: bakkerij-thema, disco-idee.
- 31 okt nacht: GELD GEBOUWD (6 lessen: geldmachine-1/2, zakgeld-1/2, geld-1/2). Sam/Noor → "jij" (twee klusjes; spaarpot + portemonnee); hond uitlaten → stoep vegen; teddybeer → speelgoedraket. Na omzetting maar 2 echt tot het eind (drukte); overlap en vloeiend nog niet gedraaid. Controleur keurt na Minsommen.
- VRAAG VOOR SARA: src/components/les/vlakken/squla-geld-tekeningen.ts (de oude zelfgetekende geldplaatjes van vannacht) wordt nergens meer gebruikt. Mag het weg? Aan de site verandert dan niets. Het blijft staan tot je ja zegt (regel 3).
- 31 okt nacht: MINSOMMEN GEBOUWD (16 lessen; ids squla-min-ruimte-*, -bus1-*, -bus2-*, -machine-1..4, -kaal-*). Kinderen in bus → pakjes in bezorgbus; zeedieren → ruimtedingen die wegvliegen/knappen/vallen; walvis → ufo die meeneemt. Voor omzetting: alle 16 ✓; na omzetting maar 2 ✓, rest vastgelopen door drukke laptop (load 30-56) → opnieuw spelen als het rustig is. Vloeiend/overlap na omzetting nog niet gedraaid. Controleur keurt na Meten. LEGAL REVIEW: vorm van de min-machine.
- 31 okt nacht: METEN GEBOUWD (7 lessen: pizza-1/2/3, hoeveelheden-1/2, oppervlakte-1/2), mensen vervangen (wip: bal + speelblok; mama/Jip/mier: knikker/appel/boeken; enz.). Speelcontrole GOED=1: 4 van 7 ✓, 3 te traag door drukke laptop. Vloeiend NOG NIET GEHAALD (pizza-3 telefoon hapering 73 ms; opnieuw meten als het rustig is). Controleur keurt Meten nu. LEGAL REVIEW: vraagsoorten dicht bij Squla (vol-voller-volst, halve liter), getallen 24/12, 18/9, 16/8.
- 31 okt nacht: Rekenmix UITGESPEELD (4 oefeningen × 4 levels; rekenmix-*-volledig.md); bouwer Rekenmix gestart (16 lessen). Krokodil (kinderboek) en kikker (strip) NIET gebruiken. NIET GEZIEN: gesproken uitlegzinnen bij oefening 2-4, bonusspelletjes.
- 31 okt nacht: Vormen en figuren UITGESPEELD (5 analysebestanden vormen-*-volledig.md); bouwer Vormen gestart. Rommelmonster L1 en filmpje 7974 = alleen filmpje, geen les.
- 31 okt nacht, NIEUWE WERKWIJZE (Sara): een onafhankelijke controleur (bouwt niet mee) controleert elke klare les: rekenvraag, antwoord, plaatje logisch, Nederlands en logica na het weghalen van mensen. Het verslag staat in CONTROLE-SQULA.md. Afgekeurd: de hoofdagent past de les aan, de controleur controleert opnieuw, en pas daarna volgt de volgende les. De opdracht staat in scratchpad/controleprompt.md.
- 31 okt nacht, stijlzin definitief (Sara): "...no face, no eyes, no text. Single object centered on a plain pure white background."; bij dieren simpele ogen (STIJL_DIER in scripts/voorwerpen/stijl.mjs). Sara slaapt; doorwerken zonder vragen.
- 31 okt nacht: plaatjeshelper gestart. Die maakt elk voorwerp dat een les gebruikt ÉÉN keer via de Magnific-koppeling (Nano Banana 2, 1K, 16:9, Sara's stijlzin) en zet het direct in de les via scripts/inbox/verwerk.mjs. Bouwers zetten een voorwerp in de lijst zodra ze het gebruiken, zodat bouwen en plaatjes tegelijk lopen. Ook een omzet-helper voor Tellen/Getallenlijn/Tijd/Meer-minder. Eerste 4 Magnific-plaatjes (appel, banaan, peer, pruim) staan erin.
- 31 okt NACHT (Sara slaapt): toestemming Magnific-plaatjes maken zonder akkoord af te wachten. Instellingen Sara (exact): Nano Banana 2, 1K, 16:9, stijlzin "simple flat illustration for a children's math app: solid flat colors, one soft highlight, thin dark outline, minimal details, no gradients, no shadow, no face, no eyes, no text. Single object centered on a plain background." Via koppeling kost 1K OOK 75 credits (Unlimited werkt alleen op de website zelf; website automatiseren mag niet volgens Magnific). Sara daarna: "genereer gewoon je mag alle credits gebruiken" (uitdrukkelijke toestemming regel 9). Alle benodigde plaatjes worden gemaakt, niet meer dan nodig (±75 per plaatje). Saldo bij start 43.700.
- 31 okt ~07:45 WISSELSYSTEEM KLAAR + HERVAT. Plaatjes: src/lib/voorwerpen (lijst per onderwerp), public/voorwerpen/<naam>.png (placeholder), `npm run voorwerpen` (controle + placeholders + MAGNIFIC-PROMPTS.md + PLAATJES-STAND.md), scripts/inbox/* ("verwerk de inbox"), WISSELEN.md. Lesscherm laadt `voorwerpen` van het draaiboek vooraf. Keuzes Sara: alleen echte dingen als plaatje; effen witte achtergrond (eigen uitknipper, geen rembg); stem later met akkoord; gloed-op-moment blijft. Hervat met plaatjesregels.md: bouwers Minsommen, Plussommen, Geld, Meten, Klokkijken, Splitsen+Piraat; spelers Vormen, Rekenmix. DAARNA: Tellen, Getallenlijn, Tijd, Meer-minder omzetten naar voorwerpen (proef-fruit-lessen mogen weg ná vraag aan Sara), bouwers Vormen/Rekenmix, eindcontrole.
- 31 okt GEPAUZEERD (Sara: "stop even"). Gestopt: bouwers Minsommen (aec354205e40d6f0b), Plussommen (ad9838f370e6fdde9), Geld (aa94dbf08bfa58664), Meten (a6d3b3869069dd603), Klokkijken (abc9e88e620263c12, net begonnen), Splitsen+Piraat (a547f464bb447ff0e, net begonnen); spelers Vormen (a01c4c8d825171ca8), Rekenmix (ad58008abd22b192a). Splitsen+Piraat-analyse is af. Hervatten met SendMessage.
- 31 okt HERVAT met nieuwe regels (bouwprompt.md aangevuld): bouwers Minsommen, Plussommen, Geld, Meten hervat + nieuwe bouwer Klokkijken; spelers Splitsen+Piraat, Vormen, Rekenmix hervat. Vervangingen voor mensen/dieren moeten logisch zijn. Elke bouwer levert een lijst PLAATJESSLEUTELS. DAARNA: (1) Tellen, Getallenlijn, Tijd, Meer-minder omzetten naar de nieuwe stijl (nacht, gloed-op-moment, geen mensen/dieren/kaders, sleutels); (2) één complete zinnenlijst van ALLE plaatjes (zinnen.html bijwerken) zodat Sara alles zelf gratis maakt; (3) plaatjes ophalen via MCP (creations met hartje), uitknippen, in de lessen zetten.
- 31 okt BESLUIT SARA (absoluut): GEEN mensen, nergens. Uit de gebouwde lessen moeten alle mensen weg (Meten: Sem/Mila/Joep/Rosa/Jip/oma/mama/Kim/Daan/Noor en de wip; Geld: Sam en Noor; Plus-/Minsommen: kinderen in/bij de bus), vervangen door dingen. GEEN kaders (ook al heeft Squla die). Liever geen dieren (alleen als het moet, stipjes als ogen); ruimtethema of Bliepo zelf mag. Zinnenlijst: public/proef-plaatjes/zinnen.html (123 plaatjes, Sara maakt ze zelf gratis).
- 31 okt: Sara kiest proef-fruit-moment (donkere achtergrond, gloed alleen bij meetellen/goed). Geen dieren (vervangen door dingen), geen poppetjes. Munten zonder wit vierkant in public/geld/los; specimen op briefjes blijft (ECB). Credits: 43.850 over; niets meer genereren zonder goedgekeurd bedrag.
- 31 okt (na herstart): Magnific gekoppeld. Sara: AI-plaatjes mogen, maar niet AI-achtig; beeldstijl "gewoon net als Synthesis". Proeflessen proef-fruit-glow (nacht + gloed) en proef-fruit-plat (blauwe ruimte, geen gloed) met appel/peer/pruim uit Magnific (Nano Banana 2, 225 credits) in public/proef-plaatjes. Code: FOTO in squla-tellen-tekenen.ts, foto-optie in telles(). Wachten op Sara's keuze.
- 31 okt ~04:30 PLAATJES (Sara): ontevreden over alle zelfgetekende SVG-plaatjes (kaders, ronde vakken, "AI-achtig", olifant lijkt niet). Geen poppetjes, geen dingen met ogen. Sara nam Magnific Premium+ (ex-Freepik). Proef: public/proef-plaatjes/index.html (olifant+banaan in 4 stijlen; tijdelijk, niet committen). Magnific-MCP toegevoegd (claude mcp add, local); Sara moet nog inloggen via /mcp na herstart. Via MCP kost alles credits (~75/plaatje); >5000 eerst vragen. Onbeperkt NIET via automatisering gebruiken (regels Magnific).
- Plan na herstart: (1) koppeling testen, (2) stijl kiezen met Sara, (3) lijst van alle benodigde plaatjes maken, (4) spelers Squla hervatten (Splitsen, Vormen, Rekenmix) en gebouwde lessen testen op vragen/hulp/Nederlands; bouwers pas verder als de stijl gekozen is. Builders gestopt: zie GEPAUZEERD-regel.
- GEPAUZEERD 31 okt 02:05 op verzoek van Sara ("even stoppen en laten zien"). Klokkijken uitgespeeld (7 analysebestanden). Gestopt halverwege: bouwers Minsommen (aec354205e40d6f0b), Plussommen (ad9838f370e6fdde9), Geld (aa94dbf08bfa58664), Meten (a6d3b3869069dd603); spelers Splitsen+Piraat (a2ee35c4899d830e8, piraat L3 af, filmpje nog), Vormen (a01c4c8d825171ca8, puzzels), Rekenmix (ad58008abd22b192a). Hervatten met SendMessage. Daarna bouwer Klokkijken starten.
- Meer-minder GEBOUWD (31 okt): 7 lessen, hologramstijl. Vloeiend: 3-2 groen, rest onbetrouwbaar door drukke laptop -> opnieuw meten (ALLEEN=squla-meer-minder).
- NIET GEZIEN Meer-minder: disco-intermezzo en schatkist (aankleding Squla-mascotte); keuzetegels als spaarvarken/sappakje (bij ons gewone getallen); gesproken vraag 10971 L1 (zelf: "Tel de ... Welk getal is evenveel?"); Squla zet na fout zakken zelf goed (Bliepo laat staven zien, kind probeert opnieuw).
- LEGAL REVIEW REQUIRED (Meer-minder): eieren in doosjes van 6 (10973 L2, andere aantallen); bonte kralen lijken op Squla's knikkers.
- Alle onderwerpen: het geluid (voorgelezen vragen, luidsprekertjes); bonusspelletjes; Squla zet een foute vraag aan het eind opnieuw neer (bij ons de vaste hulp van Bliepo).
- Getallenlijn: gesproken verhaal/vragen; disco-spel 16600 level 2 (alleen de vraag "dichtst bij" gebouwd); 15757 "welk getal staat ervoor" niet gezien; filmpjes 7872 en 8177 geen les.
- Meer-minder: vraagtekst level 1 van 10971; gesproken filmpje 8046; eindkaart level 2 van 10971.
- Minsommen: luistervragen 16055 level 2 (gegokt), vraag bij bubbelspel, 2 gesproken disco-sommen 6919 level 4, vraag 1 van 16055 level 1.
- Plussommen: verschil tussen level 1/4 en 2/3 van Dansende sommen (alleen hoorbaar).
- LEGAL REVIEW REQUIRED (Getallenlijn): soorten vragen volgen Squla precies; olifant op twee plekken als idee overgenomen; Kit de kat vervangen door Floep de kikker.
- Back-up-branch is nu `backup-squla` (Sara: controle mag daar worden overgeslagen; voor main en online blijft hij verplicht).
- Geld: munten en briefjes ALTIJD de officiële plaatjes uit public/geld (niet de oude-stijl plaatjes van Squla). Bubbelspel met levens: alleen de vraag, zonder levens. Squla zegt bij een fout soms "goed zo": niet overgenomen.
- NIET GEZIEN Geld: 3 uitlegzinnen (geldmachine L1 V6, zakgeld L2 V6, schatkist); disco in zakgeld fout geven (bleef hangen).
- Meten en maten: Squla's taalfout ("Welke pizza is het groter?") niet overgenomen. Pizza-uitleg was alleen hoorbaar: Bliepo's uitleg bij pizza volgt de vaste hulp (samen vergelijken in beeld).
- NIET GEZIEN Meten: geluid/uitleg bij pizza; eindscherm Oppervlakte L1.
- Wachtrij bouwers (zodra er een bouwer klaar is): Geld, Meten en maten, daarna Klokkijken, Splitsen, Piratenschat, Vormen, Rekenmix.
- Tijd: elke les 12 eigen vragen + 3 die aan het eind terugkomen (zoals Squla foute vragen terugzet; minder dan 3 fout = vaste aanvulvragen). Koffie/limonade vervangen door deur op slot vs. hele winkel vegen.
- LEGAL REVIEW REQUIRED (Tijd): kalender-2 vraag 2 (patroon 9 jaar / 9 uur / 9 juni); tijden-1 avondoptreden met beurten; dagen-1 eerste/laatste dag en hoeveel dagen (vrijwel dezelfde vraag, kan niet anders).
- NIET GEZIEN Tijd: foute keuzes van luistervraag "wat betekent 1 vakje?" (zelf gekozen: 1 uur / 1 week).
- TE DOEN eindcontrole: alle vloeiend-metingen opnieuw als de laptop rustig is (onder belasting 20-50 vielen ook oude lessen af).
- NIET GEZIEN Tellen: gesproken vraagzinnen; gekleurde cijfers op keuzeknoppen (bij ons wit, vaste ontwerpregel); memorypaar naar beneden (bij ons blijft het liggen).
- LEGAL REVIEW REQUIRED (Tellen): telrij-2 "ervoor" 10-17 lijkt op Squla-rijen; memory als tussendoortje volgt Squla.

### Stand 1 nov (later)
- Tijd: alle 7 goedgekeurd. Rekenmix 14/16 (mix4-3/4-4 verbeterd, wacht op keuring).
- Plus/Min ronde 4 afkeuringen opgelost door bouwhelper 2: centrale `somKleuren` (twee getallen altijd duidelijk andere kleur), pakjes gaan echt de bus in, bekers op een plank.
- Staand scherm (tablet/telefoon), alleen Squla-lessen: speelvlak in het midden tussen bovenkant en Bliepo, pauzebalk vast bovenaan (Lesscherm.tsx, `squlaMidden`). Andere lessen ongewijzigd.
- Nu bezig: controleur (Opus) keurt Plus/Min ronde 5, Rekenmix mix4-3/4-4, nakeuring van de visuele ronde (pizza-1, hoeveelheden-1, geldmachine-1, splitsen1-1/1-2, piraat-1/2), Klokkijken 14.23, kalender-1, en staand scherm.

### Pauze 2 nov (Sara: "stop voor nu even met alles")
- Alle helpers gestopt. Code compileert (tsc schoon); tussenstand gecommit op backup-squla.
- Half af: Piraat 1-3 (neutrale doorzichtige vakjes, kale sommen wit: BOUWREGELS 14.27) en Splitsen 1-2 (splitsmachine boven het huisje).
- Wacht op Sara: akkoord indeling Munten en briefjes (geldmachine-1) vóór uitrol; potloden bij Verdelen (ster of potloden slepen); tikken bij Splitsen 1-2; raadsels Piraat.
- Controleur ronde 8 (Sonnet) was bezig, niets opgeschreven in CONTROLE-SQULA.md.
- Nog te doen: keuring, vloeiend meten, stemzinnen, eindtest, LEGAL REVIEW lijst.

### 3 nov
- Lettertype: Figtree goedgekeurd door Sara en aan voor alle nieuwe lessen (page.tsx `proef = true`; letterproef.css). Concept-/oude lessen niet aangeraakt. De stijlkiezer-lettertype geldt in deze lessen niet meer.
- Beginzinnen: 30 paren gekeurd en verbeterd (BEGINZINNEN.md, /admin/beginzinnen). Een andere assistent werkt nu aan de zinnen: niet aanraken.
- Sara doet een menselijke controleronde op afbeeldingen/design: haar opmerkingen worden per les opgepakt (eerst beginscherm, dan hele les).

---

## PLAN: logica-controle van alle lessen (8 november 2026, nog NIET bouwen)

Komt na het afspelen van Synthesis en het lesrecept (LESRECEPT.md). Basis: FOUTEN-VOORBEELDEN.md (F1 t/m F6), WOORDEN-GROEP3.md, BOUWREGELS 14.30–14.35. (Bijgewerkt 8 nov, derde ronde.)
1. **Script** dat bij elke vraag checkt: (a) kwaliteitsregel 9: één juist antwoord, óf alle juiste antwoorden worden goed gerekend (BOUWREGELS 14.30). Het script rekent zelf alle juiste antwoorden uit. Is dat er 1, dan moet de les precies die ene goed rekenen. Zijn het er meer (splitsen en andere open opdrachten), dan moet de les elk ervan goed rekenen; mist er één, dan is de vraag fout. (b) de hint past op precies één keuze (14.31), (c) bij een keuzevraag zegt de hint waar het over gaat (de vraag mag tijdens de hint weg); bij een opdracht blijft de opdrachtregel staan (14.32), (d) geen woorden die volgens WOORDEN-GROEP3.md niet mogen.
2. **Kind-test:** een aparte helper speelt elke vraag alsof hij een kind van 6 is. Hij ziet alleen het scherm en hoort alleen wat Bliepo zegt. Hij keurt af als hij twijfelt of twee goede antwoorden vindt.

---

## SYNTHESIS AFSPELEN — voortgang

Opdracht: 8 november 2026 (gouden lessen, BOUWREGELS hoofdstuk 15).
- Koppeling: `SYNTHESIS-ANALYSE/KOPPELING.md`
- Draaiboeken: `SYNTHESIS-ANALYSE/DRAAIBOEKEN.md`
- Verschillen met de 35 besluiten: `SYNTHESIS-VERSCHILLEN.md`

| Onderwerp | Gekoppeld | Gespeeld | Draaiboek klaar | Open punten |
|---|---|---|---|---|
| Klokkijken | ja (Hour Hand Hunt; + Set the Hour, Halfway Around, Five Minutes Later/Back in Time) | ja: 28 okt + 8 nov (wachten, snel, 3e fout) | ja, met open punten (randgevallen) | DRAAIBOEKEN §1.11 |
| Tellen | ja (Color Count) | ja, 8 nov volledig (alle situaties, pijl en vinkje gemeten) | ja (tot 10) | handje; grote groepen (The Next 10) |
| Huisnummers | ja (Counting On) | ja, 8 nov 2× (fouten + alles goed tot einde) | ja (zoeken, verder tellen) | ervoor/ertussen/terugtellen; vinkje tijdens praten |
| Getallenlijn | ja (Count the Jumps) | ja, 8 nov volledig (alle vraagsoorten, 1e-3e fout, wachten, snel) | ja (tikken, springen) | rangschikken, terugtellen, opfrisser-route |
| Meer en minder | ja (More or Less) | R2/R3 + 8 nov (wachten 14,7 s hint, 2e en 3e fout) | grotendeels | snel; stoppen na 3e fout uitzoeken |
| Plussommen | ja (Adding below 10) | ja, 8 nov volledig | ja (tot 10) | antwoord < 1 s; plus boven 10 |
| Minsommen | ja (Dot Destruction) | ja, 8 nov volledig | ja (tot 10) | goed na fout bij oefensom; krabbelcirkel |
| Splitsen | ja (Part Part Whole) | ja, 8 nov volledig (route Ja + hele les) | ja (tot 10) | route Nee alleen R2; snel; tot 20; verdelen |
| Geld | VERVANGEND (Add Three Numbers) | R2 | deels | alles over geld; besluit Sara |
| Tijd en Dagen | VERVANGEND (Twice a Day) | R2 | deels | dagen, kalender; besluit Sara |
| Meten en Rekentaal | VERVANGEND (Arcade Less or More, spel) | 8 nov (fout, 3 fouten, wachten) | nee | geen tutorles; besluit Sara |
| Vormen | geen les gevonden | — | nee | besluit Sara |
| Rekenmix | geen les (alleen toetsen mengen) | — | nee | besluit Sara |
| Schattenjacht (piraat) | ja (Small Problems) | 28 okt gemeten | bijna | wachten, snel, 3e fout |

**Stand 8 nov (einde sessie):**
- KOPPELING.md, DRAAIBOEKEN.md (14 onderwerpen) en SYNTHESIS-VERSCHILLEN.md zijn geschreven.
- **Volgende sessie:**
  1. Per onderwerp met "alleen R2/R3" de les opnieuw spelen met het meetscript, voor 2e/3e fout, wachten (30+ s) en snel (0,3 s). Het meetscript staat in localStorage `__mijnlog` op tutor.synthesis.com.
  2. De vragen in SYNTHESIS-VERSCHILLEN.md aan Sara voorleggen.

**Tips voor het meetscript:**
- Tikken op de klok gaat met nagebootste pointer-events op `circle.cursor-pointer`.
- Keuzes klikken via de knoptekst.
- Een JS-aanroep mag niet langer dan 45 s duren.

**Verder-knop en vinkje (8 nov, Color Count):**
- De pijl staat er vanaf het begin van de zin en is meteen tikbaar.
- Tikken tijdens de zin breekt de zin af (W).
- Niet tikken: de les wacht. Bij 23–32 s wachten kwam geen herinnering (HB).
- Het vinkje verdwijnt niet vanzelf (tot 48 s gewacht).
- Lof, nieuwe uitleg en "ik help je" wachten op de pijl. De hint na de 1e fout en het einde van "samen maken" gaan vanzelf door.
- Counting On (8 nov): bijna alle zinnen gaan vanzelf door (0,5–0,8 s), ook met de pijl in beeld. Na veel fouten pauze en terug naar het menu (W).
- Count the Jumps (8 nov): zinnen gaan vanzelf door; springen fout = onbeperkt dezelfde zin; invullen 3 pogingen (kans, hulpvraag, antwoord).
- Adding below 10 (8 nov): aanwijzing bij niets doen na 5-9 s (opdrachten); fout getypt getal = geen reactie; na 2e fout bij aanvullen een makkelijker tussenstuk.
- Dot Destruction (8 nov): bijna alle zinnen wachten op de pijl (anders dan Counting On/Count the Jumps); 1e fout = samen doen in de machine, 2e fout = antwoord en door.
- Part Part Whole (8 nov): 2 fouten in de korte proef = hele les vanaf begin; splitsen fout = onbeperkt dezelfde voorrekenzin.
- **Algemeen (8 nov, 6 lessen):**
  - De pijl staat er altijd vanaf het begin van de zin. Tikken tijdens de zin breekt de zin af (W, HB).
  - Niet tikken: geen herinnering (tot 37 s getest).
  - Of zinnen vanzelf doorgaan verschilt per les: Counting On, Count the Jumps en Adding below 10 meestal vanzelf; Color Count, Dot Destruction en Part Part Whole vaak op de pijl.
  - Het vinkje verdwijnt nooit vanzelf.
  - Het pauzemenu verscheen soms vanzelf (oorzaak onbekend).

### Synthesis-koppeling deel 3 (9 nov) — grondig zoeken, alle onderwerpen behalve Klok
Alles staat in `SYNTHESIS-ANALYSE/KOPPELING.md` (oude versie: `KOPPELING-voor-9-nov.md`). Per onderwerp klaar:
- [x] Tellen: Color Count (echt); The Next 10 voor tot 20.
- [x] Huisnummers: Counting On (deels); nieuw gevonden Counting On Again = zelfde soort; ervoor/ertussen nergens gezien.
- [x] Getallenlijn: Count the Jumps (deels); Number Lines is 100+.
- [x] Meer en minder: More or Less (echt).
- [x] Plussommen: Adding below 10 (echt).
- [x] Minsommen: Dot Destruction (echt); nieuw Fill the Difference past niet (aanvullen, groep 4).
- [x] Splitsen: Part Part Whole (echt); verdelen alleen vervangend (groep 4).
- [x] Meten: "Hoe groot is het?" → nieuw Area · Cover It Up (echt, groep 5, alleen begin gezien); pizza's en vol/leeg/zwaar/licht: GEEN passende les.
- [x] Rekentaal: GEEN passende les (alleen Arcade-spel Less or More).
- [x] Geld: GEEN passende les (doel op "Coming soon").
- [x] Dagen: GEEN passende les.
- [x] Tijd: GEEN passende les.
- [x] Vormen: GEEN passende les (alle vormdoelen groep 3 op "Coming soon").
- [x] Rekenmix: geen mixles bij Synthesis; alleen toetsen per unit, Flashcards-race en Mixed Problems (niet afgespeeld).
Volgende stap (deel 4): draaiboeken; nog niet gezien staat onderaan KOPPELING.md.

### Tellen draaiboek nieuw (9 nov)
- Backup draaiboeken: `SYNTHESIS-ANALYSE/backup-draaiboeken-20261109/DRAAIBOEKEN-voor-opnieuw.md` (klaar).
- Tellen draaiboek nieuw: KLAAR voor tellen tot 10, GEDEELTELIJK voor 11-20. Bestand: `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tellen.md`. Gespeeld: Color Count 3x (met fouten / alles goed / 3 fouten bij lijstje) + The Next 10 tot "wat komt na 12". Open: zie §11 in dat bestand (o.a. The Next 10 verder, lijstje lang wachten/snel, 3e fout bij maken, eerste keer-route).

### Splitsen draaiboek nieuw (9 nov)
- Splitsen draaiboek nieuw: KLAAR voor splitsen tot 10, GEDEELTELIJK voor tot 20 (alleen 12 via "groter getal"), NIET voor eerlijk verdelen (geen passende les). Bestand: `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/splitsen.md`. Gespeeld: Part Part Whole 3x (route Nee met veel fouten / route Ja proef goed / route Ja 2 fouten en daarna alles goed en snel). Open: zie §11 in dat bestand (o.a. 0 als deel wisselend, Missing Numbers niet bekeken, eerste keer-route, 2 gesproken zinnen niet opgevangen).

### Plussommen draaiboek nieuw (9 nov)
- Plussommen draaiboek nieuw: KLAAR voor plussommen tot 10 en samen 10, NIET voor sommen boven 10 / over het tiental en het busverhaal (geen passende opgaven in deze les). Bestand: `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/plussommen.md`. Gespeeld: Adding below 10 3x (veel fouten / alles goed en heel snel / handje + som in één keer goed). Open: zie §11 in dat bestand (o.a. weet-ik-niet, 2e fout bij "nog een manier om 10" en "maak 7", min als 1e fout bij een totaal, eerste keer-route).

### Minsommen draaiboek nieuw (9 nov)
- Minsommen draaiboek nieuw: KLAAR voor minsommen tot 10, NIET voor boven 10 / over het tiental, het busverhaal en geld (geen passende opgaven in Dot Destruction). Bestand: `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/minsommen.md`. Gespeeld: Dot Destruction 3x (veel fouten / alles goed en heel snel / andere fouten en weet-ik-niet). Open: zie §11 in dat bestand (o.a. 'afronden' kiezen, precieze stopregel oefenreeks, goed antwoord bij 'hoe schrijf je 9 min 3', eerste keer-route).

### Getallenlijn draaiboek nieuw (9 nov)
- Getallenlijn draaiboek nieuw: KLAAR voor verschil/sprongen tellen tot 10 (Synthesis-stijl les), GEDEELTELIJK voor het raketje dat springt, NIET voor rangschikken, dingen op de getallen en terugtellen (zitten niet in Count the Jumps). Bestand: `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/getallenlijn.md`. Gespeeld: Count the Jumps 2x (opfrisser + samen leren met veel fouten, uitleg 4x en spel tot de eindkaart / proef met 2 fouten, uitleg, spel en "pauze"). Open: zie §11 in dat bestand (o.a. proef goed, demo ja, doorspelen bij handje, zin na pauze, wanneer de pauzevraag komt, eerste keer-route).

### Meer-minder draaiboek nieuw (9 nov)
- Meer-minder draaiboek nieuw: KLAAR voor "welke groep is groter / heeft de meeste" en "maak evenveel" tot 10, GEDEELTELIJK voor "hoeveel meer", NIET voor "de minste/minder", evenveel kiezen uit getallen, meer/minder dan een getal, op volgorde en boven 10 (zitten niet in More or Less). Bestand: `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/meer-minder.md`. Gespeeld: More or Less 4x (3 fouten = stoppen / handje + veel fouten tot de eindkaart / 4e fout bij gelijk maken = stoppen / alles goed + weet ik niet). Open: zie §11 in dat bestand (o.a. 4e fout bij kleurvraag, hoeveel meer goed in één keer, heel snel binnen 2 s, eerste keer-route).

### Huisnummers draaiboek nieuw (9 nov)
- Huisnummers draaiboek nieuw: KLAAR voor getal zoeken en benoemen tot 50, verder tellen (ook over het tiental) en "hoeveel nog tot het tiental"; NIET voor ervoor, ertussen, terugtellen en slepen (zitten niet in Counting On). Bestand: `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/huisnummers.md`. Gespeeld: Counting On 3x (veel fouten = pauze-stop / bijna alles goed tot de eindkaart / wachten, Nog niet, tiental-hulp = pauze-stop) + Counting On Again kort (2 opdrachten). Open: zie §11 in dat bestand (o.a. stopregel, grens "dat ging snel", 3e fout bij "tot 50", eerste keer-route).

### Meten draaiboek nieuw (9 nov)
- Meten draaiboek nieuw ("Hoe groot is het?"): GEDEELTELIJK. KLAAR voor "welke is groter? bedek met gelijke tegels en tel" en "hoeveel tegels/hokjes", DEELS voor grote en kleine blaadjes (alleen begin Tile Sizes), NIET voor op volgorde, smal/breed, gedraaid kaartje en "kies er 2" (zitten niet in Cover It Up). Pizza's en vol/leeg/zwaar/licht: geen les. Let op: bij Synthesis is dit groep-5-stof (woorden oppervlakte/vierkante eenheden passen niet bij groep 3; keuze voor Sara). Bestand: `SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/meten.md`. Gespeeld: Cover It Up 3x (veel fouten / snel + wachten + 4 foute tikken bij herstellen / bijna alles goed + weet ik niet) + Tile Sizes kort. Open: zie §11 in dat bestand (o.a. wat samen tellen start, heel snel en wachten bij woordvragen, eerste keer-route).

### Gouden les Splitsen gebouwd (9 nov)
- Les `squla-splits-splitsen1-1-gouden` ("Splitsen tot 10"), nieuwe versie naast squla-splits-splitsen1-1 (oude les niet veranderd). Bestanden: `src/components/les/lessen/squla-splitsen-gouden.tsx`, `squla-splitsen-gouden-zinnen.ts`, `src/components/les/vlakken/squla-splitsen-gouden-vlak.tsx` (+ `.module.css`, alleen het hulphandje), `scripts/fouttabel-splitsen-gouden.ts` (fouttabel + verklapcontrole), `scripts/test-splitsen-gouden.mjs` (situaties als Testkind zonder koekje; stopt als er regels bij een echt kind bijkomen), `FOUTTABEL-squla-splits-splitsen1-1-gouden.md`.
- Inhoud Squla (15 vragen), skelet draaiboek Splitsen (startvraag, proef van 2, uitleg stap 7–10, opdrachten, einde). Keuzes en vragen: KEUZES-VOOR-SARA.md Ronde 21. Eigen invulling: splitsen.md, onderaan.
- Getest: speelcontrole (goed en alles fout), eigen situaties (Nee-route alles goed, Ja-proef met fouten, proef mislukt, lang wachten, heel snel), verklapcontrole, vloeiend (laptop in orde; telefoon wisselend, DESIGN-LATER.md).
- Nog te doen door de coördinator: kind-test en keuring (aparte helpers).
- Herstel na de kind-test (KINDTEST-SPLITSEN-GOUDEN.md): 18 van de 22 punten opgelost of nagekeken; niet aangeraakt: stem (punt 1), testregels bij een echt kind (punt 4), tekening van de zak en de eerste sleep (gedeeld splitsvlak). Zie KEUZES-VOOR-SARA.md Ronde 21b. Algemene lessen in LESRECEPT.md ("Geleerd bij de gouden les Splitsen") en BLIEPO-KARAKTER.md §2.

### Gouden les Minsommen gebouwd (10 nov)
- Les `squla-min-machine-1-gouden` ("Minsommen: hoeveel over?"), nieuwe versie naast squla-min-machine-1 (oude les niet veranderd). Bestanden: `src/components/les/lessen/squla-minsommen-gouden.tsx`, `squla-minsommen-gouden-zinnen.ts`, `src/components/les/vlakken/squla-minsommen-gouden-vlak.tsx` (+ `.module.css`), `scripts/fouttabel-minsommen-gouden.ts`, `scripts/test-minsommen-gouden.mjs`, `FOUTTABEL-squla-min-machine-1-gouden.md`, `scripts/vloeiend-schermen/squla-minsommen-gouden.json`.
- Inhoud Squla (15 vragen), skelet draaiboek Minsommen (Dot Destruction), pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem (nieuwe optie `woordenMeeMetStem`, BOUWREGELS 3.7). Keuzes: KEUZES-VOOR-SARA.md Ronde 24.
- Gedeelde verbetering: BliepoTekst (F7: een 2e zin werd wit en daarna weer gedimd als hij langer dan 2,5 s op zijn beurt wachtte).

### Gouden les Meer-minder gebouwd (10 nov)
- Les `squla-meer-minder-evenveel2-1-gouden` ("De meeste"), nieuwe versie naast squla-meer-minder-evenveel2-1 (oude les niet veranderd). Gekozen uit de 3 levels 1 omdat "waar liggen de meeste?" het draaiboek More or Less volgt (tik op de grootste groep + vinkje). Bestanden: `src/components/les/lessen/squla-meer-minder-gouden.tsx`, `squla-meer-minder-gouden-zinnen.ts`, `src/components/les/vlakken/squla-meer-minder-gouden-vlak.tsx` (+ `.module.css`), `scripts/fouttabel-meer-minder-gouden.ts`, `FOUTTABEL-squla-meer-minder-evenveel2-1-gouden.md`, `scripts/test-meer-minder-gouden.mjs`, `scripts/vloeiend-schermen/squla-meer-minder-gouden.json`.
- Inhoud Squla (15 vragen: 8 kralen tellen, 7 keer 3 kaarten met koekjes), skelet draaiboek Meer-minder, pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem. Keuzes: KEUZES-VOOR-SARA.md Ronde 25.
- Gedeeld lesscherm: eindkaart links van het tekstvak, alleen in lessen met `stemHeelUitpraten` (klok, Minsommen, Meer-minder). Gedeelde verbetering in BliepoTekst: het woord van nu hoort bij 1 uitspraak (geen witte flits van een nieuwe zin, F7).
- Nog te doen door de coördinator: kind-test en onafhankelijke keuring (aparte helpers); vloeiend meten als de computer rustig is.

### Gouden les Huisnummers gebouwd (10 nov)
- Les `squla-huisnummers-gouden` ("Huisnummers: wat komt erna?"), nieuwe versie naast squla-huisnummers (oude les niet veranderd). Er is maar 1 Squla-les Huisnummers (geen levels), dus die is gekozen. Bestanden: `src/components/les/lessen/squla-huisnummers-gouden.tsx`, `squla-huisnummers-gouden-zinnen.ts`, `src/components/les/vlakken/squla-huisnummers-gouden-vlak.tsx` (+ `.module.css`, nu in Phaser), `scripts/fouttabel-huisnummers-gouden.ts`, `FOUTTABEL-squla-huisnummers-gouden.md`, `scripts/test-huisnummers-gouden.mjs`, `scripts/vloeiend-schermen/squla-huisnummers-gouden.json`.
- Inhoud Squla (17 vragen: erna, ervoor, ertussen, slepen, terug; tot 20, tot 31, tot 50), skelet draaiboek Huisnummers (Counting On), pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem. Ervoor, ertussen, slepen en terugtellen: zelfde skelet, hints en fouttabel "eigen invulling, niet van Synthesis" (15.22 punt 5). Keuzes: KEUZES-VOOR-SARA.md Ronde 26.
- Typen: een echt invulvak op het bordje van het huis met het vraagteken (HARDE REGEL 5), zonder "Weet ik niet".
- Nog te doen door de coördinator: kind-test en onafhankelijke keuring (aparte helpers).

### Gouden les Getallenlijn gebouwd (10 nov)
- Les `squla-getallenlijn-kat-1-gouden` ("Het raketje op de getallenlijn"), nieuwe versie naast squla-getallenlijn-kat-1 (oude les niet veranderd). Gekozen uit de 4 Squla-lessen Getallenlijn omdat alleen "het raketje" deels bij het draaiboek past (een figuurtje dat per 1 springt op een lijn); level 1 omdat het met een lijn 0–10 begint, zoals Count the Jumps. Bestanden: `src/components/les/lessen/squla-getallenlijn-gouden.tsx`, `squla-getallenlijn-gouden-zinnen.ts`, `src/components/les/vlakken/squla-getallenlijn-gouden-vlak.tsx` (+ `.module.css`, Phaser), `scripts/fouttabel-getallenlijn-gouden.ts`, `FOUTTABEL-squla-getallenlijn-kat-1-gouden.md`, `scripts/test-getallenlijn-gouden.mjs`, `scripts/vloeiend-schermen/squla-getallenlijn-gouden.json`.
- Inhoud Squla (15 vragen), skelet draaiboek Getallenlijn (startvraag + proef, uitleg met springen en bogen, samen springen na de 2e fout), pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem. Alle 7 soorten vragen zijn eigen invulling (draaiboek §8). Keuzes: KEUZES-VOOR-SARA.md Ronde 27.
- Nog te doen door de coördinator: kind-test en onafhankelijke keuring (aparte helpers).

### Gouden les Meten gebouwd (10 nov)
- Les `squla-meten-oppervlakte-1-gouden` ("Hoe groot is het?"), nieuwe versie naast squla-meten-oppervlakte-1 (oude les niet veranderd). Gekozen uit de 7 Squla-lessen Meten omdat alleen "Hoe groot is het?" bij het draaiboek past (Area: Cover It Up: welke is groter, tel de tegels die het bedekt; pizza's en vol/leeg/zwaar/licht hebben geen Synthesis-les); level 1 omdat het voor groep 3 is (tot 12) en "even groot / groter" en "tel de blaadjes" heeft met gelijke tegels, zoals Cover It Up (level 2 gaat over grote en kleine blaadjes). Bestanden: `src/components/les/lessen/squla-meten-gouden.tsx`, `squla-meten-gouden-zinnen.ts`, `src/components/les/vlakken/squla-meten-gouden-vlak.tsx` (+ `.module.css`; het oude Phaser-vlak met HTML erbovenop), `scripts/fouttabel-meten-gouden.ts`, `FOUTTABEL-squla-meten-oppervlakte-1-gouden.md`, `scripts/test-meten-gouden.mjs`, `scripts/vloeiend-schermen/squla-meten-gouden.json`.
- Inhoud Squla (12 vragen + 3 die terugkomen = 15), skelet draaiboek Meten (geen startvraag, tegels aantikken om te tellen, een eigen zin per fout getal, samen tellen na de 2e fout), pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem. Schilderijen, op volgorde, het gedraaide kaartje, ruitjes en matten: zelfde skelet, hints en fouttabel "eigen invulling, niet van Synthesis" (15.22 punt 5). Keuzes: KEUZES-VOOR-SARA.md Ronde 28.
- Nog te doen door de coördinator: kind-test en onafhankelijke keuring (aparte helpers).

### Tellen en Splitsen omgezet naar de nieuwste gouden stijl (10 nov)
- `squla-tellen-fruit-1-gouden` en `squla-splits-splitsen1-1-gouden` hebben nu dezelfde opbouw als Minsommen t/m Meten: Bliepo praat door (15.27, zegDoor/zegOpdracht in de les zelf), `pijlZoalsSynthesis`, `stemHeelUitpraten`, `woordenMeeMetStem`, groet + begin (Splitsen: + startvraag) in 1 stuk, eindkaart links van het tekstvak, vangnet bij samen tellen / samen voordoen, "dichtbij" in 3 versies, geen opdracht in de zinnen bij de 2e fout. Splitsen: het hele splitsvlak 88 % vanaf links (vaste zone). Inhoud, getallen en keuzes gelijk; oude lessen niet veranderd.
- Tests: `scripts/test-tellen-gouden.mjs` (nieuw, naar test-getallenlijn-gouden.mjs), `scripts/test-splitsen-gouden.mjs` (herschreven; oude situaties zonder tikken op de pijl + routes goed/allefout/vangnet/tik-door/woorden), fouttabel-scripts met waarheidscontrole en "geen opdracht bij de 2e fout". Weg: `gouden-pijl.ts` en `test-tellen-gouden-pijl.mjs` (half af, oude pijlregel; WEGGEHAALD.md).
- Alles in KEUZES-VOOR-SARA.md Ronde 29. Kind-test en keuring nog door een aparte keurder.

### Plussommen en klokles omgezet, Minsommen kleiner, "wit blijft wit" (11 nov)
- `squla-plus-bakkerij-1-gouden`: zelfde opbouw als Tellen/Splitsen (15.27 zegDoor/zegOpdracht in de les, `stemHeelUitpraten`, `woordenMeeMetStem`, groet + begin in 1 stuk, vangnet bij samen tellen, hint mét de keuzes na de 1e fout, geen opdracht bij de 2e fout, 3 versies zonder richting). Vlak 88 % vanaf links. Test `scripts/test-plussommen-gouden.mjs` herschreven (naar test-tellen-gouden.mjs; routes goed/fouten/anderefout/allefout/vangnet/wachten/tik-door/verbindrust/kleur/snel/woorden).
- `squla-klok-hoelaat-1-gouden`: `woordenMeeMetStem`; 2 hints volgens 15.17; uitleg bij de 2e fout zonder opdracht; lange foutreacties en lang samen voordoen in 2 stukken. Test `scripts/test-klok-gouden-pijl.mjs`: eindkaart, woorden, TRAGESERVER, opdracht-controle erbij.
- `squla-min-machine-1-gouden`: alleen het vlak 90 % vanaf links (zone-meting in test-minsommen-gouden.mjs).
- Gedeeld: BliepoTekst + lib/stem.ts `praatHeelUit`: een witte zin blijft wit (alleen met `stemHeelUitpraten`). Test `scripts/test-wit-blijft-wit.mjs`.
- Echte stem (zichtbare Chrome, via /voorbeeld/les, ± 8 min): Plussommen 76 zinnen gestart, 57 helemaal uitgesproken, 19 afgebroken doordat de test al tijdens de vraag tikte; einde zin → volgend stuk 756 ms; eerste woord licht op 50 ms na de start; laatste woord gemiddeld 341 ms naast het geschatte moment (grootste 964 ms). Klok: 127 gestart, 92 helemaal uitgesproken, 35 afgebroken door tikken tijdens vragen; 1087 ms; eerste woord 51 ms, laatste 119 ms (grootste 349 ms). Beide: 0 dubbel, 0 F7, 0 weer gedimd, eindkaart 0 woorden eronder. De Google-stem geeft geen woordmeldingen: ± 150 ms per woord kan ik niet bewijzen.
- Alles in KEUZES-VOOR-SARA.md Ronde 30. Kind-test en keuring nog door een aparte keurder.

### Keuring Tellen en Splitsen na de omzetting (11 nov)
- Onafhankelijke keurder: **Tellen goedgekeurd**, **Splitsen goedgekeurd**, na 6 kleine herstellingen (alleen woorden en kleuren): nooit 2 keer "dichtbij" bij 1 vraag (`zonderDichtbij`, `dichtbijAnders` in beide zinnenbestanden), enkelvoud bij 1 ("Dat is te weinig.", "De rest gaat …", "de laatste bal" bij vraag 7 van Splitsen), en de 1 in de kleur van zijn voorwerp. Inhoud, getallen, keuzes en goede antwoorden gelijk.
- Fouttabel-scripts controleren dit nu zelf (paren foute antwoorden per vraag, "1. Dat zijn er", "de andere ballen" bij 1 over).
- Getest: fouttabel-scripts, `npm run opgaven`, `npm run inhoudsvergelijk` (0 verdwenen; 3 regels in WEGGEHAALD.md), speelcontrole GOED en ALLEFOUT met F7 voor beide (tot het eind, F7 0, F8 0), eigen testscripts (alle routes; overlap en sprongen op 4 schermmaten), `scripts/test-wit-blijft-wit.mjs`. Vloeiend niet gemeten: computer niet rustig (test van een andere sessie, energiebesparing aan).
- Verslag: KEURING-TELLEN-SPLITSEN-GOUDEN.md, KINDTEST-TELLEN-SPLITSEN-GOUDEN.md; vraag aan Sara in KEUZES-VOOR-SARA.md Ronde 32; LESRECEPT.md "Geleerd bij de keuring Tellen en Splitsen".

### Gouden les Geld gebouwd (11 nov)
- Les `squla-geld-geldmachine-1-gouden` ("Munten en briefjes"), nieuwe versie naast squla-geld-geldmachine-1 (oude les niet veranderd). Gekozen uit de 6 Squla-lessen Geld omdat het de eerste is (munten en briefjes herkennen, het getal op het geld lezen); de andere lessen bouwen daarop voort. Er is geen Synthesis-les over geld: exact het skelet van de andere gouden lessen (15.25); denkfouten, hints, uitleg en samen voordoen zijn eigen invulling (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/geld.md, alleen op de laptop). Bestanden: `src/components/les/lessen/squla-geld-gouden.tsx`, `squla-geld-gouden-zinnen.ts`, `src/components/les/vlakken/squla-geld-gouden-vlak.tsx` (+ `.module.css`; het oude Phaser-geldvlak met HTML erbovenop, 84 % vanaf links), `scripts/fouttabel-geld-gouden.ts`, `FOUTTABEL-squla-geld-geldmachine-1-gouden.md`, `scripts/test-geld-gouden.mjs`, `scripts/vloeiend-schermen/squla-geld-gouden.json`, `KINDTEST-GELD-GOUDEN.md`.
- Inhoud Squla (12 vragen + 3 die terugkomen = 15), geen startvraag, pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem. Keuzes: KEUZES-VOOR-SARA.md Ronde 34 (o.a. de getekende briefjes zonder "SPECIMEN").
- Nog te doen door de coördinator: kind-test en onafhankelijke keuring (aparte helpers).

### Keuring Geld (11 nov)
- Onafhankelijke keurder: **Geld goedgekeurd** na 1 kleine herstelling (de 3 in "Er zweven 3 munten" nu geel, `bellenIntro`). Inhoud gelijk aan de oude les (12 + 3), oude les niet veranderd.
- Getest: fouttabel-script (25 foute antwoorden, 53 paren zelf gelezen), `npm run opgaven`, `npm run inhoudsvergelijk` (0 verdwenen), speelcontrole GOED (59 stappen) en ALLEFOUT (175 stappen) met F7 (F7 0, F8 0), `scripts/test-geld-gouden.mjs` (alle routes; overlap en sprongen op 4 schermmaten: 0), wit blijft wit (0 terug naar grijs), woord voor woord (19/19, 14/14), vloeiend 58–60 beelden/s.
- **Niet online** vóór Sara's besluit over de briefjes: bijna echte plaatjes zonder "SPECIMEN" (KEUZES Ronde 35 punt 1). Verslag: KEURING-GELD-GOUDEN.md.

### Gouden les Vormen gebouwd (11 nov)
- Les `squla-vormen-patronen-1-gouden` ("Patronen"), nieuwe versie naast squla-vormen-patronen-1 (oude les niet veranderd). Gekozen omdat het de eerste Squla-oefening van "Vormen en figuren" is; de vormenpuzzels (kleuren-1/2/3) niet aangeraakt. Geen Synthesis-les: exact het skelet van de andere gouden lessen (15.25); denkfouten, hints, uitleg en samen voordoen zijn eigen invulling (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/vormen.md, alleen op de laptop). Bestanden: `src/components/les/lessen/squla-vormen-gouden.tsx`, `squla-vormen-gouden-zinnen.ts`, `src/components/les/vlakken/squla-vormen-gouden-vlak.tsx` (+ `.module.css`; het oude Phaser-vormenvlak met HTML erbovenop, 84 % vanaf links), `scripts/fouttabel-vormen-gouden.ts`, `FOUTTABEL-squla-vormen-patronen-1-gouden.md`, `scripts/test-vormen-gouden.mjs`, `scripts/vloeiend-schermen/squla-vormen-gouden.json`, `KINDTEST-VORMEN-GOUDEN.md`.
- Het oude vormenvlak kreeg 2 opties die alleen de gouden les gebruikt (`gouden`, `bliepoLegt`); zonder die opties ongewijzigd (oude patronen-1 en kleuren-1 opnieuw gespeeld: in orde).
- Inhoud Squla (15 vragen), geen startvraag, pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem. Keuzes: KEUZES-VOOR-SARA.md Ronde 36.
- Getest: fouttabel-script (37 foute antwoorden), opgaven, inhoudsvergelijk (0 verdwenen), speelcontrole GOED (82) en ALLEFOUT (560) met F7 0 / F8 0, eigen testscript alle routes, overlap en sprongen 0 op 4 maten, wit blijft wit, woord voor woord, vloeiend 60 beelden/s.
- Nog te doen door de coördinator: onafhankelijke kind-test en keuring. *(Keuring gedaan, zie hieronder.)*

### Keuring Vormen (11 nov)
- Onafhankelijke keurder: **Vormen goedgekeurd** na 1 kleine herstelling (na het vangnet van de puzzel bleef de pijl
  staan; nu komt "Maak de puzzel." terug als opdracht zonder pijl). Inhoud gelijk aan de oude les (15 vragen), oude les
  niet veranderd. Oude vormenvlak: alle 7 oude lessen GOED tot het eind.
- Getest: fouttabel-script (37 foute antwoorden), `npm run opgaven`, `npm run inhoudsvergelijk` (0 verdwenen),
  speelcontrole GOED (92) en ALLEFOUT (584) met F7 0 / F8 0, `scripts/test-vormen-gouden.mjs` alle routes, overlap en
  sprongen 0 op 4 maten, wit blijft wit (0 terug naar grijs), woord voor woord (12/12, 13/13).
- Vloeiend niet eerlijk te meten (energiebesparende stand, drukke Mac: alles 30 beelden/s); opnieuw meten vóór online.
  Open punten: KEUZES Ronde 37. Verslag: KEURING-VORMEN-GOUDEN.md.

### Gouden les Dagen gebouwd (11 nov)
- Les `squla-dagen-van-de-week-gouden` ("Dagen van de week"), nieuwe versie naast squla-dagen-van-de-week (oude les en oude weektrein niet veranderd). Gekozen omdat het onderwerp Dagen precies 1 les heeft (KOPPELING §9); squla-tijd-dagen-1/2/3 (onderwerp Tijd) niet aangeraakt. Geen Synthesis-les: exact het skelet van de andere gouden lessen (15.25); denkfouten, hints, uitleg en samen voordoen zijn eigen invulling (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/dagen.md). Bestanden: `src/components/les/lessen/squla-dagen-gouden.tsx`, `squla-dagen-gouden-zinnen.ts`, `src/components/les/vlakken/squla-dagen-gouden-vlak.tsx` (+ `.module.css`; een nieuw Phaser-vlak met dezelfde treinplaatjes, links van het tekstvak), `scripts/fouttabel-dagen-gouden.ts`, `FOUTTABEL-squla-dagen-van-de-week-gouden.md`, `scripts/test-dagen-gouden.mjs`, `scripts/vloeiend-schermen/squla-dagen-gouden.json`, `KINDTEST-DAGEN-GOUDEN.md`.
- Inhoud Squla (17 vragen), geen startvraag, pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem. Keuzes: KEUZES-VOOR-SARA.md Ronde 38.
- Getest: fouttabel-script (65 foute antwoorden), opgaven, inhoudsvergelijk (0 verdwenen), speelcontrole GOED (57) en ALLEFOUT (219) met F7 0 / F8 0, eigen testscript alle routes, overlap en sprongen 0 op 4 maten, wit blijft wit, woord voor woord (16/16, 6/6), vloeiend 60 beelden/s.
- Nog te doen door de coördinator: onafhankelijke kind-test en keuring.

### Gouden les Dagen gekeurd (11 nov, onafhankelijke keurder)
- **GOEDGEKEURD** na 3 kleine herstellingen in de zinnen (2 keer de dagnaam achter elkaar in 18 zinnen → "Die dag …";
  "Die dag ligt verder van vandaag af." 2 keer bij 1 vraag → "weer"-zin; "Kom, … Kom, …" na het vangnet → "Ik help je
  met deze."). Inhoud (17 vragen, dagen, kaarten, antwoorden) niet veranderd; oude les, oude trein en
  squla-tijd-dagen-1/2/3 niet aangeraakt. Fouttabel-script kreeg 2 controles erbij (alle paren foute antwoorden per
  vraag; geen dagnaam 2 keer achter elkaar). Testscript kreeg de route `mistvangnet` (45 s niets bij slepen).
- Getest na herstel: fouttabel (65 rijen, 425 beweringen), opgaven, inhoudsvergelijk 0 verdwenen, speelcontrole GOED 75
  / ALLEFOUT 207 (F7 0, F8 0), alle routes, overlap en sprongen 0 op 4 maten, wit blijft wit, woord voor woord (16/16,
  6/6), vloeiend 60/59 (energiebesparing aan, Mac druk). `les_uitkomsten` 147 → 147.
  Open punten: KEUZES Ronde 39. Verslag: KEURING-DAGEN-GOUDEN.md.

### Gouden les Tijd gebouwd (11 nov)
- Les `squla-tijd-dagen-1-gouden` ("Dagen van de week", level 1), nieuwe versie naast squla-tijd-dagen-1 (oude les en oude weektrein niet veranderd). Gekozen omdat het de eerste Tijd-les is zonder gouden les (klokkijken heeft al squla-klok-hoelaat-1-gouden; kalender-1/2, tijden-1/2 en dagen-2/3 niet aangeraakt). Geen Synthesis-les: exact het skelet van de andere gouden lessen (15.25); denkfouten, hints, uitleg en samen voordoen zijn eigen invulling (SYNTHESIS-ANALYSE/DRAAIBOEKEN-NIEUW/tijd.md). Bestanden: `src/components/les/lessen/squla-tijd-gouden.tsx`, `squla-tijd-gouden-zinnen.ts`, `src/components/les/vlakken/squla-tijd-gouden-vlak.tsx` (+ `squla-tijd-gouden.module.css`; een nieuw Phaser-vlak naar dat van Dagen, met kaarten van 1 of 2 dagen, links van het tekstvak), `scripts/fouttabel-tijd-gouden.ts`, `FOUTTABEL-squla-tijd-dagen-1-gouden.md`, `scripts/test-tijd-gouden.mjs`, `scripts/vloeiend-schermen/squla-tijd-gouden.json`, `KINDTEST-TIJD-GOUDEN.md`.
- Inhoud Squla (12 vragen + 3 die terugkomen = 15), geen startvraag, pijlregel 15.27, stem heel uitpraten, woorden lichten op met de stem. Keuzes en testcijfers: KEUZES-VOOR-SARA.md Ronde 40.
- Nog te doen door de coördinator: onafhankelijke kind-test en keuring.
