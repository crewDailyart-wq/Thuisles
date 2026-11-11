# KEURING gouden lessen Plussommen, klokles en Minsommen (na de omzetting van commit fbce536 en fe61dde)

Onafhankelijke keurder, 11 november 2026, branch backup-squla. Gekeurd:
- **Plussommen** `squla-plus-bakkerij-1-gouden` (omgezet naar de nieuwste gouden stijl);
- **Klokles** `squla-klok-hoelaat-1-gouden` (omgezet naar de nieuwste gouden stijl);
- **Minsommen** `squla-min-machine-1-gouden`, alleen de wijziging van fbce536 (het vlak 90 % vanaf links; "wit blijft wit").

Geen betaald tegoed, geen ElevenLabs, niets online, oude lessen (regel 8) niet aangeraakt, geen helpers ingezet,
alleen als Testkind. `les_uitkomsten`: hoogste id vóór en na **147** (rijen 144–147 niet aangeraakt).

## UITSLAG

| Les | Oordeel |
|---|---|
| Plussommen | **GOEDGEKEURD** (1 klein taalpunt gemeld, niet veranderd) |
| Klokles | **AFGEKEURD op 1 regel: 15.17** (blauwe pijltjes die op het antwoord staan). Al de rest goed na 2 kleine herstellingen. De pijltjes wachten op Sara (KEUZES Ronde 30 punt 1 en Ronde 33 punt 1). |
| Minsommen (wijziging fbce536) | **GOEDGEKEURD** (1 klein taalpunt gemeld, niet veranderd) |

Telling: 0 ernstig, 2 middel (klok: 15.17 pijltjes, open voor Sara; klok: tekst 6 px te lang op 1024×768, hersteld),
3 klein (klok: "andersom"-zin, hersteld; Plussommen en Minsommen: dubbel getal in 1 zin, gemeld).
Gevonden: 5. Hersteld door mij: 2 (allebei in de klokles).

## Hoe ik gekeurd heb

- Gelezen: CLAUDE.md, BOUWREGELS.md (hoofdstuk 1–15, vooral 3.7, 15.11, 15.17, 15.27–15.30), LESRECEPT.md,
  FOUTEN-VOORBEELDEN.md (F1–F10), KEUZES-VOOR-SARA.md Ronde 18–31, KEURING-MEER-MINDER-GOUDEN.md en
  KEURING-KLOK-GOUDEN.md, de zinnenbestanden en de lescode van de 3 lessen, de git-diff van fbce536 en fe61dde.
- Fouttabel-scripts: zie hieronder.
- `npm run opgaven`: alles groen. `REV=3ec543b npm run inhoudsvergelijk` (de stand vóór de omzetting): **0 verdwenen**;
  wat weg is staat in WEGGEHAALD.md.
- Speelcontrole en testscripts: zie "Gespeeld".
- Let op: de computer was erg druk door andere helpers (belasting 20 tot 280). Zware tests heb ik na elkaar gedraaid,
  zodra er geen andere test liep.

## Fouttabel-scripts (elke zin waar voor elk antwoord)

- Plussommen: rekencontrole en verklapcontrole in orde, 16 vragen, **51 foute antwoorden**; waarheidscontrole **125
  beweringen**; 3 versies van de eerste zin zonder richting; geen opdracht bij de 2e fout.
- Klok: geen hint met "1 getal verder"; geen opdracht in de zin bij de 2e fout van een keuzevraag.
- Minsommen: rekencontrole en verklapcontrole in orde, 15 vragen, **30 foute antwoorden**.
- De FOUTTABEL-bestanden kwamen precies gelijk terug (alleen de klokzin hieronder is veranderd).

## Klokles: regel 15.17 (hints verklappen het antwoord niet) — AFGEKEURD

15.17 (Sara, 9 november) zegt: geen pijl die op het antwoord eindigt, en noemt de klokles met name. Nog in de les:

| Vraag | Wat gebeurt er | Waarom fout |
|---|---|---|
| Stap 7 "Welk getal staat bovenaan?" (goed: 12) | blauw pijltje boven de 12 komt vanzelf na 4 s, en bij de hint na de 1e fout ("Kijk bij het blauwe pijltje.") | het pijltje staat op het antwoord |
| Stap 8 "Welk getal staat onderaan?" (goed: 6) | blauw pijltje onder de 6, vanzelf na 1,5 s en bij de hint | idem |
| Stap 9 "Wat komt na de 6?" (goed: 7), fout 5 | hint "Volg de blauwe pijl." met pijl 6 → 7 | pijl eindigt op het antwoord |
| Stap 10 "Wat komt na de 12?" (goed: 1), fout 13 of 11 | hint "Volg de pijl." met pijl 12 → 1 | idem |
| Bonus "Hoe laat over 1 uur?" (goed: 1 uur), fout 11 uur | hint "Volg de blauwe pijl, met de klok mee." met pijl 12 → 1 | idem |
| Stap 11 "Wat telt de grote wijzer?", fout "de uren" | hint begon met "Maar op de klok is het andersom." | dat is het antwoord; **door mij hersteld** |

