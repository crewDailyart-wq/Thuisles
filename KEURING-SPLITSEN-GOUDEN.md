# KEURING gouden les Splitsen — squla-splits-splitsen1-1-gouden ("Splitsen tot 10")

Onafhankelijke controleur, 9 november 2026, branch backup-squla, basis commit 7bffc2a. Ik heb de les NIET veranderd.
Geen betaald tegoed, niets online, oude lessen (regel 8) en stem.ts / Lesscherm.tsx niet aangeraakt.

## UITSLAG: AFGEKEURD

In 1 zin: de les zit goed in elkaar, de inhoud is precies die van Squla en bijna alle punten van de kind-test zijn echt
opgelost, maar in de proef (na "Ja") wijst het hulphandje na een fout naar een lege plek met een zin die niet klopt,
en bij de doos legt Bliepo het vinkje 2 keer uit.

Telling: 1 ernstig, 1 middel, 11 klein, plus 4 open punten bij Sara die niet in deze les zitten.

## Hoe ik gekeurd heb

- Code gelezen: `squla-splitsen-gouden.tsx`, `squla-splitsen-gouden-zinnen.ts`, `squla-splitsen-gouden-vlak.tsx`, de oude les
  (`squla-splitsen.tsx`, alleen gelezen), het draaiboek, FOUTTABEL, KEUZES Ronde 21/21b, KINDTEST, LESRECEPT, BLIEPO-KARAKTER.
- `npx tsx scripts/fouttabel-splitsen-gouden.ts`: 121 foute antwoorden, geen verklapper; FOUTTABEL bleef gelijk (geen verschil).
- `npm run opgaven`: groen. `npm run inhoudsvergelijk` (ook tegen 3b58b87 en 7716d22): 0 verdwenen.
  `git diff 3b58b87~1 HEAD`: oude les, splitsvlak, Lesscherm en stem.ts niet veranderd.
- Speelcontrole voor deze les: alles goed en ALLEFOUT, allebei tot het eind, 0 fouten.
- `scripts/test-splitsen-gouden.mjs` (alle 6 situaties): groen, met schermfoto's.
- Eigen script (kopie in een tijdelijke map, Chrome zonder venster, lege profielmap, geen koekje, `?naam=Testkind`):
  proef met fout en 9 s stil; de doos (bal erin, terugtikken, vinkje); Nee-route met een **langzame kinder-sleep**
  (± 1 s slepen, 1 s stil) en een **nagebootste echte stem** (0,075 s per letter) tot de kaart; Ja-route met mislukte
  proef, uitleg met fouten en vangnet, "hoeveel samen?" 2 keer fout, "anders splitsen" met hulp, 2 keer dezelfde fout bij
  vraag 1, 10 en 11, tot de kaart.
- Database alleen gelezen: `les_uitkomsten` hoogste id vóór en na alle runs **107** (30 regels). Er is niets bijgekomen.
- Vloeiend: niet betrouwbaar te meten, zie punt 13.

## Per punt van de opdracht

