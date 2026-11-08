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

Komt na het afspelen van Synthesis en het lesrecept. Basis: FOUTEN-VOORBEELDEN.md, WOORDEN-GROEP3.md, BOUWREGELS 14.30–14.34.
1. **Script** dat bij elke vraag checkt: (a) precies één goed antwoord, (b) de hint past op precies één keuze, (c) geen woorden die volgens WOORDEN-GROEP3.md niet mogen.
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