**Hersteld (alleen tekst, geen antwoord of keuze veranderd):** "Maar op de klok is het andersom. Kijk hoe snel de grote
wijzer straks draait." → "Kijk hoe snel de grote wijzer straks draait." (squla-klok-gouden-zinnen.ts; FOUTTABEL opnieuw
gemaakt). Deze zin noemt 15.17 met name.

**Niet hersteld:** de pijltjes. Hoe ze moeten veranderen is een keuze (de bouwer vroeg het al in Ronde 30 punt 1). Mijn
voorstel staat in KEUZES-VOOR-SARA.md Ronde 33. De pijltjes zijn wel goed bij het samen voordoen na de 2e fout (dan mag
het antwoord in beeld, 15.11).

## Taalpunten (gemeld, niet veranderd: niet echt fout)

Zinnen bij de 2e fout met 2 keer hetzelfde getal kort achter elkaar:
- Minsommen: "Je koos 3. 3 gaat eraf. De vraag is hoeveel er overblijft." en "Je koos 6. 6 gaat eraf. …" (FOUTTABEL regel
  87 en 90).
- Plussommen: "Je koos 9. Dat is het nog niet. 9 is te weinig." en "Je koos 7. 7 is te weinig." (FOUTTABEL regel 113 en
  122).
Ze kloppen en zijn goed Nederlands, maar klinken dubbel. Voorstel in KEUZES Ronde 33 (alleen de eerste zin weglaten).

## Gespeeld (zie de tabel per regel hieronder)

Alles als Testkind, Chrome zonder venster, leeg profiel, zonder koekje.

- **Speelcontrole `F7=1 npm run speel`**, per les apart (de eerste poging faalde bij alle 3 met "0 stappen": de
  computer had toen een belasting van 280 en de dev-server herstartte; opnieuw gedaan toen het rustig was):
  - Klok: GOED tot het eind (105 stappen), ALLEFOUT tot het eind (241 stappen); na mijn herstel nog eens GOED (95). F7 0, F8 0.
  - Minsommen: GOED tot het eind (51), ALLEFOUT tot het eind (155). F7 0, F8 0.
  - Plussommen: GOED en ALLEFOUT: 0 fouten, F7 0, F8 0, maar de automatische speler komt bij het **verbinden** niet
    verder ("kan niet automatisch"; bekend, KEUZES Ronde 30 punt 6). Het eigen testscript van de les komt wel tot het eind
    (hieronder), dus een kind zit daar niet vast.
- **Plussommen** `ONTWERP=1 ROUTE=allefout scripts/test-plussommen-gouden.mjs` op **1440×900, 1280×720, 1536×864 en
  1024×768**: alles in orde. Overlap 0, sprongen 0 (tekstvak, regel, pijl, Bliepo), tekst past, pijl gaat niet aan en
  uit, eindkaart links met 0 woorden eronder, 96 stukken met pijl allemaal vanzelf door, 0 stukken die op een tik wachten,
  0 opdrachten in de zin bij de 2e fout, F7 0, F8 0. Einde zin → volgend stuk ± 0,7 s; alleen na de stippen ± 1,0 s (5
  keer; bekend, Ronde 30 punt 4).
- **Klok** `ONTWERP=1 scripts/test-klok-gouden-pijl.mjs`, routes nee-fouten en ja-fout (1440×900, 1024×768) en
  nee-fouten en nee-goed (1024×768, 1280×720, 1536×864): **1 fout gevonden en hersteld** (zie hieronder); daarna alles in
  orde: overlap 0, sprongen 0, tekst past, eindkaart links met 0 woorden eronder, geen pijl bij vragen, 0 stukken die op
  een tik wachten, F7 0, F8 0, 0 keer weer gedimd. Startvraag: Ja = proef van 2 klokken, 2 fouten = de uitleg (route
  ja-fout); Nee = de uitleg. Tempo: gemiddeld 1,1–1,2 s na de zin (bekend, Ronde 30 punt 5: na lof draait de klok eerst).