| Wat | Oordeel | Bewijs |
|---|---|---|
| Inhoud gelijk aan Squla (15.22) | GOED | 15 vragen, zelfde volgorde, getallen en voorwerpen als `squla-splits-splitsen1-1` (5-2, 9-6, 7-3, 6-4, 10-8, zak 7-4, 6-5, 9-6, 8-3, huisjes 5/1 6/4 8/5, doos 7, 9, 4, 5, 3). |
| Oude les ongewijzigd | GOED | geen verschil in `squla-splitsen.tsx` en het splitsvlak sinds vóór de bouw. |
| Skelet volgt draaiboek | GOED, 1 klein punt | startvraag, proef van 2 (2 fouten, ook verspreid = uitleg), Nee = uitleg, totaalvraag, "totaal staat boven", anders splitsen, na goed vanzelf door, na fout de pijl, niets bij heel snel. Afwijking zonder vermelding: punt 3. |
| Hints verklappen niets (15.17) | GOED, 1 open punt | script en zelf nagelopen. Open bij Sara: voorrekenen bij de 3 huisjes (KEUZES Ronde 21 vraag 6). |
| Les stopt nooit, nooit menu (15.18) | GOED | alle routes tot de kaart; "anders splitsen" stopt na hulp (Bliepo maakt het af); vangnet in de uitleg werkt (3 keer verkeerd, en 20 s stil). |
| Hulphandje (15.19) | FOUT in de proef | punt 1. Elders goed: na ± 6 s, met 1 zin, geen knop, niet bij de keuzevraag (8 s gewacht: niets). |
| 2 pogingen en voortgang (15.11) | GOED | 1e fout hint + pijl, 2e fout uitleg + samen voordoen; uitkomsten goed / na fout / samen met denkfouten kloppen. |
| Dezelfde denkfout 2 keer | GOED | "Weer te veel in het paarse vak.", "Weer de hele doos.", "Bij het huisje met 5 klopt het weer niet.", "Weer 1 van de delen."; ander antwoord andere denkfout: geen "weer". |
| Heel snel (6.10c) | GOED | niets over snel. |
| Rood/groen scherm, geen rood op keuze, geen fout-geluidje | GOED | foto's en code. |
| Getalkleur (2.1, 2.2, 14.27) | GOED | gemeten: paars 201,162,255; oranje 255,173,92; totaal wit. Getallen onder de vakken paars/oranje. |
| Naam hooguit 2 keer | GOED | groet + 1 lof. |
| Cijfers (3.20) | 1 klein punt | punt 6. |
| Kijken als een kind (14.23) | GOED | pionnen en ballen groot en telbaar, geen gezichtjes, geen kaders; doek gaat helemaal weg (foto); eindkaart netjes. |

## Kind-test: echt opgelost?

| Kind-test punt | Nu |
|---|---|
| 1 stem breekt af | **Niet opgelost** (stem.ts, gedeeld; Sara beslist). Met de nagebootste stem werd opnieuw elke zin na ± 0,03 s afgebroken (47 van 47 en 83 van 83). |
| 2 vastlopen in de uitleg | Opgelost: passende zin, handje naar de verkeerde plek, vangnet na 3 keer of 20 s. Wel punt 5. |
| 3 proef: elke schuif nagekeken | Opgelost: langzaam 2 pionnen geschoven, pas daarna nagekeken (goed na een fout). Wel punt 1. |
| 4 regels bij Fenna | Open bij Sara (id 93–107 staan er nog). |
| 5 eindeloze hulp | Opgelost (na hulp maakt Bliepo het af). |
| 6 uitlegvoorbeeld = vraag 1 | Opgelost (uitleg 1 en 4). Klein restje: punt 11. |
| 7 getal over een pion | Opgelost (totaal pas als het hoopje leeg is). |
| 8 vinkje | Deels: niet meer vanzelf oplichten (goed), maar nu 2 keer uitgelegd (punt 2). |
| 9, 10, 11, 12, 13, 14, 17, 18, 19, 20 | Opgelost (gespeeld of in de code nagelopen). |
| 15 zak slecht te zien | Deels (zin aangepast; tekening is gedeeld). |
| 16 doek | In orde (foto: doek helemaal weg). |
| 21 eerste sleep hapert | Niet opgelost (gedeeld splitsvlak). |
| 22 voorrekenen bij de huisjes | Open bij Sara. |

## Gevonden punten

### Ernstig

1. **Proef na Ja: na een fout wijst het handje naar een lege plek, met een zin die niet klopt** (BLIEPO-KARAKTER §2
   "zegt Bliepo iets over een plek, dan klopt het met het beeld"; LESRECEPT "Geleerd bij Splitsen" punt 1; 15.19).
   - Wat: in de proef blijven de pionnen na de 1e fout in de vakken liggen. Wacht het kind dan 6 s, dan zegt Bliepo
     "Je bent goed bezig. Pak een pion en sleep hem naar een vak." en schuift het handje van het **lege** dak naar het
     paarse vak, waar er al te veel liggen (schermfoto: 4 in paars, 1 in oranje, handje op het lege dak). Het kind kan
     daardoor denken dat er nog meer in het paarse vak moet.
   - Waarom: `wachtSleep` begint met `laatste = null`; `handNaarLeeg(spec, null)` denkt dan dat alles nog in het hoopje ligt.
   - Voorstel: in de proef na een fout het handje vanuit het vak met te veel naar het andere vak laten wijzen, met een
     passende zin ("Schuif een pion naar het oranje vak."), of de stand van het vlak meegeven. Test: proef, 1e fout,
     9 s stil.

