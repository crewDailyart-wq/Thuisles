# Later: telefoon en tablet (besluit Sara, 9 november 2026)

Alles voor telefoon en tablet doet Sara later in één keer goed, in een eigen fase:
ontwerp, indeling, aanraken en snelheid. Nu niet oplossen.
Dit houdt online zetten niet tegen.

## Open punt: haperen op de trage telefoon
Gemeten bij de gouden klokles (squla-klok-hoelaat-1-gouden), computer rustig:
- Laptop: 60 beelden/s, langste beeld 21–22 ms, openen 0,4–0,7 s. In orde.
- Trage telefoon (nagebootst): 58–59 beelden/s, langste beeld 52–65 ms (grens 50 ms). Niet in orde.
- Openen op de trage telefoon in de ontwikkelversie: ± 3 s (lokaal alleen een waarschuwing; op de echte site moet het onder 1 s).
- De vorige versie van dezelfde les haperde ook al (62 ms). De oude les squla-klok-hoelaat-1 haalt 60 beelden/s en 21 ms.

Gemeten bij de gouden les Tellen (squla-tellen-fruit-1-gouden), 9 november 2026, `ALLEEN=squla-tellen-fruit-1-gouden npm run vloeiend`:
- Laptop: 60 beelden/s, langste beeld 36–42 ms.
- Trage telefoon: 57–59 beelden/s, hapering **54 tot 80 ms** (grens 50 ms). De oude les squla-tellen-fruit-1 haalt daar 35 ms.
- Openen in de ontwikkelversie: 1,3–2,3 s (laptop), 2,8–3,5 s (telefoon); op de echte site moet het onder 1 s.

Gemeten bij de gouden les Splitsen (squla-splits-splitsen1-1-gouden), 9 november 2026, `ALLEEN=squla-splits-splitsen1-1-gouden npm run vloeiend` (3 keer):
- Laptop: 56–60 beelden/s, langste beeld 34–42 ms. In orde.
- Trage telefoon: 48–60 beelden/s, hapering **42 tot 134 ms** (grens 50 ms; 1 van de 3 keer in orde). De oude les squla-splits-splitsen1-1 haalt daar 59 beelden/s en 63 ms.
- Echt slepen (eigen meting, `SCENARIO=sleepmeting node scripts/test-splitsen-gouden.mjs`): de **eerste** sleep in de les hapert (laptop 43–55 beelden/s, 50–100 ms); daarna 52–60 beelden/s en 17–50 ms. De oude les doet precies hetzelfde (eerste sleep 50–55 beelden/s, 50–67 ms): het zit in het gedeelde splitsvlak (squla-splitsen-s1.ts), niet in de gouden les.
- Openen in de ontwikkelversie: 1,5–2,5 s (laptop), 3,7–4,6 s (telefoon); op de echte site moet het onder 1 s.

Opnieuw gemeten na het herstel van de kind-test (gouden les Splitsen, 9 november 2026, 2 keer): laptop 58–60 beelden/s, langste beeld 28–41 ms (in orde); trage telefoon 58–59 beelden/s, hapering 56–59 ms (grens 50 ms). Echt slepen: eerste sleep laptop 46 beelden/s, 67 ms (gedeeld splitsvlak, ook in de oude les); daarna 60 beelden/s, 17 ms.

Na de keuring (gouden les Splitsen, 9 november 2026, 2 keer, niets ernaast): laptop 60 beelden/s, langste beeld 27–32 ms (in orde); trage telefoon 58–59 beelden/s, hapering 62–71 ms (grens 50 ms).

Na de omzetting naar de nieuwste gouden stijl (10–11 november 2026, computer niet helemaal rustig): Tellen laptop 60 beelden/s, 29 ms; trage telefoon 59 beelden/s, 44 ms (in orde). Splitsen laptop 60 beelden/s, 35 ms; trage telefoon 59–60 beelden/s, 45 en 57 ms (1 van 2 keer boven de grens). Het splitsvlak staat nu 88 % groot (vaste zone); bij telefoon later nakijken of de pionnen groot genoeg blijven om te pakken.

