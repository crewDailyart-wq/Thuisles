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