### Middel

2. **Bij de doos wordt het vinkje 2 keer uitgelegd** (3.15, 3.23).
   - Wat: bij vraag 11 zegt Bliepo "Ben je klaar met slepen? Tik dan op deze knop. Dan kijk ik het na." (de les) én
     daarna "Klaar? Tik dan op het vinkje." (het lesscherm zelf, `BENOEM.controleer` via `l.knoppen`). Die laatste staat
     op het scherm (schermfoto bij 1 bal in het vak).
   - Let op: KEUZES Ronde 21b punt 8 zegt dat Bliepo het woord "vinkje" niet kan zeggen. Dat klopt maar half: het lesscherm
     zegt de zin met "vinkje" zelf. De vraag aan Sara gaat dus uit van iets wat niet klopt.
   - Voorstel: 1 van de 2 weg (de eigen zin weglaten, of de uitleg van het lesscherm voor deze les uitzetten) en de vraag
     in KEUZES aanpassen.

### Klein

3. **"Hoeveel pionnen zijn er samen?": na de 1e fout geen pijl en dezelfde volgorde van de knoppen.** Het draaiboek
   (§3 B.2) wacht na een fout op de pijl en zet de knoppen in een andere volgorde. Niet als afwijking in KEUZES. Voorstel:
   pijl erbij en opnieuw schudden, of de afwijking met reden in KEUZES zetten.
4. **"Goed gekozen!" als lof bij slepen** (14.35; vraag 13 in een run). Voorstel: die lofzin in deze les overslaan.
5. **Uitleg, verkeerde stand: dezelfde zin 2 keer, met "Je bent goed bezig." ervoor** (BLIEPO-KARAKTER §2). Bliepo zegt
   "Er ligt al een pion in het oranje vak. Tik erop …" en 6 s later met het handje precies dezelfde zin, nu met
   "Je bent goed bezig." of "Jij kunt dit." ervoor, terwijl het nog verkeerd ligt. Voorstel: bij het handje een kortere
   andere zin ("Tik op de pion in het oranje vak.") en geen aanmoediging als er iets verkeerd ligt.
6. **3.20: "Nog 1 keer." en "Kom, nog een keer." door elkaar** (`opnieuw()`). Voorstel: overal "1 keer".
7. **Tempo: Bliepo reageert ± 0,8 s na de laatste sleep** (gemeten 763–801 ms); BOUWREGELS 6.10a zegt 0,2–0,4 s. De
   reden staat in KEUZES 21b en LESRECEPT, maar BOUWREGELS is niet aangepast. Voorstel: Sara laten bevestigen.
8. **Stroeve zinnen:** "Maar 1 en 4 is maar 1 manier." (2 keer "maar"), "Onder zijn 2 vakken." Voorstel: "1 en 4 is
   1 manier." / "Onderin zijn 2 vakken."
9. **Het handje begint op een vaste plek in het hoopje** (`hoopPlek(spec, 0)` of `hoopPlek(spec, n − 1)`). Pakt een kind
   eerst juist die pion, dan begint het handje op een lege plek (uit de code; in de runs niet gezien omdat het script altijd
   de eerste pion pakt). Voorstel: beginnen bij een pion die nog in het hoopje ligt.
10. **Oude tekst in KEUZES en draaiboek klopt niet meer.** KEUZES Ronde 21 noemt nog de uitleg "5 = 2 en 3", de keuzes
    2 / 3 / 5, "legt 1 pion in het paarse vak", "na 0,2 s rust", "het vinkje licht na 6 s op"; het draaiboek (eigen
    invulling) noemt nog "Er horen er 2 in het paarse vak" en "licht na 6 s alleen het vinkje op". Voorstel: bijwerken
    naar wat de les nu doet (1 en 4; 1 / 4 / 5; 3 pionnen; 0,7 s; niet oplichten).
11. **Na "splits 5 op een andere manier" kan vraag 1 meteen hetzelfde zijn** (3.23): kiest het kind 2 en 3, of maakt
    Bliepo 3 en 2 af, dan is vraag 1 direct weer 5 = 2 en 3. Licht; alleen melden.