## Bouwen met het oog op later
- Geen vaste pixelmaten (gebruik procenten of schaal).
- Geen onnodig zware animaties.

## Overstap naar de stem van Ruth: wat dan controleren (10 november 2026)
De gouden klokles zet `stemHeelUitpraten` aan (lib/stem.ts, optie per les). Bij de overstap naar Ruth (geluidsbestanden) nakijken:
- Een zin telt als klaar aan het **einde van het geluidsbestand** (speelVanServer → eindigt), niet eerder; daarna ±0,7 s tot het volgende stuk.
- Lukt afspelen niet (bestand ontbreekt, geen tik gehad, geen verbinding): valt de zin netjes terug op de browserstem of de leestijd (900 ms + 55 ms per teken), en wacht de eerste zin op de eerste tik van het kind?
- Een tik op de pijl stopt ook een geluidsbestand meteen (stopPraten) en de les gaat door.
- Een voorgelezen keuze breekt Bliepo niet af, en Bliepo breekt een keuze wel af.
- De woorden lichten mee op met Ruth (de tekst wordt wit terwijl ze praat), ook bij {naam}.
- De groet met de naam van het kind (naamfragment) klinkt aan het begin, ook als de les via een rechtstreekse link wordt geopend (dan bij de eerste tik).
- Alle andere lessen (zonder de optie) gedragen zich nog precies zoals nu; zet de optie per les aan als die les is omgezet.
- Meet opnieuw met de F7-meter (tekst en gedimd/wit) en het stem-logboek (scripts/test-klok-gouden-pijl.mjs, ZICHTBAAR=1 ECHTESTEM=1).

## Woorden oplichten met Ruth (10 november 2026)
De gouden les Minsommen zet `woordenMeeMetStem` aan: elk woord licht op als Bliepo het zegt. Met de browserstem worden de woordtijden geschat (de Google-stem in Chrome geeft geen woordmeldingen) of gehaald uit de woordmeldingen van de browser. **Ruth levert straks echte woordtijden** (ElevenLabs geeft per woord een begin en eind): die gaan al via `meldVoorlezen(zin, grenzen, tijden)` in lib/voorlezen.ts. Bij de overstap nakijken: komen de tijden per woord mee met elk geluidsbestand (ook bij {naam}), en klopt het aantal woorden met de zin op het scherm (anders valt het terug op de schatting).

## Woorden oplichten: precies met Ruth (11 november 2026, F10)
Met de Google-stem in Chrome zijn de woordtijden een schatting (spreekmodel `GOOGLE_NL` in lib/voorlezen.ts): gemeten ongeveer 7 van de 10 woorden binnen ± 150 ms, gemiddeld ± 0,12 s naast, soms tot ± 0,5 s (vooral na een punt). Preciezer kan niet met deze stem: hij meldt geen woorden (geen onboundary) en Chrome op deze Mac heeft geen andere Nederlandse stem. **Ruth (ElevenLabs) levert echte woordtijden per woord**; die gaan al via `meldVoorlezen(zin, grenzen, tijden)`. Bij de overstap: de tijden per woord meesturen met elk bestand (ook bij {naam}) en opnieuw meten met `node scripts/test-woord-oplichten.mjs`.

## Woord-voor-woord oplichten gelijk met de stem (Sara, 17 november 2026)

Sara ziet dat het oplichten niet samengaat met de stem (gouden Tellen). Oorzaak: de huidige stem (Google) geeft geen woordtijden, dus de tijd per woord wordt geschat (ongeveer 70% van de woorden binnen 150 ms). Besluit Sara: dit doen we pas als de officiële stem (Ruth) erbij komt, omdat die de exacte woordtijden meegeeft. Dan voor alle gouden lessen tegelijk de geschatte tijden vervangen door de echte, en `scripts/test-woord-oplichten.mjs` opnieuw draaien (ook voor de 3 extra-lessen). Eerst toestemming vragen voor het tegoed (regel 9).

