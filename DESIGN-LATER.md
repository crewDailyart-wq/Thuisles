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

## Bouwen met het oog op later
- Geen vaste pixelmaten (gebruik procenten of schaal).
- Geen onnodig zware animaties.