12. **Eindkaart:** de 7 raakt de punt van het dak bijna. Voorstel: 7 iets lager.
13. **Vloeiend niet zelf bevestigd.** Tijdens mijn meting was de computer erg druk (belasting 8 tot 80, andere programma's
    liepen): laptop 45–54 beelden/s, trage telefoon 47–48 beelden/s, haperingen 41–158 ms. Dat zegt niets over de les.
    De bouwer mat eerder 58–60 beelden/s (laptop). Voorstel: opnieuw meten als de computer rustig is
    (`ALLEEN=squla-splits-splitsen1-1-gouden npm run vloeiend`); de telefoon-hapering (56–59 ms) staat al in DESIGN-LATER.md.

### Open bij Sara (niet in deze les)

- **Stem breekt elke zin af** (`src/lib/stem.ts`, `meld(true)` → `speechSynthesis.cancel()`): opnieuw gezien, geldt voor
  alle gouden lessen.
- **Voorbeeldpagina bewaart bij het kind van het koekje** (`src/app/lesuitkomstacties.ts`) en de 15 testregels bij
  Fenna (id 93–107).
- **KEUZES Ronde 21 vraag 1 t/m 9** (vinkje bij de doos, omgedraaid, 0 als deel, voorrekenen bij de huisjes, enz.)
  zijn nog niet beantwoord.
- **Eerste sleep hapert** (gedeeld splitsvlak).

## Wat goed is

Inhoud precies Squla; oude les onaangeroerd; skelet volgt het draaiboek; elke fout heeft een eerste zin die past bij
wat het kind deed; geen hint noemt het antwoord; "weer" alleen bij dezelfde denkfout; uitleg na Nee kan niet meer
vastlopen; de proef kijkt pas na rust; geen eindeloze lus; samen voordoen werkt bij huisje, huisjes en doos; doek gaat
helemaal weg; getallen in de goede kleur; naam 2 keer; nooit menu, nooit stop; niets in de voortgang van een echt kind.

## Wat nodig is voor een nieuwe keuring

Punt 1 en 2 herstellen (en punt 3 t/m 10 waar mogelijk). Daarna opnieuw keuren, met: proef, 1e fout, 9 s stil; de doos
met 1 bal; en een vloeiend-meting als de computer rustig is.

---

# TWEEDE KEURING (9 november 2026, na commit a3b35ef)

Opnieuw gekeurd, alleen als Testkind, met scripts in Chrome zonder venster, een lege profielmap en zonder koekje.
Ik heb een langzame kinder-sleep gebruikt (± 1 s slepen, 1 s stil) en een nagebootste stem (0,075 s per letter).
`les_uitkomsten`: hoogste id vóór en na alle runs **107**. Er is niets bijgekomen. Ik heb niets aan de les of de database
veranderd.

## UITSLAG: GOEDGEKEURD

De les zelf is in orde. Alle 13 punten van de eerste keuring zijn opgelost, of met reden voorgelegd aan Sara. Door het
herstel zijn er geen nieuwe fouten bijgekomen. De open punten bij Sara zitten in gedeelde code of in de database, niet in
deze les.

## Per punt van de eerste keuring

1. **Handje in de proef (was ernstig): opgelost.** Proef, 4 en 1, 9 s stil: het handje schuift nu van het paarse naar het
   oranje vak. Bliepo zegt "Schuif een pion uit het paarse vak naar het oranje vak.", zonder aanmoediging ervoor
   (schermfoto). Daarna 2 pionnen langzaam geschoven: pas toen nagekeken, "goed na een fout".
   De zin verklapt niets: het getal voor het paarse vak staat al in de opdracht.
2. **Vinkje 2 keer uitgelegd (was middel): opgelost.** Bij de eerste doos met 1 bal hoort het kind alleen
   "Klaar? Tik dan op het vinkje." (van het lesscherm). De eigen zin is weg. Gecontroleerd in de lijst met alles wat
   Bliepo zegt. KEUZES Ronde 21b punt 8 is verbeterd.
3. **"Hoeveel samen?": opgelost.** Na de 1e fout zegt Bliepo alleen de eerste zin en wacht op de pijl. Daarna komt de
   hint, met de knoppen in een andere volgorde (gezien: 4, 1, 5). Dit volgt het draaiboek §3 B.2.