## Taal en spelling: de proef spelling groep 3 (Sara, 19 november 2026)
De proef voor taal en spelling (spelling groep 3) bewaren we voor later. Nu niet bouwen en niet aanpassen; pas oppakken als Sara het zegt.

## Afspeelknop bij het begin: nog meten op telefoon en tablet (19 november 2026, BOUWREGELS 15.38)
De ronde afspeelknop (geplakte link of verversen in een gouden les) is alleen gemeten op de laptop in Chrome (1440 x 900). Nog meten op een telefoon en een tablet (staand en liggend; Safari op iPad/iPhone en Chrome op Android): staat de knop in het midden, is hij groot genoeg (minstens 96 px), reageert de hele ronde, en begint Bliepo na de tik meteen met de groet. Let op Safari: die heeft eigen regels voor geluid zonder tik.

## PROPOSED / UNDECIDED: een beloning bij een goed antwoord (Sara, 19 november 2026)
Idee van Sara: bij een goed antwoord een beloning, zoals een sleutel of iets anders. **Nog niet besloten en nu NIET bouwen.** Wat er al is: alleen een lege geluidsplek "beloning" (`public/geluiden/beloning.wav`, lib/reactiegeluid.ts, BOUWREGELS 15.40); niets speelt hem af. Nog te beslissen: wat de beloning is (sleutel, ster, iets anders), wanneer (elk goed antwoord, een paar op rij, aan het eind), hoe hij eruitziet en klinkt, en of hij bewaard wordt (voortgang, harde regel 2).

## Later: "Optellen onder de 10" ook "veld" in plaats van "rooster" (besluit Sara, 19 november 2026)
In de gouden lessen werd het woord "rooster" "veld" (WIJZIGINGEN-ZINNEN-PLUSSOMMEN.md). De gewone les "Optellen onder de 10" (geen gouden les) krijgt dat ook, **maar pas als die les naar het gouden skelet wordt omgezet** (bestaande lessen pas later, na akkoord van Sara; BOUWREGELS 15.8, 15.14). Nu niets aan die les veranderen. Bron: ALLE-VRAGEN.md B8, KEUZES-PLUSSOMMEN.md vraag 6.

## Volgende klus: de vaste rijtjes nalopen (besluit Sara, 19 november 2026)
De gedeelde vaste rijtjes (lof, "nu is het goed", eindzinnen, groet; o.a. in `src/components/les/lessen/squla-klok-gouden-zinnen.ts`, die alle gouden lessen gebruiken, en het rijtje in BLIEPO-KARAKTER.md) nalopen: warmer maken, kale cijfers, het woord "nagekeken" eruit (BOUWREGELS 15.45). **Een aparte klus, nu NIET uitvoeren.** Werkwijze: oud naast nieuw in een eigen WIJZIGINGEN-ZINNEN-RIJTJES.md, zodat Sara het eerst ziet en per zin ja of nee zegt. Pas daarna in de code. Geen Ruth-opnames (pas aan het eind). Bron: ALLE-VRAGEN.md B9, KEUZES-VOOR-SARA.md Ronde 49 punt 3 en Ronde 50.
**Stand 19 november 2026 (later die dag):** nagelopen. Oud naast nieuw: RIJTJES-OUD-NAAST-NIEUW.md. Alleen 1 duidelijke fout verbeterd (de komma als er geen naam is, WIJZIGINGEN-ZINNEN-RIJTJES.md); "nagekeken" staat er niet meer in. De twijfelgevallen en de vraag of Bliepo's rijtjes warmer moeten: KEUZES-VOOR-SARA.md Ronde 51. Daar wacht deze klus nu op.

## Vloeiendheid en telefoontests: pas aan het einde (besluit Sara, 19 nov 2026)
Hapering 57 ms en 84 ms op de telefoon: later, blokkeert niets. Meten, prestatietests, Ruth en online zetten komen pas als de hele website klaar is (zie CLAUDE.md bovenaan).