- **Minsommen** `ONTWERP=1 ROUTE=goed,fouten scripts/test-minsommen-gouden.mjs` (1440×900): alles in orde. Het vlak
  blijft links van het tekstvak: de som en knoppen 207 px ruimte, de machine 79 px. Teller nooit in beeld tijdens een
  vraag (15.20). F7 0, F8 0, overlap 0, sprongen 0.
- **Schermfoto's bekeken** (Plussommen 78, klok 16): woorden, getalkleur (lekkers in eigen kleur, disco-som wit), de hint
  na een fout zonder pijl, het verbinden, de eindkaart. Geen onzichtbare of doorzichtige kaarten gezien.
- **Wit blijft wit / woorden per woord:** zie onder "Niet (helemaal) gedaan".
- **`les_uitkomsten`:** 147 vóór en na alle tests.

**Hersteld door mij (bouwfout, alleen de opdeling van de tekst):** klok, stap 9 "Wat komt na de 6?". Goed na een fout gaf
3 zinnen in 1 stuk ("Nu wordt mijn scherm groen." + "Van de 6 ga je deze kant op, naar de 7." + "Deze kant op heet: met de
klok mee."). Op 1024×768 liep dat **6 px uit het vaste tekstvak** (15.30). Nu komt de laatste zin als eigen stuk als het
geheel langer is dan 95 tekens (zoals al bij het samen voordoen). Daarna op 1024×768, 1280×720 en 1536×864: tekst past.

## Niet (helemaal) gedaan

- **Woorden per woord (3.7, F10):** niet zelf gemeten met de echte stem (`test-woord-oplichten.mjs` vraagt een zichtbare
  Chrome en een rustige computer; andere helpers draaiden tegelijk). De bouwer mat in Ronde 31: Plussommen 25 woorden, 15
  binnen ± 150 ms; klok 27 woorden, 17 binnen; Minsommen 16 woorden, 12 binnen; geen zin in 1 keer wit vóór de stem.
- **Vloeiend (10.1):** niet gemeten. De computer was niet rustig (belasting 20 tot 380 door andere helpers). Mijn herstel
  is alleen tekst en de opdeling van een zin; geen Phaser-werk.
- **Wit blijft wit (15.28):** wel gedaan, maar kort: `scripts/test-wit-blijft-wit.mjs` met DUUR=60 per les (de site
  expres 3,5 s traag). Plussommen 3, Minsommen 2, klok 2 keer een zin wit vóór Bliepo hem zei; **0 keer daarna weer
  grijs**. Let op: tegelijk liep een test van een andere helper; de uitkomst is dus niet onder rust gemeten.

## Per regel

| Regel | Plussommen | Klok | Minsommen |
|---|---|---|---|
| 15.22 inhoud Squla / 14.30 1 juist antwoord | goed (16 vragen, gelijk) | goed (13 klokken gelijk) | niet veranderd |
| 15.9 / 14.36 fouttabel | goed (51) | goed | goed (30) |
| 15.11 2 pogingen | goed | goed | goed |
| 15.17 hint verklapt niet | goed (script: richting alleen als er 2 keuzes overblijven) | **fout**, zie boven | goed |
| 15.18 nooit stoppen | goed (vangnet na 20 s bij samen tellen) | goed | goed |
| 15.19 hulphandje alleen bij opdrachten | goed | goed | goed |
| 15.27 pijl (vanzelf door, geen pijl bij vragen) | goed | goed | goed |
| 15.28 F7 / 15.29 F8 | goed (0 / 0) | goed (0 / 0) | goed (0 / 0) |
| 15.30 vaste zones | goed op 4 maten (vlak 88 %) | **6 px te lang op 1024×768, hersteld**; daarna goed | goed (vlak 90 %, 79–207 px ruimte) |
| 3.7 / F10 woorden per woord | niet zelf gemeten (zie boven) | idem | idem |
| 3.20 cijfers | goed (geen telwoorden in zinnen) | goed | goed |
| 2.1, 2.2, 14.27 kleur | goed (lekkers in eigen kleur, kale som en disco wit) | goed (uur oranje, 12 paars) | goed (kale som wit) |
| 4.2 startvraag | geen (draaiboek heeft er geen) | Ja = proef van 2, 2 fouten = uitleg, Nee = uitleg | geen |
| 7.8e oranje ring klok | n.v.t. | alleen bij hint/doel/2e fout | n.v.t. |
| 5.3 rood/groen, geen fout-geluid | goed | goed | goed |
| Onzichtbare kaarten na killTweensOf | niet gezien | niet gezien | niet gezien |
| Harde regel 2 (database) | 147 vóór en na | | |