4. **"Goed gekozen!": opgelost.** In 6 volledige runs niet meer gehoord; de code slaat die lofzin over.
5. **Zelfde zin 2 keer: opgelost.** Bij het handje zegt Bliepo nu kort "Tik op de pion in het oranje vak.", zonder
   "Je bent goed bezig.".
6. **"Kom, nog 1 keer.": opgelost.**
7. **Tempo: aangepast.** Bliepo reageert nu ± 0,4 s na de laatste pion. In de proef na een fout blijft dat 1,6 s; dat
   ligt als vraag bij Sara (KEUZES Ronde 21c punt 7).
8. **Stroeve zinnen: opgelost** ("1 en 4 is 1 manier om 5 te splitsen.", "Onderin zijn 2 vakken.").
9. **Begin van het handje: opgelost.** Het handje begint bij een pion die echt nog in het hoopje ligt
   (`window.__phaser.s1Punt`). Lukt dat niet, dan bij de vaste plek.
10. **Oude tekst in KEUZES en het draaiboek: bijgewerkt.**
11. **Vraag 1 na "anders splitsen": alleen gemeld,** zoals gevraagd. Geen bezwaar.
12. **Eindkaart: opgelost** (7 iets lager en kleiner).
13. **Vloeiend, gemeten:** de computer was niet helemaal rustig (belasting 7 tot 16, met andere programma's ernaast).
    - Laptop: 60 beelden/s, langste beeld 27 ms. In orde.
    - Trage telefoon: 58 beelden/s, maar een hapering van 69 ms (grens 50 ms). Telefoon is een latere fase (15.23) en
      staat al in DESIGN-LATER.md.
    - Openen in de ontwikkelversie 2,1–3,6 s. Dat is alleen een waarschuwing; op de echte site opnieuw meten.

## Opnieuw gedraaid

- Verklapcontrole: 121 foute antwoorden, geen verklapper. De FOUTTABEL bleef gelijk.
- `npm run opgaven`: groen.
- `inhoudsvergelijk`: 0 verdwenen, ook tegen b3cfebd. De 4 vervangen zinnen staan in WEGGEHAALD.md.
- De oude les, het splitsvlak, Lesscherm.tsx en stem.ts zijn niet veranderd.
- `scripts/test-splitsen-gouden.mjs`: alle 7 situaties groen.
- Speelcontrole: alles goed en alles fout, allebei tot het eind, 0 fouten.
- Zelf gespeeld met de nagebootste stem en de langzame sleep:
  - Nee-route tot de kaart.
  - Ja-route met mislukte proef, uitleg met fouten en vangnet, "hoeveel samen?" 2 keer fout, anders splitsen met hulp.
  - Dezelfde fout 2 keer bij vraag 1, 10 en 11, daarna alles tot de kaart.
  - De doos: bal erin, bal terug, het vinkje verdwijnt en een tik doet niets.
  - Alles klopte: elke eerste zin past bij de denkfout, "weer" komt alleen bij dezelfde denkfout, "nakijken" hooguit
    2 keer, de naam 2 keer, de getallen in kleur, de uitkomsten en denkfouten goed bewaard.

## Nieuwe fouten door het herstel

Geen gevonden. Ik heb gekeken naar:
- het handje bij samen voordoen en bij anders splitsen (begint nu bij een echte pion);
- de proef met minder dan het goede aantal (handje van oranje naar paars);
- het eerdere nakijken (0,4 s): bij de langzame sleep werd geen enkele halve beweging nagekeken.

## Nog open bij Sara (niet in deze les)

- De stem breekt nog elke zin af (`src/lib/stem.ts`). Met de nagebootste stem werden opnieuw alle zinnen afgebroken
  (46 van 46, 81 van 81). Dit geldt voor alle gouden lessen.
- De voorbeeldpagina bewaart bij het kind van het koekje, en de 15 testregels bij Fenna (id 93–107) staan er nog.
- KEUZES Ronde 21 vraag 1 t/m 9 en Ronde 21c punt 7 (1,6 s in de proef) zijn nog niet beantwoord. Daarbij hoort ook het
  voorrekenen bij de 3 huisjes (15.17).
- De eerste sleep hapert en de telefoon hapert (gedeeld splitsvlak, latere fase).
